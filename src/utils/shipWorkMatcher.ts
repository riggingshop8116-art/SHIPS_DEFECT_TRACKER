import { Defect, Workshop } from '../types';
import { ShipCompartment } from '../data/shipInspectionData';

/**
 * Normalizes ship names across English, Bengali digits and variations.
 * Example: 'BNS Bangabandhu (এফ ২৫)' and 'BNS Bangabandhu (F 25)' normalize to the same key.
 */
export const normalizeShipName = (name?: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[()（）]/g, ' ')
    .replace(/এফ/g, 'f')
    .replace(/পি/g, 'p')
    .replace(/০/g, '0')
    .replace(/১/g, '1')
    .replace(/২/g, '2')
    .replace(/৩/g, '3')
    .replace(/৪/g, '4')
    .replace(/৫/g, '5')
    .replace(/৬/g, '6')
    .replace(/৭/g, '7')
    .replace(/৮/g, '8')
    .replace(/৯/g, '9')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Checks if two ship names refer to the same vessel.
 */
export const isSameShip = (a?: string, b?: string): boolean => {
  if (!a || !b) return false;
  const cleanA = a.trim();
  const cleanB = b.trim();
  if (cleanA === cleanB) return true;
  if (cleanA.toLowerCase() === 'all' || cleanB.toLowerCase() === 'all') return true;

  const normA = normalizeShipName(cleanA);
  const normB = normalizeShipName(cleanB);
  if (normA === normB) return true;

  // Extract pennants e.g. "f 25", "f 28", "f 17", "p 811"
  const pennantA = normA.match(/[fp]\s*\d+/)?.[0]?.replace(/\s+/, '');
  const pennantB = normB.match(/[fp]\s*\d+/)?.[0]?.replace(/\s+/, '');
  if (pennantA && pennantB) {
    return pennantA === pennantB;
  }

  // Extract major name tokens excluding pennants
  const cleanWordsA = normA.replace(/[fp]\s*\d+/g, '').split(' ').filter(w => w.length > 2 && w !== 'bns');
  const cleanWordsB = normB.replace(/[fp]\s*\d+/g, '').split(' ').filter(w => w.length > 2 && w !== 'bns');

  if (cleanWordsA.length > 0 && cleanWordsB.length > 0) {
    const mainA = cleanWordsA.join(' ');
    const mainB = cleanWordsB.join(' ');
    if (mainA === mainB || mainA.includes(mainB) || mainB.includes(mainA)) {
      return true;
    }
  }

  return false;
};

/**
 * Extracts the pennant or short hull number for display on the 3D ship illustration.
 */
export const getShipPennantNumber = (shipName?: string): string => {
  if (!shipName) return 'F 25';
  const match = shipName.match(/([fFpP]\s*[\d]+|[০-৯\d]+)/);
  if (match) {
    const raw = match[0];
    return normalizeShipName(raw).toUpperCase().replace(/^([FP])(\d)/, '$1 $2');
  }
  const norm = normalizeShipName(shipName);
  if (norm.includes('bangabandhu')) return 'F 25';
  if (norm.includes('somudra joy')) return 'F 28';
  if (norm.includes('ali haider')) return 'F 17';
  if (norm.includes('umar farooq')) return 'F 16';
  if (norm.includes('bijoy')) return 'F 35';
  if (norm.includes('dhaleshwari')) return 'F 36';
  if (norm.includes('prottoy')) return 'F 112';
  if (norm.includes('shadhinota')) return 'F 111';
  if (norm.includes('durjoy')) return 'P 811';
  if (norm.includes('nirmul')) return 'P 813';
  return 'F 25';
};

/**
 * Comprehensive mapping of dockyard location keywords (Bangla, English & common codes)
 * to standard warship compartments (sec-01 through sec-12).
 */
