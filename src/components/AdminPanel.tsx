import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Building2, 
  Ship, 
  Settings as SettingsIcon, 
  User, 
  Database, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  RefreshCw, 
  Save, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Download, 
  Upload, 
  Info, 
  Phone, 
  Mail, 
  Bell, 
  Sliders, 
  Layers, 
  MapPin,
  CheckCircle2,
  FileSpreadsheet,
  Users,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Camera,
  Image as ImageIcon,
  Shield,
  ShieldAlert,
  ExternalLink,
  Anchor
} from 'lucide-react';
import { Workshop, DockyardConfig, UserProfile, Defect, AdminSubTab } from '../types';
import { DEFAULT_WORKSHOPS, DEFAULT_SHIPS, DEFAULT_LOCATIONS, DEFAULT_DOCKYARD_CONFIG, DEFAULT_PROFILE } from '../constants';
import { supabaseService } from '../services/supabaseService';
import { SUPABASE_SQL_SCHEMA } from '../lib/supabase';

interface AdminPanelProps {
  workshops: Workshop[];
  onUpdateWorkshops: (workshops: Workshop[]) => void;
  dockyardConfig: DockyardConfig;
  onUpdateDockyardConfig: (config: DockyardConfig) => void;
  ships: string[];
  onAddShip: (ship: string) => void;
  onDeleteShip: (ship: string) => void;
  locations: string[];
  onAddLocation: (location: string) => void;
  onDeleteLocation: (location: string) => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  defects: Defect[];
  onResetApp: () => void;
  riggingShopName: string;
  onUpdateRiggingShopName: (name: string) => void;
  initialSubTab?: AdminSubTab;
  onSubTabChange?: (subTab: AdminSubTab) => void;
  bgIntensity?: 'balanced' | 'vivid' | 'soft';
  onBgIntensityChange?: (mode: 'balanced' | 'vivid' | 'soft') => void;
}

