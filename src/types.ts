export interface Workshop {
  id: string;
  code: string; // e.g. 'WS-01'
  nameBn: string; // e.g. 'রিগিং শপ'
  nameEn: string; // e.g. 'Rigging Shop'
  category: string; // e.g. 'হাল ও ডেক', 'মেকানিক্যাল', 'ইলেকট্রিক্যাল'
  oicRank: string;
  oicName: string;
  phoneExt: string;
  status: 'active' | 'inactive';
  description?: string;
  username?: string; // Workshop login username e.g. 'oic.ws01'
  password?: string; // Workshop login password e.g. '123456'
  photo?: string; // Base64 data URL or photo URL
  lastLogin?: string; // Last login timestamp
}

export interface DockyardConfig {
  yardNameBn: string;
  yardNameEn: string;
  yardMotto: string;
  commandBase: string;
  noticeText: string;
  contactPhone: string;
  contactEmail: string;
  systemVersion: string;
  headerTitle?: string;
  headerSubtitle?: string;
  headerLogoUrl?: string;
  marqueeText?: string;
  marqueeBadge?: string;
  marqueeSpeed?: 'slow' | 'medium' | 'fast';
  operationalReadiness?: string;
  activeShift?: string;
  showMarquee?: boolean;
  supportHotline?: string;
  emergencyAlertEnabled?: boolean;
  emergencyAlertText?: string;
  loginWelcomeTitle?: string;
  loginWelcomeSubtitle?: string;
  riggingShopName?: string;
  taglineEn?: string;
  taglineBn?: string;
}

export type AdminSubTab = 'workshops' | 'fleet' | 'locations' | 'settings' | 'users' | 'production' | 'site_info' | 'profile' | 'backup';

export interface AuthSession {
  isLoggedIn: boolean;
  role: 'admin' | 'workshop_user';
  workshopId: string;
  workshopCode: string;
  workshopNameBn: string;
  workshopNameEn: string;
  username: string;
  officerName: string;
  photo?: string;
  loginTime: string;
}

export interface Defect {
  id: string;
  shipName: string;
  location: string; // 'মেইন ইঞ্জিন' | 'ডিজি-১' | 'ডিজি-২'
  defectImage: string; // Base64 data URL or empty
  defectDate: string; // YYYY-MM-DD
  solutionImage: string; // Base64 data URL or empty
  solutionDate: string; // YYYY-MM-DD or empty
  defectDescription?: string; // Optional helpful fields
  solutionDescription?: string; // Optional helpful fields
  status: 'Pending' | 'Solved';
  createdAt: string;
  workshop?: string; // e.g. 'রিগিং শপ (Rigging Shop)'
  workshopCode?: string; // e.g. 'WS-01'
}

export interface UserProfile {
  name: string;
  rank: string;
  officialId: string;
  avatar: string;
  role?: 'admin' | 'workshop_user';
  password?: string;
}

export interface AppSettings {
  ships: string[];
  locations: string[];
}

export type NavTab = 'dashboard' | 'entry' | 'inprogress' | 'find' | 'organization' | 'production' | 'admin';

