import { ProductionUnitItem } from '../types';

export const DGM_CONFIG = [
  {
    id: 'dgm_hull',
    code: 'DGM (H&M)',
    dgmTitleEn: 'Deputy General Manager (Hull and Miscellaneous)',
    dgmTitleBn: 'Deputy General Manager (Hull and Miscellaneous)',
    category: 'hull' as const,
    accentColor: 'border-blue-500/50',
    badgeBg: 'bg-blue-500/15',
    badgeBorder: 'border-blue-400/40',
    textColor: 'text-blue-300',
    summaryEn: 'Supervises warship structural integrity, hull plating renewal, underwater coatings, liferafts, rigging, and naval boat building.'
  },
  {
    id: 'dgm_mech',
    code: 'DGM (MECH)',
    dgmTitleEn: 'Deputy General Manager (Mechanical)',
    dgmTitleBn: 'Deputy General Manager (Mechanical)',
    category: 'mechanical' as const,
    accentColor: 'border-amber-500/50',
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-400/40',
    textColor: 'text-amber-300',
    summaryEn: 'Oversees main propulsion engines, gas turbines, diesel generators, auxiliary piping, machine shops, and shaft alignments.'
  },
  {
    id: 'dgm_we',
    code: 'DGM (W&E)',
    dgmTitleEn: 'Deputy General Manager (Weapon & Electrical)',
    dgmTitleBn: 'Deputy General Manager (Weapon & Electrical)',
    category: 'weapon_electrical' as const,
    accentColor: 'border-cyan-500/50',
    badgeBg: 'bg-cyan-500/15',
    badgeBorder: 'border-cyan-400/40',
    textColor: 'text-cyan-300',
    summaryEn: 'Directs marine power generation, main switchboards, electric motors, naval radar sensors, gyrocompasses, and communications.'
  },
  {
    id: 'dgm_ord',
    code: 'DGM (ORD)',
    dgmTitleEn: 'Deputy General Manager (Ordnance)',
    dgmTitleBn: 'Deputy General Manager (Ordnance)',
    category: 'ordnance' as const,
    accentColor: 'border-red-500/50',
    badgeBg: 'bg-red-500/15',
    badgeBorder: 'border-red-400/40',
    textColor: 'text-red-300',
    summaryEn: 'Responsible for naval artillery gun mounts, missile launchers, torpedo tubes, anti-submarine weapons, and hydraulic servo controls.'
  },
  {
    id: 'dgm_sr',
    code: 'DGM (SR)',
    dgmTitleEn: 'Deputy General Manager (Ship Repair)',
    dgmTitleBn: 'Deputy General Manager (Ship Repair)',
    category: 'ship_repair' as const,
    accentColor: 'border-emerald-500/50',
    badgeBg: 'bg-emerald-500/15',
    badgeBorder: 'border-emerald-400/40',
    textColor: 'text-emerald-300',
    summaryEn: 'Coordinates overall warship drydocking, harbour and sea acceptance trials (HAT/SAT), yard safety, and slipway operations.'
  }
];

