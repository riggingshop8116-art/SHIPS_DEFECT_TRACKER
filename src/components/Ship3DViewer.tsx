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
import WorkshopProgressAnalytics from './WorkshopProgressAnalytics';

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

  // Synchronize when authSession changes (e.g. on login/logout)
  useEffect(() => {
    if (authSession?.workshopCode && authSession.workshopCode !== 'HQ-ADMIN' && authSession.workshopCode !== 'HQ') {
      setSelectedWorkshopFilter(authSession.workshopCode);
    }
  }, [authSession?.workshopCode]);

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
          UNIFIED EXECUTIVE WORKSHOP ANALYTICS CONTAINER (ডিফেক্ট, প্রগ্রেস, কমপ্লিট ও গ্রাফ চার্ট)
      ========================================================================= */}
      <WorkshopProgressAnalytics
        workshops={workshops}
        defects={defects}
        selectedWorkshopFilter={selectedWorkshopFilter}
        onSelectWorkshop={(code) => setSelectedWorkshopFilter(code)}
        authSession={authSession}
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
                    
                    {/* Concentric Signal Waves */}
                    {isSignaled && (
                      <>
                        <span className={`absolute -inset-2.5 rounded-full animate-ping opacity-60 pointer-events-none ${
                          hasDefects 
                            ? 'bg-rose-500' 
                            : selectedWorkshopFilter !== 'all'
                            ? 'bg-blue-500'
                            : isMyShopAssigned 
                            ? 'bg-amber-500' 
                            : 'bg-slate-400'
                        }`}></span>
                      </>
                    )}

                    {/* Outer Beacon Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(compartment)}
                      className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-[11px] shadow-md transition-transform group-hover:scale-110 border-2 cursor-pointer focus:outline-none ${
                        hasDefects
                          ? 'bg-rose-600 text-white border-white ring-2 ring-rose-300 animate-bounce'
                          : selectedWorkshopFilter !== 'all' && Boolean(assignedTask)
                          ? 'bg-slate-900 text-white border-white ring-2 ring-slate-400'
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
                    {selectedWorkshopFilter !== 'all' && assignedTask ? (
                      <div
                        onClick={() => handleOpenDetails(compartment)}
                        className={`mt-1.5 px-2.5 py-1.5 rounded-xl text-left shadow-sm border transition-all cursor-pointer group-hover:scale-105 min-w-[150px] max-w-[210px] ${
                          hasDefects
                            ? 'bg-rose-50 border-rose-200 text-rose-900'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5 border-b border-slate-100 pb-0.5">
                          <div className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${hasDefects ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                            <span className="text-[10px] font-bold text-slate-700 uppercase">
                              {selectedWorkshopFilter}
                            </span>
                          </div>
                          <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1 rounded">
                            {compartment.code}
                          </span>
                        </div>
                        <div className="text-[11px] font-medium leading-snug text-slate-800 line-clamp-2">
                          {assignedTask.tasks[0]}
                        </div>
                        {hasDefects && (
                          <div className="mt-1 text-[9px] font-semibold text-rose-700 flex items-center gap-1 bg-rose-100/70 px-1.5 py-0.5 rounded">
                            <AlertTriangle className="h-3 w-3 text-rose-600" />
                            <span>ডিফেক্ট বিদ্যমান</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Standard Section Name Pill */
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(compartment)}
                        className={`mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-tight whitespace-nowrap shadow-xs border transition-all cursor-pointer ${
                          hasDefects
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : isMyShopAssigned
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {compartment.nameEn.split(' ')[0]} {compartment.nameEn.split(' ')[1] || ''}
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
          3. DETAILED COMPARTMENT INFORMATION BOX / MODAL (হোম পেজের ডায়ালগ বক্সের উপরের অংশে নোঙর এর ছবি থাকবে)
      ========================================================================= */}
      {activeCompartment && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setActiveCompartment(null)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 text-slate-800 shadow-xl relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Anchor & Crest Header Section (হোম পেজের ডায়ালগ বক্সের উপরের অংশে নোঙর এর ছবি) */}
            <div className="flex items-center justify-between bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl p-1 bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                  <img 
                    src="/anchor.jpg" 
                    alt="Bangladesh Navy Crest Anchor" 
                    className="w-full h-full object-contain rounded-lg" 
                  />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    BANGLADESH NAVY DOCKYARD CHATTOGRAM
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    যুদ্ধজাহাজ কারিগরি পরিদর্শন ও কম্পার্টমেন্ট ডজিয়ার
                  </p>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-slate-200 text-[10px] text-slate-700 font-medium uppercase">
                    NAVAL ARCHIVE & MAINTENANCE
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveCompartment(null)}
                className="p-2 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition-all cursor-pointer shrink-0"
                title="বন্ধ করুন"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Header of the Compartment */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 bg-slate-900 text-white rounded-xl font-bold text-base flex items-center justify-center shadow-xs shrink-0">
                  {activeCompartment.code}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">
                      {activeCompartment.deckLevel}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      জাহাজ: {selectedShip}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 truncate">
                    {activeCompartment.nameEn}
                  </h3>
                </div>
              </div>
            </div>

            {/* Overview & Technical Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase mb-1.5 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-slate-600" />
                  কম্পার্টমেন্ট বিবরণ ও ভূমিকা (Overview)
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {activeCompartment.overview}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase mb-1">
                  কারিগরি বিবরণ (Specifications)
                </h4>
                {activeCompartment.specifications.map((spec, idx) => (
                  <div key={idx} className="text-xs border-b border-slate-200/80 pb-1.5 last:border-0 last:pb-0">
                    <span className="text-slate-500 block text-[11px]">{spec.label}</span>
                    <span className="text-slate-900 font-semibold">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* =========================================================================
                RESPONSIBLE WORKSHOPS & DETAILED TASKS
            ========================================================================= */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-slate-600" />
                  <span>দায়িত্বপ্রাপ্ত ওয়ার্কশপ ও কাজের পরিধি ({activeCompartment.workshopsAssigned.length} টি শপ)</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                      className={`p-4 rounded-xl border transition-all ${
                        isSignaledShop
                          ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300'
                          : isUserShop 
                          ? 'bg-amber-50/50 border-amber-200' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Workshop Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            isSignaledShop || isUserShop ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {wsItem.workshopCode}
                          </span>
                          <div>
                            <h5 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                              {wsItem.workshopNameEn || wsItem.workshopNameBn}
                            </h5>
                            <span className="text-[11px] text-slate-500">
                              বিভাগ: {wsItem.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSignaledShop && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-semibold text-[10px] rounded-full flex items-center gap-1">
                              <Radio className="h-2.5 w-2.5" />
                              সিগনাল
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
                        <span className="truncate">OIC: {wsItem.oicRankAndName}</span>
                        <span className="text-slate-800 font-semibold shrink-0 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" /> Ext: {wsItem.phoneExt}
                        </span>
                      </div>

                      {/* Specific Tasks List */}
                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-500 font-semibold uppercase block">
                          কাজের পরিধি (Scope of Work):
                        </span>
                        <ul className="space-y-1">
                          {wsItem.tasks.map((task, tIdx) => (
                            <li key={tIdx} className="text-xs text-slate-700 flex items-start gap-1.5">
                              <span className="text-slate-400 mt-0.5 shrink-0">•</span>
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
            <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-slate-600" />
                  <span>কম্পার্টমেন্ট ডিফেক্ট লগ ({getCompartmentDefects(activeCompartment).length})</span>
                </h4>
                <span className="text-xs text-slate-500">
                  যুদ্ধজাহাজ: {selectedShip}
                </span>
              </div>

              {getCompartmentDefects(activeCompartment).length === 0 ? (
                <div className="flex items-center gap-3 bg-white border border-slate-200 p-3.5 rounded-xl text-slate-700 text-xs">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>এই কম্পার্টমেন্টে বর্তমানে কোনো ডিফেক্ট নেই। সকল সিস্টেম সচল।</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {getCompartmentDefects(activeCompartment).map(def => (
                    <div 
                      key={def.id} 
                      className="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            def.status === 'Solved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {def.status === 'Solved' ? 'সমাধানকৃত' : 'চলমান'}
                          </span>
                          <span className="text-slate-400 text-[11px]">{def.defectDate}</span>
                          <span className="text-slate-600 text-[11px] font-medium">ওয়ার্কশপ: {def.workshop || 'অ্যাসাইনড'}</span>
                        </div>
                        <p className="text-slate-800 mt-1 font-medium">
                          {def.defectDescription || 'ডিফেক্ট বিবরণ রেজিস্ট্রি করা হয়েছে।'}
                        </p>
                      </div>

                      {def.defectImage && (
                        <img 
                          src={def.defectImage} 
                          alt="Defect" 
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" 
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons in Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                কম্পার্টমেন্ট কোড: <strong className="text-slate-800">{activeCompartment.code}</strong> ({activeCompartment.locationTag})
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
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    <span>নতুন ডিফেক্ট এন্ট্রি করুন</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveCompartment(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
