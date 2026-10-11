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
  Check,
  Anchor,
  Shield
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

  const safeOpenDatePicker = (input: HTMLInputElement | null) => {
    if (!input) return;
    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker();
        return;
      }
    } catch {
      // showPicker() may throw SecurityError in cross-origin iframes
    }
    input.focus();
    try {
      input.click();
    } catch {}
  };

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

  // Media upload state
  const [isUploadingDefectImg, setIsUploadingDefectImg] = useState(false);
  const [isUploadingSolutionImg, setIsUploadingSolutionImg] = useState(false);

  // Feedback Notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync activeWorkshopCode
  useEffect(() => {
    if (activeWorkshopCode) {
      const match = workshops.find(w => w.code === activeWorkshopCode);
      if (match) {
        setSelectedWorkshopId(match.id);
      }
    }
  }, [activeWorkshopCode, workshops]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wsDropdownRef.current && !wsDropdownRef.current.contains(event.target as Node)) {
        setIsWsDropdownOpen(false);
      }
      if (shipDropdownRef.current && !shipDropdownRef.current.contains(event.target as Node)) {
        setIsShipDropdownOpen(false);
      }
      if (locDropdownRef.current && !locDropdownRef.current.contains(event.target as Node)) {
        setIsLocDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedWorkshop = workshops.find(w => w.id === selectedWorkshopId);
  const isWorkshopLocked = Boolean(activeWorkshopCode && activeWorkshopCode !== 'HQ' && activeWorkshopCode !== 'HQ-ADMIN');

  const filteredWorkshops = workshops.filter(w => 
    w.nameEn.toLowerCase().includes(wsSearch.toLowerCase()) ||
    w.nameBn.toLowerCase().includes(wsSearch.toLowerCase()) ||
    w.code.toLowerCase().includes(wsSearch.toLowerCase())
  );

  const filteredShips = ships.filter(s => 
    s.toLowerCase().includes(shipSearch.toLowerCase())
  );

  const filteredLocations = locations.filter(l => 
    l.toLowerCase().includes(locSearch.toLowerCase())
  );

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleImageUpload = async (file: File, type: 'defect' | 'solution') => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showFeedback('error', 'Image size must be less than 10MB.');
      return;
    }

    if (type === 'defect') setIsUploadingDefectImg(true);
    else setIsUploadingSolutionImg(true);

    try {
      const { url } = await supabaseService.uploadMediaToStorage(file, 'defects');
      if (type === 'defect') {
        setDefectImage(url);
      } else {
        setSolutionImage(url);
      }
      showFeedback('success', 'Photo uploaded successfully.');
    } catch (err: any) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'defect') setDefectImage(reader.result as string);
        else setSolutionImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      if (type === 'defect') setIsUploadingDefectImg(false);
      else setIsUploadingSolutionImg(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedShip) {
      showFeedback('error', 'Please select a warship name.');
      return;
    }
    if (!selectedLocation) {
      showFeedback('error', 'Please select a defect location or compartment.');
      return;
    }
    if (!defectDate) {
      showFeedback('error', 'Please choose the defect date.');
      return;
    }

    const status = solutionDate ? 'Solved' : 'Pending';
    const chosenWs = workshops.find(w => w.id === selectedWorkshopId);

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

    showFeedback('success', 'Defect entry successfully recorded in the database.');
    
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
    <div id="defect-entry-panel" className="w-full max-w-7xl mx-auto space-y-6 text-slate-800 pb-8">
      
      {/* Header Banner - Bangladesh Naval Green (#006A4E) & Cream (#FFFDD0) Design */}
      <div className="bg-gradient-to-r from-[#006A4E] via-[#355E3B] to-[#006A4E] text-[#FFFDD0] border-2 border-[#FFFDD0]/60 rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        {/* Subtle decorative watermark */}
        <div className="absolute right-3 -bottom-6 opacity-10 pointer-events-none text-[#FFFDD0]">
          <Anchor className="h-44 w-44" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-md text-[11px] font-bold bg-[#FFFDD0] text-[#006A4E] font-mono tracking-wider shadow-xs flex items-center gap-1.5">
              <span>⚓ NAVAL TECHNICAL OPERATIONS</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#004d38]/80 text-[#FFFDD0] border border-[#FFFDD0]/40 font-mono shadow-xs">
              BND DEFECT REGISTRY
            </span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black font-algerian flex items-center gap-2.5 text-[#FFFDD0] tracking-wider">
            <div className="p-2 rounded-xl bg-[#FFFDD0] text-[#006A4E] shadow-xs">
              <Wrench className="h-5 w-5 text-[#006A4E]" />
            </div>
            <span>ডিফেক্ট এন্ট্রি ফর্ম • DEFECT ENTRY FORM</span>
          </h2>
          
          <p className="text-[#FFFDD0]/90 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed font-medium">
            যুদ্ধজাহাজের মেকানিক্যাল, ইলেকট্রিক্যাল ও স্ট্রাকচারাল ত্রুটি এবং প্রতিকারমূলক ব্যবস্থা সিস্টেমে সংরক্ষণ করুন।
          </p>
        </div>

        <div className="text-right hidden sm:block font-mono text-xs bg-[#FFFDD0] text-[#006A4E] px-4 py-2.5 rounded-xl border border-[#FFFDD0] relative z-10 shadow-xs">
          <div className="font-bold tracking-wider text-[#006A4E] flex items-center justify-end gap-1.5">
            <Shield className="h-3.5 w-3.5 text-[#006A4E]" />
            <span>COMMAND HQ: PRODUCTION WING</span>
          </div>
          <div className="text-[10px] text-[#006A4E]/80 font-semibold mt-0.5">
            CLASSIFICATION: RESTRICTED • OFFICIAL USE
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div 
          id="entry-feedback-banner"
          className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm animate-fade-in ${
            notification.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Executive Form Card - Bangladesh Naval Green (#006A4E) & Cream Theme */}
      <div className="w-full">
        <form onSubmit={handleSubmit} className="bg-white/95 border-2 border-[#006A4E]/30 hover:border-[#006A4E]/70 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 text-[#1B331F] transition-all">
          
          {/* Core Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* 1. Workshop Selection */}
            <div className="space-y-1.5 relative z-30" ref={wsDropdownRef}>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-500" />
                  <span>RESPONSIBLE WORKSHOP</span> <span className="text-rose-500">*</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {workshops.length} Units
                </span>
              </label>

              {isWorkshopLocked ? (
                <div className="w-full flex items-center justify-between border border-slate-300 bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 text-[11px] font-mono font-bold shrink-0">
                      {selectedWorkshop?.code}
                    </span>
                    <span className="truncate font-semibold text-slate-900 text-xs">
                      {selectedWorkshop?.nameEn} ({selectedWorkshop?.nameBn})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-200 px-2 py-0.5 rounded uppercase shrink-0">
                    LOCKED
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
                  className="w-full flex items-center justify-between border border-slate-300 hover:border-slate-400 bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
                    {selectedWorkshop ? (
                      <>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-mono font-semibold shrink-0">
                          {selectedWorkshop.code}
                        </span>
                        <span className="truncate font-medium text-slate-900 text-xs">
                          {selectedWorkshop.nameEn}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400 text-xs">Select Responsible Workshop...</span>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform shrink-0 ml-2 ${isWsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              )}

              {isWsDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-lg max-h-72 flex flex-col overflow-hidden animate-fade-in">
                  <div className="p-2 border-b border-slate-100 bg-slate-50">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={wsSearch}
                        onChange={(e) => setWsSearch(e.target.value)}
                        placeholder="Search workshop..."
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 outline-none"
                      />
                    </div>
                  </div>

                  <div className="overflow-y-auto max-h-56 p-1">
                    {filteredWorkshops.map(ws => (
                      <div
                        key={ws.id}
                        onClick={() => {
                          setSelectedWorkshopId(ws.id);
                          setIsWsDropdownOpen(false);
                        }}
                        className={`p-2 rounded-lg cursor-pointer text-xs flex items-center justify-between transition-colors ${
                          selectedWorkshopId === ws.id ? 'bg-slate-100 font-bold text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-mono shrink-0">
                            {ws.code}
                          </span>
                          <span className="truncate">{ws.nameEn} ({ws.nameBn})</span>
                        </div>
                        {selectedWorkshopId === ws.id && <Check className="h-3.5 w-3.5 text-slate-900 shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Warship Selection */}
            <div className="space-y-1.5 relative z-20" ref={shipDropdownRef}>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Ship className="h-3.5 w-3.5 text-slate-500" />
                <span>WARSHIP NAME</span> <span className="text-rose-500">*</span>
              </label>

              <button
                type="button"
                id="ship-select-btn"
                onClick={() => {
                  setIsShipDropdownOpen(!isShipDropdownOpen);
                  setIsWsDropdownOpen(false);
                  setIsLocDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between border border-slate-300 hover:border-slate-400 bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium cursor-pointer shadow-xs"
              >
                <span className={selectedShip ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
                  {selectedShip || 'Select Warship...'}
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform shrink-0 ml-2 ${isShipDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isShipDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 flex flex-col overflow-hidden animate-fade-in">
                  <div className="p-2 border-b border-slate-100 bg-slate-50">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={shipSearch}
                        onChange={(e) => setShipSearch(e.target.value)}
                        placeholder="Search warship..."
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 outline-none"
                      />
                    </div>
                  </div>

                  <div className="overflow-y-auto max-h-48 p-1">
                    {filteredShips.map((ship, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedShip(ship);
                          setIsShipDropdownOpen(false);
                        }}
                        className={`p-2 rounded-lg cursor-pointer text-xs flex items-center justify-between transition-colors ${
                          selectedShip === ship ? 'bg-slate-100 font-bold text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{ship}</span>
                        {selectedShip === ship && <Check className="h-3.5 w-3.5 text-slate-900 shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Compartment / Location */}
            <div className="space-y-1.5 relative z-10" ref={locDropdownRef}>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                <span>COMPARTMENT LOCATION</span> <span className="text-rose-500">*</span>
              </label>

              <button
                type="button"
                id="location-select-btn"
                onClick={() => {
                  setIsLocDropdownOpen(!isLocDropdownOpen);
                  setIsWsDropdownOpen(false);
                  setIsShipDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between border border-slate-300 hover:border-slate-400 bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium cursor-pointer shadow-xs"
              >
                <span className={selectedLocation ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
                  {selectedLocation || 'Select Compartment...'}
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform shrink-0 ml-2 ${isLocDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLocDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 flex flex-col overflow-hidden animate-fade-in">
                  <div className="p-2 border-b border-slate-100 bg-slate-50">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={locSearch}
                        onChange={(e) => setLocSearch(e.target.value)}
                        placeholder="Search compartment..."
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 outline-none"
                      />
                    </div>
                  </div>

                  <div className="overflow-y-auto max-h-48 p-1">
                    {filteredLocations.map((loc, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedLocation(loc);
                          setIsLocDropdownOpen(false);
                        }}
                        className={`p-2 rounded-lg cursor-pointer text-xs flex items-center justify-between transition-colors ${
                          selectedLocation === loc ? 'bg-slate-100 font-bold text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{loc}</span>
                        {selectedLocation === loc && <Check className="h-3.5 w-3.5 text-slate-900 shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Defect Details & Solution Form Sections in Two Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Left: Defect Information */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <span className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-rose-600" />
                  <span>DEFECT DETAILS</span>
                </span>
                <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 uppercase">
                  MANDATORY
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  DEFECT OCCURRENCE DATE *
                </label>
                <div className="relative">
                  <input
                    ref={defectDateInputRef}
                    type="date"
                    required
                    value={defectDate}
                    onChange={(e) => setDefectDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch {}
                    }}
                    className="w-full pl-3 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 outline-none focus:border-slate-500 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                  />
                  <button
                    type="button"
                    onClick={() => safeOpenDatePicker(defectDateInputRef.current)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#006A4E] cursor-pointer transition-colors"
                    title="ক্যালেন্ডার ওপেন করুন"
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  DEFECT DESCRIPTION *
                </label>
                <textarea
                  rows={3}
                  required
                  value={defectDesc}
                  onChange={(e) => setDefectDesc(e.target.value)}
                  placeholder="Describe the defect, symptoms, and impact..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 outline-none focus:border-slate-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  DEFECT PHOTOGRAPH (OPTIONAL)
                </label>
                {defectImage ? (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-300 bg-white">
                    <img src={defectImage} alt="Defect" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setDefectImage('')}
                      className="absolute top-2 right-2 p-1 bg-slate-900/80 text-white rounded-md hover:bg-slate-900"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg cursor-pointer bg-white transition-colors">
                    <Upload className="h-5 w-5 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-600 font-medium">
                      {isUploadingDefectImg ? 'Uploading...' : 'Click to attach photo'}
                    </span>
                    <span className="text-[10px] text-slate-400">PNG, JPG up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'defect')}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Right: Remedial Solution (If already resolved) - Highlighted with #006A4E */}
            <div className="bg-[#006A4E]/5 border-2 border-[#006A4E]/30 p-5 rounded-xl space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#006A4E]/20 pb-2.5">
                <span className="text-xs font-bold text-[#006A4E] uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#006A4E]" />
                  <span>REMEDIAL SOLUTION (IF COMPLETED)</span>
                </span>
                <span className="text-[10px] text-[#006A4E] font-medium bg-[#006A4E]/10 px-2 py-0.5 rounded border border-[#006A4E]/20">
                  OPTIONAL
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  RESOLUTION DATE
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
                    className="w-full pl-3 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 outline-none focus:border-slate-500 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
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
                  WORK DONE / REMEDY DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={solutionDesc}
                  onChange={(e) => setSolutionDesc(e.target.value)}
                  placeholder="Describe repair actions taken, replaced parts, testing conducted..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 outline-none focus:border-slate-500 leading-relaxed"
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
                  <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg cursor-pointer bg-white transition-colors">
                    <Upload className="h-5 w-5 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-600 font-medium">
                      {isUploadingSolutionImg ? 'Uploading...' : 'Click to attach photo'}
                    </span>
                    <span className="text-[10px] text-slate-400">PNG, JPG up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'solution')}
                    />
                  </label>
                )}
              </div>
            </div>

          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t-2 border-[#006A4E]/20 flex items-center justify-end gap-3.5">
            <button
              type="button"
              onClick={() => {
                setSelectedShip('');
                setSelectedLocation('');
                setDefectDesc('');
                setDefectImage('');
                setSolutionDate('');
                setSolutionDesc('');
                setSolutionImage('');
              }}
              className="px-5 py-2.5 bg-[#FFFDD0] hover:bg-[#F3EFBA] text-[#006A4E] border-2 border-[#006A4E]/40 hover:border-[#006A4E] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              Clear Fields
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#004e39] hover:from-[#005740] hover:to-[#00402e] text-[#FFFDD0] font-bold border-2 border-[#FFFDD0]/60 rounded-xl text-xs font-algerian tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Check className="h-4 w-4 text-[#FFFDD0]" />
              <span>Submit Defect Entry</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
