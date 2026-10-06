/**
 * Elemental Wildguard - Settings Modal
 * Mandated by PRD v3.0 Sections 68, 69.
 */

import React, { useState } from 'react';
import {
  X,
  Settings,
  Volume2,
  VolumeX,
  Monitor,
  Vibrate,
  Globe,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { progression, PlayerProgress, PlayerSettings } from '../game/engine/progressionManager';
import { sound } from '../game/audio/soundSynthesizer';

interface SettingsModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onRefresh }) => {
  const [progress, setProgress] = useState<PlayerProgress>(() => progression.getProgress());
  const [settings, setSettings] = useState<PlayerSettings>(() => progression.getProgress().settings);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleUpdate = (patch: Partial<PlayerSettings>) => {
    const updated = { ...settings, ...patch };
    setSettings(updated);
    progression.updateSettings(patch);
    onRefresh();
  };

  const handleResetProgress = () => {
    sound.playClick();
    progression.resetAllProgress();
    setProgress(progression.getProgress());
    setSettings(progression.getProgress().settings);
    setShowResetConfirm(false);
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#18211E] border border-[#24332D] rounded-3xl w-full max-w-xl p-5 sm:p-7 shadow-2xl flex flex-col gap-5 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Pengaturan Permainan (Settings)
              </h2>
              <p className="text-xs text-slate-400">
                Konfigurasi audio, grafis, efek visual, dan preferensi antarmuka.
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

        {/* Audio Controls */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            Audio &amp; Efek Suara
          </span>

          {/* Master Volume */}
          <div className="flex items-center justify-between gap-4 text-xs">
            <span className="text-slate-300">Master Volume</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) => handleUpdate({ volume: parseFloat(e.target.value) })}
                className="w-32 accent-emerald-500"
              />
              <span className="w-10 text-right font-mono text-slate-400">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
          </div>

          {/* SFX Volume */}
          <div className="flex items-center justify-between gap-4 text-xs">
            <span className="text-slate-300">Efek Serangan &amp; Skill (SFX)</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => handleUpdate({ sfxVolume: parseFloat(e.target.value) })}
                className="w-32 accent-emerald-500"
              />
              <span className="w-10 text-right font-mono text-slate-400">
                {Math.round(settings.sfxVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Mute Toggle */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
            <span className="text-slate-300">Bisukan Semua Suara (Mute)</span>
            <button
              onClick={() => handleUpdate({ isMuted: !settings.isMuted })}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                settings.isMuted
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {settings.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{settings.isMuted ? 'Muted' : 'Unmuted'}</span>
            </button>
          </div>
        </div>

        {/* Graphics & Feedback */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Monitor className="w-4 h-4 text-cyan-400" />
            Grafis &amp; Efek Getar
          </span>

          {/* Quality */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Kualitas Grafis (Graphics Quality)</span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {(['Low', 'Medium', 'High'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => handleUpdate({ graphicsQuality: q })}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    settings.graphicsQuality === q
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Screen Shake */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Guncangan Layar Kritis (Screen Shake)</span>
            <button
              onClick={() => handleUpdate({ screenShake: !settings.screenShake })}
              className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer ${
                settings.screenShake ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-900 text-slate-400'
              }`}
            >
              {settings.screenShake ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" /> Bahasa (Language)
            </span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => handleUpdate({ language: 'id' })}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  settings.language === 'id' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Indonesia
              </button>
              <button
                onClick={() => handleUpdate({ language: 'en' })}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  settings.language === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* Developer & Data Management */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-400" />
            Manajemen Data &amp; Reset
          </span>

          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Buka seluruh 10 stage untuk keperluan pengujian QA.
            </span>
            <button
              onClick={() => {
                sound.playDeploy();
                progression.unlockAllLevels();
                onRefresh();
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-600/40 text-indigo-300 font-bold text-xs cursor-pointer shrink-0"
            >
              Buka Semua Stage
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 text-xs pt-2 border-t border-slate-900">
            <span className="text-slate-400">
              Hapus seluruh data progres dan mulai dari awal (Level 1).
            </span>
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800/40 text-rose-300 font-bold text-xs cursor-pointer shrink-0"
              >
                Reset Data
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetProgress}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer hover:bg-rose-500"
                >
                  Yakin Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