export default function AdminPanel({
  workshops,
  onUpdateWorkshops,
  dockyardConfig,
  onUpdateDockyardConfig,
  ships,
  onAddShip,
  onDeleteShip,
  locations,
  onAddLocation,
  onDeleteLocation,
  profile,
  onUpdateProfile,
  defects,
  onResetApp,
  riggingShopName,
  onUpdateRiggingShopName,
  initialSubTab = 'workshops',
  onSubTabChange,
  bgIntensity = 'balanced',
  onBgIntensityChange
}: AdminPanelProps) {
  // Active Admin Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>(initialSubTab);

  // Sync when initialSubTab changes from parent
  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSubTabClick = (tab: AdminSubTab) => {
    setActiveSubTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };

  // Workshop management states
  const [workshopSearch, setWorkshopSearch] = useState<string>('');
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [isAddingWorkshop, setIsAddingWorkshop] = useState<boolean>(false);
  const [newWorkshopData, setNewWorkshopData] = useState<Partial<Workshop>>({
    code: `WS-${String(workshops.length + 1).padStart(2, '0')}`,
    nameBn: '',
    nameEn: '',
    category: 'Mechanical',
    oicRank: 'Lieutenant',
    oicName: '',
    phoneExt: '4230',
    status: 'active',
    description: ''
  });

  // Site Info State
  const [localConfig, setLocalConfig] = useState<DockyardConfig>(dockyardConfig);
  const [configSaveMsg, setConfigSaveMsg] = useState<boolean>(false);

  useEffect(() => {
    setLocalConfig(dockyardConfig);
  }, [dockyardConfig]);

  // Ship add state
  const [newShipInput, setNewShipInput] = useState<string>('');

  // Location add state
  const [newLocationInput, setNewLocationInput] = useState<string>('');

  // Profile states
  const [profileName, setProfileName] = useState<string>(profile.name);
  const [profileRank, setProfileRank] = useState<string>(profile.rank);
  const [profileId, setProfileId] = useState<string>(profile.officialId);
  const [profileAvatar, setProfileAvatar] = useState<string>(profile.avatar);
  const [adminPassword, setAdminPassword] = useState<string>(profile.password || 'admin123');
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);
  const [localRiggingName, setLocalRiggingName] = useState<string>(riggingShopName);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<boolean>(false);
  const [isSavingProfileToDb, setIsSavingProfileToDb] = useState<boolean>(false);
  const [isPushingToSupabase, setIsPushingToSupabase] = useState<boolean>(false);
  const [pushSupabaseMsg, setPushSupabaseMsg] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [showSqlPreview, setShowSqlPreview] = useState<boolean>(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SUPABASE_SQL_SCHEMA], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supabase-complete-setup.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    setProfileName(profile.name);
    setProfileRank(profile.rank);
    setProfileId(profile.officialId);
    setProfileAvatar(profile.avatar);
    setAdminPassword(profile.password || 'admin123');
  }, [profile]);

  // Users & Login Management State
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [userFilter, setUserFilter] = useState<'all' | 'with_photo' | 'no_photo' | 'active'>('all');
  const [showPasswordFor, setShowPasswordFor] = useState<Record<string, boolean>>({});
  const [editingWorkshopUser, setEditingWorkshopUser] = useState<Workshop | null>(null);
  const [isAddingUserModal, setIsAddingUserModal] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [userSuccessMsg, setUserSuccessMsg] = useState<string | null>(null);
  const [newUserForm, setNewUserForm] = useState({
    code: `WS-${String(workshops.length + 1).padStart(2, '0')}`,
    nameEn: '',
    nameBn: '',
    category: 'Mechanical',
    oicRank: 'Lieutenant',
    oicName: '',
    phoneExt: '4230',
    username: `oic.ws${String(workshops.length + 1).padStart(2, '0')}`,
    password: '123456',
    photo: '',
    status: 'active' as const,
    description: ''
  });

  const togglePasswordVisibility = (workshopId: string) => {
    setShowPasswordFor(prev => ({
      ...prev,
      [workshopId]: !prev[workshopId]
    }));
  };

  const handlePhotoUpload = async (workshopId: string, file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('ছবির সাইজ ৫ মেগাবাইটের (5MB) কম হতে হবে।');
      return;
    }
    const { url } = await supabaseService.uploadMediaToStorage(file, 'workshops');
    const updated = workshops.map(ws => {
      if (ws.id === workshopId) {
        return { ...ws, photo: url };
      }
      return ws;
    });
    onUpdateWorkshops(updated);
    setUserSuccessMsg('শপের অফিসিয়াল ছবি সফলভাবে আপলোড হয়েছে!');
    setTimeout(() => setUserSuccessMsg(null), 3000);
  };

  const handleRemovePhoto = (workshopId: string) => {
    const updated = workshops.map(ws => {
      if (ws.id === workshopId) {
        return { ...ws, photo: '' };
      }
      return ws;
    });
    onUpdateWorkshops(updated);
    setUserSuccessMsg('ছবি সফলভাবে অপসারন করা হয়েছে।');
    setTimeout(() => setUserSuccessMsg(null), 2500);
  };

  const handleSaveWorkshopUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkshopUser) return;
    const updated = workshops.map(ws => 
      ws.id === editingWorkshopUser.id ? editingWorkshopUser : ws
    );
    onUpdateWorkshops(updated);

    try {
      await supabaseService.upsertWorkshop(editingWorkshopUser);
    } catch (err) {
      console.warn('[Supabase] Error saving workshop user credentials:', err);
    }

    setEditingWorkshopUser(null);
    setUserSuccessMsg('শপ ইউজারের আইডি ও পাসওয়ার্ড সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!');
    setTimeout(() => setUserSuccessMsg(null), 3000);
  };

  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.nameEn.trim()) {
      alert('Workshop English name is required!');
      return;
    }
    const newWs: Workshop = {
      id: `ws-${Date.now()}`,
      code: newUserForm.code.trim() || `WS-${String(workshops.length + 1).padStart(2, '0')}`,
      nameEn: newUserForm.nameEn.trim(),
      nameBn: newUserForm.nameBn.trim() || newUserForm.nameEn.trim(),
      category: newUserForm.category || 'Mechanical',
      oicRank: newUserForm.oicRank || 'Lieutenant',
      oicName: newUserForm.oicName.trim() || 'Not Assigned',
      phoneExt: newUserForm.phoneExt.trim() || '4000',
      status: newUserForm.status,
      username: newUserForm.username.trim() || `oic.${newUserForm.code.toLowerCase().replace('-', '')}`,
      password: newUserForm.password.trim() || '123456',
      photo: newUserForm.photo || '',
      description: newUserForm.description || ''
    };
    onUpdateWorkshops([...workshops, newWs]);
    try {
      await supabaseService.upsertWorkshop(newWs);
    } catch (err) {
      console.warn('[Supabase] Error creating new workshop:', err);
    }
    setIsAddingUserModal(false);
    setUserSuccessMsg(`নতুন শপ ইউজার ${newWs.code} সফলভাবে ডাটাবেজে যুক্ত হয়েছে!`);
    setTimeout(() => setUserSuccessMsg(null), 3000);
  };

  const handleCopyCredentials = (ws: Workshop) => {
    const uName = ws.username || `oic.${ws.code.toLowerCase().replace('-', '')}`;
    const pWord = ws.password || '123456';
    const text = `⚓ BANGLADESH NAVY DOCKYARD\nWorkshop: ${ws.nameEn} (${ws.code})\nUsername: ${uName}\nPassword: ${pWord}\nOIC: ${ws.oicRank} ${ws.oicName}\nPhone Ext: ${ws.phoneExt}`;
    navigator.clipboard.writeText(text);
    setCopyFeedback(ws.id);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleExportUserCredentials = () => {
    const rows = [
      ['Shop Code', 'Workshop (EN)', 'Workshop (BN)', 'Category', 'Username', 'Password', 'OIC Rank & Name', 'Phone Ext', 'Status', 'Has Photo']
    ];
    workshops.forEach(ws => {
      rows.push([
        ws.code,
        `"${ws.nameEn}"`,
        `"${ws.nameBn}"`,
        `"${ws.category}"`,
        ws.username || `oic.${ws.code.toLowerCase().replace('-', '')}`,
        ws.password || '123456',
        `"${ws.oicRank} ${ws.oicName}"`,
        ws.phoneExt,
        ws.status,
        ws.photo ? 'Yes' : 'No'
      ]);
    });
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BN_Dockyard_Workshop_Users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter workshops
  const filteredWorkshops = workshops.filter(ws => {
    const q = workshopSearch.toLowerCase();
    return (
      ws.nameBn.toLowerCase().includes(q) ||
      ws.nameEn.toLowerCase().includes(q) ||
      ws.code.toLowerCase().includes(q) ||
      ws.category.toLowerCase().includes(q)
    );
  });

  // Filter workshop users
  const filteredUsers = workshops.filter(ws => {
    const q = userSearchQuery.toLowerCase().trim();
    const uName = (ws.username || `oic.${ws.code.toLowerCase().replace('-', '')}`).toLowerCase();
    const matchesSearch = !q || (
      ws.nameEn.toLowerCase().includes(q) ||
      ws.nameBn.toLowerCase().includes(q) ||
      ws.code.toLowerCase().includes(q) ||
      ws.category.toLowerCase().includes(q) ||
      ws.oicName.toLowerCase().includes(q) ||
      ws.oicRank.toLowerCase().includes(q) ||
      ws.phoneExt.includes(q) ||
      uName.includes(q)
    );

    let matchesFilter = true;
    if (userFilter === 'with_photo') {
      matchesFilter = Boolean(ws.photo);
    } else if (userFilter === 'no_photo') {
      matchesFilter = !ws.photo;
    } else if (userFilter === 'active') {
      matchesFilter = ws.status === 'active';
    }

    return matchesSearch && matchesFilter;
  });

  // Save Site Configuration
  const handleSaveSiteConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDockyardConfig(localConfig);
    setConfigSaveMsg(true);
    setTimeout(() => setConfigSaveMsg(false), 3000);
  };

  // Save Workshop Edit
  const handleSaveWorkshopEdit = async () => {
    if (!editingWorkshop) return;
    const updated = workshops.map(ws => ws.id === editingWorkshop.id ? editingWorkshop : ws);
    onUpdateWorkshops(updated);
    try {
      await supabaseService.upsertWorkshop(editingWorkshop);
    } catch (err) {
      console.warn('Upsert workshop error:', err);
    }
    setEditingWorkshop(null);
  };

  // Add Workshop
  const handleCreateWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkshopData.nameEn) {
      alert('Workshop English name is required!');
      return;
    }
    const fresh: Workshop = {
      id: `ws-${Date.now()}`,
      code: newWorkshopData.code || `WS-${String(workshops.length + 1).padStart(2, '0')}`,
      nameBn: newWorkshopData.nameBn || newWorkshopData.nameEn,
      nameEn: newWorkshopData.nameEn,
      category: newWorkshopData.category || 'General',
      oicRank: newWorkshopData.oicRank || 'Lieutenant',
      oicName: newWorkshopData.oicName || 'Not Assigned',
      phoneExt: newWorkshopData.phoneExt || '4000',
      status: (newWorkshopData.status as 'active' | 'inactive') || 'active',
      description: newWorkshopData.description || ''
    };
    onUpdateWorkshops([...workshops, fresh]);
    try {
      await supabaseService.upsertWorkshop(fresh);
    } catch (err) {
      console.warn('Upsert new workshop error:', err);
    }
    setIsAddingWorkshop(false);
    setNewWorkshopData({
      code: `WS-${String(workshops.length + 2).padStart(2, '0')}`,
      nameBn: '',
      nameEn: '',
      category: 'Mechanical',
      oicRank: 'Lieutenant',
      oicName: '',
      phoneExt: '4230',
      status: 'active',
      description: ''
    });
  };

  // Delete Workshop
  const handleDeleteWorkshop = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from the workshop registry?`)) {
      const updated = workshops.filter(ws => ws.id !== id);
      onUpdateWorkshops(updated);
      try {
        await supabaseService.deleteWorkshop(id);
      } catch (err) {
        console.warn('Delete workshop error:', err);
      }
    }
  };

  // Reset Workshops to 27 defaults
  const handleResetWorkshops = async () => {
    if (confirm('Are you sure you want to reset to the default 27 workshops?')) {
      onUpdateWorkshops(DEFAULT_WORKSHOPS);
      try {
        for (const ws of DEFAULT_WORKSHOPS) {
          await supabaseService.upsertWorkshop(ws);
        }
      } catch (err) {
        console.warn('Reset workshops error:', err);
      }
    }
  };

  // Save Profile (both local state and Supabase user_profile table)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfileToDb(true);
    const updated: UserProfile = {
      name: profileName,
      rank: profileRank,
      officialId: profileId.trim() || 'admin',
      avatar: profileAvatar,
      role: 'admin',
      password: adminPassword.trim() || 'admin123'
    };
    onUpdateProfile(updated);
    onUpdateRiggingShopName(localRiggingName.trim() || 'RIGGING SHOP');
    try {
      await supabaseService.saveUserProfile(updated);
    } catch (err) {
      console.warn('[Supabase] Save profile error:', err);
    } finally {
      setIsSavingProfileToDb(false);
      setProfileSuccessMsg(true);
      setTimeout(() => setProfileSuccessMsg(false), 3500);
    }
  };

  // Upload Admin Avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await supabaseService.uploadMediaToStorage(file, 'profiles');
      setProfileAvatar(res.url);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => setProfileAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Push all default / current data to Supabase Cloud
  const handlePushAllToSupabase = async () => {
    setIsPushingToSupabase(true);
    setPushSupabaseMsg(null);
    try {
      const res = await supabaseService.pushAllDefaultsToSupabase(
        workshops,
        ships,
        locations,
        dockyardConfig,
        profile,
        defects
      );
      if (res.success) {
        setPushSupabaseMsg(`সফলভাবে পুশ সম্পন্ন হয়েছে! (${res.counts.workshops}টি শপ, ${res.counts.ships}টি জাহাজ, ${res.counts.locations}টি কম্পার্টমেন্ট, ${res.counts.defects}টি ডিফেক্ট ক্লাউডে সংরক্ষিত)`);
      } else {
        setPushSupabaseMsg(res.message);
      }
    } catch (err: any) {
      setPushSupabaseMsg(`পুশ ব্যর্থ হয়েছে: ${err?.message || 'Error'}`);
    } finally {
      setIsPushingToSupabase(false);
      setTimeout(() => {
        setPushSupabaseMsg(null);
      }, 7000);
    }
  };

  // Export JSON Backup
  const handleExportData = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      dockyardConfig,
      workshops,
      ships,
      locations,
      defects,
      profile,
      riggingShopName
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bn_dockyard_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.workshops) onUpdateWorkshops(data.workshops);
        if (data.dockyardConfig) onUpdateDockyardConfig(data.dockyardConfig);
        if (data.defects) localStorage.setItem('defect_tracker_defects', JSON.stringify(data.defects));
        if (data.ships) localStorage.setItem('defect_tracker_ships', JSON.stringify(data.ships));
        alert('Data backup successfully restored! Reloading application...');
        window.location.reload();
      } catch (err) {
        alert('Invalid backup file format!');
      }
    };
    reader.readAsText(file);
  };

  // Lock body scroll when modal is open so the user stays focused on dialog
  useEffect(() => {
    if (editingWorkshopUser || isAddingUserModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [editingWorkshopUser, isAddingUserModal]);

  return (
    <div id="admin-panel-root" className="space-y-6 max-w-7xl mx-auto pb-8">
      
      {/* Admin Command Header Banner - Bangladesh Naval Green (#006A4E) & Cream (#FFFDD0) Design */}
      <div className="bg-gradient-to-r from-[#006A4E] via-[#355E3B] to-[#006A4E] text-[#FFFDD0] border-2 border-[#FFFDD0]/60 p-5 sm:p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        {/* Decorative naval anchor watermark */}
        <div className="absolute right-3 -bottom-6 opacity-10 pointer-events-none text-[#FFFDD0]">
          <Anchor className="h-44 w-44" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-md text-[11px] font-bold bg-[#FFFDD0] text-[#006A4E] font-mono tracking-wider shadow-xs flex items-center gap-1.5">
              <span>🛡️ এডমিন কমান্ড সেন্টার • ADMIN COMMAND</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#004d38]/80 text-[#FFFDD0] border border-[#FFFDD0]/40 font-mono shadow-xs">
              {dockyardConfig.systemVersion}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-algerian text-[#FFFDD0] tracking-wider">
            {dockyardConfig.yardNameEn || 'BANGLADESH NAVY DOCKYARD'} — কেন্দ্রীয় প্রশাসনিক কনসোল
          </h2>
          <p className="text-xs sm:text-sm text-[#FFFDD0]/90 mt-1.5 max-w-3xl leading-relaxed font-medium">
            ২৭টি নৌ ওয়ার্কশপ, যুদ্ধজাহাজের বহর, কম্পার্টমেন্ট লোকেশন, প্রোডাকশন বিভাগ ও সার্বিক সিস্টেম কনফিগারেশন নিয়ন্ত্রণ করুন।
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
          <div className="bg-[#FFFDD0] text-[#006A4E] border-2 border-[#FFFDD0] px-3.5 py-2 rounded-xl text-center min-w-[85px] shadow-xs">
            <span className="text-[10px] text-[#006A4E]/80 font-bold uppercase tracking-wider block font-mono">মোট শপ • Shops</span>
            <span className="text-base font-black text-[#006A4E] font-mono">{workshops.length}</span>
          </div>
          <div className="bg-[#FFFDD0] text-[#006A4E] border-2 border-[#FFFDD0] px-3.5 py-2 rounded-xl text-center min-w-[85px] shadow-xs">
            <span className="text-[10px] text-[#006A4E]/80 font-bold uppercase tracking-wider block font-mono">জাহাজ • Ships</span>
            <span className="text-base font-black text-[#006A4E] font-mono">{ships.length}</span>
          </div>
          <div className="bg-[#FFFDD0] text-[#006A4E] border-2 border-[#FFFDD0] px-3.5 py-2 rounded-xl text-center min-w-[85px] shadow-xs">
            <span className="text-[10px] text-[#006A4E]/80 font-bold uppercase tracking-wider block font-mono">ডিফেক্ট • Defects</span>
            <span className="text-base font-black text-[#006A4E] font-mono">{defects.length}</span>
          </div>
        </div>
      </div>

      {/* Admin Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-2 bg-white/95 border-2 border-[#006A4E]/30 hover:border-[#006A4E]/70 rounded-2xl shadow-sm transition-all">
        <button
          type="button"
          onClick={() => handleSubTabClick('workshops')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'workshops'
              ? 'bg-[#006A4E] text-[#FFFDD0] font-black border-2 border-[#FFFDD0]/60 shadow-xs font-algerian'
              : 'text-[#1B331F] hover:text-[#006A4E] hover:bg-[#FFFDD0]/50'
          }`}
        >
          <Building2 className={`h-4 w-4 ${activeSubTab === 'workshops' ? 'text-[#FFFDD0]' : 'text-[#006A4E]'}`} />
          <span>Workshops ({workshops.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleSubTabClick('fleet')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'fleet'
              ? 'bg-[#006A4E] text-[#FFFDD0] font-black border-2 border-[#FFFDD0]/60 shadow-xs font-algerian'
              : 'text-[#1B331F] hover:text-[#006A4E] hover:bg-[#FFFDD0]/50'
          }`}
        >
          <Ship className={`h-4 w-4 ${activeSubTab === 'fleet' ? 'text-[#FFFDD0]' : 'text-[#006A4E]'}`} />
          <span>Fleet ({ships.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleSubTabClick('locations')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'locations'
              ? 'bg-[#006A4E] text-[#FFFDD0] font-black border-2 border-[#FFFDD0]/60 shadow-xs font-algerian'
              : 'text-[#1B331F] hover:text-[#006A4E] hover:bg-[#FFFDD0]/50'
          }`}
        >
          <MapPin className={`h-4 w-4 ${activeSubTab === 'locations' ? 'text-[#FFFDD0]' : 'text-[#006A4E]'}`} />
          <span>Compartments</span>
        </button>

        <button
          type="button"
          onClick={() => handleSubTabClick('settings')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'settings' || activeSubTab === 'site_info'
              ? 'bg-[#006A4E] text-[#FFFDD0] font-black border-2 border-[#FFFDD0]/60 shadow-xs font-algerian'
              : 'text-[#1B331F] hover:text-[#006A4E] hover:bg-[#FFFDD0]/50'
          }`}
        >
          <SettingsIcon className={`h-4 w-4 ${activeSubTab === 'settings' || activeSubTab === 'site_info' ? 'text-[#FFFDD0] animate-spin-slow' : 'text-[#006A4E]'}`} />
          <span>Settings (সেটিংস)</span>
        </button>

        <button
          type="button"
          onClick={() => handleSubTabClick('users')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'users'
              ? 'bg-[#006A4E] text-[#FFFDD0] font-black border-2 border-[#FFFDD0]/60 shadow-xs font-algerian'
              : 'text-[#1B331F] hover:text-[#006A4E] hover:bg-[#FFFDD0]/50'
          }`}
        >
          <Users className={`h-4 w-4 ${activeSubTab === 'users' ? 'text-[#FFFDD0]' : 'text-[#006A4E]'}`} />
          <span>Users (ইউজার)</span>
        </button>

        <button
          type="button"
          onClick={() => handleSubTabClick('profile')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'profile'
              ? 'bg-[#006A4E] text-[#FFFDD0] font-black border-2 border-[#FFFDD0]/60 shadow-xs font-algerian'
              : 'text-[#1B331F] hover:text-[#006A4E] hover:bg-[#FFFDD0]/50'
          }`}
        >
          <User className={`h-4 w-4 ${activeSubTab === 'profile' ? 'text-[#FFFDD0]' : 'text-[#006A4E]'}`} />
          <span>Profile (এডমিন প্রোফাইল)</span>
        </button>
      </div>

      {/* SUB-TAB 1: 27 WORKSHOPS MANAGEMENT */}
      {activeSubTab === 'workshops' && (
        <div className="bg-white/95 rounded-2xl border-2 border-[#006A4E]/30 hover:border-[#006A4E]/80 p-5 sm:p-6 shadow-sm space-y-5 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-[#006A4E]/15">
            <div>
              <h3 className="text-base font-bold text-[#006A4E] flex items-center gap-2 font-algerian">
                <Building2 className="h-5 w-5 text-[#006A4E]" />
                <span>Naval Dockyard Workshop Registry ({workshops.length} Workshops)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure workshop names, code, Officer-in-Charge (OIC), and maintenance scope.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsAddingWorkshop(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#006A4E] to-[#004e39] hover:from-[#005740] hover:to-[#00402e] text-[#FFFDD0] font-bold border-2 border-[#FFFDD0]/60 hover:border-[#FFFDD0] rounded-xl text-xs font-algerian tracking-wider flex items-center gap-1.5 shadow-md hover:shadow-xl transition-all cursor-pointer active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Add Workshop</span>
              </button>
              <button
                type="button"
                onClick={handleResetWorkshops}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-[#001738] rounded-xl text-xs font-bold flex items-center gap-1.5 border-2 border-slate-300 hover:border-slate-400 transition-all cursor-pointer active:scale-95 shadow-xs"
                title="Reset to 27 official workshops"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                <span>Default 27 Shops</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={workshopSearch}
              onChange={(e) => setWorkshopSearch(e.target.value)}
              placeholder="Search workshop (e.g. Rigging, Machine, WS-01, Pipe)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
            />
          </div>

          {/* Add Workshop Form Modal / Inline */}
          {isAddingWorkshop && (
            <form onSubmit={handleCreateWorkshop} className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Plus className="h-4 w-4 text-emerald-600" />
                  ADD NEW WORKSHOP
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingWorkshop(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">WORKSHOP CODE</label>
                  <input
                    type="text"
                    value={newWorkshopData.code}
                    onChange={(e) => setNewWorkshopData({...newWorkshopData, code: e.target.value})}
                    placeholder="e.g. WS-28"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">NAME (ENGLISH)</label>
                  <input
                    type="text"
                    value={newWorkshopData.nameEn}
                    onChange={(e) => setNewWorkshopData({...newWorkshopData, nameEn: e.target.value})}
                    placeholder="e.g. Dock Security Shop"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">CATEGORY / DIVISION</label>
                  <input
                    type="text"
                    value={newWorkshopData.category}
                    onChange={(e) => setNewWorkshopData({...newWorkshopData, category: e.target.value})}
                    placeholder="e.g. Mechanical / Hull"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">INTERCOM EXT</label>
                  <input
                    type="text"
                    value={newWorkshopData.phoneExt}
                    onChange={(e) => setNewWorkshopData({...newWorkshopData, phoneExt: e.target.value})}
                    placeholder="e.g. 4230"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">OIC RANK</label>
                  <input
                    type="text"
                    value={newWorkshopData.oicRank}
                    onChange={(e) => setNewWorkshopData({...newWorkshopData, oicRank: e.target.value})}
                    placeholder="e.g. Lieutenant Commander"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">OIC NAME</label>
                  <input
                    type="text"
                    value={newWorkshopData.oicName}
                    onChange={(e) => setNewWorkshopData({...newWorkshopData, oicName: e.target.value})}
                    placeholder="e.g. M A Rahman"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingWorkshop(false)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Workshop</span>
                </button>
              </div>
            </form>
          )}

          {/* Edit Workshop Modal Dialog Box */}
          {editingWorkshop && typeof document !== 'undefined' && createPortal(
            <div 
              id="edit-workshop-dialog-overlay"
              className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
            >
              <div 
                id="edit-workshop-dialog-card"
                className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-slate-800 flex flex-col max-h-[92vh] animate-scale-up"
              >
                {/* Header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700">
                      <Edit3 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-wide uppercase font-mono">
                        Edit Workshop: {editingWorkshop.code}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{editingWorkshop.nameEn} ({editingWorkshop.nameBn})</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingWorkshop(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Body Form */}
                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">WORKSHOP CODE</label>
                      <input
                        type="text"
                        value={editingWorkshop.code}
                        onChange={(e) => setEditingWorkshop({...editingWorkshop, code: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">NAME (ENGLISH)</label>
                      <input
                        type="text"
                        value={editingWorkshop.nameEn}
                        onChange={(e) => setEditingWorkshop({...editingWorkshop, nameEn: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">NAME (BANGLA)</label>
                      <input
                        type="text"
                        value={editingWorkshop.nameBn}
                        onChange={(e) => setEditingWorkshop({...editingWorkshop, nameBn: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">CATEGORY</label>
                      <input
                        type="text"
                        value={editingWorkshop.category}
                        onChange={(e) => setEditingWorkshop({...editingWorkshop, category: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">OIC RANK</label>
                      <input
                        type="text"
                        value={editingWorkshop.oicRank}
                        onChange={(e) => setEditingWorkshop({...editingWorkshop, oicRank: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">OIC NAME</label>
                      <input
                        type="text"
                        value={editingWorkshop.oicName}
                        onChange={(e) => setEditingWorkshop({...editingWorkshop, oicName: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">INTERCOM / PHONE EXT</label>
                      <input
                        type="text"
                        value={editingWorkshop.phoneExt}
                        onChange={(e) => setEditingWorkshop({...editingWorkshop, phoneExt: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">STATUS</label>
                      <select
                        value={editingWorkshop.status}
                        onChange={(e) => setEditingWorkshop({...editingWorkshop, status: e.target.value as 'active' | 'inactive'})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
                      >
                        <option value="active">Active (সক্রিয়)</option>
                        <option value="inactive">Inactive (নিষ্ক্রিয়)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">MAINTENANCE WORK SCOPE</label>
                    <textarea
                      rows={3}
                      value={editingWorkshop.description || ''}
                      onChange={(e) => setEditingWorkshop({...editingWorkshop, description: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
                      placeholder="Summary of technical responsibilities..."
                    />
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingWorkshop(null)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-medium cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveWorkshopEdit}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save & Update Database</span>
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Workshops Table - Executive Naval Styling */}
          <div className="overflow-x-auto border-2 border-slate-200/90 rounded-xl bg-white shadow-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#001738] text-amber-300 font-bold uppercase text-[11px] border-b-2 border-amber-500 font-algerian tracking-wider">
                <tr>
                  <th className="py-3 px-4">CODE</th>
                  <th className="py-3 px-4">WORKSHOP NAME</th>
                  <th className="py-3 px-4">DIVISION / CATEGORY</th>
                  <th className="py-3 px-4">OFFICER-IN-CHARGE (OIC)</th>
                  <th className="py-3 px-4">INTERCOM</th>
                  <th className="py-3 px-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWorkshops.map((ws) => (
                  <tr key={ws.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs text-slate-800 font-mono">
                        {ws.code}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 text-sm">{ws.nameEn}</div>
                      {ws.description && (
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{ws.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] text-slate-600 border border-slate-200">
                        {ws.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-normal text-slate-500">{ws.oicRank}</span>{' '}
                      <span className="font-semibold text-slate-800">{ws.oicName}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {ws.phoneExt}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingWorkshop(ws)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Edit Workshop"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteWorkshop(ws.id, ws.nameEn)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                          title="Delete Workshop"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: STATIC WEBSITE SETTINGS (সেটিংস) */}
      {(activeSubTab === 'settings' || activeSubTab === 'site_info') && (
        <form onSubmit={handleSaveSiteConfig} className="bg-white/95 rounded-2xl border-2 border-[#006A4E]/30 hover:border-[#006A4E]/80 p-5 sm:p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in transition-all">
          {/* Settings Top Bar */}
          <div className="pb-5 border-b-2 border-[#006A4E]/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-[#006A4E] rounded-xl border border-[#FFFDD0]/40 text-[#FFFDD0] shadow-md shrink-0">
                  <SettingsIcon className="h-6 w-6 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#006A4E] flex items-center gap-2 font-algerian">
                    <span>Website Settings & Configuration (ওয়েবসাইটের সেটিংস)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    হেডার টাইটেল, লগো, স্ক্রলিং নোটিশ, জরুরি এলার্ট, লগইন স্ক্রিন টেক্সট ও সিস্টেমের যাবতীয় কনফিগারেশন।
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {configSaveMsg && (
                <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>সেটিংস সফলভাবে সংরক্ষিত হয়েছে! (Saved!)</span>
                </div>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-[#001f3f] via-[#002855] to-[#001f3f] hover:from-[#001738] hover:via-[#002147] hover:to-[#001738] text-amber-300 font-bold border-2 border-amber-400/60 hover:border-amber-300 rounded-xl text-xs font-algerian tracking-wider flex items-center gap-2 shadow-md hover:shadow-xl transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <Save className="h-4 w-4 text-amber-400" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 uppercase">
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-slate-500" />
                <span>লাইভ প্রিভিউ (Header & Marquee Live Preview)</span>
              </span>
              <span className="text-emerald-600 text-[10px] font-normal">Real-time preview as typed</span>
            </div>
            {/* Mini Header Preview */}
            <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center gap-3 shadow-xs">
              <div className="w-12 h-12 rounded-full p-0.5 border border-slate-200 shrink-0 flex items-center justify-center bg-white overflow-hidden">
                <img 
                  src={localConfig.headerLogoUrl || '/asd_monogram.jpg'} 
                  alt="Preview Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm sm:text-base font-black text-slate-900 tracking-wider uppercase truncate">
                  {localConfig.headerTitle || 'AREA SUPERINTENDENT DOCKYARD'}
                </div>
                {localConfig.headerSubtitle && (
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">
                    {localConfig.headerSubtitle}
                  </div>
                )}
              </div>
            </div>
            {/* Mini Marquee Preview */}
            {localConfig.showMarquee !== false && (
              <div className="bg-white rounded-lg p-2 border border-slate-200 flex items-center gap-2 text-xs overflow-hidden">
                <span className="px-2 py-0.5 bg-slate-900 text-white font-bold rounded text-[10px] shrink-0">
                  {localConfig.marqueeBadge || 'COMMAND DISPATCH'}
                </span>
                <span className="text-slate-700 truncate text-[11px]">
                  {localConfig.marqueeText || '⚓ WELCOME TO AREA SUPERINTENDENT DOCKYARD ⚓'}
                </span>
              </div>
            )}
          </div>

          {/* Section 1: Header & Logo Identity */}
          <div className="space-y-4 bg-slate-50/50 p-5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              <span>1. হেডার ও লগো সেটিংস (Header & Crest Logo Configuration)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                  <span>হেডার মেইন টাইটেল (HEADER DISPLAY TITLE)</span>
                  <span className="text-[10px] text-slate-400">English Caps</span>
                </label>
                <input
                  type="text"
                  value={localConfig.headerTitle || 'AREA SUPERINTENDENT DOCKYARD'}
                  onChange={(e) => setLocalConfig({...localConfig, headerTitle: e.target.value})}
                  required
                  placeholder="e.g. AREA SUPERINTENDENT DOCKYARD"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-bold text-slate-900 outline-none uppercase tracking-wider transition-colors"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  হোম পেজ ও ড্যাশবোর্ডের হেডারে লোগোর ডানে বড় অক্ষরে পুরো হেডার জুড়ে প্রদর্শিত হয়।
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                  <span>হেডার সাবটাইটেল (HEADER SUBTITLE / TAGLINE)</span>
                  <span className="text-[10px] text-slate-400">Optional</span>
                </label>
                <input
                  type="text"
                  value={localConfig.headerSubtitle ?? 'BANGLADESH NAVY'}
                  onChange={(e) => setLocalConfig({...localConfig, headerSubtitle: e.target.value})}
                  placeholder="e.g. BANGLADESH NAVY"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-semibold text-slate-800 outline-none uppercase tracking-wider transition-colors"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  হেডার টাইটেলের নিচে সাবটাইটেল হিসেবে প্রদর্শিত হয় (যেমন: BANGLADESH NAVY)।
                </p>
              </div>

              {/* Logo Selection & Custom Upload */}
              <div className="md:col-span-2 bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-800 block flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-slate-600" />
                    <span>হেডার অফিসিয়াল লগো নির্বাচন বা আপলোড (Official Crest Logo)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">ASD Monogram / Anchor Crest / Custom</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Preset 1: ASD Navy Crest */}
                  <button
                    type="button"
                    onClick={() => setLocalConfig({ ...localConfig, headerLogoUrl: '/asd_navy_logo.jpg' })}
                    className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                      (localConfig.headerLogoUrl === '/asd_navy_logo.jpg' || localConfig.headerLogoUrl === '/asd_monogram.jpg' || !localConfig.headerLogoUrl)
                        ? 'bg-slate-100 border-slate-800 ring-1 ring-slate-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-white p-0.5 border border-slate-200 shrink-0 flex items-center justify-center overflow-hidden">
                      <img src="/asd_navy_logo.jpg" alt="ASD Crest" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">ASD Navy Crest</p>
                      <p className="text-[10px] text-slate-500">অফিসিয়াল লগো / ASD Crest</p>
                    </div>
                  </button>

                  {/* Preset 2: BN Navy Anchor */}
                  <button
                    type="button"
                    onClick={() => setLocalConfig({ ...localConfig, headerLogoUrl: '/anchor.jpg' })}
                    className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                      localConfig.headerLogoUrl === '/anchor.jpg'
                        ? 'bg-slate-100 border-slate-800 ring-1 ring-slate-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-black p-0.5 border border-slate-200 shrink-0 flex items-center justify-center overflow-hidden">
                      <img src="/anchor.jpg" alt="Navy Crest" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Navy Anchor Crest</p>
                      <p className="text-[10px] text-slate-500">BN Traditional Crest</p>
                    </div>
                  </button>

                  {/* Option 3: Custom Upload File */}
                  <label className="p-3 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/70 flex items-center gap-3 text-left transition-all cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 flex items-center justify-center text-slate-600">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800">নতুন লগো আপলোড</p>
                      <p className="text-[10px] text-slate-500 truncate">ডিভাইস থেকে ছবি আপলোড করুন</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 3 * 1024 * 1024) {
                            alert('লগোর সাইজ ৩ মেগাবাইট (3MB) এর কম হতে হবে।');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => {
                            const dataUrl = reader.result as string;
                            setLocalConfig(prev => ({ ...prev, headerLogoUrl: dataUrl }));
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="hidden"
                      />
                    </div>
                  </label>
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">
                    বা সরাসরি লগো ইমেজ পাথ / লিংক (Direct Image URL / Path):
                  </label>
                  <input
                    type="text"
                    value={localConfig.headerLogoUrl || '/asd_monogram.jpg'}
                    onChange={(e) => setLocalConfig({...localConfig, headerLogoUrl: e.target.value})}
                    placeholder="e.g. /asd_monogram.jpg or https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-lg text-xs font-mono text-slate-800 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                  <span>কমান্ড হেডকোয়ার্টার্স / বেস (COMMAND BASE / LOCATION)</span>
                  <span className="text-[10px] text-slate-400">Chattogram</span>
                </label>
                <input
                  type="text"
                  value={localConfig.commandBase}
                  onChange={(e) => setLocalConfig({...localConfig, commandBase: e.target.value})}
                  required
                  placeholder="e.g. BNS ISSA KHAN / NEW MOORING, CHATTOGRAM"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs text-slate-800 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  ডকইয়ার্ড নাম (ENGLISH)
                </label>
                <input
                  type="text"
                  value={localConfig.yardNameEn}
                  onChange={(e) => setLocalConfig({...localConfig, yardNameEn: e.target.value})}
                  required
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-bold text-slate-800 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  ডকইয়ার্ড নাম (বাংলা)
                </label>
                <input
                  type="text"
                  value={localConfig.yardNameBn}
                  onChange={(e) => setLocalConfig({...localConfig, yardNameBn: e.target.value})}
                  required
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs text-slate-800 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  অফিসিয়াল নৌবাহিনীর মূলমন্ত্র / স্লোগান (OFFICIAL NAVAL MOTTO)
                </label>
                <input
                  type="text"
                  value={localConfig.yardMotto}
                  onChange={(e) => setLocalConfig({...localConfig, yardMotto: e.target.value})}
                  required
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-medium text-slate-800 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Top Marquee & Announcement */}
          <div className="space-y-4 bg-slate-50/50 p-5 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-slate-600" />
                <span>2. হেডারের স্ক্রলিং নোটিশ ও মারর্কি এনাউন্সমেন্ট (Running Marquee)</span>
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-sans">
                <input
                  type="checkbox"
                  checked={localConfig.showMarquee !== false}
                  onChange={(e) => setLocalConfig({...localConfig, showMarquee: e.target.checked})}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-400 cursor-pointer"
                />
                <span>স্ক্রলিং ব্যানার প্রদর্শন করুন (Show Running Marquee)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  ব্যানার ব্যাজ লেবেল (BADGE LABEL)
                </label>
                <input
                  type="text"
                  value={localConfig.marqueeBadge || 'COMMAND DISPATCH'}
                  onChange={(e) => setLocalConfig({...localConfig, marqueeBadge: e.target.value})}
                  placeholder="e.g. COMMAND DISPATCH"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-bold text-slate-900 outline-none transition-colors"
                />
                <p className="text-[10px] text-slate-500 mt-1">মারর্কির শুরুতে থাকা ব্যাজের নাম</p>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  স্ক্রলিং নোটিশ টেক্সট (RUNNING MARQUEE BROADCAST MESSAGE)
                </label>
                <input
                  type="text"
                  value={localConfig.marqueeText || '⚓ WELCOME TO AREA SUPERINTENDENT DOCKYARD ⚓ — BANGLADESH NAVY DOCKYARD CHATTOGRAM — TECHNICAL DEFECT TRACKING & FLEET MAINTENANCE COMMAND ⚓'}
                  onChange={(e) => setLocalConfig({...localConfig, marqueeText: e.target.value})}
                  placeholder="Enter running marquee text..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs text-slate-800 outline-none transition-colors"
                />
                <p className="text-[10px] text-slate-500 mt-1">হোম পেজ ও ড্যাশবোর্ডে ডান থেকে বামে স্ক্রল হওয়া মূল বার্তা</p>
              </div>

              <div className="md:col-span-3">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  ওয়ার্কশপ নোটিশ বোর্ড টেক্সট (NOTICE BOARD DIRECTIVE)
                </label>
                <textarea
                  value={localConfig.noticeText}
                  onChange={(e) => setLocalConfig({...localConfig, noticeText: e.target.value})}
                  rows={2}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs text-slate-800 outline-none placeholder:text-slate-400 transition-colors"
                  placeholder="Announcement text to be displayed across dockyard maintenance logs..."
                />
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Alert Directive */}
          <div className="space-y-4 bg-slate-50/50 p-5 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-rose-700 uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-600" />
                <span>3. বিশেষ জরুরি এলার্ট ব্যানার (Emergency Alert Banner)</span>
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-sans">
                <input
                  type="checkbox"
                  checked={localConfig.emergencyAlertEnabled === true}
                  onChange={(e) => setLocalConfig({...localConfig, emergencyAlertEnabled: e.target.checked})}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-400 cursor-pointer"
                />
                <span>জরুরি নোটিশ ব্যানার সক্রিয় করুন (Enable Red Alert Bar)</span>
              </label>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                জরুরি বার্তার টেক্সট (EMERGENCY BROADCAST MESSAGE)
              </label>
              <input
                type="text"
                value={localConfig.emergencyAlertText || ''}
                onChange={(e) => setLocalConfig({...localConfig, emergencyAlertText: e.target.value})}
                placeholder="e.g. ⚡ WEATHER WARNING: GALE WARNING SIGNAL 4 HOISTED AT CHATTOGRAM PORT — SECURE ALL DOCKYARD CRANES AND MOORING LINES."
                className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-rose-400 rounded-xl text-xs text-slate-800 outline-none transition-colors"
              />
              <p className="text-[10px] text-slate-500 mt-1">সক্রিয় করা হলে হেডারের ঠিক নিচে জরুরি এলার্ট প্রদর্শন হবে।</p>
            </div>
          </div>

          {/* Section 4: Login Screen Welcome Text */}
          <div className="space-y-4 bg-slate-50/50 p-5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              <span>4. লগইন স্ক্রিন স্বাগতম টেক্সট সেটিংস (Login Portal Customization)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  লগইন ডায়ালগ মেইন টাইটেল (LOGIN CARD TITLE)
                </label>
                <input
                  type="text"
                  value={localConfig.loginWelcomeTitle || 'WORKSHOP LOGIN PORTAL'}
                  onChange={(e) => setLocalConfig({...localConfig, loginWelcomeTitle: e.target.value})}
                  placeholder="e.g. WORKSHOP LOGIN PORTAL"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-bold text-slate-800 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  লগইন সাবটাইটেল (LOGIN CARD SUBTITLE)
                </label>
                <input
                  type="text"
                  value={localConfig.loginWelcomeSubtitle || 'BANGLADESH NAVY DOCKYARD • WORKSHOP ACCESS'}
                  onChange={(e) => setLocalConfig({...localConfig, loginWelcomeSubtitle: e.target.value})}
                  placeholder="e.g. BANGLADESH NAVY DOCKYARD • WORKSHOP ACCESS"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs text-slate-600 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Operational Logistics & Shift Config */}
          <div className="space-y-4 bg-slate-50/50 p-5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              <span>5. অপারেশনাল ও শিফট স্ট্যাটাস (Operations & Shift Status)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  টেকনিক্যাল অপারেশনাল রেডিনেস (READINESS STATUS)
                </label>
                <input
                  type="text"
                  value={localConfig.operationalReadiness || '100%'}
                  onChange={(e) => setLocalConfig({...localConfig, operationalReadiness: e.target.value})}
                  placeholder="e.g. 100% Operational"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-mono font-bold text-emerald-700 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  চলমান ডিউটি শিফট (CURRENT TECHNICAL SHIFT)
                </label>
                <input
                  type="text"
                  value={localConfig.activeShift || 'General Shift (0730 - 1430 hrs)'}
                  onChange={(e) => setLocalConfig({...localConfig, activeShift: e.target.value})}
                  placeholder="e.g. General Shift (0730 - 1430 hrs)"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs text-slate-800 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Contact & Technical Helpdesk */}
          <div className="space-y-4 bg-slate-50/50 p-5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              <span>6. হেল্পডেস্ক ও টেকনিক্যাল যোগাযোগ (Technical Helpdesk & Contacts)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-600" />
                  <span>ইন্টারকম / ফোন (HELPDESK EXT)</span>
                </label>
                <input
                  type="text"
                  value={localConfig.contactPhone}
                  onChange={(e) => setLocalConfig({...localConfig, contactPhone: e.target.value})}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-mono text-slate-800 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-600" />
                  <span>অফিসিয়াল ইমেইল (OFFICIAL EMAIL)</span>
                </label>
                <input
                  type="email"
                  value={localConfig.contactEmail}
                  onChange={(e) => setLocalConfig({...localConfig, contactEmail: e.target.value})}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-mono text-slate-800 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-600" />
                  <span>জরুরি হটলাইন (HOTLINE CELL)</span>
                </label>
                <input
                  type="text"
                  value={localConfig.supportHotline || '+880 1769-724200'}
                  onChange={(e) => setLocalConfig({...localConfig, supportHotline: e.target.value})}
                  placeholder="+880 1769-724200"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-mono text-slate-800 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  সিস্টেম ভার্সন ট্যাগ (VERSION)
                </label>
                <input
                  type="text"
                  value={localConfig.systemVersion}
                  onChange={(e) => setLocalConfig({...localConfig, systemVersion: e.target.value})}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-mono text-slate-800 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 7: Data Backup & System Restore */}
          <div className="space-y-5 bg-slate-50/50 p-5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              <span>7. ক্লাউড ডাটাবেজ পারসিস্টেন্স ও ব্যাকআপ (Cloud Persistence & Backup)</span>
            </div>

            {/* Supabase Push All Feature */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Database className="h-4 w-4 text-slate-700" />
                    <span>সোপাবেজ ক্লাউডে সমস্ত ডাটা পুশ করুন (Push All to Supabase)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    ওয়েবসাইট ডিপ্লয়ের পর সমস্ত কনফিগারেশন, ২৭টি শপ, ১৭টি জাহাজ, ১০টি কম্পার্টমেন্ট ও এডমিন প্রোফাইল স্থায়ীভাবে সংরক্ষিত রাখতে এই বাটনে ক্লিক করুন।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePushAllToSupabase}
                  disabled={isPushingToSupabase}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm shrink-0 cursor-pointer active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isPushingToSupabase ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <span>{isPushingToSupabase ? 'পুশ হচ্ছে...' : 'পুশ টু সোপাবেজ'}</span>
                </button>
              </div>

              {pushSupabaseMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2 animate-fade-in">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{pushSupabaseMsg}</span>
                </div>
              )}
            </div>

            {/* Supabase SQL Script & Bucket Setup */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Database className="h-4 w-4 text-[#006A4E]" />
                    <span>সোপাবেজ এসকিউএল স্ক্রিপ্ট ও বাকেট স্কিমা (Supabase SQL & Bucket Schema)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    সোপাবেজ ড্যাশবোর্ডের <code className="text-[#006A4E] font-bold">SQL Editor</code>-এ রান করার জন্য প্রয়োজনীয় সকল টেবিল, বাকেট (<code className="text-[#006A4E]">dockyard-media</code>), আরএলএস পলিসি ও ২৭টি শপের ইনিশিয়াল ডাটা।
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="px-3.5 py-2 bg-[#006A4E] hover:bg-[#005740] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 transition-all"
                  >
                    {copiedSql ? <Check className="h-3.5 w-3.5 text-[#FFFDD0]" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSql ? 'কপি হয়েছে!' : 'এসকিউএল কপি'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSql}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-300 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>.sql ডাউনলোড</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSqlPreview(!showSqlPreview)}
                    className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-medium border border-slate-200 cursor-pointer transition-all"
                  >
                    {showSqlPreview ? 'প্রিভিউ লুকান' : 'প্রিভিউ'}
                  </button>
                </div>
              </div>

              {showSqlPreview && (
                <div className="mt-3 p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-emerald-300 max-h-60 overflow-y-auto border border-slate-700 shadow-inner select-text">
                  <pre className="whitespace-pre-wrap">{SUPABASE_SQL_SCHEMA}</pre>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600">
              এছাড়াও অফলাইন সংরক্ষণের জন্য সিস্টেমের যাবতীয় তথ্য JSON ফাইলে এক্সপোর্ট বা ইম্পোর্ট করতে পারেন:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleExportData}
                className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Download className="h-4 w-4 text-slate-600" />
                <span>Download JSON Backup</span>
              </button>
              <label className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs">
                <Upload className="h-4 w-4 text-slate-600" />
                <span>Restore JSON Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('আপনি কি নিশ্চিত যে সমস্ত ওয়েবসাইট সেটিংস ডিফল্ট মানে ফিরিয়ে আনতে চান?')) {
                  setLocalConfig(DEFAULT_DOCKYARD_CONFIG);
                  onUpdateDockyardConfig(DEFAULT_DOCKYARD_CONFIG);
                  setConfigSaveMsg(true);
                  setTimeout(() => setConfigSaveMsg(false), 3000);
                }
              }}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5 text-rose-600" />
              <span>রিসেট ডিফল্ট (Reset Factory Defaults)</span>
            </button>

            <div className="flex items-center gap-3">
              {configSaveMsg && (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 animate-fade-in">
                  <Check className="h-4 w-4" />
                  <span>সেটিংস সংরক্ষিত হয়েছে!</span>
                </span>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Save className="h-4 w-4 text-white" />
                <span>Save All Settings (সমস্ত সেটিংস সেভ করুন)</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* SUB-TAB 3: SHIPS FLEET MANAGEMENT */}
      {activeSubTab === 'fleet' && (
        <div className="bg-white/95 rounded-2xl border-2 border-[#006A4E]/30 hover:border-[#006A4E]/80 p-5 sm:p-6 shadow-sm space-y-5 transition-all">
          <div className="pb-4 border-b-2 border-[#006A4E]/15">
            <h3 className="text-base font-bold text-[#006A4E] flex items-center gap-2 font-algerian">
              <Ship className="h-5 w-5 text-[#006A4E]" />
              <span>Active Naval Warship Fleet ({ships.length} Vessels)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage warship vessels available across defect entry, tracking, and 3D inspection models.
            </p>
          </div>

          {/* Add Ship Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newShipInput.trim()) {
                onAddShip(newShipInput.trim());
                setNewShipInput('');
              }
            }}
            className="flex gap-2 max-w-xl"
          >
            <input
              type="text"
              value={newShipInput}
              onChange={(e) => setNewShipInput(e.target.value)}
              placeholder="Enter warship name (e.g. BNS Samudra Gaurav)..."
              required
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#001f3f] via-[#002855] to-[#001f3f] hover:from-[#001738] hover:via-[#002147] hover:to-[#001738] text-amber-300 font-bold border-2 border-amber-400/60 hover:border-amber-300 rounded-xl text-xs font-algerian tracking-wider flex items-center gap-1.5 shadow-md hover:shadow-xl transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add Vessel</span>
            </button>
          </form>

          {/* Ships Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {ships.map((shipName) => (
              <div
                key={shipName}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Ship className="h-4 w-4 text-slate-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-900 truncate" title={shipName}>
                    {shipName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteShip(shipName)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Remove Vessel"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: LOCATIONS & COMPARTMENTS */}
      {activeSubTab === 'locations' && (
        <div className="bg-white/95 rounded-2xl border-2 border-[#006A4E]/30 hover:border-[#006A4E]/80 p-5 sm:p-6 shadow-sm space-y-5 transition-all">
          <div className="pb-4 border-b-2 border-[#006A4E]/15">
            <h3 className="text-base font-bold text-[#006A4E] flex items-center gap-2 font-algerian">
              <MapPin className="h-5 w-5 text-[#006A4E]" />
              <span>Ship Compartments & Engine Room Systems ({locations.length} Locations)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add or remove compartments, deck locations, and propulsion/auxiliary systems.
            </p>
          </div>

          {/* Add Location Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newLocationInput.trim()) {
                onAddLocation(newLocationInput.trim());
                setNewLocationInput('');
              }
            }}
            className="flex gap-2 max-w-xl"
          >
            <input
              type="text"
              value={newLocationInput}
              onChange={(e) => setNewLocationInput(e.target.value)}
              placeholder="Enter compartment or location name..."
              required
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#001f3f] via-[#002855] to-[#001f3f] hover:from-[#001738] hover:via-[#002147] hover:to-[#001738] text-amber-300 font-bold border-2 border-amber-400/60 hover:border-amber-300 rounded-xl text-xs font-algerian tracking-wider flex items-center gap-1.5 shadow-md hover:shadow-xl transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add Location</span>
            </button>
          </form>

          {/* Locations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {locations.map((loc) => (
              <div
                key={loc}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MapPin className="h-4 w-4 text-slate-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-900 truncate" title={loc}>
                    {loc}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteLocation(loc)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Remove Location"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: WORKSHOP USERS, LOGIN CREDENTIALS & PHOTOS (ইউজার) */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          {/* Top Header Card */}
          <div className="bg-white/95 rounded-2xl border-2 border-[#006A4E]/30 hover:border-[#006A4E]/80 p-5 sm:p-6 md:p-8 shadow-sm space-y-6 text-slate-800 transition-all">
            <div className="pb-5 border-b-2 border-[#006A4E]/15 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#006A4E] text-[#FFFDD0] rounded-xl border border-[#FFFDD0]/40 shadow-md shrink-0">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#006A4E] tracking-wide flex items-center gap-2 flex-wrap font-algerian">
                      <span>Workshop Users & Login Registry</span>
                      <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-[#006A4E]/10 text-[#006A4E] border border-[#006A4E]/30 font-sans">
                        শপ ইউজার ও অফিশিয়াল ছবি
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      বাংলাদেশ নৌবাহিনী ডকইয়ার্ডের সকল শপের লগইন আইডি, পাসওয়ার্ড ও অফিশিয়াল ছবি ব্যবস্থাপনা ও স্টোরেজ।
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                {userSuccessMsg && (
                  <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{userSuccessMsg}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleExportUserCredentials}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 border-2 border-slate-300 hover:border-slate-400 text-[#001738] rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs"
                  title="Export all login usernames and passwords as CSV"
                >
                  <Download className="h-4 w-4 text-slate-600" />
                  <span>Export Credentials</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewUserForm({
                      code: `WS-${String(workshops.length + 1).padStart(2, '0')}`,
                      nameEn: '',
                      nameBn: '',
                      category: 'Mechanical',
                      oicRank: 'Lieutenant',
                      oicName: '',
                      phoneExt: '4230',
                      username: `oic.ws${String(workshops.length + 1).padStart(2, '0')}`,
                      password: '123456',
                      photo: '',
                      status: 'active',
                      description: ''
                    });
                    setIsAddingUserModal(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#001f3f] via-[#002855] to-[#001f3f] hover:from-[#001738] hover:via-[#002147] hover:to-[#001738] text-amber-300 font-bold border-2 border-amber-400/60 hover:border-amber-300 rounded-xl text-xs font-algerian tracking-wider flex items-center gap-2 shadow-md hover:shadow-xl transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="h-4 w-4 text-amber-400" />
                  <span>Add New User</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3.5">
                <div className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">Total Workshops</div>
                  <div className="text-xl font-bold text-slate-900">{workshops.length} <span className="text-xs font-normal text-slate-500">ইউনিট</span></div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3.5">
                <div className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg shrink-0">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">Photos Uploaded</div>
                  <div className="text-xl font-bold text-slate-900">
                    {workshops.filter(w => !!w.photo).length} <span className="text-xs font-normal text-slate-500">/ {workshops.length}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3.5">
                <div className="p-2.5 bg-white border border-slate-200 text-emerald-600 rounded-lg shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">Active Status</div>
                  <div className="text-xl font-bold text-emerald-700">
                    {workshops.filter(w => w.status === 'active').length} <span className="text-xs font-normal text-slate-500">সক্রিয়</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3.5">
                <div className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg shrink-0">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">Default Password</div>
                  <div className="text-xl font-bold text-slate-900">
                    123456 <span className="text-xs font-normal text-slate-500">(ডিফল্ট)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="শপের নাম, কোড (WS-01), ইউজারনেম বা ওআইসির নাম খুঁজুন..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setUserFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    userFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  সকল শপ ({workshops.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserFilter('with_photo')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    userFilter === 'with_photo'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  ছবি সংযুক্ত ({workshops.filter(w => !!w.photo).length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserFilter('no_photo')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    userFilter === 'no_photo'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  ছবি বাকি ({workshops.filter(w => !w.photo).length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserFilter('active')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    userFilter === 'active'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  সক্রিয় ({workshops.filter(w => w.status === 'active').length})
                </button>
              </div>
            </div>
          </div>

          {/* Workshop Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredUsers.map((ws) => {
              const uName = ws.username || `oic.${ws.code.toLowerCase().replace('-', '')}`;
              const pWord = ws.password || '123456';
              const isPasswordRevealed = !!showPasswordFor[ws.id];

              return (
                <div
                  key={ws.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4 text-slate-800 group"
                >
                  {/* Card Header: Code Badge + Category + Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-slate-900 text-white font-mono font-bold text-xs rounded-lg shadow-xs">
                        {ws.code}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[130px]">
                        {ws.category}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                        ws.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${ws.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      {ws.status}
                    </span>
                  </div>

                  {/* Photo & Workshop Identity */}
                  <div className="flex items-center gap-4">
                    {/* Photo / Avatar with upload trigger */}
                    <div className="relative shrink-0">
                      <div className="w-18 h-18 rounded-full p-0.5 bg-slate-100 border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden">
                        {ws.photo ? (
                          <img
                            src={ws.photo}
                            alt={ws.nameEn}
                            className="w-full h-full object-cover rounded-full bg-slate-50"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                            <img src="/anchor.jpg" alt="Navy" className="w-full h-full object-cover rounded-full" />
                          </div>
                        )}
                      </div>

                      {/* Photo Badge overlay */}
                      <label
                        className="absolute -bottom-1 -right-1 p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-md cursor-pointer transition-all active:scale-95"
                        title="শপের ছবি আপলোড বা পরিবর্তন করুন"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(ws.id, file);
                          }}
                        />
                      </label>
                    </div>

                    {/* Workshop Text Info */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 tracking-wide truncate" title={ws.nameEn}>
                        {ws.nameEn}
                      </h4>
                      <p className="text-xs font-medium text-slate-600 truncate" title={ws.nameBn}>
                        {ws.nameBn}
                      </p>
                      <div className="text-[11px] text-slate-600 truncate">
                        OIC: <span className="font-semibold text-slate-800">{ws.oicRank} {ws.oicName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Ext: <span className="text-slate-800 font-semibold">{ws.phoneExt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Photo Actions Row */}
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                      {ws.photo ? (
                        <span className="text-emerald-600 font-medium">ছবি সংরক্ষিত আছে</span>
                      ) : (
                        <span className="text-slate-400">কোনো ছবি নেই</span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-slate-700 hover:text-slate-900 underline cursor-pointer font-semibold">
                        {ws.photo ? 'নতুন ছবি দিন' : 'ছবি যোগ করুন'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(ws.id, file);
                          }}
                        />
                      </label>
                      {ws.photo && (
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(ws.id)}
                          className="text-[11px] text-rose-600 hover:text-rose-700 underline font-semibold cursor-pointer"
                        >
                          মুছুন
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Login Credentials Box */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium text-[11px]">USERNAME (ইউজারনেম):</span>
                      <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs select-all">
                        {uName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium text-[11px]">PASSWORD (পাসওয়ার্ড):</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs select-all">
                          {isPasswordRevealed ? pWord : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(ws.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
                          title={isPasswordRevealed ? 'Hide Password' : 'Show Password'}
                        >
                          {isPasswordRevealed ? (
                            <EyeOff className="h-3.5 w-3.5 text-slate-600" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopyCredentials(ws)}
                      className="flex-1 py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 text-slate-700 hover:text-slate-900 transition-all active:scale-95 cursor-pointer shadow-xs"
                    >
                      <Copy className="h-3.5 w-3.5 text-slate-500" />
                      <span>{copyFeedback === ws.id ? 'কপি হয়েছে!' : 'লগইন কপি'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingWorkshopUser({
                        ...ws,
                        username: ws.username || `oic.${ws.code.toLowerCase().replace('-', '')}`,
                        password: ws.password || '123456'
                      })}
                      className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>তথ্য সম্পাদনা</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <div className="text-base font-bold text-slate-900">কোনো শপ ইউজার পাওয়া যায়নি</div>
              <p className="text-xs text-slate-500 mt-1">অনুসন্ধানের কি-ওয়ার্ড পরিবর্তন করুন অথবা ফিল্টার রিসেট করুন।</p>
            </div>
          )}
        </div>
      )}

      {/* ================= SUB-TAB: ADMIN PROFILE & NAVAL IDENTITY ================= */}
      {/* SUB-TAB: ADMIN PROFILE */}
      {activeSubTab === 'profile' && (
        <div className="bg-white/95 rounded-2xl border-2 border-[#006A4E]/30 hover:border-[#006A4E]/80 p-5 sm:p-6 md:p-8 shadow-sm space-y-6 text-slate-800 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-[#006A4E]/15">
            <div>
              <h3 className="text-base font-bold text-[#006A4E] flex items-center gap-2 font-algerian">
                <User className="h-5 w-5 text-[#006A4E]" />
                <span>Admin Profile & System Identity (এডমিন প্রোফাইল ব্যবস্থাপনা)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                সিস্টেম অ্যাডমিনিস্ট্রেটর প্রোফাইল, পদবি, ছবি ও পরিচিতি পরিচালনা করুন
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>SUPABASE: public.user_profile</span>
              </span>
            </div>
          </div>

          {/* Guide Banner */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Info className="h-4 w-4 text-slate-600" />
              <span>এডমিন প্রফাইল এর ডাটা ও ছবি কোথায় জমা হবে? (STORAGE MAPPING GUIDE)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-1.5 shadow-xs">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-slate-600" />
                  <span>১. এডমিন প্রোফাইল ডাটা (Name, Rank, P.No)</span>
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Supabase ক্লাউড PostgreSQL ডাটাবেজের <strong className="text-slate-800 font-mono">public.user_profile</strong> টেবিলে নির্দিষ্ট <span className="text-slate-800 font-mono">id: 'admin_default'</span> সারিতে সরাসরি স্থায়ীভাবে সংরক্ষিত হয়।
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-1.5 shadow-xs">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-slate-600" />
                  <span>২. এডমিন ছবি (Avatar Photo Storage)</span>
                </p>
                <p className="text-slate-600 leading-relaxed">
                  ছবিটি Supabase Storage-এর <strong className="text-slate-800 font-mono">profiles/</strong> বাকেটে আপলোড হয়ে সরাসরি ক্লাউড ইউআরএল তৈরি হয়, অথবা অপটিমাইজড ডাটা হিসেবে <span className="text-slate-800 font-mono">user_profile.avatar</span> কলামে জমা থাকে।
                </p>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>ডিপ্লয়মেন্টের পর যেকোনো ডিভাইস থেকে লগইন করলেই সোপাবেজ ক্লাউড থেকে এই প্রোফাইল ও ছবি স্বয়ংক্রিয়ভাবে লোড হবে।</span>
            </div>
          </div>

          {/* Profile Edit Form */}
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 bg-white flex items-center justify-center shadow-xs">
                  {profileAvatar ? (
                    <img src={profileAvatar} alt="Admin Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-md cursor-pointer transition-all active:scale-95" title="ছবি পরিবর্তন করুন">
                  <Camera className="h-3.5 w-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  {profileName || 'এডমিন নাম'}
                </h4>
                <p className="text-xs text-slate-600 font-semibold">
                  {profileRank || 'পদবি'} • P.No: {profileId || 'admin'}
                </p>
                <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <label className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs">
                    <Camera className="h-3.5 w-3.5 text-slate-500" />
                    <span>নতুন ছবি আপলোড</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                  {profileAvatar && (
                    <button
                      type="button"
                      onClick={() => setProfileAvatar('')}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      ছবি মুছুন
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  FULL NAME (এডমিন বা অফিসারের পূর্ণ নাম)
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs text-slate-800 outline-none transition-colors"
                  placeholder="e.g. Lt Commander M. A. Rahman"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  RANK / APPOINTMENT (পদবি)
                </label>
                <input
                  type="text"
                  value={profileRank}
                  onChange={(e) => setProfileRank(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs text-slate-800 outline-none transition-colors"
                  placeholder="e.g. অফিস রাইটার / Lt Commander"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  OFFICIAL P.NO / USER ID (অফিসিয়াল আইডি)
                </label>
                <input
                  type="text"
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none transition-colors"
                  placeholder="e.g. admin"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                  <span>ADMIN LOGIN PASSWORD (এডমিন পাসওয়ার্ড)</span>
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="text-[11px] text-slate-600 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-sans"
                  >
                    {showAdminPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span>{showAdminPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </label>
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none transition-colors"
                  placeholder="e.g. admin123"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  CUSTOM RIGGING SHOP DISPLAY NAME
                </label>
                <input
                  type="text"
                  value={localRiggingName}
                  onChange={(e) => setLocalRiggingName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-xl text-xs text-slate-800 outline-none transition-colors"
                  placeholder="e.g. Rigging Shop"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                {profileSuccessMsg && (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 animate-fade-in">
                    <Check className="h-4 w-4" />
                    <span>এডমিন প্রোফাইল সফলভাবে সোপাবেজে সেভ হয়েছে!</span>
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSavingProfileToDb}
                className="px-6 py-2.5 bg-gradient-to-r from-[#001f3f] via-[#002855] to-[#001f3f] hover:from-[#001738] hover:via-[#002147] hover:to-[#001738] text-amber-300 font-bold border-2 border-amber-400/60 hover:border-amber-300 rounded-xl text-xs font-algerian tracking-wider flex items-center gap-2 shadow-md hover:shadow-xl transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isSavingProfileToDb ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
                ) : (
                  <Save className="h-4 w-4 text-amber-400" />
                )}
                <span>Save Profile (প্রোফাইল সংরক্ষণ করুন)</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= EDIT WORKSHOP USER & CREDENTIALS MODAL ================= */}
      {editingWorkshopUser && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 max-w-xl w-full shadow-xl space-y-6 text-slate-800 animate-scale-up my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 text-white rounded-xl font-bold font-mono text-xs">
                  {editingWorkshopUser.code}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Workshop User & Credentials
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingWorkshopUser.nameEn} ({editingWorkshopUser.nameBn})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingWorkshopUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorkshopUser} className="space-y-4">
              {/* Photo Upload and Preview inside Modal */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-white flex items-center justify-center">
                  {editingWorkshopUser.photo ? (
                    <img src={editingWorkshopUser.photo} alt="Workshop" className="w-full h-full object-cover" />
                  ) : (
                    <img src="/anchor.jpg" alt="Navy Crest" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="text-xs font-bold text-slate-800">শপের অফিশিয়াল ছবি (Official Photo)</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all shadow-xs">
                      <Camera className="h-3.5 w-3.5" />
                      <span>{editingWorkshopUser.photo ? 'নতুন ছবি নির্বাচন' : 'ছবি আপলোড করুন'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const { url } = await supabaseService.uploadMediaToStorage(file, 'workshops');
                            setEditingWorkshopUser({
                              ...editingWorkshopUser,
                              photo: url
                            });
                          }
                        }}
                      />
                    </label>
                    {editingWorkshopUser.photo && (
                      <button
                        type="button"
                        onClick={() => setEditingWorkshopUser({ ...editingWorkshopUser, photo: '' })}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 cursor-pointer"
                      >
                        ছবি সরান
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Login Credentials Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    LOGIN USERNAME (ব্যবহারকারীর নাম / আইডি)
                  </label>
                  <input
                    type="text"
                    value={editingWorkshopUser.username || ''}
                    onChange={(e) => setEditingWorkshopUser({ ...editingWorkshopUser, username: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-slate-400"
                    placeholder="e.g. oic.ws01"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    LOGIN PASSWORD (পাসওয়ার্ড)
                  </label>
                  <input
                    type="text"
                    value={editingWorkshopUser.password || ''}
                    onChange={(e) => setEditingWorkshopUser({ ...editingWorkshopUser, password: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-slate-400"
                    placeholder="e.g. 123456"
                  />
                </div>
              </div>

              {/* Officer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    OIC RANK (পদবী)
                  </label>
                  <input
                    type="text"
                    value={editingWorkshopUser.oicRank}
                    onChange={(e) => setEditingWorkshopUser({ ...editingWorkshopUser, oicRank: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    OIC NAME (অফিসারের নাম)
                  </label>
                  <input
                    type="text"
                    value={editingWorkshopUser.oicName}
                    onChange={(e) => setEditingWorkshopUser({ ...editingWorkshopUser, oicName: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    PHONE EXT (ইন্টারকম এক্সটেনশন)
                  </label>
                  <input
                    type="text"
                    value={editingWorkshopUser.phoneExt}
                    onChange={(e) => setEditingWorkshopUser({ ...editingWorkshopUser, phoneExt: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ACCOUNT STATUS (অ্যাকাউন্ট স্ট্যাটাস)
                  </label>
                  <select
                    value={editingWorkshopUser.status}
                    onChange={(e) => setEditingWorkshopUser({ ...editingWorkshopUser, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-slate-400"
                  >
                    <option value="active">Active (সক্রিয়)</option>
                    <option value="inactive">Inactive (নিষ্ক্রিয়)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingWorkshopUser(null)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ================= ADD NEW WORKSHOP USER MODAL ================= */}
      {isAddingUserModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 max-w-xl w-full shadow-xl space-y-6 text-slate-800 animate-scale-up my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 text-white rounded-xl font-bold font-mono text-xs">
                  NEW
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Add New Workshop User & Login
                  </h3>
                  <p className="text-xs text-slate-500">
                    নতুন শপ অ্যাকাউন্ট ও লগইন তথ্য যুক্ত করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingUserModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    WORKSHOP CODE (কোড)
                  </label>
                  <input
                    type="text"
                    value={newUserForm.code}
                    onChange={(e) => setNewUserForm({ ...newUserForm, code: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-slate-400"
                    placeholder="e.g. WS-28"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    CATEGORY (ক্যাটাগরি)
                  </label>
                  <input
                    type="text"
                    value={newUserForm.category}
                    onChange={(e) => setNewUserForm({ ...newUserForm, category: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-slate-400"
                    placeholder="e.g. Mechanical"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    WORKSHOP NAME (EN)
                  </label>
                  <input
                    type="text"
                    value={newUserForm.nameEn}
                    onChange={(e) => setNewUserForm({ ...newUserForm, nameEn: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-slate-400"
                    placeholder="e.g. Navigation Aids Shop"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    WORKSHOP NAME (BN)
                  </label>
                  <input
                    type="text"
                    value={newUserForm.nameBn}
                    onChange={(e) => setNewUserForm({ ...newUserForm, nameBn: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-slate-400"
                    placeholder="e.g. নেভিগেশন এইডস শপ"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    LOGIN USERNAME
                  </label>
                  <input
                    type="text"
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    LOGIN PASSWORD
                  </label>
                  <input
                    type="text"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    OIC RANK & NAME
                  </label>
                  <input
                    type="text"
                    value={newUserForm.oicName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, oicName: e.target.value })}
                    placeholder="Officer Name"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    PHONE EXT
                  </label>
                  <input
                    type="text"
                    value={newUserForm.phoneExt}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phoneExt: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddingUserModal(false)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add User</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
