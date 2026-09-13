import React from 'react';
import { 
  LayoutDashboard,
  PlusCircle, 
  Search, 
  ShieldCheck, 
  User,
  Users,
  Layers,
  Building2,
  Sliders,
  Ship,
  MapPin,
  Database,
  Hourglass,
  X
} from 'lucide-react';
import { UserProfile, AuthSession, DockyardConfig, NavTab, AdminSubTab } from '../types';
import { Settings as SettingsIcon } from 'lucide-react';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  adminSubTab?: AdminSubTab;
  setAdminSubTab?: (tab: AdminSubTab) => void;
  profile: UserProfile;
  authSession: AuthSession | null;
  dockyardConfig: DockyardConfig;
  workshopsCount?: number;
  shipsCount?: number;
  pendingCount?: number;
  onLogout?: () => void;
  onOpenProfileModal?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  adminSubTab = 'workshops',
  setAdminSubTab,
  profile, 
  authSession, 
  workshopsCount = 27,
  shipsCount = 10,
  pendingCount = 0,
  onLogout,
  onOpenProfileModal,
  isMobileOpen = false,
  onCloseMobile
}: SidebarProps) {
  const isAdmin = authSession?.role === 'admin';

  const handleSelectAdminOption = (sub: AdminSubTab) => {
    setActiveTab('admin');
    if (setAdminSubTab) {
      setAdminSubTab(sub);
    }
    onCloseMobile?.();
  };

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    onCloseMobile?.();
  };

  const handleOpenProfile = () => {
    onOpenProfileModal?.();
    onCloseMobile?.();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Aside (Fixed Slide-in on Mobile/Tablet <lg, Static Column on Desktop >=lg) */}
      <aside 
        id="sidebar-container" 
        className={`w-72 sm:w-80 bg-[#00142e] text-white flex flex-col justify-between h-screen border-r-2 border-amber-500/40 shadow-2xl shrink-0 select-none transition-transform duration-300 ease-in-out fixed inset-y-0 left-0 z-50 lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Close Button in Top Corner */}
        <div className="lg:hidden absolute top-3.5 right-3.5 z-20">
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-2 text-amber-300 hover:text-white bg-white/10 hover:bg-white/20 border border-amber-400/40 rounded-xl cursor-pointer transition-all active:scale-95"
            aria-label="Close Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      
      {/* 1. TOP SECTION: Large Circular Anchor Logo and BANGLADESH NAVY */}
      <div id="sidebar-header" className="p-5 flex flex-col items-center text-center bg-[#001024]/95 shrink-0">
        {/* Large Circular Anchor Logo */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5 bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-600 shadow-2xl shadow-amber-500/35 border-3 border-amber-300 flex items-center justify-center overflow-hidden">
          <img 
            src="/anchor.jpg" 
            alt="Bangladesh Navy Crest" 
            className="w-full h-full object-cover rounded-full bg-black" 
            id="nav-anchor-logo" 
          />
        </div>

        {/* Text Below Logo: BANGLADESH NAVY */}
        <h1 className="text-base sm:text-lg font-algerian font-black tracking-widest text-amber-300 uppercase drop-shadow-md mt-3.5">
          BANGLADESH NAVY
        </h1>
        <p className="text-[11px] text-cyan-200/90 font-mono font-bold tracking-wider mt-0.5">
          {isAdmin ? '🛡️ এডমিন কনট্রোল প্যানেল' : 'বাংলাদেশ নৌবাহিনী'}
        </p>
      </div>

      {/* DIVIDER LINE 1 */}
      <div className="border-b-2 border-amber-500/40 w-full shrink-0"></div>

      {/* 2. MIDDLE SECTION: Navigation Items */}
      <nav id="sidebar-navigation" className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        {isAdmin ? (
          /* ================= ADMIN EXCLUSIVE NAVIGATION ================= */
          /* No Dashboard, Defect Entry, or Defect Find. Contains all Admin Control Panel items + Settings */
          <div className="space-y-2">
            <div className="px-2 py-1 flex items-center justify-between text-[11px] font-algerian font-bold text-amber-400/90 uppercase tracking-widest border-b border-amber-500/20 pb-1.5 mb-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                <span>ADMIN CONTROL PANEL</span>
              </span>
              <span className="text-[10px] text-amber-300/80 font-mono">HQ COMMAND</span>
            </div>

            {/* 1. WORKSHOPS */}
            <button
              id="admin-nav-workshops"
              onClick={() => handleSelectAdminOption('workshops')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-left cursor-pointer ${
                activeTab === 'admin' && adminSubTab === 'workshops'
                  ? 'bg-gradient-to-r from-amber-500/35 to-yellow-500/20 text-amber-300 font-extrabold shadow-md border-l-4 border-amber-400'
                  : 'hover:bg-white/5 hover:text-white text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Building2 className={`h-5 w-5 shrink-0 ${activeTab === 'admin' && adminSubTab === 'workshops' ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="font-algerian tracking-wider truncate">WORKSHOPS</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono font-bold shrink-0">
                {workshopsCount}
              </span>
            </button>

            {/* 2. FLEET (WARSHIPS) */}
            <button
              id="admin-nav-fleet"
              onClick={() => handleSelectAdminOption('fleet')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-left cursor-pointer ${
                activeTab === 'admin' && adminSubTab === 'fleet'
                  ? 'bg-gradient-to-r from-amber-500/35 to-yellow-500/20 text-amber-300 font-extrabold shadow-md border-l-4 border-amber-400'
                  : 'hover:bg-white/5 hover:text-white text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Ship className={`h-5 w-5 shrink-0 ${activeTab === 'admin' && adminSubTab === 'fleet' ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="font-algerian tracking-wider truncate">FLEET (WARSHIPS)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono font-bold shrink-0">
                {shipsCount}
              </span>
            </button>

            {/* 3. COMPARTMENTS */}
            <button
              id="admin-nav-locations"
              onClick={() => handleSelectAdminOption('locations')}
              className={`w-full flex items-center space-x-3 gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-left cursor-pointer ${
                activeTab === 'admin' && adminSubTab === 'locations'
                  ? 'bg-gradient-to-r from-amber-500/35 to-yellow-500/20 text-amber-300 font-extrabold shadow-md border-l-4 border-amber-400'
                  : 'hover:bg-white/5 hover:text-white text-slate-200'
              }`}
            >
              <MapPin className={`h-5 w-5 shrink-0 ${activeTab === 'admin' && adminSubTab === 'locations' ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="font-algerian tracking-wider truncate">COMPARTMENTS</span>
            </button>

            {/* 4. PRODUCTION DEPARTMENT */}
            <button
              id="admin-nav-production"
              onClick={() => handleSelectTab('production')}
              className={`w-full flex items-center space-x-3 gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-left cursor-pointer ${
                activeTab === 'production'
                  ? 'bg-gradient-to-r from-amber-500/35 to-yellow-500/20 text-amber-300 font-extrabold shadow-md border-l-4 border-amber-400'
                  : 'hover:bg-white/5 hover:text-white text-slate-200'
              }`}
            >
              <Layers className={`h-5 w-5 shrink-0 ${activeTab === 'production' ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="font-algerian tracking-wider truncate">PRODUCTION DEPT</span>
            </button>

            {/* 5. SETTINGS (সেটিংস - সাইটের যাবতীয় স্টেটিক অপশন) */}
            <button
              id="admin-nav-settings"
              onClick={() => handleSelectAdminOption('settings')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-left cursor-pointer ${
                activeTab === 'admin' && (adminSubTab === 'settings' || adminSubTab === 'site_info')
                  ? 'bg-gradient-to-r from-amber-500/35 to-yellow-500/20 text-amber-300 font-extrabold shadow-md border-l-4 border-amber-400'
                  : 'hover:bg-white/5 hover:text-white text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <SettingsIcon className={`h-5 w-5 shrink-0 ${activeTab === 'admin' && (adminSubTab === 'settings' || adminSubTab === 'site_info') ? 'text-amber-400 animate-spin-slow' : 'text-slate-400'}`} />
                <span className="font-algerian tracking-wider truncate">SETTINGS (সেটিংস)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono font-bold shrink-0">
                STATIC
              </span>
            </button>

            {/* 6. USERS (ইউজার - সবগুলো শপের লগইন তথ্য ও ছবি) */}
            <button
              id="admin-nav-users"
              onClick={() => handleSelectAdminOption('users')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-left cursor-pointer ${
                activeTab === 'admin' && adminSubTab === 'users'
                  ? 'bg-gradient-to-r from-amber-500/35 to-yellow-500/20 text-amber-300 font-extrabold shadow-md border-l-4 border-amber-400'
                  : 'hover:bg-white/5 hover:text-white text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Users className={`h-5 w-5 shrink-0 ${activeTab === 'admin' && adminSubTab === 'users' ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="font-algerian tracking-wider truncate">USERS (ইউজার)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono font-bold shrink-0">
                {workshopsCount}
              </span>
            </button>
          </div>
        ) : (
          /* ================= WORKSHOP USER REGULAR NAVIGATION ================= */
          <div className="space-y-2.5">
            {/* 1. DASHBOARD */}
            <button
              id="nav-btn-dashboard"
              onClick={() => handleSelectTab('dashboard')}
              className={`w-full flex items-center space-x-3 gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-left cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/20 text-amber-300 font-extrabold shadow-md border-l-4 border-amber-400'
                  : 'hover:bg-white/5 hover:text-white text-slate-200'
              }`}
            >
              <LayoutDashboard className={`h-5 w-5 shrink-0 ${activeTab === 'dashboard' ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="font-algerian tracking-wider truncate">DASHBOARD</span>
            </button>

            {/* 2. DEFECT ENTRY */}
            <button
              id="nav-btn-entry"
              onClick={() => handleSelectTab('entry')}
              className={`w-full flex items-center space-x-3 gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-left cursor-pointer ${
                activeTab === 'entry'
                  ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/20 text-amber-300 font-extrabold shadow-md border-l-4 border-amber-400'
                  : 'hover:bg-white/5 hover:text-white text-slate-200'
              }`}
            >
              <PlusCircle className={`h-5 w-5 shrink-0 ${activeTab === 'entry' ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="font-algerian tracking-wider truncate">DEFECT ENTRY</span>
            </button>

            {/* 3. IN PROGRESS JOBS (ইন প্রগ্রেস জব) */}
            <button
              id="nav-btn-inprogress"
              onClick={() => handleSelectTab('inprogress')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-left cursor-pointer ${
                activeTab === 'inprogress'
                  ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/20 text-amber-300 font-extrabold shadow-md border-l-4 border-amber-400'
                  : 'hover:bg-white/5 hover:text-white text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Hourglass className={`h-5 w-5 shrink-0 ${activeTab === 'inprogress' ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
                <span className="font-algerian tracking-wider truncate">IN PROGRESS JOBS</span>
              </div>
              {pendingCount !== undefined && pendingCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/30 border border-rose-400/50 text-rose-300 font-mono font-bold shrink-0 animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* 4. DEFECT FIND */}
            <button
              id="nav-btn-find"
              onClick={() => handleSelectTab('find')}
              className={`w-full flex items-center space-x-3 gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-left cursor-pointer ${
                activeTab === 'find'
                  ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/20 text-amber-300 font-extrabold shadow-md border-l-4 border-amber-400'
                  : 'hover:bg-white/5 hover:text-white text-slate-200'
              }`}
            >
              <Search className={`h-5 w-5 shrink-0 ${activeTab === 'find' ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="font-algerian tracking-wider truncate">DEFECT FIND</span>
            </button>

            {/* 5. PRODUCTION DEPARTMENT */}
            <button
              id="nav-btn-production"
              onClick={() => handleSelectTab('production')}
              className={`w-full flex items-center space-x-3 gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-left cursor-pointer ${
                activeTab === 'production'
                  ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/20 text-amber-300 font-extrabold shadow-md border-l-4 border-amber-400'
                  : 'hover:bg-white/5 hover:text-white text-slate-200'
              }`}
            >
              <Layers className={`h-5 w-5 shrink-0 ${activeTab === 'production' ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="font-algerian tracking-wider truncate">PRODUCTION DEPARTMENT</span>
            </button>
          </div>
        )}
      </nav>

      {/* DIVIDER LINE 2 */}
      <div className="border-b-2 border-amber-500/40 w-full shrink-0"></div>

      {/* 3. BOTTOM PROFILE SECTION: Circular Profile Photo, Name, Rank, Edit Profile Option */}
      <div id="sidebar-profile-footer" className="p-4 flex flex-col items-center text-center bg-[#001024]/95 shrink-0 space-y-2">
        {/* Large Circular Profile Photo */}
        <div className="relative group">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover border-3 border-amber-400 shadow-xl group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-[#001833] border-3 border-amber-400 flex items-center justify-center text-white shadow-xl">
              <User className="h-10 w-10 text-amber-400" />
            </div>
          )}
          <div className="absolute bottom-1 right-1 bg-emerald-400 w-4 h-4 rounded-full border-2 border-[#00142e]" title="Active"></div>
        </div>

        {/* Officer Name & Rank */}
        <div className="w-full px-2 min-w-0">
          <h4 className="text-sm sm:text-base font-algerian font-bold text-white truncate" title={authSession?.officerName || profile.name}>
            {authSession?.officerName || profile.name}
          </h4>
          <p className="text-xs text-amber-400 font-semibold truncate mt-0.5" title={profile.rank}>
            {profile.rank}
          </p>
          <p className="text-[10px] text-cyan-200/70 font-mono mt-0.5 truncate">
            {authSession?.username || profile.officialId}
          </p>
        </div>

        {/* Edit Profile Option */}
        <button
          type="button"
          onClick={handleOpenProfile}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 rounded-xl text-xs text-amber-300 font-algerian font-bold transition-all cursor-pointer shadow-sm active:scale-95 uppercase tracking-wider"
        >
          <User className="h-4 w-4 text-amber-400 shrink-0" />
          <span>EDIT PROFILE</span>
        </button>
      </div>

    </aside>
    </>
  );
}
