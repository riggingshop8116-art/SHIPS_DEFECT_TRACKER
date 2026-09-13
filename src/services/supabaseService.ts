import { supabase, SUPABASE_BUCKET_NAME } from '../lib/supabase';
import { Defect, Workshop, DockyardConfig, UserProfile } from '../types';
import { 
  DEFAULT_DOCKYARD_CONFIG, 
  DEFAULT_PROFILE, 
  DEFAULT_WORKSHOPS, 
  DEFAULT_SHIPS, 
  DEFAULT_LOCATIONS 
} from '../constants';

// Helper to convert File to base64 Data URL (fallback mechanism)
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export interface SupabaseSyncStatus {
  isConnected: boolean;
  isTablesReady: boolean;
  lastSyncedAt: Date | null;
  errorMessage?: string | null;
  pendingSyncCount: number;
}

// =============================================================================
// BIDIRECTIONAL MAPPERS (TypeScript Models <--> PostgreSQL Schema)
// These ensure 100% compatibility with supabase-complete-setup.sql
// =============================================================================

export function mapDefectFromDb(row: any): Defect {
  let wsCode = row.workshop_code || row.workshopCode || '';
  if (!wsCode && row.workshop) {
    const match = row.workshop.match(/WS-\d{2}/i);
    if (match) {
      wsCode = match[0].toUpperCase();
    } else if (row.workshop.toLowerCase().includes('rigging') || row.workshop.includes('রিগিং')) {
      wsCode = 'WS-01';
    } else if (row.workshop.toLowerCase().includes('machine') || row.workshop.includes('মেশিন')) {
      wsCode = 'WS-02';
    } else if (row.workshop.toLowerCase().includes('hull') || row.workshop.includes('হাল')) {
      wsCode = 'WS-03';
    } else if (row.workshop.toLowerCase().includes('weld') || row.workshop.includes('ওয়েল্ডিং')) {
      wsCode = 'WS-04';
    } else if (row.workshop.toLowerCase().includes('elect') || row.workshop.includes('ইলেকট্রিক') || row.workshop.includes('ইলেক্ট্রিক')) {
      wsCode = 'WS-05';
    }
  }

  return {
    id: row.id,
    shipName: row.ship || row.shipName || 'BNS Bangabandhu (F-25)',
    location: row.location || 'Engine Room',
    defectDate: row.defect_date || row.defectDate || new Date().toISOString().split('T')[0],
    defectDescription: row.defect_desc || row.defectDescription || '',
    defectImage: row.defect_image || row.defectImage || '',
    solutionDate: row.solution_date || row.solutionDate || '',
    solutionDescription: row.solution_desc || row.solutionDescription || '',
    solutionImage: row.solution_image || row.solutionImage || '',
    status: row.status === 'Solved' ? 'Solved' : 'Pending',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    workshop: row.workshop || 'General',
    workshopCode: wsCode || 'WS-01'
  };
}

export function mapDefectToDb(d: Defect): any {
  return {
    id: d.id,
    workshop: d.workshop || d.workshopCode || 'General',
    ship: d.shipName || 'General Fleet',
    location: d.location || 'Deck Area',
    defect_date: d.defectDate || new Date().toISOString().split('T')[0],
    defect_desc: d.defectDescription || 'Defect reported',
    defect_image: d.defectImage || '',
    solution_date: d.solutionDate || '',
    solution_desc: d.solutionDescription || '',
    solution_image: d.solutionImage || '',
    status: d.status === 'Solved' ? 'Solved' : 'In Progress',
    updated_at: new Date().toISOString()
  };
}