export const LOCATION_COMPARTMENT_MAP: Record<string, string[]> = {
  // SEC-01: Bow & Anchor Windlass Station
  'sec-01': [
    'gangway', 'গ্যাংওয়ে', 'bow', 'windlass', 'anchor', 'বো', 'উইন্ডলাস', 'নোঙর', 
    'forecastle', 'ফোরক্যাসল', 'hawse', 'হস পাইপ', 'mooring capstan', 'ম্যুরিং', 'চেইন লকার'
  ],
  // SEC-02: Forecastle 76mm Main Naval Gun Turret
  'sec-02': [
    'gun', 'naval gun', '76mm', 'কামান', 'গান', 'নেভাল গান', 'গান মাউন্ট', 'turret', 
    'আর্টিলারি', 'artillery', 'ammunition hoist', 'বো মাউন্ট'
  ],
  // SEC-03: Bridge & Wheelhouse (Naval Command Center)
  'sec-03': [
    'bridge', 'wheelhouse', 'navigation', 'ব্রিজ', 'হুইলহাউস', 'কমান্ড সেন্টার', 
    'ককপিট', 'gyrocompass', 'গাইরোকম্পাস', 'অটো পাইলট', 'হেলম'
  ],
  // SEC-04: Main Mast & Surveillance Radar
  'sec-04': [
    'radar', 'mast', 'রাডার', 'মাস্ট', 'surveillance', 'অ্যান্টেনা', 'antenna', 
    'main mast', 'মেইন মাস্ট', 'সার্ভেইল্যান্স', 'sensors'
  ],
  // SEC-05: Combat Information Center (CIC) & Sonar
  'sec-05': [
    'cic', 'sonar', 'সিআইসি', 'সোনার', 'combat', 'ops room', 'অপারেশন রুম', 
    'c4i', 'যুদ্ধ পরিচালনা', 'অ্যাকোস্টিক', 'ecm', 'esm'
  ],
  // SEC-06: Missile Deck & Midship Weapons
  'sec-06': [
    'missile', 'torpedo', 'মিসাইল', 'টর্পেডো', 'c-802', 'launcher', 'লঞ্চার', 
    'ক্ষেপণাস্ত্র', 'antiship', 'midship', 'মিডশিপ'
  ],
  // SEC-07: Propulsion & Main Machinery Space (Main Engine Room)
  'sec-07': [
    'main engine', 'engine', 'propulsion', 'মেইন ইঞ্জিন', 'ইঞ্জিন', 'প্রপালশন', 
    'মেইন ইঞ্জিন রুম', 'engine room', 'shaft', 'শ্যাফট', 'gearbox', 'গিয়ারবক্স', 
    'লুব অয়েল', 'lube oil', 'machinery', 'টারবাইন', 'turbine'
  ],
  // SEC-08: Auxiliary Machinery & Power Gen (DG Sets)
  'sec-08': [
    'generator', 'dg', 'dg-1', 'dg-2', 'diesel generator', 'ডিজি', 'ডিজি-১', 'ডিজি-২', 
    'জেনারেটর', 'switchboard', 'সুইচবোর্ড', 'পাওয়ার জেনারেশন', 'auxiliary machinery', 
    'ডিজেল জেনারেটর', 'dg room'
  ],
  // SEC-09: Chiller, Auxiliary Boiler & Technical Plants
  'sec-09': [
    'chiller', 'ac', 'cooling', 'boiler', 'ro plant', 'চিলার', 'এসি', 'বয়লার', 
    'রেফ্রিজারেশন', 'ac chiller', 'হিমায়ন', 'ওয়াটার প্ল্যান্ট', 'auxiliary boiler'
  ],
  // SEC-10: Helideck & Flight Deck Operations
  'sec-10': [
    'flight deck', 'helipad', 'helideck', 'quarter deck', 'ফ্লাইট ডেক', 'হেলিপ্যাড', 
    'কোয়ার্টার ডেক', 'হ্যাংগার', 'hangar', 'aft deck', 'পিছনের ডেক'
  ],
  // SEC-11: Steering Gear Room & Rudder Compartment
  'sec-11': [
    'steering', 'rudder', 'স্টিয়ারিং', 'রাডার রুম', 'স্টিয়ারিং গিয়ার', 'রাডার ব্লেড', 
    'হাইড্রো স্টিয়ারিং', 'steering gear room'
  ],
  // SEC-12: Hull, Keel & Underwater Hull (Sea Chests)
  'sec-12': [
    'hull', 'sea chest', 'port & stbd', 'port', 'stbd', 'bottom', 'হাল', 'সি-চেস্ট', 
    'সি চেস্ট', 'প্রপেলার', 'propeller', 'ড্রাইডক', 'drydock', 'আন্ডারওয়াটার', 
    'zinc anode', 'জিংক অ্যানোড', 'ক্যাথোডিক'
  ]
};

