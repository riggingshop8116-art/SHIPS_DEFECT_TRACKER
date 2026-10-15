import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart3, 
  PieChart, 
  ShieldCheck, 
  Gauge, 
  Lock, 
  Ship, 
  Phone, 
  Crosshair,
  MapPin,
  Radio,
  ExternalLink,
  PlusCircle,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Defect, Workshop, AuthSession } from '../types';
import { WARSHIP_COMPARTMENTS } from '../data/shipInspectionData';
import { 
  isSameShip, 
  getShopLocationsOnShip, 
  LocationWorkGroup,
  isDefectForWorkshop 
} from '../utils/shipWorkMatcher';

interface WorkshopProgressAnalyticsProps {
  workshops: Workshop[];
  defects: Defect[];
  ships?: string[];
  selectedShip?: string;
  onSelectShip?: (ship: string) => void;
  selectedWorkshopFilter: string;
  onSelectWorkshop: (workshopCode: string) => void;
  authSession?: AuthSession | null;
  onFocusCompartment?: (compartmentId: string) => void;
  onNavigateToEntry?: (prefillLocation?: string, prefillWorkshop?: string) => void;
}

// Helper to robustly match defects to a workshop using the strict matcher
export const getWorkshopDefects = (ws: Workshop, allDefects: Defect[]) => {
  return allDefects.filter((d) => isDefectForWorkshop(d, ws));
};

