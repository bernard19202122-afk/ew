/**
 * Elemental Wildguard - Main Lobby Hub
 * Fully compliant with PRD v3.0 Sections 6, 7, 92.
 * Layout:
 * ┌──────────────────────────────────────────┐
 * │ Avatar   Player Name   Lv.27     Gold/Cryst │
 * │                                      ⚙   │
 * │              WILDGUARD BASE              │
 * │                                          │
 * │         [        PLAY        ]           │
 * │                                          │
 * │       Heroes       Profile       Base    │
 * │               Missions                   │
 * └──────────────────────────────────────────┘
 */

import React from 'react';
import {
  Shield,
  Swords,
  Play,
  Users,
  Award,
  Settings,
  Sparkles,
  Coins,
  Gem,
  ChevronRight,
  MapPin,
  BookOpen,
  CheckCircle2,
  Lock,
  Layers,
  Flame,
  Droplets,
  Mountain,
  Wind,
} from 'lucide-react';
import { progression, PlayerProgress, calculateXPForLevel } from '../game/engine/progressionManager';
import { BALANCE_CONFIG } from '../game/config/balanceConfig';
import { sound } from '../game/audio/soundSynthesizer';
import { CAMPAIGN_LEVELS } from '../game/data/levelRegistry';
import { Lobby3DScene } from './3d/Lobby3DScene';

interface MainLobbyProps {
  progress: PlayerProgress;
  onOpenPlayFlow: () => void;
  onOpenHeroes: () => void;
  onOpenProfile: () => void;
  onOpenBase: () => void;
  onOpenMissions: () => void;
  onOpenSettings: () => void;
  onOpenMultiplayer: () => void;
  onOpenTests: () => void;
  onOpenCodex: () => void;
}