/**
 * Robustly matches an arbitrary location string (from user entry or system) to a ship compartment.
 */
export const matchLocationToCompartment = (
  locationStr: string | undefined, 
  compartment: { id: string; code: string; locationTag?: string; nameEn?: string; nameBn?: string }
): boolean => {
  if (!locationStr) return false;
  const locNorm = locationStr.trim().toLowerCase();
  const compId = compartment.id.toLowerCase();
  const compCode = compartment.code.toLowerCase();

  // 1. Direct code or ID match
  if (locNorm === compId || locNorm === compCode || locNorm.includes(compCode)) {
    return true;
  }

  // 2. Direct location tag or name match
  if (compartment.locationTag) {
    const tagNorm = compartment.locationTag.toLowerCase();
    if (tagNorm.includes(locNorm) || locNorm.includes(tagNorm)) return true;
  }
  if (compartment.nameEn && (compartment.nameEn.toLowerCase().includes(locNorm) || locNorm.includes(compartment.nameEn.toLowerCase()))) {
    return true;
  }
  if (compartment.nameBn && (compartment.nameBn.includes(locationStr) || locationStr.includes(compartment.nameBn))) {
    return true;
  }

  // 3. Synonym dictionary matching
  const synonyms = LOCATION_COMPARTMENT_MAP[compId] || [];
  return synonyms.some(syn => locNorm.includes(syn) || syn.includes(locNorm));
};

/**
 * Aliases and multilingual keywords for each of the 27 Dockyard workshops.
 */
