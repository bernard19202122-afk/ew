/**
 * Elemental Wildguard - Campaign Stage Select (Levels 1 - 5)
 * AAA Mobile / App Store Grade Stage Navigation & Progression Map.
 * Provides clear differentiation between Levels (1 to 5) and Waves.
 * Strictly adheres to the fresh battle state reset rule:
 * Every level start discards prior temporary state and begins from Wave 1.
 */

import React, { useState, useEffect } from 'react';
import {
  Star,
  Lock,
  Play,
  Award,
  ChevronRight,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Shield,
  Coins,
  Skull,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Unlock,
  Info,
  Zap,
  Target,
  Swords,
  Radio,
  X,
} from 'lucide-react';
import { CAMPAIGN_LEVELS, LevelConfig } from '../game/data/levelRegistry';
import { progression, PlayerProgress } from '../game/engine/progressionManager';
import { sound } from '../game/audio/soundSynthesizer';
import { Element } from '../game/types/gameTypes';

// Map Visual Assets
import emeraldMapBg from '../assets/images/tactical_emerald_map_1790660096663.jpg';
import tacticalMapBg from '../assets/images/tactical_command_map_1790659057164.jpg';
import volcanoMapBg from '../assets/images/tactical_volcano_map_1790660110786.jpg';
import desertMapBg from '../assets/images/tactical_desert_map_1790660570323.jpg';
import astralMapBg from '../assets/images/tactical_astral_map_1790660583753.jpg';

const LEVEL_THUMBNAILS: Record<number, string> = {
  1: emeraldMapBg,
  2: emeraldMapBg,
  3: volcanoMapBg,
  4: volcanoMapBg,
  5: tacticalMapBg,
  6: tacticalMapBg,
  7: desertMapBg,
  8: desertMapBg,
  9: astralMapBg,
  10: astralMapBg,
};

interface CampaignStageSelectProps {
  currentLevel: number;
  onSelectLevel: (levelNum: number) => void;
  onClose?: () => void;
  onBackToBattlefield?: () => void;
}

