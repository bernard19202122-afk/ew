/**
 * Elemental Wildguard - Pre-Battle State Screen
 * Mandated by Master PRD v1.0 Sections 9, 10, 28
 *
 * Implements:
 * - Dedicated PRE-BATTLE state (strictly no battle simulation running)
 * - 3D stage preview environment backdrop
 * - Selected squad review with 3D stylized hero cards & synergy calculation
 * - Hero squad swap/selection
 * - Prominent "START BATTLE" CTA (the only entry point to Battle simulation)
 */

import React, { useState } from 'react';
import { CAMPAIGN_LEVELS } from '../../game/data/levelRegistry';
import { HERO_REGISTRY } from '../../game/data/heroRegistry';
import { Element } from '../../game/types/gameTypes';
import { sound } from '../../game/audio/soundSynthesizer';
import { progression } from '../../game/engine/progressionManager';
import { BALANCE_CONFIG } from '../../game/config/balanceConfig';
import {
  Swords,
  Play,
  ArrowLeft,
  Shield,
  Sparkles,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface PreBattleViewProps {
  selectedLevel: number;
  playerMode: 'single' | 'coop';
  onStartBattle: (selectedSquad: string[]) => void;
  onBackToStageSelect: () => void;
}

export const PreBattleView: React.FC<PreBattleViewProps> = ({
  selectedLevel,
  playerMode,
  onStartBattle,
  onBackToStageSelect,
}) => {
  const levelCfg = CAMPAIGN_LEVELS[selectedLevel] || CAMPAIGN_LEVELS[1];
  const progress = progression.getProgress();
  const baseLevel = progress.baseLevel || 1;
  const maxCapacity = playerMode === 'coop' ? 3 : (BALANCE_CONFIG.baseStats.defenderCapacity[baseLevel] || 6);

  // Initialize squad with player's saved squad or default starter heroes
  const [squad, setSquad] = useState<string[]>(() => {
    const saved = playerMode === 'coop' ? progress.multiplayerSquad : progress.singlePlayerSquad;
    if (saved && saved.length > 0) {
      return saved.slice(0, maxCapacity);
    }
    return ['Pyra', 'Aqua', 'Terra'];
  });

  const [activeElementFilter, setActiveElementFilter] = useState<'All' | Element>('All');

  // Element synergy counts
  const elementCounts = squad.reduce(
    (acc, heroId) => {
      const h = HERO_REGISTRY[heroId];
      if (h) acc[h.element] = (acc[h.element] || 0) + 1;
      return acc;
    },
    { Fire: 0, Water: 0, Earth: 0, Wind: 0 } as Record<Element, number>
  );

  const hasFireSynergy = elementCounts.Fire >= 2;
  const hasWaterSynergy = elementCounts.Water >= 2;
  const hasEarthSynergy = elementCounts.Earth >= 2;
  const hasWindSynergy = elementCounts.Wind >= 2;
  const hasAwakening =
    elementCounts.Fire >= 1 && elementCounts.Water >= 1 && elementCounts.Earth >= 1 && elementCounts.Wind >= 1;

  const handleToggleHero = (heroId: string) => {
    sound.playClick();
    if (squad.includes(heroId)) {
      if (squad.length <= 1) return; // Keep at least 1 hero
      setSquad((prev) => prev.filter((id) => id !== heroId));
    } else {
      if (squad.length >= maxCapacity) {
        sound.playReject();
        return;
      }
      setSquad((prev) => [...prev, heroId]);
    }
  };

  const handleLaunch = () => {
    if (squad.length === 0) return;
    sound.playWaveHorn();
    // Save chosen squad for future battles
    progression.updateSquad(squad, playerMode);
    onStartBattle(squad);
  };

  const renderElementIcon = (elem: Element) => {
    switch (elem) {
      case 'Fire':
        return <Flame className="w-4 h-4 text-orange-400 inline" />;
      case 'Water':
        return <Droplets className="w-4 h-4 text-cyan-400 inline" />;
      case 'Earth':
        return <Mountain className="w-4 h-4 text-lime-400 inline" />;
      case 'Wind':
        return <Wind className="w-4 h-4 text-purple-400 inline" />;
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 py-2">
      {/* Top Header Bar */}
      <div className="bg-[#18211E]/95 border border-[#24332D] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBackToStageSelect();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Peta</span>
          </button>

          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-emerald-400">
              Persiapan Pertempuran (Pre-Battle Staging)
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white">
              Stage {selectedLevel}: {levelCfg.name}
            </h2>
          </div>
        </div>

        {/* Squad Capacity Indicator */}
        <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-slate-300 font-semibold">Kapasitas Skuad:</span>
          <span className="font-mono font-bold text-cyan-300 text-sm">
            {squad.length} / {maxCapacity}
          </span>
        </div>
      </div>

      {/* Main Grid: Active Squad + Synergies vs Hero Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Deployed Squad & Synergies Review (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Active Deployed Squad Slots */}
          <div className="bg-[#18211E]/95 border border-[#24332D] rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-amber-400" />
                <span>Susunan Skuad Aktif ({squad.length}/{maxCapacity})</span>
              </span>
              <span className="text-[11px] text-slate-500">Klik hero untuk melepas</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {squad.map((heroId) => {
                const hero = HERO_REGISTRY[heroId];
                if (!hero) return null;

                const elemBorder =
                  hero.element === 'Fire'
                    ? 'border-orange-500/60 bg-orange-950/20'
                    : hero.element === 'Water'
                    ? 'border-cyan-500/60 bg-cyan-950/20'
                    : hero.element === 'Earth'
                    ? 'border-lime-500/60 bg-lime-950/20'
                    : 'border-purple-500/60 bg-purple-950/20';

                return (
                  <div
                    key={heroId}
                    onClick={() => handleToggleHero(heroId)}
                    className={`relative rounded-2xl border p-3 flex flex-col items-center text-center gap-1.5 cursor-pointer hover:scale-105 transition-all shadow-md group ${elemBorder}`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                      {hero.element === 'Fire' ? '🔥' : hero.element === 'Water' ? '💧' : hero.element === 'Earth' ? '🌿' : '🌪️'}
                    </div>

                    <div className="w-full">
                      <div className="text-xs font-bold text-white truncate">{hero.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ATK {hero.baseATK} · {hero.role}
                      </div>
                    </div>

                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600/90 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                      ✕
                    </div>
                  </div>
                );
              })}

              {/* Empty placeholder slots */}
              {Array.from({ length: maxCapacity - squad.length }).map((_, i) => (
                <div
                  key={`empty_${i}`}
                  className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-4 flex flex-col items-center justify-center text-center gap-1 text-slate-600 min-h-[110px]"
                >
                  <Plus className="w-5 h-5 text-slate-600" />
                  <span className="text-[11px] font-medium">Slot Kosong</span>
                </div>
              ))}
            </div>
          </div>

          {/* Elemental Synergies Active */}
          <div className="bg-[#18211E]/95 border border-[#24332D] rounded-3xl p-5 shadow-xl">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
              Efek Sinergi Elemen Terpicu:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div
                className={`p-3 rounded-xl border flex flex-col gap-1 ${
                  hasFireSynergy
                    ? 'bg-orange-950/40 border-orange-500/60 text-orange-300'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Fire Resonance (2+)</span>
                </div>
                <span className="text-[10px] text-slate-400">+10% Damage Serangan</span>
              </div>

              <div
                className={`p-3 rounded-xl border flex flex-col gap-1 ${
                  hasWaterSynergy
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-300'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>Aqua Tide (2+)</span>
                </div>
                <span className="text-[10px] text-slate-400">+15% Regenerasi Energi</span>
              </div>

              <div
                className={`p-3 rounded-xl border flex flex-col gap-1 ${
                  hasEarthSynergy
                    ? 'bg-lime-950/40 border-lime-500/60 text-lime-300'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Mountain className="w-3.5 h-3.5" />
                  <span>Earth Bastion (2+)</span>
                </div>
                <span className="text-[10px] text-slate-400">+15% Defense & Armor</span>
              </div>

              <div
                className={`p-3 rounded-xl border flex flex-col gap-1 ${
                  hasWindSynergy
                    ? 'bg-purple-950/40 border-purple-500/60 text-purple-300'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Wind className="w-3.5 h-3.5" />
                  <span>Wind Gale (2+)</span>
                </div>
                <span className="text-[10px] text-slate-400">+12% Kecepatan Serang</span>
              </div>

              <div
                className={`col-span-2 sm:col-span-2 p-3 rounded-xl border flex flex-col gap-1 ${
                  hasAwakening
                    ? 'bg-amber-950/40 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Four-Element Awakening (4 Beda Elemen)</span>
                </div>
                <span className="text-[10px] text-slate-400">+15% DMG, +10% AS, +10% DEF & Range Global</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Hero Roster Selection & START BATTLE CTA (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4 bg-[#18211E]/95 border border-[#24332D] rounded-3xl p-5 shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Pilih Hero Tambahan:
              </span>

              {/* Element Filter */}
              <div className="flex items-center gap-1 text-[11px]">
                {(['All', 'Fire', 'Water', 'Earth', 'Wind'] as const).map((el) => (
                  <button
                    key={el}
                    onClick={() => setActiveElementFilter(el)}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-colors cursor-pointer ${
                      activeElementFilter === el
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {el === 'All' ? 'Semua' : el}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Hero Selection List */}
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
              {Object.values(HERO_REGISTRY)
                .filter((h) => activeElementFilter === 'All' || h.element === activeElementFilter)
                .map((hero) => {
                  const isSelected = squad.includes(hero.id);
                  return (
                    <div
                      key={hero.id}
                      onClick={() => handleToggleHero(hero.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-500/80 text-white'
                          : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-lg border border-slate-800">
                          {hero.element === 'Fire' ? '🔥' : hero.element === 'Water' ? '💧' : hero.element === 'Earth' ? '🌿' : '🌪️'}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{hero.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {hero.element} · {hero.role} · ATK {hero.baseATK}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="px-2 py-0.5 rounded-md bg-emerald-600 text-[10px] font-bold text-white flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Terpilih</span>
                          </div>
                        ) : (
                          <div className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-300">
                            + Tambah
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Golden Rule Focal Action: START BATTLE CTA (PRD Section 10) */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleLaunch}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-base sm:text-lg uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(16,185,129,0.5)] hover:shadow-[0_0_45px_rgba(16,185,129,0.7)] transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>MULAI PERTEMPURAN (START BATTLE)</span>
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Gameplay & gelombang musuh hanya akan berjalan setelah tombol START ditekan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
