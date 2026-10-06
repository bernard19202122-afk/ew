/**
 * Elemental Wildguard - Hero Deployment Selection Modal
 * Allows choosing a hero to deploy to a specific tactical slot.
 */

import React, { useState } from 'react';
import { HERO_REGISTRY } from '../game/data/heroRegistry';
import { BALANCE_CONFIG } from '../game/config/balanceConfig';
import { Element, HeroTemplate } from '../game/types/gameTypes';
import { X, Plus, Shield, Swords, Zap, Heart } from 'lucide-react';
import { sound } from '../game/audio/soundSynthesizer';

interface HeroDeployModalProps {
  slotIndex: number;
  deployedHeroIds: string[];
  gold: number;
  onDeploy: (templateId: string, slotIndex: number) => void;
  onClose: () => void;
}

export const HeroDeployModal: React.FC<HeroDeployModalProps> = ({
  slotIndex,
  deployedHeroIds,
  gold,
  onDeploy,
  onClose,
}) => {
  const [elementFilter, setElementFilter] = useState<'All' | Element>('All');

  const heroesList = Object.values(HERO_REGISTRY).filter((h) => {
    if (elementFilter !== 'All' && h.element !== elementFilter) return false;
    return true;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white font-display">
              Deploy Hero to Tactical Slot {slotIndex}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an elemental champion to station at this strategic position. (1 instance per hero limit)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Element Filter Controls */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs">
          {(['All', 'Fire', 'Water', 'Earth', 'Wind'] as const).map((el) => (
            <button
              key={el}
              onClick={() => {
                sound.playClick();
                setElementFilter(el);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                elementFilter === el
                  ? 'bg-slate-800 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {el === 'All' ? 'All Elements (20)' : `${el}`}
            </button>
          ))}
        </div>

        {/* Heroes Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {heroesList.map((hero) => {
            const isAlreadyDeployed = deployedHeroIds.includes(hero.id);
            const cost = BALANCE_CONFIG.economy.deploymentCosts[hero.rarity];
            const canAfford = gold >= cost;

            return (
              <div
                key={hero.id}
                className={`bg-slate-950/80 border rounded-xl p-3 flex flex-col justify-between transition-all ${
                  isAlreadyDeployed
                    ? 'border-slate-800/50 opacity-50 cursor-not-allowed'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-display font-bold text-white text-xs border border-slate-700">
                        {hero.name.substring(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm font-display">
                            {hero.name}
                          </span>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${getElementBadgeColor(
                              hero.element
                            )}`}
                          >
                            {hero.element}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {hero.rarity} · {hero.role}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-300 text-xs">
                        {cost} Gold
                      </span>
                    </div>
                  </div>

                  {/* Core Base Stats */}
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] bg-slate-900/60 p-1.5 rounded-lg border border-slate-800 mb-2">
                    <div>
                      <span className="text-slate-400">HP: </span>
                      <span className="font-mono text-emerald-300 font-semibold">{hero.baseHP}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">ATK: </span>
                      <span className="font-mono text-rose-300 font-semibold">{hero.baseATK}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">AS: </span>
                      <span className="font-mono text-amber-300 font-semibold">{hero.baseAS}/s</span>
                    </div>
                    <div>
                      <span className="text-slate-400">DEF: </span>
                      <span className="font-mono text-blue-300 font-semibold">{hero.baseDEF}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {hero.activeSkillName}: {hero.activeSkillDescription}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80">
                  {isAlreadyDeployed ? (
                    <div className="py-1.5 text-center text-xs font-medium text-slate-500 bg-slate-900/50 rounded-lg">
                      Already Active
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        sound.playDeploy();
                        onDeploy(hero.id, slotIndex);
                        onClose();
                      }}
                      disabled={!canAfford}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{canAfford ? `Deploy (-${cost} Gold)` : 'Insufficient Gold'}</span>
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
