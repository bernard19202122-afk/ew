/**
 * Elemental Wildguard - BalanceConfig v2.2.0-draft Inspector View
 * Detailed breakdown of the 10 PRD decisions and live interactive JSON representation.
 */

import React, { useState } from 'react';
import { BALANCE_CONFIG } from '../game/config/balanceConfig';
import { CheckCircle2, Copy, Check } from 'lucide-react';
import { sound } from '../game/audio/soundSynthesizer';

export const BalanceConfigView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(BALANCE_CONFIG, null, 2);

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const decisions = [
    {
      code: 'PC-01',
      title: 'Boss HP/DEF vs Target TTK',
      choice: 'Opsi B [DIUBAH]',
      description:
        'Turunkan effective boss envelope ke 75,000–150,000 HP dan 250–350 DEF dengan 10% resistance. Target TTK 60–120s tercapai oleh optimized Lv8–10 team.',
    },
    {
      code: 'PC-02',
      title: 'Elite Reward Scaling',
      choice: 'Opsi A [DIUBAH]',
      description:
        'Elite reward = RoundHalfUp(NormalReward × 2.5). Menghilangkan flat 100 Gold untuk konsistensi tier progression.',
    },
    {
      code: 'PC-03',
      title: 'Active Skill Energy Cost',
      choice: 'Opsi A [DIPERTAHANKAN]',
      description:
        'Active skill mengonsumsi Energy bersama (Pyra 20, Mira 15, Terra 25). Memberi kedalaman resource management antara utility dan ultimate timing.',
    },
    {
      code: 'PC-04',
      title: 'Pyra Ultimate Cooldown',
      choice: 'Opsi B [DIUBAH]',
      description:
        'Default ultimate internal cooldown adalah 5s, tetapi Pyra memiliki explicit override 25s di BalanceConfig.',
    },
    {
      code: 'PC-05',
      title: 'Pull Continuous Displacement Cap',
      choice: 'Opsi B [DIUBAH]',
      description:
        'Cap 3 tile displacement dihitung kumulatif per effect instance (bukan per pulse). Boss pull dibatasi maksimal 1.5 tiles (50%).',
    },
    {
      code: 'PC-06',
      title: 'Periodic Zone Damage Tick',
      choice: 'Opsi B [DIUBAH]',
      description:
        'Zone damage (Inferno Wheel, Storm Field) adalah Periodic Area Damage dengan tick 0.5s (damage = 50% dps per tick), bukan DoT 1/sec.',
    },
    {
      code: 'PC-07',
      title: 'Global Boss CC Formula',
      choice: 'Opsi B [DIUBAH]',
      description:
        'FinalDuration = min(BaseDuration × 0.50, BossCCCap). Menghilangkan hardcoded duration per skill.',
    },
    {
      code: 'PC-08',
      title: 'Run Economy & Wave Rewards',
      choice: 'Opsi B [DIUBAH]',
      description:
        'Wave reward = 100 + Wave×20 (total 12,300 Gold). Memungkinkan 3 hero mencapai Lv10 dan hero ke-4 sebagian upgrade.',
    },
    {
      code: 'PC-09',
      title: 'Stat-Tier Role Exceptions',
      choice: 'Opsi A [DIUBAH]',
      description:
        'Tier table menjadi baseline dengan role exceptions (Tank HP max ×1.35, DEF max ×1.30, min AS 0.75, min Range 2.0).',
    },
    {
      code: 'PC-10',
      title: 'Raw DPS Target Envelope',
      choice: 'Opsi A [DIUBAH]',
      description:
        'Revisi envelope target DPS (Common 80–170, Epic 130–220, Legendary 160–280, Mythic 190–300) agar hero existing tidak perlu di-nerf.',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 py-2">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold font-display text-white">
          PRD v2.2 BalanceConfig (`{BALANCE_CONFIG.balanceVersion}`)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Semua logika combat dan formula deterministik bersumber langsung dari skema konfigurasi berikut tanpa hardcoded number.
        </p>
      </div>

      {/* 10 PRD Decision Cards */}
      <div>
        <h2 className="text-base font-bold font-display text-white mb-3 flex items-center gap-2">
          <span>10 Keputusan Desain PRD v2.2 (PC-01 s/d PC-10)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {decisions.map((d) => (
            <div
              key={d.code}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono font-bold text-amber-400">{d.code} · {d.title}</span>
                  <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                    {d.choice}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{d.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live JSON Representation */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-slate-300">
              balanceConfig.json ({BALANCE_CONFIG.balanceVersion})
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
          </button>
        </div>

        <div className="p-4 max-h-[500px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre selection:bg-amber-500/30">
          {jsonString}
        </div>
      </div>
    </div>
  );
};