export const DEFAULT_PRODUCTION_UNITS: ProductionUnitItem[] = [
  // =========================================================================
  // 1. DGM (HULL & MISCELLANEOUS) - DGM (H&M)
  // =========================================================================
  {
    id: 'ws_01_rigging_shop',
    titleEn: 'WS-01 Rigging Shop (Rigging Shop)',
    titleBn: 'রিগিং শপ (Rigging Shop)',
    roleTitle: 'Officer-in-Charge (Rigging Shop)',
    workshopCode: 'WS-01',
    category: 'hull',
    officerDesignation: 'SAKIB HOSEN (OFFICE WRITER) / Officer-in-Charge',
    scopeBn: 'মেরিন স্টিল ওয়্যার রোপ, ডেক ক্রেন, ক্যাবল, হোইস্টিং গিয়ার, স্লিংস ও লিফটিং সরঞ্জামের মেরামত ও প্রুফ-লোড টেস্টিং।',
    responsibilities: [
      'Warship steel wire ropes, mooring cables, and crane slings proof-load tensile testing',
      'Hydraulic swaging of heavy wire thimbles, shackles, and mechanical socket fittings',
      'Deck hoisting davits, accommodation ladder winches, and cargo lifting gear servicing',
      'Periodic load testing, wire renewal certifications, and safety inspections'
    ],
    keyEquipments: ['50-Ton Wire Rope Swaging Press', 'Tensile Proof Load Test Bench', 'Hydraulic Cable Splicing Rig', 'Optical Defect Inspection Bench'],
    locationInYard: 'Deck & Rigging Facility (North Yard)',
    phoneExt: 'Dockyard Ext: 8116'
  },
  {
    id: 'ws_03_hull_structural',
    titleEn: 'WS-03 Hull & Structural Shop',
    titleBn: 'হাল ও স্ট্রাকচারাল শপ (Hull & Structural)',
    roleTitle: 'Officer-in-Charge (Hull & Structural)',
    workshopCode: 'WS-03',
    category: 'hull',
    officerDesignation: 'Lieutenant N Chowdhury, BN',
    scopeBn: 'যুদ্ধজাহাজের মূল বহিরাবরণ, স্টিল প্লেট রিনিউয়াল, বাল্কহেড, ফ্রেম ও কাঠামোগত অখণ্ডতা নিশ্চিতকরণ।',
    responsibilities: [
      'Hull plate inspection and steel renewal based on ultrasonic thickness gauging (UTG)',
      'Fabrication of double bottom frames, collision bulkheads, and watertight keel structures',
      'Drydock hull shell plate curving, flame gouging, and insert plate fitting',
      'Compartment air pressure boundary testing and watertight integrity verification'
    ],
    keyEquipments: ['Heavy Hydraulic Plate Bending Roller', 'CNC Gantry Plasma Cutter', 'Hydraulic Guillotine Shears', 'Submerged Arc Welding Boom'],
    locationInYard: 'Hull Fabrication Shed Block-1',
    phoneExt: 'Dockyard Ext: 4203'
  },
  {
    id: 'ws_04_welding_fabrication',
    titleEn: 'WS-04 Welding & Fabrication Shop',
    titleBn: 'ওয়েল্ডিং ও ফেব্রিকেশন শপ (Welding & Fabrication)',
    roleTitle: 'Officer-in-Charge (Welding & Fabrication)',
    workshopCode: 'WS-04',
    category: 'hull',
    officerDesignation: 'Lieutenant K R Hasan, BN',
    scopeBn: 'নৌবাহিনীর বিশেষ গ্রেড স্টিল, অ্যালুমিনিয়াম সুপারস্ট্রাকচার ও প্রেশার ভেসেলের TIG/MIG ও আর্ক ওয়েল্ডিং।',
    responsibilities: [
      'X-ray and ultrasonic quality butt and fillet welding on naval high-tensile steels',
      'TIG/MIG welding on aluminum mast structures, funnels, and superstructures',
      'High-pressure steam pipes and fuel line joint preheating and post-weld heat treatment',
      'Naval certified welding procedures and Lloyd’s qualification testing'
    ],
    keyEquipments: ['Inverter Pulse MIG/MAG Sets', 'AC/DC TIG Multi-Process Welders', 'Orbital Pipe Welding Station', 'Preheating Induction Coils'],
    locationInYard: 'Central Welding Complex Bay-2',
    phoneExt: 'Dockyard Ext: 4204'
  },
  {
    id: 'ws_10_painting_preservation',
    titleEn: 'WS-10 Painting & Preservation Shop',
    titleBn: 'পেইন্টিং ও প্রিজারভেশন শপ (Painting & Preservation)',
    roleTitle: 'Officer-in-Charge (Painting & Preservation)',
    workshopCode: 'WS-10',
    category: 'hull',
    officerDesignation: 'Lieutenant R Ahmed, BN',
    scopeBn: 'গ্রিট ও স্যান্ড ব্লাস্টিং, অ্যান্টি-ফাউলিং আন্ডারওয়াটার কোটিং ও মেরিন সারফেস ক্ষয়রোধী সংরক্ষণ।',
    responsibilities: [
      'High-pressure drydock hull grit blasting to SA 2.5 Swedish cleanliness standard',
      'Application of multi-coat epoxy primer and anti-fouling underwater hull barrier systems',
      'Fuel, lube oil, and fresh water tank internal sandblasting and food-grade coating',
      'Digital Dry Film Thickness (DFT) measurement and climate condition compliance monitoring'
    ],
    keyEquipments: ['Airless Spray Painting Rigs', 'Grit Blasting Hopper Units', 'Digital Dry Film Thickness (DFT) Gauges', 'Industrial Dehumidifiers'],
    locationInYard: 'Drydock Preservation Facility',
    phoneExt: 'Dockyard Ext: 4210'
  },
  {
    id: 'ws_13_sail_loft_survival',
    titleEn: 'WS-13 Sail Loft & Survival Equipment Shop',
    titleBn: 'সেইল লফট ও সারভাইভাল ইকুইপমেন্ট শপ (Sail Loft & LSE)',
    roleTitle: 'Officer-in-Charge (Sail Loft & LSE)',
    workshopCode: 'WS-13',
    category: 'hull',
    officerDesignation: 'Sub-Lieutenant P K Roy, BN',
    scopeBn: 'ইনফ্লেটেবল লাইফ র‍্যাফ্ট, ওয়েদার ক্যানভাস কভার, সি-রেসকিউ গিয়ার ও সার্ভাইভাল স্যুট ওভারহলিং।',
    responsibilities: [
      'Annual inspection, pressure cylinder hydrostatic testing, and packing of SOLAS life rafts',
      'Manufacture and repair of specialized weather awnings, blast covers, and gun shrouds',
      'Life jackets, immersion suits, and emergency survival pack repacking and validation',
      'Hydrostatic release units (HRU) date-stamping and operational clearance'
    ],
    keyEquipments: ['Life Raft Pressure Inflation Test Bench', 'Heavy Duty Industrial Sewing Machines', 'Hydrostatic Relief Valve Test Rig'],
    locationInYard: 'Sail Loft & Survival Complex',
    phoneExt: 'Dockyard Ext: 4213'
  },
  {
    id: 'ws_15_shipwright_carpentry',
    titleEn: 'WS-15 Shipwright & Carpentry Shop',
    titleBn: 'শিপরাইট ও কার্পেন্ট্রি শপ (Shipwright & Carpentry)',
    roleTitle: 'Officer-in-Charge (Shipwright & Carpentry)',
    workshopCode: 'WS-15',
    category: 'hull',
    officerDesignation: 'Lieutenant N Talukdar, BN',
    scopeBn: 'ড্রাইডক কিল ব্লক অ্যালাইনমেন্ট, শোরিং, টিম্বার স্টেজিং ও জাহাজের ইন্টেরিয়র কাঠমিস্ত্রি কাজ।',
    responsibilities: [
      'Keel block height calculation, positioning, and side shoring alignment for warship docking',
      'Warship bridge teak decking, furniture, and internal acoustic insulation installation',
      'Drydock wooden wedges, cribbing blocks, and safe gangway timber fabrication',
      'Glass Reinforced Plastic (GRP) and composite repair on ship internal joinery'
    ],
    keyEquipments: ['Heavy Timber Band Saws', 'Universal Wood Planers & Thicknessers', 'Optical Docking Alignment Theodolite'],
    locationInYard: 'Shipwright Yard & Timber Complex',
    phoneExt: 'Dockyard Ext: 4215'
  },
  {
    id: 'ws_20_electroplating_galvanizing',
    titleEn: 'WS-20 Electroplating & Galvanizing Shop',
    titleBn: 'ইলেক্ট্রোপ্লেটিং ও গ্যালভানাইজিং শপ (Electroplating & Galvanizing)',
    roleTitle: 'Officer-in-Charge (Electroplating & Galvanizing)',
    workshopCode: 'WS-20',
    category: 'hull',
    officerDesignation: 'Lieutenant M Rafiq, BN',
    scopeBn: 'হার্ড ক্রোম প্লেটিং, জিংক গ্যালভানাইজিং ও অ্যানোড ক্ষয়রোধী পৃষ্ঠ চিকিৎসা।',
    responsibilities: [
      'Hard chrome electroplating on hydraulic cylinder rods, valve spindles, and pump shafts',
      'Hot-dip zinc galvanizing of shipboard exposed pipe brackets, ladders, and cable trays',
      'Cathodic protection sacrificial zinc and aluminum hull anode quality inspection and testing',
      'Chemical degreasing, acid pickling, and precision electro-chemical bath balancing'
    ],
    keyEquipments: ['Industrial Electroplating Rectifiers', 'Galvanizing Dip Tanks', 'Coating Thickness Magnetic Gauges', 'Effluent Neutralization Plant'],
    locationInYard: 'Surface Treatment & Chemical Bay',
    phoneExt: 'Dockyard Ext: 4220'
  },

  // =========================================================================
  // 2. DGM (MECHANICAL) - DGM (MECH)
  // =========================================================================
  {
    id: 'ws_02_machine_shop',
    titleEn: 'WS-02 Machine Shop',
    titleBn: 'মেশিন শপ (Machine Shop)',
    roleTitle: 'Officer-in-Charge (Machine Shop)',
    workshopCode: 'WS-02',
    category: 'mechanical',
    officerDesignation: 'Lt Commander M Zaman, BN',
    scopeBn: 'প্রিসিশন লেদ টার্নিং, ভারী মিলিং, গিয়ার হববরিং, বোরিং ও মেকানিক্যাল যন্ত্রাংশ তৈরি।',
    responsibilities: [
      'Turning and precision machining of propeller shafts, rudder stocks, and valve stems',
      'Manufacturing of custom splined gears, flanges, couplings, and seawater pump impellers',
      'Refurbishing worn shaft sleeves via specialized metal spraying and cylindrical grinding',
      'Re-metalling and line-boring of heavy marine split journal bearings'
    ],
    keyEquipments: ['12-Meter Heavy Duty Engine Lathe', 'Universal Milling Machines', 'Horizontal Boring Rig', 'CNC Machining Center'],
    locationInYard: 'Central Machine Shop Bay-1',
    phoneExt: 'Dockyard Ext: 4202'
  },
  {
    id: 'ws_08_diesel_engine_shop',
    titleEn: 'WS-08 IC Engine & Diesel Shop',
    titleBn: 'আইসি ইঞ্জিন ও ডিজেল শপ (IC Engine & Diesel)',
    roleTitle: 'Officer-in-Charge (IC Engine & Diesel)',
    workshopCode: 'WS-08',
    category: 'mechanical',
    officerDesignation: 'Lt Commander M A Rahman, BN',
    scopeBn: 'প্রধান প্রপালশন ডিজেল ইঞ্জিন (Pielstick, MTU, MAN) এবং অক্জিলিয়ারি জেনারেটর ইঞ্জিনের সম্পূর্ণ ওভারহলিং।',
    responsibilities: [
      'Cylinder head decarb, valve grinding, seat refacing, and hydrostatic pressure testing',
      'Piston ring renewal, connecting rod big-end bearing clearance inspection, and liner honing',
      'Fuel injection pump calibration, nozzle spray pattern testing, and pop pressure setting',
      'Engine shop test-bed trials on hydraulic dynamometer under graduated full-power load'
    ],
    keyEquipments: ['Engine Dynamometer Test Bed', 'Automated Fuel Injector Test Bench', 'Cylinder Liner Honing Machine', 'Ultrasonic Parts Cleaning Bath'],
    locationInYard: 'Heavy Mechanical Complex Block-A',
    phoneExt: 'Dockyard Ext: 4208'
  },
  {
    id: 'ws_09_pipe_fitting_shop',
    titleEn: 'WS-09 Pipe Fitting & Plumbing Shop',
    titleBn: 'পাইপ ফিটিং ও প্লাম্বিং শপ (Pipe Fitting & Plumbing)',
    roleTitle: 'Officer-in-Charge (Pipe Fitting & Plumbing)',
    workshopCode: 'WS-09',
    category: 'mechanical',
    officerDesignation: 'Lieutenant A K Azad, BN',
    scopeBn: 'হাই-প্রেসার সি-ওয়াটার কুলিং, বিলজ, ব্যালাস্ট, ফুয়েল অয়েল ও ফায়ার ফাইটিং পাইপলাইন সিস্টেম।',
    responsibilities: [
      'Cupro-nickel (Cu-Ni 90/10) and marine grade stainless steel pipe spool prefabrication and bending',
      'Chemical pickling, passivation, and hydrostatic pressure testing of marine piping networks',
      'Overhaul and lapping of bronze sea-chest valves, storm valves, and safety relief valves',
      'Piping installation onboard warship machinery spaces during drydock refits'
    ],
    keyEquipments: ['CNC Mandrel Pipe Bending Machine', 'Hydrostatic Test Pumps (up to 400 Bar)', 'Flange Orbital Welder', 'Chemical Pickling Tanks'],
    locationInYard: 'Piping & Fabrication Facility',
    phoneExt: 'Dockyard Ext: 4209'
  },
  {
    id: 'ws_11_boiler_steam_shop',
    titleEn: 'WS-11 Boiler & Steam Shop',
    titleBn: 'বয়লার ও স্টিম শপ (Boiler & Steam Shop)',
    roleTitle: 'Officer-in-Charge (Boiler & Steam)',
    workshopCode: 'WS-11',
    category: 'mechanical',
    officerDesignation: 'Lieutenant J Alam, BN',
    scopeBn: 'অক্জিলিয়ারি মেরিন বয়লার, স্টিম প্রেশার পাইপিং, সেফটি ভাল্ব ও ওয়াটার ক্যালোরিফায়ার রক্ষণাবেক্ষণ।',
    responsibilities: [
      'Boiler internal furnace descaling, soot cleaning, and refractory brick lining renewal',
      'Smoke and water tube retubing, tube expanding, and hydrostatic pressure testing',
      'Main boiler safety valve setting, popping pressure adjustment, and steam trap overhaul',
      'Feed water chemical testing, deaerator inspection, and fuel burner atomizing nozzle tuning'
    ],
    keyEquipments: ['Pneumatic Tube Expanding Rigs', 'Boiler Hydrostatic Test Skid', 'Burner Atomizer Test Stand', 'Refractory Ramming Equipment'],
    locationInYard: 'Thermal & Boiler Bay Block-3',
    phoneExt: 'Dockyard Ext: 4211'
  },
  {
    id: 'ws_12_gas_turbine_shop',
    titleEn: 'WS-12 Gas Turbine & Propulsion Shop',
    titleBn: 'গ্যাস টারবাইন ও প্রপালশন শপ (Gas Turbine & Propulsion)',
    roleTitle: 'Officer-in-Charge (Gas Turbine & Propulsion)',
    workshopCode: 'WS-12',
    category: 'mechanical',
    officerDesignation: 'Lt Commander D K Banik, BN',
    scopeBn: 'মেরিন গ্যাস টারবাইন (Rolls-Royce, GT-25000), রিডাকশন গিয়ারবক্স, ফ্লেক্সিবল কাপলিং ও ড্রাইভ শ্যাফটিং।',
    responsibilities: [
      'Borescope visual inspection of compressor blades and turbine hot-section stages',
      'Reduction gear tooth contact blue-check, backlash measurement, and white-metal bearing inspection',
      'Gas generator dynamic vibration analysis and electronic power management calibration',
      'High-velocity lube oil flushing, centrifugal separation, and synthetic turbine lubricant filtration'
    ],
    keyEquipments: ['Articulated Video Borescope System', 'Digital Laser Shaft Alignment Tool', 'Centrifugal Lubricant Purifier Skid'],
    locationInYard: 'Precision Turbine Complex',
    phoneExt: 'Dockyard Ext: 4212'
  },
  {
    id: 'ws_14_foundry_metal_casting',
    titleEn: 'WS-14 Foundry & Metal Casting Shop',
    titleBn: 'ফাউন্ড্রি ও মেটাল কাস্টিং শপ (Foundry & Casting)',
    roleTitle: 'Officer-in-Charge (Foundry & Casting)',
    workshopCode: 'WS-14',
    category: 'mechanical',
    officerDesignation: 'Lieutenant M Shafiq, BN',
    scopeBn: 'ব্রোঞ্জ, ব্রাস, ম্যাঙ্গানিজ ব্রোঞ্জ ও কাস্ট-আয়রন ধাতুর স্যান্ড মোল্ডিং ও নন-ফেরাস কাস্টিং।',
    responsibilities: [
      'Sand mold preparation using CO2 sodium silicate binders and wooden pattern cores',
      'Induction crucible melting of marine bronze for pump impellers, flanges, and valves',
      'Pouring, cooling, fettling, and risering removal of rough cast naval components',
      'Chemical spectroscopic alloy verification and tensile test bar inspection'
    ],
    keyEquipments: ['Induction Metal Melting Furnace', 'CO2 Sand Muller & Mixer', 'Spectrometric Metal Analyzer', 'Pneumatic Fettling Chippers'],
    locationInYard: 'Foundry Complex (South Yard)',
    phoneExt: 'Dockyard Ext: 4214'
  },
  {
    id: 'ws_16_tool_room_shop',
    titleEn: 'WS-16 Tool Room & Precision Shop',
    titleBn: 'টুল রুম ও প্রিসিশন শপ (Tool Room & Precision)',
    roleTitle: 'Officer-in-Charge (Tool Room)',
    workshopCode: 'WS-16',
    category: 'mechanical',
    officerDesignation: 'Lieutenant S Ahmed, BN',
    scopeBn: 'উচ্চ-নির্ভুল স্পেশালাইজড টুলিং, কাস্টম জিগস ও ফিক্সচার, ডাইস এবং প্রিসিশন কাটার গ্রাইন্ডিং।',
    responsibilities: [
      'Fabrication of custom machining jigs, holding fixtures, and naval inspection gauges',
      'Precision resharpening and profile grinding of milling cutters, reamers, and drill bits',
      'Heat treatment, carburizing, hardening, and oil quenching of specialized machine tool parts',
      'Micrometer, vernier caliper, and precision dial indicator inspection and verification'
    ],
    keyEquipments: ['Universal Tool & Cutter Grinder', 'Hardening Muffle Furnace', 'Optical Profile Projector', 'Precision Surface Grinder'],
    locationInYard: 'Precision Tool Room Center',
    phoneExt: 'Dockyard Ext: 4216'
  },
  {
    id: 'ws_18_refrigeration_hvac',
    titleEn: 'WS-18 Refrigeration & HVAC Shop',
    titleBn: 'রেফ্রিজারেশন ও এইচভিএসি শপ (Refrigeration & HVAC)',
    roleTitle: 'Officer-in-Charge (Refrigeration & HVAC)',
    workshopCode: 'WS-18',
    category: 'mechanical',
    officerDesignation: 'Lieutenant G Mostafa, BN',
    scopeBn: 'সেন্ট্রাল এসি চিলার প্ল্যান্ট, কোল্ড প্রোভিশন রুম, এয়ার হ্যান্ডলিং ইউনিট (AHU) ও রেফ্রিজারেশন মেরামত।',
    responsibilities: [
      'Marine refrigeration compressor overhaul, mechanical seal replacement, and gas charging',
      'Shell-and-tube marine condenser descaling, chemical cleaning, and copper tube eddy current testing',
      'Ammunition magazine cooling and temperature control fail-safe safety valve maintenance',
      'Hermetic recovery, recycling, and environmental handling of R134a/R404A refrigerants'
    ],
    keyEquipments: ['Automated Refrigerant Recovery & Charging Skid', 'Ultrasonic Gas Leak Detectors', 'Tube Expanding & Descaling Rigs'],
    locationInYard: 'HVAC Workshop Facility',
    phoneExt: 'Dockyard Ext: 4218'
  },
  {
    id: 'ws_26_propeller_shaft_shop',
    titleEn: 'WS-26 Propeller & Shaft Alignment Shop',
    titleBn: 'প্রপেলার ও শ্যাফট এলাইনমেন্ট শপ (Propeller & Shaft)',
    roleTitle: 'Officer-in-Charge (Propeller & Shaft)',
    workshopCode: 'WS-26',
    category: 'mechanical',
    officerDesignation: 'Lt Commander S N Shikdar, BN',
    scopeBn: 'প্রপেলার ডাইনামিক ব্যালেন্সিং, টেইলশ্যাফট এলাইনমেন্ট, স্টার্ন টিউব বেয়ারিং ও সিপিপি প্রপেলার সার্ভিসিং।',
    responsibilities: [
      'Propeller shaft withdrawal, dye-penetrant inspection, and micrometer runout check on lathe',
      'Propeller blade pitch measurement, cavitation erosion welding, and static/dynamic balancing',
      'Controllable Pitch Propeller (CPP) internal hydraulic hub servo piston overhaul and seal replacement',
      'Stern tube Simplex seal overhaul and intermediate shaft plummer block alignment'
    ],
    keyEquipments: ['Dynamic Propeller Balancing Rig', 'Hydraulic Propeller Nut Torque Jack', 'Shaft Truing & Straightening Press'],
    locationInYard: 'Shafting & Stern Gear Bay',
    phoneExt: 'Dockyard Ext: 4226'
  },

  // =========================================================================
  // 3. DGM (WEAPON & ELECTRICAL) - DGM (W&E)
  // =========================================================================
  {
    id: 'ws_05_electrical_power',
    titleEn: 'WS-05 Electrical Power Workshop',
    titleBn: 'ইলেকট্রিক্যাল পাওয়ার শপ (Electrical Power)',
    roleTitle: 'Officer-in-Charge (Electrical Power)',
    workshopCode: 'WS-05',
    category: 'weapon_electrical',
    officerDesignation: 'Lt Commander T A Islam, BN',
    scopeBn: 'জাহাজের ৪৪০V/২২০V মেইন জেনারেটর, মেইন সুইচবোর্ড (MSB), ইলেকট্রিক মোটর রিওয়াইন্ডিং ও ডিস্ট্রিবিউশন।',
    responsibilities: [
      'Complete vacuum-pressure impregnation (VPI) rewinding, baking, and insulation varnishing of marine motors',
      'Generator automatic voltage regulator (AVR), reverse power relays, and air circuit breaker (ACB) testing',
      'Main Switchboard (MSB) busbar inspection, megger insulation resistance testing, and infrared thermography',
      'Shore supply power converter and main marine cable megger insulation checking'
    ],
    keyEquipments: ['Heavy Motor Rewinding & Winding Rigs', 'VPI Insulation Oven', 'Secondary Injection Relay Test Set', 'Multi-kW Resistive Load Bank'],
    locationInYard: 'Electrical Engineering Complex Block-B',
    phoneExt: 'Dockyard Ext: 4205'
  },
  {
    id: 'ws_06_electronics_radar_shop',
    titleEn: 'WS-06 Electronics & Radar Shop',
    titleBn: 'ইলেকট্রনিক্স ও রাডার শপ (Electronics & Radar)',
    roleTitle: 'Officer-in-Charge (Electronics & Radar)',
    workshopCode: 'WS-06',
    category: 'weapon_electrical',
    officerDesignation: 'Lt Commander S Rahman, BN',
    scopeBn: 'নেভাল নজরদারি রাডার, সোনার ট্রান্সডিউসার, আইএফএফ, ট্র্যাকিং অ্যান্টেনা ও কমব্যাট কনসোল মেরামত।',
    responsibilities: [
      'Magnetron/klystron transmitter tuning, rotary joint microwave leak test, and VSWR measurement',
      'Radar antenna pedestal drive motor, gearbox, and synchro/resolver tracking calibration',
      'Combat management system (CMS) multifunction consoles and fiber-optic data bus troubleshooting',
      'Sonar dome acoustic transducer impedance test and pre-amplifier circuitry repair'
    ],
    keyEquipments: ['Microwave Spectrum Analyzer (up to 40 GHz)', 'RF Power Meters & VSWR Bridges', 'High-Frequency Digital Storage Oscilloscopes'],
    locationInYard: 'Naval Electronics & Radar Lab',
    phoneExt: 'Dockyard Ext: 4206'
  },
  {
    id: 'ws_21_battery_power_storage',
    titleEn: 'WS-21 Battery & Power Storage Shop',
    titleBn: 'ব্যাটারি ও পাওয়ার স্টোরেজ শপ (Battery & Storage)',
    roleTitle: 'Officer-in-Charge (Battery & Power Storage)',
    workshopCode: 'WS-21',
    category: 'weapon_electrical',
    officerDesignation: 'Lieutenant I Khandaker, BN',
    scopeBn: 'সাবমেরিন ও যুদ্ধজাহাজের হেভি-ডিউটি ব্যাটারি ব্যাংক চার্জিং, ডিসচার্জ লোড টেস্টিং ও ডিসি পাওয়ার রক্ষণাবেক্ষণ।',
    responsibilities: [
      'Automated multi-step constant current charging and capacity discharge load profiling',
      'Specific gravity measurement, electrolyte equalization, and individual cell voltage logging',
      'Lead-acid and lithium marine starter battery impedance testing and terminal post lead burning',
      'Emergency 24V DC battery supply changeover contactors and uninterruptible power supply (UPS) validation'
    ],
    keyEquipments: ['Automated High-Capacity Battery Cycler', 'Precision Digital Hydrometers', 'Battery Internal Resistance Impedance Tester'],
    locationInYard: 'Battery Charging & Storage Facility',
    phoneExt: 'Dockyard Ext: 4221'
  },
  {
    id: 'ws_23_telecom_navaids_shop',
    titleEn: 'WS-23 Telecommunication & Nav-Aids Shop',
    titleBn: 'টেলিকমিউনিকেশন ও ন্যাভ-এইডস শপ (Telecom & Nav-Aids)',
    roleTitle: 'Officer-in-Charge (Telecom & Nav-Aids)',
    workshopCode: 'WS-23',
    category: 'weapon_electrical',
    officerDesignation: 'Lt Commander B Das, BN',
    scopeBn: 'ট্যাকটিক্যাল স্যাটেলাইট যোগাযোগ, এইচএফ/ভিএইচএফ নেভাল রেডিও, জাইরোকম্পাস ও জিপিএস নেভিগেশন।',
    responsibilities: [
      'Master gyrocompass sensitive element overhaul, settling time verification, and repeater synchronization',
      'Tactical HF transceiver antenna tuner (ATU) servicing and broadband dipole matching',
      'Speed log transducer and depth echo sounder pulse generator calibration',
      'On-board internal sound-powered telephone and main broadcast system (SRE) maintenance'
    ],
    keyEquipments: ['Gyrocompass Test Turntable', 'RF Communication Test Set', 'Acoustic Water Tank Transducer Calibrator'],
    locationInYard: 'Telecom & Navigation Lab',
    phoneExt: 'Dockyard Ext: 4223'
  },
  {
    id: 'ws_24_calibration_instrumentation',
    titleEn: 'WS-24 Calibration & Instrumentation Lab',
    titleBn: 'ক্যালিব্রেশন ও ইনস্ট্রুমেন্টেশন ল্যাব (Calibration & Instrumentation)',
    roleTitle: 'Officer-in-Charge (Calibration & Instrumentation)',
    workshopCode: 'WS-24',
    category: 'weapon_electrical',
    officerDesignation: 'Lieutenant J Islam, BN',
    scopeBn: 'প্রিসিশন প্রেশার ট্রান্সমিটার, তাপমাত্রা সেন্সর, ট্যাকোমিটার ও ইলেকট্রিক্যাল পরিমাপক ক্যালিব্রেশন।',
    responsibilities: [
      'Deadweight tester calibration of marine pressure gauges and high-pressure relief valves',
      'Temperature bath verification of PT100 sensors, thermocouple probes, and pyrometers',
      'Digital multi-meter, clamp meter, and insulation tester national standard traceability checks',
      'Issuance of formal calibration test certificates and equipment recalibration scheduling'
    ],
    keyEquipments: ['Hydraulic Deadweight Tester (up to 700 Bar)', 'Dry Well Temperature Calibrator', 'Precision Multifunction Electrical Calibrator'],
    locationInYard: 'Central Instrumentation & Metrology Lab',
    phoneExt: 'Dockyard Ext: 4224'
  },

  // =========================================================================
  // 4. DGM (ORDNANCE) - DGM (ORD)
  // =========================================================================
  {
    id: 'ws_07_weapon_ordnance_shop',
    titleEn: 'WS-07 Weapon & Ordnance Shop',
    titleBn: 'ওয়েপন ও অর্ডন্যান্স শপ (Weapon & Ordnance)',
    roleTitle: 'Officer-in-Charge (Weapon & Ordnance)',
    workshopCode: 'WS-07',
    category: 'ordnance',
    officerDesignation: 'Commander H Kabir, BN',
    scopeBn: 'নেভাল মেইন গান মাউন্ট (76mm, 100mm, 57mm), টুইন এএ গান (37mm), মিসাইল লঞ্চার ও টর্পেডো টিউব।',
    responsibilities: [
      'Gun barrel erosion measurement using star gauge and pneumatic bore impression kits',
      'Breech block mechanism overhaul, firing pin striker adjustment, and extractors servicing',
      'Automated ammunition feed chute, revolving magazine hoist, and pneumatic loader maintenance',
      'Gun mount hydraulic drive pump, servo valves, and elevation/training limit switch verification'
    ],
    keyEquipments: ['Optical Star Bore Gauge Kit', 'Gun Mount Elevation/Training Hydraulic Test Bench', 'Recoilless Action Test Rig'],
    locationInYard: 'Naval Armament & Gun Complex',
    phoneExt: 'Dockyard Ext: 4207'
  },
  {
    id: 'ws_17_optical_fire_control',
    titleEn: 'WS-17 Optical & Fire Control Shop',
    titleBn: 'অপটিক্যাল ও ফায়ার কন্ট্রোল শপ (Optical & Fire Control)',
    roleTitle: 'Officer-in-Charge (Optical & Fire Control)',
    workshopCode: 'WS-17',
    category: 'ordnance',
    officerDesignation: 'Lt Commander F Ahmed, BN',
    scopeBn: 'অপটিক্যাল রেঞ্জফাইন্ডার, পেরিস্কোপ প্রিজম, নাইট-ভিশন ইওডি সাইট ও ব্যালিস্টিক ফায়ার কন্ট্রোল কম্পিউটার।',
    responsibilities: [
      'Electro-optical tracking director servo drive harmonic backlash elimination and optical collimation',
      'Laser rangefinder pulse energy measurement and beam alignment check',
      'Infrared thermal camera sensor calibration and target acquisition line-of-sight stabilization',
      'Ballistic fire control computer firing solution verification with live telemetry feeds'
    ],
    keyEquipments: ['Optical Collimator Alignment Bench', 'Laser Energy Measuring Meter', 'Infrared Target Simulator Matrix'],
    locationInYard: 'Precision Optics & Fire Control Lab',
    phoneExt: 'Dockyard Ext: 4217'
  },
  {
    id: 'ws_19_hydraulic_pneumatic_shop',
    titleEn: 'WS-19 Hydraulic & Pneumatic Shop',
    titleBn: 'হাইড্রোলিক ও নিউমেটিক শপ (Hydraulic & Pneumatic)',
    roleTitle: 'Officer-in-Charge (Hydraulic & Pneumatic)',
    workshopCode: 'WS-19',
    category: 'ordnance',
    officerDesignation: 'Lt Commander H Hasan, BN',
    scopeBn: 'স্টিয়ারিং গিয়ার হাইড্রোলিক র‍্যাম, এংকর ক্যাপস্টান, হাই-প্রেসার এয়ার কম্প্রেসার ও ফ্লুইড পাওয়ার সিস্টেম।',
    responsibilities: [
      'Hydraulic fluid contamination testing via laser particle counter and viscosity measurement',
      'Proportional servo control valve spool lapping and flow rate performance testing on simulator bench',
      'Warship steering gear hydraulic cylinders, telemotor rams, and emergency hand pump overhaul',
      '200/300 Bar high-pressure starting air compressors and breathing air charging station maintenance'
    ],
    keyEquipments: ['Hydraulic Component Universal Test Rig (350 Bar)', 'Laser Liquid Particle Counter', 'Pneumatic Ram Dynamic Cycle Tester'],
    locationInYard: 'Fluid Power Technology Center',
    phoneExt: 'Dockyard Ext: 4219'
  },

  // =========================================================================
  // 5. DGM (SHIP REPAIR) - DGM (SR)
  // =========================================================================
  {
    id: 'ws_22_underwater_diving_unit',
    titleEn: 'WS-22 Underwater Repairs & Diving Unit',
    titleBn: 'আন্ডারওয়াটার রিপেয়ার্স ও ডাইভিং ইউনিট (Underwater Diving)',
    roleTitle: 'Officer-in-Charge (Underwater & Diving Unit)',
    workshopCode: 'WS-22',
    category: 'ship_repair',
    officerDesignation: 'Lt Commander T Mahmud, BN',
    scopeBn: 'পানির নিচের হাল পরিদর্শন, সাবসি ওয়েট ওয়েল্ডিং, সি-চেস্ট ক্লিয়ারিং ও ডাইভিং সাপোর্ট অপারেশন।',
    responsibilities: [
      'Underwater CCTV visual inspection of warship hull plating, sea-chests, rudders, and propellers',
      'Subsea wet welding and cutting repairs on damaged bilge keels and hull penetrations',
      'Seachest blanking, plug sealing, and underwater valve servicing prior to in-water repairs',
      'Emergency salvage, diver decompression chamber operations, and sonar dome de-fouling'
    ],
    keyEquipments: ['Underwater CCTV Inspection System', 'Subsea Wet Welding & Cutting Rig', 'Hyperbaric Decompression Chamber'],
    locationInYard: 'Naval Diving Base & Pier Facility',
    phoneExt: 'Dockyard Ext: 4222'
  },
  {
    id: 'ws_25_quality_control_ndt',
    titleEn: 'WS-25 Quality Control & NDT Lab',
    titleBn: 'কোয়ালিটি কন্ট্রোল ও এনডিটি ল্যাব (Quality Control & NDT)',
    roleTitle: 'Officer-in-Charge (Quality Control & NDT)',
    workshopCode: 'WS-25',
    category: 'ship_repair',
    officerDesignation: 'Lt Commander M K Chowdhury, BN',
    scopeBn: 'নন-ডিস্ট্রাক্টিভ টেস্টিং (NDT), আল্ট্রাসনিক ফ্লা ডিটেকশন, এক্স-রে রেডিওগ্রাফি ও গুণগত মান নিশ্চিতকরণ।',
    responsibilities: [
      'Ultrasonic flaw detection (UT) and magnetic particle testing (MT) on hull structural welds',
      'Industrial X-ray and gamma-ray radiographic testing (RT) on high-pressure steam boiler pipes',
      'Dye-penetrant liquid inspection (PT) on propeller shaft tapers, rudder pintles, and engine valves',
      'Material tensile hardness testing, chemical spectroanalysis, and refit quality clearance certification'
    ],
    keyEquipments: ['Digital Ultrasonic Flaw Detector', 'Electromagnetic Yoke MT Kit', 'Portable Industrial X-Ray Unit', 'Hardness Tester'],
    locationInYard: 'Central Quality Assurance & NDT Complex',
    phoneExt: 'Dockyard Ext: 4225'
  },
  {
    id: 'ws_27_yard_services_heavy_transport',
    titleEn: 'WS-27 Yard Services & Heavy Transport',
    titleBn: 'ইয়ার্ড সার্ভিসেস, স্লিপওয়ে ও হেভি ট্রান্সপোর্ট (Yard Services)',
    roleTitle: 'Officer-in-Charge (Yard Services & Heavy Transport)',
    workshopCode: 'WS-27',
    category: 'ship_repair',
    officerDesignation: 'Lieutenant R U Ahmed, BN',
    scopeBn: 'শিপইয়ার্ড পোর্টাল ক্রেন, স্লিপওয়ে উইঞ্চ পরিচালনা, নৌযান লঞ্চিং এবং ভারী পরিবহন লজিস্টিকস।',
    responsibilities: [
      'Operation and load testing of heavy shipyard dock cranes, portal gantry cranes, and mobile lifters',
      'BN Slipway vessel slipping and launching operations, tidal calculation, and cradle positioning',
      'Warship drydock transfer trailers, mobile hydraulic platform haulage, and machinery shifting',
      'Yard mobile generator deployment, emergency towing, and jetty mooring logistics'
    ],
    keyEquipments: ['500-Ton Slipway Cradle & Winch Station', 'Heavy Shipyard Portal Gantry Cranes', 'Multi-Axle Heavy Transport Modular Trailers'],
    locationInYard: 'Heavy Transport Yard & Slipway Control Tower',
    phoneExt: 'Dockyard Ext: 4227'
  },
  {
    id: 'sro_hull',
    titleEn: 'SRO (Hull) Coordination Cell',
    titleBn: 'শিপ রিপেয়ার অফিসার (হাল)',
    roleTitle: 'Ship Repair Officer (Hull)',
    category: 'ship_repair',
    officerDesignation: 'Lieutenant Commander, BN (E/HULL)',
    scopeBn: 'ড্রাইডকিং পরিকল্পনা, ডকিং ব্লক পজিশনিং, আনডকিং নিরাপত্তা ও হাল কাঠামোগত কাজের সমন্বয়।',
    responsibilities: [
      'Preparation of drydocking docking plans, declivity calculations, and stability assessment',
      'Daily monitoring of hull plate renewal progress and drydock bottom work coordination',
      'Compartment boundary air/water hose testing and final undocking sea valve clearance',
      'Liaison between drydock staff, hull workshops, and warship executive officer'
    ],
    keyEquipments: ['Ultrasonic Digital Thickness Gauge', 'Docking Theodolite & Laser Levels', 'Tank Hydro-Testing Kits'],
    locationInYard: 'Ship Repair Coordination Cell (Adjacent to Jetty)',
    phoneExt: 'Dockyard Ext: 8151'
  },
  {
    id: 'sro_mech',
    titleEn: 'SRO (Mech) Coordination Cell',
    titleBn: 'শিপ রিপেয়ার অফিসার (মেকানিক্যাল)',
    roleTitle: 'Ship Repair Officer (Mechanical)',
    category: 'ship_repair',
    officerDesignation: 'Lieutenant Commander, BN (E)',
    scopeBn: 'জাহাজের অন-বোর্ড মেশিনারি ওভারহলিং তদারকি, ক্র্যাঙ্কশ্যাফট ডিফ্লেকশন টেস্ট ও ট্রায়াল সমন্বয়।',
    responsibilities: [
      'Supervision of main engine crankshaft deflection tests and gearbox alignment blue-checks',
      'Pressure testing clearance for marine pumps, air compressors, and heat exchangers',
      'On-board machinery basin trial execution and preparation of Sea Acceptance Trial (SAT) documentation',
      'Coordination of work schedules between mechanical shops and warship engineering department'
    ],
    keyEquipments: ['Laser Shaft Alignment System', 'Crankshaft Deflection Gauge', 'Digital Vibration Analyzer'],
    locationInYard: 'Ship Repair Coordination Cell',
    phoneExt: 'Dockyard Ext: 8152'
  },
  {
    id: 'sro_wl',
    titleEn: 'SRO (W & L) Coordination Cell',
    titleBn: 'শিপ রিপেয়ার অফিসার (ওয়েপন ও ইলেকট্রিক্যাল)',
    roleTitle: 'Ship Repair Officer (Weapon & Electrical)',
    category: 'ship_repair',
    officerDesignation: 'Lieutenant Commander, BN (L)',
    scopeBn: 'অন-বোর্ড ইলেকট্রিক্যাল পাওয়ার গ্রিড টেস্টিং, শোর পাওয়ার সংযোগ ও কমব্যাট সেন্সর ট্রায়াল সমন্বয়।',
    responsibilities: [
      'Monitoring generator paralleling, load sharing, and reverse-power safety tests during refits',
      'Live signal trial verification of naval radars, gyros, and echo sounders inside Combat Information Center (CIC)',
      'Cable tray routing, watertight bulkhead gland transit inspection, and megger insulation tests',
      'Liaison between electrical workshops and ship electrical officers'
    ],
    keyEquipments: ['Portable Megger & Phase Rotation Tester', 'RF Field Strength Analyzer', 'Thermal Imaging Camera'],
    locationInYard: 'Ship Repair Coordination Cell',
    phoneExt: 'Dockyard Ext: 8153'
  },
  {
    id: 'sro_ord',
    titleEn: 'SRO (Ord) Coordination Cell',
    titleBn: 'শিপ রিপেয়ার অফিসার (অর্ডন্যান্স)',
    roleTitle: 'Ship Repair Officer (Ordnance)',
    category: 'ship_repair',
    officerDesignation: 'Lieutenant Commander, BN (X/ORD)',
    scopeBn: 'গান মাউন্ট অন-বোর্ড ইনস্টলেশন অ্যালাইনমেন্ট, টার্গেট ট্র্যাকিং লিংক ও ফায়ারিং প্রটোকল সমন্বয়।',
    responsibilities: [
      'Gun mount roller path leveling and parallelism check relative to warship deck plane',
      'Ammunition magazine sprinkler and flooding valve safety verification',
      'Execution of on-board dock trials and firing protocol clearances for gun and missile systems',
      'Coordination between gun workshop specialists and ship gunnery officer'
    ],
    keyEquipments: ['Clinometer & Optical Level Gauges', 'Magazine Temperature & Pressure Test Kits'],
    locationInYard: 'Ship Repair Coordination Cell',
    phoneExt: 'Dockyard Ext: 8154'
  },
  {
    id: 'safety_officer',
    titleEn: 'Dockyard Safety & Fire Command',
    titleBn: 'ডকইয়ার্ড নিরাপত্তা ও অগ্নি নির্বাপণ কমান্ড',
    roleTitle: 'Dockyard Safety & Occupational Health Officer',
    category: 'ship_repair',
    officerDesignation: 'Lieutenant / Warrant Officer, BN',
    scopeBn: 'হট-ওয়ার্ক পারমিট, কনফাইন্ড স্পেস গ্যাস-ফ্রি ক্লিয়ারেন্স, ব্যক্তিগত নিরাপত্তা ও ফায়ার পেট্রোল।',
    responsibilities: [
      'Issuance of gas-free certificates using 4-gas analyzers prior to welding in fuel and lube oil tanks',
      'Hot Work Permit issuance and 24-hour fire watch sentry deployment enforcement',
      'Safety helmet, boots, and eye protection PPE enforcement across drydocks and workshops',
      'Conducting periodic fire drills and emergency rescue exercises with Naval Dockyard Fire Station'
    ],
    keyEquipments: ['Digital Multi-Gas Detector (LEL, O2, CO, H2S)', 'Explosimeter', 'Mobile Foam Fire Fighting Units'],
    locationInYard: 'Dockyard Safety Center & Fire Station',
    phoneExt: 'Dockyard Ext: 8155 / Emergency: 999'
  }
];
