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

import { Defect, UserProfile, Workshop, DockyardConfig, AuthSession, NavTab, AdminSubTab, ProductionUnitItem } from './types';
import { 
  DEFAULT_SHIPS, 
  DEFAULT_LOCATIONS, 
  DEFAULT_PROFILE, 
  DEFAULT_WORKSHOPS, 
  DEFAULT_DOCKYARD_CONFIG 
} from './constants';
import { DEFAULT_PRODUCTION_UNITS } from './data/productionUnits';
import { supabase } from './lib/supabase';
import { supabaseService, mapDefectFromDb } from './services/supabaseService';

export default function App() {
  // Authentication session (using sessionStorage so closing the tab or window automatically logs out)
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    try {
      // Clear legacy localStorage auth so returning users always land on the login page
      localStorage.removeItem('defect_tracker_auth');
      const stored = sessionStorage.getItem('defect_tracker_auth');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  // Navigation active tab: 'dashboard' | 'entry' | 'find' | 'organization' | 'admin'
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Active Admin SubTab: 'workshops' | 'fleet' | 'locations' | 'production' | 'profile' | 'settings' | 'users'
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

  // Dedicated Admin Profile State with isolated LocalStorage caching
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('defect_tracker_admin_profile') || localStorage.getItem('defect_tracker_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure Admin profile is never corrupted with Shop 1 credentials
        if (parsed.name?.toLowerCase().includes('sakib') || parsed.officialId === '8116') {
          return DEFAULT_PROFILE;
        }
        return parsed;
      }
      return DEFAULT_PROFILE;
    } catch (e) {
      return DEFAULT_PROFILE;
    }
  });

  const [dockyardConfig, setDockyardConfig] = useState<DockyardConfig>(() => {
    try {
      const stored = localStorage.getItem('defect_tracker_dockyard_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.headerLogoUrl || parsed.headerLogoUrl === '/anchor.jpg') {
          parsed.headerLogoUrl = '/asd_navy_logo.jpg';
        }
        return parsed;
      }
      return DEFAULT_DOCKYARD_CONFIG;
    } catch (e) {
      return DEFAULT_DOCKYARD_CONFIG;
    }
  });

  const [workshops, setWorkshops] = useState<Workshop[]>(() => {
    try {
      const stored = localStorage.getItem('defect_tracker_workshops');
      let list: Workshop[] = stored ? JSON.parse(stored) : DEFAULT_WORKSHOPS;
      // Strictly guarantee Shop 1 is always Rigging Shop (রিগিং শপ)
      list = list.map(ws => {
        if (ws.id === 'ws-01' || ws.code === 'WS-01') {
          return {
            ...ws,
            id: 'ws-01',
            code: 'WS-01',
            nameEn: ws.nameEn && !ws.nameEn.toLowerCase().includes('admin') ? ws.nameEn : 'Rigging Shop',
            nameBn: ws.nameBn && !ws.nameBn.includes('এডমিন') ? ws.nameBn : 'রিগিং শপ',
            category: 'Deck & Lifting Gear',
            description: 'Repair and testing of ship cables, wire ropes, cranes, and hoisting equipment.',
            username: ws.username || 'oic.ws01',
            password: ws.password || '123456'
          };
        }
        return ws;
      });
      return list;
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
    const defaultSeedDefects: Defect[] = [
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
        id: 'def-paint-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Hull, Keel & Underwater Hull',
        workshop: 'Painting & Preservation Shop',
        workshopCode: 'WS-10',
        defectDescription: 'আন্ডারওয়াটার হাল ও ওয়াটারলাইন সংলগ্ন এরিয়ায় অ্যান্টি-ফাউলিং কোটিং ক্ষয়প্রাপ্ত। স্ক্র্যাপ গ্রিট ব্লাস্টিং ও নতুন ইপোক্সি কোটিং এবং জিংক অ্যানোড সংরক্ষণ কার্যক্রম।',
        defectDate: '2026-09-02',
        status: 'Pending',
        defectImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&auto=format&fit=crop&q=60',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        createdAt: '2026-09-02T00:00:00.000Z'
      },
      {
        id: 'def-paint-02',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Flight Deck & Quarter Deck',
        workshop: 'Painting & Preservation Shop',
        workshopCode: 'WS-10',
        defectDescription: 'ফ্লাইট ডেক নন-স্কিড কোটিং ওয়াশআউট ও টেকনিক্যাল হেলো ল্যান্ডিং মার্কিং রি-পেইন্টিং এবং প্রিভেন্টিভ কোটিং সংরক্ষণ কার্যক্রম চলমান।',
        defectDate: '2026-09-05',
        status: 'Pending',
        defectImage: '',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        createdAt: '2026-09-05T00:00:00.000Z'
      },
      {
        id: 'def-paint-03',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Bow & Anchor Windlass Station',
        workshop: 'Painting & Preservation Shop',
        workshopCode: 'WS-10',
        defectDescription: 'ফোরক্যাসল ডেক ও হস পাইপ সংলগ্ন স্টিল প্লেটে অ্যান্টি-করোসিভ প্রাইমার ও ফিনিশিং মেরিন গ্রেড পেইন্টিং সম্পন্ন।',
        defectDate: '2026-08-28',
        solutionDate: '2026-09-01',
        solutionDescription: 'বিএসআই ও নেভাল স্ট্যান্ডার্ড অনুযায়ী জিংক প্রাইমার ও টু-প্যাক ইপোক্সি ফিনিশ কোট প্রয়োগ সফলভাবে সম্পন্ন হয়েছে।',
        defectImage: '',
        solutionImage: '',
        status: 'Solved',
        createdAt: '2026-08-28T00:00:00.000Z'
      },
      {
        id: 'def-hull-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Hull, Keel & Underwater Hull',
        workshop: 'Hull & Structural Shop',
        workshopCode: 'WS-03',
        defectDescription: 'হাল প্লেট ফ্রেম ৩২ সংলগ্ন স্থানে সামান্য ক্ষয় ও আল্ট্রাসনিক থিকনেস গজ (UTG) রিডিং পর্যবেক্ষণ কার্যক্রম।',
        defectDate: '2026-09-03',
        status: 'Pending',
        defectImage: '',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        createdAt: '2026-09-03T00:00:00.000Z'
      },
      {
        id: 'def-weld-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Bow & Anchor Windlass Station',
        workshop: 'Welding & Fabrication Shop',
        workshopCode: 'WS-04',
        defectDescription: 'চেইন লকার ওয়াটারটাইট বাল্কহেড ও হস পাইপ মেটাল ডাবলার ওয়েল্ডিং কার্যক্রম সম্পন্ন।',
        defectDate: '2026-09-01',
        solutionDate: '2026-09-04',
        solutionDescription: 'ডাবল পাস ওয়েল্ডিং ও ডাই পেনিট্রান্ট টেস্ট (DPT) দ্বারা ত্রুটিহীনতা নিশ্চিত করা হয়েছে।',
        defectImage: '',
        solutionImage: '',
        status: 'Solved',
        createdAt: '2026-09-01T00:00:00.000Z'
      },
      {
        id: 'def-sample-1',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Main Engine',
        workshop: 'IC Engine & Diesel Shop',
        workshopCode: 'WS-08',
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
        shipName: 'BNS Somudra Joy (F 28)',
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
        shipName: 'BNS Ali Haider (F 17)',
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
        shipName: 'BNS Bangabandhu (F 25)',
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
      },
      {
        id: 'def-ws02-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Forecastle & 76mm Naval Gun',
        workshop: 'Machine Shop',
        workshopCode: 'WS-02',
        defectDate: '2026-09-06',
        defectDescription: '৭৬মিমি প্রধান নেভাল গান মাউন্টের ট্রানিয়ন পিন ও এলিভেশন সেক্টর গিয়ার টিথ প্রিসিশন লেদ টার্নিং ও ফেসিং কার্যক্রম চলমান।',
        status: 'Pending',
        defectImage: '',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        createdAt: '2026-09-06T00:00:00.000Z'
      },
      {
        id: 'def-ws06-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Radar Mast',
        workshop: 'Electronics & Radar Shop',
        workshopCode: 'WS-06',
        defectDate: '2026-09-04',
        defectDescription: '৩ডি লং-রেঞ্জ সার্ভেইল্যান্স রাডার অ্যান্টেনা ওয়েভগাইড আরএফ সিগন্যাল লস টেস্ট ও পিআরএফ ক্যালিব্রেশন।',
        status: 'Pending',
        defectImage: '',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        createdAt: '2026-09-04T00:00:00.000Z'
      },
      {
        id: 'def-ws07-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Forecastle & 76mm Naval Gun',
        workshop: 'Weapon & Ordnance Shop',
        workshopCode: 'WS-07',
        defectDate: '2026-09-03',
        defectDescription: '৭৬মিমি প্রধান নেভাল গান মাউন্ট রিকয়েল সিলিন্ডার হাইড্রোলিক সিল প্রেসার চেক ও টেস্ট ফায়ারিং প্রস্তুতি।',
        status: 'Pending',
        defectImage: '',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        createdAt: '2026-09-03T00:00:00.000Z'
      },
      {
        id: 'def-ws09-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'AC Chiller & Fresh Water Plant',
        workshop: 'Pipe Fitting & Plumbing Shop',
        workshopCode: 'WS-09',
        defectDate: '2026-09-02',
        defectDescription: 'আরও ওয়াটার ডিস্যালিনেশন প্ল্যান্ট হাই-প্রেসার ব্রাইন ফ্ল্যাঞ্জ ও ভালভ গ্যাসকেট লিকেজ মেরামত সম্পন্ন।',
        solutionDate: '2026-09-06',
        solutionDescription: 'নতুন হাই-টেনসাইল গ্যাসকেট প্রতিস্থাপন ও ১৮০ বার প্রেসার টেস্ট সফল।',
        defectImage: '',
        solutionImage: '',
        status: 'Solved',
        createdAt: '2026-09-02T00:00:00.000Z'
      },
      {
        id: 'def-ws11-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Diesel Generator 1 (DG-1)',
        workshop: 'Boiler & Steam Shop',
        workshopCode: 'WS-11',
        defectDate: '2026-09-05',
        defectDescription: 'অক্সিলারি স্টিম বয়লার সেফটি রিলিজ ভালভ হাইড্রোলিক পপিং প্রেসার টেস্ট ও বার্নার জেট ক্লিনিং।',
        status: 'Pending',
        defectImage: '',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        createdAt: '2026-09-05T00:00:00.000Z'
      },
      {
        id: 'def-ws12-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Main Engine',
        workshop: 'Gas Turbine & Propulsion Shop',
        workshopCode: 'WS-12',
        defectDate: '2026-09-04',
        defectDescription: 'মেইন প্রপালশন গ্যাস টারবাইন ব্লেডস বোরোস্কোপ পরিদর্শন ও রিডাকশন গিয়ারবক্স কাপলিং চেক।',
        status: 'Pending',
        defectImage: '',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        createdAt: '2026-09-04T00:00:00.000Z'
      },
      {
        id: 'def-ws13-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Flight Deck & Quarter Deck',
        workshop: 'Sail Loft & Survival Equipment Shop',
        workshopCode: 'WS-13',
        defectDate: '2026-09-01',
        defectDescription: 'ফ্লাইট ডেক এভিয়েশন ক্র্যাশ রেসকিউ ফায়ার স্যুট ও লাইফ র‍্যাফট হাইড্রোস্ট্যাটিক রিলিজ ইউনিট সার্ভিসিং সম্পন্ন।',
        solutionDate: '2026-09-05',
        solutionDescription: 'সার্টিফিকেশন নবায়ন করা হয়েছে ও নতুন এইচআরইউ ইউনিট ফিট করা হয়েছে।',
        defectImage: '',
        solutionImage: '',
        status: 'Solved',
        createdAt: '2026-09-01T00:00:00.000Z'
      },
      {
        id: 'def-ws14-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Steering Gear & Propellers',
        workshop: 'Foundry & Metal Casting Shop',
        workshopCode: 'WS-14',
        defectDate: '2026-09-06',
        defectDescription: 'স্টার্ন টিউব ব্রোঞ্জ গ্ল্যান্ড রিং ও প্রপেলার ব্লেড ক্যাভিটেশন কাস্টিং পরিদর্শন কার্যক্রম।',
        status: 'Pending',
        defectImage: '',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        createdAt: '2026-09-06T00:00:00.000Z'
      },
      {
        id: 'def-ws15-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Hull, Keel & Underwater Hull',
        workshop: 'Shipwright & Carpentry Shop',
        workshopCode: 'WS-15',
        defectDate: '2026-09-03',
        defectDescription: 'ড্রাইডক কিল ব্লক টিম্বার পজিশনিং ও আন্ডারওয়াটার ডকিং প্লাগ লিক চেকিং সম্পন্ন।',
        solutionDate: '2026-09-07',
        solutionDescription: 'ডকিং ব্লক স্ট্রেইটনেস অ্যালাইনমেন্ট অনুমোদিত ড্রয়িং অনুযায়ী নিশ্চিত করা হয়েছে।',
        defectImage: '',
        solutionImage: '',
        status: 'Solved',
        createdAt: '2026-09-03T00:00:00.000Z'
      },
      {
        id: 'def-ws16-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Main Engine',
        workshop: 'Tool Room & Precision Shop',
        workshopCode: 'WS-16',
        defectDate: '2026-09-05',
        defectDescription: 'ইঞ্জিন সিলিন্ডার হেড স্পেশালাইজড হাইড্রোলিক টর্ক রেঞ্চ ও প্রিসিশন ডায়ালগেজ ক্যালিব্রেশন।',
        status: 'Pending',
        defectImage: '',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        createdAt: '2026-09-05T00:00:00.000Z'
      },
      {
        id: 'def-ws17-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Forecastle & 76mm Naval Gun',
        workshop: 'Optical & Fire Control Shop',
        workshopCode: 'WS-17',
        defectDate: '2026-09-04',
        defectDescription: 'ইলেক্ট্রো-অপটিক্যাল গান ডিরেক্টর অপটিক্স প্রিজম ও লেজার রেঞ্জফাইন্ডার অ্যালাইনমেন্ট টেস্ট।',
        status: 'Pending',
        defectImage: '',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        createdAt: '2026-09-04T00:00:00.000Z'
      },
      {
        id: 'def-ws18-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'AC Chiller & Fresh Water Plant',
        workshop: 'Refrigeration & HVAC Shop',
        workshopCode: 'WS-18',
        defectDate: '2026-09-05',
        defectDescription: 'সেন্ট্রাল এসি চিলার কম্প্রেসার সিলিন্ডার হেড সার্ভিসিং ও ফ্রেয়ন গ্যাস লিক পর্যবেক্ষণ।',
        status: 'Pending',
        defectImage: '',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        createdAt: '2026-09-05T00:00:00.000Z'
      },
      {
        id: 'def-ws19-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Steering Gear & Propellers',
        workshop: 'Hydraulic & Pneumatic Shop',
        workshopCode: 'WS-19',
        defectDate: '2026-09-06',
        defectDescription: 'ইলেক্ট্রো-হাইড্রোলিক স্টিয়ারিং গিয়ার রাম সিলিং কিট রিপ্লেসমেন্ট ও হাইড্রো প্রেসার টেস্ট।',
        status: 'Pending',
        defectImage: '',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        createdAt: '2026-09-06T00:00:00.000Z'
      },
      {
        id: 'def-ws20-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Hull, Keel & Underwater Hull',
        workshop: 'Electroplating & Galvanizing Shop',
        workshopCode: 'WS-20',
        defectDate: '2026-09-02',
        defectDescription: 'আন্ডারওয়াটার স্যাক্রিফিশিয়াল জিংক অ্যানোড ব্লক ইনস্টলেশন ও আইসিসিপি রেফারেন্স ইলেক্ট্রোড চেক সম্পন্ন।',
        solutionDate: '2026-09-06',
        solutionDescription: '১২০টি উচ্চ বিশুদ্ধতার জিংক অ্যানোড ব্লক সফলভাবে রিপ্লেস করা হয়েছে।',
        defectImage: '',
        solutionImage: '',
        status: 'Solved',
        createdAt: '2026-09-02T00:00:00.000Z'
      },
      {
        id: 'def-ws21-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Diesel Generator 1 (DG-1)',
        workshop: 'Battery & Power Storage Shop',
        workshopCode: 'WS-21',
        defectDate: '2026-09-04',
        defectDescription: 'ডিজি স্টার্টিং ২৪ ভোল্ট হেভি-ডিউটি ব্যাটারি ব্যাংক ক্যাপাসিটি ডিসচার্জ লোড টেস্ট সম্পাদন।',
        status: 'Pending',
        defectImage: '',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        createdAt: '2026-09-04T00:00:00.000Z'
      },
      {
        id: 'def-ws22-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Hull, Keel & Underwater Hull',
        workshop: 'Underwater Repairs & Diving Unit',
        workshopCode: 'WS-22',
        defectDate: '2026-09-05',
        defectDescription: 'নৌবাহিনীর ডাইভার টিম দ্বারা তলদেশ সি-চেস্ট গ্রিড ক্লিয়ারিং ও আন্ডারওয়াটার সিসিটিভি ভিডিও ইন্সপেকশন।',
        status: 'Pending',
        defectImage: '',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        createdAt: '2026-09-05T00:00:00.000Z'
      },
      {
        id: 'def-ws23-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Bridge & Wheelhouse',
        workshop: 'Telecommunication & Nav-Aids Shop',
        workshopCode: 'WS-23',
        defectDate: '2026-09-05',
        defectDescription: 'ব্রিজ ট্যাকটিক্যাল ভিএইচএফ/ইউএইচএফ নৌ-রেডিও ট্রান্সসিভার পাওয়ার টেস্ট ও অ্যান্টেনা ভিএসডব্লিউআর টিউনিং।',
        status: 'Pending',
        defectImage: '',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        createdAt: '2026-09-05T00:00:00.000Z'
      },
      {
        id: 'def-ws24-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Main Engine',
        workshop: 'Calibration & Instrumentation Lab',
        workshopCode: 'WS-24',
        defectDate: '2026-09-03',
        defectDescription: 'মেইন ইঞ্জিন এক্সহস্ট পাইরোমিটার সেন্সর ও ডিজিটাল প্রেসার ট্র্যান্সমিটার প্রিসিশন ক্যালিব্রেশন সম্পন্ন।',
        solutionDate: '2026-09-06',
        solutionDescription: 'ল্যাব স্ট্যান্ডার্ড অনুসারে ক্যালিব্রেশন সার্টিফিকেট প্রদান করা হয়েছে।',
        defectImage: '',
        solutionImage: '',
        status: 'Solved',
        createdAt: '2026-09-03T00:00:00.000Z'
      },
      {
        id: 'def-ws25-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Hull, Keel & Underwater Hull',
        workshop: 'Quality Control & NDT Lab',
        workshopCode: 'WS-25',
        defectDate: '2026-09-04',
        defectDescription: 'হাল প্লেট ফ্রেম ৪০ থেকে ৬০ পর্যন্ত আল্ট্রাসনিক থিকনেস গজ (UTG) রিডিং ও ওয়েল্ডিং সীমে এনডিটি পরীক্ষা।',
        status: 'Pending',
        defectImage: '',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        createdAt: '2026-09-04T00:00:00.000Z'
      },
      {
        id: 'def-ws26-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Steering Gear & Propellers',
        workshop: 'Propeller & Shaft Alignment Shop',
        workshopCode: 'WS-26',
        defectDate: '2026-09-05',
        defectDescription: 'টেইলশ্যাফট স্টার্ন টিউব কাটলেস বিয়ারিং ক্লিয়ারেন্স মেজারমেন্ট ও অপটিক্যাল অ্যালাইনমেন্ট টেস্ট।',
        status: 'Pending',
        defectImage: '',
        solutionDate: '',
        solutionImage: '',
        solutionDescription: '',
        createdAt: '2026-09-05T00:00:00.000Z'
      },
      {
        id: 'def-ws27-01',
        shipName: 'BNS Bangabandhu (F 25)',
        location: 'Bow & Anchor Windlass Station',
        workshop: 'Yard Services & Heavy Transport',
        workshopCode: 'WS-27',
        defectDate: '2026-09-02',
        defectDescription: 'ডকইয়ার্ড হেভি ক্রেন লিফটিং দ্বারা নোঙর চেইন স্থানান্তর ও মুরিং সাপোর্ট কার্যক্রম সম্পন্ন।',
        solutionDate: '2026-09-06',
        solutionDescription: 'নিরাপদ লিফটিং ও ডক জেটি বার্থিং ক্লিয়ারেন্স নিশ্চিত করা হয়েছে।',
        defectImage: '',
        solutionImage: '',
        status: 'Solved',
        createdAt: '2026-09-02T00:00:00.000Z'
      }
    ];

    try {
      const stored = localStorage.getItem('defect_tracker_defects');
      if (stored) {
        let parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sanitize: Strictly fix any legacy test defect where Machine Shop was attached to Diesel Generators
          parsed = parsed.map((d: Defect) => {
            const isWs02 = d.workshopCode === 'WS-02' || (d.workshop && d.workshop.toLowerCase().includes('machine'));
            const isDgLocation = d.location && (d.location.toLowerCase().includes('generator') || d.location.toLowerCase().includes('dg-') || d.location.toLowerCase().includes('boiler'));
            if (isWs02 && isDgLocation) {
              return { ...d, location: 'Main Engine' };
            }
            return d;
          });
          const existingIds = new Set(parsed.map((d: Defect) => d.id));
          const missingSeeds = defaultSeedDefects.filter(d => !existingIds.has(d.id));
          if (missingSeeds.length > 0) {
            return [...parsed, ...missingSeeds];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    // Seed initial realistic defects
    return defaultSeedDefects;
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

  // Production Department hierarchical units state
  const [productionUnits, setProductionUnits] = useState<ProductionUnitItem[]>(() => {
    try {
      const stored = localStorage.getItem('defect_tracker_production_units');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Verify cached version contains WS-01 Rigging Shop; if outdated, refresh to DEFAULT_PRODUCTION_UNITS
          const hasRiggingShop = parsed.some((u: ProductionUnitItem) => u.workshopCode === 'WS-01' && u.titleEn?.toLowerCase().includes('rigging'));
          if (hasRiggingShop) return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached production units', e);
    }
    return DEFAULT_PRODUCTION_UNITS;
  });

  const handleUpdateProductionUnits = async (newUnits: ProductionUnitItem[]) => {
    setProductionUnits(newUnits);
    localStorage.setItem('defect_tracker_production_units', JSON.stringify(newUnits));
    try {
      await supabaseService.saveProductionUnits(newUnits);
    } catch (err) {
      console.warn('Failed to save production units to Supabase', err);
    }
  };

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
      const [remoteDefects, remoteWorkshops, remoteShips, remoteLocations, remoteConfig, remoteProfile, remoteUnits] = await Promise.all([
        supabaseService.fetchDefects(),
        supabaseService.fetchWorkshops(),
        supabaseService.fetchShips(),
        supabaseService.fetchLocations(),
        supabaseService.fetchDockyardConfig(),
        supabaseService.fetchAdminProfile(),
        supabaseService.fetchProductionUnits()
      ]);

      if (remoteDefects && remoteDefects.length > 0) {
        setDefects(remoteDefects);
        localStorage.setItem('defect_tracker_defects', JSON.stringify(remoteDefects));
      } else if (remoteDefects && remoteDefects.length === 0 && defects.length > 0) {
        // Auto-seed existing defects to Supabase
        supabaseService.syncAllDefects(defects);
      }

      if (remoteWorkshops && remoteWorkshops.length > 0) {
        const sanitizedWs = remoteWorkshops.map((ws: Workshop) => {
          if (ws.id === 'ws-01' || ws.code === 'WS-01') {
            return {
              ...ws,
              id: 'ws-01',
              code: 'WS-01',
              nameEn: ws.nameEn && !ws.nameEn.toLowerCase().includes('admin') ? ws.nameEn : 'Rigging Shop',
              nameBn: ws.nameBn && !ws.nameBn.includes('এডমিন') ? ws.nameBn : 'রিগিং শপ',
              category: 'Deck & Lifting Gear',
              description: ws.description || 'Repair and testing of ship cables, wire ropes, cranes, and hoisting equipment.',
              username: ws.username || 'oic.ws01',
              password: ws.password || '123456'
            };
          }
          return ws;
        });
        setWorkshops(sanitizedWs);
        localStorage.setItem('defect_tracker_workshops', JSON.stringify(sanitizedWs));
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
        // Ensure Admin Profile is strictly isolated from Shop 1 (Sakib Hosen / Rigging Shop)
        const sanitizedProfile: UserProfile = {
          ...remoteProfile,
          role: 'admin',
          officialId: remoteProfile.officialId || 'admin',
          password: remoteProfile.password || 'admin123'
        };
        if (sanitizedProfile.name?.toLowerCase().includes('sakib') || sanitizedProfile.officialId === '8116') {
          sanitizedProfile.name = 'Lt Commander M. A. Rahman';
          sanitizedProfile.rank = 'Engineer Officer (Marine Engineer)';
          sanitizedProfile.officialId = 'admin';
          sanitizedProfile.avatar = '/anchor.jpg';
        }
        setProfile(sanitizedProfile);
        localStorage.setItem('defect_tracker_admin_profile', JSON.stringify(sanitizedProfile));
        localStorage.setItem('defect_tracker_profile', JSON.stringify(sanitizedProfile));
      } else {
        supabaseService.saveAdminProfile(profile);
      }

      if (remoteUnits && remoteUnits.length > 0) {
        const hasRiggingShop = remoteUnits.some((u: ProductionUnitItem) => u.workshopCode === 'WS-01' && u.titleEn?.toLowerCase().includes('rigging'));
        if (hasRiggingShop) {
          setProductionUnits(remoteUnits);
          localStorage.setItem('defect_tracker_production_units', JSON.stringify(remoteUnits));
        } else {
          setProductionUnits(DEFAULT_PRODUCTION_UNITS);
          localStorage.setItem('defect_tracker_production_units', JSON.stringify(DEFAULT_PRODUCTION_UNITS));
          supabaseService.saveProductionUnits(DEFAULT_PRODUCTION_UNITS);
        }
      } else if (productionUnits.length > 0) {
        supabaseService.saveProductionUnits(productionUnits);
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
    localStorage.setItem('defect_tracker_admin_profile', JSON.stringify(newProfile));
    localStorage.setItem('defect_tracker_profile', JSON.stringify(newProfile));
    supabaseService.saveAdminProfile(newProfile);
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
    // Also synchronize WS-01 workshop object so 3D viewer, dropdowns and charts reflect renamed workshop
    const updated = workshops.map(ws => {
      if (ws.code === 'WS-01' || ws.id === 'ws-01') {
        return {
          ...ws,
          nameEn: name,
          nameBn: name
        };
      }
      return ws;
    });
    setWorkshops(updated);
    localStorage.setItem('defect_tracker_workshops', JSON.stringify(updated));
    supabaseService.syncAllWorkshops(updated);
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


  // Auth operations (sessionStorage ensures that leaving/closing automatically logs out the user)
  const handleLoginSuccess = (session: AuthSession) => {
    setAuthSession(session);
    sessionStorage.setItem('defect_tracker_auth', JSON.stringify(session));
    localStorage.removeItem('defect_tracker_auth');
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

  // Automatic logout when user closes the window/tab or navigates away without explicit logout
  useEffect(() => {
    const handleUnload = () => {
      sessionStorage.removeItem('defect_tracker_auth');
      localStorage.removeItem('defect_tracker_auth');
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, []);

  // In-app Logout Modal State (Immune to browser iframe popup blocking)
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  // User Profile & Photo Edit Modal
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  const handleRequestLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setAuthSession(null);
    sessionStorage.removeItem('defect_tracker_auth');
    localStorage.removeItem('defect_tracker_auth');
    setShowLogoutModal(false);
  };

  const handleSaveProfileModal = async (newProfile: UserProfile, newOfficerName?: string, newRank?: string, newPhone?: string) => {
    const isWorkshopUser = authSession && authSession.role === 'workshop_user';

    if (isWorkshopUser && authSession.workshopId) {
      // 1. Strictly isolate workshop user update: update ONLY this specific workshop
      const photoUrl = newProfile.avatar;
      const updatedSession: AuthSession = {
        ...authSession,
        officerName: newOfficerName || authSession.officerName,
        officerRank: newRank || authSession.officerRank,
        photo: photoUrl
      };
      setAuthSession(updatedSession);
      sessionStorage.setItem('defect_tracker_auth', JSON.stringify(updatedSession));

      let updatedWs: Workshop | null = null;
      const updatedWorkshops = workshops.map(ws => {
        if (ws.id === authSession.workshopId || ws.code === authSession.workshopCode) {
          updatedWs = {
            ...ws,
            oicName: newOfficerName || ws.oicName,
            oicRank: newRank || ws.oicRank,
            phoneExt: newPhone || ws.phoneExt,
            photo: photoUrl
          };
          return updatedWs;
        }
        return ws;
      });

      setWorkshops(updatedWorkshops);
      localStorage.setItem('defect_tracker_workshops', JSON.stringify(updatedWorkshops));

      if (updatedWs) {
        try {
          await supabaseService.upsertWorkshop(updatedWs);
        } catch (err) {
          console.warn('Failed to upsert workshop profile to Supabase', err);
        }
      }
    } else {
      // 2. HQ Admin profile update (strictly isolated from any workshop profiles)
      setProfile(newProfile);
      localStorage.setItem('defect_tracker_admin_profile', JSON.stringify(newProfile));
      localStorage.setItem('defect_tracker_profile', JSON.stringify(newProfile));

      if (authSession) {
        const updatedSession: AuthSession = {
          ...authSession,
          officerName: newOfficerName || authSession.officerName,
          officerRank: newRank || authSession.officerRank,
          photo: newProfile.avatar || authSession.photo
        };
        setAuthSession(updatedSession);
        sessionStorage.setItem('defect_tracker_auth', JSON.stringify(updatedSession));
      }

      try {
        await supabaseService.saveAdminProfile(newProfile);
      } catch (err) {
        console.warn('Failed to save admin profile to Supabase', err);
      }
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
        workshops={workshops}
        dockyardConfig={dockyardConfig}
        workshopsCount={workshops.length}
        shipsCount={ships.length}
        pendingCount={pendingJobsCount}
        onLogout={handleRequestLogout}
        onOpenProfileModal={() => setShowProfileModal(true)}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* 2. MAIN CORE LAYOUT PANEL - Cream (#FFFDD0) & Bangladesh Naval Green (#006A4E) Theme */}
      <main id="main-content-area" className="flex-1 flex flex-col h-screen overflow-hidden relative bg-gradient-to-br from-[#FFFEEA] via-[#FAF7DE] to-[#F5F1C9] w-full min-w-0">
        
        {/* Harmonious Bangladesh Naval Green Subtle Glow Overlay */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,106,78,0.07),rgba(255,253,208,0))]"
        />

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
                    src={dockyardConfig.headerLogoUrl || '/asd_navy_logo.jpg'} 
                    alt="Bangladesh Navy ASD Crest" 
                    className="w-full h-full object-cover rounded-full" 
                    referrerPolicy="no-referrer"
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
                    src={dockyardConfig.headerLogoUrl || '/asd_navy_logo.jpg'} 
                    alt="Bangladesh Navy ASD Crest" 
                    className="w-full h-full object-cover rounded-full" 
                    referrerPolicy="no-referrer"
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
                src={dockyardConfig.headerLogoUrl || '/asd_navy_logo.jpg'} 
                alt="Navy Crest" 
                className="w-5 h-5 object-contain rounded-full bg-white p-0.5" 
                referrerPolicy="no-referrer"
              />
              <span className="tracking-wider">{dockyardConfig.marqueeBadge || 'COMMAND DISPATCH'}</span>
            </div>
            <div className="overflow-hidden whitespace-nowrap w-full ml-3 flex-1 relative">
              <div className="animate-marquee-rtl font-algerian font-black text-amber-300 text-sm sm:text-base md:text-lg tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {dockyardConfig.marqueeText || '⚓ WELCOME TO AREA SUPERINTENDENT DOCKYARD ⚓ — BANGLADESH NAVY DOCKYARD CHATTOGRAM — TECHNICAL DEFECT TRACKING & FLEET MAINTENANCE COMMAND ⚓'}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Main Panel Canvas */}
        <section 
          id="main-panel-scroll" 
          className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-8 relative bg-transparent transition-colors duration-500 text-slate-800 custom-scrollbar"
        >
          
          {/* Subtle Decorative Maritime Compass Watermark in Bangladesh Naval Green (#006A4E) */}
          <div className="fixed bottom-12 right-12 pointer-events-none opacity-[0.045] text-[#006A4E]">
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
                  isAdmin={isAdmin}
                  productionUnits={productionUnits}
                  onUpdateProductionUnits={handleUpdateProductionUnits}
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
                  productionUnits={productionUnits}
                  onUpdateProductionUnits={handleUpdateProductionUnits}
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
        <footer className="min-h-8 sm:h-9 py-1 sm:py-0 bg-[#00142e]/90 backdrop-blur-md border-t border-white/10 px-3 sm:px-6 md:px-8 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-300 shrink-0 font-mono z-10">
          <div className="flex items-center gap-2 truncate">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              supabaseSyncStatus.isConnected 
                ? (supabaseSyncStatus.isTablesReady ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse')
                : 'bg-slate-400'
            }`}></span>
            <span className="truncate">© 2026 {dockyardConfig.yardNameEn}</span>
            <span className="hidden md:inline text-slate-400 border-l border-white/20 pl-2">
              Supabase Cloud: {supabaseSyncStatus.isConnected ? (supabaseSyncStatus.isTablesReady ? '🟢 Live Synced' : '🟡 Ready (Run SQL)') : '⚪ Local Cache'}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
            <span className="hidden sm:inline text-slate-400">Total Workshops: {workshops.length} Units</span>
            <span className="font-bold text-amber-300 text-[10px] sm:text-[11px]">v3.0 Naval Defect Command</span>
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
        workshops={workshops}
        onSaveProfile={handleSaveProfileModal}
      />
    </div>
  );
}
