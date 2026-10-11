import React, { useState, useMemo, useRef } from 'react';
import { 
  Hourglass, 
  Search, 
  Wrench, 
  Ship, 
  MapPin, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Upload, 
  X, 
  Sparkles, 
  Image as ImageIcon,
  PlusCircle,
  Maximize2,
  Anchor
} from 'lucide-react';
import { Defect, Workshop, AuthSession } from '../types';
import { supabaseService } from '../services/supabaseService';

interface InProgressJobsProps {
  defects: Defect[];
  ships: string[];
  locations: string[];
  workshops: Workshop[];
  authSession: AuthSession | null;
  onUpdateStatus: (id: string, solutionDate?: string, solutionDesc?: string, solutionImg?: string) => void;
  onNavigateToEntry: () => void;
  onNavigateToFind?: () => void;
}

export default function InProgressJobs({
  defects,
  ships,
  locations,
  workshops,
  authSession,
  onUpdateStatus,
  onNavigateToEntry,
  onNavigateToFind
}: InProgressJobsProps) {
  const isWorkshopUser = authSession?.role === 'workshop_user' && !!authSession.workshopCode && authSession.workshopCode !== 'HQ' && authSession.workshopCode !== 'HQ-ADMIN';

  // Search and filter state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterShip, setFilterShip] = useState('');
  const [filterWorkshop, setFilterWorkshop] = useState(
    isWorkshopUser && authSession?.workshopCode
      ? authSession.workshopCode
      : 'all'
  );

  // Active Defect being solved
  const [solvingDefect, setSolvingDefect] = useState<Defect | null>(null);
  const [solutionDate, setSolutionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const solutionDateInputRef = useRef<HTMLInputElement>(null);
  const [solutionDesc, setSolutionDesc] = useState<string>('');
  const [solutionImage, setSolutionImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeOpenDatePicker = (input: HTMLInputElement | null) => {
    if (!input) return;
    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker();
        return;
      }
    } catch {}
    input.focus();
    try {
      input.click();
    } catch {}
  };

  // Image preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Success Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const PRESET_SOLUTION_PHOTOS = [
    { name: 'Overhauled Pump', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80' },
    { name: 'Rebuilt Motor', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80' },
    { name: 'Flange Weld', url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80' }
  ];

  // In-Progress Defects Filtered
  const inProgressDefects = useMemo(() => {
    return defects.filter(d => {
      // Must not be solved
      const isSolved = d.status?.toLowerCase() === 'solved' || Boolean(d.solutionDate);
      if (isSolved) return false;

      // Workshop-user isolation
      if (isWorkshopUser && authSession?.workshopCode) {
        const userWsCode = authSession.workshopCode.toUpperCase();
        const userWsNameEn = (authSession.workshopNameEn || '').toLowerCase();
        const userWsNameBn = authSession.workshopNameBn || '';

        const matchWs = (d.workshopCode && d.workshopCode.toUpperCase() === userWsCode) ||
                        (d.workshop && (
                          d.workshop.toUpperCase().includes(userWsCode) ||
                          (userWsNameEn && d.workshop.toLowerCase().includes(userWsNameEn)) ||
                          (userWsNameBn && d.workshop.includes(userWsNameBn))
                        ));
        if (!matchWs) return false;
      } else if (filterWorkshop && filterWorkshop !== 'all') {
        const matchWs = (d.workshopCode && d.workshopCode.toLowerCase() === filterWorkshop.toLowerCase()) ||
                        (d.workshop && d.workshop.toLowerCase().includes(filterWorkshop.toLowerCase()));
        if (!matchWs) return false;
      }

      // Ship Filter
      if (filterShip && filterShip !== 'all' && d.shipName !== filterShip) {
        return false;
      }

      // Keyword Search
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchShip = d.shipName.toLowerCase().includes(kw);
        const matchLoc = d.location.toLowerCase().includes(kw);
        const matchDesc = (d.defectDescription || '').toLowerCase().includes(kw);
        const matchWs = (d.workshop || '').toLowerCase().includes(kw) || (d.workshopCode || '').toLowerCase().includes(kw);
        if (!matchShip && !matchLoc && !matchDesc && !matchWs) return false;
      }

      return true;
    });
  }, [defects, isWorkshopUser, authSession, filterWorkshop, filterShip, searchKeyword]);

  const handleOpenSolveModal = (defect: Defect) => {
    setSolvingDefect(defect);
    setSolutionDate(new Date().toISOString().split('T')[0]);
    setSolutionDesc('');
    setSolutionImage('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Photo size must be less than 10MB.');
      return;
    }

    try {
      const { url } = await supabaseService.uploadMediaToStorage(file, 'solutions');
      setSolutionImage(url);
    } catch {
      const reader = new FileReader();
      reader.onload = () => setSolutionImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteSolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solvingDefect) return;

    if (!solutionDesc.trim()) {
      alert('Please enter action taken/remedial details.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateStatus(
        solvingDefect.id,
        solutionDate || new Date().toISOString().split('T')[0],
        solutionDesc,
        solutionImage || undefined
      );

      setToastMessage(`Job for ${solvingDefect.shipName} successfully marked as Solved.`);
      setTimeout(() => setToastMessage(null), 4000);
      setSolvingDefect(null);
    } catch (err: any) {
      alert('Failed to update defect: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="in-progress-jobs-view" className="w-full max-w-7xl mx-auto space-y-6 text-slate-800 pb-8">
      
      {/* Toast */}
      {toastMessage && (
        <div className="p-4 rounded-xl flex items-center gap-3 border shadow-sm bg-emerald-50 text-emerald-800 border-emerald-200 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner - Bangladesh Naval Green (#006A4E) & Cream (#FFFDD0) Design */}
      <div className="bg-gradient-to-r from-[#006A4E] via-[#355E3B] to-[#006A4E] text-[#FFFDD0] border-2 border-[#FFFDD0]/60 p-5 sm:p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        {/* Decorative naval anchor watermark */}
        <div className="absolute right-3 -bottom-6 opacity-10 pointer-events-none text-[#FFFDD0]">
          <Anchor className="h-44 w-44" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-md text-[11px] font-bold bg-[#FFFDD0] text-[#006A4E] font-mono tracking-wider shadow-xs flex items-center gap-1.5">
              <Hourglass className="h-3.5 w-3.5 text-[#006A4E]" />
              <span>চলমান কার্যাবলী • ACTIVE WORK ORDERS</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#004d38]/80 text-[#FFFDD0] border border-[#FFFDD0]/40 font-mono shadow-xs">
              BND FLEET MAINTENANCE
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-algerian flex items-center gap-2.5 text-[#FFFDD0] tracking-wider">
            <div className="p-2 rounded-xl bg-[#FFFDD0] text-[#006A4E] shadow-xs">
              <Wrench className="h-5 w-5 text-[#006A4E]" />
            </div>
            <span>ইন প্রোগ্রেস জবস • IN PROGRESS JOBS</span>
          </h2>

          <p className="text-[#FFFDD0]/90 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed font-medium">
            চলমান ত্রুটিসমূহ যা বর্তমানে মেরামতাধীন। সমাধান বিবরণী প্রদান করে সফলভাবে কাজ সম্পন্ন ও আর্কাইভ করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
          <div className="bg-[#FFFDD0] text-[#006A4E] border-2 border-[#FFFDD0] px-4 py-2 rounded-xl text-center shadow-xs">
            <span className="text-[10px] text-[#006A4E]/80 font-bold uppercase tracking-wider block font-mono">খোলা কাজ • Open Jobs</span>
            <span className="text-xl font-black text-[#006A4E] font-mono">
              {inProgressDefects.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onNavigateToEntry}
            className="bg-[#FFFDD0] hover:bg-[#F3EFBA] text-[#006A4E] font-bold px-4 py-2.5 rounded-xl text-xs font-algerian tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xs border-2 border-[#FFFDD0] active:scale-95"
          >
            <PlusCircle className="h-4 w-4 text-[#006A4E]" />
            <span>নতুন ডিফেক্ট এন্ট্রি • New Entry</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar - Bangladesh Naval Green (#006A4E) & Cream Theme */}
      <div className="bg-white/95 border-2 border-[#006A4E]/30 hover:border-[#006A4E]/70 p-4 sm:p-5 rounded-2xl shadow-sm transition-all">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          
          {/* Keyword Search */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-slate-500" />
              <span>SEARCH DEFECTS</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Ship, location or description..."
                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 focus:border-slate-500 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 outline-none"
              />
              {searchKeyword && (
                <button 
                  type="button" 
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Ship Filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Ship className="h-3.5 w-3.5 text-slate-500" />
              <span>WARSHIP</span>
            </label>
            <select
              value={filterShip}
              onChange={(e) => setFilterShip(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-slate-500 rounded-lg text-xs text-slate-800 outline-none cursor-pointer"
            >
              <option value="all">All Warships ({ships.length})</option>
              {ships.map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Workshop Filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-slate-500" />
              <span>WORKSHOP</span>
            </label>
            {isWorkshopUser ? (
              <div className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs text-slate-800 font-medium flex items-center justify-between">
                <span className="truncate">{authSession?.workshopCode} — {authSession?.workshopNameEn}</span>
                <span className="text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">Locked</span>
              </div>
            ) : (
              <select
                value={filterWorkshop}
                onChange={(e) => setFilterWorkshop(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-slate-500 rounded-lg text-xs text-slate-800 outline-none cursor-pointer"
              >
                <option value="all">All Workshops ({workshops.length})</option>
                {workshops.map(ws => (
                  <option key={ws.id} value={ws.code}>
                    {ws.code} — {ws.nameEn}
                  </option>
                ))}
              </select>
            )}
          </div>

        </div>
      </div>

      {/* Main List of In-Progress Defects */}
      {inProgressDefects.length === 0 ? (
        <div className="bg-white border border-slate-200 p-10 sm:p-14 rounded-2xl text-center shadow-sm space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              No In-Progress Defects
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              There are currently no open unresolved defects matching this filter.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onNavigateToEntry}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Enter New Defect
            </button>
            {onNavigateToFind && (
              <button
                type="button"
                onClick={onNavigateToFind}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors border border-slate-300"
              >
                View Solved Defects
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {inProgressDefects.map((defect) => (
            <div 
              key={defect.id}
              className="bg-white/95 border-2 border-[#006A4E]/25 hover:border-[#006A4E]/70 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all relative overflow-hidden text-[#1B331F]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 border-b-2 border-[#006A4E]/15 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/10 text-rose-700 border border-rose-300">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                      <span>IN PROGRESS</span>
                    </span>
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{defect.defectDate}</span>
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-[#006A4E] text-[#FFFDD0] text-[11px] font-mono font-bold border border-[#FFFDD0]/30 shadow-xs">
                    {defect.workshop || defect.workshopCode || 'WS-01'}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-[#006A4E] flex items-center gap-2 font-algerian tracking-wide">
                    <Ship className="h-4.5 w-4.5 text-[#006A4E] shrink-0" />
                    <span>{defect.shipName}</span>
                  </h4>
                  <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{defect.location}</span>
                  </p>
                </div>

                <div className="p-3.5 bg-[#006A4E]/5 border border-[#006A4E]/20 rounded-xl text-xs text-[#1B331F] leading-relaxed">
                  <span className="text-[10px] font-bold text-[#006A4E] uppercase tracking-wider block mb-1">
                    DEFECT DESCRIPTION:
                  </span>
                  <p className="break-words font-medium">
                    {defect.defectDescription || 'No description provided.'}
                  </p>
                </div>

                {defect.defectImage && (
                  <div className="flex items-center gap-3 pt-1">
                    <div 
                      onClick={() => setPreviewImage(defect.defectImage)}
                      className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-300 shadow-xs cursor-pointer group shrink-0 hover:border-amber-400 transition-colors"
                    >
                      <img src={defect.defectImage} alt="Defect" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Maximize2 className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-800 block">Defect Photo Attached</span>
                      <span className="text-[11px]">Click thumbnail to enlarge</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button: ADD SOLUTION */}
              <div className="pt-3 border-t-2 border-[#006A4E]/15 flex items-center justify-between gap-3">
                <span className="text-[11px] text-[#006A4E]/80 font-mono font-medium">
                  REF: {defect.id.slice(-6)}
                </span>
                
                <button
                  type="button"
                  onClick={() => handleOpenSolveModal(defect)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#006A4E] to-[#004e39] hover:from-[#005740] hover:to-[#00402e] text-[#FFFDD0] border-2 border-[#FFFDD0]/60 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer font-algerian tracking-wider"
                >
                  <Wrench className="h-3.5 w-3.5 text-[#FFFDD0]" />
                  <span>Solve Job</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal: Solve Defect Form */}
      {solvingDefect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Complete Defect Remedial Action
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSolvingDefect(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
              <div className="font-semibold text-slate-900">{solvingDefect.shipName} • {solvingDefect.location}</div>
              <div className="text-slate-600 truncate">{solvingDefect.defectDescription}</div>
            </div>

            <form onSubmit={handleCompleteSolve} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  SOLUTION DATE *
                </label>
                <div className="relative">
                  <input
                    ref={solutionDateInputRef}
                    type="date"
                    value={solutionDate}
                    onChange={(e) => setSolutionDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch {}
                    }}
                    required
                    className="w-full pl-3 pr-10 py-2 bg-white border border-slate-300 focus:border-slate-500 rounded-lg text-xs text-slate-800 outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                  />
                  <button
                    type="button"
                    onClick={() => safeOpenDatePicker(solutionDateInputRef.current)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#006A4E] cursor-pointer transition-colors"
                    title="ক্যালেন্ডার ওপেন করুন"
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  ACTION TAKEN / REMEDIAL DESCRIPTION *
                </label>
                <textarea
                  rows={3}
                  value={solutionDesc}
                  onChange={(e) => setSolutionDesc(e.target.value)}
                  placeholder="Describe repair actions taken, replaced components, tests..."
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-slate-500 rounded-lg text-xs text-slate-800 outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  AFTER REPAIR PHOTO (OPTIONAL)
                </label>
                {solutionImage ? (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-300 bg-white">
                    <img src={solutionImage} alt="Solution" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setSolutionImage('')}
                      className="absolute top-2 right-2 p-1 bg-slate-900/80 text-white rounded-md hover:bg-slate-900"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg cursor-pointer bg-slate-50 transition-colors">
                      <Upload className="h-4 w-4 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-600 font-medium">Click to upload photo</span>
                      <span className="text-[10px] text-slate-400">PNG, JPG up to 10MB</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-slate-400" />
                        <span>Presets:</span>
                      </span>
                      {PRESET_SOLUTION_PHOTOS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSolutionImage(p.url)}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] text-slate-700 transition-colors cursor-pointer"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSolvingDefect(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  <span>{isSubmitting ? 'Saving...' : 'Mark as Solved'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[80vh] rounded-xl overflow-hidden border border-slate-700 bg-black shadow-2xl">
            <img src={previewImage} alt="Defect Preview" className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
