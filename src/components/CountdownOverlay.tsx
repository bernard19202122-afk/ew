/**
 * Elemental Wildguard - 3D Animated Countdown Overlay
 * Mandated by Master PRD v1.0 Section 12
 *
 * Sequence:
 * 3 -> 2 -> 1 -> GO!
 * Selama countdown: Battle Simulation = OFF.
 * Setelah GO!: Battle Simulation = ON.
 */

import React, { useEffect, useState, useRef } from 'react';
import { sound } from '../game/audio/soundSynthesizer';
import { Zap } from 'lucide-react';

interface CountdownOverlayProps {
  onComplete: () => void;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(3); // 3, 2, 1, 0 (0 = GO!)
  const [scale, setScale] = useState<number>(1.6);
  const onCompleteRef = useRef(onComplete);
  const isCompletedRef = useRef<boolean>(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const finishCountdown = () => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    try {
      sound.playCountdownTick(0);
    } catch {}
    setStep(-1);
    onCompleteRef.current?.();
  };

  useEffect(() => {
    // 1. Initial Tick for 3
    try {
      sound.playCountdownTick(3);
    } catch {}
    setScale(1.8);
    const initialTimer = setTimeout(() => setScale(1.0), 60);

    // 2. Guaranteed Fail-safe Timer (forces completion after 2.8s)
    const failsafeTimer = setTimeout(() => {
      finishCountdown();
    }, 2800);

    // 3. Smooth Step-by-Step Interval (650ms per number)
    let current = 3;
    const interval = setInterval(() => {
      current -= 1;
      if (current >= 0) {
        setStep(current);
        try {
          sound.playCountdownTick(current);
        } catch {}
        setScale(1.75);
        setTimeout(() => setScale(1.0), 60);
      } else {
        clearInterval(interval);
        clearTimeout(failsafeTimer);
        finishCountdown();
      }
    }, 650);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
      clearTimeout(failsafeTimer);
    };
  }, []); // Run strictly once on mount

  if (step < 0) return null;

  const isGo = step === 0;

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    finishCountdown();
  };

  return (
    <div
      onClick={handleSkip}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 cursor-pointer select-none"
      title="Klik untuk langsung memulai (Skip Countdown)"
    >
      <div className="flex flex-col items-center justify-center pointer-events-none">
        {/* Pulsing Outer Glow Ring */}
        <div
          className={`w-64 h-64 sm:w-80 sm:h-80 rounded-full flex items-center justify-center border-4 shadow-2xl transition-all duration-300 ${
            isGo
              ? 'border-emerald-400 bg-emerald-950/70 shadow-[0_0_80px_rgba(16,185,129,0.85)] scale-110'
              : 'border-amber-400 bg-amber-950/60 shadow-[0_0_60px_rgba(245,158,11,0.65)]'
          }`}
          style={{
            transform: `scale(${scale})`,
            transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <span
            className={`font-black font-display tracking-wider drop-shadow-2xl select-none ${
              isGo
                ? 'text-5xl sm:text-7xl text-emerald-300 font-extrabold animate-bounce'
                : 'text-7xl sm:text-9xl text-amber-300'
            }`}
          >
            {isGo ? 'GO!' : step}
          </span>
        </div>

        <p className="mt-6 text-sm sm:text-base font-bold uppercase tracking-widest text-slate-200 drop-shadow">
          {isGo ? 'PERTEMPURAN DIMULAI!' : 'MEMPERSIAPKAN MEDAN TEMPUR...'}
        </p>

        <div className="mt-4 pointer-events-auto">
          <button
            onClick={handleSkip}
            className="px-4 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Klik di mana saja atau klik di sini untuk Lewati (Skip)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
