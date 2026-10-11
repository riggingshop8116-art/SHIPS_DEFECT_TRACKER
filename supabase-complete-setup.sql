-- ==============================================================================
-- BANGLADESH NAVY DOCKYARD DEFECT TRACKER - SUPABASE FULL DATABASE & STORAGE SETUP
-- Project URL: https://xfhxwlhklgdcffhrmtkg.supabase.co
-- Project ID: xfhxwlhklgdcffhrmtkg
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. STORAGE BUCKET CREATION (dockyard-media)
-- ------------------------------------------------------------------------------

-- Insert the storage bucket if not already present
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dockyard-media',
  'dockyard-media',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- Storage Bucket RLS Policies for dockyard-media
DROP POLICY IF EXISTS "Public Media Read Access" ON storage.objects;
CREATE POLICY "Public Media Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'dockyard-media');

DROP POLICY IF EXISTS "Public Media Insert Access" ON storage.objects;
CREATE POLICY "Public Media Insert Access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dockyard-media');

DROP POLICY IF EXISTS "Public Media Update Access" ON storage.objects;
CREATE POLICY "Public Media Update Access"
ON storage.objects FOR UPDATE
USING (bucket_id = 'dockyard-media')
WITH CHECK (bucket_id = 'dockyard-media');

DROP POLICY IF EXISTS "Public Media Delete Access" ON storage.objects;
CREATE POLICY "Public Media Delete Access"
ON storage.objects FOR DELETE
USING (bucket_id = 'dockyard-media');


-- ------------------------------------------------------------------------------
-- 2. TABLE SCHEMAS
-- ------------------------------------------------------------------------------

