import React from 'react';
import { 
  Ship
} from 'lucide-react';
import { Defect, Workshop, AuthSession, DockyardConfig } from '../types';
import Ship3DViewer from './Ship3DViewer';

interface DashboardProps {
  defects: Defect[];
  ships: string[];
  locations: string[];
  workshops?: Workshop[];
  dockyardConfig?: DockyardConfig;
  authSession?: AuthSession | null;
  bgIntensity?: 'balanced' | 'vivid' | 'soft';
  onChangeBgIntensity?: (mode: 'balanced' | 'vivid' | 'soft') => void;
  onDeleteDefect: (id: string) => void;
  onUpdateStatus: (id: string, solutionDate?: string, solutionDesc?: string, solutionImg?: string) => void;
  searchFilter: {
    shipName: string;
    location: string;
    fromDate: string;
    toDate: string;
    workshop?: string;
  };
  setSearchFilter: React.Dispatch<React.SetStateAction<{
    shipName: string;
    location: string;
    fromDate: string;
    toDate: string;
    workshop?: string;
  }>>;
  onNavigateToEntry?: (prefillLocation?: string, prefillWorkshop?: string) => void;
}

export default function Dashboard({
  defects,
  ships,
  workshops = [],
  authSession,
  onNavigateToEntry
}: DashboardProps) {
  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Top Header Bar for 3D Dashboard - Bangladesh Naval Green (#006A4E) & Cream (#FFFDD0) Design */}
      <div className="bg-gradient-to-r from-[#006A4E] via-[#355E3B] to-[#006A4E] text-[#FFFDD0] border-2 border-[#FFFDD0]/60 p-4 sm:p-5 rounded-2xl shadow-md flex items-center justify-between flex-wrap gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FFFDD0] text-[#006A4E] shadow-xs">
            <Ship className="h-5 w-5 text-[#006A4E]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black font-algerian text-[#FFFDD0] tracking-wider leading-tight">
              যুদ্ধজাহাজ ডিজিটাল টুইন • WARSHIP DIGITAL TWIN & COMPARTMENTS
            </h2>
            <p className="text-xs text-[#FFFDD0]/90 font-medium mt-0.5">
              ইন্টারেক্টিভ ৩ডি কম্পার্টমেন্ট ম্যাপিং ও ওয়ার্কশপ অগ্রগতি পরিদর্শন (3D Naval Compartment Mapping & Defect Analytics)
            </p>
          </div>
        </div>
      </div>

      {/* 3D Warship Digital Twin & Compartment Inspector */}
      <Ship3DViewer
        defects={defects}
        ships={ships}
        workshops={workshops}
        authSession={authSession}
        onNavigateToEntry={onNavigateToEntry}
      />
    </div>
  );
}
