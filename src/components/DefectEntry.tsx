import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  Wrench,
  Calendar,
  ChevronDown,
  Search,
  Building2,
  Ship,
  MapPin,
  Check
} from 'lucide-react';
import { Defect, Workshop } from '../types';
import { supabaseService } from '../services/supabaseService';

interface DefectEntryProps {
  ships: string[];
  locations: string[];
  workshops?: Workshop[];
  activeWorkshopCode?: string;
  onAddDefect: (defect: Omit<Defect, 'id' | 'createdAt'>) => void;
}

export default function DefectEntry({ 
  ships, 
  locations, 
  workshops = [], 
  activeWorkshopCode, 
  onAddDefect 
}: DefectEntryProps) {
  const defectDateInputRef = useRef<HTMLInputElement>(null);
  const solutionDateInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const defaultWs = workshops.find(w => w.code === activeWorkshopCode) || workshops[0];
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>(defaultWs?.id || '');
  const [selectedShip, setSelectedShip] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [defectDate, setDefectDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [defectDesc, setDefectDesc] = useState<string>('');
  const [defectImage, setDefectImage] = useState<string>('');
  
  const [solutionDate, setSolutionDate] = useState<string>('');
  const [solutionDesc, setSolutionDesc] = useState<string>('');
  const [solutionImage, setSolutionImage] = useState<string>('');

  // Dropdown downwards direction controllers
  const [isWsDropdownOpen, setIsWsDropdownOpen] = useState(false);
  const [wsSearch, setWsSearch] = useState('');
  const wsDropdownRef = useRef<HTMLDivElement>(null);

  const [isShipDropdownOpen, setIsShipDropdownOpen] = useState(false);
  const [shipSearch, setShipSearch] = useState('');
  const shipDropdownRef = useRef<HTMLDivElement>(null);

  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);
  const [locSearch, setLocSearch] = useState('');
  const locDropdownRef = useRef<HTMLDivElement>(null);

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wsDropdownRef.current && !wsDropdownRef.current.contains(e.target as Node)) {
        setIsWsDropdownOpen(false);
      }
      if (shipDropdownRef.current && !shipDropdownRef.current.contains(e.target as Node)) {
        setIsShipDropdownOpen(false);
      }
      if (locDropdownRef.current && !locDropdownRef.current.contains(e.target as Node)) {
        setIsLocDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update selected workshop if activeWorkshopCode changes
  useEffect(() => {
    if (activeWorkshopCode) {
      const match = workshops.find(w => w.code === activeWorkshopCode);
      if (match) setSelectedWorkshopId(match.id);
    }
  }, [activeWorkshopCode, workshops]);

  // Derived selected workshop and filtered dropdown items
  const isWorkshopLocked = !!activeWorkshopCode && activeWorkshopCode !== 'HQ' && activeWorkshopCode !== 'HQ-ADMIN';
  const selectedWorkshop = workshops.find(w => w.id === selectedWorkshopId) || 
                           workshops.find(w => w.code === activeWorkshopCode) || 
                           workshops[0];

  const filteredWorkshops = workshops.filter(ws => {
    if (!wsSearch.trim()) return true;
    const q = wsSearch.toLowerCase();
    return ws.code.toLowerCase().includes(q) || 
           ws.nameEn.toLowerCase().includes(q) || 
           ws.nameBn.toLowerCase().includes(q) ||
           (ws.category && ws.category.toLowerCase().includes(q));
  });

  const filteredShips = ships.filter(s => {
    if (!shipSearch.trim()) return true;
    return s.toLowerCase().includes(shipSearch.toLowerCase());
  });

  const filteredLocations = locations.filter(l => {
    if (!locSearch.trim()) return true;
    return l.toLowerCase().includes(locSearch.toLowerCase());
  });

  // UI Feedback State
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Ship Engine / Generator realistic image presets for quick testing
  const MOCK_DEFECT_IMAGES = [
    {
      name: 'Engine Crack',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=60'
    },
    {
      name: 'DG Fuel Leak',
      url: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=400&auto=format&fit=crop&q=60'
    },
    {
      name: 'Pipe Corrosion',
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=60'
    }
  ];

  const MOCK_SOLUTION_IMAGES = [
    {
      name: 'Engine Repaired',
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop&q=60'
    },
    {
      name: 'Leak Sealed',
      url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&auto=format&fit=crop&q=60'
    }
  ];

  // Handle File upload to Supabase Storage with fallback
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    setImgState: React.Dispatch<React.SetStateAction<string>>,
    folder: 'defects' | 'solutions' = 'defects'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showFeedback('error', 'File size must be under 5MB!');
        return;
      }
      try {
        const { url } = await supabaseService.uploadMediaToStorage(file, folder);
        setImgState(url);
      } catch (err) {
        console.error('Photo upload error:', err);
      }
    }
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedShip) {
      showFeedback('error', 'Please select a warship name!');
      return;
    }
    if (!selectedLocation) {
      showFeedback('error', 'Please select a defect location / compartment!');
      return;
    }
    if (!defectDate) {
      showFeedback('error', 'Please choose the defect date!');
      return;
    }

    // Prepare status
    const status = solutionDate ? 'Solved' : 'Pending';
    const chosenWs = workshops.find(w => w.id === selectedWorkshopId);

    // Submit
    onAddDefect({
      shipName: selectedShip,
      location: selectedLocation,
      defectDate,
      defectImage,
      defectDescription: defectDesc || 'No technical description provided.',
      solutionDate,
      solutionImage,
      solutionDescription: solutionDesc || (solutionDate ? 'Remedial action completed.' : ''),
      status,
      workshop: chosenWs ? chosenWs.nameEn : 'Rigging & Sail Loft',
      workshopCode: chosenWs ? chosenWs.code : 'WS-01'
    });

    showFeedback('success', 'Defect entry successfully recorded in the database!');
    
    // Reset Form
    setSelectedShip('');
    setSelectedLocation('');
    setDefectDate(new Date().toISOString().split('T')[0]);
    setDefectDesc('');
    setDefectImage('');
    setSolutionDate('');
    setSolutionDesc('');
    setSolutionImage('');
  };

  return (
    <div id="defect-entry-panel" className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Banner / Header - FILL TEST DATA button removed as requested */}
      <div className="bg-[#001738]/95 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border-l-8 border-amber-400 border border-amber-500/35 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-algerian font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase">
              NAVAL TECHNICAL OPERATIONS
            </span>
            <span className="text-amber-400 text-xs">•</span>
            <span className="text-xs text-amber-200/90 font-mono">BND DEFECT REGISTRY</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-algerian font-extrabold flex items-center gap-3 text-white uppercase tracking-wider">
            <Wrench className="h-6 w-6 text-amber-400" />
            <span>DEFECT ENTRY FORM</span>
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm mt-1">
            Log warship mechanical, electrical, and structural defect records and remedial solutions directly into the database.
          </p>
        </div>

        <div className="text-right hidden sm:block font-mono text-xs text-amber-300/80 bg-[#000f24] px-4 py-2 rounded-2xl border border-amber-400/20">
          <div>COMMAND HQ: PRODUCTION WING</div>
          <div className="text-[10px] text-slate-400">CLASSIFICATION: RESTRICTED</div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div 
          id="entry-feedback-banner"
          className={`p-4 rounded-2xl flex items-center gap-3 border shadow-xl backdrop-blur-md animate-fade-in ${
            notification.type === 'success' 
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50' 
              : 'bg-rose-950/90 text-rose-200 border-rose-500/50'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
          )}
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* 
          FULL-SCREEN ADJUSTED FORM (SCOPE and QUALITY & SAFETY PROTOCOLS removed)
          Adjusted to occupy full width smoothly and responsively
      */}
      <div className="w-full">
        <form onSubmit={handleSubmit} className="bg-[#001738]/95 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl border border-amber-500/35 space-y-7 text-white">
          
          {/* Core Info Row - Custom Downward-Opening Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Workshop Selection - Strictly opens DOWNWARDS */}
            <div className="space-y-1.5 relative z-30" ref={wsDropdownRef}>
              <label className="block text-xs font-algerian font-bold text-amber-300 uppercase tracking-wide mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-amber-400" />
                  <span>RESPONSIBLE WORKSHOP</span> <span className="text-amber-400">*</span>
                </span>
                <span className="text-[10px] text-cyan-300/80 font-mono">
                  {workshops.length} Units
                </span>
              </label>

              {/* Trigger Button or Locked Display */}
              {isWorkshopLocked ? (
                <div className="w-full flex items-center justify-between border border-amber-400/60 bg-gradient-to-r from-amber-500/20 via-[#001738] to-[#000d1e] rounded-2xl px-4 py-3 text-sm text-white font-medium shadow-inner gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-[#001733] text-xs font-mono font-black shrink-0">
                      {selectedWorkshop?.code}
                    </span>
                    <span className="break-words font-semibold text-white text-xs sm:text-sm">
                      {selectedWorkshop?.nameEn} ({selectedWorkshop?.nameBn})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-black text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/40 uppercase shrink-0">
                    🔒 LOCKED
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  id="workshop-select-btn"
                  onClick={() => {
                    setIsWsDropdownOpen(!isWsDropdownOpen);
                    setIsShipDropdownOpen(false);
                    setIsLocDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between border ${
                    isWsDropdownOpen ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-amber-400/35 hover:border-amber-400'
                  } bg-[#000d1e] rounded-2xl px-4 py-3 outline-none text-sm text-white transition-all font-medium cursor-pointer shadow-inner`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
                    {selectedWorkshop ? (
                      <>
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/25 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold shrink-0">
                          {selectedWorkshop.code}
                        </span>
                        <span className="break-words font-semibold text-white text-xs sm:text-sm">
                          {selectedWorkshop.nameEn}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400 text-xs sm:text-sm">Select Responsible Workshop...</span>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-amber-400 transition-transform shrink-0 ml-2 ${isWsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              )}

              {/* Dropdown Options List - STRICTLY OPENS DOWNWARDS */}
              {isWsDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[#001228]/98 border-2 border-amber-500/60 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl max-h-72 flex flex-col overflow-hidden animate-fade-in">
                  {/* Search inside dropdown */}
                  <div className="p-2.5 border-b border-white/10 bg-[#000814]/90">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-amber-400" />
                      <input
                        type="text"
                        value={wsSearch}
                        onChange={(e) => setWsSearch(e.target.value)}
                        placeholder="Search workshop name or code (e.g. Rigging, Machine)..."
                        className="w-full pl-9 pr-3 py-1.5 bg-[#001736] border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 font-sans"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Workshop Items List */}
                  <div className="overflow-y-auto flex-1 divide-y divide-white/5 custom-scrollbar">
                    {filteredWorkshops.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-mono">
                        No workshop found matching "{wsSearch}"
                      </div>
                    ) : (
                      filteredWorkshops.map((ws) => {
                        const isSelected = ws.id === selectedWorkshopId;
                        return (
                          <button
                            key={ws.id}
                            type="button"
                            onClick={() => {
                              setSelectedWorkshopId(ws.id);
                              setIsWsDropdownOpen(false);
                              setWsSearch('');
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-amber-500/25 text-white' 
                                : 'hover:bg-white/10 text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold shrink-0 ${
                                isSelected ? 'bg-amber-400 text-[#001733]' : 'bg-white/10 text-amber-300'
                              }`}>
                                {ws.code}
                              </span>
                              <div className="truncate">
                                <span className="font-semibold text-sm block truncate text-white">
                                  {ws.nameEn}
                                </span>
                                <span className="text-[11px] text-cyan-200/70 block truncate font-mono">
                                  {ws.category}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 text-amber-400 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Ship Name Selection - Strictly opens DOWNWARDS */}
            <div className="space-y-1.5 relative z-20" ref={shipDropdownRef}>
              <label className="block text-xs font-algerian font-bold text-amber-300 uppercase tracking-wide mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Ship className="h-3.5 w-3.5 text-cyan-400" />
                  <span>SELECT WARSHIP</span> <span className="text-amber-400">*</span>
                </span>
                <span className="text-[10px] text-cyan-300/80 font-mono">
                  {ships.length} Ships
                </span>
              </label>

              {/* Trigger Button */}
              <button
                type="button"
                id="ship-select-btn"
                onClick={() => {
                  setIsShipDropdownOpen(!isShipDropdownOpen);
                  setIsWsDropdownOpen(false);
                  setIsLocDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between border ${
                  isShipDropdownOpen ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-amber-400/35 hover:border-amber-400'
                } bg-[#000d1e] rounded-2xl px-4 py-3 outline-none text-sm text-white transition-all cursor-pointer shadow-inner`}
              >
                <span className={`truncate ${selectedShip ? 'text-white font-semibold' : 'text-slate-400'}`}>
                  {selectedShip || 'Select a Warship...'}
                </span>
                <ChevronDown className={`h-4 w-4 text-amber-400 transition-transform shrink-0 ml-2 ${isShipDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Options List - STRICTLY OPENS DOWNWARDS */}
              {isShipDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[#001228]/98 border-2 border-amber-500/60 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl max-h-72 flex flex-col overflow-hidden animate-fade-in">
                  {/* Search inside ship dropdown */}
                  <div className="p-2.5 border-b border-white/10 bg-[#000814]/90">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-amber-400" />
                      <input
                        type="text"
                        value={shipSearch}
                        onChange={(e) => setShipSearch(e.target.value)}
                        placeholder="Search warship (e.g. Bangabandhu)..."
                        className="w-full pl-9 pr-3 py-1.5 bg-[#001736] border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 font-sans"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Ship items */}
                  <div className="overflow-y-auto flex-1 divide-y divide-white/5 custom-scrollbar">
                    {filteredShips.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-mono">
                        No warship found matching "{shipSearch}"
                      </div>
                    ) : (
                      filteredShips.map((ship, idx) => {
                        const isSelected = ship === selectedShip;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedShip(ship);
                              setIsShipDropdownOpen(false);
                              setShipSearch('');
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-amber-500/25 text-white font-bold' 
                                : 'hover:bg-white/10 text-slate-200'
                            }`}
                          >
                            <span className="truncate text-sm">{ship}</span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-amber-400 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Location Selection - Strictly opens DOWNWARDS */}
            <div className="space-y-1.5 relative z-10" ref={locDropdownRef}>
              <label className="block text-xs font-algerian font-bold text-amber-300 uppercase tracking-wide mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span>DEFECT LOCATION / COMPARTMENT</span> <span className="text-amber-400">*</span>
                </span>
                <span className="text-[10px] text-cyan-300/80 font-mono">
                  {locations.length} Locations
                </span>
              </label>

              {/* Trigger Button */}
              <button
                type="button"
                id="location-select-btn"
                onClick={() => {
                  setIsLocDropdownOpen(!isLocDropdownOpen);
                  setIsWsDropdownOpen(false);
                  setIsShipDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between border ${
                  isLocDropdownOpen ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-amber-400/35 hover:border-amber-400'
                } bg-[#000d1e] rounded-2xl px-4 py-3 outline-none text-sm text-white transition-all cursor-pointer shadow-inner`}
              >
                <span className={`truncate ${selectedLocation ? 'text-white font-semibold' : 'text-slate-400'}`}>
                  {selectedLocation || 'Select Location / Compartment...'}
                </span>
                <ChevronDown className={`h-4 w-4 text-amber-400 transition-transform shrink-0 ml-2 ${isLocDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Options List - STRICTLY OPENS DOWNWARDS */}
              {isLocDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[#001228]/98 border-2 border-amber-500/60 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl max-h-72 flex flex-col overflow-hidden animate-fade-in">
                  {/* Search inside location dropdown */}
                  <div className="p-2.5 border-b border-white/10 bg-[#000814]/90">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-amber-400" />
                      <input
                        type="text"
                        value={locSearch}
                        onChange={(e) => setLocSearch(e.target.value)}
                        placeholder="Search compartment / location..."
                        className="w-full pl-9 pr-3 py-1.5 bg-[#001736] border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 font-sans"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Location items */}
                  <div className="overflow-y-auto flex-1 divide-y divide-white/5 custom-scrollbar">
                    {filteredLocations.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-mono">
                        No location found matching "{locSearch}"
                      </div>
                    ) : (
                      filteredLocations.map((loc, idx) => {
                        const isSelected = loc === selectedLocation;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedLocation(loc);
                              setIsLocDropdownOpen(false);
                              setLocSearch('');
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-amber-500/25 text-white font-bold' 
                                : 'hover:bg-white/10 text-slate-200'
                            }`}
                          >
                            <span className="truncate text-sm">{loc}</span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-amber-400 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Two Columns Side-by-Side (Defect Details vs Solution Details) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            
            {/* DIV 1: DEFECT SECTION */}
            <div id="defect-info-div" className="bg-[#26060c]/90 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-rose-500/40 space-y-4 shadow-xl text-white">
              <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
                <h3 className="text-rose-300 font-algerian font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <span>1. DEFECT REPORTING & PHOTO</span>
                </h3>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-500/30">INITIAL REPORT</span>
              </div>

              {/* Defect Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-algerian font-bold text-rose-200 mb-1">
                  DATE OF DEFECT <span className="text-rose-400">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    id="defect-date-picker"
                    ref={defectDateInputRef}
                    type="date"
                    value={defectDate}
                    onChange={(e) => setDefectDate(e.target.value)}
                    className="w-full border border-rose-500/40 rounded-2xl px-4 py-2.5 pr-12 text-sm bg-[#120306] text-white outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        defectDateInputRef.current?.showPicker();
                      } catch {
                        defectDateInputRef.current?.focus();
                      }
                    }}
                    className="absolute right-3 p-1.5 text-rose-300 hover:text-white transition-colors cursor-pointer"
                    title="Open Calendar"
                  >
                    <Calendar className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Defect Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-algerian font-bold text-rose-200 mb-1">
                  DEFECT DESCRIPTION & SYMPTOMS
                </label>
                <textarea
                  value={defectDesc}
                  onChange={(e) => setDefectDesc(e.target.value)}
                  placeholder="Record symptoms, pressure, temperature, leak rate, or abnormality observations..."
                  rows={3}
                  className="w-full border border-rose-500/40 rounded-2xl px-4 py-2.5 text-sm bg-[#120306] text-white placeholder:text-rose-300/40 outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Defect Image Selection / Drag and Drop */}
              <div className="space-y-2">
                <label className="block text-xs font-algerian font-bold text-rose-200 mb-1 flex items-center justify-between">
                  <span>DEFECT PHOTO</span>
                  <span className="text-[10px] text-rose-300/80 font-mono">(Max 2MB)</span>
                </label>

                {defectImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-rose-500/50 group bg-[#120306] h-44 flex items-center justify-center">
                    <img
                      src={defectImage}
                      alt="Defect Preview"
                      className="h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setDefectImage('')}
                      className="absolute top-2.5 right-2.5 p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md transition-all active:scale-90 cursor-pointer"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-rose-500/40 rounded-2xl p-6 flex flex-col items-center justify-center bg-[#180408]/80 hover:bg-[#20060c] transition-colors text-center relative group cursor-pointer">
                    <Upload className="h-7 w-7 text-rose-400/80 mb-2" />
                    <span className="text-xs text-rose-200 font-medium">Click or drag image to upload defect photo</span>
                    <input
                      id="defect-img-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setDefectImage)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}

                {/* Sample Presets */}
                {!defectImage && (
                  <div className="flex flex-wrap gap-2 pt-1 justify-center">
                    <span className="text-[10px] text-rose-300 font-algerian font-semibold self-center">PHOTO PRESETS:</span>
                    {MOCK_DEFECT_IMAGES.map((mock, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setDefectImage(mock.url)}
                        className="text-[10px] bg-rose-950/80 hover:bg-rose-900 text-rose-200 px-2.5 py-1 rounded-xl border border-rose-500/40 transition-colors cursor-pointer"
                      >
                        {mock.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* DIV 2: SOLUTION SECTION */}
            <div id="solution-info-div" className="bg-[#04261d]/90 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-emerald-500/40 space-y-4 shadow-xl text-white">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                <h3 className="text-emerald-300 font-algerian font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <span>2. REMEDIAL SOLUTION & STATUS</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">REPAIR CLEARANCE</span>
              </div>

              {/* Solution Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-algerian font-bold text-emerald-200 mb-1">
                  DATE OF SOLUTION / REPAIR
                </label>
                <div className="relative flex items-center">
                  <input
                    id="solution-date-picker"
                    ref={solutionDateInputRef}
                    type="date"
                    value={solutionDate}
                    onChange={(e) => setSolutionDate(e.target.value)}
                    className="w-full border border-emerald-500/40 rounded-2xl px-4 py-2.5 pr-12 text-sm bg-[#02140f] text-white outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        solutionDateInputRef.current?.showPicker();
                      } catch {
                        solutionDateInputRef.current?.focus();
                      }
                    }}
                    className="absolute right-3 p-1.5 text-emerald-300 hover:text-white transition-colors cursor-pointer"
                    title="Open Calendar"
                  >
                    <Calendar className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Solution Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-algerian font-bold text-emerald-200 mb-1">
                  REPAIR ACTIONS TAKEN & OUTCOME
                </label>
                <textarea
                  value={solutionDesc}
                  onChange={(e) => setSolutionDesc(e.target.value)}
                  placeholder="Detail parts replaced, tests conducted, torque values, and operational clearance status..."
                  rows={3}
                  className="w-full border border-emerald-500/40 rounded-2xl px-4 py-2.5 text-sm bg-[#02140f] text-white placeholder:text-emerald-300/40 outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* Solution Image Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-algerian font-bold text-emerald-200 mb-1 flex items-center justify-between">
                  <span>REPAIRED EQUIPMENT PHOTO</span>
                  <span className="text-[10px] text-emerald-300/80 font-mono">(Max 2MB)</span>
                </label>

                {solutionImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-500/50 group bg-[#02140f] h-44 flex items-center justify-center">
                    <img
                      src={solutionImage}
                      alt="Solution Preview"
                      className="h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setSolutionImage('')}
                      className="absolute top-2.5 right-2.5 p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md transition-all active:scale-90 cursor-pointer"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-emerald-500/40 rounded-2xl p-6 flex flex-col items-center justify-center bg-[#031b14]/80 hover:bg-[#062c20] transition-colors text-center relative group cursor-pointer">
                    <Upload className="h-7 w-7 text-emerald-400/80 mb-2" />
                    <span className="text-xs text-emerald-200 font-medium">Click or drag image to upload repair completion photo</span>
                    <input
                      id="solution-img-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setSolutionImage, 'solutions')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}

                {/* Sample Presets */}
                {!solutionImage && (
                  <div className="flex flex-wrap gap-2 pt-1 justify-center">
                    <span className="text-[10px] text-emerald-300 font-algerian font-semibold self-center">PHOTO PRESETS:</span>
                    {MOCK_SOLUTION_IMAGES.map((mock, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSolutionImage(mock.url)}
                        className="text-[10px] bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 px-2.5 py-1 rounded-xl border border-emerald-500/40 transition-colors cursor-pointer"
                      >
                        {mock.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Submit Button Section */}
          <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-amber-200/90 font-algerian">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>ALL SUBMISSIONS ARE LOGGED AND AUDITED BY PRODUCTION HQ</span>
            </div>
            <button
              id="entry-defect-submit-btn"
              type="submit"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#001733] font-algerian font-black py-4 px-14 rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-95 text-sm sm:text-base uppercase tracking-wider"
            >
              <Wrench className="h-5 w-5 text-[#001733]" />
              <span>DEFECT ENTRY</span>
              <span className="text-lg font-sans">➔</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
