import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Check,
  Gauge
} from 'lucide-react';
import { WARSHIP_COMPARTMENTS, ShipCompartment } from '../data/shipInspectionData';
import { Defect, Workshop, AuthSession } from '../types';
import WorkshopProgressAnalytics from './WorkshopProgressAnalytics';
import { 
  isSameShip, 
  matchLocationToCompartment, 
  isDefectForWorkshop, 
  getShipPennantNumber 
} from '../utils/shipWorkMatcher';

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
  const [selectedShip, setSelectedShip] = useState<string>(ships[0] || 'BNS Bangabandhu (F 25)');
  
  // 3D View Angle Mode
  const [viewMode, setViewMode] = useState<ViewMode>('isometric');
  
  // Selected workshop filter (default to logged-in workshop if exists, otherwise 'all')
  const defaultWsCode = authSession?.workshopCode && authSession.workshopCode !== 'HQ-ADMIN' && authSession.workshopCode !== 'HQ'
    ? authSession.workshopCode 
    : 'all';
  const [selectedWorkshopFilter, setSelectedWorkshopFilter] = useState<string>(defaultWsCode);

  // Synchronize when authSession changes (e.g. on login/logout)
  useEffect(() => {
    if (authSession?.workshopCode && authSession.workshopCode !== 'HQ-ADMIN' && authSession.workshopCode !== 'HQ') {
      setSelectedWorkshopFilter(authSession.workshopCode);
    }
  }, [authSession?.workshopCode]);

  // Active Selected Compartment for Detailed Box
  const [activeCompartment, setActiveCompartment] = useState<ShipCompartment | null>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Automatically scroll modal body to top as soon as a compartment opens so it is immediately centered in view
  useEffect(() => {
    if (activeCompartment) {
      modalBodyRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeCompartment]);

  // Handle ESC key to dismiss modal smoothly
  useEffect(() => {
    if (!activeCompartment) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveCompartment(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCompartment]);

  // Hovered Compartment for Quick Tooltip
  const [hoveredCompartmentId, setHoveredCompartmentId] = useState<string | null>(null);

  // Is user logged in as a specific workshop?
  const myWorkshopCode = authSession?.workshopCode;
  const myWorkshopName = authSession?.workshopNameEn || authSession?.workshopNameBn;
  const isWorkshopUser = authSession?.role === 'workshop_user' && myWorkshopCode && myWorkshopCode !== 'HQ-ADMIN';

  // Find active defects for a compartment on the currently selected ship
  const getCompartmentDefects = (compartment: ShipCompartment) => {
    return defects.filter(d => {
      const matchShip = !selectedShip || isSameShip(d.shipName, selectedShip);
      const matchLoc = matchLocationToCompartment(d.location, compartment);
      return matchShip && matchLoc;
    });
  };

  // Selected Workshop Entity from live workshops state
  const selectedWorkshopObj = useMemo(() => {
    if (selectedWorkshopFilter === 'all') return null;
    return workshops.find(w => 
      w.code.toUpperCase() === selectedWorkshopFilter.toUpperCase() ||
      w.id.toLowerCase() === selectedWorkshopFilter.toLowerCase()
    ) || null;
  }, [workshops, selectedWorkshopFilter]);

  // Dynamic enrichment of ship compartments matching renamed workshops & logged defects
  const dynamicCompartments: ShipCompartment[] = useMemo(() => {
    const wsByCode = new Map<string, Workshop>();
    workshops.forEach(w => {
      wsByCode.set(w.code.toUpperCase(), w);
      wsByCode.set(w.id.toLowerCase(), w);
      if (w.nameEn) wsByCode.set(w.nameEn.toLowerCase(), w);
    });

    return WARSHIP_COMPARTMENTS.map(comp => {
      const compDefects = defects.filter(d => {
        const matchShip = !selectedShip || isSameShip(d.shipName, selectedShip);
        const matchLoc = matchLocationToCompartment(d.location, comp);
        return matchShip && matchLoc;
      });

      // Synchronize assigned tasks with live renamed workshop entities
      const updatedAssigned = comp.workshopsAssigned.map(assigned => {
        const live = wsByCode.get(assigned.workshopCode.toUpperCase()) || 
                     workshops.find(w => w.code.toUpperCase() === assigned.workshopCode.toUpperCase());
        if (!live) return assigned;

        const displayName = live.nameEn 
          ? (live.nameBn ? `${live.nameEn} (${live.nameBn})` : live.nameEn)
          : (live.nameBn || assigned.workshopNameBn);

        let tasks = [...assigned.tasks];
        if (live.description && live.description.trim()) {
          tasks = [live.description.trim(), ...tasks.slice(0, 3)];
        }

        return {
          ...assigned,
          workshopNameBn: displayName,
          category: live.category || assigned.category,
          oicRankAndName: live.oicName ? `${live.oicRank || ''} ${live.oicName}`.trim() : assigned.oicRankAndName,
          phoneExt: live.phoneExt ? live.phoneExt.replace(/^Ext:\s*/i, '') : assigned.phoneExt,
          tasks
        };
      });

      // Dynamically add any workshop that has logged defects at this compartment location on THIS ship
      compDefects.forEach(d => {
        const live = workshops.find(w => isDefectForWorkshop(d, w));
        if (live) {
          const alreadyIndex = updatedAssigned.findIndex(a => a.workshopCode.toUpperCase() === live.code.toUpperCase());
          const defectTask = d.defectDescription || `${d.location}-এ মেরামত ও সমাধান কার্যক্রম`;
          if (alreadyIndex >= 0) {
            updatedAssigned[alreadyIndex] = {
              ...updatedAssigned[alreadyIndex],
              tasks: [defectTask, ...updatedAssigned[alreadyIndex].tasks.filter(t => t !== defectTask)]
            };
          } else {
            updatedAssigned.unshift({
              workshopCode: live.code,
              workshopNameBn: live.nameEn ? (live.nameBn ? `${live.nameEn} (${live.nameBn})` : live.nameEn) : (live.nameBn || live.code),
              category: live.category || 'Maintenance & Repair',
              oicRankAndName: `${live.oicRank || 'Lieutenant'} ${live.oicName || ''}`.trim(),
              phoneExt: live.phoneExt ? live.phoneExt.replace(/^Ext:\s*/i, '') : '8116',
              tasks: [
                defectTask,
                `${comp.nameEn} সংক্রান্ত টেকনিক্যাল পরিদর্শন ও মেরামত`
              ]
            });
          }
        }
      });

      return {
        ...comp,
        workshopsAssigned: updatedAssigned
      };
    });
  }, [workshops, defects, selectedShip]);

  // Filter compartments by selected workshop on THIS ship
  const highlightedCompartmentIds = useMemo(() => {
    if (selectedWorkshopFilter === 'all') {
      // If 'all', highlight all compartments that have pending defects on this ship, or all if none
      const activeDefCompartments = dynamicCompartments.filter(c => {
        const compDefs = getCompartmentDefects(c);
        return compDefs.some(d => d.status === 'Pending');
      }).map(c => c.id);

      return new Set(activeDefCompartments.length > 0 ? activeDefCompartments : dynamicCompartments.map(c => c.id));
    }

    const targetCode = (selectedWorkshopObj?.code || selectedWorkshopFilter).toUpperCase();

    // 1. Direct defects on THIS ship where this workshop has work at this compartment
    const compartmentsWithShipWork = dynamicCompartments.filter(c => {
      const compDefs = getCompartmentDefects(c);
      return compDefs.some(d => isDefectForWorkshop(d, selectedWorkshopObj || targetCode));
    }).map(c => c.id);

    // 2. Designated routine maintenance compartments for this workshop
    const routineStationIds = dynamicCompartments.filter(c => {
      return c.workshopsAssigned.some(w => {
        const wCode = w.workshopCode.toUpperCase();
        return wCode === targetCode || (selectedWorkshopObj && wCode === selectedWorkshopObj.code.toUpperCase());
      });
    }).map(c => c.id);

    // Combine all compartments where this workshop has work (active defects or assigned duties)
    return new Set([...compartmentsWithShipWork, ...routineStationIds]);
  }, [dynamicCompartments, selectedWorkshopFilter, selectedWorkshopObj, defects, selectedShip]);

  // Signaled compartments assigned to selected workshop
  const signaledCompartments = useMemo(() => {
    if (selectedWorkshopFilter === 'all') return dynamicCompartments;
    return dynamicCompartments.filter(c => highlightedCompartmentIds.has(c.id));
  }, [dynamicCompartments, highlightedCompartmentIds, selectedWorkshopFilter]);

  // Count active defects in ship
  const shipDefects = useMemo(() => {
    return defects.filter(d => !selectedShip || isSameShip(d.shipName, selectedShip));
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
    // Keep active compartment updated with live dynamic data
    const liveComp = dynamicCompartments.find(c => c.id === compartment.id) || compartment;
    setActiveCompartment(liveComp);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* =========================================================================
          UNIFIED EXECUTIVE WORKSHOP ANALYTICS CONTAINER (ডিফেক্ট, প্রগ্রেস, কমপ্লিট ও গ্রাফ চার্ট)
      ========================================================================= */}
      <WorkshopProgressAnalytics
        workshops={workshops}
        defects={defects}
        ships={ships}
        selectedShip={selectedShip}
        onSelectShip={(ship) => setSelectedShip(ship)}
        selectedWorkshopFilter={selectedWorkshopFilter}
        onSelectWorkshop={(code) => setSelectedWorkshopFilter(code)}
        authSession={authSession}
        onFocusCompartment={(compId) => {
          const comp = dynamicCompartments.find(c => c.id === compId);
          if (comp) handleOpenDetails(comp);
        }}
        onNavigateToEntry={onNavigateToEntry}
      />

      {/* =========================================================================
          2. THE 3D WARSHIP INTERACTIVE CANVAS & DIGITAL TWIN STAGE (এর নিচে জাহাজের 3D ভিউ)
      ========================================================================= */}
      <div className="relative bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm overflow-hidden space-y-4 text-slate-800">
        
        {/* Subtle Engineering Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        ></div>

        {/* 3D Warship Interactive Header & Control Toolbar */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-800">
              <Crosshair className="h-4 w-4 text-slate-600" />
              <span>Warship Technical 3D Twin</span>
            </div>

            {/* Warship Selector Dropdown */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Ship className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-[11px] text-slate-500 font-semibold uppercase">জাহাজ:</span>
              <select
                value={selectedShip}
                onChange={(e) => setSelectedShip(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer pr-1"
              >
                {ships.map(s => (
                  <option key={s} value={s} className="bg-white text-slate-800">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Signal Status */}
            {selectedWorkshopObj ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>সিগনাল: <strong className="text-slate-900">{selectedWorkshopObj.code}</strong> ({signaledCompartments.length} কম্পার্টমেন্ট)</span>
                <button
                  type="button"
                  onClick={() => setSelectedWorkshopFilter('all')}
                  className="ml-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 underline cursor-pointer"
                >
                  রিসেট
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                <Radio className="h-3.5 w-3.5 text-slate-500" />
                <span>সকল কম্পার্টমেন্ট সক্রিয়</span>
              </div>
            )}
          </div>

          {/* Right side: View Angle Controls & Active Defects */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-100 border border-slate-200 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('isometric')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'isometric'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3D Isometric
              </button>
              <button
                type="button"
                onClick={() => setViewMode('profile')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'profile'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => setViewMode('top')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'top'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Top Deck
              </button>
              <button
                type="button"
                onClick={() => setViewMode('xray')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'xray'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                X-Ray
              </button>
            </div>

            <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-200">
              বকেয়া ডিফেক্ট: <strong className="text-rose-900">{pendingShipDefectsCount}</strong>
            </span>
          </div>
        </div>

        {/* Realistic Naval Warship Schematic & 3D Interactive Hotspot Container */}
        <div className="relative w-full aspect-[16/9] min-h-[380px] max-h-[560px] flex items-center justify-center select-none overflow-hidden my-2 bg-slate-50/50 rounded-xl border border-slate-100">
          
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
                {getShipPennantNumber(selectedShip)}
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
            {dynamicCompartments.map((compartment) => {
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

              // Find defects at this compartment for the currently selected workshop on this ship
              const wsDefectsOnShip = compDefects.filter(d => 
                selectedWorkshopFilter === 'all'
                  ? true
                  : isDefectForWorkshop(d, selectedWorkshopObj || selectedWorkshopFilter)
              );
              const hasWsDefects = wsDefectsOnShip.some(d => d.status === 'Pending');

              // Find assigned task for the currently selected workshop
              const assignedTask = selectedWorkshopFilter === 'all'
                ? compartment.workshopsAssigned[0]
                : compartment.workshopsAssigned.find(w => 
                    w.workshopCode.toUpperCase() === (selectedWorkshopObj?.code || selectedWorkshopFilter).toUpperCase()
                  ) || compartment.workshopsAssigned[0];
              
              const isSignaled = selectedWorkshopFilter === 'all' 
                ? (hasDefects || highlightedCompartmentIds.has(compartment.id))
                : highlightedCompartmentIds.has(compartment.id);

              // 100% STRICT REQUIREMENT:
              // When logged in as a workshop user or filtered to a workshop, ONLY show compartments where THIS workshop has work or duties!
              // Other workshops' compartments and signals MUST NOT be shown!
              if (selectedWorkshopFilter !== 'all' && !isSignaled) {
                return null;
              }

              const wsHasPending = hasWsDefects || (selectedWorkshopFilter === 'all' && hasDefects);
              const wsHasSolved = wsDefectsOnShip.some(d => d.status === 'Solved');

              return (
                <div
                  key={compartment.id}
                  style={{
                    left: `${posX}%`,
                    top: `${posY}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isHovered ? 50 : wsHasPending ? 40 : 25
                  }}
                  className="absolute transition-all duration-300 opacity-100 scale-100"
                  onMouseEnter={() => setHoveredCompartmentId(compartment.id)}
                  onMouseLeave={() => setHoveredCompartmentId(null)}
                >
                  {/* Clickable Beacon Button & Tactical Work Signal */}
                  <div className="relative group flex flex-col items-center">
                    
                    {/* Concentric Signal Waves */}
                    {wsHasPending ? (
                      <span className="absolute -inset-3 rounded-full animate-ping opacity-75 pointer-events-none bg-rose-500"></span>
                    ) : wsHasSolved ? (
                      <span className="absolute -inset-2.5 rounded-full animate-ping opacity-40 pointer-events-none bg-emerald-500"></span>
                    ) : (
                      <span className="absolute -inset-2 rounded-full animate-ping opacity-30 pointer-events-none bg-sky-400"></span>
                    )}

                    {/* Floating Tactical Signal Pill */}
                    {wsHasPending ? (
                      <span className="absolute -top-6 whitespace-nowrap px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black shadow-md uppercase tracking-wider flex items-center gap-1 z-10 animate-bounce">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        কাজ সিগনাল ({wsDefectsOnShip.filter(d => d.status === 'Pending').length || 1})
                      </span>
                    ) : wsHasSolved ? (
                      <span className="absolute -top-5.5 whitespace-nowrap px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[9px] font-bold shadow-sm uppercase tracking-wider z-10">
                        ✓ সম্পন্ন
                      </span>
                    ) : selectedWorkshopFilter !== 'all' ? (
                      <span className="absolute -top-5.5 whitespace-nowrap px-2 py-0.5 rounded-full bg-[#006A4E] text-[#FFFDD0] text-[9px] font-bold shadow-sm uppercase tracking-wider z-10">
                        নিয়মিত স্টেশন
                      </span>
                    ) : isMyShopAssigned ? (
                      <span className="absolute -top-5.5 whitespace-nowrap px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold shadow-xs uppercase z-10">
                        MY SHOP
                      </span>
                    ) : null}

                    {/* Outer Beacon Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(compartment)}
                      className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-[11px] shadow-md transition-transform group-hover:scale-115 border-2 cursor-pointer focus:outline-none ${
                        wsHasPending
                          ? 'bg-rose-600 text-white border-white ring-4 ring-rose-400/80 animate-pulse'
                          : wsHasSolved
                          ? 'bg-emerald-600 text-white border-white ring-2 ring-emerald-300'
                          : selectedWorkshopFilter !== 'all'
                          ? 'bg-[#003828] text-[#FFFDD0] border-amber-300 ring-2 ring-amber-400'
                          : isMyShopAssigned
                          ? 'bg-amber-500 text-white border-white ring-2 ring-amber-300'
                          : 'bg-slate-800 text-white border-slate-200 hover:bg-slate-900'
                      }`}
                      aria-label={compartment.nameEn}
                    >
                      <span>{compartment.code.replace('SEC-', '')}</span>
                    </button>

                    {/* "MY SHOP" Badge if user's own workshop */}
                    {isMyShopAssigned && (
                      <span className="absolute -top-3.5 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[9px] font-bold shadow-xs uppercase pointer-events-none">
                        MY SHOP
                      </span>
                    )}

                    {/* Work Signal Callout */}
                    {selectedWorkshopFilter !== 'all' && assignedTask && isSignaled ? (
                      <div
                        onClick={() => handleOpenDetails(compartment)}
                        className={`mt-1.5 px-2.5 py-1.5 rounded-xl text-left shadow-sm border transition-all cursor-pointer group-hover:scale-105 min-w-[160px] max-w-[240px] ${
                          hasWsDefects || hasDefects
                            ? 'bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-200'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1 border-b border-slate-100 pb-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${hasWsDefects || hasDefects ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-gradient-to-r from-[#003828] via-[#006A4E] to-[#004d38] text-[#FFFDD0] border border-amber-400/50 text-[9px] font-mono font-black tracking-wider uppercase shadow-2xs">
                              {selectedWorkshopObj?.code || selectedWorkshopFilter}
                            </span>
                          </div>
                          <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1 rounded font-mono">
                            {compartment.code}
                          </span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-900 truncate">
                          {selectedWorkshopObj?.nameEn || assignedTask.workshopNameBn}
                        </div>
                        {wsDefectsOnShip.length > 0 && wsDefectsOnShip[0].location ? (
                          <div className="text-[10px] font-bold text-[#006A4E] truncate mt-0.5">
                            📍 {wsDefectsOnShip[0].location}
                          </div>
                        ) : null}
                        <div className="text-[11px] font-medium leading-snug text-slate-700 line-clamp-2 mt-0.5">
                          {wsDefectsOnShip.length > 0
                            ? (wsDefectsOnShip[0].defectDescription || `${wsDefectsOnShip[0].location} মেরামত ও পরিদর্শন`)
                            : assignedTask.tasks[0]}
                        </div>
                        {(hasWsDefects || hasDefects) && (
                          <div className="mt-1 text-[9px] font-semibold text-rose-700 flex items-center gap-1 bg-rose-100/70 px-1.5 py-0.5 rounded">
                            <AlertTriangle className="h-3 w-3 text-rose-600" />
                            <span>ডিফেক্ট বিদ্যমান ({wsDefectsOnShip.filter(d => d.status === 'Pending').length || 1}টি)</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Standard Section Name Pill */
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(compartment)}
                        className={`mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-tight whitespace-nowrap shadow-xs border transition-all cursor-pointer flex items-center gap-1 ${
                          hasDefects
                            ? 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-200'
                            : isMyShopAssigned
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {hasDefects && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>}
                        <span>{compartment.nameEn.split(' ')[0]} {compartment.nameEn.split(' ')[1] || ''}</span>
                      </button>
                    )}
                  </div>

                  {/* QUICK HOVER PREVIEW TOOLTIP */}
                  {isHovered && (
                    <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-72 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xl text-slate-800 pointer-events-none z-50 animate-fade-in text-left">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold">
                            {compartment.code}
                          </span>
                          <span className="text-[11px] text-slate-500 uppercase">
                            {compartment.deckLevel}
                          </span>
                        </div>
                        {hasDefects ? (
                          <span className="text-[10px] text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            ডিফেক্ট আছে
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            সচল
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-900">{compartment.nameEn}</h4>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{compartment.overview}</p>

                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">
                          দায়িত্বপ্রাপ্ত ওয়ার্কশপ ({compartment.workshopsAssigned.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {compartment.workshopsAssigned.map(w => (
                            <span 
                              key={w.workshopCode} 
                              className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                w.workshopCode === myWorkshopCode
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {w.workshopCode}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] text-slate-500 font-medium text-center bg-slate-50 py-1 rounded-lg border border-slate-100">
                        বিস্তারিত দেখতে ক্লিক করুন ➔
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Empty State Banner if selected workshop has no work on this ship */}
            {selectedWorkshopFilter !== 'all' && highlightedCompartmentIds.size === 0 && (
              <div className="absolute inset-0 z-30 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md text-center shadow-2xl space-y-3.5">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                    <Radio className="h-6 w-6 text-amber-600 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      "{selectedShip}" যুদ্ধজাহাজে {selectedWorkshopObj?.nameEn || selectedWorkshopFilter}-এর কোনো সক্রিয় সিগনাল নেই
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed text-justify mt-1">
                      বর্তমানে এই জাহাজের কোনো লোকেশনে এই শপের বকেয়া বা চলমান কাজের সিগনাল নিবন্ধিত নেই। আপনি চাইলে নতুন ডিফেক্ট বা কাজের এন্ট্রি যুক্ত করতে পারেন অথবা অন্য যুদ্ধজাহাজ নির্বাচন করতে পারেন।
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onNavigateToEntry?.(undefined, selectedWorkshopObj?.nameEn || selectedWorkshopFilter)}
                      className="px-4 py-2 bg-[#006A4E] text-[#FFFDD0] rounded-xl text-xs font-bold hover:bg-[#004d38] transition-all cursor-pointer shadow-xs"
                    >
                      নতুন কাজের এন্ট্রি দিন
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedWorkshopFilter('all')}
                      className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all cursor-pointer"
                    >
                      সকল কম্পার্টমেন্ট দেখুন
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Legend & Interactive Guide */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-slate-500 font-semibold uppercase">নির্দেশিকা:</span>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
              <span>স্ট্যান্ডার্ড কম্পার্টমেন্ট</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-800">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>লগইনকৃত ওয়ার্কশপ</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span>ডিফেক্ট বিদ্যমান</span>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            কম্পার্টমেন্টের বিস্তারিত ও টেকনিক্যাল ডাটা দেখতে যেকোনো বিকনে ক্লিক করুন।
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. DETAILED COMPARTMENT INFORMATION BOX / MODAL
          Fixed viewport positioning - centered right in front of user with fixed header & footer
      ========================================================================= */}
      {/* =========================================================================
          3. DETAILED COMPARTMENT INFORMATION BOX / MODAL
          Rendered via createPortal directly into document.body to ensure it is 
          completely immune to parent transforms and stays 100% centered in viewport
      ========================================================================= */}
      {activeCompartment && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-hidden select-none"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => setActiveCompartment(null)}
        >
          <div 
            className="bg-white border border-slate-300 rounded-2xl w-full max-w-4xl h-[86vh] max-h-[780px] min-h-[460px] flex flex-col shadow-2xl overflow-hidden relative select-text my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. FIXED TOP HEADER: Anchor Crest, Titles, Compartment Code & Close Button */}
            <div className="shrink-0 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl p-1 bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                  <img 
                    src="/anchor.jpg" 
                    alt="Bangladesh Navy Crest Anchor" 
                    className="w-full h-full object-contain rounded-lg" 
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#006A4E] text-[#FFFDD0] font-bold text-[10px] tracking-wider uppercase shadow-2xs font-mono">
                      {activeCompartment.code}
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                      {activeCompartment.nameEn}
                    </h3>
                    <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                      ({activeCompartment.nameBn})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      📍 {activeCompartment.deckLevel}
                    </span>
                    <span className="text-[11px] text-[#006A4E] font-bold bg-[#006A4E]/10 px-2 py-0.5 rounded border border-[#006A4E]/20">
                      ⚓ {selectedShip}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveCompartment(null)}
                className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer shrink-0"
                title="বন্ধ করুন"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 2. SCROLLABLE BODY: Overview, Tech Specs, Workshops & Defect Log (Strict text-justify & clean alignment) */}
            <div 
              ref={modalBodyRef}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 text-justify"
            >
              
              {/* Overview & Technical Specs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-slate-50 p-4 sm:p-4.5 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5 tracking-wider">
                    <Info className="h-4 w-4 text-[#006A4E] shrink-0" />
                    <span>কম্পার্টমেন্ট ভূমিকা ও কারিগরি বিবরণ (Overview)</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                    {activeCompartment.overview}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 sm:p-4.5 rounded-xl border border-slate-200 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5 tracking-wider">
                    <Gauge className="h-4 w-4 text-slate-600 shrink-0" />
                    <span>স্পেসিফিকেশন (Specifications)</span>
                  </h4>
                  <div className="space-y-2">
                    {activeCompartment.specifications.map((spec, idx) => (
                      <div key={idx} className="text-xs border-b border-slate-200/80 pb-1.5 last:border-0 last:pb-0 flex items-center justify-between gap-2">
                        <span className="text-slate-500 block text-[11px] font-medium">{spec.label}</span>
                        <span className="text-slate-900 font-bold text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* =========================================================================
                  RESPONSIBLE WORKSHOPS & SCOPE OF WORK
              ========================================================================= */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2 tracking-wider">
                    <Wrench className="h-4 w-4 text-[#006A4E] shrink-0" />
                    <span>দায়িত্বপ্রাপ্ত ওয়ার্কশপ ও কাজের পরিধি ({activeCompartment.workshopsAssigned.length} টি শপ)</span>
                  </h4>
                  {selectedWorkshopFilter !== 'all' && (
                    <span className="text-[11px] text-[#006A4E] font-bold bg-[#006A4E]/10 px-2 py-0.5 rounded border border-[#006A4E]/20">
                      নির্বাচিত শপ: {selectedWorkshopObj?.nameEn || selectedWorkshopFilter}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {[...activeCompartment.workshopsAssigned].sort((a, b) => {
                    const targetCode = (selectedWorkshopObj?.code || selectedWorkshopFilter).toUpperCase();
                    if (a.workshopCode.toUpperCase() === targetCode) return -1;
                    if (b.workshopCode.toUpperCase() === targetCode) return 1;
                    if (myWorkshopCode && a.workshopCode.toUpperCase() === myWorkshopCode.toUpperCase()) return -1;
                    if (myWorkshopCode && b.workshopCode.toUpperCase() === myWorkshopCode.toUpperCase()) return 1;
                    return 0;
                  }).map((wsItem) => {
                    const liveWs = workshops.find(w => 
                      w.code.toUpperCase() === wsItem.workshopCode.toUpperCase() || 
                      w.id.toLowerCase() === wsItem.workshopCode.toLowerCase()
                    );
                    const displayName = liveWs 
                      ? (liveWs.nameEn ? `${liveWs.nameEn}${liveWs.nameBn ? ` (${liveWs.nameBn})` : ''}` : liveWs.nameBn) 
                      : (wsItem.workshopNameEn || wsItem.workshopNameBn);
                    const displayCategory = liveWs?.category || wsItem.category;
                    const displayOic = liveWs?.oicName ? `${liveWs.oicRank || ''} ${liveWs.oicName}`.trim() : wsItem.oicRankAndName;
                    const displayExt = liveWs?.phoneExt ? liveWs.phoneExt.replace(/^Ext:\s*/i, '') : wsItem.phoneExt;
                    const isUserShop = myWorkshopCode && wsItem.workshopCode.toUpperCase() === myWorkshopCode.toUpperCase();
                    const isSignaledShop = selectedWorkshopFilter !== 'all' && (
                      wsItem.workshopCode.toUpperCase() === selectedWorkshopFilter.toUpperCase() || 
                      (selectedWorkshopObj && wsItem.workshopCode.toUpperCase() === selectedWorkshopObj.code.toUpperCase())
                    );

                    return (
                      <div 
                        key={wsItem.workshopCode} 
                        className={`p-4 rounded-xl border transition-all text-justify ${
                          isSignaledShop
                            ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-300/80 shadow-xs'
                            : isUserShop 
                            ? 'bg-amber-50/50 border-amber-200' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Workshop Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-lg bg-gradient-to-r from-[#003828] via-[#006A4E] to-[#004d38] text-[#FFFDD0] border border-amber-400/60 text-xs font-mono font-black tracking-wider shadow-xs">
                              {wsItem.workshopCode}
                            </span>
                            <div>
                              <h5 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                                {displayName}
                              </h5>
                              <span className="text-[11px] text-slate-500">
                                বিভাগ: {displayCategory}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isSignaledShop && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-full flex items-center gap-1 border border-amber-300">
                                <Radio className="h-2.5 w-2.5 text-amber-700 animate-pulse" />
                                সক্রিয় শপ
                              </span>
                            )}
                            {isUserShop && !isSignaledShop && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-semibold text-[10px] rounded-full">
                                আমার শপ
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Workshop OIC & Intercom */}
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-2.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <span className="truncate">OIC: {displayOic}</span>
                          <span className="text-slate-800 font-semibold shrink-0 flex items-center gap-1 font-mono">
                            <Phone className="h-3 w-3 text-[#006A4E]" /> Ext: {displayExt}
                          </span>
                        </div>

                        {/* Specific Tasks List with text-justify */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                            কাজের পরিধি (Scope of Work):
                          </span>
                          <ul className="space-y-1.5">
                            {wsItem.tasks.map((task, tIdx) => (
                              <li key={tIdx} className="text-xs text-slate-700 flex items-start gap-1.5 text-justify leading-relaxed">
                                <span className="text-[#006A4E] mt-0.5 shrink-0 font-bold">•</span>
                                <span className="text-justify">{task}</span>
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
                  ACTIVE DEFECTS FOR THIS COMPARTMENT ON THIS SHIP
              ========================================================================= */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2 tracking-wider">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>কম্পার্টমেন্ট ডিফেক্ট ও কাজের লগ ({getCompartmentDefects(activeCompartment).length} টি)</span>
                  </h4>
                  <span className="text-xs text-[#006A4E] font-bold">
                    যুদ্ধজাহাজ: {selectedShip}
                  </span>
                </div>

                {getCompartmentDefects(activeCompartment).length === 0 ? (
                  <div className="flex items-center gap-3 bg-white border border-slate-200 p-4 rounded-xl text-slate-700 text-xs">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    <span className="leading-relaxed text-justify">
                      "{selectedShip}" জাহাজের এই কম্পার্টমেন্টে বর্তমানে কোনো অনিষ্পন্ন ডিফেক্ট নেই। সকল প্রযুক্তিগত যন্ত্রপাতি ও সিস্টেম সচল রয়েছে।
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {getCompartmentDefects(activeCompartment).map(def => {
                      const isTargetWsDef = selectedWorkshopFilter !== 'all' && isDefectForWorkshop(def, selectedWorkshopObj || selectedWorkshopFilter);
                      return (
                        <div 
                          key={def.id} 
                          className={`p-4 bg-white border rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs shadow-xs transition-all ${
                            isTargetWsDef ? 'border-[#006A4E]/50 ring-1 ring-[#006A4E]/30 bg-emerald-50/20' : 'border-slate-200'
                          }`}
                        >
                          <div className="min-w-0 space-y-1.5 flex-1 text-justify">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                def.status === 'Solved' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                              }`}>
                                {def.status === 'Solved' ? 'সমাধানকৃত' : 'চলমান কাজ সিগনাল'}
                              </span>
                              <span className="text-slate-400 text-[11px] font-mono">{def.defectDate}</span>
                              <span className="text-slate-800 text-[11px] font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                📍 {def.location}
                              </span>
                              <span className="text-[#006A4E] text-[11px] font-extrabold bg-[#006A4E]/10 px-2 py-0.5 rounded border border-[#006A4E]/20">
                                শপ: {def.workshop || def.workshopCode || 'অ্যাসাইনড'}
                              </span>
                            </div>
                            <p className="text-slate-800 font-medium leading-relaxed text-justify">
                              {def.defectDescription || 'ডিফেক্ট বিবরণ রেজিস্ট্রি করা হয়েছে।'}
                            </p>
                            {def.status === 'Solved' && def.solutionDescription && (
                              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-800 leading-relaxed text-justify">
                                <strong>সমাধানের বিবরণ ({def.solutionDate || 'সম্পন্ন'}):</strong> {def.solutionDescription}
                              </div>
                            )}
                          </div>

                          {def.defectImage && (
                            <img 
                              src={def.defectImage} 
                              alt="Defect" 
                              referrerPolicy="no-referrer"
                              className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0" 
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 3. FIXED BOTTOM ACTION FOOTER */}
            <div className="shrink-0 bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-600 font-medium">
                কম্পার্টমেন্ট: <strong className="text-slate-900 font-bold">{activeCompartment.code}</strong> • {activeCompartment.locationTag}
              </div>

              <div className="flex items-center gap-2.5">
                {onNavigateToEntry && (
                  <button
                    type="button"
                    onClick={() => {
                      const firstWs = (selectedWorkshopObj?.code || activeCompartment.workshopsAssigned[0]?.workshopCode || myWorkshopCode);
                      onNavigateToEntry(activeCompartment.locationTag, firstWs);
                      setActiveCompartment(null);
                    }}
                    className="px-4 py-2 bg-[#006A4E] hover:bg-[#004d38] text-[#FFFDD0] font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    <span>নতুন কাজের এন্ট্রি দিন</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveCompartment(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
