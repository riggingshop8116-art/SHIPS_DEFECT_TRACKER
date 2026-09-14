import React, { useState, useEffect, useMemo } from 'react';
import { 
  Ship, 
  Wrench, 
  Search, 
  Anchor, 
  Compass, 
  ShieldCheck, 
  Clock, 
  Building2,
  LogOut,
  Sliders,
  User,
  CheckCircle2,
  AlertCircle,
  Eye,
  ImageIcon,
  ShieldAlert,
  Menu
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import DefectEntry from './components/DefectEntry';
import DefectFind from './components/DefectFind';
import Dashboard from './components/Dashboard';
import InProgressJobs from './components/InProgressJobs';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import ProfileModal from './components/ProfileModal';
import OrganizationChart from './components/OrganizationChart';
import ProductionDepartment from './components/ProductionDepartment';
import patrolShipBg from './assets/images/patrol_ship_157.jpg';
import navyFleetBg from './assets/images/navy-2.webp';

import { Defect, UserProfile, Workshop, DockyardConfig, AuthSession, NavTab, AdminSubTab } from './types';
import { 
  DEFAULT_SHIPS, 
  DEFAULT_LOCATIONS, 
  DEFAULT_PROFILE, 
  DEFAULT_WORKSHOPS, 
  DEFAULT_DOCKYARD_CONFIG 
} from './constants';
import { supabase } from './lib/supabase';
import { supabaseService, mapDefectFromDb } from './services/supabaseService';

export default function App() {
  // Authentication session
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    try {
      const stored = localStorage.getItem('defect_tracker_auth');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  // Navigation active tab: 'dashboard' | 'entry' | 'find' | 'organization' | 'admin'
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Active Admin SubTab: 'workshops' | 'fleet' | 'locations' | 'production' | 'profile' | 'backup' | 'settings'
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTab>('workshops');

  // Mobile Navigation Drawer Toggle State
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Maritime Background Ship overlay intensity: 'balanced' (standard) | 'vivid' (more visible ship) | 'soft' (lighter)
  const [bgIntensity, setBgIntensity] = useState<'balanced' | 'vivid' | 'soft'>(() => {
    try {
      return (localStorage.getItem('defect_tracker_bg_mode') as 'balanced' | 'vivid' | 'soft') || 'balanced';
    } catch {
      return 'balanced';
    }
  });

  const handleBgIntensityChange = (mode: 'balanced' | 'vivid' | 'soft') => {
    setBgIntensity(mode);
    try {
      localStorage.setItem('defect_tracker_bg_mode', mode);
    } catch {
      // ignore
    }
  };

  // Core App States with LocalStorage caching
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('defect_tracker_profile');
      return stored ? JSON.parse(stored) : DEFAULT_PROFILE;
    } catch (e) {
      return DEFAULT_PROFILE;
    }
  });

  const [dockyardConfig, setDockyardConfig] = useState<DockyardConfig>(() => {
    try {
      const stored = localStorage.getItem('defect_tracker_dockyard_config');
      return stored ? JSON.parse(stored) : DEFAULT_DOCKYARD_CONFIG;
    } catch (e) {
      return DEFAULT_DOCKYARD_CONFIG;
    }
  });

  const [workshops, setWorkshops] = useState<Workshop[]>(() => {
    try {
      const stored = localStorage.getItem('defect_tracker_workshops');
      return stored ? JSON.parse(stored) : DEFAULT_WORKSHOPS;
    } catch (e) {
      return DEFAULT_WORKSHOPS;
    }
  });

  const [ships, setShips] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('defect_tracker_ships');
      return stored ? JSON.parse(stored) : DEFAULT_SHIPS;
    } catch (e) {
      return DEFAULT_SHIPS;
    }
  });

  const [locations, setLocations] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('defect_tracker_locations');
      return stored ? JSON.parse(stored) : DEFAULT_LOCATIONS;
    } catch (e) {
      return DEFAULT_LOCATIONS;
    }
  });

  const [defects, setDefects] = useState<Defect[]>(() => {
    try {
      const stored = localStorage.getItem('defect_tracker_defects');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    // Seed initial realistic defects
    return [
      {
        id: 'def-1788795483513',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Gangway',
        workshop: 'Rigging Shop',
        workshopCode: 'WS-01',
        defectDescription: 'SAFETY NET MAKING WORK',
        defectDate: '2026-09-07',
        status: 'Pending',
        defectImage: '',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        createdAt: '2026-09-07T00:00:00.000Z'
      },
      {
        id: 'def-1788896335485',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Gangway',
        workshop: 'Rigging Shop',
        workshopCode: 'WS-01',
        defectDescription: 'Rigging gear inspection and safety latch installation completed.',
        defectDate: '2026-09-08',
        solutionDate: '2026-09-08',
        solutionDescription: 'New tested safety links installed and load certified.',
        defectImage: '',
        solutionImage: '',
        status: 'Solved',
        createdAt: '2026-09-08T00:00:00.000Z'
      },
      {
        id: 'def-sample-1',
        shipName: 'BNS Bangabandhu (এফ ২৫)',
        location: 'Main Engine',
        workshop: 'Rigging Shop',
        workshopCode: 'WS-01',
        defectImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=60',
        defectDate: '2026-07-14',
        defectDescription: 'মেইন ইঞ্জিনের ৪ নম্বর সিলিন্ডারের ফুয়েল ইনজেক্টর প্রেসার অসম এবং মাত্রাতিরিক্ত ভাইব্রেশন দেখা গেছে।',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        status: 'Pending',
        createdAt: '2026-07-14T00:00:00.000Z'
      },
      {
        id: 'def-sample-2',
        shipName: 'BNS Somudra Joy (এফ ২৮)',
        location: 'Diesel Generator 1 (DG-1)',
        workshop: 'Electrical Power Workshop',
        workshopCode: 'WS-05',
        defectImage: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=400&auto=format&fit=crop&q=60',
        defectDate: '2026-07-10',
        defectDescription: 'ডিজি-১ লোড টেস্টের সময় লুব অয়েল কুলারে সামান্য তাপমাত্রা বৃদ্ধি লক্ষ্য করা গেছে এবং সিলিং গ্যাসকেটে লিক দেখা গেছে।',
        solutionDate: '2026-07-12',
        solutionImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&auto=format&fit=crop&q=60',
        solutionDescription: 'ইঞ্জিনিয়ার অফিসারদের তত্ত্বাবধানে লুব অয়েল কুলারের গ্যাসকেট পরিবর্তন করা হয়েছে এবং মেকানিক্যাল সিলিং রিং টাইট দেওয়া হয়েছে। বর্তমানে তাপমাত্রা স্বাভাবিক।',
        status: 'Solved',
        createdAt: '2026-07-10T00:00:00.000Z'
      },
      {
        id: 'def-1784491764227',
        shipName: 'BNS Ali Haider (এফ ১৭)',
        location: 'Diesel Generator 1 (DG-1)',
        workshop: 'Electrical Power Workshop',
        workshopCode: 'WS-05',
        defectDate: '2026-07-19',
        defectDescription: 'ইলেক্ট্রিক্যাল ব্যাকআপ পাওয়ার ফিডার চেক ও ক্যাবল কানেকশন মেরামত।',
        solutionDate: '2026-07-22',
        solutionDescription: 'ক্যাবল টার্মিনেশন সম্পন্ন এবং লোড টেস্টিং সফল হয়েছে।',
        defectImage: '',
        solutionImage: '',
        status: 'Solved',
        createdAt: '2026-07-19T00:00:00.000Z'
      },
      {
        id: 'def-1784490656515',
        shipName: 'BNS Bangabandhu (এফ ২৫)',
        location: 'Main Engine',
        workshop: 'Machine Shop',
        workshopCode: 'WS-02',
        defectDate: '2026-07-19',
        defectDescription: 'হাইড্রোফোর পাম্প শ্যাফট অ্যালাইনমেন্ট ও বিয়ারিং ক্লিয়ারেন্স পর্যবেক্ষণ।',
        solutionDate: '2026-07-23',
        solutionDescription: 'বিয়ারিং প্রতিস্থাপন ও প্রিসিশন ডায়ালগেজ ক্যালিব্রেশন সফল হয়েছে।',
        defectImage: '',
        solutionImage: '',
        status: 'Solved',
        createdAt: '2026-07-19T00:00:00.000Z'
      }
    ];
  });

  const [riggingShopName, setRiggingShopName] = useState<string>(() => {
    return localStorage.getItem('defect_tracker_shop_name') || 'RIGGING SHOP';
  });

  // Search Filter state shared with Dashboard
  const [searchFilter, setSearchFilter] = useState({
    shipName: '',
    location: '',
    fromDate: '',
    toDate: '',
    workshop: ''
  });

  // Current system time for Navy header clock
  const [systemTime, setSystemTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.toLocaleString('bn-BD', {
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

  // Supabase Cloud Database synchronization state
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<{
    isConnected: boolean;
    isTablesReady: boolean;
    isSyncing: boolean;
    lastSynced: Date | null;
    message: string;
  }>({
    isConnected: false,
    isTablesReady: false,
    isSyncing: false,
    lastSynced: null,
    message: 'Connecting to Supabase Cloud Database...'
  });

  // Pull data from Supabase and synchronize
  const syncWithSupabase = async () => {
    setSupabaseSyncStatus(prev => ({ ...prev, isSyncing: true }));
    try {
      const health = await supabaseService.checkHealth();
      if (!health.isConnected) {
        setSupabaseSyncStatus({
          isConnected: false,
          isTablesReady: false,
          isSyncing: false,
          lastSynced: null,
          message: health.message
        });
        return;
      }

      if (!health.isTablesReady) {
        setSupabaseSyncStatus({
          isConnected: true,
          isTablesReady: false,
          isSyncing: false,
          lastSynced: new Date(),
          message: health.message
        });
        return;
      }

      // If tables are ready, load data from Supabase
      const [remoteDefects, remoteWorkshops, remoteShips, remoteLocations, remoteConfig, remoteProfile] = await Promise.all([
        supabaseService.fetchDefects(),
        supabaseService.fetchWorkshops(),
        supabaseService.fetchShips(),
        supabaseService.fetchLocations(),
        supabaseService.fetchDockyardConfig(),
        supabaseService.fetchUserProfile()
      ]);

      if (remoteDefects && remoteDefects.length > 0) {
        setDefects(remoteDefects);
        localStorage.setItem('defect_tracker_defects', JSON.stringify(remoteDefects));
      } else if (remoteDefects && remoteDefects.length === 0 && defects.length > 0) {
        // Auto-seed existing defects to Supabase
        supabaseService.syncAllDefects(defects);
      }

      if (remoteWorkshops && remoteWorkshops.length > 0) {
        setWorkshops(remoteWorkshops);
        localStorage.setItem('defect_tracker_workshops', JSON.stringify(remoteWorkshops));
      } else if (remoteWorkshops && remoteWorkshops.length === 0 && workshops.length > 0) {
        // Auto-seed existing workshops to Supabase
        supabaseService.syncAllWorkshops(workshops);
      }

      if (remoteShips && remoteShips.length > 0) {
        setShips(remoteShips);
        localStorage.setItem('defect_tracker_ships', JSON.stringify(remoteShips));
      } else if (remoteShips && remoteShips.length === 0 && ships.length > 0) {
        supabaseService.syncAllShips(ships);
      }

      if (remoteLocations && remoteLocations.length > 0) {
        setLocations(remoteLocations);
        localStorage.setItem('defect_tracker_locations', JSON.stringify(remoteLocations));
      } else if (remoteLocations && remoteLocations.length === 0 && locations.length > 0) {
        supabaseService.syncAllLocations(locations);
      }

      if (remoteConfig) {
        setDockyardConfig(remoteConfig);
        localStorage.setItem('defect_tracker_dockyard_config', JSON.stringify(remoteConfig));
      } else {
        supabaseService.saveDockyardConfig(dockyardConfig);
      }

      if (remoteProfile) {
        setProfile(remoteProfile);
        localStorage.setItem('defect_tracker_profile', JSON.stringify(remoteProfile));
      } else {
        supabaseService.saveUserProfile(profile);
      }

      setSupabaseSyncStatus({
        isConnected: true,
        isTablesReady: true,
        isSyncing: false,
        lastSynced: new Date(),
        message: 'Supabase Cloud Database synchronized'
      });
    } catch (err: any) {
      console.warn('[Supabase] Initial sync warning:', err);
      setSupabaseSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        message: err?.message || 'Sync warning'
      }));
    }
  };

  // Run initial sync and subscribe to real-time changes
  useEffect(() => {
    syncWithSupabase();

    const channel = supabase
      .channel('fleet_tracker_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'defects' }, payload => {
        if (payload.eventType === 'INSERT') {
          const fresh = mapDefectFromDb(payload.new);
          setDefects(prev => prev.some(d => d.id === fresh.id) ? prev : [fresh, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          const updated = mapDefectFromDb(payload.new);
          setDefects(prev => prev.map(d => d.id === updated.id ? updated : d));
        } else if (payload.eventType === 'DELETE') {
          const deleted = payload.old as { id: string };
          setDefects(prev => prev.filter(d => d.id !== deleted.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workshops' }, () => {
        supabaseService.fetchWorkshops().then(ws => {
          if (ws && ws.length) {
            setWorkshops(ws);
            localStorage.setItem('defect_tracker_workshops', JSON.stringify(ws));
          }
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ships' }, () => {
        supabaseService.fetchShips().then(sh => {
          if (sh && sh.length) {
            setShips(sh);
            localStorage.setItem('defect_tracker_ships', JSON.stringify(sh));
          }
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, () => {
        supabaseService.fetchLocations().then(loc => {
          if (loc && loc.length) {
            setLocations(loc);
            localStorage.setItem('defect_tracker_locations', JSON.stringify(loc));
          }
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dockyard_config' }, () => {
        supabaseService.fetchDockyardConfig().then(cfg => {
          if (cfg) {
            setDockyardConfig(cfg);
            localStorage.setItem('defect_tracker_dockyard_config', JSON.stringify(cfg));
          }
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Sync state to local storage and Supabase helper
  const updateDefectsState = (newDefects: Defect[]) => {
    setDefects(newDefects);
    localStorage.setItem('defect_tracker_defects', JSON.stringify(newDefects));
  };

  const handleUpdateWorkshops = (updated: Workshop[]) => {
    setWorkshops(updated);
    localStorage.setItem('defect_tracker_workshops', JSON.stringify(updated));
    supabaseService.syncAllWorkshops(updated);
  };

  const handleUpdateDockyardConfig = (config: DockyardConfig) => {
    setDockyardConfig(config);
    localStorage.setItem('defect_tracker_dockyard_config', JSON.stringify(config));
    supabaseService.saveDockyardConfig(config);
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('defect_tracker_profile', JSON.stringify(newProfile));
    supabaseService.saveUserProfile(newProfile);
  };

  const handleAddShip = (shipName: string) => {
    if (!ships.includes(shipName)) {
      const updated = [...ships, shipName];
      setShips(updated);
      localStorage.setItem('defect_tracker_ships', JSON.stringify(updated));
      supabaseService.addShip(shipName);
    }
  };

  const handleDeleteShip = (shipName: string) => {
    const updated = ships.filter(s => s !== shipName);
    setShips(updated);
    localStorage.setItem('defect_tracker_ships', JSON.stringify(updated));
    supabaseService.deleteShip(shipName);
  };

  const handleAddLocation = (locName: string) => {
    if (!locations.includes(locName)) {
      const updated = [...locations, locName];
      setLocations(updated);
      localStorage.setItem('defect_tracker_locations', JSON.stringify(updated));
      supabaseService.addLocation(locName);
    }
  };

  const handleDeleteLocation = (locName: string) => {
    const updated = locations.filter(l => l !== locName);
    setLocations(updated);
    localStorage.setItem('defect_tracker_locations', JSON.stringify(updated));
    supabaseService.deleteLocation(locName);
  };

  const handleUpdateRiggingShopName = (name: string) => {
    setRiggingShopName(name);
    localStorage.setItem('defect_tracker_shop_name', name);
  };

  // Defect operations with dual persistence (local + Supabase)
  const handleAddDefect = (newDefectData: Omit<Defect, 'id' | 'createdAt'>) => {
    const freshDefect: Defect = {
      ...newDefectData,
      id: `def-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [freshDefect, ...defects];
    updateDefectsState(updated);
    supabaseService.upsertDefect(freshDefect);
  };

  const handleDeleteDefect = (id: string) => {
    const filtered = defects.filter(d => d.id !== id);
    updateDefectsState(filtered);
    supabaseService.deleteDefect(id);
  };

  const handleUpdateStatus = (
    id: string, 
    solutionDate?: string, 
    solutionDesc?: string, 
    solutionImg?: string
  ) => {
    let updatedDefect: Defect | null = null;
    const updated = defects.map(d => {
      if (d.id === id) {
        updatedDefect = {
          ...d,
          solutionDate: solutionDate || new Date().toISOString().split('T')[0],
          solutionDescription: solutionDesc || 'সমাধান সম্পন্ন হয়েছে।',
          solutionImage: solutionImg || '',
          status: 'Solved' as const
        };
        return updatedDefect;
      }
      return d;
    });
    updateDefectsState(updated);
    if (updatedDefect) {
      supabaseService.upsertDefect(updatedDefect);
    }
  };


  // Auth operations
  const handleLoginSuccess = (session: AuthSession) => {
    setAuthSession(session);
    localStorage.setItem('defect_tracker_auth', JSON.stringify(session));
    // Admin login automatically opens Admin Control Center; Workshop opens Dashboard
    if (session.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Restrict workshop users from accessing the admin panel and admin from operational pages
  useEffect(() => {
    if (authSession && authSession.role !== 'admin' && activeTab === 'admin') {
      setActiveTab('dashboard');
    } else if (authSession && authSession.role === 'admin' && (activeTab === 'dashboard' || activeTab === 'entry' || activeTab === 'inprogress' || activeTab === 'find')) {
      setActiveTab('admin');
    }
  }, [authSession, activeTab]);

  // In-app Logout Modal State (Immune to browser iframe popup blocking)
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  // User Profile & Photo Edit Modal
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  const handleRequestLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setAuthSession(null);
    localStorage.removeItem('defect_tracker_auth');
    setShowLogoutModal(false);
  };

  const handleSaveProfileModal = (newProfile: UserProfile, newOfficerName?: string) => {
    setProfile(newProfile);
    localStorage.setItem('defect_tracker_profile', JSON.stringify(newProfile));

    if (authSession && newOfficerName) {
      const updatedSession: AuthSession = {
        ...authSession,
        officerName: newOfficerName
      };
      setAuthSession(updatedSession);
      localStorage.setItem('defect_tracker_auth', JSON.stringify(updatedSession));
    }
  };

  const handleResetApp = () => {
    localStorage.clear();
    setProfile(DEFAULT_PROFILE);
    setDockyardConfig(DEFAULT_DOCKYARD_CONFIG);
    setWorkshops(DEFAULT_WORKSHOPS);
    setShips(DEFAULT_SHIPS);
    setLocations(DEFAULT_LOCATIONS);
    setDefects([]);
    setAuthSession(null);
    window.location.reload();
  };

  // Active user workshop details (in English)
  const activeWorkshopName = authSession?.workshopNameEn || authSession?.workshopNameBn || 'Naval Dockyard Headquarters';
  const activeWorkshopCode = authSession?.workshopCode || 'HQ';
  const isAdmin = authSession?.role === 'admin';

  // Calculate pending defects count (isolated to workshop user's shop if logged in as workshop user)
  // MUST be called unconditionally at top-level before any early return to comply with React Rules of Hooks
  const pendingJobsCount = useMemo(() => {
    if (authSession?.role === 'workshop_user' && authSession.workshopCode && authSession.workshopCode !== 'HQ' && authSession.workshopCode !== 'HQ-ADMIN') {
      const wsCode = authSession.workshopCode.toUpperCase();
      const wsNameEn = (authSession.workshopNameEn || '').toLowerCase();
      const wsNameBn = authSession.workshopNameBn || '';
      return defects.filter(d => {
        if (d.status === 'Solved') return false;
        return (d.workshopCode && d.workshopCode.toUpperCase() === wsCode) ||
               (d.workshop && (
                 d.workshop.toUpperCase().includes(wsCode) ||
                 (wsNameEn && d.workshop.toLowerCase().includes(wsNameEn)) ||
                 (wsNameBn && d.workshop.includes(wsNameBn))
               ));
      }).length;
    }
    return defects.filter(d => d.status !== 'Solved').length;
  }, [defects, authSession]);

  // Active Tab Title Translation for Header
  const getTabTitle = () => {
    if (isAdmin) {
      switch (adminSubTab) {
        case 'workshops':
          return 'Workshop Configuration Panel';
        case 'settings':
        case 'site_info':
          return 'Static Website Settings (সেটিংস)';
        case 'fleet':
          return 'Fleet Warship Management';
        case 'locations':
          return 'Locations & Compartments System';
        case 'users':
          return 'Workshop Users & Login Credentials (শপ ইউজার ও লগইন তথ্য)';
        case 'production':
          return 'Production Department & Work Order System';
        case 'profile':
          return 'Admin Officer Profile';
        case 'backup':
          return 'Data Backup & Restore';
        default:
          return 'Admin Control Panel';
      }
    }

    switch (activeTab) {
      case 'dashboard':
        return 'Warship Defect Monitoring Dashboard';
      case 'entry':
        return 'Defect Entry Panel';
      case 'inprogress':
        return 'In Progress Jobs & Defect Rectification (চলমান কাজ)';
      case 'find':
        return 'Defect Find & Query Engine';
      case 'organization':
        return 'Bangladesh Navy Dockyard Organization';
      case 'production':
        return 'Production Department — General Manager & DGM Wings';
      case 'admin':
        return 'Admin Control Panel';
      default:
        return 'Warship Defect Tracker';
    }
  };

  // If user is not authenticated, render Login Page
  if (!authSession) {
    return (
      <Login 
        workshops={workshops} 
        dockyardConfig={dockyardConfig} 
        profile={profile}
        onLoginSuccess={handleLoginSuccess} 
      />
    );
  }

  return (
    <div id="app-root-container" className="flex h-screen w-screen overflow-hidden bg-[#FCF4E2] text-slate-800 font-sans">
      
      {/* 1. SIDEBAR NAVIGATION PANEL */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        adminSubTab={adminSubTab}
        setAdminSubTab={setAdminSubTab}
        profile={profile} 
        authSession={authSession}
        dockyardConfig={dockyardConfig}
        workshopsCount={workshops.length}
        shipsCount={ships.length}
        pendingCount={pendingJobsCount}
        onLogout={handleRequestLogout}
        onOpenProfileModal={() => setShowProfileModal(true)}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* 2. MAIN CORE LAYOUT PANEL */}
      <main id="main-content-area" className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#FCF4E2] w-full min-w-0">
        
        {/* Unified Maritime Parchment Background across all pages (ইউজার ড্যাসবোর্ড সহ সকল পেজ একই ব্যাকগ্রাউন্ড) */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none transition-all duration-700 bg-[#FCF4E2]"
          style={{
            backgroundColor: '#FCF4E2',
            backgroundImage: `
              radial-gradient(#d6c7ab 1.1px, transparent 1.1px),
              linear-gradient(to bottom, #FCF4E2, #f7ebd5)
            `,
            backgroundSize: '28px 28px, 100% 100%'
          }}
        >
          <div 
            className="absolute inset-0 bg-cover bg-no-repeat opacity-[0.07] mix-blend-multiply transition-opacity duration-700 pointer-events-none"
            style={{
              backgroundImage: `url('${navyFleetBg}')`,
              backgroundPosition: 'center 40%',
              backgroundAttachment: 'fixed',
            }}
          />
        </div>

        {/* Navy Header Panel - Admin & User Header */}
        {authSession.role === 'admin' ? (
          /* Admin Header - Centered & Fully Responsive */
          <header id="main-navy-header" className="min-h-16 sm:min-h-20 py-2 sm:py-3 bg-[#001738] text-white px-2.5 sm:px-6 md:px-8 flex items-center justify-between shadow-2xl shrink-0 z-10 border-b-2 border-amber-500 select-none">
            {/* Left: Mobile Menu Button */}
            <div className="shrink-0 flex items-center">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="lg:hidden p-1.5 sm:p-2 text-amber-300 hover:text-white bg-amber-500/15 hover:bg-amber-500/30 border border-amber-400/40 rounded-xl mr-1.5 sm:mr-3 cursor-pointer shrink-0 transition-all active:scale-95"
                title="Open Menu"
                aria-label="Open Navigation Menu"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Center: BANGLADESH NAVY + Circular Naval Crest Logo + BN DOCKYARD ADMIN PORTAL - Centered */}
            <div className="flex-1 flex items-center justify-center min-w-0 px-1 sm:px-4 text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 min-w-0 text-center">
                <span className="text-[11px] xs:text-xs sm:text-base md:text-xl lg:text-2xl font-black text-amber-400 font-algerian tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] whitespace-nowrap">
                  BANGLADESH NAVY
                </span>

                <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full p-0.5 sm:p-1 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 border-2 border-amber-300 shadow-xl flex items-center justify-center shrink-0 overflow-hidden bg-white">
                  <img 
                    src="/anchor.jpg" 
                    alt="Bangladesh Navy Crest" 
                    className="w-full h-full object-cover rounded-full" 
                  />
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 text-center">
                  <h1 
                    id="header-admin-portal-title"
                    className="text-[11px] xs:text-xs sm:text-base md:text-xl lg:text-2xl font-black text-amber-300 font-algerian tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] whitespace-nowrap"
                    title="BN DOCKYARD • ADMIN PORTAL"
                  >
                    BN DOCKYARD
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] sm:text-xs font-algerian font-bold rounded-lg tracking-wider whitespace-nowrap">
                    ADMIN PORTAL
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Logout Button with Icon & Text */}
            <div className="shrink-0 flex items-center pl-1.5 sm:pl-4">
              <button
                onClick={handleRequestLogout}
                id="header-logout-btn"
                className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-rose-600/20 hover:bg-rose-600/35 border-2 border-rose-500/50 hover:border-rose-400 text-rose-300 hover:text-white rounded-xl font-algerian text-xs sm:text-sm font-bold tracking-wider transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                title="Logout"
              >
                <LogOut className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-rose-400 shrink-0" />
                <span className="hidden sm:inline">LOGOUT</span>
              </button>
            </div>
          </header>
        ) : (
          /* User / Workshop Header - Centered & Fully Responsive */
          <header id="main-navy-header" className="min-h-16 sm:min-h-20 py-2 sm:py-3 bg-[#001738] text-white px-2.5 sm:px-6 md:px-8 flex items-center justify-between shadow-2xl shrink-0 z-10 border-b-2 border-amber-500 select-none">
            {/* Left: Mobile Menu Button */}
            <div className="shrink-0 flex items-center">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="lg:hidden p-1.5 sm:p-2 text-amber-300 hover:text-white bg-amber-500/15 hover:bg-amber-500/30 border border-amber-400/40 rounded-xl mr-1.5 sm:mr-3 cursor-pointer shrink-0 transition-all active:scale-95"
                title="Open Navigation Menu"
                aria-label="Open Navigation Menu"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Center Aligned Content: BN DOCKYARD + Logo + Shop Name - Perfectly Centered */}
            <div className="flex-1 flex items-center justify-center min-w-0 px-1 sm:px-4 text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-5 min-w-0 text-center">
                <span className="text-[11px] xs:text-xs sm:text-base md:text-xl lg:text-2xl font-black text-amber-400 font-algerian tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] whitespace-nowrap">
                  BN DOCKYARD
                </span>

                <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full p-0.5 sm:p-1 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 border-2 border-amber-300 shadow-xl flex items-center justify-center shrink-0 overflow-hidden bg-white">
                  <img 
                    src="/anchor.jpg" 
                    alt="Bangladesh Navy Crest" 
                    className="w-full h-full object-cover rounded-full" 
                  />
                </div>

                <h1 
                  className="text-[11px] xs:text-xs sm:text-base md:text-xl lg:text-2xl font-black text-amber-300 font-algerian tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight text-center"
                  title={activeWorkshopName}
                >
                  {activeWorkshopName}
                </h1>
              </div>
            </div>

            {/* Far Right: LOGOUT button */}
            <div className="shrink-0 flex items-center pl-1.5 sm:pl-4">
              <button
                onClick={handleRequestLogout}
                id="header-logout-btn"
                className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-rose-600/20 hover:bg-rose-600/35 border-2 border-rose-500/50 hover:border-rose-400 text-rose-300 hover:text-white rounded-xl font-algerian text-xs sm:text-sm font-bold tracking-wider transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                title="Logout"
              >
                <LogOut className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-rose-400 shrink-0" />
                <span className="hidden sm:inline">LOGOUT</span>
              </button>
            </div>
          </header>
        )}

        {/* Emergency Alert Banner (If Enabled by Admin in Settings) */}
        {dockyardConfig.emergencyAlertEnabled && dockyardConfig.emergencyAlertText && (
          <div className="bg-rose-900/95 border-b-2 border-rose-500 py-1.5 px-4 text-center text-xs sm:text-sm font-bold text-rose-200 flex items-center justify-center gap-2 z-20 shadow-lg animate-pulse">
            <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{dockyardConfig.emergencyAlertText}</span>
          </div>
        )}

        {/* Slow Right to Left Welcome Banner (Synced with Settings) */}
        {dockyardConfig.showMarquee !== false && (
          <div className="bg-[#000d1e] border-b-2 border-slate-400/25 overflow-hidden py-1.5 px-4 flex items-center shadow-md z-10">
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
                {dockyardConfig.marqueeText || '⚓ WELCOME TO AREA SUPERINTENDENT DOCKYARD ⚓ — BANGLADESH NAVY DOCKYARD CHATTOGRAM TECHNICAL DEFECT TRACKING & FLEET MAINTENANCE COMMAND — ALL 27 WORKSHOPS OPERATIONAL READINESS 100% ⚓'}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Main Panel Canvas */}
        <section 
          id="main-panel-scroll" 
          className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-8 relative bg-transparent transition-colors duration-500 text-slate-800 custom-scrollbar"
        >
          
          {/* Subtle Decorative Maritime Compass Watermark */}
          <div className="fixed bottom-12 right-12 pointer-events-none opacity-[0.035] text-[#002147]">
            <Compass className="w-80 h-80 stroke-[0.8]" />
          </div>

          {/* Active Tab View */}
          <div className="w-full relative z-1">
            {activeTab === 'dashboard' && (
              <div className="animate-fade-in">
                <Dashboard 
                  defects={defects}
                  ships={ships}
                  locations={locations}
                  workshops={workshops}
                  dockyardConfig={dockyardConfig}
                  authSession={authSession}
                  bgIntensity={bgIntensity}
                  onChangeBgIntensity={handleBgIntensityChange}
                  onDeleteDefect={handleDeleteDefect}
                  onUpdateStatus={handleUpdateStatus}
                  searchFilter={searchFilter}
                  setSearchFilter={setSearchFilter}
                  onNavigateToEntry={() => {
                    setActiveTab('entry');
                  }}
                />
              </div>
            )}

            {activeTab === 'entry' && (
              <div className="animate-fade-in">
                <DefectEntry 
                  ships={ships} 
                  locations={locations} 
                  workshops={workshops}
                  activeWorkshopCode={authSession.workshopCode}
                  onAddDefect={handleAddDefect} 
                />
              </div>
            )}

            {activeTab === 'inprogress' && (
              <div className="animate-fade-in">
                <InProgressJobs 
                  defects={defects}
                  ships={ships}
                  locations={locations}
                  workshops={workshops}
                  authSession={authSession}
                  onUpdateStatus={handleUpdateStatus}
                  onNavigateToEntry={() => {
                    setActiveTab('entry');
                  }}
                  onNavigateToFind={() => {
                    setActiveTab('find');
                  }}
                />
              </div>
            )}

            {activeTab === 'find' && (
              <div className="animate-fade-in">
                <DefectFind 
                  ships={ships} 
                  locations={locations} 
                  workshops={workshops}
                  defects={defects}
                  authSession={authSession}
                  onSearchSubmit={(shipName, location, fromDate, toDate, workshop) => {
                    setSearchFilter({ shipName, location, fromDate, toDate, workshop: workshop || '' });
                  }}
                />
              </div>
            )}

            {activeTab === 'organization' && (
              <div className="animate-fade-in">
                <OrganizationChart 
                  workshops={workshops}
                  defects={defects}
                  dockyardConfig={dockyardConfig}
                  onNavigateToEntry={(loc, ws) => {
                    setActiveTab('entry');
                  }}
                  onNavigateToSearch={(ws) => {
                    setSearchFilter(prev => ({ ...prev, workshop: ws || '' }));
                    setActiveTab('dashboard');
                  }}
                />
              </div>
            )}

            {activeTab === 'production' && (
              <div className="animate-fade-in">
                <ProductionDepartment 
                  workshops={workshops}
                  defects={defects}
                  dockyardConfig={dockyardConfig}
                  onNavigateToEntry={(loc, ws) => {
                    setActiveTab('entry');
                  }}
                  onNavigateToSearch={(ws) => {
                    setSearchFilter(prev => ({ ...prev, workshop: ws || '' }));
                    setActiveTab('dashboard');
                  }}
                />
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="animate-fade-in">
                <AdminPanel 
                  workshops={workshops}
                  onUpdateWorkshops={handleUpdateWorkshops}
                  dockyardConfig={dockyardConfig}
                  onUpdateDockyardConfig={handleUpdateDockyardConfig}
                  ships={ships}
                  onAddShip={handleAddShip}
                  onDeleteShip={handleDeleteShip}
                  locations={locations}
                  onAddLocation={handleAddLocation}
                  onDeleteLocation={handleDeleteLocation}
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
                  defects={defects}
                  onResetApp={handleResetApp}
                  riggingShopName={riggingShopName}
                  onUpdateRiggingShopName={handleUpdateRiggingShopName}
                  initialSubTab={adminSubTab}
                  onSubTabChange={(sub) => setAdminSubTab(sub)}
                  bgIntensity={bgIntensity}
                  onBgIntensityChange={handleBgIntensityChange}
                />
              </div>
            )}
          </div>

        </section>

        {/* Footer Bar with Glassmorphism */}
        <footer className="h-9 bg-[#00142e]/80 backdrop-blur-md border-t border-white/10 px-6 md:px-8 flex items-center justify-between text-[11px] text-slate-300 shrink-0 font-mono z-10">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${
              supabaseSyncStatus.isConnected 
                ? (supabaseSyncStatus.isTablesReady ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse')
                : 'bg-slate-400'
            }`}></span>
            <span>© 2026 {dockyardConfig.yardNameEn} • Technical Directorate</span>
            <span className="hidden md:inline text-slate-400 border-l border-white/20 pl-2">
              Supabase Cloud: {supabaseSyncStatus.isConnected ? (supabaseSyncStatus.isTablesReady ? '🟢 Live Synced' : '🟡 Ready (Run SQL)') : '⚪ Local Cache'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-slate-400">Total Workshops: {workshops.length} Units</span>
            <span className="font-bold text-amber-300">Warship Defect Tracking System v3.0</span>
          </div>
        </footer>

      </main>

      {/* SECURE IN-APP LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#001738] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-black text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500"></div>

            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/20">
              <LogOut className="h-8 w-8 stroke-[2.2]" />
            </div>

            <h3 className="text-xl font-black text-white mb-2 tracking-tight">
              Confirm Sign Out
            </h3>
            
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to sign out of Bangladesh Navy Dockyard Defect Tracking System? Your active session will be securely ended.
            </p>

            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="py-3 px-4 bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="py-3 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-black tracking-wider transition-all shadow-lg shadow-rose-600/40 cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Yes, Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER & ADMIN PROFILE EDIT / PHOTO UPLOAD MODAL */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        authSession={authSession}
        onSaveProfile={handleSaveProfileModal}
      />
    </div>
  );
}
