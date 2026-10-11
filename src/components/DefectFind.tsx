import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, 
  RefreshCw, 
  RotateCcw,
  Loader2,
  Ship, 
  MapPin, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  X,
  Anchor
} from 'lucide-react';
import { Workshop, Defect, AuthSession } from '../types';

interface DefectFindProps {
  ships: string[];
  locations: string[];
  workshops?: Workshop[];
  defects?: Defect[];
  authSession?: AuthSession | null;
  onSearchSubmit?: (shipName: string, location: string, fromDate: string, toDate: string, workshop?: string) => void;
}

export default function DefectFind({ 
  ships, 
  locations, 
  workshops = [], 
  defects = [],
  authSession,
  onSearchSubmit 
}: DefectFindProps) {
  const isWorkshopUser = authSession?.role === 'workshop_user' && !!authSession.workshopCode && authSession.workshopCode !== 'HQ' && authSession.workshopCode !== 'HQ-ADMIN';

  const fromDateInputRef = useRef<HTMLInputElement>(null);
  const toDateInputRef = useRef<HTMLInputElement>(null);

  const safeOpenDatePicker = (input: HTMLInputElement | null) => {
    if (!input) return;
    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker();
        return;
      }
    } catch {
      // showPicker() can throw SecurityError in cross-origin iframes
    }
    input.focus();
    try {
      input.click();
    } catch {}
  };

  const [filterWorkshop, setFilterWorkshop] = useState<string>(
    isWorkshopUser && authSession?.workshopCode ? authSession.workshopCode : ''
  );
  const [filterShip, setFilterShip] = useState<string>('');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Search execution state (records are NOT shown initially until user executes search)
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchedDefects, setSearchedDefects] = useState<Defect[]>([]);

  const executeFilterQuery = (customShip = filterShip, customLoc = filterLocation, customFrom = fromDate, customTo = toDate, customWs = filterWorkshop) => {
    return defects.filter(d => {
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
      } else if (customWs) {
        const matchWs = (d.workshopCode && d.workshopCode.toLowerCase().includes(customWs.toLowerCase())) ||
                        (d.workshop && d.workshop.toLowerCase().includes(customWs.toLowerCase()));
        if (!matchWs) return false;
      }

      if (customShip && d.shipName !== customShip) return false;
      if (customLoc && d.location !== customLoc) return false;
      if (customFrom && d.defectDate < customFrom) return false;
      if (customTo && d.defectDate > customTo) return false;
      return true;
    });
  };

  const handleReset = () => {
    const defaultWs = isWorkshopUser && authSession?.workshopCode ? authSession.workshopCode : '';
    setFilterWorkshop(defaultWs);
    setFilterShip('');
    setFilterLocation('');
    setFromDate('');
    setToDate('');
    setHasSearched(false);
    setSearchedDefects([]);
    if (onSearchSubmit) {
      onSearchSubmit('', '', '', '', defaultWs);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    
    // Simulate brief reactive fetch from current database state
    setTimeout(() => {
      const results = executeFilterQuery();
      setSearchedDefects(results);
      setHasSearched(true);
      setIsSearching(false);

      if (onSearchSubmit) {
        onSearchSubmit(filterShip, filterLocation, fromDate, toDate, filterWorkshop);
      }
    }, 200);
  };

  const handleShowAll = () => {
    setIsSearching(true);
    setTimeout(() => {
      const results = executeFilterQuery('', '', '', '', isWorkshopUser && authSession?.workshopCode ? authSession.workshopCode : '');
      setSearchedDefects(results);
      setHasSearched(true);
      setIsSearching(false);
    }, 200);
  };

  return (
    <div id="defect-find-panel" className="w-full max-w-7xl mx-auto space-y-6 text-slate-800 pb-8">
      
      {/* Search Header Banner - Bangladesh Naval Green (#006A4E) & Cream (#FFFDD0) Design */}
      <div className="bg-gradient-to-r from-[#006A4E] via-[#355E3B] to-[#006A4E] text-[#FFFDD0] border-2 border-[#FFFDD0]/60 p-5 sm:p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        {/* Decorative naval anchor watermark */}
        <div className="absolute right-3 -bottom-6 opacity-10 pointer-events-none text-[#FFFDD0]">
          <Anchor className="h-44 w-44" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-md text-[11px] font-bold bg-[#FFFDD0] text-[#006A4E] font-mono tracking-wider shadow-xs flex items-center gap-1.5">
              <span>⚓ DEFECT SEARCH ENGINE</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#004d38]/80 text-[#FFFDD0] border border-[#FFFDD0]/40 font-mono shadow-xs">
              BND QUERY FILTER
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-algerian flex items-center gap-2.5 text-[#FFFDD0] tracking-wider">
            <div className="p-2 rounded-xl bg-[#FFFDD0] text-[#006A4E] shadow-xs">
              <Search className="h-5 w-5 text-[#006A4E]" />
            </div>
            <span>ডিফেক্ট সার্চ ও অনুসন্ধান • DEFECT QUERY SYSTEM</span>
          </h2>

          <p className="text-[#FFFDD0]/90 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed font-medium">
            ওয়ার্কশপ, যুদ্ধজাহাজের নাম, কম্পার্টমেন্ট বা তারিখ অনুযায়ী পূর্বে সংরক্ষিত সকল ডিফেক্ট দ্রুত খুঁজে বের করুন।
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="bg-[#FFFDD0] hover:bg-[#F3EFBA] text-[#006A4E] border-2 border-[#FFFDD0] font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 relative z-10 shadow-xs active:scale-95"
        >
          <RefreshCw className="h-3.5 w-3.5 text-[#006A4E]" />
          <span>রিসেট ফিল্টার • Reset Filters</span>
        </button>
      </div>

      {/* Filter Form Card - Bangladesh Naval Green (#006A4E) & Cream Theme */}
      <div className="w-full">
        <form onSubmit={handleSearchSubmit} className="bg-white/95 border-2 border-[#006A4E]/30 hover:border-[#006A4E]/70 p-6 sm:p-8 rounded-2xl shadow-sm space-y-5 text-[#1B331F] transition-all">
          
          <div className="border-b-2 border-[#006A4E]/20 pb-3 flex items-center justify-between">
            <h3 className="text-[#006A4E] font-bold text-xs uppercase flex items-center gap-1.5 tracking-wide">
              <Search className="h-3.5 w-3.5 text-[#006A4E]" />
              <span>Search Criteria & Query Parameters</span>
            </h3>
            <span className="text-xs text-[#006A4E] font-mono font-semibold">
              {hasSearched ? `Found: ${searchedDefects.length} records` : `Total in DB: ${defects.length}`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Workshop Selection */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-500" />
                <span>{isWorkshopUser ? 'ASSIGNED SHOP' : 'WORKSHOP'}</span>
              </label>
              {isWorkshopUser ? (
                <div className="w-full border border-slate-300 bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium flex items-center justify-between">
                  <span className="truncate">
                    <span className="px-1.5 py-0.5 bg-slate-200 text-slate-800 font-mono text-[10px] rounded font-bold mr-2">
                      {authSession?.workshopCode}
                    </span>
                    {authSession?.workshopNameEn}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                    LOCKED
                  </span>
                </div>
              ) : (
                <select
                  id="workshop-filter-select"
                  value={filterWorkshop}
                  onChange={(e) => setFilterWorkshop(e.target.value)}
                  className="w-full border border-slate-300 bg-white rounded-xl px-3.5 py-2.5 focus:border-slate-500 outline-none text-xs text-slate-800 cursor-pointer"
                >
                  <option value="">All Workshops ({workshops.length})</option>
                  {workshops.map((ws) => (
                    <option key={ws.id} value={ws.nameEn}>
                      {ws.code}: {ws.nameEn}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Warship Selection Dropdown */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase flex items-center gap-1.5">
                <Ship className="h-3.5 w-3.5 text-slate-500" />
                <span>WARSHIP NAME</span>
              </label>
              <select
                id="ship-filter-select"
                value={filterShip}
                onChange={(e) => setFilterShip(e.target.value)}
                className="w-full border border-slate-300 bg-white rounded-xl px-3.5 py-2.5 focus:border-slate-500 outline-none text-xs text-slate-800 cursor-pointer"
              >
                <option value="">All Warships ({ships.length})</option>
                {ships.map((ship, idx) => (
                  <option key={idx} value={ship}>{ship}</option>
                ))}
              </select>
            </div>

            {/* Compartment Selection Dropdown */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                <span>COMPARTMENT LOCATION</span>
              </label>
              <select
                id="location-filter-select"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full border border-slate-300 bg-white rounded-xl px-3.5 py-2.5 focus:border-slate-500 outline-none text-xs text-slate-800 cursor-pointer"
              >
                <option value="">All Compartments ({locations.length})</option>
                {locations.map((loc, idx) => (
                  <option key={idx} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Date Range Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span>FROM DEFECT DATE</span>
              </label>
              <div className="relative">
                <input
                  ref={fromDateInputRef}
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker?.();
                    } catch {}
                  }}
                  className="w-full border border-slate-300 bg-white rounded-xl pl-3.5 pr-10 py-2.5 focus:border-[#006A4E] outline-none text-xs text-slate-800 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                />
                <button
                  type="button"
                  onClick={() => safeOpenDatePicker(fromDateInputRef.current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#006A4E] cursor-pointer transition-colors"
                  title="ক্যালেন্ডার ওপেন করুন"
                >
                  <Calendar className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span>TO DEFECT DATE</span>
              </label>
              <div className="relative">
                <input
                  ref={toDateInputRef}
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker?.();
                    } catch {}
                  }}
                  className="w-full border border-slate-300 bg-white rounded-xl pl-3.5 pr-10 py-2.5 focus:border-[#006A4E] outline-none text-xs text-slate-800 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                />
                <button
                  type="button"
                  onClick={() => safeOpenDatePicker(toDateInputRef.current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#006A4E] cursor-pointer transition-colors"
                  title="ক্যালেন্ডার ওপেন করুন"
                >
                  <Calendar className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Button: Filters in-place */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>ডাটাবেজ থেকে নির্দিষ্ট ডিফেক্ট রেকর্ড অনুসন্ধান করুন</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>রিসেট (Reset)</span>
              </button>

              <button
                id="find-defect-submit-btn"
                type="submit"
                disabled={isSearching}
                className="flex-1 sm:flex-none bg-gradient-to-r from-[#006A4E] to-[#004e39] hover:from-[#005740] hover:to-[#00402e] text-[#FFFDD0] font-bold border-2 border-[#FFFDD0]/60 py-2.5 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-xs font-algerian uppercase tracking-wider disabled:opacity-50"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#FFFDD0]" />
                ) : (
                  <Search className="h-4 w-4 text-[#FFFDD0]" />
                )}
                <span>{isSearching ? 'অনুসন্ধান হচ্ছে...' : 'সার্চ করুন (Search Defects)'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Defect Records Results Section - Only shows after user searches */}
      {!hasSearched ? (
        <div className="bg-white/95 border-2 border-[#006A4E]/30 rounded-2xl p-8 sm:p-12 text-center shadow-sm">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#006A4E]/10 border-2 border-[#006A4E]/30 flex items-center justify-center mx-auto text-[#006A4E] shadow-inner">
              <Search className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 font-algerian">
                DATABASE DEFECT RECORD QUERY
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                ডিফেক্ট রেকর্ড ডাটাবেজে জমা রয়েছে। জাহাজ, লোকেশন, ওয়ার্কশপ বা নির্দিষ্ট তারিখ নির্বাচন করে উপরের <strong className="text-[#006A4E]">"সার্চ করুন (Search Defects)"</strong> বোতামে চাপুন।
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleShowAll}
                className="px-5 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#004e39] hover:from-[#005740] hover:to-[#00402e] text-[#FFFDD0] rounded-xl text-xs font-bold border-2 border-[#FFFDD0]/60 shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Search className="h-3.5 w-3.5" />
                <span>সকল ডিফেক্ট রেকর্ড প্রদর্শন করুন (View All {defects.length})</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Filtered Results Table */
        <div className="bg-white/95 border-2 border-[#006A4E]/30 hover:border-[#006A4E]/70 p-5 sm:p-6 rounded-2xl shadow-sm text-[#1B331F] space-y-4 transition-all animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#006A4E]/20 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#006A4E] uppercase tracking-wide flex items-center gap-2 font-algerian">
                <span>অনুসন্ধান ফলাফল (Found: {searchedDefects.length})</span>
              </h3>
              <span className="text-xs text-[#006A4E] font-mono font-semibold">
                {searchedDefects.filter(d => d.status === 'Solved').length} Solved • {searchedDefects.filter(d => d.status === 'Pending').length} Pending
              </span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors self-start sm:self-auto"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>নতুন সার্চ / রিসেট</span>
            </button>
          </div>

          {searchedDefects.length === 0 ? (
            <div className="p-10 text-center text-slate-400 space-y-2">
              <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
              <p className="text-sm font-bold text-slate-700">নির্বাচিত তথ্যের সাথে কোনো ডিফেক্ট রেকর্ড মেলেনি।</p>
              <p className="text-xs text-slate-500">অনুগ্রহ করে ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন অথবা উপরের "রিসেট" বাটনে ক্লিক করুন।</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#006A4E]/30">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#FFFDD0]/60 bg-[#006A4E] text-[#FFFDD0] uppercase text-[11px] font-algerian tracking-wider">
                    <th className="p-3.5 font-bold">Status</th>
                    <th className="p-3.5 font-bold">Ship Name</th>
                    <th className="p-3.5 font-bold">Location</th>
                    <th className="p-3.5 font-bold">Workshop</th>
                    <th className="p-3.5 font-bold">Defect Date</th>
                    <th className="p-3.5 font-bold">Defect Description</th>
                    <th className="p-3.5 font-bold">Photos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {searchedDefects.map((defect) => (
                    <tr key={defect.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                          defect.status === 'Solved' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {defect.status === 'Solved' ? (
                            <><CheckCircle2 className="h-3 w-3" /> Solved</>
                          ) : (
                            <><AlertCircle className="h-3 w-3" /> Pending</>
                          )}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">{defect.shipName}</td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">{defect.location}</td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">{defect.workshop || defect.workshopCode || 'WS-01'}</td>
                      <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{defect.defectDate}</td>
                      <td className="p-3 text-slate-700 min-w-[200px] max-w-md break-words">{defect.defectDescription}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {defect.defectImage && (
                            <button 
                              type="button"
                              onClick={() => setSelectedImage(defect.defectImage)}
                              className="w-7 h-7 rounded-md overflow-hidden border border-slate-300 hover:border-slate-500 transition-colors cursor-pointer"
                              title="View Defect Photo"
                            >
                              <img src={defect.defectImage} alt="Defect" className="w-full h-full object-cover" />
                            </button>
                          )}
                          {defect.solutionImage && (
                            <button 
                              type="button"
                              onClick={() => setSelectedImage(defect.solutionImage)}
                              className="w-7 h-7 rounded-md overflow-hidden border border-emerald-300 hover:border-emerald-500 transition-colors cursor-pointer"
                              title="View Solution Photo"
                            >
                              <img src={defect.solutionImage} alt="Solution" className="w-full h-full object-cover" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white p-2 rounded-xl border border-slate-300 shadow-2xl overflow-hidden">
            <img 
              src={selectedImage} 
              alt="Inspection" 
              className="max-h-[80vh] w-auto object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