export const MainLobby: React.FC<MainLobbyProps> = ({
  progress,
  onOpenPlayFlow,
  onOpenHeroes,
  onOpenProfile,
  onOpenBase,
  onOpenMissions,
  onOpenSettings,
  onOpenMultiplayer,
  onOpenTests,
  onOpenCodex,
}) => {
  const baseLevel = progress.baseLevel || 1;
  const baseHP = BALANCE_CONFIG.baseStats.baseHP[baseLevel] || 100;
  const defenderCap = BALANCE_CONFIG.baseStats.defenderCapacity[baseLevel] || 6;
  const goldBonus = BALANCE_CONFIG.baseStats.startingGoldBonus[baseLevel] || 0;

  const currentLevelXP = calculateXPForLevel(progress.playerLevel);
  const xpPercent = Math.min(100, Math.round((progress.currentXP / currentLevelXP) * 100));

  const totalStars = progression.getTotalStars();
  const stagesCleared = progress.stats.stagesCompletedCount;
  const unlockedCount = progress.unlockedLevels.length;

  const pendingMissionsCount = progress.missions.filter((m) => !m.claimed && m.current >= m.target).length;
  const pendingAchievementsCount = progress.achievements.filter((a) => !a.claimed && a.current >= a.target).length;
  const totalPendingRewards = pendingMissionsCount + pendingAchievementsCount;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-4 px-3 sm:px-6">
      {/* Header Bar: Avatar, Player Name, Lv. 1-100, Gold, Crystals, Settings */}
      <div className="w-full bg-[#18211E]/95 border border-[#24332D] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        {/* Left: Avatar + Player Info */}
        <div className="flex items-center gap-3.5">
          <div
            onClick={() => {
              sound.playClick();
              onOpenProfile();
            }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-900 border-2 border-emerald-400/40 flex items-center justify-center text-xl font-bold text-white shadow-lg cursor-pointer hover:scale-105 transition-transform"
          >
            🛡️
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-white text-base sm:text-lg">
                Wildguard Commander
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                Lv.{progress.playerLevel}
              </span>
            </div>
            {/* XP Bar */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-32 sm:w-44 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {progress.currentXP} / {currentLevelXP} XP
              </span>
            </div>
          </div>
        </div>

        {/* Right: Currencies & Settings Gear */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          {/* Gold */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs sm:text-sm">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{progress.gold.toLocaleString()}</span>
          </div>

          {/* Crystals */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-indigo-300 font-mono font-bold text-xs sm:text-sm">
            <Gem className="w-4 h-4 text-indigo-400" />
            <span>{progress.crystals.toLocaleString()}</span>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="p-2 rounded-xl bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
            title="Pengaturan Game"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Central Visual Hub: 3D LIVING WORLD LOBBY (PRD Sections 19-23) */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-emerald-900/40 bg-gradient-to-b from-[#131d19] via-[#0e1613] to-[#0a0f0d] shadow-2xl flex flex-col">
        {/* 3D Living World Canvas */}
        <div className="w-full relative h-[360px] sm:h-[420px] md:h-[480px]">
          <Lobby3DScene />

          {/* Overlay Floating Header Information */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-lg">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>WILDGUARD BASE LEVEL {baseLevel} / 3</span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-slate-300 text-xs font-medium shadow-lg">
              <span>★ {totalStars} / 30 Bintang Campaign</span>
            </div>
          </div>

          {/* Focal Point [ PLAY ] Button (PRD Section 23: Normal -> Hover Scale 1.03) */}
          <div className="absolute bottom-5 left-0 right-0 flex flex-col items-center justify-center pointer-events-auto px-4">
            <button
              onClick={() => {
                sound.playWaveHorn();
                onOpenPlayFlow();
              }}
              className="group relative px-10 sm:px-16 py-4 sm:py-4.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-lg sm:text-xl tracking-wider uppercase flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(16,185,129,0.5)] hover:shadow-[0_0_45px_rgba(16,185,129,0.75)] transition-all transform hover:scale-[1.03] active:scale-[0.97] cursor-pointer border border-emerald-400/50"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>MULAI PERJALANAN (PLAY)</span>
              <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1.5 transition-transform" />
            </button>
            <span className="text-[11px] text-slate-300 font-medium mt-2 bg-slate-950/70 backdrop-blur-md px-3 py-0.5 rounded-full border border-slate-800">
              Pilih Wilayah Operasi & Susun Skuad Hero
            </span>
          </div>
        </div>

        {/* Fortress Key Stats Grid */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-[#141d1a]/90 backdrop-blur-md grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#18211E]/90 border border-slate-800/80 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[11px] text-slate-400 font-medium">Base HP</span>
            <span className="text-xl font-mono font-bold text-emerald-400 mt-0.5">{baseHP}</span>
            <span className="text-[9px] text-slate-500">Maksimum Nyawa</span>
          </div>

          <div className="bg-[#18211E]/90 border border-slate-800/80 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[11px] text-slate-400 font-medium">Defender Capacity</span>
            <span className="text-xl font-mono font-bold text-cyan-400 mt-0.5">{defenderCap} Heroes</span>
            <span className="text-[9px] text-slate-500">Kapasitas Skuad</span>
          </div>

          <div className="bg-[#18211E]/90 border border-slate-800/80 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[11px] text-slate-400 font-medium">Starting Gold</span>
            <span className="text-xl font-mono font-bold text-amber-400 mt-0.5">+{goldBonus}G</span>
            <span className="text-[9px] text-slate-500">Bonus Ekonomi Awal</span>
          </div>

          <div className="bg-[#18211E]/90 border border-slate-800/80 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[11px] text-slate-400 font-medium">Total Bintang</span>
            <span className="text-xl font-mono font-bold text-yellow-400 mt-0.5">★ {totalStars}/30</span>
            <span className="text-[9px] text-slate-500">{stagesCleared} Kemenangan</span>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Row: Heroes, Profile, Base, Missions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Heroes */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenHeroes();
          }}
          className="bg-[#18211E] hover:bg-[#202b27] border border-[#24332D] hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col items-start gap-2 text-left transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
              Koleksi Hero
            </div>
            <div className="text-[11px] text-slate-400">
              20 Hero · Level 1–10
            </div>
          </div>
        </button>

        {/* Profile */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenProfile();
          }}
          className="bg-[#18211E] hover:bg-[#202b27] border border-[#24332D] hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col items-start gap-2 text-left transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
              Profil Komandan
            </div>
            <div className="text-[11px] text-slate-400">
              Level {progress.playerLevel} · Statistik
            </div>
          </div>
        </button>

        {/* Base Upgrade */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenBase();
          }}
          className="bg-[#18211E] hover:bg-[#202b27] border border-[#24332D] hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col items-start gap-2 text-left transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
              Upgrade Base
            </div>
            <div className="text-[11px] text-slate-400">
              Tingkat {baseLevel}/3 · {defenderCap} Defender
            </div>
          </div>
        </button>

        {/* Missions / Quests */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenMissions();
          }}
          className="relative bg-[#18211E] hover:bg-[#202b27] border border-[#24332D] hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col items-start gap-2 text-left transition-all cursor-pointer group"
        >
          {totalPendingRewards > 0 && (
            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold animate-pulse">
              {totalPendingRewards} Klaim!
            </span>
          )}
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
              Misi & Pencapaian
            </div>
            <div className="text-[11px] text-slate-400">
              Harian · Mingguan · Trofi
            </div>
          </div>
        </button>
      </div>

      {/* Tertiary Quick Actions: Co-op Room, Test Suite, Codex */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => {
            sound.playClick();
            onOpenMultiplayer();
          }}
          className="p-3.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-950/60 border border-cyan-800/40 flex items-center gap-3 transition-colors cursor-pointer"
        >
          <Users className="w-5 h-5 text-cyan-400" />
          <div className="text-left">
            <div className="text-xs font-bold text-cyan-200">2-Player Co-op Lobby</div>
            <div className="text-[10px] text-slate-400">Main bersama teman (3 hero tiap player)</div>
          </div>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenCodex();
          }}
          className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 flex items-center gap-3 transition-colors cursor-pointer"
        >
          <BookOpen className="w-5 h-5 text-amber-400" />
          <div className="text-left">
            <div className="text-xs font-bold text-slate-200">Elemental Codex</div>
            <div className="text-[10px] text-slate-400">Reaksi elemen: Flame Surge, Mud Bind...</div>
          </div>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenTests();
          }}
          className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 flex items-center gap-3 transition-colors cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <div className="text-left">
            <div className="text-xs font-bold text-slate-200">PRD Automated Tests</div>
            <div className="text-[10px] text-slate-400">Validasi deterministik Section 10 & 11</div>
          </div>
        </button>
      </div>
    </div>
  );
};
