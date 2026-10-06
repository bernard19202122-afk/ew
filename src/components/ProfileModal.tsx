/**
 * Elemental Wildguard - Commander Profile Modal
 * Mandated by PRD v3.0 Section 52.
 */

import React from 'react';
import {
  X,
  Award,
  Shield,
  Trophy,
  Swords,
  Users,
  Flame,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { progression, PlayerProgress, calculateXPForLevel } from '../game/engine/progressionManager';
import { sound } from '../game/audio/soundSynthesizer';

interface ProfileModalProps {
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const progress = progression.getProgress();
  const nextXP = calculateXPForLevel(progress.playerLevel);
  const xpPercent = Math.min(100, Math.round((progress.currentXP / nextXP) * 100));

  const rank = progression.getCommanderRank();
  const totalStars = progression.getTotalStars();

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#18211E] border border-[#24332D] rounded-3xl w-full max-w-2xl p-5 sm:p-7 shadow-2xl flex flex-col gap-5 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Profil Komandan Wildguard
              </h2>
              <p className="text-xs text-slate-400">
                Catatan dinas pertempuran, pangkat kemiliteran, dan lencana kehormatan.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Identity Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-900 flex items-center justify-center text-3xl font-black text-white shadow-xl border-2 border-emerald-400/50">
            🛡️
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white font-display">Commander Wildguard</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                Lv.{progress.playerLevel} / 100
              </span>
            </div>
            <div className={`text-xs font-semibold mt-1 flex items-center gap-1.5 ${rank.color}`}>
              <span>{rank.icon}</span>
              <span>Gelar Pangkat: {rank.rank}</span>
            </div>

            {/* XP progress */}
            <div className="w-full mt-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>Progres Level {progress.playerLevel}</span>
                <span>{progress.currentXP} / {nextXP} XP ({xpPercent}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-300"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Career Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">Total Kemenangan</span>
            <span className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
              {progress.stats.totalWins} Match
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">Stage Kampanye</span>
            <span className="text-xl font-mono font-bold text-cyan-400 mt-0.5">
              {progress.stats.stagesCompletedCount} Selesai
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">Bintang Didapat</span>
            <span className="text-xl font-mono font-bold text-amber-400 mt-0.5">
              ★ {totalStars} / 30
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">Bos Ditaklukkan</span>
            <span className="text-xl font-mono font-bold text-rose-400 mt-0.5">
              {progress.stats.bossesDefeatedCount} Titan
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">Koleksi Hero</span>
            <span className="text-xl font-mono font-bold text-purple-400 mt-0.5">
              {progress.unlockedHeroes.length} / 20 Hero
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">Reaksi Elemen</span>
            <span className="text-xl font-mono font-bold text-indigo-400 mt-0.5">
              {progress.stats.reactionsTriggered}x Picu
            </span>
          </div>
        </div>

        {/* Badges Collection */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Lencana Kehormatan ({progress.unlockedBadges.length} Terkumpul)
          </span>

          {progress.unlockedBadges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {progress.unlockedBadges.map((badge, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Belum ada lencana. Selesaikan stage atau klaim pencapaian untuk membuka lencana kehormatan!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
