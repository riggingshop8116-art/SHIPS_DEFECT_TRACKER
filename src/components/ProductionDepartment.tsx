import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Building2, 
  Search, 
  Wrench, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  User, 
  X, 
  ChevronRight, 
  Ship,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Anchor
} from 'lucide-react';
import { Workshop, Defect, DockyardConfig, ProductionUnitItem, DGMGroup } from '../types';
import { DGM_CONFIG, DEFAULT_PRODUCTION_UNITS } from '../data/productionUnits';

interface ProductionDepartmentProps {
  workshops: Workshop[];
  defects: Defect[];
  dockyardConfig?: DockyardConfig;
  isAdmin?: boolean;
  productionUnits?: ProductionUnitItem[];
  onUpdateProductionUnits?: (units: ProductionUnitItem[]) => void;
  onNavigateToEntry?: (location?: string, workshopCode?: string) => void;
  onNavigateToSearch?: (workshopCode?: string) => void;
}

export default function ProductionDepartment({
  workshops,
  defects,
  dockyardConfig,
  isAdmin = false,
  productionUnits,
  onUpdateProductionUnits,
  onNavigateToEntry,
  onNavigateToSearch
}: ProductionDepartmentProps) {
  // Active DGM Filter: 'all' or specific group id
  const [selectedDgm, setSelectedDgm] = useState<string>('all');
  // Live text search
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Selected unit for detailed modal popup
  const [selectedUnit, setSelectedUnit] = useState<ProductionUnitItem | null>(null);

  // Admin Add / Edit State
  const [isEditingUnit, setIsEditingUnit] = useState<boolean>(false);
  const [editingUnitData, setEditingUnitData] = useState<ProductionUnitItem | null>(null);
  const [unitFormResponsibilitiesText, setUnitFormResponsibilitiesText] = useState<string>('');
  const [unitFormEquipmentsText, setUnitFormEquipmentsText] = useState<string>('');

  // Active units (from parent state or fallback to default 25 units)
  const currentUnits: ProductionUnitItem[] = useMemo(() => {
    return productionUnits && productionUnits.length > 0 ? productionUnits : DEFAULT_PRODUCTION_UNITS;
  }, [productionUnits]);

  // Dynamically map DGM groups with current units
  const dgmGroups: DGMGroup[] = useMemo(() => {
    return DGM_CONFIG.map(cfg => {
      let icon = <Ship className="h-5 w-5 text-slate-700" />;
      const unitsInGroup = currentUnits.filter(u => u.category === cfg.category);

      return {
        id: cfg.id,
        code: cfg.code,
        dgmTitleEn: cfg.dgmTitleEn,
        dgmTitleBn: cfg.dgmTitleBn,
        category: cfg.category,
        accentColor: 'border-slate-300',
        badgeBg: 'bg-slate-100',
        badgeBorder: 'border-slate-200',
        textColor: 'text-slate-800',
        icon,
        units: unitsInGroup
      };
    });
  }, [currentUnits]);

  // Calculate live statistics for defect status per unit
  const getDefectStatsForUnit = (wsCode?: string, title?: string) => {
    if (!wsCode && !title) return { total: 0, completed: 0, pending: 0 };
    const code = wsCode?.toLowerCase();
    const t = title?.toLowerCase();

    const matched = defects.filter(d => {
      if (code && d.workshopCode && d.workshopCode.toLowerCase() === code) return true;
      if (code && d.workshop && d.workshop.toLowerCase().includes(code)) return true;
      if (t && d.workshop && d.workshop.toLowerCase().includes(t)) return true;
      return false;
    });

    const completed = matched.filter(d => d.status === 'Solved').length;
    return {
      total: matched.length,
      completed,
      pending: matched.length - completed
    };
  };

  // Filter groups and units based on user selection
  const filteredGroups = useMemo(() => {
    return dgmGroups
      .filter(grp => selectedDgm === 'all' || grp.id === selectedDgm)
      .map(grp => {
        if (!searchQuery.trim()) return grp;
        const q = searchQuery.toLowerCase();
        const filteredUnits = grp.units.filter(u => 
          u.titleEn.toLowerCase().includes(q) ||
          u.titleBn.toLowerCase().includes(q) ||
          (u.workshopCode && u.workshopCode.toLowerCase().includes(q)) ||
          u.officerDesignation.toLowerCase().includes(q) ||
          u.scopeBn.toLowerCase().includes(q)
        );
        return {
          ...grp,
          units: filteredUnits
        };
      })
      .filter(grp => grp.units.length > 0 || !searchQuery.trim());
  }, [dgmGroups, selectedDgm, searchQuery]);

  const totalUnitsCount = useMemo(() => {
    return currentUnits.length;
  }, [currentUnits]);

  // Admin Actions
  const handleOpenAdd = () => {
    const newUnit: ProductionUnitItem = {
      id: `unit_${Date.now()}`,
      titleEn: '',
      titleBn: '',
      roleTitle: '',
      workshopCode: '',
      category: 'hull',
      officerDesignation: 'Lieutenant, BN',
      scopeBn: '',
      responsibilities: [],
      keyEquipments: [],
      locationInYard: 'BN Dockyard Premises',
      phoneExt: 'Dockyard Ext: 8100'
    };
    setEditingUnitData(newUnit);
    setUnitFormResponsibilitiesText('');
    setUnitFormEquipmentsText('');
    setIsEditingUnit(true);
  };

  const handleOpenEdit = (unit: ProductionUnitItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingUnitData({ ...unit });
    setUnitFormResponsibilitiesText((unit.responsibilities || []).join('\n'));
    setUnitFormEquipmentsText((unit.keyEquipments || []).join(', '));
    setIsEditingUnit(true);
  };

  const handleDeleteUnit = (unitId: string, titleEn: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm(`Are you sure you want to remove "${titleEn}" from the Production Department?`)) {
      const updated = currentUnits.filter(u => u.id !== unitId);
      onUpdateProductionUnits?.(updated);
      if (selectedUnit?.id === unitId) {
        setSelectedUnit(null);
      }
    }
  };

  const handleSaveUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnitData) return;

    if (!editingUnitData.titleEn.trim()) {
      alert('Shop title in English is required.');
      return;
    }

    const responsibilities = unitFormResponsibilitiesText
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    const keyEquipments = unitFormEquipmentsText
      .split(',')
      .map(eq => eq.trim())
      .filter(Boolean);

    const finalUnit: ProductionUnitItem = {
      ...editingUnitData,
      titleEn: editingUnitData.titleEn.trim(),
      titleBn: editingUnitData.titleBn?.trim() || editingUnitData.titleEn.trim(),
      roleTitle: editingUnitData.roleTitle.trim() || `Officer-in-Charge (${editingUnitData.titleEn})`,
      workshopCode: editingUnitData.workshopCode?.trim(),
      officerDesignation: editingUnitData.officerDesignation.trim(),
      scopeBn: editingUnitData.scopeBn.trim(),
      locationInYard: editingUnitData.locationInYard?.trim(),
      phoneExt: editingUnitData.phoneExt?.trim(),
      responsibilities,
      keyEquipments
    };

    const exists = currentUnits.some(u => u.id === finalUnit.id);
    let updatedList: ProductionUnitItem[];
    if (exists) {
      updatedList = currentUnits.map(u => u.id === finalUnit.id ? finalUnit : u);
    } else {
      updatedList = [...currentUnits, finalUnit];
    }

    onUpdateProductionUnits?.(updatedList);
    setIsEditingUnit(false);
    setEditingUnitData(null);
  };

  const handleResetUnits = () => {
    if (confirm('Are you sure you want to restore the Production Department hierarchy to the default 25 naval shops & cells?')) {
      onUpdateProductionUnits?.(DEFAULT_PRODUCTION_UNITS);
    }
  };

  return (
    <div id="production-department-container" className="space-y-6 text-slate-800 pb-8">
      
      {/* 1. Header Banner - Bangladesh Naval Green (#006A4E) & Cream (#FFFDD0) Design */}
      <div className="bg-gradient-to-r from-[#006A4E] via-[#355E3B] to-[#006A4E] text-[#FFFDD0] border-2 border-[#FFFDD0]/60 rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        {/* Decorative naval anchor watermark */}
        <div className="absolute right-3 -bottom-6 opacity-10 pointer-events-none text-[#FFFDD0]">
          <Anchor className="h-44 w-44" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-5 relative z-10">
          
          {/* Bangladesh Navy Anchor Crest in Cream Frame */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1 bg-[#FFFDD0] border-2 border-[#FFFDD0] shadow-sm flex items-center justify-center shrink-0">
            <img 
              src="/anchor.jpg" 
              alt="Navy Anchor Crest" 
              className="w-full h-full object-contain rounded-xl bg-black" 
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-md text-[11px] font-bold bg-[#FFFDD0] text-[#006A4E] font-mono tracking-wider shadow-xs">
                ⚓ BN DOCKYARD PRODUCTION WING
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#004d38]/80 text-[#FFFDD0] border border-[#FFFDD0]/40 font-mono shadow-xs">
                ৫টি ডিজিএম বিভাগ • {totalUnitsCount}টি ওয়ার্কশপ ও ইউনিট (5 DGM DIVISIONS)
              </span>
              {isAdmin && (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase bg-[#FFFDD0] text-[#006A4E] border border-[#FFFDD0] shadow-xs font-mono">
                  🛡️ ADMINISTRATOR MODE
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-algerian text-[#FFFDD0] tracking-wider">
              প্রোডাকশন ডিপার্টমেন্ট পদক্রম • PRODUCTION DEPARTMENT HIERARCHY
            </h1>
            
            <p className="text-xs sm:text-sm text-[#FFFDD0]/90 mt-1 max-w-4xl leading-relaxed font-medium">
              জেনারেল ম্যানেজার (প্রোডাকশন)-এর অধীনে ডেপুটি জেনারেল ম্যানেজারগণ বিভাগসমূহ পরিচালনা করেন এবং ওয়ার্কশপের ওআইসিগণ দায়িত্ব পালন করেন।
            </p>
          </div>

        </div>

        {/* Admin Action Controls Bar */}
        {isAdmin && (
          <div className="mt-4 pt-3 border-t border-[#FFFDD0]/30 flex flex-wrap items-center justify-between gap-3 bg-[#FFFDD0] text-[#006A4E] p-3 rounded-xl border border-[#FFFDD0] shadow-xs relative z-10">
            <div className="text-xs text-[#006A4E]">
              <span className="font-bold">Admin Controls:</span> নতুন শপ এড বা ডিলিট করুন। আপডেট সাথে সাথে সকল ইউজার শপের প্রোডাকশন ডিপার্টমেন্টে সিঙ্ক হয়ে যাবে।
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetUnits}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#006A4E] border border-[#006A4E]/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Reset to official workshops"
              >
                <RotateCcw className="h-3.5 w-3.5 text-[#006A4E]" />
                <span>Reset All Shops</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-3.5 py-1.5 bg-[#006A4E] hover:bg-[#005740] text-[#FFFDD0] font-bold rounded-lg text-xs font-algerian tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-[#FFFDD0]/40 active:scale-95"
              >
                <Plus className="h-3.5 w-3.5 text-[#FFFDD0]" />
                <span>Add Shop / Unit</span>
              </button>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="mt-5 pt-4 border-t border-[#FFFDD0]/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 relative z-10">
          
          {/* DGM Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedDgm('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedDgm === 'all'
                  ? 'bg-[#FFFDD0] text-[#006A4E] font-black shadow-md border-2 border-[#FFFDD0]'
                  : 'bg-[#004e39]/80 hover:bg-[#004e39] text-[#FFFDD0] border border-[#FFFDD0]/30'
              }`}
            >
              ALL DGMS ({totalUnitsCount})
            </button>

            {dgmGroups.map(grp => (
              <button
                key={grp.id}
                type="button"
                onClick={() => setSelectedDgm(grp.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedDgm === grp.id
                    ? 'bg-[#FFFDD0] text-[#006A4E] font-black shadow-md border-2 border-[#FFFDD0]'
                    : 'bg-[#004e39]/80 hover:bg-[#004e39] text-[#FFFDD0] border border-[#FFFDD0]/30'
                }`}
              >
                {grp.code} ({grp.units.length})
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shop, code, officer..."
              className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

        </div>

      </div>

      {/* 2. Organizational Tree View Container */}
      <div className="bg-white/95 border-2 border-[#006A4E]/30 hover:border-[#006A4E]/70 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 transition-all">
        
        {/* GM (PRODUCTION) Top Node */}
        <div className="flex flex-col items-center">
          <div className="bg-[#006A4E] border-2 border-[#FFFDD0]/60 text-[#FFFDD0] px-6 py-2.5 rounded-xl shadow-md text-center">
            <span className="text-[10px] tracking-wider uppercase block text-[#FFFDD0]/80 font-semibold font-mono">
              HEAD OF PRODUCTION WING
            </span>
            <span className="text-sm sm:text-base font-bold tracking-wide block font-algerian">
              GENERAL MANAGER (PRODUCTION)
            </span>
            <span className="text-xs text-[#FFFDD0]/90 block">
              COMMODORE, BANGLADESH NAVY
            </span>
          </div>

          {/* Stem Line */}
          <div className="w-0.5 h-5 bg-[#006A4E]/50"></div>
          <div className="w-full max-w-5xl h-0.5 bg-[#006A4E]/30 hidden md:block"></div>
        </div>

        {/* 5 DGM Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 pt-1">
          {filteredGroups.map((group) => (
            <div key={group.id} className="flex flex-col space-y-2.5">
              
              {/* DGM Node Header - Bangladesh Naval Green */}
              <div className="rounded-xl p-3 border-2 border-[#FFFDD0]/40 bg-gradient-to-r from-[#006A4E] to-[#004e39] text-[#FFFDD0] text-center shadow-md">
                <div className="text-xs font-bold text-[#FFFDD0] leading-tight font-algerian tracking-wider">
                  {group.dgmTitleEn}
                </div>
                <div className="text-[10px] text-[#FFFDD0]/90 mt-1 font-mono font-bold">
                  {group.code} • {group.units.length} UNITS
                </div>
              </div>

              {/* Units & Workshops under this DGM */}
              <div className="space-y-2 pl-2 border-l-2 border-[#006A4E]/40">
                {group.units.map((unit) => {
                  const stats = getDefectStatsForUnit(unit.workshopCode, unit.titleEn);

                  return (
                    <div
                      key={unit.id}
                      onClick={() => setSelectedUnit(unit)}
                      className="bg-white/95 hover:bg-[#FFFDD0]/40 border-2 border-[#006A4E]/25 hover:border-[#006A4E] p-3 rounded-xl text-left transition-all cursor-pointer shadow-xs hover:shadow-md group"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#006A4E] text-[#FFFDD0] border border-[#FFFDD0]/30 font-mono">
                          {unit.workshopCode || 'CELL'}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          {isAdmin && stats.total > 0 && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              stats.pending > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {stats.pending > 0 ? `${stats.pending} Def` : 'OK'}
                            </span>
                          )}

                          {isAdmin && (
                            <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                title="Edit Shop"
                                onClick={(e) => handleOpenEdit(unit, e)}
                                className="p-1 hover:bg-slate-100 text-slate-600 rounded cursor-pointer transition-colors"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                title="Delete Shop"
                                onClick={(e) => handleDeleteUnit(unit.id, unit.titleEn, e)}
                                className="p-1 hover:bg-rose-50 text-rose-600 rounded cursor-pointer transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}

                          <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-500 transition-colors shrink-0" />
                        </div>
                      </div>

                      <div className="text-xs font-bold text-[#001738] group-hover:text-amber-600 mt-1.5 leading-snug">
                        {unit.titleEn}
                      </div>

                      <div className="text-[10px] text-slate-500 truncate mt-1">
                        {unit.officerDesignation}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* 3. Detailed Unit Inspection Modal Dialog */}
      {selectedUnit && (
        <div 
          id="unit-detail-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedUnit(null)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 text-slate-800 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-slate-900 rounded-xl text-white font-bold shadow-xs shrink-0">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {selectedUnit.workshopCode || 'OFFICER CELL'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      PRODUCTION DEPARTMENT
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    {selectedUnit.titleEn}
                  </h3>
                  <h4 className="text-xs text-slate-600 font-medium">
                    {selectedUnit.roleTitle}
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUnit(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Officer in Charge Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Designated Officer / Rank</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-slate-600 shrink-0" />
                  {selectedUnit.officerDesignation}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Location & Contact</span>
                <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                  {selectedUnit.phoneExt || 'Dockyard Exchange'}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {selectedUnit.locationInYard}
                </span>
              </div>
            </div>

            {/* Primary Functional Scope */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 uppercase">Primary Scope of Work:</span>
              <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 border border-slate-200 p-3.5 rounded-xl leading-relaxed">
                {selectedUnit.scopeBn}
              </p>
            </div>

            {/* Responsibilities */}
            {selectedUnit.responsibilities && selectedUnit.responsibilities.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase">Technical Responsibilities:</span>
                <ul className="space-y-1.5">
                  {selectedUnit.responsibilities.map((resp, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Machineries / Equipments */}
            {selectedUnit.keyEquipments && selectedUnit.keyEquipments.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase">Key Machinery & Equipment:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUnit.keyEquipments.map((eq, i) => (
                    <span key={i} className="text-xs bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                <span>Reporting Chain: </span>
                <span className="text-slate-800 font-semibold">General Manager (Production) ➔ Deputy General Manager</span>
              </div>

              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(selectedUnit)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit Unit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteUnit(selectedUnit.id, selectedUnit.titleEn)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                  {selectedUnit.workshopCode && onNavigateToSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateToSearch(selectedUnit.workshopCode);
                        setSelectedUnit(null);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Filter Defects
                    </button>
                  )}
                  {onNavigateToEntry && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateToEntry(undefined, selectedUnit.workshopCode);
                        setSelectedUnit(null);
                      }}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Log Defect</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedUnit(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 4. Admin Add / Edit Shop Modal Dialog */}
      {isEditingUnit && editingUnitData && typeof document !== 'undefined' && createPortal(
        <div 
          id="admin-unit-edit-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
        >
          <div 
            id="admin-unit-edit-card"
            className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-slate-800 flex flex-col max-h-[92vh]"
          >
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-5 w-5 text-slate-700" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {currentUnits.some(u => u.id === editingUnitData.id) ? 'EDIT PRODUCTION SHOP / UNIT' : 'ADD NEW PRODUCTION SHOP / UNIT'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure division, officer, technical scope, and machinery
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditingUnit(false);
                  setEditingUnitData(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUnitSubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    DGM DIVISION / CATEGORY *
                  </label>
                  <select
                    value={editingUnitData.category}
                    onChange={(e) => setEditingUnitData({
                      ...editingUnitData, 
                      category: e.target.value as 'hull' | 'mechanical' | 'weapon_electrical' | 'ordnance' | 'ship_repair'
                    })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 outline-none focus:border-slate-500"
                  >
                    <option value="hull">DGM (H&M) - Hull and Miscellaneous</option>
                    <option value="mechanical">DGM (MECH) - Mechanical</option>
                    <option value="weapon_electrical">DGM (W&E) - Weapon & Electrical</option>
                    <option value="ordnance">DGM (ORD) - Ordnance</option>
                    <option value="ship_repair">DGM (SR) - Ship Repair</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    WORKSHOP CODE (e.g. WS-01, WS-15)
                  </label>
                  <input
                    type="text"
                    value={editingUnitData.workshopCode || ''}
                    onChange={(e) => setEditingUnitData({ ...editingUnitData, workshopCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. WS-01"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 outline-none focus:border-slate-500 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    SHOP NAME (ENGLISH) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUnitData.titleEn}
                    onChange={(e) => setEditingUnitData({ ...editingUnitData, titleEn: e.target.value })}
                    placeholder="e.g. Plater & Welding Shop"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    OFFICER DESIGNATION & RANK *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUnitData.officerDesignation}
                    onChange={(e) => setEditingUnitData({ ...editingUnitData, officerDesignation: e.target.value })}
                    placeholder="e.g. Lieutenant, BN (E)"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  PRIMARY TECHNICAL SCOPE & CAPABILITIES *
                </label>
                <textarea
                  required
                  rows={2}
                  value={editingUnitData.scopeBn}
                  onChange={(e) => setEditingUnitData({ ...editingUnitData, scopeBn: e.target.value })}
                  placeholder="Describe the primary naval repair/engineering responsibilities..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  SPECIFIC RESPONSIBILITIES (One per line)
                </label>
                <textarea
                  rows={3}
                  value={unitFormResponsibilitiesText}
                  onChange={(e) => setUnitFormResponsibilitiesText(e.target.value)}
                  placeholder="Task 1&#10;Task 2&#10;Task 3"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  KEY WORKSHOP MACHINERY (Comma separated)
                </label>
                <input
                  type="text"
                  value={unitFormEquipmentsText}
                  onChange={(e) => setUnitFormEquipmentsText(e.target.value)}
                  placeholder="e.g. CNC Lathe, 50-Ton Press, TIG Welder"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 outline-none focus:border-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    YARD LOCATION
                  </label>
                  <input
                    type="text"
                    value={editingUnitData.locationInYard || ''}
                    onChange={(e) => setEditingUnitData({ ...editingUnitData, locationInYard: e.target.value })}
                    placeholder="e.g. North Yard Shed Block-1"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    PHONE EXTENSION
                  </label>
                  <input
                    type="text"
                    value={editingUnitData.phoneExt || ''}
                    onChange={(e) => setEditingUnitData({ ...editingUnitData, phoneExt: e.target.value })}
                    placeholder="e.g. Dockyard Ext: 8111"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingUnit(false);
                    setEditingUnitData(null);
                  }}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  Save Shop / Unit
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
