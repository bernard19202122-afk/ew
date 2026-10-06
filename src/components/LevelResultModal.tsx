/**
 * Elemental Wildguard - Level Victory & Defeat Modals
 * AAA App Store & Play Store Grade End-of-Stage Experience.
 * Features 3-Star Celebrations, Level Rewards, Strategic Failure Tips,
 * and Seamless Next-Level Progression.
 */

import React, { useEffect, useState } from 'react';
import {
  Star,
  Award,
  RotateCcw,
  Play,
  MapPin,
  Shield,
  Coins,
  Crosshair,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { CAMPAIGN_LEVELS } from '../game/data/levelRegistry';
import { sound } from '../game/audio/soundSynthesizer';

interface LevelResultModalProps {
  phase: 'LEVEL_VICTORY' | 'LEVEL_DEFEAT';
  currentLevel: number;
  currentWaveInLevel: number;
  levelWavesCount: number;
  baseHP: number;
  totalDamageDealt: number;
  totalEnemiesDefeated: number;
  victoryDetails: {
    levelNumber: number;
    stars: number;
    score: number;
    rewardGold: number;
    newlyUnlocked: boolean;
  } | null;
  onRetry: () => void;
  onNextLevel: () => void;
  onOpenStageSelect: () => void;
  onReturnToLobby?: () => void;
}

export const LevelResultModal: React.FC<LevelResultModalProps> = ({
  phase,
  currentLevel,
  currentWaveInLevel,
  levelWavesCount,
  baseHP,
  totalDamageDealt,
  totalEnemiesDefeated,
  victoryDetails,
  onRetry,
  onNextLevel,
  onOpenStageSelect,
  onReturnToLobby,
}) => {
  const [animatedStars, setAnimatedStars] = useState<number>(0);
  const cfg = CAMPAIGN_LEVELS[currentLevel] || CAMPAIGN_LEVELS[1];
  const isVictory = phase === 'LEVEL_VICTORY';
  const stars = victoryDetails?.stars || (baseHP >= 100 ? 3 : baseHP >= 60 ? 2 : 1);

  // Animate stars sequentially with sound
  useEffect(() => {
    if (isVictory) {
      setAnimatedStars(0);
      const timers = [
        setTimeout(() => {
          setAnimatedStars(1);
          sound.playStarFanfare(1);
        }, 300),
        setTimeout(() => {
          if (stars >= 2) {
            setAnimatedStars(2);
            sound.playStarFanfare(2);
          }
        }, 700),
        setTimeout(() => {
          if (stars >= 3) {
            setAnimatedStars(3);
            sound.playStarFanfare(3);
          }
        }, 1100),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [isVictory, stars]);

  const tacticalTips = [
    'Padukan elemen Api dan Bumi untuk memicu Magma Eruption yang meluluhlantakkan armor musuh!',
    'Gunakan Commander Orbital Strike (Q) saat musuh berkelompok di tikungan tajam!',
    'Aktifkan Bio-Barrier (W) untuk memukul mundur musuh yang mendekati Base Core dan memulihkan HP!',
    'Elemental Burst (F) dapat membalikkan keadaan saat gelombang bos tiba!',
    'Tingkatkan hero yang telah mencapai bintang tinggi untuk mendapatkan bonus damage eksponensial.',
  ];

  const randomTip = tacticalTips[currentLevel % tacticalTips.length];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden transition-all ${
          isVictory
            ? 'bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-amber-500/50 shadow-amber-950/40'
            : 'bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-rose-500/50 shadow-rose-950/40'
        }`}
      >
        {/* Glow ambient header */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-48 rounded-full blur-3xl opacity-30 pointer-events-none ${
            isVictory ? 'bg-amber-400' : 'bg-rose-500'
          }`}
        />

        {/* Top Tag */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
            {cfg.code} · LEVEL {currentLevel}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
          {isVictory ? 'STAGE CLEAR!' : 'GAME OVER'}
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          {isVictory ? cfg.name : 'Command Core Breached!'}
        </p>

        {/* Stars or Defeat Icon */}
        {isVictory ? (
          <div className="flex items-center justify-center gap-3 my-5">
            {[1, 2, 3].map((starIdx) => {
              const active = starIdx <= animatedStars;
              return (
                <div
                  key={starIdx}
                  className={`transition-all duration-300 transform ${
                    active ? 'scale-110' : 'scale-90 opacity-40'
                  }`}
                >
                  <Star
                    className={`w-12 h-12 ${
                      active
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                        : 'text-slate-700 fill-slate-800'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="my-5 p-4 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-400">
            <AlertOctagon className="w-12 h-12 animate-pulse" />
          </div>
        )}

        {/* Newly Unlocked Stage Alert */}
        {isVictory && victoryDetails?.newlyUnlocked && currentLevel < 5 && (
          <div className="w-full mb-4 p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-cyan-950/80 border border-emerald-500/50 flex items-center justify-center gap-2 text-xs font-bold text-emerald-300 shadow-sm animate-pulse">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>LEVEL {currentLevel + 1} UNLOCKED & READY!</span>
          </div>
        )}

        {/* Victory / Defeat Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 my-3 text-left">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
              <Shield className="w-3 h-3 text-cyan-400" /> Base Core HP
            </span>
            <span
              className={`text-base font-bold font-mono ${
                baseHP >= 100 ? 'text-emerald-400' : baseHP > 0 ? 'text-amber-400' : 'text-rose-500'
              }`}
            >
              {Math.max(0, baseHP)} / 100
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" /> Stage Reward
            </span>
            <span className="text-base font-bold font-mono text-amber-300">
              +{isVictory ? victoryDetails?.rewardGold || cfg.reward.gold : 0} G
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-indigo-400" /> Foes Slain
            </span>
            <span className="text-base font-bold font-mono text-white">
              {totalEnemiesDefeated}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-purple-400" /> Waves Reached
            </span>
            <span className="text-base font-bold font-mono text-white">
              {currentWaveInLevel} / {levelWavesCount}
            </span>
          </div>
        </div>

        {/* Strategic Failure Tip (if defeat) */}
        {!isVictory && (
          <div className="w-full bg-slate-950/80 p-3 rounded-xl border border-rose-900/60 my-2 text-left">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1">
              💡 Tactical Intel Tip:
            </span>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{randomTip}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2 mt-4">
          {isVictory && currentLevel < 5 && (
            <button
              onClick={() => {
                sound.playDeploy();
                onNextLevel();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition-all cursor-pointer"
            >
              <span>Next Level: LV-0{currentLevel + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onRetry();
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                !isVictory
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/40'
                  : 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold shadow'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isVictory ? 'REMATCH' : 'RETRY'}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenStageSelect();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{isVictory ? 'Peta Stage' : 'Peta Stage'}</span>
            </button>
          </div>

          {onReturnToLobby && (
            <button
              onClick={() => {
                sound.playClick();
                onReturnToLobby();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1"
            >
              <span>← Kembali ke Lobby Utama</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
