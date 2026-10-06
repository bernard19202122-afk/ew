/**
 * Elemental Wildguard - Pre-Battle Squad Builder Modal
 * Mandated by PRD v3.0 Sections 7, 11, 12, 13.
 * Enforces:
 * - Base capacity: 6 (Lv1), 7 (Lv2), 8 (Lv3) in Single Player; 3 in Co-op.
 * - Strictly NO hero duplication in squad.
 * - Element composition & synergy analysis.
 */

import React, { useState } from 'react';
import {
  X,
  Swords,
  Shield,
  Play,
  AlertCircle,
  Sparkles,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import { HERO_REGISTRY } from '../game/data/heroRegistry';
import { ALL_20_HERO_IDS, progression } from '../game/engine/progressionManager';
import { Element } from '../game/types/gameTypes';
import { sound } from '../game/audio/soundSynthesizer';
import { BALANCE_CONFIG } from '../game/config/balanceConfig';

interface SquadBuilderModalProps {
  mode: 'single' | 'coop';
  selectedLevel: number;
  onClose: () => void;
  onConfirmAndLaunch: (squad: string[]) => void;
}

export const SquadBuilderModal: React.FC<SquadBuilderModalProps> = ({
  mode,
  selectedLevel,
  onClose,
  onConfirmAndLaunch,
}) => {
  const progress = progression.getProgress();
  const baseLevel = progress.baseLevel || 1;
  const maxCapacity = mode === 'coop' ? 3 : (BALANCE_CONFIG.baseStats.defenderCapacity[baseLevel] || 6);

  const initialSquad = mode === 'coop' ? progress.multiplayerSquad : progress.singlePlayerSquad;
  const [currentSquad, setCurrentSquad] = useState<string[]>(() => {
    return progression.sanitizeSquad(initialSquad, maxCapacity);
  });
  const [selectedHeroDetailId, setSelectedHeroDetailId] = useState<string | null>(null);
  const [elementFilter, setElementFilter] = useState<'ALL' | Element>('ALL');

  const handleToggleHero = (heroId: string) => {
    sound.playClick();
    if (currentSquad.includes(heroId)) {
      if (currentSquad.length <= 1) {
        return; // Keep at least 1 hero
      }
      setCurrentSquad(currentSquad.filter((id) => id !== heroId));
    } else {
      if (currentSquad.length >= maxCapacity) {
        sound.playReject();
        return; // Capacity reached
      }
      setCurrentSquad([...currentSquad, heroId]);
    }
  };

  const handleSaveAndLaunch = () => {
    if (currentSquad.length === 0) return;
    sound.playWaveHorn();
    progression.setSquad(mode, currentSquad);
    onConfirmAndLaunch(currentSquad);
  };

  const activeElementCounts = currentSquad.reduce((acc, id) => {
    const hero = HERO_REGISTRY[id];
    if (hero) {
      acc[hero.element] = (acc[hero.element] || 0) + 1;
    }
    return acc;
  }, {} as Record<Element, number>);

  const filteredRoster = ALL_20_HERO_IDS.filter((id) => {
    const hero = HERO_REGISTRY[id];
    if (!hero) return false;
    if (elementFilter !== 'ALL' && hero.element !== elementFilter) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#18211E] border border-[#24332D] rounded-3xl w-full max-w-4xl p-5 sm:p-7 shadow-2xl flex flex-col gap-5 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                Susun Skuad Defender (Squad Builder)
              </h2>
              <p className="text-xs text-slate-400">
                Pilih hingga {maxCapacity} hero unik untuk Stage {selectedLevel} ({mode === 'coop' ? 'Mode Co-op' : `Base Lv.${baseLevel}`}).
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Squad Slots */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>
                Hero Terpilih: <span className="text-emerald-400 font-bold">{currentSquad.length}</span> / {maxCapacity} Slot
              </span>
            </span>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-rose-400 flex items-center gap-0.5"><Flame className="w-3 h-3" /> {activeElementCounts.Fire || 0}</span>
              <span className="text-cyan-400 flex items-center gap-0.5"><Droplets className="w-3 h-3" /> {activeElementCounts.Water || 0}</span>
              <span className="text-lime-400 flex items-center gap-0.5"><Mountain className="w-3 h-3" /> {activeElementCounts.Earth || 0}</span>
              <span className="text-purple-400 flex items-center gap-0.5"><Wind className="w-3 h-3" /> {activeElementCounts.Wind || 0}</span>
            </div>
          </div>

          {/* Slots grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
            {Array.from({ length: maxCapacity }).map((_, idx) => {
              const heroId = currentSquad[idx];
              const hero = heroId ? HERO_REGISTRY[heroId] : null;
              const heroLevel = heroId ? (progress.heroLevels[heroId] || 1) : 1;

              if (hero) {
                return (
                  <div
                    key={idx}
                    className="relative bg-[#1f2c27] border border-emerald-500/40 rounded-xl p-2 flex flex-col items-center gap-1 group hover:border-emerald-400 transition-colors cursor-pointer"
                    onClick={() => handleToggleHero(hero.id)}
                    title={`Klik untuk menghapus ${hero.name}`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleHero(hero.id);
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] hover:bg-rose-500 cursor-pointer shadow-md"
                    >
                      ✕
                    </button>
                    <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center font-black text-sm text-white">
                      {hero.name.substring(0, 2)}
                    </div>
                    <span className="text-[11px] font-bold text-white truncate max-w-full">{hero.name}</span>
                    <span className="text-[9px] font-mono text-emerald-400">Lv.{heroLevel}</span>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className="bg-slate-900/40 border-2 border-dashed border-slate-700/60 rounded-xl p-2 flex flex-col items-center justify-center gap-1 min-h-[76px]"
                >
                  <Plus className="w-4 h-4 text-slate-500" />
                  <span className="text-[10px] font-mono text-slate-500">Slot {idx + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Available Roster Section */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Pilih dari 20 Hero (Aturan: Tidak boleh duplikat)
            </span>

            {/* Element Filter */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
              {(['ALL', 'Fire', 'Water', 'Earth', 'Wind'] as const).map((elem) => (
                <button
                  key={elem}
                  onClick={() => setElementFilter(elem)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    elementFilter === elem ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {elem}
                </button>
              ))}
            </div>
          </div>

          {/* Roster Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {filteredRoster.map((heroId) => {
              const hero = HERO_REGISTRY[heroId];
              const isSelected = currentSquad.includes(heroId);
              const heroLevel = progress.heroLevels[heroId] || 1;

              const elemBadge =
                hero.element === 'Fire' ? 'text-rose-400 bg-rose-950/60 border-rose-800/40' :
                hero.element === 'Water' ? 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40' :
                hero.element === 'Earth' ? 'text-lime-400 bg-lime-950/60 border-lime-800/40' :
                'text-purple-400 bg-purple-950/60 border-purple-800/40';

              return (
                <div
                  key={heroId}
                  onClick={() => handleToggleHero(heroId)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/50 border-emerald-500/70 shadow-sm'
                      : 'bg-[#18211E] hover:bg-[#202b27] border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">{hero.name}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono border ${elemBadge}`}>
                        {hero.element}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Lv.{heroLevel}</span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isSelected ? '✓' : '+'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            onClick={handleSaveAndLaunch}
            disabled={currentSquad.length === 0}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>TERAPKAN SKUAD &amp; MULAI PERTEMPURAN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
