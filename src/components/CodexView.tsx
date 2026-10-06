/**
 * Elemental Wildguard - Codex & Combat Rules Guide
 * Explains Element Cycle, Synergies, Status Effects, Boss Phases, and Economy rules.
 */

import React from 'react';
import { Flame, Droplets, Mountain, Wind, Shield, Zap, Sparkles, BookOpen } from 'lucide-react';

export const CodexView: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 py-2">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold font-display text-white">
          Elemental Wildguard Codex
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Complete gameplay systems manual, elemental relationships, and tactical combat mechanics.
        </p>
      </div>

      {/* Grid of Rule Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Element Cycle */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-white font-bold font-display">
            <Flame className="w-4 h-4 text-orange-400" />
            <h3>1. The Elemental Cycle (Advantage System)</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The world of Elemental Wildguard follows a strict deterministic cycle of elemental superiority:
          </p>
          <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-center">
            <span className="text-orange-400 font-semibold">Fire</span>
            <span className="text-slate-500">→ beats →</span>
            <span className="text-lime-400 font-semibold">Earth</span>
            <span className="text-slate-500">→ beats →</span>
            <span className="text-purple-400 font-semibold">Wind</span>
            <span className="text-slate-500">→ beats →</span>
            <span className="text-cyan-400 font-semibold">Water</span>
            <span className="text-slate-500">→ beats →</span>
            <span className="text-orange-400 font-semibold">Fire</span>
          </div>
          <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
            <li><strong className="text-emerald-400">+15% Damage:</strong> When attacker has elemental advantage.</li>
            <li><strong className="text-rose-400">-15% Damage:</strong> When attacker has elemental disadvantage.</li>
            <li>All 10 enemy types have fixed elemental affiliations.</li>
          </ul>
        </div>

        {/* 2. Status Effects */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-white font-bold font-display">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3>2. Status Effects & CC Rules</h3>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <div>
              <strong className="text-amber-400 font-semibold">Earth Mark:</strong> Applied by Bronn, Terra, Roota, and Gaia. Lasts 5s, max 1 stack. Enables Earth synergies.
            </div>
            <div>
              <strong className="text-lime-400 font-semibold">Root:</strong> Stops enemy movement, but enemy <em className="text-white">CAN attack</em> and <em className="text-white">CAN use skills</em>. Normal cap 4s, Boss cap 1.5s.
            </div>
            <div>
              <strong className="text-orange-400 font-semibold">Burn:</strong> Max 3 stacks global per enemy. Each stack deals 5% source ATK/sec for 4s. 4th stack replaces earliest expiring stack.
            </div>
            <div>
              <strong className="text-cyan-400 font-semibold">Slow:</strong> Reduces movement speed up to a maximum cap of 80%.
            </div>
            <div>
              <strong className="text-purple-400 font-semibold">Pull:</strong> Displaces enemy backward along path. Strictly capped at 3.0 tiles cumulative displacement (1.5 tiles for bosses).
            </div>
          </div>
        </div>

        {/* 3. Synergies & Elemental Awakening */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-white font-bold font-display">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3>3. Elemental Synergies & Awakening</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Combine heroes of different elements to trigger devastating elemental reactions:
          </p>
          <div className="text-xs space-y-1.5 text-slate-400">
            <div><strong className="text-white">Steamfall (Fire + Water):</strong> Burn + Slow on enemy → 250% Combined ATK vapor explosion.</div>
            <div><strong className="text-white">Magma Core (Fire + Earth):</strong> Burn + Earth Mark → 300% Combined ATK lava burst.</div>
            <div><strong className="text-white">Mud Prison (Water + Earth):</strong> Slow + Earth Mark → 220% Combined ATK and Roots target for 2.5s.</div>
            <div><strong className="text-white">Typhoon Flame (Fire + Water + Wind):</strong> Burn + Slow + Wind attack → 350% Combined ATK searing tempest.</div>
            <div><strong className="text-white">4-Element Awakening:</strong> Having 1 Fire, 1 Water, 1 Earth, and 1 Wind hero all alive grants +15% damage, +10% AS, +10% DEF, and +10% range.</div>
          </div>
        </div>

        {/* 4. Economy & Progression */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-white font-bold font-display">
            <Zap className="w-4 h-4 text-indigo-400" />
            <h3>4. Economy & Upgrade Progression</h3>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li><strong className="text-amber-300">Starting Gold:</strong> 500 Gold (scaled up to 1200G in higher levels).</li>
            <li><strong className="text-amber-300">Wave Reward:</strong> <code>100 + Wave × 20</code> Gold per wave cleared.</li>
            <li><strong className="text-amber-300">Elite Reward:</strong> <code>RoundHalfUp(BaseReward × 2.5)</code>.</li>
            <li><strong className="text-amber-300">Hero Upgrade Costs:</strong> Total 5,050 Gold to reach Level 10 (1→2: 150 ... 9→10: 1300).</li>
            <li><strong className="text-amber-300">Sell Refund:</strong> Exactly 70% refund of total investment (deployment + upgrades), allowed during Preparation phase only.</li>
            <li><strong className="text-amber-300">Hero Revive:</strong> Fallen heroes automatically revive at the start of next wave with 30% Max HP for free!</li>
          </ul>
        </div>

        {/* 5. Campaign Levels vs Waves */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 md:col-span-2">
          <div className="flex items-center gap-2 text-white font-bold font-display">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h3>5. Perbedaan Level dan Waves (Sistem Kampanye Level 1 - 5)</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Elemental Wildguard menerapkan pemisahan tegas antara <strong>Level (Stage/Misi)</strong> dan <strong>Waves (Gelombang Musuh)</strong>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-emerald-500/30">
              <span className="text-emerald-400 font-bold block">Level 1 (LV-01)</span>
              <span className="text-[11px] text-slate-400">Emerald Outpost</span>
              <span className="text-[10px] text-amber-300 block mt-1">5 Waves · Scout Forces</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-cyan-500/30">
              <span className="text-cyan-400 font-bold block">Level 2 (LV-02)</span>
              <span className="text-[11px] text-slate-400">Sunken City</span>
              <span className="text-[10px] text-amber-300 block mt-1">6 Waves · Speed Runners</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-orange-500/30">
              <span className="text-orange-400 font-bold block">Level 3 (LV-03)</span>
              <span className="text-[11px] text-slate-400">Volcanic Caldera</span>
              <span className="text-[10px] text-amber-300 block mt-1">7 Waves · Armored Mini-Boss</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-yellow-500/30">
              <span className="text-yellow-400 font-bold block">Level 4 (LV-04)</span>
              <span className="text-[11px] text-slate-400">Storm Canyon</span>
              <span className="text-[10px] text-amber-300 block mt-1">8 Waves · Flame Warden</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-purple-500/30">
              <span className="text-purple-400 font-bold block">Level 5 (LV-05)</span>
              <span className="text-[11px] text-slate-400">Primordial Core</span>
              <span className="text-[10px] text-amber-300 block mt-1">10 Waves · Primal Colossus</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 flex flex-wrap gap-4 mt-1 border-t border-slate-800 pt-2 font-mono">
            <span>★ 1 Bintang: Selesaikan semua Wave di Level</span>
            <span>★★ 2 Bintang: Base Core HP $\ge$ 60-70%</span>
            <span>★★★ 3 Bintang: Pertahanan Sempurna (100% Core HP)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
