/**
 * Elemental Wildguard - Selected Hero Management Panel
 * Allows Level Up (PRD costs), Sell (exact 70% refund), Move, and manual Skill/Ultimate casts.
 */

import React from 'react';
import { HeroInstance, TargetPriority } from '../game/types/gameTypes';
import { HERO_REGISTRY } from '../game/data/heroRegistry';
import { BALANCE_CONFIG } from '../game/config/balanceConfig';
import { ArrowUpCircle, DollarSign, Move, Zap, X, Shield, Swords, Heart, Sparkles, Star, GitMerge, Target } from 'lucide-react';
import { sound } from '../game/audio/soundSynthesizer';

interface HeroDetailPanelProps {
  hero: HeroInstance;
  gold: number;
  phase: string;
  allHeroes?: HeroInstance[];
  onUpgrade: (instanceId: string) => void;
  onSell: (instanceId: string) => void;
  onMerge?: (targetInstanceId: string, sourceInstanceId: string) => void;
  onCastSkill: (hero: HeroInstance) => void;
  onCastUltimate: (hero: HeroInstance) => void;
  onClose: () => void;
  onSetTargetPriority?: (instanceId: string, priority: TargetPriority) => void;
  playerMode?: 'single' | 'coop';
  myPlayerRole?: 'P1' | 'P2';
}

