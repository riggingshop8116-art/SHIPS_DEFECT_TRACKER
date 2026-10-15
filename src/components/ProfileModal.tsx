import React, { useState, useRef } from 'react';
import { 
  X, 
  User, 
  Upload, 
  Camera, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Phone, 
  Award,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { UserProfile, AuthSession, Workshop } from '../types';
import { supabaseService } from '../services/supabaseService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  authSession: AuthSession | null;
  workshops?: Workshop[];
  onSaveProfile: (newProfile: UserProfile, newOfficerName?: string, newOfficerRank?: string, newPhone?: string) => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
  authSession,
  workshops = [],
  onSaveProfile
}: ProfileModalProps) {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = authSession?.role === 'admin';

  // For workshop users, find active workshop details
  const currentWorkshop = !isAdmin && authSession
    ? workshops.find(ws => ws.id === authSession.workshopId || ws.code === authSession.workshopCode)
    : null;

  // Form State - strictly segregated between Admin and individual Workshops
  const [name, setName] = useState<string>(
    isAdmin
      ? (profile.name || '')
      : (currentWorkshop?.oicName || authSession?.officerName || 'Workshop Officer')
  );
  const [rank, setRank] = useState<string>(
    isAdmin
      ? (profile.rank || 'Commander, BN')
      : (currentWorkshop?.oicRank || authSession?.officerRank || 'Officer-in-Charge')
  );
  const [officialId, setOfficialId] = useState<string>(
    isAdmin
      ? (profile.officialId || 'admin')
      : (currentWorkshop?.username || authSession?.username || currentWorkshop?.code || 'Officer ID')
  );
  const [phone, setPhone] = useState<string>(
    isAdmin
      ? 'Ext: 8116 (BN Dockyard HQ)'
      : (currentWorkshop?.phoneExt ? `Ext: ${currentWorkshop.phoneExt}` : 'Ext: 8116')
  );
  const [avatar, setAvatar] = useState<string>(
    isAdmin
      ? (profile.avatar || '/anchor.jpg')
      : (currentWorkshop?.photo || authSession?.photo || '/anchor.jpg')
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Preset Naval Avatars
  const PRESET_AVATARS = [
    { name: 'Official Naval Crest', url: '/anchor.jpg' },
    { 
      name: 'Officer Portrait 1 (Commander)', 
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' 
    },
    { 
      name: 'Officer Portrait 2 (Chief Engr)', 
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' 
    },
    { 
      name: 'Technical Specialist (OIC)', 
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80' 
    }
  ];

  // Handle Photo File Upload
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Maximum image file size is 5MB.');
      return;
    }
    setIsUploadingPhoto(true);
    try {
      const { url } = await supabaseService.uploadMediaToStorage(file, 'profiles');
      setAvatar(url);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: UserProfile = {
      ...profile,
      name: name.trim() || 'Navy Officer',
      rank: rank.trim() || 'Officer',
      officialId: officialId.trim() || 'P No. 0000',
      avatar: avatar
    };

    onSaveProfile(updatedProfile, name.trim(), rank.trim(), phone.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Modal Card */}
      <div 
        id="profile-modal-card"
        className="w-full max-w-2xl bg-[#001738]/95 backdrop-blur-2xl border-2 border-amber-400/60 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,10,35,0.95)] ring-1 ring-white/20 overflow-hidden text-white flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#001024]/90 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl p-0.5 bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300/60 flex items-center justify-center overflow-hidden shadow-md">
              <img src="/anchor.jpg" alt="Navy Crest" className="w-full h-full object-contain rounded-lg bg-black" />
            </div>
            <div>
              <h3 className="text-lg font-algerian font-bold text-amber-300 flex items-center gap-2">
                <span>{isAdmin ? 'ADMIN PROFILE MANAGEMENT' : 'USER PROFILE & PHOTO EDIT'}</span>
              </h3>
              <p className="text-xs text-cyan-200/80 font-mono">
                {isAdmin ? 'Bangladesh Navy Command HQ Officer Profile' : `Workshop: ${authSession?.workshopNameEn || authSession?.workshopNameBn || 'User Profile'}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Alert */}
        {isSaved && (
          <div className="bg-emerald-900/80 border-b border-emerald-500/50 px-6 py-2.5 flex items-center gap-2 text-emerald-200 text-xs font-algerian animate-pulse">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>PROFILE UPDATED SUCCESSFULLY!</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Avatar Upload Section */}
          <div className="bg-[#000e24]/70 p-5 rounded-2xl border border-cyan-500/25 space-y-4">
            <label className="block text-xs font-algerian font-bold text-amber-300 tracking-wider">
              PROFILE PHOTO / INSIGNIA SELECTION
            </label>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Photo Preview Badge */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#001024] p-1 border-3 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center overflow-hidden">
                  {avatar ? (
                    <img 
                      src={avatar} 
                      alt="Officer Avatar" 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  ) : (
                    <User className="h-12 w-12 text-amber-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-amber-500 hover:bg-amber-400 text-[#001733] rounded-full shadow-lg border-2 border-[#001738] cursor-pointer transition-transform hover:scale-110"
                  title="Upload New Photo"
                >
                  <Camera className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div 
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 w-full border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  dragActive 
                    ? 'border-amber-400 bg-amber-500/20' 
                    : 'border-cyan-500/40 bg-[#001838]/50 hover:bg-[#001838]/80 hover:border-amber-400/60'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={onFileInputChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <Upload className="h-6 w-6 text-amber-400" />
                <p className="text-xs text-slate-200 font-medium">
                  <span className="text-amber-300 font-bold">Drag & drop</span> image here or <span className="text-cyan-300 font-bold underline">click to browse</span>
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Supported formats: JPG, PNG, WEBP (Max 3MB)
                </p>
              </div>
            </div>

            {/* Quick Naval Preset Avatars */}
            <div>
              <p className="text-[11px] font-algerian text-cyan-300 font-bold mb-2">
                OR CHOOSE A NAVAL BADGE / PRESET:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(preset.url)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      avatar === preset.url 
                        ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-md' 
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <img 
                      src={preset.url} 
                      alt={preset.name} 
                      className="w-7 h-7 rounded-full object-cover border border-amber-400/60 shrink-0" 
                    />
                    <span className="text-[10px] font-semibold truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Officer Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Officer Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-algerian font-bold text-cyan-200">
                OFFICER FULL NAME <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Commander M. Rahman, BN"
                  className="w-full bg-[#000d1e] border border-cyan-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>
            </div>

            {/* Military Rank */}
            <div className="space-y-1.5">
              <label className="block text-xs font-algerian font-bold text-cyan-200">
                RANK / DESIGNATION <span className="text-amber-400">*</span>
              </label>
              <input 
                type="text"
                required
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="e.g. Lieutenant Commander, BN / MCPO"
                className="w-full bg-[#000d1e] border border-cyan-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>

            {/* Service ID / P No */}
            <div className="space-y-1.5">
              <label className="block text-xs font-algerian font-bold text-cyan-200">
                OFFICIAL SERVICE NO / ID <span className="text-amber-400">*</span>
              </label>
              <input 
                type="text"
                required
                value={officialId}
                onChange={(e) => setOfficialId(e.target.value)}
                placeholder="e.g. P No. 1420 / O No. 5821"
                className="w-full bg-[#000d1e] border border-cyan-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-amber-400 outline-none font-mono"
              />
            </div>

            {/* Phone / Extension */}
            <div className="space-y-1.5">
              <label className="block text-xs font-algerian font-bold text-cyan-200">
                DUTY INTERCOM / PHONE
              </label>
              <input 
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. Ext: 8116 (BN Dockyard)"
                className="w-full bg-[#000d1e] border border-cyan-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-amber-400 outline-none font-mono"
              />
            </div>
          </div>

          {/* Unit / Workshop Info Readout */}
          <div className="p-3.5 bg-cyan-950/40 rounded-xl border border-cyan-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-slate-300">Active Assignment:</span>
              <span className="text-amber-300 font-bold">
                {isAdmin ? 'Bangladesh Navy Command Dockyard Headquarters' : authSession?.workshopNameEn || authSession?.workshopNameBn || 'Technical Workshop'}
              </span>
            </div>
            <span className="font-algerian text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {isAdmin ? 'ADMIN ROLE' : 'WORKSHOP OIC'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-slate-200 rounded-xl text-xs font-algerian font-bold transition-all cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#001733] rounded-xl text-xs font-algerian font-black shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>SAVE PROFILE</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
