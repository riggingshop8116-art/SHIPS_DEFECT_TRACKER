import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Wrench, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  User, 
  X, 
  ChevronRight, 
  Ship,
  Hammer,
  Cog,
  Radio,
  Crosshair,
  AlertTriangle
} from 'lucide-react';
import { Workshop, Defect, DockyardConfig } from '../types';

export interface ProductionUnitItem {
  id: string;
  titleEn: string;
  titleBn?: string;
  roleTitle: string;
  workshopCode?: string;
  category: 'hull' | 'mechanical' | 'weapon_electrical' | 'ordnance' | 'ship_repair';
  officerDesignation: string;
  scopeBn: string;
  responsibilities: string[];
  keyEquipments: string[];
  locationInYard?: string;
  phoneExt?: string;
}

export interface DGMGroup {
  id: string;
  code: string;
  dgmTitleEn: string;
  dgmTitleBn: string;
  category: 'hull' | 'mechanical' | 'weapon_electrical' | 'ordnance' | 'ship_repair';
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  icon: React.ReactNode;
  summaryEn: string;
  units: ProductionUnitItem[];
}

interface ProductionDepartmentProps {
  workshops: Workshop[];
  defects: Defect[];
  dockyardConfig?: DockyardConfig;
  onNavigateToEntry?: (location?: string, workshopCode?: string) => void;
  onNavigateToSearch?: (workshopCode?: string) => void;
}