export const HeroDetailPanel: React.FC<HeroDetailPanelProps> = ({
  hero,
  gold,
  phase,
  allHeroes = [],
  onUpgrade,
  onSell,
  onMerge,
  onCastSkill,
  onCastUltimate,
  onClose,
  onSetTargetPriority,
  playerMode = 'single',
  myPlayerRole = 'P1',
}) => {
  const template = HERO_REGISTRY[hero.templateId];
  if (!template) return null;

  const isCoop = playerMode === 'coop';
  const isMine = !isCoop || hero.ownerPlayerId === myPlayerRole;

  const upgradeCost =
    hero.level < 10 ? BALANCE_CONFIG.economy.upgradeCosts[hero.level - 1] : null;
  const canAffordUpgrade = isMine && upgradeCost !== null && gold >= upgradeCost;

  const canSellOrMove = isMine && phase === 'PREPARATION';

  // Merge candidates: another hero owned by same player that has same champion or same element
  const mergeCandidates = allHeroes.filter((h) => {
    if (h.instanceId === hero.instanceId) return false;
    if (isCoop && h.ownerPlayerId !== myPlayerRole) return false;
    return h.templateId === hero.templateId || h.element === hero.element;
  });

  const getElementBadgeColor = (el: string) => {
    switch (el) {
      case 'Fire':
        return 'text-orange-400 bg-orange-950/60 border-orange-500/40';
      case 'Water':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40';
      case 'Earth':
        return 'text-lime-400 bg-lime-950/60 border-lime-500/40';
      case 'Wind':
        return 'text-purple-400 bg-purple-950/60 border-purple-500/40';
      default:
        return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md flex flex-col gap-3">
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-display font-bold text-white text-base border border-slate-700 relative">
            {hero.name.substring(0, 3)}
            {hero.starLevel > 1 && (
              <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full border border-amber-300 shadow">
                {hero.starLevel === 3 ? '★★★' : '★★'}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white font-display">{hero.name}</h3>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getElementBadgeColor(
                  hero.element
                )}`}
              >
                {hero.element}
              </span>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded">
                Lv.{hero.level}
              </span>
              <span className="text-[10px] font-mono font-bold text-yellow-400 bg-yellow-950/60 border border-yellow-500/40 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-yellow-400 inline" />
                {hero.starLevel || 1}★
              </span>
              {isCoop && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  hero.ownerPlayerId === 'P1'
                    ? 'text-cyan-300 bg-cyan-950/60 border-cyan-500/40'
                    : 'text-purple-300 bg-purple-950/60 border-purple-500/40'
                }`}>
                  {hero.ownerPlayerId === 'P1' ? 'P1 Tower' : 'P2 Tower'}
                  {hero.ownerPlayerId === myPlayerRole ? ' (You)' : ' (Ally)'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {template.rarity} · {template.role} · Slot {hero.slotIndex}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Core Stats Grid */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
          <div className="text-slate-400 flex items-center justify-center gap-1">
            <Heart className="w-3 h-3 text-emerald-400" /> HP
          </div>
          <div className="font-mono font-bold text-emerald-300 mt-0.5">
            {hero.currentHP}/{hero.maxHP}
          </div>
        </div>

        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
          <div className="text-slate-400 flex items-center justify-center gap-1">
            <Swords className="w-3 h-3 text-rose-400" /> ATK
          </div>
          <div className="font-mono font-bold text-rose-300 mt-0.5">
            {hero.effectiveATK}
          </div>
        </div>

        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
          <div className="text-slate-400 flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> AS
          </div>
          <div className="font-mono font-bold text-amber-300 mt-0.5">
            {hero.effectiveAS.toFixed(2)}/s
          </div>
        </div>

        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
          <div className="text-slate-400 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3 text-blue-400" /> DEF
          </div>
          <div className="font-mono font-bold text-blue-300 mt-0.5">
            {hero.effectiveDEF}
          </div>
        </div>
      </div>

      {/* Energy & Cooldown Bar */}
      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Energy Meter</span>
          <span className="font-mono font-bold text-amber-300">{hero.energy}/100</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-200 ${
              hero.energy >= 100
                ? 'bg-amber-400 animate-pulse'
                : 'bg-gradient-to-r from-indigo-500 to-amber-400'
            }`}
            style={{ width: `${hero.energy}%` }}
          />
        </div>
      </div>

      {/* PRD v3.0 Section 18: Target Priority Selector */}
      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1.5 shrink-0">
          <Target className="w-3.5 h-3.5 text-amber-400" /> Target:
        </span>
        <div className="flex items-center gap-1 flex-wrap">
          {(['FIRST', 'LAST', 'CLOSEST', 'STRONGEST', 'WEAKEST'] as const).map((p) => {
            const currentP = hero.customTargetPriority || template.targetPriority || 'CLOSEST';
            const isActive = currentP === p;
            return (
              <button
                key={p}
                onClick={() => {
                  sound.playClick();
                  if (onSetTargetPriority) onSetTargetPriority(hero.instanceId, p);
                  hero.customTargetPriority = p;
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Skills and Cast Affordances */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Active Skill */}
        <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between font-semibold text-slate-200">
              <span>{template.activeSkillName}</span>
              <span className="text-indigo-400 font-mono text-[11px]">
                {template.activeSkillCost} E
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-3">
              {template.activeSkillDescription}
            </p>
          </div>

          <button
            onClick={() => onCastSkill(hero)}
            disabled={hero.energy < template.activeSkillCost || hero.activeSkillCooldown > 0}
            className={`mt-2 py-1 px-2 rounded text-[11px] font-semibold transition-all ${
              hero.energy >= template.activeSkillCost && hero.activeSkillCooldown <= 0
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {hero.activeSkillCooldown > 0
              ? `CD (${hero.activeSkillCooldown.toFixed(1)}s)`
              : 'Cast Skill'}
          </button>
        </div>

        {/* Ultimate */}
        <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between font-semibold text-amber-300">
              <span>{template.ultimateName}</span>
              <span className="text-amber-400 font-mono text-[11px]">100 E</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-3">
              {template.ultimateDescription}
            </p>
          </div>

          <button
            onClick={() => onCastUltimate(hero)}
            disabled={hero.energy < 100 || hero.ultimateCooldown > 0}
            className={`mt-2 py-1 px-2 rounded text-[11px] font-semibold transition-all ${
              hero.energy >= 100 && hero.ultimateCooldown <= 0
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-950/50 animate-pulse'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {hero.ultimateCooldown > 0
              ? `CD (${hero.ultimateCooldown.toFixed(1)}s)`
              : 'Cast Ultimate'}
          </button>
        </div>
      </div>

      {/* Fusion Merge Section (adakan hero bisa di merge) */}
      {isMine && (
        <div className="bg-slate-950/80 p-3 rounded-lg border border-amber-500/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <GitMerge className="w-4 h-4 text-amber-400" />
              <span>Hero Fusion &amp; Star Merge</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40">
              Rank: {hero.starLevel || 1}/3★
            </span>
          </div>

          {(hero.starLevel || 1) < 3 ? (
            <div className="flex flex-col gap-2 text-xs">
              <p className="text-[11px] text-slate-300">
                Gabungkan dengan hero bertipe sama atau berelemen <strong className="text-amber-300">{hero.element}</strong> untuk naik ke <strong className="text-yellow-400">★{(hero.starLevel || 1) + 1}</strong> (+50% ATK, +40% HP, +25% DEF, slot asal dikosongkan).
              </p>

              {mergeCandidates.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Pilih Hero untuk Dikorbankan/Digabung:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {mergeCandidates.map((c) => (
                      <button
                        key={c.instanceId}
                        onClick={() => {
                          if (onMerge) {
                            sound.playDeploy();
                            onMerge(hero.instanceId, c.instanceId);
                          }
                        }}
                        className="py-1.5 px-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-200 text-[11px] font-bold flex items-center justify-between transition-colors shadow cursor-pointer text-left"
                      >
                        <span>Slot {c.slotIndex}: {c.name} ({c.element} Lv.{c.level})</span>
                        <span className="text-yellow-400 font-extrabold ml-1">➔ ★{(hero.starLevel || 1) + 1}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 bg-slate-900/70 p-2 rounded border border-slate-800 italic">
                  💡 Deploy hero <strong className="text-slate-200">{hero.name}</strong> atau hero berelemen <strong className="text-amber-300">{hero.element}</strong> ke slot lain, lalu pilih menu ini untuk menggabungkan menjadi ★{(hero.starLevel || 1) + 1}!
                </div>
              )}
            </div>
          ) : (
            <div className="py-1 text-center text-xs font-bold text-amber-300 bg-amber-950/40 rounded border border-amber-500/30">
              👑 Hero Telah Mencapai Rank Tertinggi (★★★ MAX)!
            </div>
          )}
        </div>
      )}

      {/* Upgrade & Sell Actions Row */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        {!isMine ? (
          <div className="w-full py-2 px-3 rounded-lg text-xs text-center text-slate-400 bg-slate-800/80 border border-slate-700">
            Tower ini milik kawan ({hero.ownerPlayerId}). Hanya pemilik yang dapat upgrade, merge, atau menjual.
          </div>
        ) : (
          <>
            {hero.level < 10 ? (
              <button
                onClick={() => onUpgrade(hero.instanceId)}
                disabled={!canAffordUpgrade}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  canAffordUpgrade
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                }`}
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>Upgrade to Lv.{hero.level + 1} ({upgradeCost} Gold)</span>
              </button>
            ) : (
              <div className="flex-1 py-2 px-3 rounded-lg text-xs font-bold text-center text-amber-300 bg-amber-950/40 border border-amber-500/30">
                ★ MAX LEVEL (Lv.10)
              </div>
            )}

            <button
              onClick={() => onSell(hero.instanceId)}
              disabled={!canSellOrMove}
              title={!canSellOrMove ? 'Selling only allowed during Preparation Phase' : 'Sell hero for 70% refund and free tactical slot'}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                canSellOrMove
                  ? 'bg-rose-950/50 text-rose-300 border border-rose-800/80 hover:bg-rose-900/60'
                  : 'bg-slate-800 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Sell (70% Refund)</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
