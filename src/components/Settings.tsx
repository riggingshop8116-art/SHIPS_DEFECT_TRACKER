import React, { useState } from 'react';
import { 
  User, 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Ship, 
  UserPlus, 
  Database,
  Info,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  ships: string[];
  onAddShip: (ship: string) => void;
  onDeleteShip: (ship: string) => void;
  onResetApp: () => void;
  defectCount: number;
  riggingShopName: string;
  onUpdateRiggingShopName: (name: string) => void;
}

export default function Settings({
  profile,
  onUpdateProfile,
  ships,
  onAddShip,
  onDeleteShip,
  onResetApp,
  defectCount,
  riggingShopName,
  onUpdateRiggingShopName
}: SettingsProps) {
  // Local Profile State
  const [profileName, setProfileName] = useState<string>(profile.name);
  const [profileRank, setProfileRank] = useState<string>(profile.rank);
  const [profileId, setProfileId] = useState<string>(profile.officialId);
  const [profileAvatar, setProfileAvatar] = useState<string>(profile.avatar);

  // Local Shop Name State
  const [localShopName, setLocalShopName] = useState<string>(riggingShopName);

  React.useEffect(() => {
    setLocalShopName(riggingShopName);
  }, [riggingShopName]);

  // Handle local file upload to Base64
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('ফাইলের সাইজ ২MB এর নিচে হতে হবে!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfileAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const AVATAR_PRESETS = [
    { name: 'অফিসার ১', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60' },
    { name: 'অফিসার ২', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60' },
    { name: 'অফিসার ৩', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60' },
  ];

  // New Ship state
  const [newShipName, setNewShipName] = useState<string>('');

  // Notification feedbacks
  const [profileSavedMsg, setProfileSavedMsg] = useState<boolean>(false);
  const [shipSavedMsg, setShipSavedMsg] = useState<string | null>(null);

  // Handle profile save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: profileName,
      rank: profileRank,
      officialId: profileId,
      avatar: profileAvatar
    });
    onUpdateRiggingShopName(localShopName.trim() || 'RIGGING SHOP');
    setProfileSavedMsg(true);
    setTimeout(() => setProfileSavedMsg(false), 3000);
  };

  // Handle adding ship
  const handleAddShipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShipName.trim()) return;
    
    if (ships.includes(newShipName.trim())) {
      setShipSavedMsg('এই জাহাজের নাম ইতিমধ্যে তালিকায় রয়েছে!');
      setTimeout(() => setShipSavedMsg(null), 3000);
      return;
    }

    onAddShip(newShipName.trim());
    setNewShipName('');
    setShipSavedMsg('নতুন জাহাজটি সফলভাবে যুক্ত হয়েছে!');
    setTimeout(() => setShipSavedMsg(null), 3000);
  };

  return (
    <div id="settings-panel" className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Settings Title Header */}
      <div className="bg-gradient-to-r from-[#002147] to-[#003366] p-6 rounded-2xl border-l-8 border-yellow-500 text-white flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-yellow-500" />
            সিস্টেম সেটিংস ও কনফিগারেশন (Settings Panel)
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            জাহাজের তালিকা, প্রোফাইল এবং ডাটাবেস তথ্য প্রয়োজন অনুযায়ী পরিবর্তন ও পরিচালনা করুন।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SECTION 1: PROFILE MANAGEMENT */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <User className="h-5 w-5 text-[#002147]" />
              <h3 className="text-base font-bold text-slate-800">অফিসার প্রোফাইল সেটিংস</h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Photo Select */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-700 block">প্রোফাইল ছবি পরিবর্তন করুন</span>
                <div className="flex items-center gap-4">
                  <img
                    src={profileAvatar}
                    alt="Avatar"
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-full object-cover border-2 border-yellow-500 shadow-md bg-slate-200"
                  />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <label 
                        htmlFor="avatar-file-upload" 
                        className="bg-[#002147] hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                      >
                        <Upload className="h-3.5 w-3.5 text-yellow-400" />
                        নতুন ছবি আপলোড করুন
                      </label>
                      <input 
                        type="file" 
                        id="avatar-file-upload" 
                        accept="image/*" 
                        onChange={handleAvatarUpload} 
                        className="hidden" 
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold">ফাইলের সাইজ সর্বোচ্চ ২MB হতে হবে।</p>
                  </div>
                </div>

                {/* Presets Quick Choose */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500">নমুনা প্রোফাইল ছবি নির্বাচন করুন:</span>
                  <div className="flex gap-2">
                    {AVATAR_PRESETS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setProfileAvatar(preset.url)}
                        className={`text-[10px] px-2 py-1 rounded border transition-all cursor-pointer ${
                          profileAvatar === preset.url 
                            ? 'bg-yellow-100 text-[#002147] border-yellow-400 font-bold' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">ছবি লিংক (Image URL)</label>
                  <input
                    type="text"
                    value={profileAvatar}
                    onChange={(e) => setProfileAvatar(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-1 focus:ring-[#002147] bg-white"
                  />
                </div>
              </div>

              {/* Officer Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">অফিসারের নাম (Officer's Name)</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-[#002147] bg-slate-50 font-semibold"
                />
              </div>

              {/* Rank */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">পদবী (Rank / Designation)</label>
                <input
                  type="text"
                  value={profileRank}
                  onChange={(e) => setProfileRank(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-[#002147] bg-slate-50 font-semibold"
                />
              </div>

              {/* Official ID */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">অফিসিয়াল আইডি (P. No)</label>
                <input
                  type="text"
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-[#002147] bg-slate-50 font-mono"
                />
              </div>

              {/* Rigging Shop Name */}
              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <label className="text-xs font-bold text-slate-700 block mb-1">রিগিং শপ এর নাম (Rigging Shop Name in English)</label>
                <input
                  type="text"
                  value={localShopName}
                  onChange={(e) => setLocalShopName(e.target.value)}
                  placeholder="যেমন: RIGGING SHOP"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold font-mono tracking-wider text-[#002147] outline-none focus:ring-1 focus:ring-[#002147] bg-white"
                />
                <p className="text-[10px] text-slate-500 font-medium mt-1">
                  এটি পরিবর্তন করলে অ্যাপ্লিকেশনের উপরের প্রধান হেডারে নাম আপডেট হবে।
                </p>
              </div>

              {profileSavedMsg && (
                <p className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 flex items-center gap-1.5 animate-pulse">
                  ✓ প্রোফাইল তথ্য সফলভাবে সেভ করা হয়েছে!
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-[#002147] hover:bg-slate-850 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  প্রোফাইল সেভ করুন (Save Profile)
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* SECTION 2: SHIPS NAME MANAGEMENT */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Ship className="h-5 w-5 text-[#002147]" />
              <h3 className="text-base font-bold text-slate-800">জাহাজের তালিকা ব্যবস্থাপনা (Ships List)</h3>
            </div>

            {/* Add Ship Form */}
            <form onSubmit={handleAddShipSubmit} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newShipName}
                onChange={(e) => setNewShipName(e.target.value)}
                placeholder="নতুন যুদ্ধজাহাজের নাম (যেমন: BNS Duronto)"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-[#002147] bg-slate-50"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                যোগ করুন
              </button>
            </form>

            {shipSavedMsg && (
              <p className={`text-xs font-semibold px-3 py-1.5 rounded-lg mb-3 ${
                shipSavedMsg.includes('সফলভাবে') 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`}>
                {shipSavedMsg}
              </p>
            )}

            {/* List of ships with deletion */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto border border-slate-100 p-2.5 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">তালিকায় থাকা মোট জাহাজ ({ships.length} টি)</span>
              {ships.map((ship, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-150 shadow-sm text-xs text-slate-800 font-medium">
                  <span>{ship}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteShip(ship)}
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded-lg transition-colors cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3: SYSTEM RESET & TECHNICAL EXPLANATION */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Reset Actions */}
        <div className="md:col-span-1 border-r border-slate-100 pr-0 md:pr-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-2">
            <Database className="h-5 w-5 text-amber-600" />
            <span>সিস্টেম ডাটাবেস রিসেট</span>
          </div>
          <p className="text-slate-500 text-xs leading-relaxed">
            এই রিসেট বাটনে চাপ দিলে আপনার লোকাল স্টোরেজে থাকা সকল কাস্টম ডিফেক্ট এবং জাহাজের তালিকা ডিলিট হয়ে ডিফল্ট সিস্টেমে ফিরে যাবে।
          </p>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700">
            <span>বর্তমানে সংরক্ষিত ডিফেক্ট: </span>
            <strong className="text-[#002147] font-black">{defectCount} টি</strong>
          </div>
          <button
            onClick={onResetApp}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ফ্যাক্টরি রিসেট করুন (Reset DB)
          </button>
        </div>

        {/* Technical Info & Instructions */}
        <div className="md:col-span-2 space-y-3 pl-0 md:pl-2">
          <div className="flex items-center gap-1.5 text-slate-800 font-bold">
            <Info className="h-5 w-5 text-[#002147]" />
            <span>সিপস ডিফেক্ট ট্র্যাকিং সিস্টেম ইউজার গাইড</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
            <li>
              <strong>ডিফেক্ট এন্ট্রি (Defect Entry):</strong> বাংলাদেশ নৌবাহিনীর যেকোনো যুদ্ধজাহাজ নির্বাচন করে তার মেইন ইঞ্জিন, ডিজি-১ অথবা ডিজি-২ এর ত্রুটি ডেট ও বিবরণ সহ ছবিসহ এন্ট্রি করুন।
            </li>
            <li>
              <strong>ডিফেক্ট ফাইন্ড (Defect Find):</strong> যেকোনো সময় জাহাজ ও ত্রুটির লোকেশন নির্বাচন করে অথবা দুটি নির্দিষ্ট তারিখ রেঞ্জের মধ্যকার ডিফেক্ট অনুসন্ধান করে তার বর্তমান স্ট্যাটাস দেখুন।
            </li>
            <li>
              <strong>বাস্তবতা ও প্রিজার্ভেশন:</strong> এই সিস্টেমটি ব্রাউজারের শক্তিশালী <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-800 font-mono">localStorage</code> ডাটাবেস ব্যবহার করে, ফলে রিফ্রেশ দিলেও এন্ট্রি করা ডেটা কখনোই হারিয়ে যাবে না।
            </li>
            <li>
              <strong>প্রোফাইল সেটিংস:</strong> আপনার প্রোফাইলের নাম পরিবর্তন করার সাথে সাথেই তা বাম পাশের মূল সাইডবার এবং রিপোর্টিং সিস্টেমের সাথে সিঙ্ক হয়ে যায়।
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
