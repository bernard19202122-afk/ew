/**
 * Elemental Wildguard - Base Upgrade Modal (Level 1–3)
 * Mandated by PRD v3.0 Sections 36, 37, 38, 39.
 */

import React, { useState } from 'react';
import {
  Shield,
  X,
  CheckCircle2,
  Lock,
  ArrowRight,
  Coins,
  Sparkles,
  Users,
  Heart,
  AlertCircle,
} from 'lucide-react';
import { progression, PlayerProgress } from '../game/engine/progressionManager';
import { BALANCE_CONFIG } from '../game/config/balanceConfig';
import { sound } from '../game/audio/soundSynthesizer';

interface BaseUpgradeModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

export const BaseUpgradeModal: React.FC<BaseUpgradeModalProps> = ({ onClose, onRefresh }) => {
  const [progress, setProgress] = useState<PlayerProgress>(() => progression.getProgress());
  const [upgradeMsg, setUpgradeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const curLevel = progress.baseLevel || 1;
  const nextLevel = curLevel + 1;
  const isMaxLevel = curLevel >= 3;

  const curHP = BALANCE_CONFIG.baseStats.baseHP[curLevel] || 100;
  const curCap = BALANCE_CONFIG.baseStats.defenderCapacity[curLevel] || 6;
  const curBonus = BALANCE_CONFIG.baseStats.startingGoldBonus[curLevel] || 0;

  const nextReq = !isMaxLevel ? BALANCE_CONFIG.baseStats.upgradeRequirements[nextLevel] : null;
  const nextHP = !isMaxLevel ? BALANCE_CONFIG.baseStats.baseHP[nextLevel] : null;
  const nextCap = !isMaxLevel ? BALANCE_CONFIG.baseStats.defenderCapacity[nextLevel] : null;
  const nextBonus = !isMaxLevel ? BALANCE_CONFIG.baseStats.startingGoldBonus[nextLevel] : null;

  const meetsPlayerLvl = nextReq ? progress.playerLevel >= nextReq.playerLevel : true;
  const meetsStages = nextReq ? progress.stats.stagesCompletedCount >= nextReq.stageProgress : true;
  const meetsGold = nextReq ? progress.gold >= nextReq.goldCost : true;
  const canUpgrade = !isMaxLevel && meetsPlayerLvl && meetsStages && meetsGold;

  const handleExecuteUpgrade = () => {
    sound.playClick();
    const res = progression.upgradeBase();
    if (res.success) {
      sound.playLevelComplete();
      setUpgradeMsg({ type: 'success', text: res.message });
      setProgress(progression.getProgress());
      onRefresh();
    } else {
      sound.playReject();
      setUpgradeMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#18211E] border border-[#24332D] rounded-3xl w-full max-w-2xl p-5 sm:p-7 shadow-2xl flex flex-col gap-5 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Wildguard Base Management
              </h2>
              <p className="text-xs text-slate-400">
                Tingkatkan Base HP, kapasitas defender (6 → 7 → 8), dan bonus ekonomi pertempuran.
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

        {/* Status Message */}
        {upgradeMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
              upgradeMsg.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
            }`}
          >
            {upgradeMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{upgradeMsg.text}</span>
          </div>
        )}

        {/* Current vs Next Level Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Current Level */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Saat Ini</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs">
                Base Lv.{curLevel}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400"><Heart className="w-3.5 h-3.5 text-rose-400" /> Base Core HP:</span>
                <span className="font-mono font-bold text-white">{curHP} HP</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400"><Users className="w-3.5 h-3.5 text-cyan-400" /> Defender Capacity:</span>
                <span className="font-mono font-bold text-white">{curCap} Heroes</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400"><Coins className="w-3.5 h-3.5 text-amber-400" /> Starting Gold:</span>
                <span className="font-mono font-bold text-amber-400">+{curBonus} Gold</span>
              </div>
            </div>
          </div>

          {/* Next Level Preview */}
          <div className="bg-[#1f2c27]/70 border border-emerald-500/30 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Level Berikutnya</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-400/40 text-emerald-300 font-mono font-bold text-xs">
                {isMaxLevel ? 'MAX TIER' : `Base Lv.${nextLevel}`}
              </span>
            </div>
            {!isMaxLevel && nextHP && nextCap && nextBonus !== null ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400"><Heart className="w-3.5 h-3.5 text-rose-400" /> Base Core HP:</span>
                  <span className="font-mono font-bold text-emerald-300">{nextHP} HP (+{nextHP - curHP})</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400"><Users className="w-3.5 h-3.5 text-cyan-400" /> Defender Capacity:</span>
                  <span className="font-mono font-bold text-cyan-300">{nextCap} Heroes (+1 Slot)</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400"><Coins className="w-3.5 h-3.5 text-amber-400" /> Starting Gold:</span>
                  <span className="font-mono font-bold text-amber-300">+{nextBonus} Gold (+{nextBonus - curBonus}G)</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-20 text-slate-400 text-xs italic">
                Wildguard Base telah mencapai tingkat evolusi tertinggi (Lv.3).
              </div>
            )}
          </div>
        </div>

        {/* Upgrade Requirements Checklist */}
        {!isMaxLevel && nextReq && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Syarat Upgrade Base Lv.{nextLevel}:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${meetsPlayerLvl ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                {meetsPlayerLvl ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-500" />}
                <div>
                  <div className="text-[10px] text-slate-500">Player Level</div>
                  <div className="font-mono font-bold">{progress.playerLevel} / Lv.{nextReq.playerLevel}</div>
                </div>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${meetsStages ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                {meetsStages ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-500" />}
                <div>
                  <div className="text-[10px] text-slate-500">Stage Selesai</div>
                  <div className="font-mono font-bold">{progress.stats.stagesCompletedCount} / {nextReq.stageProgress} Menang</div>
                </div>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${meetsGold ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                {meetsGold ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-500" />}
                <div>
                  <div className="text-[10px] text-slate-500">Biaya Gold</div>
                  <div className="font-mono font-bold">{progress.gold.toLocaleString()} / {nextReq.goldCost.toLocaleString()}G</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <div className="text-xs text-slate-400">
            Gold Tersedia: <span className="text-amber-400 font-mono font-bold">{progress.gold.toLocaleString()}G</span>
          </div>

          {!isMaxLevel ? (
            <button
              onClick={handleExecuteUpgrade}
              disabled={!canUpgrade}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>UPGRADE BASE KE LV.{nextLevel}</span>
            </button>
          ) : (
            <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>BASE TELAH MAKSIMUM</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