export const WORKSHOP_ALIASES: Record<string, string[]> = {
  'WS-01': ['WS-01', 'RIGGING', 'রিগিং', 'LIFTING', 'CABLE', 'ROPE', 'DOCKING', 'SAKIB', 'স্কেফোল্ডিং'],
  'WS-02': ['WS-02', 'MACHINE', 'মেশিন', 'LATHE', 'MACHINING', 'লেদ', 'টার্নিং', 'মিলিং', 'MILLING', 'BORING'],
  'WS-03': ['WS-03', 'HULL', 'STRUCTURAL', 'হাল', 'স্ট্রাকচারাল', 'কাঠামো', 'PLATING', 'প্লেটিং'],
  'WS-04': ['WS-04', 'WELDING', 'FABRICATION', 'ওয়েল্ডিং', 'ফেব্রিকেশন', 'TIG', 'MIG'],
  'WS-05': ['WS-05', 'ELECTRICAL', 'ইলেকট্রিক্যাল', 'POWER', 'বিদ্যুৎ', 'SWITCHBOARD', 'GENERATOR', 'মোটর'],
  'WS-06': ['WS-06', 'ELECTRONICS', 'RADAR', 'ইলেকট্রনিক্স', 'রাডার', 'SONAR', 'সোনার'],
  'WS-07': ['WS-07', 'WEAPON', 'ORDNANCE', 'ওয়েপন', 'আর্মামেন্ট', 'কামান', 'মিসাইল', 'GUN', 'MISSILE', 'অর্ডন্যান্স'],
  'WS-08': ['WS-08', 'IC ENGINE', 'DIESEL', 'আইসি ইঞ্জিন', 'ডিজেল', 'PROPULSION'],
  'WS-09': ['WS-09', 'PIPE', 'PLUMBING', 'পাইপ', 'প্লাম্বিং', 'VALVE', 'ভালভ'],
  'WS-10': ['WS-10', 'PAINT', 'PAINTING', 'PRESERVATION', 'পেইন্ট', 'পেইন্টিং', 'রং', 'সংরক্ষণ', 'BLASTING', 'COATING', 'ANTI-FOULING', 'ব্লাস্টিং', 'কোটিং', 'প্রিজারভেশন'],
  'WS-11': ['WS-11', 'BOILER', 'STEAM', 'বয়লার', 'স্টিম', 'CALORIFIER'],
  'WS-12': ['WS-12', 'GAS TURBINE', 'TURBINE', 'গ্যাস টারবাইন', 'টারবাইন'],
  'WS-13': ['WS-13', 'SAIL LOFT', 'SURVIVAL', 'সেইল লফট', 'সারভাইভাল', 'LIFE RAFT', 'লাইফ র‍্যাফট', 'CANOPY'],
  'WS-14': ['WS-14', 'FOUNDRY', 'CASTING', 'ফাউন্ড্রি', 'কাস্টিং', 'METAL CASTING', 'মেটাল কাস্টিং', 'BRONZE', 'ব্রোঞ্জ'],
  'WS-15': ['WS-15', 'SHIPWRIGHT', 'CARPENTRY', 'শিপরাইট', 'কার্পেন্ট্রি', 'WOODWORK', 'উডওয়ার্ক', 'ডকিং'],
  'WS-16': ['WS-16', 'TOOL ROOM', 'TOOLING', 'PRECISION', 'টুল রুম', 'প্রিসিশন শপ', 'GAUGE', 'গেজ'],
  'WS-17': ['WS-17', 'OPTICAL', 'FIRE CONTROL', 'অপটিক্যাল', 'ফায়ার কন্ট্রোল', 'DIRECTOR', 'RANGEFINDER', 'রেঞ্জফাইন্ডার'],
  'WS-18': ['WS-18', 'REFRIGERATION', 'HVAC', 'CHILLER', 'রেফ্রিজারেশন', 'এইচভিএসি', 'এসি', 'চিলার', 'কুলিং'],
  'WS-19': ['WS-19', 'HYDRAULIC', 'PNEUMATIC', 'হাইড্রোলিক', 'নিউমেটিক', 'FLUID POWER'],
  'WS-20': ['WS-20', 'ELECTROPLATE', 'ELECTROPLATING', 'GALVANIZING', 'ইলেক্ট্রোপ্লেটিং', 'গ্যালভানাইজিং', 'ANODE', 'অ্যানোড', 'SURFACE TREATMENT'],
  'WS-21': ['WS-21', 'BATTERY', 'POWER STORAGE', 'ব্যাটারি', 'পাওয়ার স্টোরেজ', 'CHARGING'],
  'WS-22': ['WS-22', 'UNDERWATER', 'DIVING', 'আন্ডারওয়াটার', 'ডাইভিং', 'SUBSEA', 'DIVER'],
  'WS-23': ['WS-23', 'TELECOMMUNICATION', 'NAV-AIDS', 'টেলিকমিউনিকেশন', 'ন্যাভ-এইডস', 'RADIO', 'রেডিও', 'COMMUNICATION'],
  'WS-24': ['WS-24', 'CALIBRATION', 'INSTRUMENTATION', 'ক্যালিব্রেশন', 'ইনস্ট্রুমেন্টেশন', 'TESTING'],
  'WS-25': ['WS-25', 'QUALITY CONTROL', 'NDT', 'কোয়ালিটি কন্ট্রোল', 'এনডিটি', 'QUALITY ASSURANCE', 'ULTRASONIC'],
  'WS-26': ['WS-26', 'PROPELLER', 'SHAFT', 'ALIGNMENT', 'প্রপেলার', 'শ্যাফট', 'অ্যালাইনমেন্ট', 'TAILSHAFT', 'BEARING', 'COUPLING'],
  'WS-27': ['WS-27', 'YARD SERVICES', 'HEAVY TRANSPORT', 'ইয়ার্ড সার্ভিসেস', 'হেভি ট্রান্সপোর্ট', 'CRANE', 'ক্রেন', 'LOGISTICS']
};

/**
 * Checks if a defect is assigned or owned by the given workshop.
 * Strictly guarantees that explicit workshopCode assignments (WS-01 through WS-27)
 * are respected and never accidentally leaked to other workshops.
 */
