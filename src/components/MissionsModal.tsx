/**
 * Elemental Wildguard - Missions & Achievements Modal
 * Mandated by PRD v3.0 Sections 49, 50, 83.
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  X,
  Award,
  Sparkles,
  Coins,
  Gem,
  Calendar,
  Clock,
  Trophy,
} from 'lucide-react';
import { progression, PlayerProgress, MissionItem, AchievementItem } from '../game/engine/progressionManager';
import { sound } from '../game/audio/soundSynthesizer';

interface MissionsModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({ onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'achievements'>('daily');
  const [progress, setProgress] = useState<PlayerProgress>(() => progression.getProgress());
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);

  const handleClaimMission = (missionId: string) => {
    sound.playClick();
    const res = progression.claimMissionReward(missionId);
    if (res.success) {
      sound.playLevelComplete();
      setClaimFeedback(res.message);
      setProgress(progression.getProgress());
      onRefresh();
    }
  };

  const handleClaimAchievement = (achievementId: string) => {
    sound.playClick();
    const res = progression.claimAchievementReward(achievementId);
    if (res.success) {
      sound.playLevelComplete();
      setClaimFeedback(res.message);
      setProgress(progression.getProgress());
      onRefresh();
    }
  };

  const dailyMissions = progress.missions.filter((m) => m.type === 'daily');
  const weeklyMissions = progress.missions.filter((m) => m.type === 'weekly');
  const achievements = progress.achievements;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#18211E] border border-[#24332D] rounded-3xl w-full max-w-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-5 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Misi &amp; Pencapaian (Quests &amp; Achievements)
              </h2>
              <p className="text-xs text-slate-400">
                Selesaikan tugas pertempuran untuk mendapatkan Gold, Kristal, XP, dan Gelar Kehormatan.
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

        {/* Claim Feedback Banner */}
        {claimFeedback && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{claimFeedback}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Misi Harian ({dailyMissions.filter((m) => m.claimed).length}/{dailyMissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'weekly'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Misi Mingguan ({weeklyMissions.filter((m) => m.claimed).length}/{weeklyMissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'achievements'
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Pencapaian Langka ({achievements.filter((a) => a.claimed).length}/{achievements.length})</span>
          </button>
        </div>

        {/* Mission Content List */}
        <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
          {activeTab === 'daily' &&
            dailyMissions.map((mission) => {
              const isReady = !mission.claimed && mission.current >= mission.target;
              const percent = Math.min(100, Math.round((mission.current / mission.target) * 100));

              return (
                <div
                  key={mission.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex flex-col gap-1 max-w-md">
                    <span className="font-bold text-sm text-white">{mission.title}</span>
                    <span className="text-xs text-slate-400">{mission.description}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {mission.current} / {mission.target}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-amber-400 flex items-center gap-1 font-bold">
                        <Coins className="w-3.5 h-3.5" /> +{mission.rewardGold}G
                      </span>
                      <span className="text-indigo-400 flex items-center gap-1 font-bold">
                        <Gem className="w-3.5 h-3.5" /> +{mission.rewardCrystals}
                      </span>
                    </div>

                    {mission.claimed ? (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-500 font-semibold text-xs border border-slate-800">
                        Diklaim ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaimMission(mission.id)}
                        disabled={!isReady}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isReady
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md animate-bounce'
                            : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                        }`}
                      >
                        {isReady ? 'Klaim Hadiah' : 'Belum Selesai'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {activeTab === 'weekly' &&
            weeklyMissions.map((mission) => {
              const isReady = !mission.claimed && mission.current >= mission.target;
              const percent = Math.min(100, Math.round((mission.current / mission.target) * 100));

              return (
                <div
                  key={mission.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex flex-col gap-1 max-w-md">
                    <span className="font-bold text-sm text-white">{mission.title}</span>
                    <span className="text-xs text-slate-400">{mission.description}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {mission.current} / {mission.target}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-amber-400 flex items-center gap-1 font-bold">
                        <Coins className="w-3.5 h-3.5" /> +{mission.rewardGold}G
                      </span>
                      <span className="text-indigo-400 flex items-center gap-1 font-bold">
                        <Gem className="w-3.5 h-3.5" /> +{mission.rewardCrystals}
                      </span>
                    </div>

                    {mission.claimed ? (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-500 font-semibold text-xs border border-slate-800">
                        Diklaim ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaimMission(mission.id)}
                        disabled={!isReady}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isReady
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md animate-bounce'
                            : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                        }`}
                      >
                        {isReady ? 'Klaim Hadiah' : 'Belum Selesai'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {activeTab === 'achievements' &&
            achievements.map((ach) => {
              const isReady = !ach.claimed && ach.current >= ach.target;
              const percent = Math.min(100, Math.round((ach.current / ach.target) * 100));

              return (
                <div
                  key={ach.id}
                  className="bg-slate-950/70 border border-indigo-900/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex flex-col gap-1 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{ach.title}</span>
                      <span className="text-[10px] font-mono text-indigo-400 px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500/30">
                        {ach.rewardBadge}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{ach.description}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {ach.current} / {ach.target}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-indigo-400 flex items-center gap-1 font-mono font-bold text-xs">
                      <Gem className="w-3.5 h-3.5" /> +{ach.rewardCrystals} Kristal
                    </span>

                    {ach.claimed ? (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-500 font-semibold text-xs border border-slate-800">
                        Terbuka ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaimAchievement(ach.id)}
                        disabled={!isReady}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isReady
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md animate-bounce'
                            : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                        }`}
                      >
                        {isReady ? 'Klaim Badge' : 'Terkunci'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
