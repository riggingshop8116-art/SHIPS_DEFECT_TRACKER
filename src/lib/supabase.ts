import { createClient } from '@supabase/supabase-js';

// Project credentials provided by the user
export const SUPABASE_PROJECT_CONFIG = {
  projectName: 'SHIPS_DEFECT_TRACKER',
  projectUrl: 'https://xfhxwlhklgdcffhrmtkg.supabase.co',
  projectId: 'xfhxwlhklgdcffhrmtkg',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaHh3bGhrbGdkY2ZmaHJtdGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNTU5NDYsImV4cCI6MjEwNDgzMTk0Nn0.gM4N4JrEQDArTD8toE-koMmoPJzpIlTYSK6BP6ARD0I'
};

export const SUPABASE_BUCKET_NAME = 'dockyard-media';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_PROJECT_CONFIG.projectUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_PROJECT_CONFIG.anonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- BANGLADESH NAVY DOCKYARD - SHIPS_DEFECT_TRACKER DATABASE SCHEMA
-- Run this SQL in your Supabase Dashboard: SQL Editor -> New query -> Run
-- =========================================================================

-- 1. DEFECTS TABLE (যুদ্ধজাহাজের সকল ডিফেক্ট ও সমাধান ডাটা)
CREATE TABLE IF NOT EXISTS public.defects (
  id TEXT PRIMARY KEY,
  "shipName" TEXT NOT NULL,
  location TEXT NOT NULL,
  workshop TEXT,
  "workshopCode" TEXT,
  "defectImage" TEXT,
  "defectDate" TEXT NOT NULL,
  "defectDescription" TEXT,
  "solutionImage" TEXT,
  "solutionDate" TEXT,
  "solutionDescription" TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS and open public policies for defects
ALTER TABLE public.defects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "defects_select_policy" ON public.defects;
CREATE POLICY "defects_select_policy" ON public.defects FOR SELECT USING (true);
DROP POLICY IF EXISTS "defects_insert_policy" ON public.defects;
CREATE POLICY "defects_insert_policy" ON public.defects FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "defects_update_policy" ON public.defects;
CREATE POLICY "defects_update_policy" ON public.defects FOR UPDATE USING (true);
DROP POLICY IF EXISTS "defects_delete_policy" ON public.defects;
CREATE POLICY "defects_delete_policy" ON public.defects FOR DELETE USING (true);

-- 2. WORKSHOPS TABLE (ডকইয়ার্ডের ২৭টি ওয়ার্কশপের তালিকা ও ইউজার লগইন)
CREATE TABLE IF NOT EXISTS public.workshops (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  "nameBn" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  category TEXT NOT NULL,
  "oicRank" TEXT NOT NULL,
  "oicName" TEXT NOT NULL,
  "phoneExt" TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  description TEXT,
  username TEXT,
  password TEXT,
  photo TEXT,
  "lastLogin" TEXT
);

ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workshops_select_policy" ON public.workshops;
CREATE POLICY "workshops_select_policy" ON public.workshops FOR SELECT USING (true);
DROP POLICY IF EXISTS "workshops_insert_policy" ON public.workshops;
CREATE POLICY "workshops_insert_policy" ON public.workshops FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "workshops_update_policy" ON public.workshops;
CREATE POLICY "workshops_update_policy" ON public.workshops FOR UPDATE USING (true);
DROP POLICY IF EXISTS "workshops_delete_policy" ON public.workshops;
CREATE POLICY "workshops_delete_policy" ON public.workshops FOR DELETE USING (true);

-- 3. FLEET SHIPS TABLE (নৌবাহিনীর যুদ্ধজাহাজ সমূহের তালিকা)
CREATE TABLE IF NOT EXISTS public.ships (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

ALTER TABLE public.ships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ships_select_policy" ON public.ships;
CREATE POLICY "ships_select_policy" ON public.ships FOR SELECT USING (true);
DROP POLICY IF EXISTS "ships_insert_policy" ON public.ships;
CREATE POLICY "ships_insert_policy" ON public.ships FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "ships_update_policy" ON public.ships;
CREATE POLICY "ships_update_policy" ON public.ships FOR UPDATE USING (true);
DROP POLICY IF EXISTS "ships_delete_policy" ON public.ships;
CREATE POLICY "ships_delete_policy" ON public.ships FOR DELETE USING (true);

-- 4. COMPARTMENTS & LOCATIONS TABLE (জাহাজের কম্পার্টমেন্ট ও কাজের লোকেশন)
CREATE TABLE IF NOT EXISTS public.locations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "locations_select_policy" ON public.locations;
CREATE POLICY "locations_select_policy" ON public.locations FOR SELECT USING (true);
DROP POLICY IF EXISTS "locations_insert_policy" ON public.locations;
CREATE POLICY "locations_insert_policy" ON public.locations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "locations_update_policy" ON public.locations;
CREATE POLICY "locations_update_policy" ON public.locations FOR UPDATE USING (true);
DROP POLICY IF EXISTS "locations_delete_policy" ON public.locations;
CREATE POLICY "locations_delete_policy" ON public.locations FOR DELETE USING (true);

-- 5. DOCKYARD CONFIG TABLE (ডকইয়ার্ড সিস্টেম সেটিংস, মার্কি ও মটো)
CREATE TABLE IF NOT EXISTS public.dockyard_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  config JSONB NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.dockyard_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "config_select_policy" ON public.dockyard_config;
CREATE POLICY "config_select_policy" ON public.dockyard_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "config_insert_policy" ON public.dockyard_config;
CREATE POLICY "config_insert_policy" ON public.dockyard_config FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "config_update_policy" ON public.dockyard_config;
CREATE POLICY "config_update_policy" ON public.dockyard_config FOR UPDATE USING (true);
DROP POLICY IF EXISTS "config_delete_policy" ON public.dockyard_config;
CREATE POLICY "config_delete_policy" ON public.dockyard_config FOR DELETE USING (true);

-- 6. USER PROFILE TABLE (এডমিন প্রোফাইল ডাটা)
CREATE TABLE IF NOT EXISTS public.user_profile (
  id TEXT PRIMARY KEY DEFAULT 'admin',
  name TEXT NOT NULL,
  rank TEXT NOT NULL,
  "officialId" TEXT NOT NULL,
  avatar TEXT,
  role TEXT DEFAULT 'admin'
);

ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profile_select_policy" ON public.user_profile;
CREATE POLICY "profile_select_policy" ON public.user_profile FOR SELECT USING (true);
DROP POLICY IF EXISTS "profile_insert_policy" ON public.user_profile;
CREATE POLICY "profile_insert_policy" ON public.user_profile FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "profile_update_policy" ON public.user_profile;
CREATE POLICY "profile_update_policy" ON public.user_profile FOR UPDATE USING (true);
DROP POLICY IF EXISTS "profile_delete_policy" ON public.user_profile;
CREATE POLICY "profile_delete_policy" ON public.user_profile FOR DELETE USING (true);

-- 7. REPLICATION SETUP (Realtime synchronization)
ALTER PUBLICATION supabase_realtime ADD TABLE public.defects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workshops;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dockyard_config;
`;
