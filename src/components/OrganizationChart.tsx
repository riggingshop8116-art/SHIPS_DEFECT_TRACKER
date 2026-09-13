import React, { useState, useMemo } from 'react';
import { 
  Network, 
  ChevronDown, 
  ChevronRight, 
  ShieldCheck, 
  Search, 
  Layers, 
  Building2, 
  UserCheck, 
  Phone, 
  Wrench, 
  Anchor, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  X, 
  Maximize2, 
  Minimize2,
  FolderTree,
  LayoutGrid
} from 'lucide-react';
import { Workshop, Defect, DockyardConfig } from '../types';

interface OrganizationChartProps {
  workshops: Workshop[];
  defects: Defect[];
  dockyardConfig: DockyardConfig;
  onNavigateToEntry?: (prefillLocation?: string, prefillWorkshop?: string) => void;
  onNavigateToSearch?: (workshopCode?: string) => void;
}

export interface OrgNode {
  id: string;
  code?: string;
  titleBn: string;
  titleEn: string;
  designation: string;
  rank: string;
  officerName?: string;
  phoneExt?: string;
  category: 'command' | 'directorate' | 'group' | 'workshop' | 'wing';
  iconType?: string;
  description: string;
  workshopCode?: string;
  children?: OrgNode[];
}

export default function OrganizationChart({
  workshops,
  defects,
  dockyardConfig,
  onNavigateToEntry,
  onNavigateToSearch
}: OrganizationChartProps) {
  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  // Active selected node for details modal
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  // View mode: 'tree' or 'cards'
  const [viewMode, setViewMode] = useState<'tree' | 'cards'>('tree');
  // Selected directorate filter
  const [selectedDirectorate, setSelectedDirectorate] = useState<string>('all');
  
  // Track collapsed node IDs
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const toggleNodeCollapse = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCollapsedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const expandAll = () => setCollapsedNodes({});
  const collapseAll = () => {
    const allIds: Record<string, boolean> = {
      'dir-prod': true,
      'dir-plan': true,
      'dir-yard': true,
      'dir-qa': true,
      'dir-admin': true,
      'dir-fin': true,
      'grp-hull': true,
      'grp-prop': true,
      'grp-elec': true,
      'grp-underwater': true,
    };
    setCollapsedNodes(allIds);
  };

  // Helper to find live workshop data from system state
  const getWorkshopData = (code: string) => {
    return workshops.find(w => w.code === code);
  };

  // Helper to count defects for a workshop
  const getDefectStats = (workshopCode?: string, workshopNameBn?: string) => {
    if (!workshopCode && !workshopNameBn) return { total: 0, pending: 0, solved: 0 };
    const matched = defects.filter(d => 
      (workshopCode && (d.workshopCode === workshopCode || d.workshop?.includes(workshopCode))) ||
      (workshopNameBn && d.workshop?.includes(workshopNameBn))
    );
    const pending = matched.filter(d => d.status === 'Pending').length;
    const solved = matched.filter(d => d.status === 'Solved').length;
    return { total: matched.length, pending, solved };
  };

  // Construct complete Bangladesh Navy Dockyard Organization Tree
  const orgTree: OrgNode = useMemo(() => {
    // Helper to map workshop node
    const makeWsNode = (code: string, fallbackBn: string, fallbackEn: string, fallbackCat: string): OrgNode => {
      const live = getWorkshopData(code);
      return {
        id: `node-${code.toLowerCase()}`,
        code: code,
        workshopCode: code,
        titleBn: live?.nameBn || fallbackBn,
        titleEn: live?.nameEn || fallbackEn,
        designation: 'অফিসার-ইন-চার্জ (OIC)',
        rank: live?.oicRank || 'লেফটেন্যান্ট কমান্ডার',
        officerName: live?.oicName || 'দায়িত্বপ্রাপ্ত নৌ কর্মকর্তা',
        phoneExt: live?.phoneExt || '৪২০০',
        category: 'workshop',
        description: live?.description || `${fallbackBn} এর টেকনিক্যাল মেরামতী ও নিয়ন্ত্রণ কার্যক্রম।`,
      };
    };

    return {
      id: 'csd-root',
      code: 'CSD',
      titleBn: 'কমোডোর সুপারিনটেনডেন্ট ডকইয়ার্ড (সিএসডি)',
      titleEn: 'COMMODORE SUPERINTENDENT DOCKYARD (CSD)',
      designation: 'প্রধান প্রশাসনিক ও কারিগরী কমান্ডার (Head of BN Dockyard)',
      rank: 'কমোডোর (Commodore BN)',
      officerName: 'কমোডোর কমান্ড্যান্ট',
      phoneExt: '৪০০০',
      category: 'command',
      description: 'বাংলাদেশ নৌবাহিনী ডকইয়ার্ডের সার্বিক প্রশাসনিক, কারিগরী, রিফিট ব্যবস্থাপনা, বহরের অপারেশনাল প্রস্তুতি ও আধুনিকায়নের সর্বোচ্চ অধিনায়ক।',
      children: [
        // 1. GM (PRODUCTION)
        {
          id: 'dir-prod',
          code: 'GM-PROD',
          titleBn: 'মহাব্যবস্থাপক (উৎপাদন ও কারখানা)',
          titleEn: 'GENERAL MANAGER (PRODUCTION)',
          designation: 'জিএম (প্রোডাকশন)',
          rank: 'ক্যাপ্টেন (Captain BN)',
          officerName: 'ক্যাপ্টেন এম এন আলম, পিএসসি, বিএন',
          phoneExt: '৪১০১',
          category: 'directorate',
          description: 'ডকইয়ার্ডের ২৭টি সক্রিয় কারিগরী ওয়ার্কশপের মেরামতী, মেকানিক্যাল, ইলেকট্রিক্যাল, হাল ও ওয়েপন মেরামতের সার্বিক পরিচালন অধিকর্তা।',
          children: [
            {
              id: 'grp-hull',
              code: 'GRP-HULL',
              titleBn: 'হাল ও ডেক স্ট্রাকচারাল গ্রুপ',
              titleEn: 'HULL & STRUCTURAL ENGINEERING GROUP',
              designation: 'গ্রুপ কো-অর্ডিনেটর',
              rank: 'কমান্ডার (Commander BN)',
              officerName: 'কমান্ডার তানভীর আহমেদ, বিএন',
              phoneExt: '৪১০২',
              category: 'group',
              description: 'জাহাজের মূল বহিরাবরণ, স্টিল ফেব্রিকেশন, লিফটিং গিয়ার ও সারফেস পেইন্টিং ওয়ার্কশপসমূহের সমন্বয়ক।',
              children: [
                makeWsNode('WS-03', 'হাল ও স্ট্রাকচারাল শপ', 'Hull & Structural Shop', 'জাহাজের মূল কাঠামো'),
                makeWsNode('WS-04', 'ওয়েল্ডিং ও ফেব্রিকেশন শপ', 'Welding & Fabrication Shop', 'মেটাল জয়েনিং'),
                makeWsNode('WS-01', 'রিগিং শপ', 'Rigging Shop', 'ডেক ও লিফটিং গিয়ার'),
                makeWsNode('WS-17', 'স্যান্ডব্লাস্টিং ও পেইন্ট শপ', 'Sandblasting & Paint Shop', 'সারফেস ট্রিটমেন্ট'),
                makeWsNode('WS-20', 'ফাইবারগ্লাস ও কম্পোজিট শপ', 'Fiberglass & Composite Shop', 'কম্পোজিট ম্যাটেরিয়াল'),
                makeWsNode('WS-25', 'শিপরাইট ও কার্পেন্ট্রি শপ', 'Shipwright & Joinery Shop', 'কাঠ ও ডেক ফিটিংস'),
              ]
            },
            {
              id: 'grp-prop',
              code: 'GRP-MECH',
              titleBn: 'প্রপালশন ও মেকানিক্যাল গ্রুপ',
              titleEn: 'PROPULSION & MACHINERY GROUP',
              designation: 'গ্রুপ কো-অর্ডিনেটর',
              rank: 'কমান্ডার (Commander BN)',
              officerName: 'কমান্ডার শাহরিয়ার নাফিস, বিএন',
              phoneExt: '৪১০৩',
              category: 'group',
              description: 'মেইন ইঞ্জিন, ডিজেল জেনারেটর, টার্নিং মেশিনারি, পাইপলাইন ও কোল্ড স্টোরেজ সিস্টেমের সমন্বয়।',
              children: [
                makeWsNode('WS-08', 'মেইন ইঞ্জিন (ICE) শপ', 'Main Engine (ICE) Shop', 'ভারী ইঞ্জিন'),
                makeWsNode('WS-09', 'ডিজেল জেনারেটর (DG) শপ', 'Auxiliary DG Workshop', 'পাওয়ার জেনারেশন'),
                makeWsNode('WS-02', 'মেশিন শপ', 'Machine Shop', 'মেকানিক্যাল প্রিসিশন'),
                makeWsNode('WS-11', 'পাইপ ও ফিটিং শপ', 'Pipe & Valve Workshop', 'হাইড্রোলিক ও ফ্লুইড'),
                makeWsNode('WS-14', 'ফাউন্ড্রি ও মেটালার্জি শপ', 'Foundry & Metallurgy Shop', 'কাস্টিং ও মোল্ডিং'),
                makeWsNode('WS-15', 'বয়লার ও স্টিম টারবাইন শপ', 'Boiler & Turbine Workshop', 'থার্মাল পাওয়ার'),
                makeWsNode('WS-24', 'এয়ার কন্ডিশনিং ও রেফ্রিজারেশন শপ', 'Refrigeration & HVAC Shop', 'কুলিং সিস্টেম'),
              ]
            },
            {
              id: 'grp-elec',
              code: 'GRP-ELEC',
              titleBn: 'ইলেকট্রিক্যাল ও ওয়েপন ইলেকট্রনিক্স গ্রুপ',
              titleEn: 'ELECTRICAL & WEAPON ELECTRONICS GROUP',
              designation: 'গ্রুপ কো-অর্ডিনেটর',
              rank: 'কমান্ডার (Commander BN)',
              officerName: 'কমান্ডার সাজ্জাদ হোসেন, বিএন',
              phoneExt: '৪১০৪',
              category: 'group',
              description: 'জাহাজের বিদ্যুৎ সরবরাহ, নেভাল গান, মিসাইল লঞ্চার, রাডার ও সেন্সর মেইনটেন্যান্স।',
              children: [
                makeWsNode('WS-05', 'ইলেকট্রিক্যাল পাওয়ার শপ', 'Electrical Power Workshop', 'ইলেকট্রিক্যাল'),
                makeWsNode('WS-06', 'ইলেকট্রনিক্স ও রাডার শপ', 'Electronics & Radar Shop', 'ইলেকট্রনিক্স ও সেন্সর'),
                makeWsNode('WS-07', 'ওয়েপন ও মিসাইল শপ', 'Weapon & Ordnance Shop', 'অর্ডন্যান্স ও আর্মামেন্ট'),
                makeWsNode('WS-12', 'কমিউনিকেশন ও ন্যাভ এইডস শপ', 'Naval Communication Shop', 'যোগাযোগ ও জিপিএস'),
                makeWsNode('WS-16', 'জাইরো ও ফায়ার কন্ট্রোল শপ', 'Gyro & Fire Control Shop', 'অস্ত্র নিয়ন্ত্রণ সেন্সর'),
                makeWsNode('WS-21', 'ব্যাটারি ও সাবস্টেশন শপ', 'Battery & Substation Shop', 'হাই-ভোল্টেজ ও ডিসি'),
              ]
            },
            {
              id: 'grp-underwater',
              code: 'GRP-UNDERWATER',
              titleBn: 'আন্ডারওয়াটার ও হাইড্রোলিক স্পেশালাইজড গ্রুপ',
              titleEn: 'UNDERWATER & SPECIALIZED REPAIR GROUP',
              designation: 'গ্রুপ কো-অর্ডিনেটর',
              rank: 'লেফটেন্যান্ট কমান্ডার (Lt Cdr BN)',
              officerName: 'লেফটেন্যান্ট কমান্ডার আরিফুর রহমান, বিএন',
              phoneExt: '৪১০৫',
              category: 'group',
              description: 'জাহাজের প্রপেলার, ড্রাইভ শ্যাফট, পানির নিচের ভাল্ব, ক্যাথোডিক প্রোটেকশন ও অটোমেশন।',
              children: [
                makeWsNode('WS-10', 'প্রপেলার ও শ্যাফট শপ', 'Propeller & Shaft Alignment Shop', 'প্রপালশন ড্রাইভলাইন'),
                makeWsNode('WS-13', 'আন্ডারওয়াটার ফিটিংস শপ', 'Underwater Hull & Valves Shop', 'সাব-সারফেস কাজ'),
                makeWsNode('WS-18', 'ক্যাথোডিক প্রোটেকশন শপ', 'Cathodic Protection & Anode Shop', 'ক্ষয়রোধ ব্যবস্থা'),
                makeWsNode('WS-19', 'লাইফ সেভিং ইকুইপমেন্ট (LSE) শপ', 'Life Saving Appliances (LSE)', 'নিরাপত্তা ও উদ্ধার'),
                makeWsNode('WS-22', 'ইনস্ট্রুমেন্টেশন ও ক্যালিব্রেশন শপ', 'Calibration & Metering Lab', 'পরিমাপ ও মান যাচাই'),
                makeWsNode('WS-23', 'অপটিক্যাল ও পেরিস্কোপ ল্যাব', 'Optical & Periscope Lab', 'প্রিসিশন অপটিক্স'),
                makeWsNode('WS-26', 'হাইড্রোলিক ও নিউমেটিক শপ', 'Hydraulic & Pneumatic Systems', 'হাইড্রোলিক পাওয়ার'),
                makeWsNode('WS-27', 'অটোমেশন ও পিএলসি কন্ট্রোল ল্যাব', 'Automation & PLC Systems', 'ডিজিটাল অটোমেশন'),
              ]
            }
          ]
        },

        // 2. GM (PLANNING)
        {
          id: 'dir-plan',
          code: 'GM-PLAN',
          titleBn: 'মহাব্যবস্থাপক (পরিকল্পনা ও এস্টিমেটিং)',
          titleEn: 'GENERAL MANAGER (PLANNING & ESTIMATING)',
          designation: 'জিএম (পরিকল্পনা)',
          rank: 'ক্যাপ্টেন (Captain BN)',
          officerName: 'ক্যাপ্টেন কে এম রফিক, পিএসসি, বিএন',
          phoneExt: '৪২০০',
          category: 'directorate',
          description: 'জাহাজের শর্ট রিফিট, নরমাল রিফিট, ডকিং সিডিউল প্রণয়ন, ড্রয়িং অফিস ও মডার্নাইজেশন প্ল্যানিং সেল।',
          children: [
            {
              id: 'wing-pe',
              code: 'P&E CELL',
              titleBn: 'প্ল্যানিং অ্যান্ড এস্টিমেটিং (P&E) উইং',
              titleEn: 'Planning & Estimating Cell',
              designation: 'হেড অফ উইং',
              rank: 'কমান্ডার (Commander BN)',
              officerName: 'কমান্ডার শফিকুল ইসলাম, বিএন',
              phoneExt: '৪২০১',
              category: 'wing',
              description: 'মেরামত কাজের কারিগরি পরিধি নির্ধারণ, বাজেট ও সময়সীমা হিসাব নিরূপণ।',
            },
            {
              id: 'wing-srp',
              code: 'SRP CELL',
              titleBn: 'শিপ রিপেয়ার প্ল্যানিং (SRP) সেল',
              titleEn: 'Ship Repair & Docking Scheduling',
              designation: 'হেড অফ সেল',
              rank: 'লেফটেন্যান্ট কমান্ডার',
              officerName: 'লেফটেন্যান্ট কমান্ডার ফয়সাল, বিএন',
              phoneExt: '৪২০২',
              category: 'wing',
              description: 'নৌবাহিনীর জাহাজের ড্রাইডকিং ও রিফিট সময়সূচি চূড়ান্তকরণ।',
            },
            {
              id: 'wing-ddo',
              code: 'DDO',
              titleBn: 'ড্রয়িং অ্যান্ড ডিজাইন অফিস (DDO)',
              titleEn: 'Drawing & Naval Architecture Office',
              designation: 'চিফ নেভাল আর্কিটেক্ট',
              rank: 'কমান্ডার (Commander BN)',
              officerName: 'কমান্ডার আসাদুজ্জামান, বিএন',
              phoneExt: '৪২০৩',
              category: 'wing',
              description: 'জাহাজের ব্লু-প্রিন্ট, সিএডি ৩ডি মডেল ও কাঠামোগত পরিবর্তনের ডিজাইন প্রণয়ন।',
            }
          ]
        },

        // 3. GM (YARD SERVICES)
        {
          id: 'dir-yard',
          code: 'GM-YARD',
          titleBn: 'মহাব্যবস্থাপক (ইয়ার্ড সার্ভিসেস ও ড্রাইডক)',
          titleEn: 'GENERAL MANAGER (YARD SERVICES)',
          designation: 'জিএম (ইয়ার্ড সার্ভিসেস)',
          rank: 'ক্যাপ্টেন (Captain BN)',
          officerName: 'ক্যাপ্টেন জহিরুল হক, বিএন',
          phoneExt: '৪৩০১',
          category: 'directorate',
          description: 'ড্রাইডক ও স্লিপওয়ে অপারেশন, জেটি ফ্যাসিলিটি, মোবাইল ক্রেন, পাওয়ার গ্রিড ও ডকইয়ার্ড অবকাঠামো।',
          children: [
            {
              id: 'wing-drydock',
              code: 'DRY DOCK WING',
              titleBn: 'ড্রাইডক ও স্লিপওয়ে বিভাগ',
              titleEn: 'Dry Dock & Slipway Operations',
              designation: 'ডক মাস্টার',
              rank: 'কমান্ডার (Commander BN)',
              officerName: 'কমান্ডার হাবিবুল্লাহ, বিএন',
              phoneExt: '৪৩০২',
              category: 'wing',
              description: 'জাহাজের নিরাপদ ডকিং, পানি নিষ্কাশন, কিল ব্লক স্থাপন ও আনডকিং পরিচালনা।',
            },
            {
              id: 'wing-crane',
              code: 'CRANE & TRANSPORT',
              titleBn: 'হেভি ক্রেন ও ইয়ার্ড ট্রান্সপোর্ট উইং',
              titleEn: 'Heavy Lifting Cranes & Logistics',
              designation: 'হেড অফ ক্রেন সার্ভিস',
              rank: 'লেফটেন্যান্ট কমান্ডার',
              officerName: 'লেফটেন্যান্ট কমান্ডার রাশেদ, বিএন',
              phoneExt: '৪৩০৩',
              category: 'wing',
              description: '৫০ টন পোর্টাল ক্রেন, ফ্লোটিং ক্রেন ও ভারী ইঞ্জিন পার্টস পরিবহন।',
            },
            {
              id: 'wing-power',
              code: 'SHORE POWER',
              titleBn: 'শোর পাওয়ার ও ডকইয়ার্ড সাবস্টেশন',
              titleEn: 'Yard Power Generation & Shore Grid',
              designation: 'ইনচার্জ পাওয়ার হাউস',
              rank: 'লেফটেন্যান্ট',
              officerName: 'লেফটেন্যান্ট সাইফ, বিএন',
              phoneExt: '৪৩০৪',
              category: 'wing',
              description: 'ডকে অবস্থানরত যুদ্ধজাহাজসমূহে ২৪/৭ উচ্চ ক্ষমতাসম্পন্ন শোর বিদ্যুৎ ও সংকুচিত বাতাস সরবরাহ।',
            }
          ]
        },

        // 4. CSQA (QUALITY ASSURANCE)
        {
          id: 'dir-qa',
          code: 'CSQA',
          titleBn: 'ক্যাপ্টেন সুপারিনটেনডেন্ট কোয়ালিটি অ্যাসুরেন্স (সিএসকিউএ)',
          titleEn: 'QUALITY ASSURANCE & TECHNICAL AUDIT',
          designation: 'সিএসকিউএ (CSQA)',
          rank: 'ক্যাপ্টেন (Captain BN)',
          officerName: 'ক্যাপ্টেন এম এস রেজা, পিএসসি, বিএন',
          phoneExt: '৪৪০১',
          category: 'directorate',
          description: 'সকল মেরামতের মান নিয়ন্ত্রণ, নন-ডিস্ট্রাকটিভ টেস্ট (NDT), ম্যাটেরিয়াল ল্যাব ও সি-ট্রায়াল সার্টিফিকেশন।',
          children: [
            {
              id: 'wing-ndt',
              code: 'NDT LAB',
              titleBn: 'নন-ডিস্ট্রাকটিভ টেস্টিং (NDT) ও আল্ট্রাসনিক ল্যাব',
              titleEn: 'NDT & Ultrasonic Testing Lab',
              designation: 'চিফ কোয়ালিটি ইন্সপেক্টর',
              rank: 'লেফটেন্যান্ট কমান্ডার',
              officerName: 'লেফটেন্যান্ট কমান্ডার নাজমুল, বিএন',
              phoneExt: '৪৪০২',
              category: 'wing',
              description: 'হাল প্লেটের পুরুত্ব পরিমাপ, এক্স-রে দ্বারা ওয়েল্ডিং ক্র্যাক পরীক্ষণ ও গামা-রে টেস্ট।',
            },
            {
              id: 'wing-seatrials',
              code: 'SEA TRIALS CELL',
              titleBn: 'সি-ট্রায়াল ডিফেক্ট ক্লিয়ারেন্স সেল',
              titleEn: 'Sea Trials & Defect Clearance Board',
              designation: 'ইন্সপেকশন অফিসার',
              rank: 'কমান্ডার (Commander BN)',
              officerName: 'কমান্ডার জামিল আখতার, বিএন',
              phoneExt: '৪৪০৩',
              category: 'wing',
              description: 'মেরামত শেষে সমুদ্রে ফুল স্পিড ট্রায়াল, ভাইব্রেশন মনিটরিং ও চূড়ান্ত রিলিজ অনুমোদন।',
            }
          ]
        },

        // 5. GM (ADMINISTRATION)
        {
          id: 'dir-admin',
          code: 'GM-ADMIN',
          titleBn: 'মহাব্যবস্থাপক (প্রশাসন ও কর্মী ব্যবস্থাপনা)',
          titleEn: 'GENERAL MANAGER (ADMINISTRATION)',
          designation: 'জিএম (প্রশাসন)',
          rank: 'ক্যাপ্টেন / কমান্ডার (Captain / Cdr BN)',
          officerName: 'ক্যাপ্টেন এ কে চৌধুরী, বিএন',
          phoneExt: '৪৫০১',
          category: 'directorate',
          description: 'নৌ কর্মকর্তা, টেকনিশিয়ান, সিভিলিয়ান কর্মচারী ব্যবস্থাপনা, নিরাপত্তা, প্রভোস্ট ও ফায়ার ব্রিগেড।',
          children: [
            {
              id: 'wing-cle',
              code: 'CLE CELL',
              titleBn: 'সিভিলিয়ান লেবার এস্টাবলিশমেন্ট (CLE)',
              titleEn: 'Civilian Technical Workforce Dept',
              designation: 'এস্টাবলিশমেন্ট অফিসার',
              rank: 'লেফটেন্যান্ট কমান্ডার',
              officerName: 'লেফটেন্যান্ট কমান্ডার মারুফ, বিএন',
              phoneExt: '৪৫০২',
              category: 'wing',
              description: 'দক্ষ মেকানিক, টার্নার, ওয়েল্ডার ও টেকনিক্যাল স্টাফ নিয়োগ ও কাজের বণ্টন।',
            },
            {
              id: 'wing-security',
              code: 'SECURITY & FIRE',
              titleBn: 'ডকইয়ার্ড নিরাপত্তা, প্রভোস্ট ও ফায়ার স্টেশন',
              titleEn: 'Yard Security, Provost & Fire Protection',
              designation: 'ডকইয়ার্ড সিকিউরিটি অফিসার',
              rank: 'লেফটেন্যান্ট',
              officerName: 'লেফটেন্যান্ট আদনান, বিএন',
              phoneExt: '৪৫০৩',
              category: 'wing',
              description: '২৪ ঘণ্টা স্পর্শকাতর ডকইয়ার্ডের সামরিক নিরাপত্তা প্রহরা ও অগ্নি নির্বাপণ প্রস্তুতি।',
            }
          ]
        },

        // 6. GM (FINANCE & ACCOUNTS)
        {
          id: 'dir-fin',
          code: 'GM-FIN',
          titleBn: 'মহাব্যবস্থাপক (অর্থ ও বাজেট শাখা)',
          titleEn: 'GENERAL MANAGER (FINANCE & ACCOUNTS)',
          designation: 'জিএম (অর্থ)',
          rank: 'কমান্ডার (Commander BN)',
          officerName: 'কমান্ডার এম এ করিম, বিএন',
          phoneExt: '৪৬০১',
          category: 'directorate',
          description: 'জাহাজ মেরামত বাজেট, জরুরি স্পেয়ার পার্টস প্রকিউরমেন্ট ও অডিট শাখার দায়িত্বপ্রাপ্ত কর্মকর্তা।',
          children: [
            {
              id: 'wing-budget',
              code: 'BUDGET & AUDIT',
              titleBn: 'রিফিট বাজেট ও প্রকিউরমেন্ট সেল',
              titleEn: 'Refit Budgeting & Technical Purchase',
              designation: 'অ্যাকাউন্টস অফিসার',
              rank: 'লেফটেন্যান্ট কমান্ডার',
              officerName: 'লেফটেন্যান্ট কমান্ডার মোস্তফা, বিএন',
              phoneExt: '৪৬০২',
              category: 'wing',
              description: 'ওয়ার্কশপসমূহের মেশিনারিজ পার্টস ক্রয় ও সরকারি অর্থ হিসাব নিয়ন্ত্রণ।',
            }
          ]
        }
      ]
    };
  }, [workshops, defects]);

  // Filter tree based on search query or directorate filter
  const matchesFilter = (node: OrgNode, query: string, dirFilter: string): boolean => {
    if (dirFilter !== 'all' && node.category === 'directorate' && node.code !== dirFilter) {
      return false;
    }
    if (!query) return true;
    const q = query.toLowerCase();
    const matchThis = 
      node.titleBn.toLowerCase().includes(q) ||
      node.titleEn.toLowerCase().includes(q) ||
      (node.code && node.code.toLowerCase().includes(q)) ||
      (node.rank && node.rank.toLowerCase().includes(q)) ||
      (node.officerName && node.officerName.toLowerCase().includes(q)) ||
      (node.workshopCode && node.workshopCode.toLowerCase().includes(q));

    if (matchThis) return true;

    if (node.children && node.children.length > 0) {
      return node.children.some(child => matchesFilter(child, query, dirFilter));
    }

    return false;
  };

  // Node Badge styling based on category
  const getNodeBadgeClass = (category: OrgNode['category']) => {
    switch (category) {
      case 'command':
        return 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black border-amber-300 shadow-amber-500/30';
      case 'directorate':
        return 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-bold border-cyan-300 shadow-cyan-600/30';
      case 'group':
        return 'bg-gradient-to-r from-teal-700 to-emerald-800 text-white font-bold border-teal-400';
      case 'wing':
        return 'bg-slate-800 text-cyan-200 border-cyan-500/40';
      case 'workshop':
      default:
        return 'bg-[#00224d] text-amber-300 border-amber-400/40 hover:border-amber-300';
    }
  };

  return (
    <div id="organization-chart-view" className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* Top Header Card with Official Bangladesh Navy Crest */}
      <div className="bg-[#001738]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-cyan-500/30 border-l-8 border-l-amber-400 text-white shadow-2xl relative overflow-hidden">
        {/* Decorative naval anchor watermark */}
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
          <Anchor className="h-56 w-56 text-amber-400" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1 bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-600 shadow-xl shadow-amber-500/25 shrink-0 border border-amber-300/80 flex items-center justify-center bg-black">
              <img 
                src="/anchor.jpg" 
                alt="Bangladesh Navy Crest" 
                className="w-full h-full object-contain rounded-xl bg-black" 
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/50 rounded-full text-amber-300 font-algerian text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Network className="h-3.5 w-3.5 text-amber-400" />
                  COMMAND ORGANOGRAM & HIERARCHY TREE
                </span>
                <span className="text-xs text-cyan-200/80 font-mono">
                  {dockyardConfig.systemVersion}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-algerian font-bold text-white uppercase tracking-wider">
                BANGLADESH NAVY DOCKYARD — ORGANIZATION CHART
              </h2>
              <p className="text-xs sm:text-sm text-cyan-200/80 font-mono">
                সিএসডি কমান্ড হতে শুরু করে ৬টি পরিদপ্তর এবং ২৭টি সক্রিয় ওয়ার্কশপের চেইন অব কমান্ড ট্রি
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-cyan-500/30 text-center min-w-24">
              <span className="text-[10px] text-cyan-200 font-algerian font-bold uppercase block">DIRECTORATES</span>
              <span className="text-lg font-black text-amber-400 font-mono">৬ টি</span>
            </div>
            <div className="bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-cyan-500/30 text-center min-w-24">
              <span className="text-[10px] text-cyan-200 font-algerian font-bold uppercase block">TOTAL SHOPS</span>
              <span className="text-lg font-black text-cyan-300 font-mono">{workshops.length} টি</span>
            </div>
            <div className="bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-cyan-500/30 text-center min-w-24">
              <span className="text-[10px] text-cyan-200 font-algerian font-bold uppercase block">TECH DEFECTS</span>
              <span className="text-lg font-black text-emerald-400 font-mono">{defects.length} টি</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search Filter, Directorate Selector, View Mode, Expand/Collapse */}
      <div className="bg-[#00142e]/90 backdrop-blur-xl p-4 rounded-2xl border border-cyan-500/30 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="flex-1 min-w-[260px] max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="সার্চ করুন (যেমন: রিগিং শপ, WS-01, মেইন ইঞ্জিন, কমাণ্ডার...)"
            className="w-full pl-10 pr-9 py-2.5 bg-[#000d1e] border border-cyan-400/40 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Directorate Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => setSelectedDirectorate('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-algerian font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedDirectorate === 'all'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            ALL COMMANDS
          </button>
          <button
            type="button"
            onClick={() => setSelectedDirectorate('GM-PROD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-algerian font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedDirectorate === 'GM-PROD'
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            GM PRODUCTION (২৭ শপ)
          </button>
          <button
            type="button"
            onClick={() => setSelectedDirectorate('GM-PLAN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-algerian font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedDirectorate === 'GM-PLAN'
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            GM PLANNING
          </button>
          <button
            type="button"
            onClick={() => setSelectedDirectorate('GM-YARD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-algerian font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedDirectorate === 'GM-YARD'
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            GM YARD SERVICES
          </button>
        </div>

        {/* View Mode & Expand/Collapse Toggles */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex p-1 bg-black/40 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 rounded-lg text-xs font-algerian font-bold uppercase flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'tree' 
                  ? 'bg-amber-400 text-slate-950 shadow' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FolderTree className="h-3.5 w-3.5" />
              <span>TREE VIEW</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-algerian font-bold uppercase flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cards' 
                  ? 'bg-amber-400 text-slate-950 shadow' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>GRID VIEW</span>
            </button>
          </div>

          <button
            type="button"
            onClick={expandAll}
            title="সবগুলো শাখা খুলুন"
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl text-xs font-mono cursor-pointer border border-white/15"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={collapseAll}
            title="শাখাগুলো গুটান"
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl text-xs font-mono cursor-pointer border border-white/15"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW MODE 1: INTERACTIVE HIERARCHICAL TREE VIEW
      ========================================================================= */}
      {viewMode === 'tree' ? (
        <div className="bg-[#001024]/90 backdrop-blur-2xl p-4 sm:p-6 md:p-8 rounded-3xl border border-cyan-500/30 shadow-2xl overflow-x-auto min-h-[500px]">
          <div className="min-w-[760px] space-y-6">
            <TreeNodeItem 
              node={orgTree} 
              isRoot={true}
              collapsedNodes={collapsedNodes}
              toggleNodeCollapse={toggleNodeCollapse}
              onSelectNode={setSelectedNode}
              searchQuery={searchQuery}
              selectedDirectorate={selectedDirectorate}
              getDefectStats={getDefectStats}
            />
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW MODE 2: DIRECTORATE MATRIX GRID VIEW
        ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orgTree.children?.map(dir => (
            <div 
              key={dir.id}
              className="bg-[#00142e]/90 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between space-y-4 hover:border-amber-400/50 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-algerian font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    {dir.code}
                  </span>
                  <span className="text-xs text-amber-300 font-mono font-bold">
                    {dir.rank}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-algerian font-bold text-white uppercase tracking-wide group-hover:text-amber-300 transition-colors">
                    {dir.titleEn}
                  </h3>
                  <p className="text-xs text-slate-300 font-semibold mt-0.5">
                    {dir.titleBn}
                  </p>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-mono text-slate-400">অফিসার:</span>
                    <strong className="text-amber-300">{dir.officerName}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-mono text-slate-400">পদবী:</span>
                    <span>{dir.designation}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-mono text-slate-400">এক্সটেনশন:</span>
                    <span className="font-mono text-cyan-300">{dir.phoneExt}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2">
                  {dir.description}
                </p>

                {/* Subordinate branches summary */}
                <div className="pt-2 border-t border-white/10">
                  <span className="text-[11px] font-algerian font-bold uppercase text-slate-400 block mb-2">
                    SUBORDINATE UNITS / শাখাসমূহ:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dir.children?.map(sub => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSelectedNode(sub)}
                        className="px-2 py-1 bg-white/5 hover:bg-amber-400/20 text-[11px] rounded-lg border border-white/10 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        {sub.code || sub.titleBn}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNode(dir)}
                className="w-full py-2 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 hover:from-amber-400 hover:to-yellow-400 hover:text-slate-950 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-algerian font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>INSPECT COMMAND DETAILS</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          MODAL: INSPECT SELECTED NODE & DIRECT DEFECT WORKSHOP ACTIONS
      ========================================================================= */}
      {selectedNode && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedNode(null)}
        >
          <div 
            className="bg-[#001738] border border-amber-400/50 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl shadow-black/80 text-white relative overflow-hidden space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Navy Crest Banner */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl p-0.5 bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300 flex items-center justify-center bg-black shrink-0">
                  <img src="/anchor.jpg" alt="Navy Crest" className="w-full h-full object-contain rounded-lg bg-black" />
                </div>
                <div>
                  <span className="text-[10px] text-amber-300 font-algerian font-bold uppercase tracking-widest block">
                    BANGLADESH NAVY DOCKYARD
                  </span>
                  <h3 className="text-base sm:text-lg font-algerian font-bold text-white uppercase tracking-wider">
                    {selectedNode.titleEn}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Node Title & Identity */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-algerian font-bold uppercase ${getNodeBadgeClass(selectedNode.category)}`}>
                  {selectedNode.code || selectedNode.category}
                </span>
                <span className="text-xs text-amber-300 font-mono font-bold">
                  {selectedNode.rank}
                </span>
              </div>
              <h4 className="text-base font-bold text-white">
                {selectedNode.titleBn}
              </h4>
              <p className="text-xs text-slate-300">
                {selectedNode.description}
              </p>
            </div>

            {/* Officer & Contact Card */}
            <div className="bg-black/40 p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">দায়িত্বপ্রাপ্ত কর্মকর্তা:</span>
                <span className="font-bold text-amber-300">{selectedNode.officerName || 'অফিসার-ইন-চার্জ'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">অফিসিয়াল পদবী:</span>
                <span className="text-slate-200">{selectedNode.designation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">টেলিফোন এক্সটেনশন:</span>
                <span className="font-mono font-bold text-cyan-300">{selectedNode.phoneExt}</span>
              </div>
              {selectedNode.workshopCode && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono">ওয়ার্কশপ কোড:</span>
                  <span className="font-mono font-bold text-amber-400">{selectedNode.workshopCode}</span>
                </div>
              )}
            </div>

            {/* Defect Statistics if Workshop */}
            {selectedNode.workshopCode && (
              <div className="bg-[#00224d] p-4 rounded-2xl border border-cyan-500/30 space-y-3">
                <h5 className="text-xs font-algerian font-bold text-cyan-200 uppercase flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  <span>SYSTEM DEFECT LOGS FOR THIS WORKSHOP</span>
                </h5>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">মোট ডিফেক্ট</span>
                    <span className="text-sm font-black text-white font-mono">
                      {getDefectStats(selectedNode.workshopCode, selectedNode.titleBn).total}
                    </span>
                  </div>
                  <div className="bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30">
                    <span className="text-[10px] text-rose-300 uppercase font-mono block">পেন্ডিং</span>
                    <span className="text-sm font-black text-rose-400 font-mono">
                      {getDefectStats(selectedNode.workshopCode, selectedNode.titleBn).pending}
                    </span>
                  </div>
                  <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-300 uppercase font-mono block">সমাধানকৃত</span>
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      {getDefectStats(selectedNode.workshopCode, selectedNode.titleBn).solved}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              {selectedNode.workshopCode && onNavigateToEntry && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigateToEntry(undefined, selectedNode.workshopCode);
                    setSelectedNode(null);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#001733] font-algerian font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  <span>LOG DEFECT IN THIS SHOP</span>
                </button>
              )}

              {selectedNode.workshopCode && onNavigateToSearch && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigateToSearch(selectedNode.workshopCode);
                    setSelectedNode(null);
                  }}
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-algerian font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>FIND DEFECTS</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-algerian font-bold text-xs rounded-xl cursor-pointer uppercase tracking-wider"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Recursive Tree Node Renderer with Connected Hierarchy Lines
interface TreeNodeItemProps {
  key?: React.Key;
  node: OrgNode;
  isRoot?: boolean;
  collapsedNodes: Record<string, boolean>;
  toggleNodeCollapse: (nodeId: string, e?: React.MouseEvent) => void;
  onSelectNode: (node: OrgNode) => void;
  searchQuery: string;
  selectedDirectorate: string;
  getDefectStats: (workshopCode?: string, workshopNameBn?: string) => { total: number; pending: number; solved: number };
}

function TreeNodeItem({
  node,
  isRoot = false,
  collapsedNodes,
  toggleNodeCollapse,
  onSelectNode,
  searchQuery,
  selectedDirectorate,
  getDefectStats
}: TreeNodeItemProps) {
  const isCollapsed = !!collapsedNodes[node.id];
  const hasChildren = node.children && node.children.length > 0;

  // Check if this node or any descendants match filter
  const isFilteredOut = useMemo(() => {
    if (selectedDirectorate !== 'all' && node.category === 'directorate' && node.code !== selectedDirectorate) {
      return true;
    }
    if (!searchQuery) return false;
    const q = searchQuery.toLowerCase();
    const matchThis = 
      node.titleBn.toLowerCase().includes(q) ||
      node.titleEn.toLowerCase().includes(q) ||
      (node.code && node.code.toLowerCase().includes(q)) ||
      (node.officerName && node.officerName.toLowerCase().includes(q)) ||
      (node.workshopCode && node.workshopCode.toLowerCase().includes(q));

    if (matchThis) return false;

    // Check if any child matches
    const hasMatchingChild = (n: OrgNode): boolean => {
      if (!n.children) return false;
      return n.children.some(c => {
        if (
          c.titleBn.toLowerCase().includes(q) ||
          c.titleEn.toLowerCase().includes(q) ||
          (c.code && c.code.toLowerCase().includes(q)) ||
          (c.officerName && c.officerName.toLowerCase().includes(q)) ||
          (c.workshopCode && c.workshopCode.toLowerCase().includes(q))
        ) return true;
        return hasMatchingChild(c);
      });
    };

    return !hasMatchingChild(node);
  }, [node, searchQuery, selectedDirectorate]);

  if (isFilteredOut) return null;

  // Styling based on level
  const getNodeBorder = () => {
    switch (node.category) {
      case 'command':
        return 'border-2 border-amber-400 bg-gradient-to-br from-[#001738] via-[#00224d] to-[#001024] shadow-xl shadow-amber-500/20';
      case 'directorate':
        return 'border border-cyan-400/60 bg-[#00183b]/90 shadow-lg shadow-cyan-500/15 hover:border-amber-400';
      case 'group':
        return 'border border-teal-500/40 bg-[#001e3d]/85 hover:border-teal-300';
      case 'wing':
        return 'border border-white/20 bg-[#001228]/80 hover:border-cyan-400';
      case 'workshop':
      default:
        return 'border border-amber-400/30 bg-[#001024]/85 hover:border-amber-400';
    }
  };

  const defectStats = node.workshopCode ? getDefectStats(node.workshopCode, node.titleBn) : null;

  return (
    <div className={`relative ${isRoot ? '' : 'pl-6 sm:pl-8'}`}>
      
      {/* Hierarchy Connector Lines (Tree branch lines) */}
      {!isRoot && (
        <>
          {/* Vertical line from parent */}
          <div className="absolute -left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400/40 via-cyan-500/30 to-amber-400/20" />
          {/* Horizontal elbow connector */}
          <div className="absolute left-0 top-5 w-6 sm:w-8 h-0.5 bg-amber-400/40" />
        </>
      )}

      {/* Node Card Element */}
      <div 
        onClick={() => onSelectNode(node)}
        className={`p-3.5 sm:p-4 rounded-2xl text-white transition-all cursor-pointer group mb-3 relative ${getNodeBorder()}`}
      >
        <div className="flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Collapse / Expand Toggle Button */}
            {hasChildren && (
              <button
                type="button"
                onClick={(e) => toggleNodeCollapse(node.id, e)}
                className="w-6 h-6 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-slate-950 flex items-center justify-center text-slate-300 transition-colors shrink-0 cursor-pointer"
                title={isCollapsed ? 'শাখাটি প্রসারিত করুন' : 'শাখাটি গুটান'}
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}

            {/* Icon or Crest Badge */}
            {isRoot ? (
              <div className="w-10 h-10 rounded-xl bg-black border border-amber-400 p-0.5 shrink-0 shadow-md">
                <img src="/anchor.jpg" alt="Crest" className="w-full h-full object-contain rounded-lg" />
              </div>
            ) : node.category === 'directorate' ? (
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
            ) : node.category === 'workshop' ? (
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                <Wrench className="h-4 w-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0">
                <Layers className="h-4 w-4" />
              </div>
            )}

            {/* Titles and Details */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {node.code && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-algerian font-bold uppercase bg-white/10 text-amber-300 border border-white/15">
                    {node.code}
                  </span>
                )}
                <span className="text-[11px] font-mono text-cyan-200">
                  {node.rank}
                </span>
                {node.phoneExt && (
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                    Ext: {node.phoneExt}
                  </span>
                )}
              </div>

              <h4 className="text-xs sm:text-sm font-algerian font-bold text-white uppercase tracking-wide group-hover:text-amber-300 transition-colors truncate">
                {node.titleEn}
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium truncate">
                {node.titleBn} {node.officerName ? `— ${node.officerName}` : ''}
              </p>
            </div>
          </div>

          {/* Right Status / Action Badges */}
          <div className="flex items-center gap-2 shrink-0">
            {defectStats && defectStats.total > 0 && (
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                defectStats.pending > 0 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {defectStats.pending > 0 ? `${defectStats.pending} PENDING` : 'OPERATIONAL'}
              </span>
            )}

            {hasChildren && (
              <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10 hidden md:inline">
                {node.children?.length} সাব-ইউনিট
              </span>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(node);
              }}
              className="p-1 text-slate-400 hover:text-amber-300 transition-colors"
              title="বিস্তারিত দেখুন"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Render Child Nodes Recursively if expanded */}
      {hasChildren && !isCollapsed && (
        <div className="space-y-1">
          {node.children?.map(child => (
            <TreeNodeItem
              key={child.id}
              node={child}
              isRoot={false}
              collapsedNodes={collapsedNodes}
              toggleNodeCollapse={toggleNodeCollapse}
              onSelectNode={onSelectNode}
              searchQuery={searchQuery}
              selectedDirectorate={selectedDirectorate}
              getDefectStats={getDefectStats}
            />
          ))}
        </div>
      )}

    </div>
  );
}