export const isDefectForWorkshop = (defect: Defect, ws: Workshop | string | null | undefined): boolean => {
  if (!ws) return true;
  const target = typeof ws === 'string' ? ws.trim().toUpperCase() : ws.code.trim().toUpperCase();
  if (target === 'ALL') return true;

  const defWsCode = (defect.workshopCode || '').trim().toUpperCase();
  const defWsText = (defect.workshop || '').trim().toUpperCase();

  // 1. Authoritative explicit workshopCode check
  if (defWsCode) {
    if (defWsCode === target) {
      return true;
    }
    // If the defect explicitly specifies a known workshop code (WS-01 to WS-27),
    // and target is also a workshop code, it belongs to that other workshop!
    const isDefWsCodePattern = /^WS-\d{2}$/i.test(defWsCode);
    const isTargetWsCodePattern = /^WS-\d{2}$/i.test(target);
    if (isDefWsCodePattern && isTargetWsCodePattern) {
      return false;
    }
  }

  // 2. Direct workshop object equality check
  if (typeof ws === 'object' && ws !== null) {
    if (ws.nameEn && defWsText === ws.nameEn.trim().toUpperCase()) return true;
    if (ws.nameBn && (defect.workshop || '').trim() === ws.nameBn.trim()) return true;
    if (ws.code && defWsCode === ws.code.toUpperCase()) return true;
  }

  // 3. Normalized alias matching
  let wsKey = target;
  if (!WORKSHOP_ALIASES[wsKey]) {
    for (const [code, aliases] of Object.entries(WORKSHOP_ALIASES)) {
      if (aliases.some(a => target === a)) {
        wsKey = code;
        break;
      }
    }
  }

  const aliases = WORKSHOP_ALIASES[wsKey] || [target];

  // Match defect.workshopCode against target aliases
  if (defWsCode && aliases.some(a => defWsCode === a)) {
    return true;
  }

  // Match defect.workshop text against target aliases (only if no conflicting workshopCode exists)
  if (defWsText) {
    // If defect has an explicit workshopCode for another WS, do not match via text
    if (defWsCode && /^WS-\d{2}$/i.test(defWsCode) && defWsCode !== wsKey) {
      return false;
    }

    for (const alias of aliases) {
      if (alias.length <= 2) continue; // skip short acronyms for substring search
      if (defWsText === alias || defWsText.includes(alias)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Gets all defects belonging to a specific workshop on a specific ship.
 */
export const getWorkshopDefectsOnShip = (
  defects: Defect[], 
  shipName: string, 
  ws?: Workshop | string | null
): Defect[] => {
  return defects.filter(d => 
    isSameShip(d.shipName, shipName) && 
    isDefectForWorkshop(d, ws)
  );
};

export interface LocationWorkGroup {
  location: string;
  compartmentId: string;
  compartmentCode: string;
  compartmentNameEn: string;
  compartmentNameBn: string;
  defects: Defect[];
  pendingCount: number;
  solvedCount: number;
  hasActiveSignal: boolean;
}

/**
 * Groups works/defects on a ship for a specific workshop by location.
 * Enables showing exact ship locations under that shop with active work signals.
 */
export const getShopLocationsOnShip = (
  shipName: string,
  ws: Workshop | string | null | undefined,
  defects: Defect[],
  compartments: ShipCompartment[]
): LocationWorkGroup[] => {
  // 1. Filter defects belonging to this ship and workshop
  const shipWsDefects = defects.filter(d => 
    isSameShip(d.shipName, shipName) && isDefectForWorkshop(d, ws)
  );

  // 2. Group defects by location
  const locationMap = new Map<string, Defect[]>();
  shipWsDefects.forEach(d => {
    const loc = (d.location || 'General Station').trim();
    if (!locationMap.has(loc)) {
      locationMap.set(loc, []);
    }
    locationMap.get(loc)!.push(d);
  });

  // 3. For each location, find matching compartment
  const groups: LocationWorkGroup[] = [];
  locationMap.forEach((locDefects, locName) => {
    const matchedComp = compartments.find(c => matchLocationToCompartment(locName, c)) || compartments[0];
    const pendingCount = locDefects.filter(d => d.status === 'Pending').length;
    const solvedCount = locDefects.filter(d => d.status === 'Solved').length;

    groups.push({
      location: locName,
      compartmentId: matchedComp.id,
      compartmentCode: matchedComp.code,
      compartmentNameEn: matchedComp.nameEn,
      compartmentNameBn: matchedComp.nameBn,
      defects: locDefects,
      pendingCount,
      solvedCount,
      hasActiveSignal: pendingCount > 0
    });
  });

  // Sort: locations with pending defects first, then by total defects
  return groups.sort((a, b) => b.pendingCount - a.pendingCount || b.defects.length - a.defects.length);
};

