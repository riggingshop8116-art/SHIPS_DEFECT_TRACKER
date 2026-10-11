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
  Crosshair
} from 'lucide-react';
import { Defect, Workshop, AuthSession } from '../types';

interface WorkshopProgressAnalyticsProps {
  workshops: Workshop[];
  defects: Defect[];
  selectedWorkshopFilter: string;
  onSelectWorkshop: (workshopCode: string) => void;
  authSession?: AuthSession | null;
}

// Helper to robustly match defects to a workshop
export const getWorkshopDefects = (ws: Workshop, allDefects: Defect[]) => {
  return allDefects.filter((d) => {
    if (d.workshopCode && d.workshopCode.trim().toLowerCase() === ws.code.trim().toLowerCase()) {
      return true;
    }
    if (d.workshop) {
      const wText = d.workshop.toLowerCase();
      if (wText.includes(ws.code.toLowerCase())) return true;
      if (ws.nameEn && wText.includes(ws.nameEn.toLowerCase())) return true;
      if (ws.nameBn && wText.includes(ws.nameBn.toLowerCase())) return true;
    }
    return false;
  });
};

export default function WorkshopProgressAnalytics({
  workshops,
  defects,
  selectedWorkshopFilter,
  onSelectWorkshop,
  authSession
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
          <div className="w-11 h-11 rounded-xl bg-[#006A4E] text-[#FFFDD0] font-black text-sm flex items-center justify-center shrink-0 border border-[#FFFDD0]/40 shadow-xs font-mono">
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

        {/* Workshop Selection Dropdown (Only for Admin / HQ) */}
        {!isWorkshopUser && (
          <div className="flex items-center justify-center gap-2 pt-1">
            <label htmlFor="analytics-shop-select" className="text-xs font-semibold text-slate-600">
              ওয়ার্কশপ নির্বাচন:
            </label>
            <select
              id="analytics-shop-select"
              value={activeWorkshopCode}
              onChange={(e) => handleWorkshopChange(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-lg outline-none cursor-pointer hover:border-slate-400 focus:border-[#006A4E]"
            >
              {workshops.map(ws => (
                <option key={ws.code} value={ws.code}>
                  {ws.code} - {ws.nameEn}
                </option>
              ))}
            </select>
          </div>
        )}
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

      {/* 3. Visual Charts & Diagrams Container */}
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
