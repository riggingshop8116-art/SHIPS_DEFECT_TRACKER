import React from 'react';
import { 
  Ship
} from 'lucide-react';
import { Defect, Workshop, AuthSession, DockyardConfig } from '../types';
import { DEFAULT_DOCKYARD_CONFIG } from '../constants';
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
  bgIntensity = 'balanced',
  onChangeBgIntensity,
  onNavigateToEntry
}: DashboardProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Bar for 3D Dashboard */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
        <div className="inline-flex p-1.5 bg-[#00142e]/90 backdrop-blur-md rounded-2xl border border-amber-500/30 shadow-lg">
          <div className="px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-algerian font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-[#001733] shadow-lg shadow-amber-500/25 flex items-center gap-2">
            <Ship className="h-4 w-4 text-[#001733]" />
            <span>3D WARSHIP DIGITAL TWIN & COMPARTMENT INSPECTOR</span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {onChangeBgIntensity && (
            <div className="flex items-center bg-[#00142e]/90 backdrop-blur-md border border-amber-400/40 p-1 rounded-xl shadow-md">
              <span className="text-[10px] font-algerian font-bold text-amber-300 px-2 flex items-center gap-1">
                <Ship className="h-3 w-3 text-amber-400" />
                <span>FLEET BACKGROUND:</span>
              </span>
              <button
                type="button"
                onClick={() => onChangeBgIntensity('vivid')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-algerian font-bold transition-all cursor-pointer uppercase ${
                  bgIntensity === 'vivid'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-[#001733] shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Vivid Fleet Background"
              >
                VIVID
              </button>
              <button
                type="button"
                onClick={() => onChangeBgIntensity('balanced')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-algerian font-bold transition-all cursor-pointer uppercase ${
                  bgIntensity === 'balanced'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-[#001733] shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Balanced Fleet Background"
              >
                BALANCED
              </button>
              <button
                type="button"
                onClick={() => onChangeBgIntensity('soft')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-algerian font-bold transition-all cursor-pointer uppercase ${
                  bgIntensity === 'soft'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-[#001733] shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Soft Fleet Background"
              >
                SOFT
              </button>
            </div>
          )}

          <div className="text-[11px] font-algerian font-bold uppercase text-amber-200 bg-[#00142e]/90 border border-amber-500/30 px-3.5 py-2 rounded-xl hidden md:flex items-center gap-2 shadow-md">
            <img src="/asd_navy_logo.jpg" alt="ASD Navy Crest" className="w-4 h-4 rounded-full object-contain bg-black" referrerPolicy="no-referrer" />
            <span>STATUS: <span className="text-emerald-400">ONLINE</span> // 27 WORKSHOPS ACTIVE</span>
          </div>
        </div>
      </div>

      {/* 3D WARSHIP DIGITAL TWIN & COMPARTMENT INSPECTOR */}
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
