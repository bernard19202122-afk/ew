/**
 * Elemental Wildguard - Top Navigation Bar
 * Follows PRD v3.0 Sections 6, 7 & Universal Frontend Design Constitution.
 */

import React from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  MapPin,
  Star,
  Users,
  Swords,
  Shield,
  Trophy,
  User,
  Settings,
  Coins,
  Gem,
  LayoutGrid,
} from 'lucide-react';
import { sound } from '../game/audio/soundSynthesizer';
import { progression } from '../game/engine/progressionManager';

export type ActiveTab =
  | 'lobby'
  | 'battlefield'
  | 'stages'
  | 'pre_battle'
  | 'coop'
  | 'roster'
  | 'base'
  | 'missions'
  | 'profile'
  | 'tests'
  | 'codex'
  | 'balance';

interface TopBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onRestartRun: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  currentLevel?: number;
  totalStars?: number;
  playerMode?: 'single' | 'coop';
  onOpenSettings?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  onRestartRun,
  isMuted,
  onToggleMute,
  currentLevel = 1,
  totalStars = 0,
  playerMode = 'single',
  onOpenSettings,
}) => {
  const progress = progression.getProgress();

  return (
    <header className="w-full bg-[#101614]/95 backdrop-blur-md border-b border-[#1f2c27] sticky top-0 z-40 px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Zone 1: Logo & Player Quick Stats */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onTabChange('lobby')}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-700 flex items-center justify-center shadow-md shadow-emerald-950/50 shrink-0 cursor-pointer hover:scale-105 transition-transform"
            title="Kembali ke Main Lobby"
          >
            <span className="font-display font-bold text-white text-base">EW</span>
          </div>
          <div className="flex flex-col">
            <button
              onClick={() => onTabChange('lobby')}
              className="text-sm sm:text-base font-display font-bold tracking-tight text-white whitespace-nowrap hover:text-emerald-400 transition-colors text-left cursor-pointer"
            >
              Elemental Wildguard
            </button>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <span className="text-emerald-400 font-bold">ST-0{currentLevel}</span>
              <span>·</span>
              <span className="text-amber-300 flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-amber-400 inline" /> {totalStars}/30
              </span>
              <span>·</span>
              <span className="text-emerald-300 font-semibold">
                Lv.{progress.playerLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* Main Lobby */}
          <button
            onClick={() => onTabChange('lobby')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'lobby'
                ? 'bg-[#1f2c27] text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lobby</span>
          </button>

          {/* Battlefield */}
          <button
            onClick={() => onTabChange('battlefield')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'battlefield' || activeTab === 'pre_battle'
                ? 'bg-[#1f2c27] text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            <span>{activeTab === 'pre_battle' ? 'Pre-Battle' : 'Battlefield'}</span>
          </button>

          {/* Stages */}
          <button
            onClick={() => onTabChange('stages')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'stages'
                ? 'bg-[#1f2c27] text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Stages (1–10)</span>
          </button>

          {/* 20 Heroes */}
          <button
            onClick={() => onTabChange('roster')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-[#1f2c27] text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            20 Heroes
          </button>

          {/* Base Upgrade */}
          <button
            onClick={() => onTabChange('base')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'base'
                ? 'bg-[#1f2c27] text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Base (Lv.{progress.baseLevel}/3)</span>
          </button>

          {/* Missions */}
          <button
            onClick={() => onTabChange('missions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'missions'
                ? 'bg-[#1f2c27] text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-indigo-400" />
            <span>Misi</span>
          </button>

          {/* 2-Player Co-op */}
          <button
            onClick={() => onTabChange('coop')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'coop'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-cyan-400/90 hover:text-cyan-200 hover:bg-cyan-950/40'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>2P Co-op</span>
          </button>

          {/* Test Suite */}
          <button
            onClick={() => onTabChange('tests')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'tests'
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Tests
          </button>
        </nav>

        {/* Zone 3: Currencies, Audio Mute, and Settings */}
        <div className="flex items-center gap-2">
          {/* Quick Currency display */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs font-bold mr-1">
            <span className="text-amber-400 flex items-center gap-1 bg-slate-950/60 px-2 py-1 rounded-md border border-slate-800">
              <Coins className="w-3 h-3" /> {progress.gold.toLocaleString()}
            </span>
            <span className="text-indigo-400 flex items-center gap-1 bg-slate-950/60 px-2 py-1 rounded-md border border-slate-800">
              <Gem className="w-3 h-3" /> {progress.crystals.toLocaleString()}
            </span>
          </div>

          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              title="Pengaturan"
              className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onRestartRun}
            title="Mulai Ulang Pertempuran (Wave 1)"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