export function mapWorkshopFromDb(row: any): Workshop {
  return {
    id: row.id,
    code: row.code,
    nameEn: row.name_en || row.nameEn || '',
    nameBn: row.name_bn || row.nameBn || '',
    category: row.category || 'General',
    oicRank: row.oic_rank || row.oicRank || 'Lieutenant',
    oicName: row.oic_name || row.oicName || '',
    phoneExt: row.phone_ext || row.phoneExt || '',
    status: row.status === 'inactive' ? 'inactive' : 'active',
    description: row.description || '',
    photo: row.photo || '',
    username: row.username || `oic.${row.code.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    password: row.password || '123456'
  };
}

export function mapWorkshopToDb(ws: Workshop): any {
  return {
    id: ws.id,
    code: ws.code,
    name_en: ws.nameEn || ws.nameBn,
    name_bn: ws.nameBn || ws.nameEn,
    category: ws.category || 'General',
    oic_rank: ws.oicRank || 'Lieutenant',
    oic_name: ws.oicName || '',
    phone_ext: ws.phoneExt || '',
    status: ws.status || 'active',
    description: ws.description || '',
    photo: ws.photo || '',
    username: ws.username || `oic.${ws.code.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    password: ws.password || '123456',
    updated_at: new Date().toISOString()
  };
}

export function mapDockyardConfigFromDb(row: any): DockyardConfig {
  return {
    ...DEFAULT_DOCKYARD_CONFIG,
    yardNameEn: row.yard_name_en || DEFAULT_DOCKYARD_CONFIG.yardNameEn,
    yardNameBn: row.yard_name_bn || DEFAULT_DOCKYARD_CONFIG.yardNameBn,
    yardMotto: row.tagline_en || DEFAULT_DOCKYARD_CONFIG.yardMotto,
    noticeText: row.tagline_bn || DEFAULT_DOCKYARD_CONFIG.noticeText,
    headerTitle: row.yard_name_en || DEFAULT_DOCKYARD_CONFIG.headerTitle,
    headerSubtitle: DEFAULT_DOCKYARD_CONFIG.headerSubtitle,
    headerLogoUrl: DEFAULT_DOCKYARD_CONFIG.headerLogoUrl,
    riggingShopName: row.rigging_shop_name || DEFAULT_DOCKYARD_CONFIG.riggingShopName || 'Rigging & Sail Loft Shop'
  };
}

export function mapDockyardConfigToDb(cfg: DockyardConfig): any {
  return {
    id: 'default',
    yard_name_en: cfg.yardNameEn || 'AREA SUPERINTENDENT DOCKYARD',
    yard_name_bn: cfg.yardNameBn || 'বাংলাদেশ নৌবাহিনী ডকইয়ার্ড',
    tagline_en: cfg.yardMotto || cfg.taglineEn || 'In Peace, In War, Invincible at Sea',
    tagline_bn: cfg.noticeText || cfg.taglineBn || 'All workshops are instructed to update defect resolutions and technical inspection reports in a timely manner according to designated shifts.',
    rigging_shop_name: (cfg as any).riggingShopName || 'Rigging & Sail Loft Shop',
    bg_intensity: 'medium',
    updated_at: new Date().toISOString()
  };
}

export function mapUserProfileFromDb(row: any): UserProfile {
  return {
    name: row.name || DEFAULT_PROFILE.name,
    rank: row.rank || DEFAULT_PROFILE.rank,
    officialId: row.p_no || row.officialId || DEFAULT_PROFILE.officialId,
    avatar: row.avatar || DEFAULT_PROFILE.avatar,
    role: 'admin'
  };
}

export function mapUserProfileToDb(p: UserProfile): any {
  return {
    id: 'admin_default',
    name: p.name || 'Lt Commander M. A. Rahman',
    rank: p.rank || 'অফিস রাইটার',
    p_no: p.officialId || 'admin',
    appointment: 'Managing Director & Chief Engineer',
    intercom: '4001',
    email: 'md.dockyard@navy.mil.bd',
    unit: 'Naval Dockyard Headquarters',
    avatar: p.avatar || '',
    updated_at: new Date().toISOString()
  };
}

// =============================================================================
// SUPABASE SERVICE SINGLETON
// =============================================================================

export const supabaseService = {
  // 1. HEALTH & CONNECTION STATUS CHECK
  async checkHealth(): Promise<{ isConnected: boolean; isTablesReady: boolean; message: string }> {
    try {
      const { data, error } = await supabase.from('defects').select('id').limit(1);
      if (error) {
        if (error.code === '42P01' || error.message.includes('Could not find the table') || error.message.includes('schema cache')) {
          return {
            isConnected: true,
            isTablesReady: false,
            message: 'Supabase connected! Tables need to be created via SQL Editor.'
          };
        }
        return {
          isConnected: false,
          isTablesReady: false,
          message: error.message
        };
      }
      return {
        isConnected: true,
        isTablesReady: true,
        message: 'Supabase connected and tables are verified.'
      };
    } catch (e: any) {
      return {
        isConnected: false,
        isTablesReady: false,
        message: e?.message || 'Network error connecting to Supabase'
      };
    }
  },

  // 2. DEFECTS OPERATIONS
  async fetchDefects(): Promise<Defect[] | null> {
    try {
      const { data, error } = await supabase
        .from('defects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase] fetchDefects error:', error.message);
        return null;
      }
      return (data || []).map(mapDefectFromDb);
    } catch (e) {
      console.warn('[Supabase] fetchDefects exception:', e);
      return null;
    }
  },

  async upsertDefect(defect: Defect): Promise<boolean> {
    try {
      const dbRow = mapDefectToDb(defect);
      const { error } = await supabase
        .from('defects')
        .upsert(dbRow, { onConflict: 'id' });

      if (error) {
        console.warn('[Supabase] upsertDefect error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] upsertDefect exception:', e);
      return false;
    }
  },

  async deleteDefect(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('defects')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('[Supabase] deleteDefect error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] deleteDefect exception:', e);
      return false;
    }
  },

  async syncAllDefects(defects: Defect[]): Promise<boolean> {
    if (!defects.length) return true;
    try {
      const dbRows = defects.map(mapDefectToDb);
      const { error } = await supabase
        .from('defects')
        .upsert(dbRows, { onConflict: 'id' });

      if (error) {
        console.warn('[Supabase] syncAllDefects error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] syncAllDefects exception:', e);
      return false;
    }
  },

  // 3. WORKSHOPS OPERATIONS
  async fetchWorkshops(): Promise<Workshop[] | null> {
    try {
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .order('code', { ascending: true });

      if (error) {
        console.warn('[Supabase] fetchWorkshops error:', error.message);
        return null;
      }
      return (data || []).map(mapWorkshopFromDb);
    } catch (e) {
      console.warn('[Supabase] fetchWorkshops exception:', e);
      return null;
    }
  },

  async upsertWorkshop(ws: Workshop): Promise<boolean> {
    try {
      const dbRow = mapWorkshopToDb(ws);
      const { error } = await supabase
        .from('workshops')
        .upsert(dbRow, { onConflict: 'id' });

      if (error) {
        console.warn('[Supabase] upsertWorkshop error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] upsertWorkshop exception:', e);
      return false;
    }
  },

  async deleteWorkshop(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workshops')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('[Supabase] deleteWorkshop error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] deleteWorkshop exception:', e);
      return false;
    }
  },

  async syncAllWorkshops(workshops: Workshop[]): Promise<boolean> {
    if (!workshops.length) return true;
    try {
      const dbRows = workshops.map(mapWorkshopToDb);
      const { error } = await supabase
        .from('workshops')
        .upsert(dbRows, { onConflict: 'id' });

      if (error) {
        console.warn('[Supabase] syncAllWorkshops error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] syncAllWorkshops exception:', e);
      return false;
    }
  },

  // 4. SHIPS OPERATIONS
  async fetchShips(): Promise<string[] | null> {
    try {
      const { data, error } = await supabase
        .from('ships')
        .select('name')
        .order('name', { ascending: true });

      if (error) {
        console.warn('[Supabase] fetchShips error:', error.message);
        return null;
      }
      return (data || []).map((row: { name: string }) => row.name);
    } catch (e) {
      console.warn('[Supabase] fetchShips exception:', e);
      return null;
    }
  },

  async addShip(shipName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ships')
        .insert({ name: shipName });

      if (error) {
        console.warn('[Supabase] addShip error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] addShip exception:', e);
      return false;
    }
  },

  async deleteShip(shipName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ships')
        .delete()
        .eq('name', shipName);

      if (error) {
        console.warn('[Supabase] deleteShip error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] deleteShip exception:', e);
      return false;
    }
  },

  async syncAllShips(ships: string[]): Promise<boolean> {
    if (!ships.length) return true;
    try {
      const rows = ships.map(name => ({ name }));
      const { error } = await supabase
        .from('ships')
        .upsert(rows, { onConflict: 'name' });

      if (error) {
        console.warn('[Supabase] syncAllShips error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] syncAllShips exception:', e);
      return false;
    }
  },

  // 5. LOCATIONS OPERATIONS
  async fetchLocations(): Promise<string[] | null> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('name')
        .order('name', { ascending: true });

      if (error) {
        console.warn('[Supabase] fetchLocations error:', error.message);
        return null;
      }
      return (data || []).map((row: { name: string }) => row.name);
    } catch (e) {
      console.warn('[Supabase] fetchLocations exception:', e);
      return null;
    }
  },

  async addLocation(locName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('locations')
        .insert({ name: locName });

      if (error) {
        console.warn('[Supabase] addLocation error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] addLocation exception:', e);
      return false;
    }
  },

  async deleteLocation(locName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('name', locName);

      if (error) {
        console.warn('[Supabase] deleteLocation error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] deleteLocation exception:', e);
      return false;
    }
  },

  async syncAllLocations(locations: string[]): Promise<boolean> {
    if (!locations.length) return true;
    try {
      const rows = locations.map(name => ({ name }));
      const { error } = await supabase
        .from('locations')
        .upsert(rows, { onConflict: 'name' });

      if (error) {
        console.warn('[Supabase] syncAllLocations error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] syncAllLocations exception:', e);
      return false;
    }
  },

  // 6. DOCKYARD CONFIG OPERATIONS
  async fetchDockyardConfig(): Promise<DockyardConfig | null> {
    try {
      const { data, error } = await supabase
        .from('dockyard_config')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error) {
        console.warn('[Supabase] fetchDockyardConfig error:', error.message);
        return null;
      }
      if (!data) return null;
      return mapDockyardConfigFromDb(data);
    } catch (e) {
      console.warn('[Supabase] fetchDockyardConfig exception:', e);
      return null;
    }
  },

  async saveDockyardConfig(config: DockyardConfig): Promise<boolean> {
    try {
      const dbRow = mapDockyardConfigToDb(config);
      const { error } = await supabase
        .from('dockyard_config')
        .upsert(dbRow, { onConflict: 'id' });

      if (error) {
        console.warn('[Supabase] saveDockyardConfig error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] saveDockyardConfig exception:', e);
      return false;
    }
  },

  // 7. USER PROFILE OPERATIONS
  async fetchUserProfile(): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('[Supabase] fetchUserProfile error:', error.message);
        return null;
      }
      if (!data) return null;
      return mapUserProfileFromDb(data);
    } catch (e) {
      console.warn('[Supabase] fetchUserProfile exception:', e);
      return null;
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<boolean> {
    try {
      const dbRow = mapUserProfileToDb(profile);
      const { error } = await supabase
        .from('user_profile')
        .upsert(dbRow, { onConflict: 'id' });

      if (error) {
        console.warn('[Supabase] saveUserProfile error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] saveUserProfile exception:', e);
      return false;
    }
  },

  // 8. SUPABASE STORAGE (BUCKET) FILE UPLOAD
  async uploadMediaToStorage(
    file: File,
    folder: 'profiles' | 'workshops' | 'defects' | 'solutions' | 'branding'
  ): Promise<{ url: string; isStorage: boolean }> {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '');
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;

      const { data, error } = await supabase.storage
        .from(SUPABASE_BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg'
        });

      if (error) {
        console.warn('[Supabase Storage] Upload error, falling back to base64 Data URL:', error.message);
        const dataUrl = await fileToDataUrl(file);
        return { url: dataUrl, isStorage: false };
      }

      const { data: publicData } = supabase.storage
        .from(SUPABASE_BUCKET_NAME)
        .getPublicUrl(fileName);

      return { url: publicData.publicUrl, isStorage: true };
    } catch (err) {
      console.warn('[Supabase Storage] Exception, falling back to base64 Data URL:', err);
      const dataUrl = await fileToDataUrl(file);
      return { url: dataUrl, isStorage: false };
    }
  },

  // 9. PUSH ALL DEFAULT / CURRENT DATA TO SUPABASE CLOUD
  async pushAllDefaultsToSupabase(
    customWorkshops?: Workshop[],
    customShips?: string[],
    customLocations?: string[],
    customConfig?: DockyardConfig,
    customProfile?: UserProfile,
    customDefects?: Defect[]
  ): Promise<{ success: boolean; message: string; counts: { workshops: number; ships: number; locations: number; defects: number } }> {
    try {
      const targetWorkshops = customWorkshops && customWorkshops.length > 0 ? customWorkshops : DEFAULT_WORKSHOPS;
      const targetShips = customShips && customShips.length > 0 ? customShips : DEFAULT_SHIPS;
      const targetLocations = customLocations && customLocations.length > 0 ? customLocations : DEFAULT_LOCATIONS;
      const targetConfig = customConfig || DEFAULT_DOCKYARD_CONFIG;
      const targetProfile = customProfile || DEFAULT_PROFILE;

      // 1. Save Dockyard Config
      await this.saveDockyardConfig(targetConfig);

      // 2. Save User Profile
      await this.saveUserProfile(targetProfile);

      // 3. Push Workshops
      await this.syncAllWorkshops(targetWorkshops);

      // 4. Push Ships
      await this.syncAllShips(targetShips);

      // 5. Push Locations
      await this.syncAllLocations(targetLocations);

      // 6. Push Defects if provided
      if (customDefects && customDefects.length > 0) {
        await this.syncAllDefects(customDefects);
      }

      return {
        success: true,
        message: 'সকল ডিফল্ট ডাটা ও কনফিগারেশন সফলভাবে সোপাবেজে পুশ করা হয়েছে (All default data successfully pushed to Supabase).',
        counts: {
          workshops: targetWorkshops.length,
          ships: targetShips.length,
          locations: targetLocations.length,
          defects: customDefects ? customDefects.length : 0
        }
      };
    } catch (err: any) {
      console.error('[Supabase] pushAllDefaultsToSupabase error:', err);
      return {
        success: false,
        message: `সোপাবেজে ডাটা পুশ করতে ত্রুটি হয়েছে: ${err?.message || 'Unknown error'}`,
        counts: { workshops: 0, ships: 0, locations: 0, defects: 0 }
      };
    }
  }
};
