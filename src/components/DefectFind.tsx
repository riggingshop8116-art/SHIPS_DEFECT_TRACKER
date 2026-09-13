import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, 
  RefreshCw, 
  Ship, 
  MapPin, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';
import { Workshop, Defect } from '../types';

interface DefectFindProps {
  ships: string[];
  locations: string[];
  workshops?: Workshop[];
  defects?: Defect[];
  onSearchSubmit?: (shipName: string, location: string, fromDate: string, toDate: string, workshop?: string) => void;
}

export default function DefectFind({ 
  ships, 
  locations, 
  workshops = [], 
  defects = [],
  onSearchSubmit 
}: DefectFindProps) {
  const fromDateInputRef = useRef<HTMLInputElement>(null);
  const toDateInputRef = useRef<HTMLInputElement>(null);

  const [filterWorkshop, setFilterWorkshop] = useState<string>('');
  const [filterShip, setFilterShip] = useState<string>('');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Compute filtered defects directly in-page so user stays on Defect Find
  const filteredResults = useMemo(() => {
    return defects.filter(d => {
      if (filterWorkshop && d.workshop && !d.workshop.toLowerCase().includes(filterWorkshop.toLowerCase())) {
        return false;
      }
      if (filterShip && d.shipName !== filterShip) return false;
      if (filterLocation && d.location !== filterLocation) return false;
      if (fromDate && d.defectDate < fromDate) return false;
      if (toDate && d.defectDate > toDate) return false;
      return true;
    });
  }, [defects, filterWorkshop, filterShip, filterLocation, fromDate, toDate]);

  const handleReset = () => {
    setFilterWorkshop('');
    setFilterShip('');
    setFilterLocation('');
    setFromDate('');
    setToDate('');
    if (onSearchSubmit) {
      onSearchSubmit('', '', '', '', '');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(filterShip, filterLocation, fromDate, toDate, filterWorkshop);
    }
  };

  return (
    <div id="defect-find-panel" className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Search Header Banner */}
      <div className="bg-[#001738]/95 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border-l-8 border-amber-400 border border-amber-500/35 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-algerian font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase">
              DEFECT SEARCH ENGINE
            </span>
            <span className="text-amber-400 text-xs">•</span>
            <span className="text-xs text-amber-200/90 font-mono">BND QUERY FILTER</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-algerian font-extrabold flex items-center gap-3 text-white uppercase tracking-wider">
            <Search className="h-6 w-6 text-amber-400" />
            <span>DEFECT FIND & QUERY SYSTEM</span>
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm mt-1">
            Filter defects by workshop, warship name, compartment location, or date range. Results display directly below.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="bg-white/10 hover:bg-white/20 text-amber-200 border border-amber-400/40 font-algerian font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 shrink-0"
        >
          <RefreshCw className="h-4 w-4 text-amber-400" />
          <span>RESET FILTERS</span>
        </button>
      </div>

      {/* Full-width Search Filter Form (ACTIVE SEARCH SCOPE and PROTOCOL GUIDELINES removed) */}
      <div className="w-full">
        <form onSubmit={handleSearchSubmit} className="bg-[#001738]/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-amber-500/35 space-y-6 text-white">
          
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <h3 className="text-amber-400 font-algerian font-bold text-sm uppercase flex items-center gap-2 tracking-wide">
              <Search className="h-4 w-4 text-amber-400" />
              <span>SEARCH CRITERIA & QUERY PARAMETERS</span>
            </h3>
            <span className="text-[11px] text-amber-200/80 font-mono">MATCHING: {filteredResults.length} RECORDS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Workshop Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-algerian font-bold text-amber-300 mb-1 flex items-center gap-1.5 uppercase">
                <Building2 className="h-3.5 w-3.5 text-amber-400" />
                <span>WORKSHOP</span>
              </label>
              <select
                id="workshop-filter-select"
                value={filterWorkshop}
                onChange={(e) => setFilterWorkshop(e.target.value)}
                className="w-full border border-amber-400/30 bg-[#000d1e] rounded-2xl px-4 py-3 focus:ring-2 focus:ring-amber-400 outline-none text-sm text-white transition-all font-medium cursor-pointer"
              >
                <option value="" className="bg-[#001128] text-white">All 27 Workshops</option>
                {workshops.map((ws) => (
                  <option key={ws.id} value={ws.nameEn} className="bg-[#001128] text-white">
                    {ws.code}: {ws.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Ship Selection Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-algerian font-bold text-amber-300 mb-1 flex items-center gap-1.5 uppercase">
                <Ship className="h-3.5 w-3.5 text-cyan-400" />
                <span>WARSHIP NAME</span>
              </label>
              <select
                id="ship-filter-select"
                value={filterShip}
                onChange={(e) => setFilterShip(e.target.value)}
                className="w-full border border-amber-400/30 bg-[#000d1e] rounded-2xl px-4 py-3 focus:ring-2 focus:ring-amber-400 outline-none text-sm text-white transition-all cursor-pointer"
              >
                <option value="" className="bg-[#001128] text-white">All Warships</option>
                {ships.map((ship, idx) => (
                  <option key={idx} value={ship} className="bg-[#001128] text-white">{ship}</option>
                ))}
              </select>
            </div>

            {/* Location Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-algerian font-bold text-amber-300 mb-1 flex items-center gap-1.5 uppercase">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                <span>DEFECT LOCATION</span>
              </label>
              <select
                id="location-filter-select"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full border border-amber-400/30 bg-[#000d1e] rounded-2xl px-4 py-3 focus:ring-2 focus:ring-amber-400 outline-none text-sm text-white transition-all cursor-pointer"
              >
                <option value="" className="bg-[#001128] text-white">All Compartments & Locations</option>
                {locations.map((loc, idx) => (
                  <option key={idx} value={loc} className="bg-[#001128] text-white">{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date From */}
            <div className="space-y-1.5">
              <label className="block text-xs font-algerian font-bold text-amber-300 mb-1 uppercase">
                DEFECT DATE (FROM)
              </label>
              <div className="relative flex items-center">
                <input
                  ref={fromDateInputRef}
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full border border-amber-400/30 bg-[#000d1e] rounded-2xl px-4 py-3 pr-12 text-sm text-white focus:ring-2 focus:ring-amber-400 outline-none cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    try {
                      fromDateInputRef.current?.showPicker();
                    } catch {
                      fromDateInputRef.current?.focus();
                    }
                  }}
                  className="absolute right-3.5 p-1 text-amber-400 hover:text-amber-200 transition-colors cursor-pointer"
                  title="Open Calendar"
                >
                  <Calendar className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Date To */}
            <div className="space-y-1.5">
              <label className="block text-xs font-algerian font-bold text-amber-300 mb-1 uppercase">
                DEFECT DATE (TO)
              </label>
              <div className="relative flex items-center">
                <input
                  ref={toDateInputRef}
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full border border-amber-400/30 bg-[#000d1e] rounded-2xl px-4 py-3 pr-12 text-sm text-white focus:ring-2 focus:ring-amber-400 outline-none cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    try {
                      toDateInputRef.current?.showPicker();
                    } catch {
                      toDateInputRef.current?.focus();
                    }
                  }}
                  className="absolute right-3.5 p-1 text-amber-400 hover:text-amber-200 transition-colors cursor-pointer"
                  title="Open Calendar"
                >
                  <Calendar className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tactical Quick Presets */}
          <div className="pt-2">
            <span className="text-[11px] font-algerian text-amber-300 font-bold block mb-2 uppercase">
              QUICK SEARCH PRESETS:
            </span>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setFilterLocation(locations[0] || 'Main Engine')}
                className="text-xs px-4 py-2 rounded-xl bg-[#000e24] hover:bg-[#001c40] border border-amber-400/30 text-slate-200 hover:text-amber-300 font-algerian transition-all cursor-pointer shadow-xs"
              >
                MAIN ENGINE DEFECTS
              </button>
              <button
                type="button"
                onClick={() => {
                  const ws = workshops.find(w => w.category === 'Electrical' || w.category === 'ইলেকট্রিক্যাল')?.nameEn || '';
                  setFilterWorkshop(ws);
                }}
                className="text-xs px-4 py-2 rounded-xl bg-[#000e24] hover:bg-[#001c40] border border-amber-400/30 text-slate-200 hover:text-amber-300 font-algerian transition-all cursor-pointer shadow-xs"
              >
                ELECTRICAL WORKSHOPS
              </button>
              <button
                type="button"
                onClick={() => setFilterShip(ships[0] || '')}
                className="text-xs px-4 py-2 rounded-xl bg-[#000e24] hover:bg-[#001c40] border border-amber-400/30 text-slate-200 hover:text-amber-300 font-algerian transition-all cursor-pointer shadow-xs"
              >
                {ships[0] || 'BNS Bangabandhu'} DEFECTS
              </button>
            </div>
          </div>

          {/* Action Button: Filters in-place, does NOT redirect to Dashboard */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="text-xs text-amber-200/90 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>RESULTS DISPLAY IN REAL-TIME BELOW</span>
            </div>

            <button
              id="find-defect-submit-btn"
              type="submit"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#001733] font-algerian font-black py-3.5 px-14 rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-95 text-sm sm:text-base uppercase tracking-wider"
            >
              <Search className="h-5 w-5 text-[#001733]" />
              <span>DEFECT FIND</span>
            </button>
          </div>

        </form>
      </div>

      {/* FILTERED RESULTS TABLE DIRECTLY IN DEFECT FIND */}
      <div className="bg-[#001738]/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-amber-500/35 text-white space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-lg font-algerian font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>FILTERED DEFECT RECORDS ({filteredResults.length})</span>
          </h3>
          <span className="text-xs text-amber-300 font-mono">
            {filteredResults.filter(d => d.status === 'Solved').length} Solved • {filteredResults.filter(d => d.status === 'Pending').length} Pending
          </span>
        </div>

        {filteredResults.length === 0 ? (
          <div className="p-10 text-center text-slate-400 space-y-2">
            <p className="text-base font-semibold">No defects found matching the selected query parameters.</p>
            <p className="text-xs">Adjust your search criteria or click "Reset Filters" above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/15 text-amber-300 font-algerian uppercase text-[11px] bg-black/30">
                  <th className="p-3">Status</th>
                  <th className="p-3">Ship Name</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Workshop</th>
                  <th className="p-3">Defect Date</th>
                  <th className="p-3">Defect Description</th>
                  <th className="p-3">Photos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-medium">
                {filteredResults.map((defect) => (
                  <tr key={defect.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        defect.status === 'Solved' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {defect.status === 'Solved' ? (
                          <><CheckCircle2 className="h-3 w-3" /> Solved</>
                        ) : (
                          <><AlertCircle className="h-3 w-3" /> Pending</>
                        )}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white whitespace-nowrap">{defect.shipName}</td>
                    <td className="p-3 text-cyan-200 whitespace-nowrap">{defect.location}</td>
                    <td className="p-3 text-amber-300/90 whitespace-nowrap">{defect.workshop || defect.workshopCode || 'WS-01'}</td>
                    <td className="p-3 font-mono text-slate-300 whitespace-nowrap">{defect.defectDate}</td>
                    <td className="p-3 text-slate-200 max-w-xs truncate">{defect.defectDescription}</td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {defect.defectImage && (
                          <button 
                            type="button"
                            onClick={() => setSelectedImage(defect.defectImage)}
                            className="w-7 h-7 rounded-lg overflow-hidden border border-rose-400/40 hover:scale-110 transition-transform cursor-pointer"
                            title="View Defect Photo"
                          >
                            <img src={defect.defectImage} alt="Defect" className="w-full h-full object-cover" />
                          </button>
                        )}
                        {defect.solutionImage && (
                          <button 
                            type="button"
                            onClick={() => setSelectedImage(defect.solutionImage)}
                            className="w-7 h-7 rounded-lg overflow-hidden border border-emerald-400/40 hover:scale-110 transition-transform cursor-pointer"
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

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-[#001738] p-2 rounded-2xl border-2 border-amber-400 shadow-2xl overflow-hidden">
            <img 
              src={selectedImage} 
              alt="Enlarged Inspection" 
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
