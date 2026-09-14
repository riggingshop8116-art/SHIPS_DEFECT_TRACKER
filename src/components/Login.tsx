import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Anchor, 
  ShieldCheck, 
  Lock, 
  User, 
  Search, 
  ChevronDown, 
  Check, 
  Building2, 
  KeyRound, 
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Compass,
  Radio,
  Clock,
  Phone,
  ShieldAlert,
  Activity,
  X,
  ExternalLink
} from 'lucide-react';
import { Workshop, DockyardConfig, AuthSession, UserProfile } from '../types';
import navyFleetBg from '../assets/images/ships1.jpg';

interface LoginProps {
  workshops: Workshop[];
  dockyardConfig: DockyardConfig;
  profile?: UserProfile;
  onLoginSuccess: (session: AuthSession) => void;
}

export default function Login({ workshops, dockyardConfig, profile, onLoginSuccess }: LoginProps) {
  // Workshop Selection & Search State
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>(workshops[0]?.id || 'ws-01');
  const [workshopSearchQuery, setWorkshopSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Workshop Form Credentials
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [workshopError, setWorkshopError] = useState<string>('');
  const [isWorkshopSubmitting, setIsWorkshopSubmitting] = useState<boolean>(false);

  // Admin Modal State & Form Credentials
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string>('');
  const [isAdminSubmitting, setIsAdminSubmitting] = useState<boolean>(false);

  // Real-time Naval Clock for Header
  const [clockTime, setClockTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockTime(now.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter 27 workshops by query
  const filteredWorkshops = useMemo(() => {
    const q = workshopSearchQuery.toLowerCase().trim();
    if (!q) return workshops;
    return workshops.filter(ws => 
      ws.nameEn.toLowerCase().includes(q) ||
      ws.nameBn.toLowerCase().includes(q) ||
      ws.code.toLowerCase().includes(q) ||
      ws.category.toLowerCase().includes(q)
    );
  }, [workshops, workshopSearchQuery]);

  const currentWorkshop = workshops.find(ws => ws.id === selectedWorkshopId) || workshops[0];

  // Workshop selection handler
  const handleSelectWorkshop = (ws: Workshop) => {
    setSelectedWorkshopId(ws.id);
    setIsDropdownOpen(false);
    setWorkshopSearchQuery('');
    setWorkshopError('');
    setUsername(ws.username || `oic.${ws.code.toLowerCase().replace(/[^a-z0-9]/g, '')}`);
    setPassword('');
  };

  // Workshop Submit Handler
  const handleWorkshopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWorkshopError('');
    setIsWorkshopSubmitting(true);

    setTimeout(() => {
      setIsWorkshopSubmitting(false);
      const inputUser = username.trim().toLowerCase();
      const inputPass = password.trim();

      if (!inputUser) {
        setWorkshopError('অনুগ্রহ করে আপনার শপ ইউজার আইডি / সার্ভিস নং দিন।');
        return;
      }
      if (!inputPass) {
        setWorkshopError('অনুগ্রহ করে আপনার শপের একাউন্ট পাসওয়ার্ড দিন।');
        return;
      }

      // Check if input matches selected workshop first
      let targetWs = workshops.find(ws => 
        ws.id === selectedWorkshopId && (
          (ws.username && ws.username.trim().toLowerCase() === inputUser) ||
          ws.code.trim().toLowerCase() === inputUser ||
          `oic.${ws.code.toLowerCase().replace(/[^a-z0-9]/g, '')}` === inputUser
        )
      );

      // If not matching selected workshop, search any workshop in the system
      if (!targetWs) {
        targetWs = workshops.find(ws => 
          (ws.username && ws.username.trim().toLowerCase() === inputUser) ||
          ws.code.trim().toLowerCase() === inputUser ||
          `oic.${ws.code.toLowerCase().replace(/[^a-z0-9]/g, '')}` === inputUser
        );
      }

      if (!targetWs) {
        setWorkshopError('❌ ইউজার আইডি পাওয়া যায়নি! এডমিন প্যানেলে নির্ধারিত সঠিক শপ ইউজার আইডি দিন।');
        return;
      }

      if (targetWs.status === 'inactive') {
        setWorkshopError(`⚠️ ${targetWs.nameEn} (${targetWs.code}) অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় রয়েছে। অনুগ্রহ করে হেডকোয়ার্টার্স এডমিনের সাথে যোগাযোগ করুন।`);
        return;
      }

      const expectedPassword = targetWs.password ? targetWs.password.trim() : '123456';
      if (inputPass !== expectedPassword) {
        setWorkshopError(`❌ পাসওয়ার্ড ভুল হয়েছে! ${targetWs.code} এর জন্য এডমিন প্যানেলে নির্ধারিত সঠিক পাসওয়ার্ড প্রদান করুন।`);
        return;
      }

      // Workshop user login success
      onLoginSuccess({
        isLoggedIn: true,
        role: 'workshop_user',
        workshopId: targetWs.id,
        workshopCode: targetWs.code,
        workshopNameBn: targetWs.nameBn,
        workshopNameEn: targetWs.nameEn,
        username: targetWs.username || username.trim(),
        officerName: `${targetWs.oicRank} ${targetWs.oicName}`,
        photo: targetWs.photo,
        loginTime: new Date().toISOString()
      });
    }, 300);
  };

  // Admin Submit Handler
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setIsAdminSubmitting(true);

    setTimeout(() => {
      setIsAdminSubmitting(false);
      const inputAdminUser = adminUsername.trim().toLowerCase();
      const inputAdminPass = adminPassword.trim();

      if (!inputAdminUser) {
        setAdminError('Please provide the HQ Administrator ID.');
        return;
      }
      if (!inputAdminPass) {
        setAdminError('Please provide the Administrative Security Key.');
        return;
      }

      const expectedAdminId = (profile?.officialId || 'admin').trim().toLowerCase();
      const expectedAdminPass = (profile?.password || 'admin123').trim();

      const isIdValid = inputAdminUser === expectedAdminId || (expectedAdminId === 'admin' && inputAdminUser === 'admin');
      const isPassValid = inputAdminPass === expectedAdminPass;

      if (!isIdValid) {
        setAdminError('❌ ভুল এডমিন ইউজার আইডি! এডমিন প্যানেল প্রোফাইলে নির্ধারিত সঠিক আইডি দিন।');
        return;
      }

      if (!isPassValid) {
        setAdminError('❌ ভুল এডমিন পাসওয়ার্ড! এডমিন প্যানেলে নির্ধারিত সঠিক পাসওয়ার্ড প্রদান করুন।');
        return;
      }

      setIsAdminModalOpen(false);
      onLoginSuccess({
        isLoggedIn: true,
        role: 'admin',
        workshopId: 'all',
        workshopCode: 'HQ-ADMIN',
        workshopNameBn: 'সুপারভাইজার ও হেডকোয়ার্টার্স',
        workshopNameEn: 'Naval Dockyard Admin HQ',
        username: profile?.officialId || adminUsername.trim(),
        officerName: profile?.name ? `${profile.rank} ${profile.name}` : 'Lt Commander M. A. Rahman (HQ Command)',
        loginTime: new Date().toISOString()
      });
    }, 350);
  };

  return (
    <div className="relative min-h-screen w-screen flex flex-col justify-between overflow-x-hidden font-sans text-slate-100 bg-[#000c1e] select-none">
      
      {/* =========================================================================
          1. WARSHIP FLEET SAILING ON OCEAN BACKGROUND (BANGLADESH NAVY SHIPS BANNER)
      ========================================================================= */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 scale-100 transition-all duration-700 pointer-events-none"
        style={{
          backgroundImage: `url('${navyFleetBg}')`,
          filter: 'brightness(1.08) contrast(1.05)'
        }}
      >
        {/* Crystal-Clear Oceanic Overlay: Warships, blue sea, and naval fleet are vividly visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#000e24]/30 via-transparent to-[#000a1c]/55"></div>
        
        {/* Subtle Nautical Radar Coordinates & Technical Grid */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        ></div>

        {/* Ambient Oceanic Focal Lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[350px] bg-amber-500/10 rounded-full blur-[140px]"></div>
      </div>

      {/* =========================================================================
          2. OFFICIAL WEBPAGE HEADER (CENTER ALIGNED: ASD MONOGRAM LOGO & AREA SUPERINTENDENT DOCKYARD)
      ========================================================================= */}
      <header id="home-navy-header" className="relative z-20 w-full min-h-16 sm:min-h-24 py-2.5 sm:py-4 bg-[#001738] text-white px-3 sm:px-6 md:px-10 shadow-2xl shrink-0 border-b-2 border-amber-500 select-none flex items-center justify-center">
        <div className="w-full max-w-7xl flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 md:gap-8 text-center">
          
          {/* Official Crest / Monogram Logo (Original proportions, uncropped, centered) */}
          <div className="shrink-0 flex items-center justify-center">
            <img 
              src={dockyardConfig.headerLogoUrl || '/asd_monogram.jpg'} 
              alt="Area Superintendent Dockyard Logo" 
              className="h-11 sm:h-18 md:h-20 lg:h-22 w-auto max-w-[85px] sm:max-w-[150px] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] select-none" 
            />
          </div>

          {/* Center Aligned Title: AREA SUPERINTENDENT DOCKYARD (Big, prominent, perfectly centered on all screen sizes) */}
          <div className="flex-1 min-w-0 flex items-center justify-center text-center">
            <h1 
              id="home-header-title"
              className="text-base sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-amber-400 font-algerian tracking-wider uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] leading-tight text-center break-words"
            >
              {dockyardConfig.headerTitle || 'AREA SUPERINTENDENT DOCKYARD'}
            </h1>
          </div>

        </div>
      </header>

      {/* Emergency Alert Banner (If Enabled by Admin in Settings) */}
      {dockyardConfig.emergencyAlertEnabled && dockyardConfig.emergencyAlertText && (
        <div className="bg-rose-900/95 border-b-2 border-rose-500 py-1.5 px-4 text-center text-xs sm:text-sm font-bold text-rose-200 flex items-center justify-center gap-2 z-20 shadow-lg animate-pulse">
          <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{dockyardConfig.emergencyAlertText}</span>
        </div>
      )}

      {/* =========================================================================
          PROMINENT SLOW RIGHT-TO-LEFT COMMAND DISPATCH BANNER (SYNCED WITH ADMIN CONFIG)
      ========================================================================= */}
      {dockyardConfig.showMarquee !== false && (
        <div className="bg-[#000d1e] border-b-2 border-slate-400/25 overflow-hidden py-1.5 px-4 flex items-center shadow-md z-10 relative">
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/30 to-amber-600/30 border border-amber-400/50 px-3 py-1 rounded-xl text-amber-300 font-algerian font-bold text-xs shrink-0 z-10 shadow-md">
            <img 
              src={dockyardConfig.headerLogoUrl || '/asd_monogram.jpg'} 
              alt="Navy Crest" 
              className="w-5 h-5 object-contain rounded-full bg-white p-0.5" 
            />
            <span className="tracking-wider">{dockyardConfig.marqueeBadge || 'COMMAND DISPATCH'}</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap w-full ml-3 flex-1 relative">
            <div className="animate-marquee-rtl font-algerian font-black text-amber-300 text-sm sm:text-base md:text-lg tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {dockyardConfig.marqueeText || '⚓ WELCOME TO AREA SUPERINTENDENT DOCKYARD ⚓ — TECHNICAL DEFECT TRACKING & FLEET MAINTENANCE COMMAND — ALL 27 WORKSHOPS OPERATIONAL READINESS 100% ⚓'}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. MAIN CENTRAL STAGE: FLOATING WORKSHOP LOGIN DIALOG BOX
      ========================================================================= */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md animate-fade-in">
          
          {/* Executive Glassmorphism Card Matching Oceanic Fleet Background */}
          <div className="bg-[#00142e]/85 backdrop-blur-2xl border border-cyan-400/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,10,35,0.95)] ring-1 ring-white/15 relative overflow-hidden">
            
            {/* Top Navy-Gold Line Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400"></div>

            {/* BANGLADESH NAVY CREST AT THE TOP OF THE DIALOG BOX */}
            <div className="flex flex-col items-center justify-center mb-5 -mt-1 text-center">
              <div className="relative group">
                {/* Glowing Outer Halo */}
                <div className="absolute -inset-3 bg-gradient-to-r from-amber-500/40 via-yellow-400/50 to-amber-600/40 rounded-full blur-lg opacity-90 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Grand Official Bangladesh Navy Crest Badge with User's Uploaded Image */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-black p-1 border-3 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center justify-center overflow-hidden">
                  <img 
                    src="/anchor.jpg" 
                    alt="Bangladesh Navy Crest" 
                    className="w-full h-full object-contain rounded-full hover:scale-105 transition-transform duration-300" 
                  />
                </div>
              </div>

              {/* Title under Crest */}
              <div className="mt-3">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm flex items-center justify-center gap-2">
                  <span className="font-algerian">{dockyardConfig.loginWelcomeTitle || 'WORKSHOP LOGIN PORTAL'}</span>
                </h2>
                <p className="text-xs text-amber-300 font-algerian mt-0.5 tracking-wider font-bold">
                  {dockyardConfig.loginWelcomeSubtitle || 'BANGLADESH NAVY DOCKYARD • WORKSHOP ACCESS'}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleWorkshopSubmit} className="space-y-4">
              
              {/* SEARCHABLE WORKSHOP SELECTOR */}
              <div className="space-y-1.5" ref={dropdownRef}>
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Assigned Workshop</span>
                  </label>
                  <span className="text-[10px] text-cyan-200 font-mono bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    27 Units
                  </span>
                </div>

                {/* Dropdown Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#000c1e]/85 backdrop-blur-md border border-amber-500/40 hover:border-amber-300 rounded-xl text-left text-white shadow-inner transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-400/40 rounded text-amber-300 text-xs font-mono font-bold shrink-0">
                        {currentWorkshop.code}
                      </span>
                      <div className="min-w-0 flex-1 text-left">
                        <span className="font-bold text-xs sm:text-sm block text-white break-words">
                          {currentWorkshop.nameEn}
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-cyan-200/80 block font-mono">
                          {currentWorkshop.category}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-amber-400 transition-transform shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Options List */}
                  {isDropdownOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-2 bg-[#001128]/95 border border-cyan-400/40 rounded-2xl shadow-2xl shadow-black overflow-hidden animate-fade-in backdrop-blur-2xl max-h-72 flex flex-col">
                      {/* Search in Dropdown */}
                      <div className="p-2.5 border-b border-white/10 bg-[#000814]/90">
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-amber-400" />
                          <input
                            type="text"
                            value={workshopSearchQuery}
                            onChange={(e) => setWorkshopSearchQuery(e.target.value)}
                            placeholder="Type code or name (e.g. WS-01, Rigging)..."
                            className="w-full pl-9 pr-3 py-1.5 bg-[#001736] border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 font-sans"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Workshop Items */}
                      <div className="overflow-y-auto flex-1 divide-y divide-white/5">
                        {filteredWorkshops.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400 font-mono">
                            No workshop found matching your search.
                          </div>
                        ) : (
                          filteredWorkshops.map((ws) => {
                            const isSelected = ws.id === selectedWorkshopId;
                            return (
                              <button
                                key={ws.id}
                                type="button"
                                onClick={() => handleSelectWorkshop(ws)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors cursor-pointer ${
                                  isSelected 
                                    ? 'bg-amber-500/20 text-white' 
                                    : 'hover:bg-white/5 text-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold shrink-0 ${
                                    isSelected ? 'bg-amber-400 text-[#001733]' : 'bg-white/10 text-amber-300'
                                  }`}>
                                    {ws.code}
                                  </span>
                                  <div className="truncate">
                                    <span className="text-xs font-bold block truncate text-white">
                                      {ws.nameEn}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block truncate font-mono">
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

                      <div className="px-3 py-1.5 bg-[#000814] text-[10px] text-slate-400 flex items-center justify-between border-t border-white/10 font-mono">
                        <span>Available: {filteredWorkshops.length} / 27 Units</span>
                        <span>DOCKYARD FLEET</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Officer Username / Service ID */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  Officer Service ID / Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. oic.ws01"
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-[#000c1e]/80 backdrop-blur-md border border-cyan-500/35 focus:border-amber-400 rounded-xl text-xs font-mono font-medium text-white outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Workshop Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-[#000c1e]/80 backdrop-blur-md border border-cyan-500/35 focus:border-amber-400 rounded-xl text-xs font-mono font-medium text-white outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {workshopError && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{workshopError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isWorkshopSubmitting}
                className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black tracking-wider uppercase transition-all shadow-lg shadow-amber-500/25 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#001733] flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="h-4 w-4" />
                <span>{isWorkshopSubmitting ? 'Authenticating Workshop...' : 'Sign In to Workshop Portal'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

          </div>

          <p className="text-center text-[10px] text-slate-400/90 font-mono mt-3 tracking-widest uppercase break-words px-2">
            RESTRICTED MILITARY INTRANET • DOCKYARD SECURITY PROTOCOL
          </p>
        </div>
      </main>

      {/* =========================================================================
          4. OFFICIAL WEBPAGE FOOTER WITH ADMIN PORTAL ENTRY ICON
      ========================================================================= */}
      <footer className="relative z-20 w-full bg-[#000d1e]/95 backdrop-blur-md border-t border-white/10 px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-3 shadow-2xl">
        
        {/* Left: Security & Copyright */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <p className="text-xs text-slate-300 font-medium break-words">
            © 2026 Bangladesh Navy Dockyard • Directorate of Naval Engineering
          </p>
          <p className="text-[10px] text-slate-400 font-mono break-words">
            For Official Armed Forces Use Only • Unauthorized Access Prohibited
          </p>
        </div>

        {/* Center: Security Specs */}
        <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>AES-256 ENCRYPTED</span>
          </span>
          <span>•</span>
          <span>FLEET DEFECT DB v3.2</span>
          <span>•</span>
          <span>IP LOGGING ACTIVE</span>
        </div>

        {/* Right: ADMIN PORTAL ENTRY BUTTON & ICON */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => {
              setIsAdminModalOpen(true);
              setAdminError('');
            }}
            title="Open Headquarters Admin Command Portal"
            className="group relative flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-amber-500/20 via-[#002147] to-cyan-950/80 hover:from-amber-500/30 hover:to-cyan-900/90 border border-amber-500/40 hover:border-amber-400 rounded-xl text-white shadow-lg shadow-amber-500/10 transition-all cursor-pointer hover:scale-102"
          >
            <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg group-hover:bg-amber-400 group-hover:text-[#001733] transition-colors">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold block text-white group-hover:text-amber-300">
                HQ Admin Portal
              </span>
              <span className="text-[9px] text-amber-300/80 block font-mono">
                Commanding Officers Only
              </span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform ml-1" />
          </button>
        </div>
      </footer>

      {/* =========================================================================
          5. ADMIN LOGIN DIALOG BOX (EXACTLY MATCHING USER DIALOG BOX STYLING)
      ========================================================================= */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          
          {/* Executive Glassmorphism Card Matching User Dialog Box */}
          <div className="w-full max-w-md bg-[#00142e]/95 backdrop-blur-2xl border border-cyan-400/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,10,35,0.95)] ring-1 ring-white/15 relative overflow-hidden text-white">
            
            {/* Top Navy-Gold Line Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400"></div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-amber-400 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer z-10"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* BANGLADESH NAVY CREST AT THE TOP OF THE DIALOG BOX (IDENTICAL TO USER DIALOG) */}
            <div className="flex flex-col items-center justify-center mb-5 -mt-1 text-center">
              <div className="relative group">
                {/* Glowing Outer Halo */}
                <div className="absolute -inset-3 bg-gradient-to-r from-amber-500/40 via-yellow-400/50 to-amber-600/40 rounded-full blur-lg opacity-90 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Grand Official Bangladesh Navy Crest Badge with Navy Image */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-black p-1 border-3 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center justify-center overflow-hidden">
                  <img 
                    src="/anchor.jpg" 
                    alt="Bangladesh Navy Crest" 
                    className="w-full h-full object-contain rounded-full hover:scale-105 transition-transform duration-300" 
                  />
                </div>
              </div>

              {/* Title under Crest */}
              <div className="mt-3">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm flex items-center justify-center gap-2">
                  <span className="font-algerian">ADMIN LOGIN PORTAL</span>
                </h2>
                <p className="text-xs text-amber-300 font-algerian mt-0.5 tracking-wider font-bold">
                  BANGLADESH NAVY DOCKYARD • HQ ACCESS
                </p>
              </div>
            </div>

            {/* Admin Form */}
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              
              {/* Admin ID */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  HQ Administrator ID / Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin"
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-[#000c1e]/80 backdrop-blur-md border border-cyan-500/35 focus:border-amber-400 rounded-xl text-xs font-mono font-medium text-white outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Admin Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  Administrative Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-[#000c1e]/80 backdrop-blur-md border border-cyan-500/35 focus:border-amber-400 rounded-xl text-xs font-mono font-medium text-white outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {adminError && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isAdminSubmitting}
                className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black tracking-wider uppercase transition-all shadow-lg shadow-amber-500/25 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#001733] flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="h-4 w-4" />
                <span>{isAdminSubmitting ? 'Authenticating Admin...' : 'Sign In to Admin Portal'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