export default function ProductionDepartment({
  workshops,
  defects,
  dockyardConfig,
  onNavigateToEntry,
  onNavigateToSearch
}: ProductionDepartmentProps) {
  // Active DGM Filter: 'all' or specific group id
  const [selectedDgm, setSelectedDgm] = useState<string>('all');
  // Live text search
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Selected unit for detailed modal popup
  const [selectedUnit, setSelectedUnit] = useState<ProductionUnitItem | null>(null);

  // Complete Production Department Hierarchical Data in English
  const dgmGroups: DGMGroup[] = useMemo(() => [
    {
      id: 'dgm_hull',
      code: 'DGM (H&M)',
      dgmTitleEn: 'Deputy General Manager (Hull and Miscellaneous)',
      dgmTitleBn: 'Deputy General Manager (Hull and Miscellaneous)',
      category: 'hull',
      accentColor: 'border-blue-500/50',
      badgeBg: 'bg-blue-500/15',
      badgeBorder: 'border-blue-400/40',
      textColor: 'text-blue-300',
      icon: <Ship className="h-5 w-5 text-blue-400" />,
      summaryEn: 'Supervises warship structural integrity, hull plating renewal, underwater coatings, liferafts, rigging, and naval boat building.',
      units: [
        {
          id: 'oic_plater_welding',
          titleEn: 'OIC Plater & Welding Shop',
          roleTitle: 'Officer-in-Charge (Plater & Welding)',
          workshopCode: 'WS-01',
          category: 'hull',
          officerDesignation: 'Lieutenant / Lt Commander, BN (E/HULL)',
          scopeBn: 'Warship steel plate renewal, curved hull fabrication, gas profiling, and high-grade naval structural welding.',
          responsibilities: [
            'Warship hull plate inspection and renewal based on ultrasonic thickness gauging reports',
            'Fabrication of double bottom and ballast tank steel frames, girders, and bulkheads',
            'X-ray quality specialized Arc/TIG/MIG welding on pressure vessels and steam lines',
            'Dock block alignment setting and underwater hull penetration re-plating in drydocks'
          ],
          keyEquipments: ['Heavy Hydraulic Plate Bending Roller', 'CNC Plasma Profile Cutter', 'Inverter TIG/MIG Welding Systems', 'Hydraulic Guillotine Shearing Machine'],
          locationInYard: 'Hull Shed Block-1 (North Yard)',
          phoneExt: 'Dockyard Ext: 8111'
        },
        {
          id: 'oic_ship_fitting',
          titleEn: 'OIC Ship Fitting Shop',
          roleTitle: 'Officer-in-Charge (Ship Fitting)',
          workshopCode: 'WS-02',
          category: 'hull',
          officerDesignation: 'Lieutenant / Sub-Lieutenant, BN (E/HULL)',
          scopeBn: 'Overhaul and installation of watertight doors, hatches, manholes, scuttle ports, and deck mooring fittings.',
          responsibilities: [
            'Watertight bulkhead door and hatch dogging mechanism overhaul and chalk testing',
            'Mooring bollar, fairlead, capstan bed, and heavy deck mechanical fittings maintenance',
            'Ventilation scuttle gates and watertight coaming rubber seal fitting and replacement',
            'Compartment air pressure testing for watertight structural verification'
          ],
          keyEquipments: ['Portable Pneumatic Grinders', 'Hydraulic Torque Wrenches', 'Flange Facing Machines', 'Chalk Test Rigs'],
          locationInYard: 'Fitting Bay Block-2',
          phoneExt: 'Dockyard Ext: 8112'
        },
        {
          id: 'oic_painting_blasting',
          titleEn: 'OIC Painting & Blasting Shop',
          roleTitle: 'Officer-in-Charge (Painting & Blasting)',
          workshopCode: 'WS-10',
          category: 'hull',
          officerDesignation: 'Lieutenant, BN (E)',
          scopeBn: 'Abrasive grit blasting, zinc-rich marine priming, and anti-fouling underwater hull preservation coatings.',
          responsibilities: [
            'High-pressure drydock hull grit blasting to SA 2.5 cleanliness standard',
            'Application of multi-coat epoxy primer and anti-fouling hull barrier systems',
            'Fuel, lube oil, and fresh water tank internal sandblasting and food-grade coating',
            'Paint film thickness (DFT) measurement and climate condition compliance monitoring'
          ],
          keyEquipments: ['Airless Spray Painting Rigs', 'Grit Blasting Hopper Units', 'Digital Dry Film Thickness (DFT) Gauges', 'Dehumidifier Units'],
          locationInYard: 'Drydock Preservation Facility',
          phoneExt: 'Dockyard Ext: 8113'
        },
        {
          id: 'oic_rigging_sail_loft',
          titleEn: 'OIC Rigging & Sail Loft',
          roleTitle: 'Officer-in-Charge (Rigging & Sail Loft)',
          workshopCode: 'WS-13',
          category: 'hull',
          officerDesignation: 'Lieutenant / Sub-Lieutenant, BN (X)',
          scopeBn: 'Warship steel wire ropes, anchor chains, crane slings, marine canvas awnings, and inflatable life rafts.',
          responsibilities: [
            'Periodic proof-load testing and hydraulic swaging of steel wire ropes and crane slings',
            'Annual inspection, pressure cylinder hydrostatic testing, and packing of SOLAS life rafts',
            'Manufacture and repair of specialized weather awnings and gun blast covers',
            'Anchor chain calibration, stud link inspection, and swivel shackle overhaul'
          ],
          keyEquipments: ['50-Ton Wire Rope Swaging Press', 'Tensile Proof Load Test Bench', 'Life Raft Pressure Inflation Test Rigs'],
          locationInYard: 'Rigging & Canvas Shed',
          phoneExt: 'Dockyard Ext: 8114'
        },
        {
          id: 'oic_shipwright_boat_building',
          titleEn: 'OIC Shipwright & Boat Building Shop',
          roleTitle: 'Officer-in-Charge (Shipwright & Boat Building)',
          workshopCode: 'WS-15',
          category: 'hull',
          officerDesignation: 'Lieutenant, BN (E/HULL)',
          scopeBn: 'Drydock keel block alignment, wooden and composite hull fabrication, and speed boat repairs.',
          responsibilities: [
            'Keel block calculation, positioning, and side shoring alignment for warship docking',
            'Glass Reinforced Plastic (GRP) patrol craft hull lamination, mold fabrication, and gelcoat repair',
            'Warship bridge teak decking, furniture, and internal acoustic insulation installation',
            'High-speed rescue boat transom rebuilding and buoyancy foam renewal'
          ],
          keyEquipments: ['Heavy Timber Band Saws', 'Resin Infusion Vacuum Pumps', 'Optical Leveling Theodolites', 'Planer & Joinery Workstations'],
          locationInYard: 'Shipwright Yard & GRP Bay',
          phoneExt: 'Dockyard Ext: 8115'
        }
      ]
    },
    {
      id: 'dgm_mech',
      code: 'DGM (MECH)',
      dgmTitleEn: 'Deputy General Manager (Mechanical)',
      dgmTitleBn: 'Deputy General Manager (Mechanical)',
      category: 'mechanical',
      accentColor: 'border-amber-500/50',
      badgeBg: 'bg-amber-500/15',
      badgeBorder: 'border-amber-400/40',
      textColor: 'text-amber-300',
      icon: <Cog className="h-5 w-5 text-amber-400" />,
      summaryEn: 'Oversees main propulsion engines, gas turbines, diesel generators, auxiliary piping, machine shops, and shaft alignments.',
      units: [
        {
          id: 'oic_diesel_shop',
          titleEn: 'OIC Internal Combustion Engine & Diesel Shop',
          roleTitle: 'Officer-in-Charge (Diesel Shop)',
          workshopCode: 'WS-08',
          category: 'mechanical',
          officerDesignation: 'Lieutenant Commander, BN (E)',
          scopeBn: 'Complete overhaul of main propulsion diesel engines (Pielstick, MTU, MAN) and auxiliary generator engines.',
          responsibilities: [
            'Cylinder head decarb, valve grinding, seat refacing, and hydrostatic pressure testing',
            'Piston ring renewal, connecting rod big-end bearing clearance inspection, and liner honing',
            'Fuel injection pump calibration, nozzle spray pattern testing, and pop pressure setting',
            'Engine shop test-bed trials on hydraulic dynamometer under graduated full-power load'
          ],
          keyEquipments: ['Engine Dynamometer Test Bed', 'Automated Fuel Injector Test Bench', 'Cylinder Liner Honing Machine', 'Ultrasonic Parts Cleaning Bath'],
          locationInYard: 'Heavy Mechanical Complex Block-A',
          phoneExt: 'Dockyard Ext: 8121'
        },
        {
          id: 'oic_gas_turbine',
          titleEn: 'OIC Gas Turbine & Reduction Gear Shop',
          roleTitle: 'Officer-in-Charge (Gas Turbine)',
          workshopCode: 'WS-12',
          category: 'mechanical',
          officerDesignation: 'Lieutenant Commander, BN (E)',
          scopeBn: 'Marine propulsion gas turbines (Rolls-Royce Olympus/Tyne, GT-25000), reduction gearboxes, and shaft drive couplings.',
          responsibilities: [
            'Borescope visual inspection of compressor blades and turbine hot-section stages',
            'Reduction gear tooth contact blue-check, backlash measurement, and bearing white-metal inspection',
            'Gas generator dynamic vibration analysis and electronic power management calibration',
            'Lube oil high-velocity chemical flushing and synthetic turbine oil filtration'
          ],
          keyEquipments: ['High-Resolution Articulated Video Borescope', 'Digital Laser Shaft Alignment Tool', 'Lubricant Centrifugal Purifier Test Skid'],
          locationInYard: 'Precision Turbine Complex',
          phoneExt: 'Dockyard Ext: 8122'
        },
        {
          id: 'oic_machine_shop',
          titleEn: 'OIC Machine & Tool Shop',
          roleTitle: 'Officer-in-Charge (Machine Shop)',
          workshopCode: 'WS-02',
          category: 'mechanical',
          officerDesignation: 'Lieutenant / Lt Commander, BN (E)',
          scopeBn: 'Precision lathe turning, heavy milling, gear hobbing, cylinder boring, and manufacturing of marine mechanical spares.',
          responsibilities: [
            'Turning and precision machining of propeller shafts, rudder stocks, and valve stems',
            'Manufacturing of custom splined gears, flanges, couplings, and seawater pump impellers',
            'Refurbishing of worn shaft sleeves via specialized metal spraying and cylindrical grinding',
            'Re-metalling and line-boring of heavy marine split journal bearings'
          ],
          keyEquipments: ['12-Meter Heavy Duty Engine Lathe', 'Universal Milling Machines', 'Horizontal Boring Rig', 'CNC Machining Center'],
          locationInYard: 'Central Machine Shop Bay-1',
          phoneExt: 'Dockyard Ext: 8123'
        },
        {
          id: 'oic_pipe_plumbing',
          titleEn: 'OIC Pipe & Plumbing Shop',
          roleTitle: 'Officer-in-Charge (Pipe Shop)',
          workshopCode: 'WS-09',
          category: 'mechanical',
          officerDesignation: 'Lieutenant, BN (E)',
          scopeBn: 'High-pressure seawater cooling, bilge, ballast, fuel oil transfer, hydraulic, and fire fighting piping systems.',
          responsibilities: [
            'Cupro-nickel (Cu-Ni 90/10) and marine grade stainless steel pipe spool prefabrication and bending',
            'Chemical pickling, passivation, and hydrostatic pressure testing of marine piping networks',
            'Overhaul and lapping of bronze sea-chest valves, storm valves, and safety relief valves',
            'Piping installation onboard warship machinery spaces during drydock refits'
          ],
          keyEquipments: ['CNC Mandrel Pipe Bending Machine', 'Hydrostatic Test Pumps (up to 400 Bar)', 'Flange Orbital Welder', 'Chemical Pickling Tanks'],
          locationInYard: 'Piping & Fabrication Facility',
          phoneExt: 'Dockyard Ext: 8124'
        },
        {
          id: 'oic_propeller_shaft',
          titleEn: 'OIC Propeller & Shafting Shop',
          roleTitle: 'Officer-in-Charge (Propeller & Shaft)',
          workshopCode: 'WS-26',
          category: 'mechanical',
          officerDesignation: 'Lieutenant Commander, BN (E)',
          scopeBn: 'Fixed pitch & controllable pitch propellers (CPP), propeller shafts, stern tubes, Cutless rubber bearings, and rudders.',
          responsibilities: [
            'Propeller shaft withdrawal, dye-penetrant inspection, and micrometer runout check on lathe',
            'Propeller blade pitch measurement, cavitation erosion welding, and static/dynamic balancing',
            'Controllable Pitch Propeller (CPP) internal hydraulic hub servo piston overhaul and seal replacement',
            'Stern tube Simplex seal overhaul and intermediate shaft plummer block alignment'
          ],
          keyEquipments: ['Dynamic Propeller Balancing Rig', 'Hydraulic Propeller Nut Torque Jack', 'Shaft Truing & Straightening Press'],
          locationInYard: 'Shafting & Stern Gear Bay',
          phoneExt: 'Dockyard Ext: 8125'
        }
      ]
    },
    {
      id: 'dgm_we',
      code: 'DGM (W&E)',
      dgmTitleEn: 'Deputy General Manager (Weapon & Electrical)',
      dgmTitleBn: 'Deputy General Manager (Weapon & Electrical)',
      category: 'weapon_electrical',
      accentColor: 'border-cyan-500/50',
      badgeBg: 'bg-cyan-500/15',
      badgeBorder: 'border-cyan-400/40',
      textColor: 'text-cyan-300',
      icon: <Radio className="h-5 w-5 text-cyan-400" />,
      summaryEn: 'Directs marine power generation, main switchboards, electric motors, naval radar sensors, gyrocompasses, and communications.',
      units: [
        {
          id: 'oic_electrical_power',
          titleEn: 'OIC Electrical Power Workshop',
          roleTitle: 'Officer-in-Charge (Electrical Power)',
          workshopCode: 'WS-05',
          category: 'weapon_electrical',
          officerDesignation: 'Lieutenant Commander, BN (L)',
          scopeBn: 'Warship 440V/220V 3-phase AC generators, Main Switchboards (MSB), power distribution panels, and marine motors.',
          responsibilities: [
            'Complete vacuum-pressure impregnation (VPI) rewinding, baking, and insulation varnishing of marine motors',
            'Generator automatic voltage regulator (AVR), reverse power relays, and air circuit breaker (ACB) testing',
            'Main Switchboard (MSB) busbar inspection, megger insulation resistance testing, and infrared thermography',
            'Shore supply converter and marine heavy battery banks charging and discharge load testing'
          ],
          keyEquipments: ['Heavy Motor Rewinding & Winding Rigs', 'VPI Insulation Oven', 'Secondary Injection Relay Test Set', 'Multi-kW Resistive Load Bank'],
          locationInYard: 'Electrical Engineering Complex Block-B',
          phoneExt: 'Dockyard Ext: 8131'
        },
        {
          id: 'oic_electronics_radar',
          titleEn: 'OIC Electronics & Radar Shop',
          roleTitle: 'Officer-in-Charge (Electronics & Radar)',
          workshopCode: 'WS-06',
          category: 'weapon_electrical',
          officerDesignation: 'Lieutenant Commander, BN (L)',
          scopeBn: 'Naval surveillance radar transmitters, tracking antenna pedestals, IFF systems, wave-guides, and combat consoles.',
          responsibilities: [
            'Magnetron/klystron transmitter tuning, rotary joint microwave leak test, and VSWR measurement',
            'Radar antenna pedestal drive motor, gearbox, and synchro/resolver tracking calibration',
            'Combat management system (CMS) multifunction consoles and fiber-optic data bus troubleshooting',
            'Sonar dome acoustic transducer impedance test and pre-amplifier circuitry repair'
          ],
          keyEquipments: ['Microwave Spectrum Analyzer (up to 40 GHz)', 'RF Power Meters & VSWR Bridges', 'High-Frequency Digital Storage Oscilloscopes'],
          locationInYard: 'Naval Electronics & Radar Lab',
          phoneExt: 'Dockyard Ext: 8132'
        },
        {
          id: 'oic_telecom_nav_aids',
          titleEn: 'OIC Telecommunications & Nav-Aids Shop',
          roleTitle: 'Officer-in-Charge (Telecom & Nav-Aids)',
          workshopCode: 'WS-23',
          category: 'weapon_electrical',
          officerDesignation: 'Lieutenant / Lt Commander, BN (L)',
          scopeBn: 'Warship HF/VHF/UHF secure radios, tactical satellite comms, gyrocompasses, magnetic compasses, and echo sounders.',
          responsibilities: [
            'Master gyrocompass sensitive element overhaul, settling time verification, and repeater synchronization',
            'Tactical HF transceiver antenna tuner (ATU) servicing and broadband dipole matching',
            'Speed log transducer and depth echo sounder pulse generator calibration',
            'On-board internal sound-powered telephone and main broadcast system (SRE) maintenance'
          ],
          keyEquipments: ['Gyrocompass Test Turntable', 'RF Communication Test Set', 'Acoustic Water Tank Transducer Calibrator'],
          locationInYard: 'Telecom & Navigation Lab',
          phoneExt: 'Dockyard Ext: 8133'
        },
        {
          id: 'oic_refrigeration_hvac',
          titleEn: 'OIC Refrigeration & HVAC Shop',
          roleTitle: 'Officer-in-Charge (Refrigeration & HVAC)',
          workshopCode: 'WS-18',
          category: 'weapon_electrical',
          officerDesignation: 'Lieutenant, BN (E/L)',
          scopeBn: 'Central chilled water air-conditioning plants, cold & cool provision rooms, and air handling units (AHU).',
          responsibilities: [
            'Centrifugal and screw marine AC compressor overhaul, mechanical seal replacement, and refrigerant charging',
            'Shell-and-tube marine condenser descaling, chemical cleaning, and copper tube eddy current test',
            'Ammunition magazine cooling and temperature control failsafe valve system maintenance',
            'Hermetic recovery, recycling, and environmental handling of R134a/R404A refrigerants'
          ],
          keyEquipments: ['Automated Refrigerant Recovery & Charging Skid', 'Ultrasonic Leak Detectors', 'Tube Expanding & Descaling Rigs'],
          locationInYard: 'HVAC Workshop Facility',
          phoneExt: 'Dockyard Ext: 8134'
        },
        {
          id: 'oic_fire_control_system',
          titleEn: 'OIC Fire Control & Combat Sensor Shop',
          roleTitle: 'Officer-in-Charge (Fire Control System)',
          workshopCode: 'WS-17',
          category: 'weapon_electrical',
          officerDesignation: 'Lieutenant Commander, BN (L)',
          scopeBn: 'Electro-optical directors (EOD), laser rangefinders, thermal imaging sights, and fire control computers.',
          responsibilities: [
            'Electro-optical tracking director servo drive harmonic backlash elimination and optical collimation',
            'Laser rangefinder pulse energy measurement and beam alignment check',
            'Infrared thermal camera sensor calibration and target acquisition line-of-sight stabilization',
            'Ballistic fire control computer firing solution verification with live telemetry feeds'
          ],
          keyEquipments: ['Optical Collimator Alignment Bench', 'Laser Energy Measuring Meter', 'Infrared Target Simulator Matrix'],
          locationInYard: 'Precision Optics & Fire Control Lab',
          phoneExt: 'Dockyard Ext: 8135'
        }
      ]
    },
    {
      id: 'dgm_ord',
      code: 'DGM (ORD)',
      dgmTitleEn: 'Deputy General Manager (Ordnance)',
      dgmTitleBn: 'Deputy General Manager (Ordnance)',
      category: 'ordnance',
      accentColor: 'border-red-500/50',
      badgeBg: 'bg-red-500/15',
      badgeBorder: 'border-red-400/40',
      textColor: 'text-red-300',
      icon: <Crosshair className="h-5 w-5 text-red-400" />,
      summaryEn: 'Responsible for naval artillery gun mounts, missile launchers, torpedo tubes, anti-submarine weapons, and hydraulic servo controls.',
      units: [
        {
          id: 'oic_gun_shop',
          titleEn: 'OIC Naval Gun Workshop',
          roleTitle: 'Officer-in-Charge (Gun Shop)',
          workshopCode: 'WS-07',
          category: 'ordnance',
          officerDesignation: 'Commander / Lt Commander, BN (X/ORD)',
          scopeBn: 'Overhaul and testing of naval main guns (76mm, 100mm, 57mm), automatic twin mounts (37mm), and close-in weapon systems (CIWS).',
          responsibilities: [
            'Gun barrel erosion measurement using star gauge and pneumatic bore impression kits',
            'Breech block mechanism overhaul, firing pin striker adjustment, and extractors servicing',
            'Automated ammunition feed chute, revolving magazine hoist, and pneumatic loader maintenance',
            'Gun mount hydraulic drive pump, servo valves, and elevation/training limit switch verification'
          ],
          keyEquipments: ['Optical Star Bore Gauge Kit', 'Gun Mount Elevation/Training Hydraulic Test Bench', 'Recoilless Action Test Rig'],
          locationInYard: 'Naval Armament & Gun Complex',
          phoneExt: 'Dockyard Ext: 8141'
        },
        {
          id: 'oic_missile_launcher',
          titleEn: 'OIC Missile Launcher & Torpedo Shop',
          roleTitle: 'Officer-in-Charge (Missile & Torpedo)',
          workshopCode: 'WS-07',
          category: 'ordnance',
          officerDesignation: 'Lieutenant Commander, BN (X/ORD)',
          scopeBn: 'Anti-ship missile container launch frames, surface-to-air missile launchers, and triple torpedo launch tubes.',
          responsibilities: [
            'Missile canister blast doors, latch release actuators, and ignition umbilical cable continuity check',
            'Compressed air torpedo discharge manifold pressure vessels and pneumatic charging station servicing',
            'Launcher mechanical training angle locks and safety interlock switches functional trials',
            'Ammunition magazine deluge sprinkler and high-expansion foam fire protection testing'
          ],
          keyEquipments: ['High Pressure Nitrogen Purging Skid', 'Missile Canister Simulator Box', 'Hydrostatic Vessel Pressure Test Stand'],
          locationInYard: 'Guided Missile & Underwater Weapon Facility',
          phoneExt: 'Dockyard Ext: 8142'
        },
        {
          id: 'oic_hydraulic_pneumatic',
          titleEn: 'OIC Weapon Hydraulic & Fluid Power Shop',
          roleTitle: 'Officer-in-Charge (Hydraulic & Pneumatic)',
          workshopCode: 'WS-19',
          category: 'ordnance',
          officerDesignation: 'Lieutenant, BN (E/ORD)',
          scopeBn: 'High-pressure variable displacement hydraulic axial piston pumps, servo valves, accumulator banks, and pneumatic rams.',
          responsibilities: [
            'Hydraulic fluid contamination testing via laser particle counter and viscosity measurement',
            'Proportional servo control valve spool lapping and flow rate performance testing on simulator bench',
            'Warship steering gear hydraulic cylinders, telemotor rams, and emergency hand pump overhaul',
            '200/300 Bar high-pressure starting air compressors and breathing air charging station maintenance'
          ],
          keyEquipments: ['Hydraulic Component Universal Test Rig (350 Bar)', 'Laser Liquid Particle Counter', 'Pneumatic Ram Dynamic Cycle Tester'],
          locationInYard: 'Fluid Power Technology Center',
          phoneExt: 'Dockyard Ext: 8143'
        },
        {
          id: 'oic_small_arms_mag',
          titleEn: 'OIC Small Arms & Pyrotechnic Store',
          roleTitle: 'Officer-in-Charge (Small Arms)',
          workshopCode: 'WS-07',
          category: 'ordnance',
          officerDesignation: 'Lieutenant, BN (X)',
          scopeBn: 'Shipboard heavy machine guns (12.7mm, 14.5mm), assault rifles, flare pistols, and pyrotechnic life-saving markers.',
          responsibilities: [
            'Machine gun pintle mounts, blast shields, and deck traversing lock mechanisms maintenance',
            'Complete field-strip cleaning, headspace gauging, and firing pin protrusion check on small arms',
            'Ammunition magazine climate condition logging and dehumidifier verification',
            'Emergency naval signal flares and smoke markers expiration and storage condition control'
          ],
          keyEquipments: ['Headspace & Caliber Gauge Sets', 'Ultrasonic Weapons Cleaning Bath', 'Armory Test Firing Tank'],
          locationInYard: 'Armament Depot Block-C',
          phoneExt: 'Dockyard Ext: 8144'
        }
      ]
    },
    {
      id: 'dgm_sr',
      code: 'DGM (SR)',
      dgmTitleEn: 'Deputy General Manager (Ship Repair)',
      dgmTitleBn: 'Deputy General Manager (Ship Repair)',
      category: 'ship_repair',
      accentColor: 'border-emerald-500/50',
      badgeBg: 'bg-emerald-500/15',
      badgeBorder: 'border-emerald-400/40',
      textColor: 'text-emerald-300',
      icon: <Hammer className="h-5 w-5 text-emerald-400" />,
      summaryEn: 'Coordinates overall warship drydocking, harbour and sea acceptance trials (HAT/SAT), yard safety, and slipway operations.',
      units: [
        {
          id: 'sro_hull',
          titleEn: 'SRO (Hull)',
          roleTitle: 'Ship Repair Officer (Hull)',
          category: 'ship_repair',
          officerDesignation: 'Lieutenant Commander, BN (E/HULL)',
          scopeBn: 'Drydocking planning, docking block positioning, undocking safety, and underwater hull integrity coordination.',
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
          titleEn: 'SRO (Mech)',
          roleTitle: 'Ship Repair Officer (Mechanical)',
          category: 'ship_repair',
          officerDesignation: 'Lieutenant Commander, BN (E)',
          scopeBn: 'On-board machinery overhaul oversight, propulsion shafting deflection tests, and harbour acceptance trials (HAT).',
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
          titleEn: 'SRO (W & L)',
          roleTitle: 'Ship Repair Officer (Weapon & Electrical)',
          category: 'ship_repair',
          officerDesignation: 'Lieutenant Commander, BN (L)',
          scopeBn: 'On-board electrical power grid testing, shore power connection monitoring, and combat sensor trials.',
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
          titleEn: 'SRO (Ord)',
          roleTitle: 'Ship Repair Officer (Ordnance)',
          category: 'ship_repair',
          officerDesignation: 'Lieutenant Commander, BN (X/ORD)',
          scopeBn: 'Gun mount on-board installation alignment, target tracking link integration, and safety firing protocols.',
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
          titleEn: 'Safety Officer',
          roleTitle: 'Dockyard Safety & Occupational Health Officer',
          category: 'ship_repair',
          officerDesignation: 'Lieutenant / Warrant Officer, BN',
          scopeBn: 'Dockyard hot-work permits, confined space gas-free clearance, personal protective equipment (PPE), and fire patrol.',
          responsibilities: [
            'Issuance of gas-free certificates using 4-gas analyzers prior to welding in fuel and lube oil tanks',
            'Hot Work Permit issuance and 24-hour fire watch sentry deployment enforcement',
            'Safety helmet, boots, and eye protection PPE enforcement across drydocks and workshops',
            'Conducting periodic fire drills and emergency rescue exercises with Naval Dockyard Fire Station'
          ],
          keyEquipments: ['Digital Multi-Gas Detector (LEL, O2, CO, H2S)', 'Explosimeter', 'Mobile Foam Fire Fighting Units'],
          locationInYard: 'Dockyard Safety Center & Fire Station',
          phoneExt: 'Dockyard Ext: 8155 / Emergency: 999'
        },
        {
          id: 'oic_bn_slipway',
          titleEn: 'OIC BN SLIPWAY',
          roleTitle: 'Officer-in-Charge (BN Slipway Operations)',
          workshopCode: 'WS-27',
          category: 'ship_repair',
          officerDesignation: 'Lieutenant Commander / Lieutenant, BN',
          scopeBn: 'Slipping and launching of naval vessels, slipway cradle maintenance, and winch operations.',
          responsibilities: [
            'Calculation of tidal heights and execution of safe slipping and launching schedules',
            'Underwater rail track, rollers, and heavy draft winch cable lubrication and inspection',
            'Side shoring alignment and keel block load distribution monitoring on slipway cradles',
            'Slot management for patrol craft, landing craft (LCT), and speed boats needing fast repairs'
          ],
          keyEquipments: ['500-Ton Capacity Slipway Cradle & Winch', 'Diving Inspection Team Support', 'Hydraulic Pulling Jacks'],
          locationInYard: 'BN Slipway Control Tower',
          phoneExt: 'Dockyard Ext: 8156'
        }
      ]
    }
  ], []);

  // Compute live defect statistics for a workshop
  const getDefectStatsForUnit = (workshopCode?: string, titleEn?: string) => {
    if (!workshopCode && !titleEn) return { total: 0, pending: 0, resolved: 0 };
    
    const matched = defects.filter(d => {
      if (workshopCode && d.workshopCode === workshopCode) return true;
      if (d.workshop && (
        (workshopCode && d.workshop.includes(workshopCode)) || 
        (titleEn && d.workshop.toLowerCase().includes(titleEn.toLowerCase().replace('oic ', '')))
      )) return true;
      return false;
    });

    const total = matched.length;
    const resolved = matched.filter(d => d.status === 'Solved').length;
    const pending = total - resolved;

    return { total, pending, resolved };
  };

  // Filtered Groups according to user selected DGM
  const filteredGroups = useMemo(() => {
    return dgmGroups.filter(grp => {
      if (selectedDgm !== 'all' && grp.id !== selectedDgm) return false;
      return true;
    }).map(grp => {
      if (!searchQuery.trim()) return grp;
      const q = searchQuery.toLowerCase();
      const filteredUnits = grp.units.filter(u => 
        u.titleEn.toLowerCase().includes(q) ||
        (u.workshopCode && u.workshopCode.toLowerCase().includes(q)) ||
        u.scopeBn.toLowerCase().includes(q) ||
        u.officerDesignation.toLowerCase().includes(q)
      );
      return {
        ...grp,
        units: filteredUnits
      };
    }).filter(grp => grp.units.length > 0 || !searchQuery.trim());
  }, [dgmGroups, selectedDgm, searchQuery]);

  // Overall totals
  const totalUnitsCount = useMemo(() => {
    return dgmGroups.reduce((acc, grp) => acc + grp.units.length, 0);
  }, [dgmGroups]);

  return (
    <div id="production-department-container" className="space-y-6 text-white pb-12">
      
      {/* =========================================================================
          TOP COMMAND BANNER: GENERAL MANAGER (PRODUCTION)
          - Large Crest Logo on Left
          - Prominent, Large Arranged Typography on Right
          - Card View and Print Buttons completely removed (Only Tree View retained)
      ========================================================================= */}
      <div className="bg-[#001733]/95 backdrop-blur-xl border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background radar circles */}
        <div className="absolute -right-16 -top-16 w-72 h-72 border border-cyan-500/10 rounded-full pointer-events-none"></div>
        <div className="absolute -right-8 -top-8 w-56 h-56 border border-amber-400/10 rounded-full pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          
          {/* Bangladesh Navy Anchor Crest - BIGGER AS REQUESTED */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-3xl p-2 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 border-3 border-amber-300 shadow-2xl shadow-amber-500/30 flex items-center justify-center shrink-0">
            <img 
              src="/anchor.jpg" 
              alt="Navy Anchor Crest" 
              className="w-full h-full object-contain rounded-2xl bg-black" 
            />
          </div>

          {/* Texts Beside Logo - LARGER & NEATLY ARRANGED AS REQUESTED */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-500/25 text-amber-300 border border-amber-400/50">
                BN DOCKYARD PRODUCTION WING
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-cyan-500/25 text-cyan-300 border border-cyan-400/50">
                5 DGM DIVISIONS • 25 WORKSHOPS & UNITS
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-wider font-algerian uppercase drop-shadow-md">
              PRODUCTION DEPARTMENT
            </h1>
            
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-amber-400 flex items-center gap-2 mt-1 font-algerian">
              <Building2 className="h-5 w-5 text-amber-400 shrink-0" />
              <span>GENERAL MANAGER (PRODUCTION) — ORGANIZATIONAL HIERARCHY</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-200 mt-2.5 max-w-4xl leading-relaxed font-medium">
              General Manager (Production) has Deputy General Managers under him to assist in his day to day activities. 
              The OIC's of workshops work under Deputy General Managers.
            </p>
          </div>

        </div>

        {/* Live Filter & Search Strip */}
        <div className="mt-6 pt-5 border-t border-white/15 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* DGM Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedDgm('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                selectedDgm === 'all'
                  ? 'bg-amber-400 text-[#001733] shadow-md font-extrabold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              ALL DGMS ({totalUnitsCount})
            </button>

            {dgmGroups.map(grp => (
              <button
                key={grp.id}
                type="button"
                onClick={() => setSelectedDgm(grp.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedDgm === grp.id
                    ? `${grp.badgeBg} ${grp.textColor} border ${grp.badgeBorder} shadow-md font-extrabold`
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                <span>{grp.code}</span>
                <span className="text-[10px] opacity-80">({grp.units.length})</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workshop or OIC designation..."
              className="w-full bg-[#001026] border border-cyan-500/40 rounded-xl pl-10 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
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

        </div>
      </div>

      {/* =========================================================================
          THE ORGANIZATIONAL HIERARCHICAL TREE VIEW (ONLY VIEW RETAINED)
      ========================================================================= */}
      <div className="bg-[#00142e]/90 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-10 overflow-x-auto">
        
        {/* ROOT COMMAND NODE: GENERAL MANAGER (PRODUCTION) */}
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-r from-amber-500/25 via-[#002855] to-amber-500/25 border-2 border-amber-400 rounded-3xl p-5 text-center shadow-2xl max-w-xl w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-[11px] font-bold uppercase mb-1.5 font-algerian">
              HEADQUARTERS COMMAND • PRODUCTION WING
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-algerian uppercase tracking-wider">
              GENERAL MANAGER (PRODUCTION)
            </h2>
            <p className="text-xs sm:text-sm text-amber-300 font-semibold mt-0.5">
              Command Headquarters — Head of Production Directorate
            </p>
            <p className="text-xs text-slate-200 mt-2 leading-relaxed">
              Supervises overall dockyard technical operations and coordinates the 5 Deputy General Managers (DGMs).
            </p>
          </div>

          {/* Vertical connector line */}
          <div className="w-1 h-10 bg-gradient-to-b from-amber-400 to-cyan-400 my-1"></div>
          
          {/* Horizontal line across DGMs */}
          <div className="w-full max-w-6xl h-0.5 bg-cyan-500/40 hidden md:block"></div>
        </div>

        {/* 5 DGM SUB-TREES */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 pt-2">
          {filteredGroups.map((group) => (
            <div key={group.id} className="flex flex-col space-y-3">
              
              {/* DGM Node Header */}
              <div className={`rounded-2xl p-4 border ${group.badgeBorder} ${group.badgeBg} text-center shadow-lg relative`}>
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute -top-1.5 left-1/2 -translate-x-1/2 hidden md:block ring-2 ring-cyan-300"></div>
                <div className="flex items-center justify-center mb-1.5">
                  {group.icon}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white leading-tight font-algerian uppercase">
                  {group.dgmTitleEn}
                </h3>
                <div className="text-[10px] text-amber-300 mt-1 font-mono font-bold">
                  {group.code} • {group.units.length} UNITS
                </div>
              </div>

              {/* Units & Workshops under this DGM */}
              <div className="space-y-2.5 pl-3 border-l-2 border-dashed border-cyan-500/40">
                {group.units.map((unit) => {
                  const stats = getDefectStatsForUnit(unit.workshopCode, unit.titleEn);

                  return (
                    <div
                      key={unit.id}
                      onClick={() => setSelectedUnit(unit)}
                      className="bg-[#001026]/90 hover:bg-[#001f3f] border border-white/10 hover:border-amber-400/60 p-3 rounded-xl text-left transition-all cursor-pointer shadow-md group hover:scale-[1.02]"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          {unit.workshopCode || 'OFFICER'}
                        </span>
                        
                        {stats.total > 0 && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            stats.pending > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {stats.pending > 0 ? `${stats.pending} Def` : 'OK'}
                          </span>
                        )}

                        <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-300 transition-colors shrink-0" />
                      </div>

                      <div className="text-xs font-bold text-slate-100 group-hover:text-amber-300 mt-1.5 leading-snug">
                        {unit.titleEn}
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono truncate mt-1">
                        {unit.officerDesignation}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* =========================================================================
          DETAILED UNIT INSPECTION MODAL DIALOG (ENGLISH)
      ========================================================================= */}
      {selectedUnit && (
        <div 
          id="unit-detail-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedUnit(null)}
        >
          <div 
            className="bg-[#00142e] border-2 border-amber-400/70 rounded-3xl max-w-2xl w-full p-6 sm:p-7 text-white shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl text-[#001733] font-bold shadow-md shrink-0">
                  <Wrench className="h-6 w-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-400 text-[#001733]">
                      {selectedUnit.workshopCode || 'OFFICER CELL'}
                    </span>
                    <span className="text-xs text-cyan-300 font-semibold font-mono">
                      PRODUCTION DEPARTMENT
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-1 font-algerian uppercase">
                    {selectedUnit.titleEn}
                  </h3>
                  <h4 className="text-xs text-amber-300 font-mono">
                    {selectedUnit.roleTitle}
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUnit(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Officer in Charge Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#000f24] border border-white/10 p-3.5 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Designated Officer / Rank</span>
                <span className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-amber-400 shrink-0" />
                  {selectedUnit.officerDesignation}
                </span>
              </div>

              <div className="bg-[#000f24] border border-white/10 p-3.5 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Location & Contact</span>
                <span className="text-xs font-semibold text-cyan-200 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  {selectedUnit.phoneExt || 'Dockyard Exchange'}
                </span>
                <span className="text-[11px] text-slate-300 block">
                  {selectedUnit.locationInYard}
                </span>
              </div>
            </div>

            {/* Primary Functional Scope */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-amber-300 uppercase">Primary Scope of Work:</span>
              <p className="text-xs sm:text-sm text-slate-200 bg-[#001026] border border-white/5 p-3.5 rounded-2xl leading-relaxed">
                {selectedUnit.scopeBn}
              </p>
            </div>

            {/* Responsibilities */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-cyan-300 uppercase">Specific Technical Responsibilities:</span>
              <ul className="space-y-2">
                {selectedUnit.responsibilities.map((resp, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Machineries / Equipments */}
            {selectedUnit.keyEquipments && selectedUnit.keyEquipments.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Key Machinery & Workshop Equipment:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUnit.keyEquipments.map((eq, i) => (
                    <span key={i} className="text-[11px] bg-white/10 border border-white/10 text-slate-200 px-3 py-1 rounded-xl">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400 font-mono">
                <span>Reporting Chain: </span>
                <span className="text-white font-semibold">General Manager (Production) ➔ Deputy General Manager</span>
              </div>

              <div className="flex items-center gap-2">
                {selectedUnit.workshopCode && onNavigateToSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToSearch(selectedUnit.workshopCode);
                      setSelectedUnit(null);
                    }}
                    className="px-3.5 py-2 bg-white/10 hover:bg-cyan-500/20 border border-white/20 text-cyan-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Filter Defects
                  </button>
                )}

                {onNavigateToEntry && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToEntry(undefined, selectedUnit.workshopCode);
                      setSelectedUnit(null);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-[#001733] rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer flex items-center gap-1.5 uppercase font-algerian"
                  >
                    <span>Log Defect</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
