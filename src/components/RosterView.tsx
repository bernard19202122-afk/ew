/**
 * Elemental Wildguard - 20 Heroes Catalog & Roster View
 * PRD v2.2 compliant base stats, role exceptions, skills, and Level 5/10 perks.
 */

import React, { useState } from 'react';
import { HERO_REGISTRY } from '../game/data/heroRegistry';
import { BALANCE_CONFIG } from '../game/config/balanceConfig';
import { Element, Role } from '../game/types/gameTypes';
import { Heart, Swords, Zap, Shield, Sparkles, ArrowUpCircle, CheckCircle2, Coins } from 'lucide-react';
import { sound } from '../game/audio/soundSynthesizer';
import { progression } from '../game/engine/progressionManager';

export const RosterView: React.FC = () => {
  const [elementFilter, setElementFilter] = useState<'All' | Element>('All');
  const [roleFilter, setRoleFilter] = useState<'All' | Role>('All');
  const [progress, setProgress] = useState(() => progression.getProgress());
  const [upgradeFeedback, setUpgradeFeedback] = useState<string | null>(null);

  const heroes = Object.values(HERO_REGISTRY).filter((h) => {
    if (elementFilter !== 'All' && h.element !== elementFilter) return false;
    if (roleFilter !== 'All' && h.role !== roleFilter) return false;
    return true;
  });

  const handleUpgradeHero = (heroId: string) => {
    sound.playClick();
    const res = progression.upgradeHero(heroId);
    if (res.success) {
      sound.playLevelUp();
      setUpgradeFeedback(res.message);
      setProgress(progression.getProgress());
    } else {
      sound.playReject();
      setUpgradeFeedback(res.message);
    }
  };

  const getElementColor = (el: Element) => {
    switch (el) {
      case 'Fire':
        return 'text-orange-400 border-orange-500/30 bg-orange-950/20';
      case 'Water':
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20';
      case 'Earth':
        return 'text-lime-400 border-lime-500/30 bg-lime-950/20';
      case 'Wind':
        return 'text-purple-400 border-purple-500/30 bg-purple-950/20';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 py-2">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">
            20 Elemental Champions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete roster configured according to PRD v2.2 with role exceptions, progression perks, and skill budgets.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Element Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            {(['All', 'Fire', 'Water', 'Earth', 'Wind'] as const).map((el) => (
              <button
                key={el}
                onClick={() => {
                  sound.playClick();
                  setElementFilter(el);
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  elementFilter === el
                    ? 'bg-slate-800 text-amber-300 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {el}
              </button>
            ))}
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            {(['All', 'Tank', 'Melee', 'Support', 'Ranged'] as const).map((role) => (
              <button
                key={role}
                onClick={() => {
                  sound.playClick();
                  setRoleFilter(role);
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  roleFilter === role
                    ? 'bg-slate-800 text-amber-300 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {heroes.map((hero) => {
          const rawDPS = (hero.baseATK * hero.baseAS).toFixed(2);
          const deployCost = BALANCE_CONFIG.economy.deploymentCosts[hero.rarity];

          return (
            <div
              key={hero.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg hover:border-slate-700 transition-colors"
            >
              <div>
                {/* Hero Header */}
                <div className="flex items-start justify-between border-b border-slate-800/80 pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-slate-800 flex items-center justify-center font-display font-bold text-white text-base border border-slate-700 shadow-sm relative">
                      {hero.name.substring(0, 3)}
                      <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-emerald-600 text-white font-mono font-bold text-[9px] rounded-full border border-emerald-400 shadow">
                        Lv.{progress.heroLevels[hero.id] || 1}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-white font-display">
                          {hero.name}
                        </h2>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getElementColor(
                            hero.element
                          )}`}
                        >
                          {hero.element}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        <span>{hero.rarity}</span>
                        <span className="mx-1.5 text-slate-600">·</span>
                        <span>{hero.role}</span>
                        <span className="mx-1.5 text-slate-600">·</span>
                        <span className="font-mono text-amber-300">{deployCost} Gold</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Base Stats Row */}
                <div className="grid grid-cols-4 gap-1.5 text-center text-xs bg-slate-950/80 p-2 rounded-lg border border-slate-800/80 mb-3">
                  <div>
                    <div className="text-slate-400 flex items-center justify-center gap-0.5 text-[11px]">
                      <Heart className="w-3 h-3 text-emerald-400" /> HP
                    </div>
                    <div className="font-mono font-bold text-emerald-300 mt-0.5">
                      {hero.baseHP}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 flex items-center justify-center gap-0.5 text-[11px]">
                      <Swords className="w-3 h-3 text-rose-400" /> ATK
                    </div>
                    <div className="font-mono font-bold text-rose-300 mt-0.5">
                      {hero.baseATK}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 flex items-center justify-center gap-0.5 text-[11px]">
                      <Zap className="w-3 h-3 text-amber-400" /> AS
                    </div>
                    <div className="font-mono font-bold text-amber-300 mt-0.5">
                      {hero.baseAS}/s
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 flex items-center justify-center gap-0.5 text-[11px]">
                      <Shield className="w-3 h-3 text-blue-400" /> DEF
                    </div>
                    <div className="font-mono font-bold text-blue-300 mt-0.5">
                      {hero.baseDEF}
                    </div>
                  </div>
                </div>

                {/* Raw DPS & Range */}
                <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-3">
                  <span>
                    Raw DPS: <strong className="font-mono text-slate-200">{rawDPS}</strong>
                  </span>
                  <span>
                    Range: <strong className="font-mono text-slate-200">{hero.baseRange} tiles</strong>
                  </span>
                  <span>
                    Target: <strong className="font-mono text-slate-200">{hero.targetPriority}</strong>
                  </span>
                </div>

                {/* Active Skill */}
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 mb-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
                    <span>{hero.activeSkillName}</span>
                    <span className="font-mono text-[11px] text-indigo-400">
                      Cost: {hero.activeSkillCost} E · CD: {hero.activeSkillCooldown}s
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {hero.activeSkillDescription}
                  </p>
                </div>

                {/* Ultimate */}
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 mb-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-300 mb-1">
                    <span>{hero.ultimateName}</span>
                    <span className="font-mono text-[11px] text-amber-400">
                      100 E · CD: {hero.ultimateCooldown}s
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {hero.ultimateDescription}
                  </p>
                </div>

                {/* Hero Upgrade Button (PRD v3.0 Section 16 & 46) */}
                {(() => {
                  const curLvl = progress.heroLevels[hero.id] || 1;
                  const nextCost = curLvl < 10 ? BALANCE_CONFIG.economy.upgradeCosts[curLvl - 1] : 0;
                  const canAfford = curLvl < 10 && progress.gold >= nextCost;

                  return (
                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-slate-400">
                        {curLvl < 10 ? `Upgrade ke Lv.${curLvl + 1}:` : 'Maksimum:'}
                      </span>
                      {curLvl < 10 ? (
                        <button
                          onClick={() => handleUpgradeHero(hero.id)}
                          disabled={!canAfford}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow'
                              : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>{nextCost} Gold</span>
                        </button>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold text-xs border border-amber-500/30">
                          ★ Lv.10 MAX
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Lore / Description */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 italic">
                "{hero.lore}"
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