export const CampaignStageSelect: React.FC<CampaignStageSelectProps> = ({
  currentLevel,
  onSelectLevel,
  onClose,
  onBackToBattlefield,
}) => {
  const [progress, setProgress] = useState<PlayerProgress>(() => progression.getProgress());
  const [selectedLvlNum, setSelectedLvlNum] = useState<number>(currentLevel);

  // Sync state whenever currentLevel prop updates or modal reopens
  useEffect(() => {
    setProgress(progression.getProgress());
    if (currentLevel >= 1 && currentLevel <= 5) {
      setSelectedLvlNum(currentLevel);
    }
  }, [currentLevel]);

  const totalStars = progression.getTotalStars();
  const rank = progression.getCommanderRank();
  const selectedConfig = CAMPAIGN_LEVELS[selectedLvlNum] || CAMPAIGN_LEVELS[1];
  const isSelectedUnlocked = progress.unlockedLevels.includes(selectedLvlNum);

  const handleLaunchLevel = (levelNum: number) => {
    sound.playWaveHorn();
    onSelectLevel(levelNum);
    if (onClose) onClose();
    if (onBackToBattlefield) onBackToBattlefield();
  };

  const handleUnlockAll = () => {
    sound.playDeploy();
    progression.unlockAllLevels();
    setProgress(progression.getProgress());
  };

  const handleResetProgress = () => {
    sound.playClick();
    progression.resetAllProgress();
    setProgress(progression.getProgress());
    setSelectedLvlNum(1);
  };

  const handleUnlockSpecificLevel = (lvlNum: number) => {
    sound.playDeploy();
    progression.unlockLevel(lvlNum);
    setProgress(progression.getProgress());
  };

  const renderElementIcon = (elem: Element) => {
    switch (elem) {
      case 'Fire':
        return <Flame className="w-3.5 h-3.5 text-orange-400 inline" />;
      case 'Water':
        return <Droplets className="w-3.5 h-3.5 text-cyan-400 inline" />;
      case 'Earth':
        return <Mountain className="w-3.5 h-3.5 text-lime-400 inline" />;
      case 'Wind':
        return <Wind className="w-3.5 h-3.5 text-purple-400 inline" />;
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 py-2">
      {/* Top Action Bar: Return to Battlefield + Title + Commander Rank */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {(onBackToBattlefield || onClose) && (
            <button
              onClick={() => {
                sound.playClick();
                if (onBackToBattlefield) onBackToBattlefield();
                else if (onClose) onClose();
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold shadow cursor-pointer shrink-0"
              title="Return to the active battlefield"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Medan Perang</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{rank.icon}</span>
              <span className={`text-xs sm:text-sm font-bold tracking-wider uppercase ${rank.color}`}>
                {rank.rank}
              </span>
              <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                · Sector Campaign S1 - S5
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight">
              Pilih Stage Pertempuran (Campaign Operations)
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilih level untuk memulai pertempuran. Setiap stage memiliki boss, wave, dan hadiah bintang terpisah.
            </p>
          </div>
        </div>

        {/* Global Stars Counter & Dev Controls */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-amber-500/30 px-3.5 py-2 rounded-xl shadow-inner">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            <div className="flex flex-col">
              <span className="text-[9px] text-amber-300 font-bold uppercase tracking-wider">
                Total Bintang
              </span>
              <span className="text-lg font-black font-mono text-white leading-tight">
                {totalStars} <span className="text-xs text-slate-500 font-normal">/ 15</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleUnlockAll}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
              title="Buka semua level langsung untuk pengujian"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buka Semua</span>
            </button>
            <button
              onClick={handleResetProgress}
              className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Reset progress bintang"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            {onClose && (
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 border border-slate-700 hover:border-rose-500/60 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Tutup / Close Stage Select"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Campaign Progress Route (Interactive Level Stepper) */}
      <div className="w-full bg-[#081318]/90 border border-[#163442] rounded-2xl p-3 sm:p-4 shadow-lg overflow-x-auto">
        <div className="min-w-[640px] flex items-center justify-between relative px-4 py-2">
          {/* Connecting Background Line */}
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-[#132c38] -translate-y-1/2 z-0" />

          {[1, 2, 3, 4, 5].map((lvlNum) => {
            const isUnlocked = progress.unlockedLevels.includes(lvlNum);
            const starsEarned = progress.levelStars[lvlNum] || 0;
            const isSelected = selectedLvlNum === lvlNum;
            const isCurrent = currentLevel === lvlNum;
            const cfg = CAMPAIGN_LEVELS[lvlNum];

            return (
              <button
                key={lvlNum}
                onClick={() => {
                  sound.playClick();
                  setSelectedLvlNum(lvlNum);
                }}
                className={`relative z-10 flex flex-col items-center gap-1.5 transition-all cursor-pointer group ${
                  isSelected ? 'scale-110' : 'hover:scale-105'
                }`}
              >
                {/* Node Orb */}
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-display font-black text-sm transition-all border-2 shadow-lg ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-white shadow-[0_0_20px_#f59e0b] ring-4 ring-amber-500/30'
                      : isUnlocked
                      ? isCurrent
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_12px_#06b6d4]'
                        : 'bg-slate-900 text-amber-300 border-amber-500/50 hover:border-amber-400'
                      : 'bg-slate-950 text-slate-600 border-slate-800'
                  }`}
                >
                  {isUnlocked ? (
                    <span>0{lvlNum}</span>
                  ) : (
                    <Lock className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                {/* Node Title */}
                <div className="text-center">
                  <span
                    className={`text-[11px] font-bold block ${
                      isSelected
                        ? 'text-amber-300'
                        : isUnlocked
                        ? 'text-slate-200'
                        : 'text-slate-500'
                    }`}
                  >
                    {cfg.code}
                  </span>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-2.5 h-2.5 ${
                          s <= starsEarned
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {isCurrent && (
                  <span className="absolute -top-2 px-1.5 py-0.2 bg-cyan-400 text-slate-950 font-black text-[8px] rounded-full uppercase tracking-tighter shadow">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout: Selected Stage Briefing + Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Comprehensive Stage Briefing Card */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl relative">
          {/* Header Image Cover */}
          <div className="relative h-48 w-full overflow-hidden bg-slate-950">
            <img
              src={LEVEL_THUMBNAILS[selectedLvlNum]}
              alt={selectedConfig.name}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                !isSelectedUnlocked ? 'filter grayscale brightness-50' : 'hover:scale-105'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/40 shadow">
                {selectedConfig.code}
              </span>
              <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700">
                {selectedConfig.difficulty}
              </span>
              <span className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-indigo-950/80 backdrop-blur-md text-indigo-300 border border-indigo-500/40">
                {selectedConfig.sectorId} · {selectedConfig.sectorName}
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800">
                {[1, 2, 3].map((starIdx) => (
                  <Star
                    key={starIdx}
                    className={`w-4 h-4 ${
                      starIdx <= (progress.levelStars[selectedLvlNum] || 0)
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                        : 'text-slate-600 fill-slate-800'
                    }`}
                  />
                ))}
                <span className="text-[10px] font-mono text-amber-300 font-bold ml-1.5">
                  {(progress.levelStars[selectedLvlNum] || 0)}/3 Stars
                </span>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-xs font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>{selectedConfig.totalWaves} WAVES</span>
              </div>
            </div>
          </div>

          {/* Briefing Body */}
          <div className="p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-display font-extrabold text-white tracking-tight">
                {selectedConfig.name}
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {selectedConfig.lore}
              </p>
            </div>

            {/* Quick Metrics Bar: Starting Gold, Base HP, Waves */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Starting Gold</span>
                <span className="text-amber-300 font-mono font-black text-sm mt-0.5 block">
                  {selectedConfig.startingGold}G
                </span>
              </div>

              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Command Core</span>
                <span className="text-rose-400 font-mono font-black text-sm mt-0.5 block">
                  100% HP
                </span>
              </div>

              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Waves</span>
                <span className="text-cyan-300 font-mono font-black text-sm mt-0.5 block">
                  {selectedConfig.totalWaves} Waves
                </span>
              </div>
            </div>

            {/* Boss Threat Profile */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-rose-900/50 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Skull className="w-4 h-4 text-rose-400 shrink-0" />
                  Target Boss Intel
                </span>
                <span className="text-[10px] font-mono text-rose-300 bg-rose-950/70 px-2 py-0.5 rounded border border-rose-800/60 font-semibold">
                  {selectedConfig.bossTitle}
                </span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5">
                {selectedConfig.bossName}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <span className="text-slate-500">Elemen Rekomendasi:</span>
                <div className="flex items-center gap-1">
                  {selectedConfig.recommendedElements.map((el) => (
                    <span
                      key={el}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/90 text-[10px] font-bold text-slate-200 border border-slate-700"
                    >
                      {renderElementIcon(el)} {el}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3-Star Mastery Criteria */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 inline" />
                Target 3-Bintang (Star Mastery)
              </span>
              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-start gap-2">
                  <span className={(progress.levelStars[selectedLvlNum] || 0) >= 1 ? 'text-amber-400 font-bold' : 'text-slate-600'}>★</span>
                  <span>{selectedConfig.starCriteria.star1}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={(progress.levelStars[selectedLvlNum] || 0) >= 2 ? 'text-amber-400 font-bold' : 'text-slate-600'}>★★</span>
                  <span>{selectedConfig.starCriteria.star2}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={(progress.levelStars[selectedLvlNum] || 0) >= 3 ? 'text-amber-400 font-bold' : 'text-slate-600'}>★★★</span>
                  <span>{selectedConfig.starCriteria.star3}</span>
                </div>
              </div>
            </div>

            {/* Stage Completion Reward */}
            <div className="flex items-center justify-between text-xs bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 text-[11px]">Hadiah Kemenangan:</span>
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-mono font-bold flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> +{selectedConfig.reward.gold}G
                </span>
                <span className="text-indigo-400 font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> +{selectedConfig.reward.xp} XP
                </span>
              </div>
            </div>

            {/* Launch Action Button */}
            <div className="pt-2">
              {isSelectedUnlocked ? (
                <button
                  onClick={() => handleLaunchLevel(selectedLvlNum)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>MAINKAN LEVEL 0{selectedLvlNum} (MULAI PERTEMPURAN BARU)</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-xs font-semibold flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 text-slate-600" />
                    <span>Selesaikan Level {selectedLvlNum - 1} untuk membuka stage ini</span>
                  </div>
                  <button
                    onClick={() => handleUnlockSpecificLevel(selectedLvlNum)}
                    className="w-full py-2 px-3 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Buka Level Ini Sekarang (Dev/Tester)</span>
                  </button>
                </div>
              )}

              <p className="text-[10px] text-slate-500 text-center mt-2 italic">
                *Memulai level akan me-reset medan perang secara murni dari Wave 1 dengan Gold awal.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Grid of All 5 Stages Cards */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              Daftar Semua Stage (Klik Kartu Untuk Memilih)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Total: 10 Stages · 5 Region
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[600px] overflow-y-auto pr-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvlNum) => {
              const cfg = CAMPAIGN_LEVELS[lvlNum];
              const isUnlocked = progress.unlockedLevels.includes(lvlNum);
              const starsEarned = progress.levelStars[lvlNum] || 0;
              const highScore = progress.levelHighScores[lvlNum] || 0;
              const isSelected = selectedLvlNum === lvlNum;
              const isCurrent = currentLevel === lvlNum;
              const bgImage = LEVEL_THUMBNAILS[lvlNum];

              return (
                <div
                  key={lvlNum}
                  onClick={() => {
                    sound.playClick();
                    setSelectedLvlNum(lvlNum);
                  }}
                  className={`relative overflow-hidden rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-amber-400 bg-slate-900 shadow-xl shadow-amber-950/40 ring-2 ring-amber-400/50'
                      : isUnlocked
                      ? 'border-slate-800 hover:border-slate-600 bg-slate-900/70 hover:shadow-lg'
                      : 'border-slate-800/40 bg-slate-950/70 opacity-65'
                  }`}
                >
                  {/* Card Banner Image */}
                  <div className="relative h-28 w-full overflow-hidden bg-slate-950">
                    <img
                      src={bgImage}
                      alt={cfg.name}
                      className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
                        !isUnlocked ? 'filter grayscale brightness-50' : ''
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-950/80 text-amber-300 border border-amber-500/40">
                        {cfg.code}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-900/80 text-slate-300 border border-slate-700">
                        {cfg.difficulty}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-500/40">
                        {cfg.totalWaves} W
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= starsEarned
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                      {highScore > 0 && (
                        <span className="text-[9px] font-mono text-slate-400 ml-1">
                          {highScore.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {isCurrent && (
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.2 bg-cyan-400 text-slate-950 text-[8px] font-black rounded uppercase">
                        Aktif
                      </span>
                    )}
                  </div>

                  {/* Card Content & Direct Launch Button */}
                  <div className="p-3 flex-1 flex flex-col justify-between gap-2.5">
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1 font-display">
                        {cfg.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        Boss: <strong className="text-rose-300">{cfg.bossName}</strong>
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] border-t border-slate-800/80 pt-2">
                      <div className="flex items-center gap-1">
                        {cfg.recommendedElements.map((el) => (
                          <span
                            key={el}
                            className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-slate-800 text-[9px] font-semibold text-slate-300"
                          >
                            {renderElementIcon(el)}
                          </span>
                        ))}
                      </div>

                      <span className="text-amber-400 font-mono font-bold">
                        +{cfg.reward.gold}G
                      </span>
                    </div>

                    {/* Launch Button */}
                    {isUnlocked ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchLevel(lvlNum);
                        }}
                        className={`w-full py-1.5 px-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow'
                            : 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700'
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Deploy Level 0{lvlNum}</span>
                        <ChevronRight className="w-3 h-3 ml-auto" />
                      </button>
                    ) : (
                      <div className="w-full py-1.5 px-2 bg-slate-950/80 border border-slate-800 text-slate-500 text-[10px] font-semibold rounded-lg flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Terkunci</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
