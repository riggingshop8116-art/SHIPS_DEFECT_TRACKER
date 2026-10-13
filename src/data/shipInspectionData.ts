export interface ShipSectionTask {
  workshopCode: string;
  workshopNameBn: string;
  workshopNameEn?: string;
  category: string;
  oicRankAndName: string;
  phoneExt: string;
  tasks: string[];
}

export interface ShipCompartment {
  id: string;
  code: string;
  nameBn: string;
  nameEn: string;
  deckLevel: string;
  locationTag: string; // Matches locations in system
  posX: number; // percentage 0 - 100 for 3D/Profile placement
  posY: number; // percentage 0 - 100 for 3D/Profile placement
  isoX: number; // percentage in isometric view
  isoY: number;
  topX: number; // percentage in top-deck view
  topY: number;
  overview: string;
  specifications: { label: string; value: string }[];
  workshopsAssigned: ShipSectionTask[];
}

export const WARSHIP_COMPARTMENTS: ShipCompartment[] = [
  // =========================================================================
  // SEC-01: Bow & Anchor Windlass Station
  // =========================================================================
  {
    id: 'sec-01',
    code: 'SEC-01',
    nameBn: 'বো ও অ্যাঙ্কর উইন্ডলাস স্টেশন',
    nameEn: 'Bow & Anchor Windlass Station',
    deckLevel: 'ফোরক্যাসল ডেক (Deck 1 Fore)',
    locationTag: 'Bow & Anchor Windlass Station',
    posX: 92,
    posY: 46,
    isoX: 88,
    isoY: 52,
    topX: 92,
    topY: 50,
    overview: 'জাহাজের সম্মুখভাগ, নোঙর ড্রপিং ও হাউলিং উইন্ডলাস মোটর, ব্রেক ব্যান্ড অ্যাসেম্বলি, চেইন লকার ও মুরিং ক্যাপস্টান ড্রাইভ। ডকইয়ার্ড রিগিং, ওয়েল্ডিং, পেইন্টিং ও হাইড্রোলিক টিম যৌথভাবে এই জোনে কাজ সম্পাদন করে।',
    specifications: [
      { label: 'উইন্ডলাস রেটিং', value: 'হাইড্রোলিক/ইলেকট্রিক ৩৫০ কিলোওয়াট' },
      { label: 'অ্যাঙ্কর ক্যাবল টাইপ', value: 'স্টাড লিংক ৪২মিমি হাই-টেনসাইল স্টিল' },
      { label: 'ব্রেকিং ক্যাপাসিটি', value: '১২০ টন ধারণক্ষমতা' }
    ],
    workshopsAssigned: [
      {
        workshopCode: 'WS-01',
        workshopNameBn: 'রিগিং শপ (Rigging Shop)',
        workshopNameEn: 'Rigging Shop',
        category: 'Deck & Lifting Gear',
        oicRankAndName: 'SAKIB HOSEN (OFFICE WRITER)',
        phoneExt: '8116',
        tasks: [
          'অ্যাঙ্কর চেইন লিংক ও গ্যাটার পরিদর্শন এবং প্রুফ লোড টেনসাইল টেস্ট সম্পাদন।',
          'উইন্ডলাস ব্রেক ব্যান্ড লিনিং ও ফ্রিকশন প্যাড মেজারমেন্ট ও ওভারহোল।',
          'হেভি মুরিং ওয়্যার রোপ স্প্লাইসিং, সকেট ফিটিং ও উইঞ্চ ড্রাম টেনশন চেক।',
          'বুলওয়ার্ক ফেয়ারলেড ও প্যানামা চক্সের রোলার গ্রিজিং ও রি-ক্লিপিং।'
        ]
      },
      {
        workshopCode: 'WS-04',
        workshopNameBn: 'ওয়েল্ডিং ও ফেব্রিকেশন শপ (Welding & Fabrication Shop)',
        workshopNameEn: 'Welding & Fabrication Shop',
        category: 'Metal Joining',
        oicRankAndName: 'Lieutenant K R Hasan',
        phoneExt: '4204',
        tasks: [
          'চেইন লকার ওয়াটারটাইট বাল্কহেড ও হস পাইপ মেটাল ক্ষয়রোধে ডাবলার প্লেট ওয়েল্ডিং।',
          'বুলওয়ার্ক স্টিফেনার ও রোপ বিট ফাউন্ডেশন স্ট্রাকচারাল রি-ওয়েল্ডিং।'
        ]
      },
      {
        workshopCode: 'WS-10',
        workshopNameBn: 'পেইন্টিং ও প্রিজারভেশন শপ (Painting & Preservation Shop)',
        workshopNameEn: 'Painting & Preservation Shop',
        category: 'Coating & Protection',
        oicRankAndName: 'Lieutenant R Ahmed',
        phoneExt: '4210',
        tasks: [
          'ফোরক্যাসল ডেক ও হস পাইপ সারফেস গ্রিট ব্লাস্টিং (SA 2.5) এবং জিংক সিলিকেট প্রাইমার প্রয়োগ।',
          'চেইন লকার ইন্টারনাল ওয়াটার-রেজিস্ট্যান্ট কোল টার ইপোক্সি কোটিং এবং রি-পেইন্টিং।'
        ]
      },
      {
        workshopCode: 'WS-19',
        workshopNameBn: 'হাইড্রোলিক ও নিউমেটিক শপ (Hydraulic & Pneumatic Shop)',
        workshopNameEn: 'Hydraulic & Pneumatic Shop',
        category: 'Fluid Power',
        oicRankAndName: 'Lt Commander H Hasan',
        phoneExt: '4219',
        tasks: [
          'উইন্ডলাস হাইড্রোলিক ড্রাইভ মোটর সিলিং কিট প্রতিস্থাপন ও প্রেসার টেস্ট (২১০ বার)।',
          'মুরিং ক্যাপস্টান হাইড্রোলিক পাইপলাইন প্রেসার গেজ ক্যালিব্রেশন ও ফ্লুইড ফিল্টারিং।'
        ]
      },
      {
        workshopCode: 'WS-27',
        workshopNameBn: 'ইয়ার্ড সার্ভিসেস ও হেভি ট্রান্সপোর্ট (Yard Services & Heavy Transport)',
        workshopNameEn: 'Yard Services & Heavy Transport',
        category: 'Yard Logistics',
        oicRankAndName: 'Lieutenant R U Ahmed',
        phoneExt: '4227',
        tasks: [
          'হেভি মুরিং লাইন সাপোর্ট ও টাগবোট বার্থিং সেফটি মনিটরিং।',
          'জেটি ক্রেন দ্বারা হেভি অ্যাঙ্কর চেইন উত্তোলন ও ডকইয়ার্ডে স্থানান্তর।'
        ]
      }
    ]
  },

  // =========================================================================
  // SEC-02: Forecastle & 76mm Main Naval Gun Mount
  // =========================================================================
  {
    id: 'sec-02',
    code: 'SEC-02',
    nameBn: 'ফোরক্যাসল ও প্রধান নেভাল গান (৭৬মিমি)',
    nameEn: 'Forecastle & 76mm Main Naval Gun Mount',
    deckLevel: 'গান ডেক (Gun Deck Fore)',
    locationTag: 'Forecastle & 76mm Naval Gun',
    posX: 81,
    posY: 38,
    isoX: 78,
    isoY: 42,
    topX: 81,
    topY: 50,
    overview: '৭৬মিমি র‍্যাপিড ফায়ার নেভাল গান টার্রেট, অটোমেটিক অ্যামুনিশন ফিডার ড্রাম, রিকয়েল মেকানিজম, ইলেক্ট্রো-অপটিক্যাল সাইট এবং সংশ্লিষ্ট ড্রাইভ মোটর।',
    specifications: [
      { label: 'ক্যালিব্যার ও টাইপ', value: '৭৬/৬২ মিমি ওটিও ব্রেডা / কমপ্যাক্ট নেভাল গান' },
      { label: 'ফায়ারিং রেট', value: '১২০ রাউন্ড প্রতি মিনিট' },
      { label: 'সর্বোচ্চ রেঞ্জ', value: '১৬,০০০ মিটার' }
    ],
    workshopsAssigned: [
      {
        workshopCode: 'WS-07',
        workshopNameBn: 'ওয়েপন ও অর্ডন্যান্স শপ (Weapon & Ordnance Shop)',
        workshopNameEn: 'Weapon & Ordnance Shop',
        category: 'Ordnance & Armament',
        oicRankAndName: 'Commander H Kabir',
        phoneExt: '4207',
        tasks: [
          '৭৬মিমি গান মাউন্ট ব্রিচ ব্লক ও রিকয়েল সিলিন্ডার ডিসঅ্যাসেম্বলি ও লুব্রিকেশন।',
          'অটোমেটিক অ্যামো হোইস্ট ড্রাম র‍্যাক সার্ভো ড্রাইভ পরিদর্শন ও টেস্ট ফায়ারিং ক্যালিব্রেশন।'
        ]
      },
      {
        workshopCode: 'WS-02',
        workshopNameBn: 'মেশিন শপ (Machine Shop)',
        workshopNameEn: 'Machine Shop',
        category: 'Mechanical Precision',
        oicRankAndName: 'Lt Commander M Zaman',
        phoneExt: '4202',
        tasks: [
          'গান এলিভেশন ট্রানিয়ন বুশিং প্রিসিশন টার্নিং ও লেদ মেশিনিং।',
          'ব্রিচ লক পিন ও রিকয়েল স্লিভ ডাইমেনশনাল টলারেন্স রি-মেশিনিং।'
        ]
      },
      {
        workshopCode: 'WS-17',
        workshopNameBn: 'অপটিক্যাল ও ফায়ার কন্ট্রোল শপ (Optical & Fire Control Shop)',
        workshopNameEn: 'Optical & Fire Control Shop',
        category: 'Optics & Fire Control',
        oicRankAndName: 'Lt Commander F Ahmed',
        phoneExt: '4217',
        tasks: [
          'ইলেক্ট্রো-অপটিক্যাল গান ডিরেক্টর লেন্স প্রিজম ক্লিনজিং ও বোর-সাইট টেলিস্কোপ অ্যালাইনমেন্ট।',
          'লেজার রেঞ্জফাইন্ডার অপটিক্যাল ট্রান্সমিটার ক্যালিব্রেশন ও নাইট-ভিশন সেন্সর চেক।'
        ]
      },
      {
        workshopCode: 'WS-10',
        workshopNameBn: 'পেইন্টিং ও প্রিজারভেশন শপ (Painting & Preservation Shop)',
        workshopNameEn: 'Painting & Preservation Shop',
        category: 'Coating & Protection',
        oicRankAndName: 'Lieutenant R Ahmed',
        phoneExt: '4210',
        tasks: [
          'গান টার্রেট হাউজিং হিট-রেজিস্ট্যান্ট মেরিন গ্রে কোটিং ও অ্যান্টি-রিফ্লেক্টিভ পেইন্টিং।'
        ]
      },
      {
        workshopCode: 'WS-24',
        workshopNameBn: 'ক্যালিব্রেশন ও ইনস্ট্রুমেন্টেশন ল্যাব (Calibration & Instrumentation Lab)',
        workshopNameEn: 'Calibration & Instrumentation Lab',
        category: 'Testing & Standards',
        oicRankAndName: 'Lieutenant J Islam',
        phoneExt: '4224',
        tasks: [
          'গান মাউন্ট অ্যাঙ্গেল ট্র্যাকিং রিজলভার ও প্রেসার ট্রান্সডিউসার প্রিসিশন ক্যালিব্রেশন।'
        ]
      }
    ]
  },

  // =========================================================================
  // SEC-03: Bridge & Wheelhouse Command Station
  // =========================================================================
  {
    id: 'sec-03',
    code: 'SEC-03',
    nameBn: 'ব্রিজ ও নেভিগেশন কমান্ড সেন্টার',
    nameEn: 'Bridge & Wheelhouse Command Station',
    deckLevel: 'সুপারস্ট্রাকচার ডেক ০৩ (Bridge Deck)',
    locationTag: 'Bridge & Wheelhouse',
    posX: 68,
    posY: 28,
    isoX: 65,
    isoY: 30,
    topX: 68,
    topY: 50,
    overview: 'জাহাজের মূল পরিচালনা ও নেভিগেশন কমান্ড সেন্টার, অটো-পাইলট স্টিয়ারিং কনসোল, নেভিগেশন রাডার, গাইরোকম্পাস ও ভিএইচএফ রেডিও কমিউনিকেশন স্টেশন।',
    specifications: [
      { label: 'কমান্ড পজিশন', value: 'সিও, নেভিগেটিং অফিসার ও হেলমসম্যান কনসোল' },
      { label: 'নেভিগেশন সিস্টেম', value: 'আইএনএস ও ডুয়াল জিপিএস/ইসিডিআইএস সমন্বিত' },
      { label: 'যোগাযোগ লিংক', value: 'সিকিউর ট্যাকটিক্যাল ভিএইচএফ/এইচএফ লিংক' }
    ],
    workshopsAssigned: [
      {
        workshopCode: 'WS-23',
        workshopNameBn: 'টেলিকমিউনিকেশন ও নেভ-এইডস শপ (Telecommunication & Nav-Aids Shop)',
        workshopNameEn: 'Telecommunication & Nav-Aids Shop',
        category: 'Communications',
        oicRankAndName: 'Lt Commander B Das',
        phoneExt: '4223',
        tasks: [
          'ট্যাকটিক্যাল ভিএইচএফ/ইউএইচএফ নৌ-রেডিও ট্রান্সসিভার পাওয়ার টেস্ট ও অ্যান্টেনাসমূহ টিউনিং।',
          'ডিজিটাল জিপিএস রিসিভার ও ব্রিজ সাউন্ড-পাওয়ার্ড অভ্যন্তরীণ ইন্টারকম লাইন মেরামত।'
        ]
      },
      {
        workshopCode: 'WS-06',
        workshopNameBn: 'ইলেকট্রনিক্স ও রাডার শপ (Electronics & Radar Shop)',
        workshopNameEn: 'Electronics & Radar Shop',
        category: 'Electronics & Sensors',
        oicRankAndName: 'Lt Commander S Rahman',
        phoneExt: '4206',
        tasks: [
          'নেভিগেশন এক্স-ব্যান্ড ও এস-ব্যান্ড রাডার ডিসপ্লে কনসোল ডায়াগনস্টিকস ও পিআরএফ টেস্ট।',
          'গাইরো রিপিটার সিঙ্ক্রোনাইজেশন ও ট্যাকটিক্যাল ইসিডিআইএস ইন্টারফেস চেক।'
        ]
      },
      {
        workshopCode: 'WS-17',
        workshopNameBn: 'অপটিক্যাল ও ফায়ার কন্ট্রোল শপ (Optical & Fire Control Shop)',
        workshopNameEn: 'Optical & Fire Control Shop',
        category: 'Optics & Fire Control',
        oicRankAndName: 'Lt Commander F Ahmed',
        phoneExt: '4217',
        tasks: [
          'ব্রিজ পেলোরাস প্রিজম অপটিক্যাল অ্যালাইনমেন্ট ও হাই-পাওয়ার্ড নেভাল দূরবীন সার্ভিসিং।',
          'ইনফ্রারেড নাইট ভিশন সার্চলাইট অপটিক্স কোয়ার্টজ গ্লাস ক্লিনিং ও ক্যালিব্রেশন।'
        ]
      },
      {
        workshopCode: 'WS-13',
        workshopNameBn: 'সেইল লফট ও সারভাইভাল ইকুইপমেন্ট শপ (Sail Loft & Survival Equipment Shop)',
        workshopNameEn: 'Sail Loft & Survival Equipment Shop',
        category: 'Life Saving Equipment',
        oicRankAndName: 'Sub-Lieutenant P K Roy',
        phoneExt: '4213',
        tasks: [
          'ব্রিজ উইং ঝড় ও রোদ প্রতিরোধক ক্যানভাস কভার ফিটিং ও মেরামত।',
          'আন্তর্জাতিক নৌ-সংকেত সিগন্যাল ফ্ল্যাগ ও ব্রিজ সেফটি ক্যানভাস ইন্সপেকশন।'
        ]
      },
      {
        workshopCode: 'WS-15',
        workshopNameBn: 'শিপরাইট ও কার্পেন্ট্রি শপ (Shipwright & Carpentry Shop)',
        workshopNameEn: 'Shipwright & Carpentry Shop',
        category: 'Docking & Woodwork',
        oicRankAndName: 'Lieutenant N Talukdar',
        phoneExt: '4215',
        tasks: [
          'হুইলহাউস টিকউড চার্ট টেবিল পলিশিং ও ড্রয়ার লক হার্ডওয়্যার মেরামত।',
          'ব্রিজ ওয়াটারটাইট অ্যাক্সেস ডোর নিওপ্রিন গ্যাসকেট প্রতিস্থাপন।'
        ]
      }
    ]
  },

  // =========================================================================
  // SEC-04: Main 3D Surveillance Radar & Rigging Mast
  // =========================================================================
  {
    id: 'sec-04',
    code: 'SEC-04',
    nameBn: 'মেইন রাডার ও রিগিং মাস্ট',
    nameEn: 'Main 3D Surveillance Radar & Rigging Mast',
    deckLevel: 'টপ-মাস্ট প্ল্যাটফর্ম (Superstructure Mast)',
    locationTag: 'Radar Mast',
    posX: 58,
    posY: 12,
    isoX: 56,
    isoY: 15,
    topX: 58,
    topY: 50,
    overview: 'জাহাজের প্রধান ৩ডি লং-রেঞ্জ এয়ার ও সারফেস সার্চ রাডার মাস্ট, আইএফএফ ইন্টারোগেটর অ্যান্টেনা, ইলেকট্রনিক ওয়ারফেয়ার (ইডব্লিউ) সেন্সর ও হেভি রিগিং মাস্ট স্ট্রাকচার।',
    specifications: [
      { label: 'রাডার টাইপ', value: '৩ডি ফেজড অ্যারে / মাল্টি-টার্গেট এয়ার ট্র্যাকার' },
      { label: 'ডিটেকশন রেঞ্জ', value: '২৫০ কিমি এয়ারক্রাফট / ৬০ কিমি মিসাইল' },
      { label: 'মাস্ট উচ্চতা', value: 'ওয়াটারলাইন থেকে ২২.৫ মিটার' }
    ],
    workshopsAssigned: [
      {
        workshopCode: 'WS-01',
        workshopNameBn: 'রিগিং শপ (Rigging Shop)',
        workshopNameEn: 'Rigging Shop',
        category: 'Deck & Lifting Gear',
        oicRankAndName: 'SAKIB HOSEN (OFFICE WRITER)',
        phoneExt: '8116',
        tasks: [
          'মাস্ট স্টে ওয়্যার রোপস, টানবাকল ও হেভি ক্ল্যাম্পের টেনশন পরিমাপ ও নিরাপত্তা সার্টিফিকেশন।',
          'অ্যান্টেনা উত্তোলন হ্যালিয়ার্ড ও ক্লাইম্বিং সেফটি ল্যাডার কেবলস টেস্ট।'
        ]
      },
      {
        workshopCode: 'WS-06',
        workshopNameBn: 'ইলেকট্রনিক্স ও রাডার শপ (Electronics & Radar Shop)',
        workshopNameEn: 'Electronics & Radar Shop',
        category: 'Electronics & Sensors',
        oicRankAndName: 'Lt Commander S Rahman',
        phoneExt: '4206',
        tasks: [
          '৩ডি রাডার রোটেটিং অ্যান্টেনা ওয়েভগাইড আরএফ কাপলার টেস্ট ও মোটর ড্রাইভ ওভারহোল।',
          'আইএফএফ ট্রান্সপন্ডার সেন্সর ও ইডব্লিউ রিসিভার হেড আরএফ সিগন্যাল লস টেস্ট।'
        ]
      },
      {
        workshopCode: 'WS-04',
        workshopNameBn: 'ওয়েল্ডিং ও ফেব্রিকেশন শপ (Welding & Fabrication Shop)',
        workshopNameEn: 'Welding & Fabrication Shop',
        category: 'Metal Joining',
        oicRankAndName: 'Lieutenant K R Hasan',
        phoneExt: '4204',
        tasks: [
          'মাস্ট ল্যাটিস ফ্রেম মেটাল জয়েন্ট টিআইজি ওয়েল্ডিং ও ব্র্যাকেট রিইনফোর্সমেন্ট।'
        ]
      },
      {
        workshopCode: 'WS-20',
        workshopNameBn: 'ইলেক্ট্রোপ্লেটিং ও গ্যালভানাইজিং শপ (Electroplating & Galvanizing Shop)',
        workshopNameEn: 'Electroplating & Galvanizing Shop',
        category: 'Surface Treatment',
        oicRankAndName: 'Lieutenant M Rafiq',
        phoneExt: '4220',
        tasks: [
          'মাস্ট ফাস্টেনার ও ইউ-বোল্ট হট-ডিপ জিঙ্ক গ্যালভানাইজিং ও করোশন রেজিস্ট্যান্স ট্রিটমেন্ট।'
        ]
      },
      {
        workshopCode: 'WS-25',
        workshopNameBn: 'কোয়ালিটি কন্ট্রোল ও এনডিটি ল্যাব (Quality Control & NDT Lab)',
        workshopNameEn: 'Quality Control & NDT Lab',
        category: 'Quality Assurance',
        oicRankAndName: 'Lt Commander M K Chowdhury',
        phoneExt: '4225',
        tasks: [
          'মাস্ট জয়েন্ট ওয়েল্ডের আল্ট্রাসনিক ফ্ল ডিটেকশন (UT) ও লাইটনিং গ্রাউন্ডিং রেজিস্ট্যান্স মেজারমেন্ট।'
        ]
      }
    ]
  },

  // =========================================================================
  // SEC-05: Combat Information Center (CIC) & Sonar Suite
  // =========================================================================
  {
    id: 'sec-05',
    code: 'SEC-05',
    nameBn: 'কমব্যাট ইনফরমেশন সেন্টার (সিআইসি) ও সোনার রুম',
    nameEn: 'Combat Information Center (CIC) & Sonar Suite',
    deckLevel: 'ডেক ০২ (Command Deck Mid)',
    locationTag: 'Combat Information Center',
    posX: 58,
    posY: 44,
    isoX: 56,
    isoY: 48,
    topX: 58,
    topY: 50,
    overview: 'সিআইসি বা কমব্যাট ইনফরমেশন সেন্টার যুদ্ধজাহাজের মূল নার্ভ সেন্টার। এখানে কমব্যাট ম্যানেজমেন্ট সিস্টেম (সিএমএস), হাল-মাউন্টেড সোনার প্রোসেসর এবং অস্ত্র নিয়ন্ত্রণ কনসোল স্থাপিত।',
    specifications: [
      { label: 'কমান্ড প্রসেসর', value: 'মিল-স্পেক ডুয়াল রিডানড্যান্ট ট্যাকটিক্যাল ল্যান' },
      { label: 'সোনার ফ্রিকোয়েন্সি', value: 'অ্যাক্টিভ/প্যাসিভ মিডিয়াম ফ্রিকোয়েন্সি (৭.৫ kHz)' },
      { label: 'অপারেটর কনসোল', value: '৮টি ট্যাকটিক্যাল ওয়ারফেয়ার ওয়ার্কস্টেশন' }
    ],
    workshopsAssigned: [
      {
        workshopCode: 'WS-06',
        workshopNameBn: 'ইলেকট্রনিক্স ও রাডার শপ (Electronics & Radar Shop)',
        workshopNameEn: 'Electronics & Radar Shop',
        category: 'Electronics & Sensors',
        oicRankAndName: 'Lt Commander S Rahman',
        phoneExt: '4206',
        tasks: [
          'ট্যাকটিক্যাল ডিসপ্লে কনসোল পিসিবি কার্ড ডায়াগনস্টিকস ও ডাটা বাস কেবল টেস্ট।',
          'সোনার অ্যাকোস্টিক সিগন্যাল প্রসেসিং র্যাক ও ট্রান্সডিউসার প্রি-অ্যামপ্লিফায়ার ক্যালিব্রেশন।'
        ]
      },
      {
        workshopCode: 'WS-05',
        workshopNameBn: 'ইলেকট্রিক্যাল পাওয়ার শপ (Electrical Power Workshop)',
        workshopNameEn: 'Electrical Power Workshop',
        category: 'Electrical Power',
        oicRankAndName: 'Lt Commander T A Islam',
        phoneExt: '4205',
        tasks: [
          'সিআইসি ক্লিন আনইন্টারেপ্টেবল পাওয়ার সাপ্লাই (ইউপিএস) ও ৪০০ হার্টজ কনভার্টার ইন্সপেকশন।',
          'ট্যাকটিক্যাল ইলেকট্রনিক্স ইমার্জেন্সি ডিসি বাসবার অটোমেটিক চেঞ্জওভার সুইচ টেস্ট।'
        ]
      },
      {
        workshopCode: 'WS-18',
        workshopNameBn: 'রেফ্রিজারেশন ও এইচভিএসি শপ (Refrigeration & HVAC Shop)',
        workshopNameEn: 'Refrigeration & HVAC Shop',
        category: 'HVAC Systems',
        oicRankAndName: 'Lieutenant G Mostafa',
        phoneExt: '4218',
        tasks: [
          'সিআইসি সার্ভার ক্যাবিনেট প্রিসিশন কুলিং চিলার ও এয়ার হ্যান্ডলিং ইউনিট (এএইচইউ) রক্ষণাবেক্ষণ।',
          'কমব্যাট ইলেকট্রনিক্স রুম আর্দ্রতা নিয়ন্ত্রণ (ডিহিউমিডিফায়ার) ও ডাক্ট ক্লিনিং।'
        ]
      },
      {
        workshopCode: 'WS-24',
        workshopNameBn: 'ক্যালিব্রেশন ও ইনস্ট্রুমেন্টেশন ল্যাব (Calibration & Instrumentation Lab)',
        workshopNameEn: 'Calibration & Instrumentation Lab',
        category: 'Testing & Standards',
        oicRankAndName: 'Lieutenant J Islam',
        phoneExt: '4224',
        tasks: [
          'সোনার ফ্রিকোয়েন্সি ট্রান্সমিটার স্পেকট্রাম অ্যানালাইজার টেস্ট ও সিগনাল ক্যালিব্রেশন।'
        ]
      },
      {
        workshopCode: 'WS-22',
        workshopNameBn: 'আন্ডারওয়াটার রিপেয়ার ও ডাইভিং ইউনিট (Underwater Repairs & Diving Unit)',
        workshopNameEn: 'Underwater Repairs & Diving Unit',
        category: 'Subsea Operations',
        oicRankAndName: 'Lt Commander T Mahmud',
        phoneExt: '4222',
        tasks: [
          'হাল-মাউন্টেড সোনার ডোম রাবার উইন্ডো ডাইভার ভিজ্যুয়াল পরিদর্শন ও ডি-ফাউলিং।'
        ]
      }
    ]
  },

  // =========================================================================
  // SEC-06: Midship Anti-Ship Missile Launchers & Torpedo Deck
  // =========================================================================
  {
    id: 'sec-06',
    code: 'SEC-06',
    nameBn: 'মিডশিপ মিসাইল ও টর্পেডো ডেক',
    nameEn: 'Midship Anti-Ship Missile Launchers & Torpedo Deck',
    deckLevel: 'মেইন ডেক মিডশিপ (Deck 1 Mid)',
    locationTag: 'Missile Deck & Torpedo Tubes',
    posX: 46,
    posY: 34,
    isoX: 45,
    isoY: 38,
    topX: 46,
    topY: 50,
    overview: 'সি-৮০২ অ্যান্টি-শিপ ক্রুজ মিসাইল ক্যানিস্টার লঞ্চার, ব্লাস্ট ডিফ্লেক্টর শিল্ড, ট্রিপল অ্যান্টি-সাবমেরিন টর্পেডো টিউব ও নিউমেটিক চার্জিং স্টেশন।',
    specifications: [
      { label: 'মিসাইল সিস্টেম', value: '৪ x সি-৮০২এ লং-রেঞ্জ সি-স্কিমিং মিসাইল' },
      { label: 'টর্পেডো টাইপ', value: '৩২৪মিমি ট্রিপল এএসডব্লিউ টর্পেডো টিউব' },
      { label: 'লঞ্চিং প্রেসার', value: 'নিউমেটিক ১৮০ বার প্রেসার ডিসচার্জ' }
    ],
    workshopsAssigned: [
      {
        workshopCode: 'WS-07',
        workshopNameBn: 'ওয়েপন ও অর্ডন্যান্স শপ (Weapon & Ordnance Shop)',
        workshopNameEn: 'Weapon & Ordnance Shop',
        category: 'Ordnance & Armament',
        oicRankAndName: 'Commander H Kabir',
        phoneExt: '4207',
        tasks: [
          'সি-৮০২ মিসাইল ক্যানিস্টার লক মেকানিজম ও ব্লাস্ট শিল্ড ইজেকশন হিঞ্জ ওভারহোল।',
          '৩২৪মিমি টর্পেডো টিউব নিউমেটিক ইজেকশন ইন্টারলক ও ম্যানুয়াল সেফটি ল্যাচ চেক।'
        ]
      },
      {
        workshopCode: 'WS-04',
        workshopNameBn: 'ওয়েল্ডিং ও ফেব্রিケーション শপ (Welding & Fabrication Shop)',
        workshopNameEn: 'Welding & Fabrication Shop',
        category: 'Metal Joining',
        oicRankAndName: 'Lieutenant K R Hasan',
        phoneExt: '4204',
        tasks: [
          'মিসাইল লঞ্চার পেডেস্টাল ডেক ফাউন্ডেশন ওয়েল্ড সিম ও ব্লাস্ট ডিফ্লেক্টর ফ্রেম মেরামত।'
        ]
      },
      {
        workshopCode: 'WS-19',
        workshopNameBn: 'হাইড্রোলিক ও নিউমেটিক শপ (Hydraulic & Pneumatic Shop)',
        workshopNameEn: 'Hydraulic & Pneumatic Shop',
        category: 'Fluid Power',
        oicRankAndName: 'Lt Commander H Hasan',
        phoneExt: '4219',
        tasks: [
          'টর্পেডো ডিসচার্জ হাই প্রেসার নিউমেটিক এয়ার বোটল প্রেশার ড্রপ টেস্ট (২০০ বার)।'
        ]
      },
      {
        workshopCode: 'WS-13',
        workshopNameBn: 'সেইল লফট ও সারভাইভাল ইকুইপমেন্ট শপ (Sail Loft & Survival Equipment Shop)',
        workshopNameEn: 'Sail Loft & Survival Equipment Shop',
        category: 'Life Saving Equipment',
        oicRankAndName: 'Sub-Lieutenant P K Roy',
        phoneExt: '4213',
        tasks: [
          'মিডশিপ ক্র্যাডলে অবস্থিত ইনফ্লেটেবল লাইফ র‍্যাফটস ইন্সপেকশন ও হাইড্রোস্ট্যাটিক রিলিজ ইউনিট সার্ভিসিং।'
        ]
      },
      {
        workshopCode: 'WS-25',
        workshopNameBn: 'কোয়ালিটি কন্ট্রোল ও এনডিটি ল্যাব (Quality Control & NDT Lab)',
        workshopNameEn: 'Quality Control & NDT Lab',
        category: 'Quality Assurance',
        oicRankAndName: 'Lt Commander M K Chowdhury',
        phoneExt: '4225',
        tasks: [
          'টর্পেডো টিউব মাউন্ট ও মিসাইল ফাউন্ডেশন বোল্টসের রেডিওগ্রাফিক এক্স-রে পরীক্ষা।'
        ]
      }
    ]
  },

  // =========================================================================
  // SEC-07: Main Engine Machinery Propulsion Room
  // =========================================================================
  {
    id: 'sec-07',
    code: 'SEC-07',
    nameBn: 'মেইন প্রপালশন ও ইঞ্জিন রুম',
    nameEn: 'Main Engine Machinery Propulsion Room',
    deckLevel: 'লোয়ার ডেক / প্ল্যাটফর্ম ডেক (Deck 4 Engine Room)',
    locationTag: 'Main Engine',
    posX: 42,
    posY: 64,
    isoX: 42,
    isoY: 66,
    topX: 42,
    topY: 50,
    overview: 'জাহাজের প্রধান চালিকাশক্তি মেইন প্রপালশন ডিজেল ইঞ্জিন ও গ্যাস টারবাইন ড্রাইভ, রিডাকশন গিয়ারবক্স, ফুয়েল ইনজেক্টর পাম্প, টার্বোচার্জার ও লুব্রিকেশন অয়েল সিস্টেম।',
    specifications: [
      { label: 'ইঞ্জিন মডেল', value: 'টুইন এসইএমটি পিয়েলস্টিক / এমটিইউ মেরিন ডিজেল' },
      { label: 'মোট আউটপুট', value: '১৬,০০০ কিলোওয়াট (২১,৫০০ বিএইচপি)' },
      { label: 'সর্বোচ্চ গতিবেগ', value: '২৮ নটিক্যাল মাইল/ঘণ্টা' }
    ],
    workshopsAssigned: [
      {
        workshopCode: 'WS-08',
        workshopNameBn: 'আইসি ইঞ্জিন ও ডিজেল শপ (IC Engine & Diesel Shop)',
        workshopNameEn: 'IC Engine & Diesel Shop',
        category: 'Propulsion & Diesel',
        oicRankAndName: 'Lt Commander M A Rahman',
        phoneExt: '4208',
        tasks: [
          'মেইন ইঞ্জিনের সিলিন্ডার হেড ডিকোকিং, ফুয়েল ইনজেক্টর প্রেসার টিউনিং (২৫০ বার)।',
          'টার্বোচার্জার বিয়ারিং ক্লিয়ারেন্স পর্যবেক্ষণ, এক্সহস্ট গ্যাস টেম্পারেচার ব্যালেন্সিং।'
        ]
      },
      {
        workshopCode: 'WS-12',
        workshopNameBn: 'গ্যাস টারবাইন ও প্রপালশন শপ (Gas Turbine & Propulsion Shop)',
        workshopNameEn: 'Gas Turbine & Propulsion Shop',
        category: 'Main Propulsion',
        oicRankAndName: 'Lt Commander D K Banik',
        phoneExt: '4212',
        tasks: [
          'গ্যাস টারবাইন ব্লেডস বোরোস্কোপ পরিদর্শন ও পাওয়ার টারবাইন ভাইব্রেশন অ্যানালাইসিস।',
          'মেইন রিডাকশন গিয়ারবক্স ক্লাচ ও ফ্লেক্সিবল মেম্ব্রেন কাপলিং এলাইনমেন্ট।'
        ]
      },
      {
        workshopCode: 'WS-02',
        workshopNameBn: 'মেশিন শপ (Machine Shop)',
        workshopNameEn: 'Machine Shop',
        category: 'Mechanical Precision',
        oicRankAndName: 'Lt Commander M Zaman',
        phoneExt: '4202',
        tasks: [
          'প্রপালশন শ্যাফটিং স্লিভ প্রিসিশন টার্নিং, ভালভ সিট গ্রাইন্ডিং ও ল্যাপিং।',
          'ইঞ্জিন সেন্ট্রিফিউগাল পাম্প শ্যাফট ও ইম্পেলার ডায়নামিক ব্যালেন্সিং।'
        ]
      },
      {
        workshopCode: 'WS-09',
        workshopNameBn: 'পাইপ ও প্লাম্বিং শপ (Pipe Fitting & Plumbing Shop)',
        workshopNameEn: 'Pipe Fitting & Plumbing Shop',
        category: 'Piping Systems',
        oicRankAndName: 'Lieutenant A K Azad',
        phoneExt: '4209',
        tasks: [
          'হাই প্রেসার ফুয়েল ও লুব অয়েল পাইপলাইনের ফ্ল্যাঞ্জ গ্যাসকেট প্রতিস্থাপন ও প্রেসার টেস্ট।',
          'কুলিং সি-ওয়াটার সাকশন ও ডিসচার্জ লাইনের ব্রোঞ্জ ভালভ ওভারহোল।'
        ]
      },
      {
        workshopCode: 'WS-16',
        workshopNameBn: 'টুল রুম ও প্রিসিশন শপ (Tool Room & Precision Shop)',
        workshopNameEn: 'Tool Room & Precision Shop',
        category: 'Tooling & Gauges',
        oicRankAndName: 'Lieutenant S Ahmed',
        phoneExt: '4216',
        tasks: [
          'ইঞ্জিন সিলিন্ডার হেড হাই-ক্যাপাসিটি হাইড্রোলিক টর্ক রেঞ্চ ও মাইক্রোমিটার প্রিসিশন মেজারমেন্ট।'
        ]
      },
      {
        workshopCode: 'WS-24',
        workshopNameBn: 'ক্যালিব্রেশন ও ইনস্ট্রুমেন্টেশন ল্যাব (Calibration & Instrumentation Lab)',
        workshopNameEn: 'Calibration & Instrumentation Lab',
        category: 'Testing & Standards',
        oicRankAndName: 'Lieutenant J Islam',
        phoneExt: '4224',
        tasks: [
          'এক্সহস্ট পাইরোমিটার সেন্সর, লুব অয়েল প্রেসার ট্র্যান্সমিটার ও ট্যাকোমিটার ক্যালিব্রেশন।'
        ]
      }
    ]
  },

  // =========================================================================
  // SEC-08: Diesel Generators (DG-1, DG-2) & Aux Boiler Room
  // =========================================================================
  {
    id: 'sec-08',
    code: 'SEC-08',
    nameBn: 'ডিজেল জেনারেটর (ডিজি-১ ও ডিজি-২) ও অক্সিলারি বয়লার',
    nameEn: 'Diesel Generators (DG-1, DG-2) & Aux Boiler Room',
    deckLevel: 'হোল্ড ডেক / ট্যাঙ্ক টপ (Deck 4 Aux Room)',
    locationTag: 'Diesel Generator 1 (DG-1)',
    posX: 33,
    posY: 62,
    isoX: 33,
    isoY: 64,
    topX: 33,
    topY: 50,
    overview: 'জাহাজের বিদ্যুৎ উৎপাদনকারী মূল ডিজেল জেনারেটর (ডিজি-১, ডিজি-২), প্রধান ৪০০ ভোল্ট মেইন সুইচবোর্ড (এমএসবি), অক্সিলারি স্টিম বয়লার ও ফুয়েল পিউরিফায়ার সেন্ট্রিফিউজ।',
    specifications: [
      { label: 'ডিজি সংখ্যা ও মডেল', value: '৪ x ৬৪০ কিলোওয়াট ক্যাটারপিলার/কামিন্স' },
      { label: 'উৎপাদিত বিদ্যুৎ', value: '৪১৫ ভোল্ট এসি, ৩ ফেজ, ৫০ হার্টজ' },
      { label: 'অক্সিলারি বয়লার প্রেসার', value: '৭ বার স্যাচুরেটেড স্টিম' }
    ],
    workshopsAssigned: [
      {
        workshopCode: 'WS-05',
        workshopNameBn: 'ইলেকট্রিক্যাল পাওয়ার শপ (Electrical Power Workshop)',
        workshopNameEn: 'Electrical Power Workshop',
        category: 'Electrical Power',
        oicRankAndName: 'Lt Commander T A Islam',
        phoneExt: '4205',
        tasks: [
          'অল্টারনেটর স্টেটর মেগার টেস্ট (>৫ MΩ), এভিআর লোড ড্রুপ রেগুলেশন ক্যালিব্রেশন।',
          'মেইন সুইচবোর্ড এসিবি (এয়ার সার্কিট ব্রেকার) ট্রিপ কার্ভ ও ওভারকারেন্ট রিলে টেস্ট।'
        ]
      },
      {
        workshopCode: 'WS-08',
        workshopNameBn: 'আইসি ইঞ্জিন ও ডিজেল শপ (IC Engine & Diesel Shop)',
        workshopNameEn: 'IC Engine & Diesel Shop',
        category: 'Propulsion & Diesel',
        oicRankAndName: 'Lt Commander M A Rahman',
        phoneExt: '4208',
        tasks: [
          'ডিজি ইঞ্জিনের লুব অয়েল কুলার ফ্ল্যাশিং ও কেমিক্যাল ক্লিনিং।',
          'ফুয়েল ইনজেক্টর নজল ও গভর্নর স্পিড ড্রুপ অ্যাডজাস্টমেন্ট।'
        ]
      },
      {
        workshopCode: 'WS-11',
        workshopNameBn: 'বয়লার ও স্টিম শপ (Boiler & Steam Shop)',
        workshopNameEn: 'Boiler & Steam Shop',
        category: 'Steam Systems',
        oicRankAndName: 'Lieutenant J Alam',
        phoneExt: '4211',
        tasks: [
          'অক্সিলারি বয়লার বার্নার জেট ক্লিনিং, ড্রাম স্কেল রিমুভাল ও ওয়াটার কেমিক্যাল ট্রিটমেন্ট।',
          'স্টিম সেফটি ভালভ হাইড্রোলিক পপিং প্রেসার টেস্ট (৭.৫ বার)।'
        ]
      },
      {
        workshopCode: 'WS-21',
        workshopNameBn: 'ব্যাটারি ও পাওয়ার স্টোরেজ শপ (Battery & Power Storage Shop)',
        workshopNameEn: 'Battery & Power Storage Shop',
        category: 'Power Systems',
        oicRankAndName: 'Lieutenant I Khandaker',
        phoneExt: '4221',
        tasks: [
          'ডিজি ২৪ ভোল্ট স্টার্টিং হেভি-ডিউটি ব্যাটারি ব্যাংক ক্যাপাসিটি লোড টেস্ট ও ডিসচার্জ সাইক্লিং।'
        ]
      },
      {
        workshopCode: 'WS-09',
        workshopNameBn: 'পাইপ ও প্লাম্বিং শপ (Pipe Fitting & Plumbing Shop)',
        workshopNameEn: 'Pipe Fitting & Plumbing Shop',
        category: 'Piping Systems',
        oicRankAndName: 'Lieutenant A K Azad',
        phoneExt: '4209',
        tasks: [
          'স্টিম পাইপলাইন থার্মাল ইনসুলেশন ক্ল্যাডিং ও বয়লার ব্লোडाउन ভালভ রিপ্লেসমেন্ট।'
        ]
      },
      {
        workshopCode: 'WS-14',
        workshopNameBn: 'ফাউন্ড্রি ও মেটাল কাস্টিং শপ (Foundry & Metal Casting Shop)',
        workshopNameEn: 'Foundry & Metal Casting Shop',
        category: 'Metal Casting',
        oicRankAndName: 'Lieutenant M Shafiq',
        phoneExt: '4214',
        tasks: [
          'বয়লার ফিড ওয়াটার পাম্প ব্রোঞ্জ ইম্পেলার ও কাস্ট আয়রন পাইপ ফ্ল্যাঞ্জ কাস্টিং সার্ভিসিং।'
        ]
      }
    ]
  },

  // =========================================================================
  // SEC-09: AC Chiller & Reverse Osmosis Fresh Water Plant
  // =========================================================================
  {
    id: 'sec-09',
    code: 'SEC-09',
    nameBn: 'এসি চিলার ও ফ্রেশ ওয়াটার আরও প্ল্যান্ট',
    nameEn: 'AC Chiller & Reverse Osmosis Fresh Water Plant',
    deckLevel: 'ডেক ৩ (Technical Auxiliary Flat)',
    locationTag: 'AC Chiller & Fresh Water Plant',
    posX: 70,
    posY: 60,
    isoX: 68,
    isoY: 62,
    topX: 70,
    topY: 50,
    overview: 'জাহাজের সেন্ট্রাল মেরিন এয়ার কন্ডিশনিং চিলার ইউনিট, ফ্রেশ ওয়াটার রিভার্স অসমোসিস (আরও) ডিস্যালিনেশন প্ল্যান্ট, পোর্টেবল ওয়াটার ডিস্ট্রিবিউশন পাম্প ও কোল্ড প্রভিশন স্টোরেজ।',
    specifications: [
      { label: 'চিলার ক্যাপাসিটি', value: '২ x ১৫০ টন সেন্ট্রিফিউগাল রেফ্রিজারেশন' },
      { label: 'আরও প্ল্যান্ট আউটপুট', value: '৪০ টন বিশুদ্ধ মিষ্টি পানি প্রতিদিন' },
      { label: 'কোল্ড রুম তাপমাত্রা', value: '-১৮ ডিগ্রি সেলসিয়াস (ডিপ ফ্রিজ)' }
    ],
    workshopsAssigned: [
      {
        workshopCode: 'WS-18',
        workshopNameBn: 'রেফ্রিজারেশন ও এইচভিএসি শপ (Refrigeration & HVAC Shop)',
        workshopNameEn: 'Refrigeration & HVAC Shop',
        category: 'HVAC Systems',
        oicRankAndName: 'Lieutenant G Mostafa',
        phoneExt: '4218',
        tasks: [
          'চিলার কম্প্রেশার সিলিন্ডার হেড সার্ভিসিং ও ফ্রেয়ন গ্যাস লিক ডিটেকশন টেস্ট।',
          'ইভাপোরেটর কয়েল কেমিক্যাল ডিস্কেলিং ও এক্সপ্যানশন ভালভ সুপারহিট ক্যালিব্রেশন।'
        ]
      },
      {
        workshopCode: 'WS-09',
        workshopNameBn: 'পাইপ ও প্লাম্বিং শপ (Pipe Fitting & Plumbing Shop)',
        workshopNameEn: 'Pipe Fitting & Plumbing Shop',
        category: 'Piping Systems',
        oicRankAndName: 'Lieutenant A K Azad',
        phoneExt: '4209',
        tasks: [
          'আরও প্ল্যান্ট হাই-প্রেসার ব্রাইন রিভার্স লাইন ও ফিল্টার হাউজিং ও-রিং রিপ্লেসমেন্ট।',
          'পোর্টেবল ওয়াটার ডিস্ট্রিবিউশন কপার পাইপলাইন সোল্ডারিং ও হাইড্রোস্ট্যাটিক টেস্ট।'
        ]
      },
      {
        workshopCode: 'WS-05',
        workshopNameBn: 'ইলেকট্রিক্যাল পাওয়ার শপ (Electrical Power Workshop)',
        workshopNameEn: 'Electrical Power Workshop',
        category: 'Electrical Power',
        oicRankAndName: 'Lt Commander T A Islam',
        phoneExt: '4205',
        tasks: [
          'চিলার পাম্প মোটর ড্রাইভার স্টার্টার ও অটো-কাট অফ কন্ট্রোল সার্কিট মেরামত।'
        ]
      },
      {
        workshopCode: 'WS-02',
        workshopNameBn: 'মেশিন শপ (Machine Shop)',
        workshopNameEn: 'Machine Shop',
        category: 'Mechanical Precision',
        oicRankAndName: 'Lt Commander M Zaman',
        phoneExt: '4202',
        tasks: [
          'চিলার ওয়াটার পাম্প শ্যাফট মেশিনিং ও ব্রোঞ্জ ইম্পেলার মেকানিক্যাল সিল ল্যাপিং।'
        ]
      },
      {
        workshopCode: 'WS-20',
        workshopNameBn: 'ইলেক্ট্রোপ্লেটিং ও গ্যালভানাইজিং শপ (Electroplating & Galvanizing Shop)',
        workshopNameEn: 'Electroplating & Galvanizing Shop',
        category: 'Surface Treatment',
        oicRankAndName: 'Lieutenant M Rafiq',
        phoneExt: '4220',
        tasks: [
          'স্যানিটারি পাইপিং ও ভালভ কম্পোনেন্টসে নিকেল-জিঙ্ক কোটিং প্রটেকশন প্রয়োগ।'
        ]
      }
    ]
  },

  // =========================================================================
  // SEC-10: Flight Deck & Helicopter Landing Station (Helipad)
  // =========================================================================
  {
    id: 'sec-10',
    code: 'SEC-10',
    nameBn: 'ফ্লাইট ডেক, হ্যাঙ্গার ও হেলিপ্যাড স্টেশন',
    nameEn: 'Flight Deck & Helicopter Landing Station (Helipad)',
    deckLevel: 'ফ্লাইট ডেক / হ্যাঙ্গার ডেক (Aft Deck 01)',
    locationTag: 'Flight Deck & Quarter Deck',
    posX: 20,
    posY: 44,
    isoX: 18,
    isoY: 48,
    topX: 20,
    topY: 50,
    overview: 'এডভান্সড নেভাল হেলিকপ্টার ট্রাভার্সিং গ্রিড, এভিয়েশন রিফুয়েলিং সিস্টেম, ফোল্ডিং হ্যাঙ্গার ডোর, হেভি টাই-ডাউন ল্যাশিংস, ফ্লাইট ডেক নন-স্কিড পেইন্টিং ও কোয়ার্টার ডেক মুরিং জোন।',
    specifications: [
      { label: 'হেলো ক্যাপাসিটি', value: 'এডব্লিউ১০৯ / ডলফিন ১০ টন ক্যাটাগরি' },
      { label: 'ট্রাভার্সিং সিস্টেম', value: 'হাইড্রো-মেকানিক্যাল গ্রিড অ্যান্ড হারপুন' },
      { label: 'ল্যান্ডিং সার্কেল সাইজ', value: '১৫.২ মিটার ডায়ামিটার' }
    ],
    workshopsAssigned: [
      {
        workshopCode: 'WS-01',
        workshopNameBn: 'রিগিং শপ (Rigging Shop)',
        workshopNameEn: 'Rigging Shop',
        category: 'Deck & Lifting Gear',
        oicRankAndName: 'SAKIB HOSEN (OFFICE WRITER)',
        phoneExt: '8116',
        tasks: [
          'হেলিকপ্টার টাই-ডাউন ল্যাশিং চেইন ও কুইক রিলিজ পেলিক্যান হুক প্রুফ টেস্ট।',
          'ফ্লাইট ডেক পেরিমিটার সেফটি ড্রপ-নেট কেবলস ও হ্যাঙ্গার ওভারহেড হোইস্ট ওয়্যার চেক।'
        ]
      },
      {
        workshopCode: 'WS-10',
        workshopNameBn: 'পেইন্টিং ও প্রিজারভেশন শপ (Painting & Preservation Shop)',
        workshopNameEn: 'Painting & Preservation Shop',
        category: 'Coating & Protection',
        oicRankAndName: 'Lieutenant R Ahmed',
        phoneExt: '4210',
        tasks: [
          'ফ্লাইট ডেক হেভি নন-স্কিড কোটিং এপ্লিকেশন ও হেলো ল্যান্ডিং ট্যাকটিক্যাল মার্কিং রি-পেইন্টিং।',
          'হ্যাঙ্গার ফ্লোর ও অ্যাফট ড্রেন চ্যানেল অ্যান্টি-করোসিভ পলিউরেথেন পেইন্টিং।'
        ]
      },
      {
        workshopCode: 'WS-19',
        workshopNameBn: 'হাইড্রোলিক ও নিউমেটিক শপ (Hydraulic & Pneumatic Shop)',
        workshopNameEn: 'Hydraulic & Pneumatic Shop',
        category: 'Fluid Power',
        oicRankAndName: 'Lt Commander H Hasan',
        phoneExt: '4219',
        tasks: [
          'হ্যাঙ্গার রোলিং ডোর হাইড্রোলিক অ্যাকচুয়েটর ও ট্রাভার্সিং উইঞ্চ মোটর সিলিং টেস্ট।'
        ]
      },
      {
        workshopCode: 'WS-13',
        workshopNameBn: 'সেইল লফট ও সারভাইভাল ইকুইপমেন্ট শপ (Sail Loft & Survival Equipment Shop)',
        workshopNameEn: 'Sail Loft & Survival Equipment Shop',
        category: 'Life Saving Equipment',
        oicRankAndName: 'Sub-Lieutenant P K Roy',
        phoneExt: '4213',
        tasks: [
          'হেলিকপ্টার ক্র্যাশ রেসকিউ ফায়ার স্যুট, থার্মাল প্রোটেকশন কম্বল ও উইন্ডসক চেক।'
        ]
      },
      {
        workshopCode: 'WS-15',
        workshopNameBn: 'শিপরাইট ও কার্পেন্ট্রি শপ (Shipwright & Carpentry Shop)',
        workshopNameEn: 'Shipwright & Carpentry Shop',
        category: 'Docking & Woodwork',
        oicRankAndName: 'Lieutenant N Talukdar',
        phoneExt: '4215',
        tasks: [
          'হ্যাঙ্গার ইন্টেরিয়র টিম্বার চক ব্লকস ও কম্পোজিট ওয়াটারটাইট গ্যাসকেট প্রতিস্থাপন।'
        ]
      },
      {
        workshopCode: 'WS-27',
        workshopNameBn: 'ইয়ার্ড সার্ভিসেস ও হেভি ট্রান্সপোর্ট (Yard Services & Heavy Transport)',
        workshopNameEn: 'Yard Services & Heavy Transport',
        category: 'Yard Logistics',
        oicRankAndName: 'Lieutenant R U Ahmed',
        phoneExt: '4227',
        tasks: [
          'ফ্লাইট ডেক মোবাইল ক্রেন লিফটিং ও ডকইয়ার্ড হেভি গ্রাউন্ড সাপোর্ট ইকুইপমেন্ট সার্ভিস।'
        ]
      }
    ]
  },

  // =========================================================================
  // SEC-11: Stern, Twin Propellers & Steering Gear Compartment
  // =========================================================================
  {
    id: 'sec-11',
    code: 'SEC-11',
    nameBn: 'স্টার্ন, প্রপেলার শ্যাফটিং ও স্টিয়ারিং গিয়ার',
    nameEn: 'Stern, Twin Propellers & Steering Gear Compartment',
    deckLevel: 'স্টার্ন ডেক ৪ / আফটারপিক (Stern Flat)',
    locationTag: 'Steering Gear & Propellers',
    posX: 9,
    posY: 60,
    isoX: 8,
    isoY: 62,
    topX: 9,
    topY: 50,
    overview: 'জাহাজের স্টার্ন টুইন প্রপেলার, কাটলেস বেয়ারিং, স্টার্ন টিউব সিল, ইলেকট্রো-হাইড্রোলিক স্টিয়ারিং গিয়ার র‍্যাম ও ব্যালেন্সড রাডার মেকানিজম।',
    specifications: [
      { label: 'প্রপেলার টাইপ', value: 'টুইন ৪-ব্লেড কন্ট্রোল্ড পিচ নিকেল-অ্যালুমিনিয়াম ব্রোঞ্জ' },
      { label: 'রাডার সিস্টেম', value: 'টুইন ব্যালেন্সড স্পেড রাডার উইথ হাইড্রোলিক রাম' },
      { label: 'স্টিয়ারিং প্রেসার', value: '১৬০ বার ডাবল অ্যাক্টিং হাইড্রোলিক প্রেসার' }
    ],
    workshopsAssigned: [
      {
        workshopCode: 'WS-26',
        workshopNameBn: 'প্রপেলার ও শ্যাফট অ্যালাইনমেন্ট শপ (Propeller & Shaft Alignment Shop)',
        workshopNameEn: 'Propeller & Shaft Alignment Shop',
        category: 'Propulsion Drive',
        oicRankAndName: 'Lt Commander S N Shikdar',
        phoneExt: '4226',
        tasks: [
          'টেইলশ্যাফট ডায়নামিক ব্যালেন্সিং, স্টার্ন টিউব কাটলেস বিয়ারিং ক্লিয়ারেন্স মেজারমেন্ট।',
          'কন্ট্রোলেবল পিচ প্রপেলার (সিপিপি) ব্লেড পিচ অ্যাকচুয়েটর মেকানিজম সার্ভিসিং।'
        ]
      },
      {
        workshopCode: 'WS-19',
        workshopNameBn: 'হাইড্রোলিক ও নিউমেটিক শপ (Hydraulic & Pneumatic Shop)',
        workshopNameEn: 'Hydraulic & Pneumatic Shop',
        category: 'Fluid Power',
        oicRankAndName: 'Lt Commander H Hasan',
        phoneExt: '4219',
        tasks: [
          'ইলেক্ট্রো-হাইড্রোলিক স্টিয়ারিং গিয়ার রাম সিলিং কিট রিপ্লেসমেন্ট ও প্রেসার রিলিফ টেস্ট।',
          'টেলিমোটর হাইড্রোলিক ট্রান্সমিটার পাম্প ও রাডার অ্যাঙ্গেল ইন্ডিকেটর ক্যালিব্রেশন।'
        ]
      },
      {
        workshopCode: 'WS-12',
        workshopNameBn: 'গ্যাস টারবাইন ও প্রপালশন শপ (Gas Turbine & Propulsion Shop)',
        workshopNameEn: 'Gas Turbine & Propulsion Shop',
        category: 'Main Propulsion',
        oicRankAndName: 'Lt Commander D K Banik',
        phoneExt: '4212',
        tasks: [
          'শ্যাফট থ্রাস্ট বিয়ারিং প্যাড পরিদর্শন ও বাল্কহেড গ্ল্যান্ড সিমিট্রি চেক।'
        ]
      },
      {
        workshopCode: 'WS-02',
        workshopNameBn: 'মেশিন শপ (Machine Shop)',
        workshopNameEn: 'Machine Shop',
        category: 'Mechanical Precision',
        oicRankAndName: 'Lt Commander M Zaman',
        phoneExt: '4202',
        tasks: [
          'রাডার পিন্টল বুশিং প্রিসিশন বোরিং ও কাপলিং বোল্টস লেদ টার্নিং।'
        ]
      },
      {
        workshopCode: 'WS-14',
        workshopNameBn: 'ফাউন্ড্রি ও মেটাল কাস্টিং শপ (Foundry & Metal Casting Shop)',
        workshopNameEn: 'Foundry & Metal Casting Shop',
        category: 'Metal Casting',
        oicRankAndName: 'Lieutenant M Shafiq',
        phoneExt: '4214',
        tasks: [
          'ব্রোঞ্জ প্রপেলার ব্লেড ক্যাভিটেশন ড্যামেজ কাস্টিং রিপেয়ার ও স্টার্ন টিউব গ্ল্যান্ড রিং তৈরি।'
        ]
      },
      {
        workshopCode: 'WS-16',
        workshopNameBn: 'টুল রুম ও প্রিসিশন শপ (Tool Room & Precision Shop)',
        workshopNameEn: 'Tool Room & Precision Shop',
        category: 'Tooling & Gauges',
        oicRankAndName: 'Lieutenant S Ahmed',
        phoneExt: '4216',
        tasks: [
          'শ্যাফট রান-আউট অপটিক্যাল ডায়াল গেজেস ক্যালিব্রেশন ও টেপার প্লাগ গেজ ইন্সপেকশন।'
        ]
      }
    ]
  },

  // =========================================================================
  // SEC-12: Underwater Hull Plating, Sea Chests & Cathodic Protection
  // =========================================================================
  {
    id: 'sec-12',
    code: 'SEC-12',
    nameBn: 'আন্ডারওয়াটার হাল প্লেটিং, সি-চেস্ট ও জিংক অ্যানোড',
    nameEn: 'Underwater Hull Plating, Sea Chests & Cathodic Protection',
    deckLevel: 'সাব-ওয়াটারলাইন হাল ও কিল (Underwater Hull & Keel)',
    locationTag: 'Hull, Keel & Underwater Hull',
    posX: 52,
    posY: 80,
    isoX: 52,
    isoY: 82,
    topX: 52,
    topY: 50,
    overview: 'ড্রাইডকে অবস্থানরত অবস্থায় জাহাজের তলদেশ, কিল প্লেট, পোর্ট ও স্টারবোর্ড সি-চেস্ট ছাঁকনি, আন্ডারওয়াটার স্যাক্রিফিশিয়াল জিংক অ্যানোড এবং অ্যান্টি-ফাউলিং কোটিং প্রটেকশন।',
    specifications: [
      { label: 'প্লেট স্টিল গ্রেড', value: 'গ্রেড এ নেভাল হাই-টেনসাইল স্টিল (১০-১৪ মিমি)' },
      { label: 'ক্যাথোডিক অ্যানোড', value: '১২০টি হাই-পিউরিটি জিংক অ্যানোড ব্লক' },
      { label: 'সি-চেস্ট সংখ্যা', value: '৮টি সাকশন ও কুলিং সি-চেস্ট উইথ গ্রিড' }
    ],
    workshopsAssigned: [
      {
        workshopCode: 'WS-03',
        workshopNameBn: 'হাল ও স্ট্রাকচারাল শপ (Hull & Structural Shop)',
        workshopNameEn: 'Hull & Structural Shop',
        category: 'Hull Structure',
        oicRankAndName: 'Lieutenant N Chowdhury',
        phoneExt: '4203',
        tasks: [
          'আন্ডারওয়াটার হাল প্লেট আল্ট্রাসনিক থিকনেস গজ (ইউটিজি) রিডিং ও ড্রাইভ ডকিং মাপজোখ।',
          'সি-চেস্ট ইনটেক গ্রিল ক্লিনিং, কিল স্ট্রেইটনেস লেভেলিং ও বাল্কহেড স্ট্রেংথ অডিট।'
        ]
      },
      {
        workshopCode: 'WS-10',
        workshopNameBn: 'পেইন্টিং ও প্রিজারভেশন শপ (Painting & Preservation Shop)',
        workshopNameEn: 'Painting & Preservation Shop',
        category: 'Coating & Protection',
        oicRankAndName: 'Lieutenant R Ahmed',
        phoneExt: '4210',
        tasks: [
          'তলদেশের বায়ো-ফাউলিং ও বার্নাকল গ্রিট ব্লাস্টিং (SA 2.5) দ্বারা নিখুঁত পরিষ্কার।',
          'সেলফ-পলিসিং কপার-ফ্রি অ্যান্টি-ফাউলিং কোটিং এবং বুট-টপিং ওয়াটারলাইন পেইন্টিং।'
        ]
      },
      {
        workshopCode: 'WS-22',
        workshopNameBn: 'আন্ডারওয়াটার রিপেয়ার ও ডাইভিং ইউনিট (Underwater Repairs & Diving Unit)',
        workshopNameEn: 'Underwater Repairs & Diving Unit',
        category: 'Subsea Operations',
        oicRankAndName: 'Lt Commander T Mahmud',
        phoneExt: '4222',
        tasks: [
          'ডাইভার্স পানির নিচে সিসিটিভি ভিডিও ইন্সপেকশন, সি-চেস্ট ক্লিয়ারিং ও ওয়েট ওয়েল্ডিং টেস্ট।'
        ]
      },
      {
        workshopCode: 'WS-20',
        workshopNameBn: 'ইলেক্ট্রোপ্লেটিং ও গ্যালভানাইজিং শপ (Electroplating & Galvanizing Shop)',
        workshopNameEn: 'Electroplating & Galvanizing Shop',
        category: 'Surface Treatment',
        oicRankAndName: 'Lieutenant M Rafiq',
        phoneExt: '4220',
        tasks: [
          'স্যাক্রিফিশিয়াল জিংক অ্যানোড ব্লক প্রতিস্থাপন ও আইসিসিপি রেফারেন্স ইলেক্ট্রোড ক্যালিব্রেশন।'
        ]
      },
      {
        workshopCode: 'WS-15',
        workshopNameBn: 'শিপরাইট ও কার্পেন্ট্রি শপ (Shipwright & Carpentry Shop)',
        workshopNameEn: 'Shipwright & Carpentry Shop',
        category: 'Docking & Woodwork',
        oicRankAndName: 'Lieutenant N Talukdar',
        phoneExt: '4215',
        tasks: [
          'ড্রাইডক কিল ব্লক ও বিল্জ ব্লক টিম্বার পজিশনিং ও আন্ডারওয়াটার ডকিং প্লাগ চেক।'
        ]
      },
      {
        workshopCode: 'WS-25',
        workshopNameBn: 'কোয়ালিটি কন্ট্রোল ও এনডিটি ল্যাব (Quality Control & NDT Lab)',
        workshopNameEn: 'Quality Control & NDT Lab',
        category: 'Quality Assurance',
        oicRankAndName: 'Lt Commander M K Chowdhury',
        phoneExt: '4225',
        tasks: [
          'তলদেশের ওয়েল্ডিং সীমে ম্যাগনেটিক পার্টিকেল ইন্সপেকশন (MPI) ও হাল প্লেট এক্স-রে।'
        ]
      }
    ]
  }
];