export default function WorkshopProgressAnalytics({
  workshops,
  defects,
  ships = [],
  selectedShip,
  onSelectShip,
  selectedWorkshopFilter,
  onSelectWorkshop,
  authSession,
  onFocusCompartment,
  onNavigateToEntry
}: WorkshopProgressAnalyticsProps) {
  // Check if current user is logged in as a specific workshop user
  const isWorkshopUser = authSession?.role === 'workshop_user' && 
    Boolean(authSession.workshopCode) && 
    authSession.workshopCode !== 'HQ-ADMIN' && 
    authSession.workshopCode !== 'HQ';

  const loggedInWorkshopCode = isWorkshopUser ? authSession.workshopCode : null;

  const [activeWorkshopCode, setActiveWorkshopCode] = useState<string>(() => {
    if (loggedInWorkshopCode) return loggedInWorkshopCode;
    if (selectedWorkshopFilter && selectedWorkshopFilter !== 'all') return selectedWorkshopFilter;
    return workshops[0]?.code || 'WS-01';
  });

  // Active selected warship state for location and signal grouping
  const [activeShip, setActiveShip] = useState<string>(() => {
    return selectedShip || ships[0] || 'BNS Bangabandhu (F 25)';
  });

  // Keep active ship synced with prop
  useEffect(() => {
    if (selectedShip && selectedShip !== activeShip) {
      setActiveShip(selectedShip);
    }
  }, [selectedShip]);

  const handleShipChange = (newShip: string) => {
    setActiveShip(newShip);
    onSelectShip?.(newShip);
  };

  // Keep active workshop synced when loggedInWorkshopCode or selectedWorkshopFilter changes
  useEffect(() => {
    if (loggedInWorkshopCode) {
      setActiveWorkshopCode(loggedInWorkshopCode);
    } else if (selectedWorkshopFilter && selectedWorkshopFilter !== 'all') {
      setActiveWorkshopCode(selectedWorkshopFilter);
    }
  }, [loggedInWorkshopCode, selectedWorkshopFilter]);

  // Handle workshop change (for admin or inspection)
  const handleWorkshopChange = (wsCode: string) => {
    if (isWorkshopUser) return;
    setActiveWorkshopCode(wsCode);
    onSelectWorkshop(wsCode);
  };

  // Find active workshop object
  const currentWorkshop = useMemo(() => {
    return workshops.find(w => w.code === activeWorkshopCode) || workshops[0] || {
      id: 'ws-01',
      code: 'WS-01',
      nameEn: 'Rigging Shop',
      nameBn: 'Rigging Shop',
      category: 'Deck & Lifting Gear',
      oicRank: 'Officer-in-Charge',
      oicName: 'OIC',
      phoneExt: '8116',
      status: 'active' as const
    };
  }, [workshops, activeWorkshopCode]);

  // Defects strictly belonging to the currently active workshop
  const currentWorkshopDefects = useMemo(() => {
    return getWorkshopDefects(currentWorkshop, defects);
  }, [currentWorkshop, defects]);

  // Defects belonging to the currently active workshop ON the selected ship
  const currentWorkshopSelectedShipDefects = useMemo(() => {
    return currentWorkshopDefects.filter(d => isSameShip(d.shipName, activeShip));
  }, [currentWorkshopDefects, activeShip]);

  // Locations on THIS selected ship where THIS workshop has work
  const shopLocationsOnSelectedShip = useMemo(() => {
    return getShopLocationsOnShip(activeShip, currentWorkshop, defects, WARSHIP_COMPARTMENTS);
  }, [activeShip, currentWorkshop, defects]);

  // Total active signals (pending work locations) on this ship for this workshop
  const activeSignalsOnSelectedShip = useMemo(() => {
    return shopLocationsOnSelectedShip.filter(loc => loc.hasActiveSignal).length;
  }, [shopLocationsOnSelectedShip]);

  // Other ships where this workshop has defects (for quick reference/switch)
  const otherShipsWithWork = useMemo(() => {
    const map = new Map<string, { total: number; pending: number }>();
    currentWorkshopDefects.forEach(d => {
      const sName = d.shipName || 'Unknown Vessel';
      if (!isSameShip(sName, activeShip)) {
        const existing = map.get(sName) || { total: 0, pending: 0 };
        map.set(sName, {
          total: existing.total + 1,
          pending: existing.pending + (d.status === 'Pending' ? 1 : 0)
        });
      }
    });
    return Array.from(map.entries()).map(([shipName, data]) => ({
      shipName,
      ...data
    })).sort((a, b) => b.pending - a.pending);
  }, [currentWorkshopDefects, activeShip]);

  // Workshop-specific statistics
  const workshopStats = useMemo(() => {
    const total = currentWorkshopDefects.length;
    const completed = currentWorkshopDefects.filter(d => d.status === 'Solved').length;
    const inProgress = total - completed;
    const progressRate = total > 0 ? Math.round((completed / total) * 100) : 100;
    
    let readinessGrade = '100% OPERATIONAL';
    let readinessColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (total > 0) {
      if (progressRate === 100) {
        readinessGrade = '100% COMPLETED';
        readinessColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
      } else if (progressRate >= 70) {
        readinessGrade = `${progressRate}% HIGH READINESS`;
        readinessColor = 'text-blue-700 bg-blue-50 border-blue-200';
      } else if (progressRate >= 40) {
        readinessGrade = `${progressRate}% IN PROGRESS`;
        readinessColor = 'text-amber-700 bg-amber-50 border-amber-200';
      } else {
        readinessGrade = `${progressRate}% ACTION REQUIRED`;
        readinessColor = 'text-rose-700 bg-rose-50 border-rose-200';
      }
    }

    return {
      total,
      completed,
      inProgress,
      progressRate,
      readinessGrade,
      readinessColor
    };
  }, [currentWorkshopDefects]);

  // Diagram 1: Warship-Wise Defect & Progress Breakdown for THIS workshop
  const shipBreakdown = useMemo(() => {
    const map: Record<string, { total: number; completed: number; inProgress: number }> = {};
    
    currentWorkshopDefects.forEach(d => {
      const ship = d.shipName || 'General Warship';
      if (!map[ship]) {
        map[ship] = { total: 0, completed: 0, inProgress: 0 };
      }
      map[ship].total += 1;
      if (d.status === 'Solved') {
        map[ship].completed += 1;
      } else {
        map[ship].inProgress += 1;
      }
    });

    return Object.entries(map).map(([shipName, data]) => {
      const rate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 100;
      return {
        shipName,
        ...data,
        rate
      };
    }).sort((a, b) => b.total - a.total);
  }, [currentWorkshopDefects]);

  const maxShipDefects = useMemo(() => {
    if (shipBreakdown.length === 0) return 5;
    return Math.max(...shipBreakdown.map(s => s.total), 1);
  }, [shipBreakdown]);

  // Diagram 2: Compartment & Location Defect Distribution for THIS workshop
  const locationBreakdown = useMemo(() => {
    const map: Record<string, { total: number; completed: number; inProgress: number }> = {};

    currentWorkshopDefects.forEach(d => {
      const loc = d.location || 'General Deck';
      if (!map[loc]) {
        map[loc] = { total: 0, completed: 0, inProgress: 0 };
      }
      map[loc].total += 1;
      if (d.status === 'Solved') {
        map[loc].completed += 1;
      } else {
        map[loc].inProgress += 1;
      }
    });

    return Object.entries(map).map(([location, data]) => {
      const rate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 100;
      return {
        location,
        total: data.total,
        completed: data.completed,
        inProgress: data.inProgress,
        rate
      };
    }).sort((a, b) => b.total - a.total);
  }, [currentWorkshopDefects]);

  // Diagram View Mode
  const [activeDiagramView, setActiveDiagramView] = useState<'ship_bars' | 'gauge' | 'compartments'>('ship_bars');

  return (
    <div 
      id="workshop-progress-analytics-container"
      className="bg-white/95 border-2 border-[#006A4E]/30 hover:border-[#006A4E]/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6 text-[#1B331F] transition-all"
    >
      {/* 1. Center-Aligned Header Bar with Workshop Identity */}
      <div className="flex flex-col items-center justify-center text-center gap-3 border-b border-[#006A4E]/15 pb-5">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 flex-wrap text-center">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#003828] via-[#006A4E] to-[#004d38] text-[#FFFDD0] border-2 border-amber-400/80 shadow-md tracking-wider font-mono font-black text-sm sm:text-base drop-shadow-sm shrink-0">
            <span className="text-amber-300/80 text-[10px] uppercase mr-1.5 tracking-normal font-sans font-bold">CODE:</span>
            {currentWorkshop.code}
          </div>

          <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight font-algerian">
            {currentWorkshop.nameEn} {currentWorkshop.nameBn ? `(${currentWorkshop.nameBn})` : ''}
          </h2>

          {isWorkshopUser ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-xs">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>লগইনকৃত শপ</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold border border-blue-300 shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>হেডকোয়ার্টার্স ভিউ</span>
            </span>
          )}
        </div>

        <div className="text-xs sm:text-sm text-slate-600 flex items-center justify-center gap-2.5 flex-wrap font-medium">
          <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
            বিভাগ: <strong className="text-slate-800">{currentWorkshop.category}</strong>
          </span>
          <span className="text-slate-400">•</span>
          <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
            <Phone className="h-3.5 w-3.5 text-[#006A4E]" />
            <span>EXT: {currentWorkshop.phoneExt ? currentWorkshop.phoneExt.replace(/^Ext:\s*/i, '') : '8116'}</span>
          </span>
        </div>

        {/* Navigation & Selection Controls Bar: Warship & Workshop Selection */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 pb-1 border-t border-[#006A4E]/10 w-full">
          {/* Warship Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl shadow-2xs">
            <Ship className="h-4 w-4 text-[#006A4E]" />
            <label htmlFor="analytics-ship-select" className="text-xs font-bold text-slate-700 whitespace-nowrap">
              যুদ্ধজাহাজ:
            </label>
            <select
              id="analytics-ship-select"
              value={activeShip}
              onChange={(e) => handleShipChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer pr-1"
            >
              {ships.map(s => (
                <option key={s} value={s} className="bg-white text-slate-900">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Workshop Selection Dropdown (Only for Admin / HQ) */}
          {!isWorkshopUser && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl shadow-2xs">
              <Building2 className="h-4 w-4 text-[#006A4E]" />
              <label htmlFor="analytics-shop-select" className="text-xs font-bold text-slate-700 whitespace-nowrap">
                ওয়ার্কশপ:
              </label>
              <select
                id="analytics-shop-select"
                value={activeWorkshopCode}
                onChange={(e) => handleWorkshopChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer pr-1"
              >
                {workshops.map(ws => (
                  <option key={ws.code} value={ws.code} className="bg-white text-slate-900">
                    {ws.code} - {ws.nameEn}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Live Signal Indicator Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-300 text-xs font-semibold">
            <span className={`w-2.5 h-2.5 rounded-full ${activeSignalsOnSelectedShip > 0 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`}></span>
            <span className="text-slate-800">
              সিগনাল: <strong className="text-slate-900">{activeSignalsOnSelectedShip}</strong> টি লোকেশনে বকেয়া কাজ
            </span>
          </div>
        </div>
      </div>

      {/* 2. Four Clean Summary Cards (Defects, In-Progress, Completed, Progress Rate) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Card 1: Total Defects */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>মোট ডিফেক্ট (Total)</span>
            <Building2 className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            {workshopStats.total}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {shipBreakdown.length} টি যুদ্ধজাহাজে
          </div>
        </div>

        {/* Card 2: In-Progress Defects */}
        <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-amber-800 text-xs font-medium">
            <span>চলমান কাজ (In-Progress)</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-800 mt-1">
            {workshopStats.inProgress}
          </div>
          <div className="text-xs text-amber-700 mt-1">
            {workshopStats.total > 0 ? `${100 - workshopStats.progressRate}% অবশিষ্ট` : '০টি অবশিষ্ট'}
          </div>
        </div>

        {/* Card 3: Completed Defects */}
        <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-medium">
            <span>সম্পন্ন মেরামত (Completed)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-800 mt-1">
            {workshopStats.completed}
          </div>
          <div className="text-xs text-emerald-700 mt-1">
            সফল সমাধান
          </div>
        </div>

        {/* Card 4: Progress Rate */}
        <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-blue-800 text-xs font-medium">
            <span>কাজের অগ্রগতি (Progress Rate)</span>
            <Gauge className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-800 mt-1">
            {workshopStats.progressRate}%
          </div>
          <div className="text-xs text-blue-700 mt-1">
            {workshopStats.readinessGrade}
          </div>
        </div>

      </div>

      {/* =========================================================================
          3. DEDICATED SECTION: WORK LOCATIONS & ACTIVE SIGNALS UNDER THIS SHOP ON SELECTED SHIP
          "এক্ষেত্রে যে শপের জাহাজের যে লোকেশনে কাজ সেই লোকেশন সেই শপের আন্ডারে শো হবে"
      ========================================================================= */}
      <div className="bg-white rounded-2xl border-2 border-[#006A4E]/30 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#006A4E]/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#003828] via-[#006A4E] to-[#004d38] text-[#FFFDD0] shadow-xs shrink-0">
              <Radio className="h-5 w-5 text-[#FFFDD0] animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span className="text-[#006A4E] font-black">{activeShip}</span>
                <span className="text-slate-400 font-normal">•</span>
                <span className="text-slate-900 font-extrabold">{currentWorkshop.nameEn} ({currentWorkshop.code})</span>
                <span className="text-slate-600 font-medium text-xs sm:text-sm">এর কাজের লোকেশন ও সক্রিয় সিগনাল</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                নির্বাচিত জাহাজের যে যে লোকেশনে এই শপের কাজ রয়েছে, সেই লোকেশন ও ডিফেক্ট সিগনাল এখানে প্রদর্শিত হচ্ছে:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${
              activeSignalsOnSelectedShip > 0
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${activeSignalsOnSelectedShip > 0 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`}></span>
              <span>
                {activeSignalsOnSelectedShip > 0 ? `${activeSignalsOnSelectedShip}টি লোকেশনে সক্রিয় সিগনাল` : 'সকল কাজ সচল'}
              </span>
            </span>
          </div>
        </div>

        {/* Location Cards Grid */}
        {shopLocationsOnSelectedShip.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {shopLocationsOnSelectedShip.map((locGroup) => {
              return (
                <div 
                  key={locGroup.location}
                  className={`rounded-xl border p-4 transition-all space-y-3.5 relative overflow-hidden ${
                    locGroup.hasActiveSignal
                      ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-200/80 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Subtle top indicator bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${locGroup.hasActiveSignal ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>

                  {/* Card Header: Location Name & Matched Compartment */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200/80 pb-2.5 pt-0.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <MapPin className={`h-4 w-4 shrink-0 ${locGroup.hasActiveSignal ? 'text-rose-600' : 'text-[#006A4E]'}`} />
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {locGroup.location}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        {locGroup.compartmentNameEn}
                      </p>
                    </div>

                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-[10px] shrink-0 shadow-2xs">
                      {locGroup.compartmentCode}
                    </span>
                  </div>

                  {/* Signal & Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {locGroup.hasActiveSignal ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200">
                          <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                          সক্রিয় সিগনাল ({locGroup.pendingCount} বকেয়া)
                        </span>
                      ) : locGroup.solvedCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          সম্পন্ন ({locGroup.solvedCount})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#006A4E]/10 text-[#006A4E] font-bold text-xs border border-[#006A4E]/30">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#006A4E]" />
                          নিয়মিত স্টেশন • সচল
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-500 font-medium">
                      {locGroup.defects.length > 0 ? `মোট কাজ: ${locGroup.defects.length} টি` : 'নির্ধারিত জোন'}
                    </span>
                  </div>

                  {/* Tasks / Defects List Under This Location */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      {locGroup.defects.length > 0 ? 'কাজের বিবরণ (Tasks Log):' : 'নির্ধারিত নিয়মিত দায়িত্ব (Station Duties):'}
                    </span>
                    {locGroup.defects.length > 0 ? (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {locGroup.defects.map((def) => (
                          <div 
                            key={def.id} 
                            className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1 shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                def.status === 'Pending' 
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {def.status === 'Pending' ? 'চলমান' : 'সমাধানকৃত'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {def.defectDate}
                              </span>
                            </div>
                            <p className="text-xs text-slate-800 font-medium leading-snug">
                              {def.defectDescription || `${locGroup.location}-এ নির্ধারিত রক্ষণাবেক্ষণ কাজ`}
                            </p>
                            {def.status === 'Solved' && def.solutionDescription && (
                              <p className="text-[11px] text-emerald-700 bg-emerald-50/80 p-1.5 rounded font-medium border border-emerald-200/50 mt-1">
                                ✓ {def.solutionDescription}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2.5 bg-[#006A4E]/5 rounded-lg border border-[#006A4E]/20 text-xs space-y-1.5">
                        <ul className="text-[11px] text-slate-700 space-y-1">
                          {(locGroup.stationTasks && locGroup.stationTasks.length > 0 
                            ? locGroup.stationTasks 
                            : [`${locGroup.compartmentNameEn} সংক্রান্ত নিয়মিত টেকনিক্যাল পরিদর্শন ও সার্ভিসিং`]
                          ).map((task, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 leading-snug">
                              <span className="text-[#006A4E] font-bold shrink-0">•</span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Action: Spotlight on 3D Warship */}
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onFocusCompartment?.(locGroup.compartmentId)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006A4E] hover:text-[#004d38] cursor-pointer transition-colors"
                    >
                      <Crosshair className="h-3.5 w-3.5 text-[#006A4E]" />
                      <span>৩ডি জাহাজে এই লোকেশন দেখুন</span>
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      {locGroup.compartmentCode}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State for this shop on this ship */
          <div className="py-7 px-4 bg-slate-50/80 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
            <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                "{activeShip}" জাহাজে {currentWorkshop.nameEn}-এর কোনো বকেয়া কাজ বা ডিফেক্ট নেই
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                বর্তমানে এই যুদ্ধজাহাজের কোনো লোকেশনে এই শপের জন্য ডিফেক্ট সিগনাল নেই। সকল সিস্টেম সচল রয়েছে।
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap pt-1">
              <button
                type="button"
                onClick={() => onNavigateToEntry?.(undefined, currentWorkshop.nameEn)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#006A4E] hover:bg-[#004d38] text-[#FFFDD0] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>এই জাহাজের জন্য নতুন কাজের এন্ট্রি দিন</span>
              </button>

              {otherShipsWithWork.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold">অন্যান্য জাহাজ যেখানে কাজ আছে:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {otherShipsWithWork.slice(0, 3).map(os => (
                      <button
                        key={os.shipName}
                        type="button"
                        onClick={() => handleShipChange(os.shipName)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs cursor-pointer transition-colors shadow-2xs"
                      >
                        {os.shipName.split('(')[0].trim()} ({os.total}টি)
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Visual Charts & Diagrams Container */}
      <div className="bg-slate-50/60 border-2 border-[#006A4E]/20 rounded-xl p-4 sm:p-5 space-y-4">
        
        {/* Diagram Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-800">
              অগ্রগতি চার্ট ও ডায়াগ্রাম (Visual Analytics)
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveDiagramView('ship_bars')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeDiagramView === 'ship_bars'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              জাহাজভিত্তিক বার চার্ট
            </button>
            <button
              type="button"
              onClick={() => setActiveDiagramView('gauge')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeDiagramView === 'gauge'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              অগ্রগতি ডোনাট গেজ
            </button>
            <button
              type="button"
              onClick={() => setActiveDiagramView('compartments')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeDiagramView === 'compartments'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              কম্পার্টমেন্ট ডায়াগ্রাম
            </button>
          </div>
        </div>

        {/* DIAGRAM 1: Ship Breakdown Bar Chart */}
        {activeDiagramView === 'ship_bars' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>প্রতিটি যুদ্ধজাহাজে মেরামত ও অগ্রগতির চিত্র:</span>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
                  <span>সম্পন্ন (Solved)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-amber-500"></span>
                  <span>চলমান (Pending)</span>
                </span>
              </div>
            </div>

            {shipBreakdown.length > 0 ? (
              <div className="overflow-x-auto pb-2">
                <div className="flex items-end gap-5 min-w-[340px] pt-8 pb-3 px-2 border-b border-slate-200">
                  {shipBreakdown.map((sItem) => {
                    const barHeightPercent = Math.max(Math.round((sItem.total / maxShipDefects) * 100), 16);
                    const completedPercentOfBar = sItem.total > 0 ? (sItem.completed / sItem.total) * 100 : 100;
                    const inProgressPercentOfBar = sItem.total > 0 ? (sItem.inProgress / sItem.total) * 100 : 0;

                    return (
                      <div key={sItem.shipName} className="flex-1 flex flex-col items-center min-w-[70px] max-w-[120px]">
                        <div className="text-[11px] font-bold text-slate-700 mb-1">
                          {sItem.rate}%
                        </div>

                        <div 
                          style={{ height: `${Math.max(barHeightPercent * 1.6, 36)}px` }}
                          className="w-10 bg-slate-200 rounded-t-md overflow-hidden flex flex-col justify-end shadow-xs"
                        >
                          {sItem.inProgress > 0 && (
                            <div 
                              style={{ height: `${inProgressPercentOfBar}%` }}
                              className="w-full bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white"
                              title={`${sItem.inProgress} Pending`}
                            >
                              {sItem.inProgress}
                            </div>
                          )}

                          {sItem.completed > 0 && (
                            <div 
                              style={{ height: `${completedPercentOfBar}%` }}
                              className="w-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white"
                              title={`${sItem.completed} Solved`}
                            >
                              {sItem.completed}
                            </div>
                          )}
                        </div>

                        <div className="mt-2 text-center">
                          <span className="text-xs font-semibold text-slate-800 block truncate max-w-[100px]" title={sItem.shipName}>
                            {sItem.shipName.split('(')[0].trim()}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            মোট: {sItem.total}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center bg-white rounded-lg border border-slate-200 text-slate-500 text-xs">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-1.5" />
                <span>বর্তমানে কোনো যুদ্ধজাহাজে বকেয়া ডিফেক্ট নেই। ১০০% সচল ও প্রস্তুত।</span>
              </div>
            )}
          </div>
        )}

        {/* DIAGRAM 2: Donut Gauge Chart */}
        {activeDiagramView === 'gauge' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-3">
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#e2e8f0"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray={`${(workshopStats.progressRate * 238.76) / 100} 238.76`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="12"
                    strokeDasharray={`${((100 - workshopStats.progressRate) * 238.76) / 100} 238.76`}
                    strokeDashoffset={`-${(workshopStats.progressRate * 238.76) / 100}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-slate-900">
                    {workshopStats.progressRate}%
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">
                    অগ্রগতি
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
                  <span className="text-slate-700">সম্পন্ন ({workshopStats.completed})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-amber-500"></span>
                  <span className="text-slate-700">চলমান ({workshopStats.inProgress})</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Summary */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2.5">
              <h4 className="font-bold text-slate-800 uppercase pb-1 border-b border-slate-100 flex items-center gap-1.5">
                <Gauge className="h-4 w-4 text-slate-600" />
                <span>{currentWorkshop.code} কার্যদক্ষতা পরিসংখ্যান</span>
              </h4>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 text-slate-600">
                <span>মোট রেকর্ডকৃত ডিফেক্ট:</span>
                <span className="font-bold text-slate-900">{workshopStats.total} টি</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 text-slate-600">
                <span>চলমান কাজ (In Progress):</span>
                <span className="font-bold text-amber-700">{workshopStats.inProgress} টি</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 text-slate-600">
                <span>সম্পন্ন মেরামত (Solved):</span>
                <span className="font-bold text-emerald-700">{workshopStats.completed} টি</span>
              </div>
              <div className="flex justify-between items-center py-1 text-slate-600">
                <span>সার্বিক অগ্রগতির হার:</span>
                <span className="font-bold text-blue-700">{workshopStats.progressRate}%</span>
              </div>
            </div>
          </div>
        )}

        {/* DIAGRAM 3: Compartments Breakdown */}
        {activeDiagramView === 'compartments' && (
          <div className="space-y-3 pt-2">
            <div className="text-xs text-slate-500">
              জাহাজের কম্পার্টমেন্ট অনুযায়ী কাজের বিবরণ:
            </div>

            {locationBreakdown.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {locationBreakdown.map((loc) => (
                  <div 
                    key={loc.location}
                    className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                        <Crosshair className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{loc.location}</span>
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        loc.rate === 100 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {loc.rate}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        style={{ width: `${loc.rate}%` }} 
                        className="h-full bg-emerald-500 rounded-full"
                      ></div>
                      <div 
                        style={{ width: `${100 - loc.rate}%` }} 
                        className="h-full bg-amber-500"
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span className="text-emerald-700 font-semibold">{loc.completed} সম্পন্ন</span>
                      <span className="text-amber-700 font-semibold">{loc.inProgress} চলমান</span>
                      <span>মোট: {loc.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-white rounded-lg border border-slate-200 text-slate-500 text-xs">
                কোনো কম্পার্টমেন্টে ডিফেক্ট রেকর্ড নেই।
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