-- Table: defects
CREATE TABLE IF NOT EXISTS public.defects (
  id TEXT PRIMARY KEY,
  workshop TEXT NOT NULL,
  ship TEXT NOT NULL,
  location TEXT NOT NULL,
  defect_date TEXT NOT NULL,
  defect_desc TEXT NOT NULL,
  defect_image TEXT,
  solution_date TEXT,
  solution_desc TEXT,
  solution_image TEXT,
  status TEXT NOT NULL DEFAULT 'In Progress',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: workshops
CREATE TABLE IF NOT EXISTS public.workshops (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  category TEXT NOT NULL,
  oic_rank TEXT NOT NULL,
  oic_name TEXT NOT NULL,
  phone_ext TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  description TEXT,
  photo TEXT,
  username TEXT,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: ships
CREATE TABLE IF NOT EXISTS public.ships (
  name TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: locations
CREATE TABLE IF NOT EXISTS public.locations (
  name TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: dockyard_config
CREATE TABLE IF NOT EXISTS public.dockyard_config (
  id TEXT PRIMARY KEY,
  yard_name_en TEXT NOT NULL,
  yard_name_bn TEXT NOT NULL,
  tagline_en TEXT NOT NULL,
  tagline_bn TEXT NOT NULL,
  rigging_shop_name TEXT,
  bg_intensity TEXT DEFAULT 'medium',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: user_profile
CREATE TABLE IF NOT EXISTS public.user_profile (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rank TEXT NOT NULL,
  p_no TEXT NOT NULL,
  appointment TEXT NOT NULL,
  intercom TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  unit TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE public.defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dockyard_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;

-- Defects RLS
DROP POLICY IF EXISTS "Public Defect Read" ON public.defects;
CREATE POLICY "Public Defect Read" ON public.defects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Defect Insert" ON public.defects;
CREATE POLICY "Public Defect Insert" ON public.defects FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Defect Update" ON public.defects;
CREATE POLICY "Public Defect Update" ON public.defects FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public Defect Delete" ON public.defects;
CREATE POLICY "Public Defect Delete" ON public.defects FOR DELETE USING (true);

-- Workshops RLS
DROP POLICY IF EXISTS "Public Workshops Read" ON public.workshops;
CREATE POLICY "Public Workshops Read" ON public.workshops FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Workshops Insert" ON public.workshops;
CREATE POLICY "Public Workshops Insert" ON public.workshops FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Workshops Update" ON public.workshops;
CREATE POLICY "Public Workshops Update" ON public.workshops FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public Workshops Delete" ON public.workshops;
CREATE POLICY "Public Workshops Delete" ON public.workshops FOR DELETE USING (true);

-- Ships RLS
DROP POLICY IF EXISTS "Public Ships Read" ON public.ships;
CREATE POLICY "Public Ships Read" ON public.ships FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Ships Insert" ON public.ships;
CREATE POLICY "Public Ships Insert" ON public.ships FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Ships Delete" ON public.ships;
CREATE POLICY "Public Ships Delete" ON public.ships FOR DELETE USING (true);

-- Locations RLS
DROP POLICY IF EXISTS "Public Locations Read" ON public.locations;
CREATE POLICY "Public Locations Read" ON public.locations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Locations Insert" ON public.locations;
CREATE POLICY "Public Locations Insert" ON public.locations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Locations Delete" ON public.locations;
CREATE POLICY "Public Locations Delete" ON public.locations FOR DELETE USING (true);

-- Dockyard Config RLS
DROP POLICY IF EXISTS "Public Config Read" ON public.dockyard_config;
CREATE POLICY "Public Config Read" ON public.dockyard_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Config Insert" ON public.dockyard_config;
CREATE POLICY "Public Config Insert" ON public.dockyard_config FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Config Update" ON public.dockyard_config;
CREATE POLICY "Public Config Update" ON public.dockyard_config FOR UPDATE USING (true);

-- User Profile RLS
DROP POLICY IF EXISTS "Public Profile Read" ON public.user_profile;
CREATE POLICY "Public Profile Read" ON public.user_profile FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Profile Insert" ON public.user_profile;
CREATE POLICY "Public Profile Insert" ON public.user_profile FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Profile Update" ON public.user_profile;
CREATE POLICY "Public Profile Update" ON public.user_profile FOR UPDATE USING (true);


-- ------------------------------------------------------------------------------
-- 4. REALTIME PUBLICATION SETUP
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.defects;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.workshops;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dockyard_config;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ships;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.locations;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profile;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;


-- ------------------------------------------------------------------------------
-- 5. INITIAL DATA SEEDING (27 Workshops, Default Ships, Locations, Config)
-- ------------------------------------------------------------------------------

-- Default Dockyard Config
INSERT INTO public.dockyard_config (id, yard_name_en, yard_name_bn, tagline_en, tagline_bn, rigging_shop_name, bg_intensity)
VALUES (
  'default',
  'BANGLADESH NAVAL DOCKYARD',
  'বাংলাদেশ নৌ ডকইয়ার্ড',
  'TECHNICAL EXCELLENCE & FLEET COMBAT READINESS',
  'কারিগরি দক্ষতা ও নৌবহরের সার্বক্ষণিক যুদ্ধপ্রস্তুতি',
  'Rigging & Sail Loft Shop',
  'medium'
)
ON CONFLICT (id) DO UPDATE SET
  yard_name_en = EXCLUDED.yard_name_en,
  yard_name_bn = EXCLUDED.yard_name_bn,
  tagline_en = EXCLUDED.tagline_en,
  tagline_bn = EXCLUDED.tagline_bn,
  updated_at = NOW();

-- Default Admin Profile
INSERT INTO public.user_profile (id, name, rank, p_no, appointment, intercom, email, avatar, unit)
VALUES (
  'admin_default',
  'T M Sazzad',
  'Commodore',
  'P-1045',
  'Managing Director & Chief Engineer',
  '4001',
  'md.dockyard@navy.mil.bd',
  '',
  'Naval Dockyard Headquarters'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  rank = EXCLUDED.rank,
  appointment = EXCLUDED.appointment,
  intercom = EXCLUDED.intercom,
  email = EXCLUDED.email,
  unit = EXCLUDED.unit,
  updated_at = NOW();

-- All 27 Bangladesh Naval Dockyard Workshops
INSERT INTO public.workshops (id, code, name_en, name_bn, category, oic_rank, oic_name, phone_ext, status, description, username, password)
VALUES
('ws-01', 'WS-01', 'Hull & Structural Fabrication Shop', 'Hull & Structural Fabrication Shop', 'Hull & Structure', 'Commander', 'M S Islam', '4201', 'active', 'Heavy structural plating, underwater shell repairs, watertight bulkheads, and collision damage rectification.', 'oic.ws01', '123456'),
('ws-02', 'WS-02', 'Marine Engineering & Turning Shop', 'Marine Engineering & Turning Shop', 'Heavy Machining', 'Lt Commander', 'A H Chowdhury', '4202', 'active', 'Precision shaft machining, rudder pintles, stern tube bushings, and propulsion alignment.', 'oic.ws02', '123456'),
('ws-03', 'WS-03', 'Plate & Sheet Metal Forming Shop', 'Plate & Sheet Metal Forming Shop', 'Metal Fabrication', 'Lieutenant', 'M T Hossain', '4203', 'active', 'Hydraulic bending, cold plate forming, structural ventilation trunking, and coamings.', 'oic.ws03', '123456'),
('ws-04', 'WS-04', 'Welding & Metallurgy Laboratory', 'Welding & Metallurgy Laboratory', 'Metal Joining', 'Lieutenant', 'K R Hasan', '4204', 'active', 'TIG, MIG, and submerged arc welding for marine structures and pressure assemblies.', 'oic.ws04', '123456'),
('ws-05', 'WS-05', 'Electrical Power Workshop', 'Electrical Power Workshop', 'Electrical Power', 'Lt Commander', 'T A Islam', '4205', 'active', 'Generators, electric motors, main switchboards, power distribution, and marine cabling.', 'oic.ws05', '123456'),
('ws-06', 'WS-06', 'Electronics & Radar Shop', 'Electronics & Radar Shop', 'Electronics & Sensors', 'Lt Commander', 'S Rahman', '4206', 'active', 'Naval surveillance radar, sonar transducers, and electronic navigation systems.', 'oic.ws06', '123456'),
('ws-07', 'WS-07', 'Weapon & Ordnance Shop', 'Weapon & Ordnance Shop', 'Ordnance & Armament', 'Commander', 'H Kabir', '4207', 'active', 'Naval gun mounts, missile launching systems, and weapon servo drive mechanisms.', 'oic.ws07', '123456'),
('ws-08', 'WS-08', 'IC Engine & Diesel Shop', 'IC Engine & Diesel Shop', 'Propulsion & Diesel', 'Lt Commander', 'M A Rahman', '4208', 'active', 'Overhauling and rebuilding of main propulsion engines and auxiliary diesel generators.', 'oic.ws08', '123456'),
('ws-09', 'WS-09', 'Pipe Fitting & Plumbing Shop', 'Pipe Fitting & Plumbing Shop', 'Piping Systems', 'Lieutenant', 'A K Azad', '4209', 'active', 'Bilge, ballast, fuel oil, cooling seawater lines, and high-pressure manifold piping.', 'oic.ws09', '123456'),
('ws-10', 'WS-10', 'Painting & Preservation Shop', 'Painting & Preservation Shop', 'Coating & Protection', 'Lieutenant', 'R Ahmed', '4210', 'active', 'Grit blasting, zinc primer application, and anti-fouling underwater hull protection.', 'oic.ws10', '123456'),
('ws-11', 'WS-11', 'Boiler & Steam Shop', 'Boiler & Steam Shop', 'Steam Systems', 'Lieutenant', 'J Alam', '4211', 'active', 'Auxiliary boilers, steam pressure piping, valves, and water calorifier maintenance.', 'oic.ws11', '123456'),
('ws-12', 'WS-12', 'Gas Turbine & Propulsion Shop', 'Gas Turbine & Propulsion Shop', 'Main Propulsion', 'Lt Commander', 'D K Banik', '4212', 'active', 'Gas turbines, reduction gearboxes, flexible couplings, and shaft drive trains.', 'oic.ws12', '123456'),
('ws-13', 'WS-13', 'Sail Loft & Survival Equipment Shop', 'Sail Loft & Survival Equipment Shop', 'Life Saving Equipment', 'Sub-Lieutenant', 'P K Roy', '4213', 'active', 'Inflatable life rafts, survival suits, weather canvas covers, and rescue gear.', 'oic.ws13', '123456'),
('ws-14', 'WS-14', 'Foundry & Metal Casting Shop', 'Foundry & Metal Casting Shop', 'Metal Casting', 'Lieutenant', 'M Shafiq', '4214', 'active', 'Sand mold casting of bronze, brass, manganese, and marine cast-iron parts.', 'oic.ws14', '123456'),
('ws-15', 'WS-15', 'Shipwright & Carpentry Shop', 'Shipwright & Carpentry Shop', 'Docking & Woodwork', 'Lieutenant', 'N Talukdar', '4215', 'active', 'Drydock keel blocking alignment, shoring, timber staging, and interior joinery.', 'oic.ws15', '123456'),
('ws-16', 'WS-16', 'Tool Room & Precision Shop', 'Tool Room & Precision Shop', 'Tooling & Gauges', 'Lieutenant', 'S Ahmed', '4216', 'active', 'High-precision specialized tooling, custom jigs, dies, and inspection gauges.', 'oic.ws16', '123456'),
('ws-17', 'WS-17', 'Optical & Fire Control Shop', 'Optical & Fire Control Shop', 'Optics & Fire Control', 'Lt Commander', 'F Ahmed', '4217', 'active', 'Optical rangefinders, periscope prisms, night-vision sights, and weapon directors.', 'oic.ws17', '123456'),
('ws-18', 'WS-18', 'Refrigeration & HVAC Shop', 'Refrigeration & HVAC Shop', 'HVAC Systems', 'Lieutenant', 'G Mostafa', '4218', 'active', 'Central air-conditioning chillers, cold provision storage, and air handling units.', 'oic.ws18', '123456'),
('ws-19', 'WS-19', 'Hydraulic & Pneumatic Shop', 'Hydraulic & Pneumatic Shop', 'Fluid Power', 'Lt Commander', 'E Haque', '4219', 'active', 'Electro-hydraulic steering gears, deck winches, capstans, and high-pressure compressors.', 'oic.ws19', '123456'),
('ws-20', 'WS-20', 'Calibration & Instrumentation Lab', 'Calibration & Instrumentation Lab', 'Calibration', 'Lieutenant', 'A B Siddique', '4220', 'active', 'Pressure gauges, digital tachometers, torque wrenches, and temperature instrumentation.', 'oic.ws20', '123456'),
('ws-21', 'WS-21', 'Telecommunication & Radio Shop', 'Telecommunication & Radio Shop', 'Communications', 'Lt Commander', 'T Mahmood', '4221', 'active', 'HF/VHF tactical marine radios, satellite communication (SATCOM), and internal intercom systems.', 'oic.ws21', '123456'),
('ws-22', 'WS-22', 'Navigation Aids & Gyro Shop', 'Navigation Aids & Gyro Shop', 'Navigational Aids', 'Lieutenant', 'Z Abedin', '4222', 'active', 'Master gyrocompasses, echo sounders, magnetic repeaters, and GPS charting consoles.', 'oic.ws22', '123456'),
('ws-23', 'WS-23', 'Fire Fighting & Safety Equipment Shop', 'Fire Fighting & Safety Equipment Shop', 'Damage Control', 'Lieutenant', 'M R Karim', '4223', 'active', 'CO2 fixed flooding systems, breathing apparatus (SCBA), and fire pumps.', 'oic.ws23', '123456'),
('ws-24', 'WS-24', 'Non-Destructive Testing (NDT) Lab', 'Non-Destructive Testing (NDT) Lab', 'NDT Testing', 'Commander', 'S I Khan', '4224', 'active', 'Ultrasonic thickness gauging, magnetic particle, radiographic, and dye-penetrant testing.', 'oic.ws24', '123456'),
('ws-25', 'WS-25', 'Propeller & Underwater Fitting Shop', 'Propeller & Underwater Fitting Shop', 'Underwater Fittings', 'Lt Commander', 'M H Rashed', '4225', 'active', 'Fixed-pitch and controllable-pitch propellers, cathodic zinc anodes, and sea chest valves.', 'oic.ws25', '123456'),
('ws-26', 'WS-26', 'Underwater Weapons & Torpedo Shop', 'Underwater Weapons & Torpedo Shop', 'Underwater Weapons', 'Commander', 'K M Tareq', '4226', 'active', 'Anti-submarine torpedo tubes, depth charge racks, and mine countermeasure gear.', 'oic.ws26', '123456'),
('ws-27', 'WS-27', 'Battery Overhauling & Charging Station', 'Battery Overhauling & Charging Station', 'Battery & Power', 'Sub-Lieutenant', 'S K Bhowmik', '4227', 'active', 'Lead-acid marine starter batteries, emergency battery banks, and charging stations.', 'oic.ws27', '123456')
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name_en = EXCLUDED.name_en,
  name_bn = EXCLUDED.name_bn,
  category = EXCLUDED.category,
  oic_rank = EXCLUDED.oic_rank,
  oic_name = EXCLUDED.oic_name,
  phone_ext = EXCLUDED.phone_ext,
  status = EXCLUDED.status,
  description = EXCLUDED.description,
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  updated_at = NOW();

-- Default Bangladesh Navy Ships
INSERT INTO public.ships (name) VALUES
('BNS Bangabandhu (F-25)'),
('BNS Somudra Joy (F-28)'),
('BNS Somudra Avijan (F-29)'),
('BNS Ali Haider (F-17)'),
('BNS Osman (F-18)'),
('BNS Abu Bakr (F-15)'),
('BNS Bijoy (F-35)'),
('BNS Dhaleshwari (F-36)'),
('BNS Prottoy (F-112)'),
('BNS Shadhinota (F-111)'),
('BNS Sangram (F-113)'),
('BNS Prottasha (F-114)'),
('BNS Madhumati (P-911)'),
('BNS Durjoy (P-811)'),
('BNS Nirmul (P-813)'),
('BNS Durgam (P-814)'),
('BNS Nishan (P-815)'),
('BNS Kapatakhaya (P-912)'),
('BNS Karatoa (P-913)'),
('BNS Gomati (P-914)'),
('BNS Meghna (P-211)'),
('BNS Jamuna (P-212)'),
('BNS Karnaphuli (P-314)'),
('BNS Tista (P-315)'),
('BNS Surma (P-313)'),
('BNS Shaheed Ruhul Amin (A-511)'),
('BNS Khadem (A-721)'),
('BNS Shibsha (A-722)')
ON CONFLICT (name) DO NOTHING;

-- Default Compartments & Locations
INSERT INTO public.locations (name) VALUES
('Engine Room (ER) Upper Level'),
('Engine Room (ER) Lower Level'),
('Forward Generator Compartment'),
('Aft Auxiliary Machinery Room (AMR)'),
('Main Steering Gear Flat'),
('Bridge & Navigation Console'),
('Operations Room (Ops Room)'),
('Main Gun Mount Forecastle (Foc''sle)'),
('Aft Missile Deck Platform'),
('Anchor Windlass & Cable Locker'),
('Forward Magazine Locker'),
('Emergency Diesel Generator Flat'),
('Chiller & Air Handling Unit Room'),
('Shaft Alley & Stern Tube Flat'),
('Fresh Water Generator Flat'),
('CO2 Flooding Station'),
('Aft Capstan & Mooring Station'),
('Sonar Transducer Compartment'),
('Main Switchboard (MSB) Flat'),
('Galley & Bakery Deck')
ON CONFLICT (name) DO NOTHING;

-- Compatibility Columns for Universal Querying
ALTER TABLE public.defects ADD COLUMN IF NOT EXISTS "shipName" TEXT;
ALTER TABLE public.defects ADD COLUMN IF NOT EXISTS "defectDate" TEXT;
ALTER TABLE public.defects ADD COLUMN IF NOT EXISTS "defectDescription" TEXT;
ALTER TABLE public.defects ADD COLUMN IF NOT EXISTS "defectImage" TEXT;
ALTER TABLE public.defects ADD COLUMN IF NOT EXISTS "solutionDate" TEXT;
ALTER TABLE public.defects ADD COLUMN IF NOT EXISTS "solutionDescription" TEXT;
ALTER TABLE public.defects ADD COLUMN IF NOT EXISTS "solutionImage" TEXT;
ALTER TABLE public.defects ADD COLUMN IF NOT EXISTS "workshopCode" TEXT;

-- Initial Sample Defect Records
INSERT INTO public.defects (id, workshop, ship, location, defect_date, defect_desc, defect_image, solution_date, solution_desc, solution_image, status)
VALUES
(
  'def-001',
  'WS-08 IC Engine & Diesel Shop',
  'BNS Bangabandhu (F-25)',
  'Engine Room (ER) Lower Level',
  CURRENT_DATE::TEXT,
  'Main Propulsion Diesel Generator #2 high exhaust gas temperature alarm triggered during trial run.',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
  '',
  '',
  '',
  'In Progress'
),
(
  'def-002',
  'WS-05 Electrical Power Workshop',
  'BNS Somudra Joy (F-28)',
  'Main Switchboard (MSB) Flat',
  CURRENT_DATE::TEXT,
  'Port-side 440V auxiliary distribution busbar insulation resistance dropped below 0.5 Megohm.',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
  '',
  '',
  '',
  'In Progress'
),
(
  'def-003',
  'WS-19 Hydraulic & Pneumatic Shop',
  'BNS Ali Haider (F-17)',
  'Main Steering Gear Flat',
  (CURRENT_DATE - INTERVAL '2 days')::DATE::TEXT,
  'Emergency steering hydraulic actuator port cylinder gland seal oil weeping observed.',
  'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
  CURRENT_DATE::TEXT,
  'Replaced dynamic viton chevron seal set, replenished Tellus S2 V68 hydraulic fluid and pressure tested up to 210 bar.',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
  'Solved'
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- SETUP COMPLETE
-- All 6 tables, storage bucket, RLS policies, and default records created!
-- ==============================================================================
