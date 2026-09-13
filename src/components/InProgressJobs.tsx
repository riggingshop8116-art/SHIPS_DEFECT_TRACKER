import React, { useState, useMemo } from 'react';
import { 
  Hourglass, 
  Search, 
  Wrench, 
  Ship, 
  MapPin, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  X, 
  Sparkles, 
  Image as ImageIcon,
  ArrowRight,
  PlusCircle,
  FileCheck2,
  Maximize2
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
  // Search and filter state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterShip, setFilterShip] = useState('');
  const [filterWorkshop, setFilterWorkshop] = useState(
    authSession?.role === 'workshop_user' && authSession.workshopCode && authSession.workshopCode !== 'HQ' && authSession.workshopCode !== 'HQ-ADMIN'
      ? authSession.workshopCode
      : 'all'
  );

  // Active Defect being solved
  const [solvingDefect, setSolvingDefect] = useState<Defect | null>(null);
  const [solutionDate, setSolutionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [solutionDesc, setSolutionDesc] = useState<string>('');
  const [solutionImage, setSolutionImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Success Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick preset solution photos for convenience
  const PRESET_SOLUTION_PHOTOS = [
    {
      name: 'Engine Overhauled',
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop&q=60'
    },
    {
      name: 'Generator Repaired',
      url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&auto=format&fit=crop&q=60'
    },
    {
      name: 'Pipe Sealed',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=60'
    }
  ];

  // In-progress defects (ONLY pending / unsolved defects)
  const inProgressDefects = useMemo(() => {
    return defects.filter(d => {
      // Must NOT be solved
      if (d.status === 'Solved') return false;

      // Workshop filter
      if (filterWorkshop !== 'all') {
        const matchWs = (d.workshopCode && d.workshopCode === filterWorkshop) ||
                        (d.workshop && d.workshop.toLowerCase().includes(filterWorkshop.toLowerCase()));
        if (!matchWs) return false;
      }

      // Ship filter
      if (filterShip && d.shipName !== filterShip) return false;

      // Search keyword filter
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        const inShip = d.shipName?.toLowerCase().includes(q);
        const inLoc = d.location?.toLowerCase().includes(q);
        const inDesc = d.defectDescription?.toLowerCase().includes(q);
        const inWs = d.workshop?.toLowerCase().includes(q) || d.workshopCode?.toLowerCase().includes(q);
        if (!inShip && !inLoc && !inDesc && !inWs) return false;
      }

      return true;
    });
  }, [defects, filterWorkshop, filterShip, searchKeyword]);

  // Handle opening solution modal
  const handleOpenSolveModal = (defect: Defect) => {
    setSolvingDefect(defect);
    setSolutionDate(new Date().toISOString().split('T')[0]);
    setSolutionDesc('');
    setSolutionImage('');
  };

  // Handle image upload from file to Supabase Storage with fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be under 5MB');
        return;
      }
      try {
        const { url } = await supabaseService.uploadMediaToStorage(file, 'solutions');
        setSolutionImage(url);
      } catch (err) {
        console.error('Solution image upload error:', err);
      }
    }
  };

  // Submit resolution
  const handleConfirmSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solvingDefect) return;

    setIsSubmitting(true);

    const desc = solutionDesc.trim() || 'ডিফেক্টটির প্রয়োজনীয় মেরামত ও পরীক্ষণ সম্পন্ন হয়েছে এবং তা স্বাভাবিকভাবে কার্যক্ষম।';
    const date = solutionDate || new Date().toISOString().split('T')[0];

    onUpdateStatus(solvingDefect.id, date, desc, solutionImage);

    setIsSubmitting(false);
    setSolvingDefect(null);

    // Show confirmation toast
    setToastMessage(`✅ ${solvingDefect.shipName} (${solvingDefect.location}) এর সমাধান সফলভাবে সংরক্ষণ করা হয়েছে এবং ইন প্রগ্রেস তালিকা থেকে সরানো হয়েছে!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return (
    <div id="in-progress-jobs-panel" className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-[#001738] border-2 border-emerald-400 text-emerald-300 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold font-sans">{toastMessage}</span>
          <button 
            type="button" 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-[#001738]/95 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border-l-8 border-amber-400 border border-amber-500/35 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-algerian font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase flex items-center gap-1">
              <Hourglass className="h-3 w-3 text-amber-400 animate-spin-slow" />
              <span>ACTIVE UNRESOLVED WORK ORDERS</span>
            </span>
            <span className="text-amber-400 text-xs">•</span>
            <span className="text-xs text-amber-200/90 font-mono">BND FLEET MAINTENANCE</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-algerian font-extrabold flex items-center gap-3 text-white uppercase tracking-wider">
            <Wrench className="h-7 w-7 text-amber-400" />
            <span>IN PROGRESS JOBS (ইন প্রগ্রেস জব)</span>
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm mt-1">
            যে ডিফেক্টগুলো এন্ট্রি করা হয়েছে কিন্তু এখনো সমাধান করা হয়নি তা এখানে তালিকাভুক্ত রয়েছে। সমাধান যুক্ত করার সাথে সাথে ডিফেক্টটি এই তালিকা থেকে অপসারিত হয়ে আর্কাইভে যুক্ত হবে।
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-amber-500/20 border border-amber-400/50 px-4 py-2 rounded-2xl text-center shadow-md">
            <span className="text-xs text-amber-200 font-mono block">চলমান কাজ</span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {inProgressDefects.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onNavigateToEntry}
            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#001733] font-algerian font-bold px-4 py-3 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 shrink-0 uppercase tracking-wider"
          >
            <PlusCircle className="h-4 w-4 text-[#001733]" />
            <span>NEW DEFECT ENTRY</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#001738]/95 backdrop-blur-xl p-5 sm:p-6 rounded-3xl shadow-xl border border-amber-500/30 text-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          
          {/* Keyword Search */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-amber-400" />
              <span>SEARCH DEFECTS</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="জাহাজ, অবস্থান বা ডিফেক্ট বিবরণ..."
                className="w-full pl-3 pr-8 py-2.5 bg-black/40 border border-white/20 focus:border-amber-400 rounded-xl text-xs text-white placeholder:text-slate-400 outline-none transition-colors"
              />
              {searchKeyword && (
                <button 
                  type="button" 
                  onClick={() => setSearchKeyword('')} 
                  className="absolute right-2.5 top-3 text-slate-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter by Warship */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1.5">
              <Ship className="h-3.5 w-3.5 text-amber-400" />
              <span>FILTER BY WARSHIP</span>
            </label>
            <select
              value={filterShip}
              onChange={(e) => setFilterShip(e.target.value)}
              className="w-full px-3 py-2.5 bg-black/40 border border-white/20 focus:border-amber-400 rounded-xl text-xs text-white outline-none cursor-pointer"
            >
              <option value="" className="bg-[#001738] text-white">All Warships (সকল জাহাজ)</option>
              {ships.map(s => (
                <option key={s} value={s} className="bg-[#001738] text-white">{s}</option>
              ))}
            </select>
          </div>

          {/* Filter by Workshop */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-amber-400" />
              <span>FILTER BY WORKSHOP</span>
            </label>
            <select
              value={filterWorkshop}
              onChange={(e) => setFilterWorkshop(e.target.value)}
              className="w-full px-3 py-2.5 bg-black/40 border border-white/20 focus:border-amber-400 rounded-xl text-xs text-white outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#001738] text-white">All Workshops (সকল শপ)</option>
              {workshops.map(ws => (
                <option key={ws.id} value={ws.code} className="bg-[#001738] text-white">
                  {ws.code} — {ws.nameEn} ({ws.nameBn})
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main List of In-Progress Defects */}
      {inProgressDefects.length === 0 ? (
        /* Empty State */
        <div className="bg-[#001738]/95 backdrop-blur-xl p-12 sm:p-16 rounded-3xl border border-amber-500/30 text-center shadow-2xl space-y-4 text-white">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-xl">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-black font-algerian text-amber-300 tracking-wider uppercase">
              NO IN PROGRESS DEFECTS
            </h3>
            <p className="text-sm text-slate-300 font-sans">
              বর্তমানে কোনো অমীমাংসিত ডিফেক্ট নেই! সকল এন্ট্রি করা ডিফেক্টের সমাধান সফলভাবে সম্পন্ন হয়েছে।
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onNavigateToEntry}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-[#001733] font-algerian font-bold text-xs uppercase shadow-md hover:from-amber-300 hover:to-amber-400 transition-all cursor-pointer"
            >
              Enter New Defect
            </button>
            {onNavigateToFind && (
              <button
                type="button"
                onClick={onNavigateToFind}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-algerian font-bold text-xs uppercase shadow-md transition-all cursor-pointer"
              >
                View Solved Defects
              </button>
            )}
          </div>
        </div>
      ) : (
        /* In Progress Defects Cards */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {inProgressDefects.map((defect) => (
            <div 
              key={defect.id}
              className="bg-[#001738]/95 backdrop-blur-xl border border-amber-500/35 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4 text-white hover:border-amber-400 transition-all group"
            >
              {/* Card Header */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                      <span>IN PROGRESS</span>
                    </span>
                    <span className="text-xs text-amber-300/80 font-mono flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-amber-400" />
                      <span>{defect.defectDate}</span>
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-400/40 text-cyan-200 text-xs font-mono font-bold">
                    {defect.workshop || defect.workshopCode || 'WS-01'}
                  </span>
                </div>

                {/* Ship & Location */}
                <div>
                  <h4 className="text-lg sm:text-xl font-algerian font-bold text-white flex items-center gap-2 group-hover:text-amber-300 transition-colors">
                    <Ship className="h-5 w-5 text-amber-400 shrink-0" />
                    <span>{defect.shipName}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-cyan-200 font-medium flex items-center gap-1.5 mt-1">
                    <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>{defect.location}</span>
                  </p>
                </div>

                {/* Defect Description */}
                <div className="p-3 bg-black/40 border border-white/10 rounded-2xl text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <span className="text-[11px] font-bold text-amber-400 uppercase block mb-1">
                    ডিফেক্ট বিবরণ (Defect Description):
                  </span>
                  <p className="line-clamp-3">
                    {defect.defectDescription || 'কোনো লিখিত বিবরণ নেই।'}
                  </p>
                </div>

                {/* Defect Photo thumbnail if present */}
                {defect.defectImage && (
                  <div className="flex items-center gap-3 pt-1">
                    <div 
                      onClick={() => setPreviewImage(defect.defectImage)}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-rose-400/60 shadow-md cursor-pointer group/img shrink-0"
                      title="Click to view defect photo"
                    >
                      <img src={defect.defectImage} alt="Defect" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                        <Maximize2 className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="text-xs text-slate-300">
                      <span className="font-bold text-rose-300 block">ডিফেক্টের ছবি সংযুক্ত আছে</span>
                      <span className="text-[11px] text-slate-400">ক্লিক করে বড় করে দেখুন</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button: ADD SOLUTION */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 font-mono">
                  আইডি: {defect.id.slice(-8)}
                </span>
                
                <button
                  type="button"
                  onClick={() => handleOpenSolveModal(defect)}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-algerian font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Wrench className="h-4 w-4 text-amber-300" />
                  <span>সমাধান যোগ করুন (ADD SOLUTION)</span>
                  <ArrowRight className="h-3.5 w-3.5 text-white" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          SOLUTION INPUT MODAL (সমাধান যোগ করার ডায়ালগ বক্স)
      ========================================================================= */}
      {solvingDefect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#00142e]/98 backdrop-blur-2xl border-2 border-amber-400/60 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,10,35,0.95)] text-white relative overflow-hidden max-h-[92vh] overflow-y-auto">
            
            {/* Top Navy-Gold Line Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400"></div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSolvingDefect(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-amber-400 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg shrink-0">
                <FileCheck2 className="h-6 w-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-algerian font-bold text-amber-300 uppercase tracking-wide">
                  ADD DEFECT SOLUTION
                </h3>
                <p className="text-xs text-slate-300 font-sans">
                  ডিফেক্টের সমাধান ও গৃহীত পদক্ষেপ লিপিবদ্ধ করুন
                </p>
              </div>
            </div>

            {/* Defect Context Summary */}
            <div className="p-3.5 bg-black/50 border border-white/10 rounded-2xl mb-4 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Ship className="h-3.5 w-3.5 text-amber-400" />
                  <span>{solvingDefect.shipName}</span>
                </span>
                <span className="text-cyan-300 font-mono">{solvingDefect.defectDate}</span>
              </div>
              <div className="text-slate-300 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-cyan-400" />
                <span>স্থান: {solvingDefect.location}</span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-300/80">{solvingDefect.workshop}</span>
              </div>
            </div>

            {/* Solution Form */}
            <form onSubmit={handleConfirmSolution} className="space-y-4">
              
              {/* Solution Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  <span>সমাধানের তারিখ (Solution Date) *</span>
                </label>
                <input
                  type="date"
                  value={solutionDate}
                  onChange={(e) => setSolutionDate(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-[#000c1e] border border-white/20 focus:border-amber-400 rounded-xl text-xs font-mono text-white outline-none cursor-pointer"
                />
              </div>

              {/* Solution Description / Action Taken */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-amber-400" />
                  <span>গৃহীত পদক্ষেপ ও সমাধান বিবরণ (Action Taken) *</span>
                </label>
                <textarea
                  rows={3}
                  value={solutionDesc}
                  onChange={(e) => setSolutionDesc(e.target.value)}
                  placeholder="ডিফেক্টটির কী সমাধান করা হয়েছে এবং কী পার্টস পরিবর্তন/মেরামত করা হয়েছে তা সংক্ষেপে লিখুন..."
                  required
                  className="w-full px-3 py-2.5 bg-[#000c1e] border border-white/20 focus:border-amber-400 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Solution Photo Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
                  <span>সমাধান পরবর্তী ছবি (Solution Photo - ঐচ্ছিক)</span>
                </label>
                
                {solutionImage ? (
                  <div className="relative w-full h-36 rounded-2xl overflow-hidden border-2 border-emerald-400/70 shadow-md">
                    <img src={solutionImage} alt="Solution" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setSolutionImage('')}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-xl transition-colors cursor-pointer"
                      title="Remove Photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 hover:border-amber-400/60 rounded-2xl p-4 cursor-pointer bg-black/30 hover:bg-black/50 transition-all text-center">
                      <Upload className="h-6 w-6 text-amber-400 mb-1" />
                      <span className="text-xs font-bold text-white">ছবি আপলোড করতে ক্লিক করুন</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">JPG, PNG সর্বোচ্চ ৩MB</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                        className="hidden" 
                      />
                    </label>

                    {/* Quick Preset Photo Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        <span>বা ডেমো ছবি দিন:</span>
                      </span>
                      {PRESET_SOLUTION_PHOTOS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSolutionImage(p.url)}
                          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] text-amber-300 transition-colors cursor-pointer"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSolvingDefect(null)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel (বাতিল)
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-algerian font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <CheckCircle2 className="h-4 w-4 text-amber-300" />
                  <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'COMPLETE & SOLVE JOB'}</span>
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden border-2 border-amber-400 shadow-2xl">
            <img src={previewImage} alt="Defect Preview" className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black text-white rounded-full cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
