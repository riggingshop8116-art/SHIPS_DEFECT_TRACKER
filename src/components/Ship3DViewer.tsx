import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Compass, 
  Layers, 
  Eye, 
  ShieldCheck, 
  Wrench, 
  Building2, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  X, 
  Maximize2, 
  Sparkles,
  Info,
  Radio,
  Crosshair,
  ArrowRight,
  Ship,
  Search,
  ChevronDown,
  Check
} from 'lucide-react';
import { WARSHIP_COMPARTMENTS, ShipCompartment } from '../data/shipInspectionData';
import { Defect, Workshop, AuthSession } from '../types';

interface Ship3DViewerProps {
  defects: Defect[];
  ships: string[];
  workshops: Workshop[];
  authSession?: AuthSession | null;
  onNavigateToEntry?: (prefillLocation?: string, prefillWorkshop?: string) => void;
}

type ViewMode = 'isometric' | 'profile' | 'top' | 'xray';

export default function Ship3DViewer({
  defects,
  ships,
  workshops,
  authSession,
  onNavigateToEntry
}: Ship3DViewerProps) {
  // Selected warship for inspection
  const [selectedShip, setSelectedShip] = useState<string>(ships[0] || 'BNS Bangabandhu (এফ ২৫)');
  
  // 3D View Angle Mode
  const [viewMode, setViewMode] = useState<ViewMode>('isometric');
  
  // Selected workshop filter (default to logged-in workshop if exists, otherwise 'all')
  const defaultWsCode = authSession?.workshopCode && authSession.workshopCode !== 'HQ-ADMIN' && authSession.workshopCode !== 'HQ'
    ? authSession.workshopCode 
    : 'all';
  const [selectedWorkshopFilter, setSelectedWorkshopFilter] = useState<string>(defaultWsCode);

  // Custom Downward Dropdown State
  const [isWsDropdownOpen, setIsWsDropdownOpen] = useState(false);
  const [wsSearch, setWsSearch] = useState('');
  const wsDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wsDropdownRef.current && !wsDropdownRef.current.contains(e.target as Node)) {
        setIsWsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Active Selected Compartment for Detailed Box
  const [activeCompartment, setActiveCompartment] = useState<ShipCompartment | null>(null);

  // Hovered Compartment for Quick Tooltip
  const [hoveredCompartmentId, setHoveredCompartmentId] = useState<string | null>(null);

  // Is user logged in as a specific workshop?
  const myWorkshopCode = authSession?.workshopCode;
  const myWorkshopName = authSession?.workshopNameEn || authSession?.workshopNameBn;
  const isWorkshopUser = authSession?.role === 'workshop_user' && myWorkshopCode && myWorkshopCode !== 'HQ-ADMIN';

  // Find active defects for a compartment
  const getCompartmentDefects = (compartment: ShipCompartment) => {
    return defects.filter(d => {
      const matchShip = !selectedShip || d.shipName === selectedShip;
      const matchLoc = d.location.toLowerCase().includes(compartment.locationTag.toLowerCase()) ||
                       compartment.nameEn.toLowerCase().includes(d.location.toLowerCase()) ||
                       d.location.includes(compartment.code);
      return matchShip && matchLoc;
    });
  };

  // Filter compartments by selected workshop
  const highlightedCompartmentIds = useMemo(() => {
    if (selectedWorkshopFilter === 'all') {
      return new Set(WARSHIP_COMPARTMENTS.map(c => c.id));
    }
    const matchingIds = WARSHIP_COMPARTMENTS.filter(c => 
      c.workshopsAssigned.some(w => w.workshopCode === selectedWorkshopFilter)
    ).map(c => c.id);
    return new Set(matchingIds);
  }, [selectedWorkshopFilter]);

  // Selected Workshop Entity
  const selectedWorkshopObj = useMemo(() => {
    if (selectedWorkshopFilter === 'all') return null;
    return workshops.find(w => w.code === selectedWorkshopFilter) || null;
  }, [workshops, selectedWorkshopFilter]);

  // Filtered workshops list for search in custom dropdown
  const filteredWorkshopsList = useMemo(() => {
    if (!wsSearch.trim()) return workshops;
    const q = wsSearch.toLowerCase();
    return workshops.filter(ws => 
      ws.code.toLowerCase().includes(q) ||
      ws.nameEn.toLowerCase().includes(q) ||
      ws.nameBn.toLowerCase().includes(q) ||
      (ws.category && ws.category.toLowerCase().includes(q))
    );
  }, [workshops, wsSearch]);

  // Signaled compartments assigned to selected workshop
  const signaledCompartments = useMemo(() => {
    if (selectedWorkshopFilter === 'all') return WARSHIP_COMPARTMENTS;
    return WARSHIP_COMPARTMENTS.filter(c => 
      c.workshopsAssigned.some(w => w.workshopCode === selectedWorkshopFilter)
    );
  }, [selectedWorkshopFilter]);

  // Count active defects in ship
  const shipDefects = useMemo(() => {
    return defects.filter(d => !selectedShip || d.shipName === selectedShip);
  }, [defects, selectedShip]);

  const pendingShipDefectsCount = useMemo(() => {
    return shipDefects.filter(d => d.status === 'Pending').length;
  }, [shipDefects]);

  // Defects in the compartments signaled for this workshop
  const signaledDefectsCount = useMemo(() => {
    return signaledCompartments.reduce((acc, comp) => {
      const compDefs = getCompartmentDefects(comp);
      return acc + compDefs.filter(d => d.status === 'Pending').length;
    }, 0);
  }, [signaledCompartments, defects, selectedShip]);

  // Handle opening detailed dossier
  const handleOpenDetails = (compartment: ShipCompartment) => {
    setActiveCompartment(compartment);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* =========================================================================
          1. TOP COMMAND & 3D INSPECTION CONTROLS BAR
      ========================================================================= */}
      <div className="bg-[#001738]/85 backdrop-blur-xl p-5 rounded-3xl border border-cyan-400/30 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title & Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-400/40">
                <Ship className="h-5 w-5" />
              </span>
              <span className="text-xs font-algerian font-bold tracking-widest text-amber-300 uppercase">
                3D WARSHIP DIGITAL TWIN // TECHNICAL INSPECTION
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <h2 className="text-xl sm:text-2xl font-algerian font-bold text-white tracking-wide drop-shadow-sm truncate uppercase">
              WARSHIP 3D COMPARTMENT & WORKSHOP TECHNICAL DOSSIER
            </h2>
            <p className="text-xs text-cyan-200/80 font-mono mt-0.5">
              Click on ship compartments to view assigned workshop responsibilities, technical tasks, and active defect logs.
            </p>
          </div>

          {/* Quick Ship Selector & Filters */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Warship Selector */}
            <div className="flex items-center gap-2 bg-black/40 border border-white/15 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] text-amber-300 font-algerian font-bold uppercase">WARSHIP:</span>
              <select
                value={selectedShip}
                onChange={(e) => setSelectedShip(e.target.value)}
                className="bg-transparent text-xs font-algerian font-bold text-white outline-none cursor-pointer pr-2 uppercase"
              >
                {ships.map(s => (
                  <option key={s} value={s} className="bg-[#001738] text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode 3D Toggles */}
            <div className="flex items-center bg-black/50 border border-white/15 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('isometric')}
                className={`px-3 py-1 rounded-lg text-xs font-algerian font-bold uppercase transition-all cursor-pointer ${
                  viewMode === 'isometric'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-[#001733] shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="3D ISOMETRIC"
              >
                3D ISOMETRIC
              </button>
              <button
                type="button"
                onClick={() => setViewMode('profile')}
                className={`px-3 py-1 rounded-lg text-xs font-algerian font-bold uppercase transition-all cursor-pointer ${
                  viewMode === 'profile'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-[#001733] shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="SIDE PROFILE"
              >
                PROFILE
              </button>
              <button
                type="button"
                onClick={() => setViewMode('top')}
                className={`px-3 py-1 rounded-lg text-xs font-algerian font-bold uppercase transition-all cursor-pointer ${
                  viewMode === 'top'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-[#001733] shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="TOP DECK PLAN"
              >
                TOP DECK
              </button>
              <button
                type="button"
                onClick={() => setViewMode('xray')}
                className={`px-3 py-1 rounded-lg text-xs font-algerian font-bold uppercase transition-all cursor-pointer ${
                  viewMode === 'xray'
                    ? 'bg-cyan-500 text-[#001733] shadow-md'
                    : 'text-cyan-300 hover:text-cyan-100'
                }`}
                title="INTERNAL X-RAY"
              >
                X-RAY
              </button>
            </div>
          </div>
        </div>

        {/* Workshop Filter Strip */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="text-slate-300 font-algerian font-bold uppercase flex items-center gap-1.5 shrink-0 text-xs">
              <Building2 className="h-3.5 w-3.5 text-amber-400" />
              SELECT WORKSHOP:
            </span>

            {/* Downward-Opening Custom Dropdown */}
            <div className="relative" ref={wsDropdownRef}>
              <button
                type="button"
                onClick={() => setIsWsDropdownOpen(prev => !prev)}
                className="bg-[#00224d] border border-cyan-400/40 hover:border-amber-400/60 text-amber-300 font-algerian font-bold uppercase px-3.5 py-1.5 rounded-xl outline-none text-xs cursor-pointer flex items-center gap-2 min-w-[220px] max-w-[300px] justify-between transition-all shadow-md"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate">
                    {selectedWorkshopFilter === 'all' 
                      ? '🌐 ALL 27 WORKSHOPS' 
                      : selectedWorkshopObj 
                      ? `${selectedWorkshopObj.code}: ${selectedWorkshopObj.nameEn}` 
                      : selectedWorkshopFilter}
                  </span>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-amber-400 shrink-0 transition-transform ${isWsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Downward Menu */}
              {isWsDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 max-h-80 bg-[#001738] border-2 border-amber-400/60 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col backdrop-blur-xl animate-fade-in">
                  <div className="p-2 border-b border-white/10 bg-black/40">
                    <div className="relative">
                      <Search className="h-3.5 w-3.5 text-amber-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={wsSearch}
                        onChange={(e) => setWsSearch(e.target.value)}
                        placeholder="Search workshop code or name..."
                        className="w-full bg-[#000d1e] border border-cyan-400/30 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-amber-400 font-sans"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="overflow-y-auto max-h-60 p-1.5 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedWorkshopFilter('all');
                        setIsWsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                        selectedWorkshopFilter === 'all'
                          ? 'bg-amber-400 text-[#001733] font-bold shadow-md'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>🌐</span>
                        <span className="font-algerian font-bold">ALL 27 WORKSHOPS (সকল শপ)</span>
                      </div>
                      {selectedWorkshopFilter === 'all' && <Check className="h-3.5 w-3.5" />}
                    </button>

                    {filteredWorkshopsList.map((ws) => {
                      const isSelected = selectedWorkshopFilter === ws.code;
                      return (
                        <button
                          key={ws.code}
                          type="button"
                          onClick={() => {
                            setSelectedWorkshopFilter(ws.code);
                            setIsWsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-400 text-[#001733] font-bold shadow-md'
                              : 'text-slate-200 hover:bg-white/10'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5 font-bold font-mono text-[11px]">
                              <span className={isSelected ? 'text-[#001733]' : 'text-amber-300'}>{ws.code}</span>
                              <span className="truncate">{ws.nameEn}</span>
                            </div>
                            <div className={`text-[10px] truncate ${isSelected ? 'text-[#001733]/80' : 'text-slate-400'}`}>
                              {ws.nameBn} • {ws.category}
                            </div>
                          </div>
                          {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick My Workshop Button if logged in */}
            {isWorkshopUser && (
              <button
                type="button"
                onClick={() => setSelectedWorkshopFilter(myWorkshopCode)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                  selectedWorkshopFilter === myWorkshopCode
                    ? 'bg-amber-400 text-[#001733] shadow-lg shadow-amber-500/20'
                    : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-400/40'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>MY WORKSHOP: {myWorkshopName}</span>
              </button>
            )}

            {selectedWorkshopFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedWorkshopFilter('all')}
                className="text-[11px] text-cyan-300 hover:underline cursor-pointer ml-1 font-mono font-bold"
              >
                RESET (ALL)
              </button>
            )}
          </div>

          {/* Active Highlight Status */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-cyan-200 bg-cyan-950/70 px-2.5 py-1 rounded-lg border border-cyan-400/30">
              SIGNALED: <strong className="text-amber-300">{highlightedCompartmentIds.size}</strong> UNITS
            </span>
            <span className="text-[11px] font-mono text-rose-300 bg-rose-950/70 px-2.5 py-1 rounded-lg border border-rose-400/30">
              ACTIVE DEFECTS: <strong className="text-white">{pendingShipDefectsCount}</strong>
            </span>
          </div>
        </div>

        {/* Quick Workshop Selector Chips Row */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <span className="text-slate-400 font-mono text-[10px] shrink-0 uppercase">QUICK CHIPS:</span>
          {[
            { code: 'all', label: '🌐 ALL 27' },
            { code: 'WS-01', label: 'WS-01: RIGGING' },
            { code: 'WS-02', label: 'WS-02: MACHINE' },
            { code: 'WS-03', label: 'WS-03: HULL' },
            { code: 'WS-05', label: 'WS-05: ELECTRICAL' },
            { code: 'WS-07', label: 'WS-07: WEAPONS' },
            { code: 'WS-08', label: 'WS-08: DIESEL' },
            { code: 'WS-10', label: 'WS-10: HVAC' },
            { code: 'WS-19', label: 'WS-19: HYDRAULIC' },
          ].map((chip) => {
            const isSelected = selectedWorkshopFilter === chip.code;
            return (
              <button
                key={chip.code}
                type="button"
                onClick={() => setSelectedWorkshopFilter(chip.code)}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-[#001733] shadow-md ring-1 ring-white'
                    : 'bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white border border-white/10'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          ACTIVE WORKSHOP SIGNAL COMMAND & WORK HUD (তার কাজ অনুযায়ী জাহাজে সিগনাল)
      ========================================================================= */}
      {selectedWorkshopObj ? (
        <div className="bg-gradient-to-r from-[#001738] via-[#002456] to-[#001738] border-2 border-amber-400/60 rounded-3xl p-4 sm:p-5 text-white shadow-2xl relative overflow-hidden animate-fade-in">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left info: Workshop Name, Code & Live Signal Broadcast Status */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-[#001733] font-mono font-black text-xs shadow-md">
                  {selectedWorkshopObj.code}
                </span>
                <span className="text-sm sm:text-base font-algerian font-bold text-white tracking-wide uppercase">
                  {selectedWorkshopObj.nameEn} ({selectedWorkshopObj.nameBn})
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300">
                  {selectedWorkshopObj.category}
                </span>
              </div>

              {/* Live Signal Status & Active Work Notice */}
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="font-bold tracking-wider uppercase text-amber-300">
                  TACTICAL SIGNAL ACTIVE // {signaledCompartments.length} COMPARTMENTS ACTIVATED ON {selectedShip.toUpperCase()}
                </span>
              </div>

              {/* Scope of Work on this ship */}
              <p className="text-xs text-slate-200 font-sans max-w-3xl leading-relaxed">
                <strong className="text-amber-300 font-mono">কার্যপরিধি (MAINTENANCE SCOPE): </strong>
                {selectedWorkshopObj.description || `${selectedWorkshopObj.nameBn} এর নির্ধারিত টেকনিক্যাল ইন্সপেকশন, কম্পোনেন্ট ওভারহোল এবং জাহাজের সার্বক্ষণিক মেরামত কার্যক্রম।`}
              </p>

              {/* OIC and Direct Contact */}
              <div className="flex items-center gap-4 text-xs font-mono text-cyan-200/90 pt-1 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                  <span>OIC: <strong>{selectedWorkshopObj.oicRank} {selectedWorkshopObj.oicName}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-400" />
                  <span>INTERCOM EXT: <strong className="text-amber-300">{selectedWorkshopObj.phoneExt}</strong></span>
                </div>
              </div>
            </div>

            {/* Right side: Defect status badge & quick compartment jumpers */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2.5 shrink-0">
              {signaledDefectsCount > 0 ? (
                <div className="px-3.5 py-2 rounded-2xl bg-rose-950/90 border border-rose-500/80 text-rose-200 text-xs font-mono flex items-center gap-2 shadow-lg shadow-rose-900/30">
                  <AlertTriangle className="h-4 w-4 text-rose-400 animate-bounce" />
                  <span>
                    <strong className="text-white text-sm">{signaledDefectsCount}</strong> DEFECT SIGNAL FLASHING RED
                  </span>
                </div>
              ) : (
                <div className="px-3.5 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>ALL {signaledCompartments.length} SECTORS OPERATIONAL</span>
                </div>
              )}

              {/* Clickable quick jump buttons to the signaled compartments */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-slate-400 uppercase">JUMP TO:</span>
                {signaledCompartments.map(comp => (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => handleOpenDetails(comp)}
                    className="text-[10px] font-mono px-2 py-1 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-[#001733] text-amber-200 border border-amber-400/30 transition-all cursor-pointer font-bold"
                    title={`View ${comp.nameEn} (${comp.code})`}
                  >
                    {comp.code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* When "ALL 27 WORKSHOPS" is selected */
        <div className="bg-[#001738]/70 backdrop-blur-md border border-cyan-400/25 rounded-2xl p-3.5 text-xs text-cyan-200/90 flex flex-wrap items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span>
              BROADCASTING GLOBAL FLEET SIGNALS FOR <strong>ALL 27 WORKSHOPS</strong> // উপরে যে ওয়ার্কশপ সিলেক্ট করবেন তার কাজ অনুযায়ী জাহাজে সিগনাল শো করবে।
            </span>
          </div>
          <span className="text-amber-300 font-bold">12 COMPARTMENT STATIONS ACTIVE</span>
        </div>
      )}

      {/* =========================================================================
          2. THE 3D WARSHIP INTERACTIVE CANVAS & DIGITAL TWIN STAGE
      ========================================================================= */}
      <div className="relative bg-[#001229]/90 backdrop-blur-2xl rounded-3xl border border-cyan-400/35 p-4 sm:p-6 shadow-[0_25px_60px_-15px_rgba(0,10,35,0.9)] overflow-hidden">
        
        {/* Tactical Ambient Radar Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, #0ea5e9 1px, transparent 1px), linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        ></div>

        {/* Tactical Coordinate Accents */}
        <div className="absolute top-3 left-4 text-[10px] font-mono text-cyan-400/80 flex items-center gap-2 select-none pointer-events-none z-10">
          <Crosshair className="h-3 w-3 text-cyan-400" />
          <span>BNS DIGITAL TWIN // 110M GUIDED MISSILE FRIGATE</span>
        </div>
        <div className="absolute top-3 right-4 text-[10px] font-mono text-amber-300/80 select-none pointer-events-none z-10">
          <span>VIEW: {viewMode.toUpperCase()} // SCALE 1:350</span>
        </div>

        {/* Realistic Naval Warship Schematic & 3D Interactive Hotspot Container */}
        <div className="relative w-full aspect-[16/9] min-h-[380px] max-h-[560px] flex items-center justify-center select-none overflow-hidden my-2">
          
          {/* Floating Subtle Warship Motion Animation Container */}
          <div className="relative w-full h-full flex items-center justify-center animate-float-ship">
            
            {/* SVG WARSHIP ILLUSTRATION - HIGH RESOLUTION TECHNICAL 3D PERSPECTIVE */}
            <svg 
              viewBox="0 0 1000 500" 
              className={`w-full h-full transition-all duration-700 ${
                viewMode === 'xray' ? 'filter drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]' : 'filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]'
              }`}
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Metallic Naval Steel Gradients */}
                <linearGradient id="hullDarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="45%" stopColor="#1e293b" />
                  <stop offset="75%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#090d16" />
                </linearGradient>

                <linearGradient id="hullSuperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#64748b" />
                  <stop offset="50%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>

                <linearGradient id="waterlineBootGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#dc2626" />
                  <stop offset="50%" stopColor="#991b1b" />
                  <stop offset="100%" stopColor="#7f1d1d" />
                </linearGradient>

                <linearGradient id="xrayHullGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#082f49" stopOpacity="0.8" />
                </linearGradient>

                <radialGradient id="sonarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Water Surface Line & Ocean Wake Reflection */}
              <path d="M 40 370 Q 250 365, 500 370 T 960 370 L 980 430 L 20 430 Z" fill="#021833" opacity="0.6" />
              <line x1="30" y1="370" x2="970" y2="370" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4" />

              {/* Bow Sonar Ping Pulse Animation */}
              <circle cx="910" cy="385" r="16" className="animate-sonar-ping fill-cyan-400/20 stroke-cyan-400 stroke-[1.5]" />
              <circle cx="910" cy="385" r="30" className="animate-sonar-ping fill-cyan-400/10 stroke-cyan-400 stroke-[1]" style={{ animationDelay: '0.8s' }} />

              {/* ======================= WARSHIP HULL STRUCTURE ======================= */}
              {/* Underwater Bulbous Bow & Keel (Waterline Boot-topping) */}
              <path 
                d="M 120 370 L 110 395 Q 115 410, 140 410 L 870 410 Q 930 410, 940 385 Q 945 375, 930 370 Z" 
                fill={viewMode === 'xray' ? 'url(#xrayHullGrad)' : 'url(#waterlineBootGrad)'}
                stroke={viewMode === 'xray' ? '#38bdf8' : '#b91c1c'}
                strokeWidth="2"
              />

              {/* Main Warship Hull (Sheerline to Waterline) */}
              <path 
                d="M 80 270 
                   L 140 270 
                   L 140 300
                   L 260 300 
                   L 260 270 
                   L 460 270 
                   L 600 270 
                   L 730 275 
                   L 935 270 
                   Q 955 285, 940 370 
                   L 110 370 
                   L 80 300 Z" 
                fill={viewMode === 'xray' ? 'url(#xrayHullGrad)' : 'url(#hullDarkGrad)'}
                stroke={viewMode === 'xray' ? '#38bdf8' : '#475569'}
                strokeWidth="2.5"
              />

              {/* Portholes / Hull Scuttles & Depth Markers */}
              <g fill="#38bdf8" opacity="0.6">
                <circle cx="200" cy="330" r="3" />
                <circle cx="230" cy="330" r="3" />
                <circle cx="260" cy="330" r="3" />
                <circle cx="420" cy="330" r="3" />
                <circle cx="450" cy="330" r="3" />
                <circle cx="680" cy="330" r="3" />
                <circle cx="710" cy="330" r="3" />
                <circle cx="740" cy="330" r="3" />
              </g>

              {/* Flight Deck / Helipad (Aft) */}
              <path d="M 80 270 L 260 270 L 260 295 L 80 295 Z" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
              {/* Helipad "H" Marking */}
              <circle cx="170" cy="282" r="14" stroke="#facc15" strokeWidth="2" strokeDasharray="4 2" fill="none" />
              <text x="170" y="287" textAnchor="middle" fill="#facc15" fontSize="12" fontWeight="bold" fontFamily="monospace">H</text>

              {/* Superstructure Deckhouse 01 */}
              <path 
                d="M 280 270 
                   L 280 215 
                   L 540 215 
                   L 590 240 
                   L 730 240 
                   L 730 275 
                   L 280 270 Z" 
                fill={viewMode === 'xray' ? 'rgba(14, 116, 144, 0.4)' : 'url(#hullSuperGrad)'}
                stroke={viewMode === 'xray' ? '#06b6d4' : '#64748b'}
                strokeWidth="2"
              />

              {/* Bridge & Wheelhouse (Forward Superstructure 02 Deck) */}
              <path 
                d="M 610 240 
                   L 610 185 
                   L 715 185 
                   L 725 240 Z" 
                fill={viewMode === 'xray' ? 'rgba(56, 189, 248, 0.5)' : '#475569'}
                stroke="#94a3b8"
                strokeWidth="2"
              />
              {/* Bridge Windows */}
              <polygon points="630,192 705,192 708,206 630,206" fill="#38bdf8" opacity="0.85" />
              <line x1="655" y1="192" x2="655" y2="206" stroke="#0f172a" strokeWidth="2" />
              <line x1="680" y1="192" x2="680" y2="206" stroke="#0f172a" strokeWidth="2" />

              {/* Main Mast (Surveillance Radar Mast) */}
              <line x1="575" y1="215" x2="575" y2="90" stroke="#cbd5e1" strokeWidth="4.5" />
              <line x1="560" y1="140" x2="590" y2="140" stroke="#cbd5e1" strokeWidth="3" />
              <line x1="550" y1="170" x2="600" y2="170" stroke="#cbd5e1" strokeWidth="3" />
              {/* Mast Rigging Stay Cables */}
              <line x1="575" y1="95" x2="520" y2="215" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
              <line x1="575" y1="95" x2="630" y2="215" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />

              {/* Rotating 3D Surveillance Radar Antenna Banner on Main Mast */}
              <g transform="translate(575, 80)">
                <ellipse cx="0" cy="0" rx="26" ry="6" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" className="animate-radar-sweep" />
                <rect x="-3" y="-8" width="6" height="12" fill="#0284c7" />
                <line x1="-22" y1="0" x2="22" y2="0" stroke="#0f172a" strokeWidth="2" />
              </g>

              {/* Secondary Mast & Comms Dome */}
              <line x1="430" y1="215" x2="430" y2="120" stroke="#cbd5e1" strokeWidth="3.5" />
              <circle cx="430" cy="115" r="9" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="420" y1="145" x2="440" y2="145" stroke="#cbd5e1" strokeWidth="2.5" />

              {/* Funnel & Exhaust Stack with Thermal Vents */}
              <polygon points="360,215 385,160 415,160 410,215" fill="#334155" stroke="#64748b" strokeWidth="2" />
              <rect x="382" y="156" width="35" height="5" fill="#0f172a" />
              <line x1="388" y1="172" x2="408" y2="172" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="386" y1="184" x2="410" y2="184" stroke="#f59e0b" strokeWidth="1.5" />

              {/* Midship Anti-Ship Missile Launch Canisters (C-802 Launchers) */}
              <g transform="translate(470, 235) rotate(-18)">
                <rect x="0" y="0" width="40" height="9" rx="2" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
                <rect x="0" y="11" width="40" height="9" rx="2" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
                <circle cx="40" cy="4.5" r="3" fill="#ef4444" />
                <circle cx="40" cy="15.5" r="3" fill="#ef4444" />
              </g>

              {/* Forecastle 76mm Main Naval Gun Turret */}
              <g transform="translate(805, 260)">
                {/* Turret Shield Dome */}
                <path d="M -16 0 C -16 -16, 16 -16, 18 0 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
                {/* Gun Barrel */}
                <line x1="12" y1="-8" x2="46" y2="-16" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
                {/* Muzzle Brake */}
                <rect x="42" y="-19" width="6" height="6" fill="#334155" transform="rotate(-15 42 -19)" />
              </g>

              {/* Bow Anchor Windlass & Hawse Pipe Opening */}
              <circle cx="915" cy="290" r="5" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
              {/* Anchor Fluke Stowed in Hawse */}
              <path d="M 913 293 L 908 308 L 918 308 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />

              {/* Stern Twin Propeller Shafts & Screws */}
              <g transform="translate(100, 395)">
                {/* Shaft Strut */}
                <line x1="30" y1="-10" x2="0" y2="5" stroke="#94a3b8" strokeWidth="4" />
                {/* 4-Blade Bronze Propeller */}
                <circle cx="-3" cy="6" r="4" fill="#f59e0b" />
                <ellipse cx="-3" cy="6" rx="14" ry="4" fill="#d97706" transform="rotate(30 -3 6)" />
                <ellipse cx="-3" cy="6" rx="14" ry="4" fill="#d97706" transform="rotate(120 -3 6)" />
                {/* Twin Rudder Blade */}
                <rect x="-24" y="-5" width="8" height="26" rx="2" fill="#64748b" stroke="#334155" strokeWidth="1" />
              </g>

              {/* Hull Pennant Number "F 25" (or active ship designation) */}
              <text x="840" y="325" fill="#f8fafc" fontSize="22" fontWeight="900" fontFamily="sans-serif" letterSpacing="2" opacity="0.9">
                157
              </text>

              {/* X-Ray Cutaway Compartment Overlays (visible in xray view) */}
              {viewMode === 'xray' && (
                <g stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" fill="none">
                  {/* Engine Room Cutaway */}
                  <rect x="360" y="300" width="130" height="65" fill="#0284c7" opacity="0.25" />
                  <text x="425" y="338" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace">ENGINE ROOM</text>
                  
                  {/* DG Room */}
                  <rect x="270" y="300" width="85" height="65" fill="#0284c7" opacity="0.25" />
                  <text x="312" y="338" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace">DG SETS</text>

                  {/* CIC */}
                  <rect x="540" y="270" width="90" height="40" fill="#38bdf8" opacity="0.3" />
                  <text x="585" y="295" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="monospace">CIC / C4I</text>

                  {/* Steering Gear Room */}
                  <rect x="110" y="300" width="60" height="65" fill="#0284c7" opacity="0.25" />
                  <text x="140" y="338" textAnchor="middle" fill="#38bdf8" fontSize="9" fontFamily="monospace">STEERING</text>
                </g>
              )}
            </svg>

            {/* =========================================================================
                INTERACTIVE COMPARTMENT HOTSPOT BEACONS (ক্লিকযোগ্য অংশসমূহ)
            ========================================================================= */}
            {WARSHIP_COMPARTMENTS.map((compartment) => {
              // Calculate coordinates based on view mode
              let posX = compartment.posX;
              let posY = compartment.posY;
              if (viewMode === 'isometric') {
                posX = compartment.isoX;
                posY = compartment.isoY;
              } else if (viewMode === 'top') {
                posX = compartment.topX;
                posY = compartment.topY;
              }

              const compDefects = getCompartmentDefects(compartment);
              const hasDefects = compDefects.some(d => d.status === 'Pending');
              const isMyShopAssigned = myWorkshopCode ? compartment.workshopsAssigned.some(w => w.workshopCode === myWorkshopCode) : false;
              const isHovered = hoveredCompartmentId === compartment.id;

              // Find assigned task for the currently selected workshop
              const assignedTask = selectedWorkshopFilter === 'all'
                ? compartment.workshopsAssigned[0]
                : compartment.workshopsAssigned.find(w => w.workshopCode === selectedWorkshopFilter);
              
              const isSignaled = selectedWorkshopFilter === 'all' || Boolean(assignedTask);

              return (
                <div
                  key={compartment.id}
                  style={{
                    left: `${posX}%`,
                    top: `${posY}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isHovered ? 50 : isSignaled && selectedWorkshopFilter !== 'all' ? 35 : 20
                  }}
                  className={`absolute transition-all duration-300 ${
                    isSignaled 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-20 scale-75 blur-[0.6px] pointer-events-none sm:pointer-events-auto'
                  }`}
                  onMouseEnter={() => setHoveredCompartmentId(compartment.id)}
                  onMouseLeave={() => setHoveredCompartmentId(null)}
                >
                  {/* Clickable Beacon Button & Tactical Work Signal */}
                  <div className="relative group flex flex-col items-center">
                    
                    {/* Concentric Pulsing Radar Signal Waves */}
                    {isSignaled && (
                      <>
                        <span className={`absolute -inset-3 rounded-full animate-ping opacity-75 pointer-events-none ${
                          hasDefects 
                            ? 'bg-rose-500' 
                            : selectedWorkshopFilter !== 'all'
                            ? 'bg-amber-400'
                            : isMyShopAssigned 
                            ? 'bg-amber-400' 
                            : 'bg-cyan-400'
                        }`}></span>
                        <span className={`absolute -inset-1 rounded-full animate-pulse border-2 pointer-events-none ${
                          hasDefects 
                            ? 'border-rose-400' 
                            : selectedWorkshopFilter !== 'all'
                            ? 'border-amber-300'
                            : 'border-cyan-300'
                        }`}></span>
                      </>
                    )}

                    {/* Outer Glowing Badge Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(compartment)}
                      className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-mono font-black text-xs shadow-2xl transition-all transform group-hover:scale-125 border-2 cursor-pointer focus:outline-none ${
                        hasDefects
                          ? 'bg-rose-600 text-white border-white shadow-[0_0_25px_rgba(244,63,94,0.9)] animate-bounce'
                          : selectedWorkshopFilter !== 'all' && Boolean(assignedTask)
                          ? 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-[#001733] border-white shadow-[0_0_25px_rgba(251,191,36,0.95)] ring-4 ring-amber-400/50'
                          : isMyShopAssigned
                          ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-[#001733] border-amber-200 shadow-amber-500/60'
                          : 'bg-gradient-to-br from-cyan-500 to-blue-700 text-white border-cyan-200 shadow-cyan-500/50'
                      }`}
                      aria-label={compartment.nameEn}
                    >
                      <div className="flex items-center gap-0.5">
                        {isSignaled && selectedWorkshopFilter !== 'all' && (
                          <Radio className="h-3 w-3 animate-pulse text-[#001733]" />
                        )}
                        <span>{compartment.code.replace('SEC-', '')}</span>
                      </div>
                    </button>

                    {/* "MY SHOP" Badge if user's own workshop */}
                    {isMyShopAssigned && (
                      <span className="absolute -top-3.5 px-1.5 py-0.2 bg-amber-400 text-[#001733] rounded-full text-[8px] font-bold font-mono shadow-md uppercase pointer-events-none">
                        MY SHOP
                      </span>
                    )}

                    {/* TACTICAL WORK SIGNAL CALLOUT (তার কাজ অনুযায়ী জাহাজে সিগনাল শো করবে) */}
                    {selectedWorkshopFilter !== 'all' && assignedTask ? (
                      <div
                        onClick={() => handleOpenDetails(compartment)}
                        className={`mt-1.5 px-2.5 py-1.5 rounded-xl text-left shadow-2xl border backdrop-blur-xl transition-all cursor-pointer group-hover:scale-110 min-w-[150px] max-w-[210px] ${
                          hasDefects
                            ? 'bg-rose-950/95 text-rose-100 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.6)]'
                            : 'bg-[#001738]/95 text-white border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.45)] ring-1 ring-amber-400/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5 border-b border-white/15 pb-0.5">
                          <div className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${hasDefects ? 'bg-rose-400 animate-ping' : 'bg-emerald-400 animate-ping'}`}></span>
                            <span className="text-[9px] font-mono font-black text-amber-300 uppercase tracking-tight">
                              {selectedWorkshopFilter} SIGNAL
                            </span>
                          </div>
                          <span className="text-[8px] font-mono text-cyan-300 bg-cyan-950/80 px-1 rounded">
                            {compartment.code}
                          </span>
                        </div>
                        <div className="text-[10px] font-bold leading-snug text-white line-clamp-2">
                          {assignedTask.tasks[0]}
                        </div>
                        {hasDefects && (
                          <div className="mt-1 text-[8px] font-mono font-bold text-rose-300 flex items-center gap-1 bg-rose-900/50 px-1 py-0.5 rounded">
                            <AlertTriangle className="h-2.5 w-2.5 text-rose-400 animate-bounce" />
                            <span>DEFECT ALERT IN SECTOR</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Standard Section Name Pill */
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(compartment)}
                        className={`mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-tight whitespace-nowrap shadow-md border backdrop-blur-md transition-all cursor-pointer ${
                          hasDefects
                            ? 'bg-rose-950/85 text-rose-200 border-rose-500/50'
                            : isMyShopAssigned
                            ? 'bg-amber-950/85 text-amber-300 border-amber-400/50 ring-1 ring-amber-400/30'
                            : 'bg-[#001738]/85 text-cyan-200 border-cyan-500/40'
                        }`}
                      >
                        {compartment.nameEn.split(' ')[0]} {compartment.nameEn.split(' ')[1] || ''}
                      </button>
                    )}
                  </div>

                  {/* QUICK HOVER PREVIEW TOOLTIP */}
                  {isHovered && (
                    <div className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 w-72 bg-[#001738]/95 backdrop-blur-2xl p-3.5 rounded-2xl border border-cyan-400/50 shadow-2xl text-white pointer-events-none z-50 animate-fade-in text-left">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-amber-400 text-[#001733] text-[9px] font-mono font-black">
                            {compartment.code}
                          </span>
                          <span className="text-[10px] font-mono text-cyan-300 uppercase truncate">
                            {compartment.deckLevel}
                          </span>
                        </div>
                        {hasDefects ? (
                          <span className="text-[9px] text-rose-400 font-bold bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/40">
                            DEFECT RECORDED
                          </span>
                        ) : (
                          <span className="text-[9px] text-emerald-300 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                            OPERATIONAL
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-black text-white">{compartment.nameEn}</h4>
                      <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">{compartment.overview}</p>

                      <div className="mt-2.5 pt-2 border-t border-white/10">
                        <span className="text-[9px] text-amber-300 font-mono font-bold uppercase block mb-1">
                          ASSIGNED WORKSHOPS ({compartment.workshopsAssigned.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {compartment.workshopsAssigned.map(w => (
                            <span 
                              key={w.workshopCode} 
                              className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                w.workshopCode === myWorkshopCode
                                  ? 'bg-amber-400 text-[#001733]'
                                  : 'bg-white/10 text-slate-200'
                              }`}
                            >
                              {w.workshopCode}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-2 text-[9px] text-cyan-300 font-mono text-center bg-cyan-950/60 py-1 rounded-lg border border-cyan-500/30">
                        CLICK TO VIEW DOSSIER ➔
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Legend & Interactive Guide */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-slate-400 font-algerian font-bold uppercase">LEGEND:</span>
            <div className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="font-algerian text-[11px] uppercase">STANDARD COMPARTMENT</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="font-algerian text-[11px] uppercase">MY WORKSHOP ASSIGNED</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="font-algerian text-[11px] uppercase">DEFECT RECORDED</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            💡 Click any compartment beacon to view the complete technical dossier and active defect records.
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. DETAILED COMPARTMENT INFORMATION BOX / MODAL (হোম পেজের ডায়ালগ বক্সের উপরের অংশে নোঙর এর ছবি থাকবে)
      ========================================================================= */}
      {activeCompartment && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setActiveCompartment(null)}
        >
          <div 
            className="bg-[#00142e]/95 backdrop-blur-2xl border-2 border-cyan-400/50 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 text-white shadow-[0_25px_60px_-15px_rgba(0,10,35,0.98)] relative space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400"></div>

            {/* Top Anchor & Crest Header Section (হোম পেজের ডায়ালগ বক্সের উপরের অংশে নোঙর এর ছবি) */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#001024] via-[#001c3d] to-[#001024] p-3 sm:p-4 rounded-2xl border border-amber-400/50 shadow-inner">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 border-2 border-amber-300 shadow-xl shadow-amber-500/25 flex items-center justify-center shrink-0">
                  <img 
                    src="/anchor.jpg" 
                    alt="Bangladesh Navy Crest Anchor" 
                    className="w-full h-full object-contain rounded-xl bg-black" 
                  />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base md:text-lg font-algerian font-bold text-amber-300 tracking-wider uppercase">
                    BANGLADESH NAVY DOCKYARD CHATTOGRAM
                  </h4>
                  <p className="text-[11px] text-cyan-200 font-algerian font-bold tracking-wide uppercase">
                    WARSHIP TECHNICAL INSPECTION & COMPARTMENT WORKSHOP DOSSIER
                  </p>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-[9px] text-emerald-300 font-mono font-bold uppercase">
                    SECURITY LEVEL: NAVAL COMMAND ARCHIVE
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveCompartment(null)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-600/80 text-white transition-all cursor-pointer shrink-0 border border-white/15"
                title="CLOSE"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Header of the Compartment */}
            <div className="flex items-start justify-between gap-4 border-b border-white/15 pb-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-3.5 bg-gradient-to-br from-amber-400 to-amber-600 text-[#001733] rounded-2xl font-mono font-black text-lg shadow-lg shadow-amber-500/20 shrink-0">
                  {activeCompartment.code}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/30 uppercase">
                      {activeCompartment.deckLevel}
                    </span>
                    <span className="text-[10px] text-cyan-200 font-mono">
                      {selectedShip}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-algerian font-bold text-white tracking-wide mt-1 truncate uppercase">
                    {activeCompartment.nameEn}
                  </h3>
                </div>
              </div>
            </div>

            {/* Overview & Technical Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-white/5 p-4 rounded-2xl border border-white/10">
                <h4 className="text-xs font-algerian font-bold text-amber-300 uppercase mb-1.5 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  COMPARTMENT OVERVIEW & FUNCTION
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {activeCompartment.overview}
                </p>
              </div>

              <div className="bg-cyan-950/40 p-4 rounded-2xl border border-cyan-500/30 space-y-2">
                <h4 className="text-xs font-algerian font-bold text-cyan-300 uppercase mb-1">
                  TECHNICAL SPECIFICATIONS
                </h4>
                {activeCompartment.specifications.map((spec, idx) => (
                  <div key={idx} className="text-xs border-b border-white/10 pb-1 last:border-0 last:pb-0">
                    <span className="text-slate-400 block text-[10px] font-algerian uppercase">{spec.label}</span>
                    <span className="text-white font-bold font-mono">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* =========================================================================
                RESPONSIBLE WORKSHOPS & DETAILED TASKS
            ========================================================================= */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-algerian font-bold text-amber-300 tracking-wider uppercase flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-amber-400" />
                  <span>RESPONSIBLE WORKSHOPS & TECHNICAL TASKS ({activeCompartment.workshopsAssigned.length} WORKSHOPS)</span>
                </h4>
                <span className="text-[10px] text-cyan-200 font-algerian font-bold uppercase">
                  NAVAL MAINTENANCE PROTOCOL
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...activeCompartment.workshopsAssigned].sort((a, b) => {
                  if (a.workshopCode === selectedWorkshopFilter) return -1;
                  if (b.workshopCode === selectedWorkshopFilter) return 1;
                  if (a.workshopCode === myWorkshopCode) return -1;
                  if (b.workshopCode === myWorkshopCode) return 1;
                  return 0;
                }).map((wsItem) => {
                  const isUserShop = wsItem.workshopCode === myWorkshopCode;
                  const isSignaledShop = wsItem.workshopCode === selectedWorkshopFilter;
                  return (
                    <div 
                      key={wsItem.workshopCode} 
                      className={`p-4 rounded-2xl border transition-all ${
                        isSignaledShop
                          ? 'bg-amber-500/25 border-amber-400 shadow-xl ring-2 ring-amber-400/70'
                          : isUserShop 
                          ? 'bg-amber-500/15 border-amber-400/60 shadow-lg ring-1 ring-amber-400/40' 
                          : 'bg-[#001a3d]/80 border-cyan-500/30 hover:border-cyan-400/60'
                      }`}
                    >
                      {/* Workshop Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-mono font-black ${
                            isSignaledShop || isUserShop ? 'bg-amber-400 text-[#001733]' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                          }`}>
                            {wsItem.workshopCode}
                          </span>
                          <div>
                            <h5 className="text-xs sm:text-sm font-algerian font-bold text-white leading-tight uppercase">
                              {wsItem.workshopNameEn || wsItem.workshopNameBn}
                            </h5>
                            <span className="text-[10px] text-amber-300 font-mono">
                              SECTION: {wsItem.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSignaledShop && (
                            <span className="px-2 py-0.5 bg-amber-400 text-[#001733] font-algerian font-bold text-[9px] rounded-full uppercase flex items-center gap-1 shadow-md">
                              <Radio className="h-2.5 w-2.5 animate-pulse" />
                              SIGNALED SHOP
                            </span>
                          )}
                          {isUserShop && !isSignaledShop && (
                            <span className="px-2 py-0.5 bg-amber-400 text-[#001733] font-algerian font-bold text-[9px] rounded-full uppercase">
                              MY WORKSHOP
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Workshop OIC & Intercom */}
                      <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono mb-3 bg-black/30 px-2.5 py-1 rounded-lg">
                        <span className="truncate">OIC: {wsItem.oicRankAndName}</span>
                        <span className="text-amber-300 font-bold shrink-0 flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5" /> Ext: {wsItem.phoneExt}
                        </span>
                      </div>

                      {/* Specific Tasks List */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-amber-300 font-algerian font-bold uppercase tracking-wide block">
                          SPECIFIC WORK SCOPE:
                        </span>
                        <ul className="space-y-1.5">
                          {wsItem.tasks.map((task, tIdx) => (
                            <li key={tIdx} className="text-xs text-slate-200 flex items-start gap-2">
                              <span className="text-cyan-400 mt-0.5 shrink-0">❖</span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* =========================================================================
                ACTIVE DEFECTS FOR THIS SECTION IN THE SYSTEM DATABASE
            ========================================================================= */}
            <div className="bg-black/30 p-4 sm:p-5 rounded-2xl border border-white/15 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-algerian font-bold text-white uppercase flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                  <span>ACTIVE COMPARTMENT DEFECT LOG ({getCompartmentDefects(activeCompartment).length})</span>
                </h4>
                <span className="text-[10px] text-amber-300 font-algerian font-bold uppercase">
                  WARSHIP: {selectedShip}
                </span>
              </div>

              {getCompartmentDefects(activeCompartment).length === 0 ? (
                <div className="flex items-center gap-3 bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl text-emerald-300 text-xs font-algerian font-bold uppercase tracking-wider">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>ALL SYSTEMS FULLY OPERATIONAL IN THIS COMPARTMENT // NO ACTIVE DEFECTS</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {getCompartmentDefects(activeCompartment).map(def => (
                    <div 
                      key={def.id} 
                      className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 font-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-algerian font-bold uppercase ${
                            def.status === 'Solved' ? 'bg-emerald-500/30 text-emerald-300' : 'bg-rose-500/30 text-rose-300'
                          }`}>
                            {def.status === 'Solved' ? 'SOLVED' : 'PENDING'}
                          </span>
                          <span className="text-slate-400 text-[10px]">{def.defectDate}</span>
                          <span className="text-amber-300 text-[10px] font-algerian font-bold uppercase">WORKSHOP: {def.workshop || 'ASSIGNED'}</span>
                        </div>
                        <p className="text-slate-200 mt-1.5 font-medium">
                          {def.defectDescription || 'Defect record logged in registry.'}
                        </p>
                      </div>

                      {def.defectImage && (
                        <img 
                          src={def.defectImage} 
                          alt="Defect" 
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover border border-white/20 shrink-0" 
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons in Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/15">
              <div className="text-xs text-slate-300 font-algerian uppercase">
                COMPARTMENT CODE: <strong className="text-amber-300">{activeCompartment.code}</strong> // {activeCompartment.locationTag}
              </div>

              <div className="flex items-center gap-3">
                {onNavigateToEntry && (
                  <button
                    type="button"
                    onClick={() => {
                      const firstWs = activeCompartment.workshopsAssigned[0]?.workshopCode || myWorkshopCode;
                      onNavigateToEntry(activeCompartment.locationTag, firstWs);
                      setActiveCompartment(null);
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#001733] font-algerian font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95 uppercase tracking-wider"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    <span>LOG DEFECT IN THIS SECTION</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveCompartment(null)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-algerian font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider border border-white/15"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
