/**
 * Elemental Wildguard - High-Impact Tactical Command Battlefield
 * Enhanced 100x Edition:
 * - Dynamic Sector Environments (S1 Emerald Prime, S2 The Sunken City, S3 Volcanic Crag)
 * - Visual Attack Beams & Dynamic Elemental Particle detonations
 * - Active Commander Tactical Powers (Q: Orbital Strike, W: Core Overdrive, E: Cryo Blizzard, R: Harvest Drones, F: Burst)
 * - In-Plot Quick Upgrades & Instant Ultimate Casting
 * - Real-Time Hero DPS & Damage Share Leaderboard
 * - Dynamic Screen Rumble & Base Breach Red Warning Vignette
 * - Cinematic Boss Arrival & Wave Victory Banners
 * - Fast-Forward Wave Rush (+Bonus Gold)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Coins,
  Swords,
  Zap,
  Play,
  Pause,
  Sparkles,
  Plus,
  ArrowRight,
  Skull,
  Castle,
  Users,
  Compass,
  Radio,
  Activity,
  Crosshair,
  BarChart3,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Flame,
  Droplets,
  Mountain,
  Wind,
  MapPin,
  Lock,
  Star,
} from 'lucide-react';
import { GameSimulation } from '../game/engine/gameSimulation';
import { HeroInstance, TacticalSlot, Element } from '../game/types/gameTypes';
import { sound } from '../game/audio/soundSynthesizer';
import { GRID_HEIGHT, GRID_WIDTH, LANE_PATHS } from '../game/engine/pathfinding';
import { BALANCE_CONFIG } from '../game/config/balanceConfig';
import { HERO_REGISTRY } from '../game/data/heroRegistry';
import { HeroAvatar, EnemyAvatar } from './GameAvatars';
import { progression } from '../game/engine/progressionManager';
import { Battlefield3D } from './3d/Battlefield3D';

// Map Environment Backgrounds
import tacticalMapBg from '../assets/images/tactical_command_map_1790659057164.jpg';
import emeraldMapBg from '../assets/images/tactical_emerald_map_1790660096663.jpg';
import volcanoMapBg from '../assets/images/tactical_volcano_map_1790660110786.jpg';
import desertMapBg from '../assets/images/tactical_desert_map_1790660570323.jpg';
import astralMapBg from '../assets/images/tactical_astral_map_1790660583753.jpg';
import { CAMPAIGN_LEVELS } from '../game/data/levelRegistry';

interface BattlefieldProps {
  sim: GameSimulation;
  onSelectSlotToDeploy?: (slotIndex: number) => void;
  onDeploySlot?: (slotIndex: number) => void;
  selectedHero: HeroInstance | null;
  onSelectHero: (hero: HeroInstance | null) => void;
  onOpenBurst?: () => void;
  onQuickDeployStarterTeam?: () => void;
  onOpenStageSelect?: (levelNum?: number) => void;
  onSelectLevel?: (levelNum: number) => void;
  onStartWave?: () => void;
  onCallEarlyWave?: () => void;
  playerMode?: 'single' | 'coop';
  myPlayerRole?: 'P1' | 'P2';
  onExitBattleToLobby?: () => void;
}

interface SectorInfo {
  id: string;
  name: string;
  sub: string;
  bgImage: string;
  accent: string;
  border: string;
  ambientGrad: string;
  roadBridgeColor: string;
  roadCurbColor: string;
  dashedLineColor: string;
  rootConduitColor: string;
  nexusName: string;
  nexusThemeColor: string;
}

const SECTOR_CONFIGS: Record<string, SectorInfo> = {
  S1: {
    id: 'S1',
    name: 'EMERALD PRIME OVERGROWTH',
    sub: 'Ancient Jade Jungle & Spore Sanctum',
    bgImage: emeraldMapBg,
    accent: '#10b981',
    border: '#064e3b',
    ambientGrad: 'from-emerald-950/40 via-transparent to-lime-950/30',
    roadBridgeColor: '#173627',
    roadCurbColor: '#2b5a41',
    dashedLineColor: '#a7f3d0',
    rootConduitColor: '#22c55e',
    nexusName: 'PRIMEVAL ARBOR-CORE',
    nexusThemeColor: '#10b981',
  },
  S2: {
    id: 'S2',
    name: 'THE SUNKEN CITY',
    sub: 'Flooded Metro & Submerged Hydro-Conduits',
    bgImage: tacticalMapBg,
    accent: '#06b6d4',
    border: '#164e63',
    ambientGrad: 'from-cyan-950/40 via-transparent to-blue-950/30',
    roadBridgeColor: '#1e3e4a',
    roadCurbColor: '#2d5766',
    dashedLineColor: '#ffffff',
    rootConduitColor: '#4ade80',
    nexusName: 'BIO-NEXUS CENTRAL',
    nexusThemeColor: '#06b6d4',
  },
  S3: {
    id: 'S3',
    name: 'VOLCANIC INFERNO CRAG',
    sub: 'Molten Magma Caldera & Obsidian Fissures',
    bgImage: volcanoMapBg,
    accent: '#f97316',
    border: '#7c2d12',
    ambientGrad: 'from-orange-950/40 via-transparent to-rose-950/30',
    roadBridgeColor: '#381c15',
    roadCurbColor: '#5a2d21',
    dashedLineColor: '#fed7aa',
    rootConduitColor: '#f97316',
    nexusName: 'MAGMA CITADEL FORGE',
    nexusThemeColor: '#f97316',
  },
  S4: {
    id: 'S4',
    name: 'STORM SAND CANYON',
    sub: 'Ancient Sunken Temples & Amber Dunes',
    bgImage: desertMapBg,
    accent: '#eab308',
    border: '#713f12',
    ambientGrad: 'from-amber-950/40 via-transparent to-yellow-950/30',
    roadBridgeColor: '#452b14',
    roadCurbColor: '#78350f',
    dashedLineColor: '#fde047',
    rootConduitColor: '#eab308',
    nexusName: 'SUN-FORGE SANCTUM',
    nexusThemeColor: '#eab308',
  },
  S5: {
    id: 'S5',
    name: 'ASTRAL PRIMORDIAL CORE',
    sub: 'Cosmic Void Rift & Celestial Energy Conduits',
    bgImage: astralMapBg,
    accent: '#a855f7',
    border: '#581c87',
    ambientGrad: 'from-purple-950/40 via-transparent to-indigo-950/30',
    roadBridgeColor: '#2e1065',
    roadCurbColor: '#581c87',
    dashedLineColor: '#e9d5ff',
    rootConduitColor: '#c084fc',
    nexusName: 'PRIMORDIAL ASTRAL NEXUS',
    nexusThemeColor: '#a855f7',
  },
};

export const Battlefield: React.FC<BattlefieldProps> = ({
  sim,
  onSelectSlotToDeploy,
  onDeploySlot,
  selectedHero,
  onSelectHero,
  onOpenBurst,
  onQuickDeployStarterTeam,
  onOpenStageSelect,
  onSelectLevel,
  onStartWave,
  onCallEarlyWave,
  playerMode = 'single',
  myPlayerRole = 'P1',
  onExitBattleToLobby,
}) => {
  const [hoveredHero, setHoveredHero] = useState<HeroInstance | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string>('S1');
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [showDPSMeter, setShowDPSMeter] = useState<boolean>(false);
  const [isTargetingOrbital, setIsTargetingOrbital] = useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const triggerDeploySlot = (slotIndex: number) => {
    if (onSelectSlotToDeploy) onSelectSlotToDeploy(slotIndex);
    if (onDeploySlot) onDeploySlot(slotIndex);
  };

  // Auto-sync Sector theme to current Campaign Level
  useEffect(() => {
    const lvlCfg = CAMPAIGN_LEVELS[sim.currentLevel];
    if (lvlCfg?.sectorId) {
      setSelectedSectorId(lvlCfg.sectorId);
    }
  }, [sim.currentLevel]);

  const currentSector = SECTOR_CONFIGS[selectedSectorId] || SECTOR_CONFIGS.S1;

  const isFourElementAwakening = sim.synergyManager.isFourElementAwakeningActive(sim.heroes);
  const burstReady = sim.synergyManager.isBurstReady();
  const burstCdRemaining = sim.synergyManager.getBurstCooldownRemaining();

  const handleSpeedChange = (speed: number) => {
    sound.playClick();
    sim.gameSpeed = speed;
    sim.isPaused = false;
  };

  const handleTogglePause = () => {
    sound.playClick();
    sim.isPaused = !sim.isPaused;
  };

  const handleForceStartCombat = () => {
    sound.playWaveHorn();
    if (onStartWave) {
      onStartWave();
    } else {
      sim.startCombatPhase();
    }
  };

  const handleCallEarlyWave = () => {
    if (onCallEarlyWave) {
      onCallEarlyWave();
    } else {
      sim.callWaveEarly();
    }
  };

  // Keyboard shortcut listener for Commander Powers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'q' || e.key === 'Q') {
        if (sim.commanderCooldowns.orbitalStrike <= 0) {
          sound.playClick();
          setIsTargetingOrbital((prev) => !prev);
        }
      } else if (e.key === 'w' || e.key === 'W') {
        if (sim.commanderCooldowns.bioBarrier <= 0) {
          sound.playClick();
          sim.useBioBarrierOverdrive();
        }
      } else if (e.key === 'e' || e.key === 'E') {
        if (sim.commanderCooldowns.cryoFreeze <= 0) {
          sound.playClick();
          sim.useCryoFreezeWave();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (sim.commanderCooldowns.droneHarvest <= 0) {
          sound.playClick();
          sim.useGoldDroneHarvest();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        if (burstReady) {
          sound.playClick();
          onOpenBurst?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sim, burstReady, onOpenBurst]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTargetingOrbital || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * GRID_WIDTH;
    const clickY = ((e.clientY - rect.top) / rect.height) * GRID_HEIGHT;

    sim.useOrbitalStrike(clickX, clickY);
    setIsTargetingOrbital(false);
  };

  const activeInspectHero = selectedHero || hoveredHero;

  const getElementColor = (el: Element): string => {
    switch (el) {
      case 'Fire':
        return '#f97316';
      case 'Water':
        return '#06b6d4';
      case 'Earth':
        return '#84cc16';
      case 'Wind':
        return '#a855f7';
      default:
        return '#e2e8f0';
    }
  };

  // Screen shake micro-jitter
  const shakeX = sim.screenShakeTimer > 0 ? (Math.random() - 0.5) * (sim.screenShakeTimer * 12) : 0;
  const shakeY = sim.screenShakeTimer > 0 ? (Math.random() - 0.5) * (sim.screenShakeTimer * 12) : 0;

  // Real-time DPS calculation
  const totalHeroDamage = sim.heroes.reduce((sum, h) => sum + h.damageDealt, 0);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Outer Tactical Command Console Bezel */}
      <div
        className="w-full bg-[#0a141a] border-4 border-[#1b323d] rounded-3xl p-3 sm:p-5 shadow-[0_0_50px_rgba(4,24,30,0.8)] relative overflow-hidden transition-transform"
        style={{
          transform: sim.screenShakeTimer > 0 ? `translate(${shakeX}px, ${shakeY}px)` : undefined,
        }}
      >
        {/* Terminal Corner Screws */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-[#1b323d] border border-[#2b4c5c] flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-[#0a141a]" />
        </div>
        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#1b323d] border border-[#2b4c5c] flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-[#0a141a]" />
        </div>
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-[#1b323d] border border-[#2b4c5c] flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-[#0a141a]" />
        </div>
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-[#1b323d] border border-[#2b4c5c] flex items-center justify-center">
          <div className="w-1.5 h-0.5 bg-[#0a141a]" />
        </div>

        {/* Top Terminal Bar: PROJECT OVERGROWTH & SECTOR SWITCHER */}
        <div className="w-full flex flex-col items-center justify-center mb-3">
          <div className="relative px-6 sm:px-8 py-1.5 bg-[#0e2129] border-2 border-[#224856] rounded-xl shadow-lg flex items-center gap-3">
            <div
              className="w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor]"
              style={{ color: currentSector.accent, backgroundColor: currentSector.accent }}
            />
            <h1 className="font-mono font-black tracking-[0.25em] text-cyan-300 text-sm sm:text-base uppercase drop-shadow">
              PROJECT OVERGROWTH
            </h1>
            <div
              className="w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor]"
              style={{ color: currentSector.accent, backgroundColor: currentSector.accent }}
            />
          </div>

          {/* Subtitle Telemetry Ribbon with Sector / Stage Selector */}
          <div className="w-full max-w-4xl mt-2 px-3 py-1.5 bg-[#09171e]/90 border border-[#1a3845] rounded-xl flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-300 gap-2">
            {/* Sector / Stage Switcher Buttons */}
            <div className="flex items-center gap-1.5 bg-[#06141a] p-1 rounded-xl border border-[#1a3845]">
              <span className="text-[10px] text-amber-400 font-bold px-1 uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" /> STAGE:
              </span>
              {(['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'] as const).map((sId, idx) => {
                const lvlNum = idx + 1;
                const isCurrent = sim.currentLevel === lvlNum;
                const isUnlocked = progression.isLevelUnlocked(lvlNum);
                const stars = progression.getStarsForLevel(lvlNum);

                return (
                  <button
                    key={sId}
                    onClick={() => {
                      sound.playClick();
                      const sectorMapping: Record<string, any> = {
                        S1: 'S1', S2: 'S1', S3: 'S2', S4: 'S2', S5: 'S3', S6: 'S3', S7: 'S4', S8: 'S4', S9: 'S5', S10: 'S5'
                      };
                      setSelectedSectorId(sectorMapping[sId] || 'S1');
                      if (onOpenStageSelect) {
                        onOpenStageSelect(lvlNum);
                      } else if (onSelectLevel && isUnlocked) {
                        onSelectLevel(lvlNum);
                      }
                    }}
                    className={`px-1.5 py-0.5 rounded-lg text-[9px] font-bold transition-all flex items-center gap-0.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_#06b6d4] ring-1 ring-white/50'
                        : isUnlocked
                        ? 'text-amber-300 hover:text-white bg-[#10242e] hover:bg-[#193a4a] border border-[#204557]'
                        : 'text-slate-600 bg-slate-950/70 border border-slate-900'
                    }`}
                    title={
                      isCurrent
                        ? `Stage ${lvlNum} (${sId}) - Sedang Aktif`
                        : isUnlocked
                        ? `Stage ${lvlNum} (${sId}) - Terbuka (${stars}/3 Bintang). Klik untuk info/mainkan`
                        : `Stage ${lvlNum} (${sId}) - Terkunci. Selesaikan Stage ${lvlNum - 1} dahulu`
                    }
                  >
                    {!isUnlocked ? (
                      <Lock className="w-2.5 h-2.5 text-slate-600" />
                    ) : stars > 0 ? (
                      <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    ) : null}
                    <span>{sId}</span>
                  </button>
                );
              })}
              <span className="text-white font-bold tracking-wider ml-1 hidden lg:inline">
                {currentSector.name}
              </span>
            </div>

            {/* Core Telemetry Stats: Clear Level vs Waves Differentiation */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              {onOpenStageSelect && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenStageSelect(sim.currentLevel);
                  }}
                  className="px-2.5 py-1 bg-gradient-to-r from-amber-500/25 via-orange-500/25 to-rose-500/25 hover:from-amber-500/40 hover:to-rose-500/40 border border-amber-500/50 hover:border-amber-400 rounded-lg text-amber-300 hover:text-white font-black text-[10px] flex items-center gap-1.5 transition-all shadow-md cursor-pointer transform hover:scale-105"
                  title="Buka Menu Pemilihan Stage (Levels 1 hingga 5)"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>PILIH STAGE (1–10)</span>
                </button>
              )}

              {/* Core Telemetry Stats: Supports Single Player & 2-Player Co-op HUD */}
              {sim.playerMode === 'coop' ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold">
                    P1 💰 {sim.p1Gold} Gold
                  </span>
                  <span className="text-slate-500 font-bold">|</span>
                  <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40 font-bold">
                    P2 💰 {sim.p2Gold} Gold
                  </span>
                  <span className="text-slate-500 font-bold">|</span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold">
                    ❤️ Core {sim.baseHP}%
                  </span>
                  <span className="text-slate-500 font-bold">|</span>
                  <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold">
                    WAVE {sim.currentWaveInLevel}/{sim.levelWavesCount}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    You: {sim.activePlayerId}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-slate-800/90 text-amber-300 border border-amber-500/30 font-bold">
                    LEVEL {sim.currentLevel}
                  </span>
                  <span>
                    WAVE: <strong className="text-amber-300 font-bold">{sim.currentWaveInLevel} / {sim.levelWavesCount}</strong>
                  </span>
                  <span>
                    GOLD: <strong className="text-emerald-400 font-bold">{sim.gold}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    CORE: <strong className="text-rose-400 font-bold">{sim.baseHP}%</strong>
                  </span>
                </div>
              )}
              {/* Early Wave Rush Button during Prep */}
              {sim.phase === 'PREPARATION' && (
                <button
                  onClick={handleCallEarlyWave}
                  className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold rounded text-[10px] shadow transition-transform hover:scale-105 flex items-center gap-1 animate-pulse cursor-pointer"
                >
                  <span>RUSH WAVE (+{(Math.ceil(sim.preparationTimer * 15))}G)</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Wave Progress Indicator for the current Level */}
          <div className="w-full max-w-4xl mt-1.5 px-3 py-1 bg-[#061217] border border-[#142d38] rounded-xl flex items-center justify-between gap-3 text-[10px] font-mono">
            <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
              <span className="text-amber-400 font-bold">LV-0{sim.currentLevel} WAVES:</span>
            </div>
            <div className="flex-1 flex items-center gap-1 sm:gap-1.5">
              {Array.from({ length: sim.levelWavesCount }).map((_, wIdx) => {
                const waveNum = wIdx + 1;
                const isCleared = waveNum < sim.currentWaveInLevel;
                const isCurrent = waveNum === sim.currentWaveInLevel;
                const isFinalBoss = waveNum === sim.levelWavesCount;

                return (
                  <div
                    key={waveNum}
                    className={`flex-1 h-2 rounded-full transition-all relative ${
                      isCleared
                        ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                        : isCurrent
                        ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]'
                        : isFinalBoss
                        ? 'bg-rose-950 border border-rose-500/40'
                        : 'bg-slate-800'
                    }`}
                    title={isFinalBoss ? 'Final Wave (Boss Encounter)' : `Wave ${waveNum}`}
                  />
                );
              })}
            </div>
            <span className="text-slate-400 font-mono shrink-0">
              {sim.currentWaveInLevel === sim.levelWavesCount ? (
                <strong className="text-rose-400 animate-pulse">⚠️ BOSS WAVE</strong>
              ) : (
                `Wave ${sim.currentWaveInLevel} of ${sim.levelWavesCount}`
              )}
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* INTERACTIVE COMMAND MAP VIEWPORT (CANVAS) */}
        {/* ============================================================== */}
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          className={`relative w-full aspect-[16/9] bg-[#071318] border-2 border-[#1c3a47] rounded-2xl overflow-hidden shadow-inner select-none ${
            isTargetingOrbital ? 'cursor-crosshair ring-2 ring-rose-500' : ''
          }`}
        >
          {/* Tactical Background Map Image dynamically responsive to Sector */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-55 pointer-events-none transition-all duration-700"
            style={{ backgroundImage: `url(${currentSector.bgImage})` }}
          />

          {/* Sci-Fi Grid Overlay & Scanlines */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, ${currentSector.accent} 1px, transparent 1px), linear-gradient(to bottom, ${currentSector.accent} 1px, transparent 1px)`,
              backgroundSize: `${100 / 12}% ${100 / 8}%`,
            }}
          />

          {/* Sector-specific Atmospheric Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-tr ${currentSector.ambientGrad} pointer-events-none`} />

          {/* Base Breach Red Flash Vignette */}
          {sim.baseAlertFlashTimer > 0 && (
            <div className="absolute inset-0 pointer-events-none z-45 border-4 border-rose-500/90 bg-rose-500/20 animate-pulse" />
          )}

          {/* Cinematic Boss Incoming Banner */}
          {sim.bossIncomingBanner && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center animate-bounce">
              <div className="px-5 py-2 bg-gradient-to-r from-red-600 via-rose-700 to-red-600 text-white font-mono font-extrabold uppercase rounded-xl border-2 border-red-300 shadow-[0_0_30px_#ef4444] flex items-center gap-2.5 text-xs sm:text-sm tracking-wider">
                <Skull className="w-5 h-5 text-yellow-300 animate-spin" />
                <span>⚠️ TARGET DETECTED: {sim.bossIncomingBanner.name} ({sim.bossIncomingBanner.enemyClass})</span>
                <Skull className="w-5 h-5 text-yellow-300 animate-spin" />
              </div>
            </div>
          )}

          {/* Wave Cleared Victory Banner */}
          {sim.waveClearBanner && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center">
              <div className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-mono font-black uppercase rounded-2xl border-2 border-yellow-200 shadow-[0_0_40px_#f59e0b] flex items-center gap-3 text-sm sm:text-base tracking-widest scale-105 transition-all">
                <Sparkles className="w-5 h-5 text-slate-950 animate-spin" />
                <span>★ WAVE {sim.waveClearBanner.wave} CONQUERED! +{sim.waveClearBanner.goldBonus} GOLD ★</span>
                <Sparkles className="w-5 h-5 text-slate-950 animate-spin" />
              </div>
            </div>
          )}

          {/* Orbital Strike Targeting Mode Banner */}
          {isTargetingOrbital && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-rose-950/95 border-2 border-rose-500 rounded-xl px-4 py-1.5 shadow-2xl flex items-center gap-2 font-mono text-xs text-rose-200 animate-pulse">
              <Crosshair className="w-4 h-4 text-rose-400 animate-spin" />
              <span>CLICK ANY TILE TO CALL ORBITAL ION STRIKE</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTargetingOrbital(false);
                }}
                className="ml-2 text-rose-400 hover:text-white underline font-bold"
              >
                Cancel
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* MAP ROADS, BRIDGES & DASHED ENEMY PATHWAYS (SVG LAYER) */}
          {/* ============================================================== */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
              <linearGradient id="bridgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={currentSector.roadBridgeColor} stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0c181f" stopOpacity="0.95" />
              </linearGradient>
            </defs>

            {/* Highway Bridge Surface (Jalan Jembatan Beton) */}
            <polyline
              fill="none"
              stroke="url(#bridgeGrad)"
              strokeWidth="48"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={LANE_PATHS[0].map((p) => `${((p.x + 0.5) / 12) * 100}%,${((p.y + 0.5) / 8) * 100}%`).join(' ')}
            />
            <polyline
              fill="none"
              stroke="url(#bridgeGrad)"
              strokeWidth="48"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={LANE_PATHS[1].map((p) => `${((p.x + 0.5) / 12) * 100}%,${((p.y + 0.5) / 8) * 100}%`).join(' ')}
            />

            {/* Bridge Curbs & Railings */}
            <polyline
              fill="none"
              stroke={currentSector.roadCurbColor}
              strokeWidth="52"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.75"
              points={LANE_PATHS[0].map((p) => `${((p.x + 0.5) / 12) * 100}%,${((p.y + 0.5) / 8) * 100}%`).join(' ')}
            />
            <polyline
              fill="none"
              stroke={currentSector.roadCurbColor}
              strokeWidth="52"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.75"
              points={LANE_PATHS[1].map((p) => `${((p.x + 0.5) / 12) * 100}%,${((p.y + 0.5) / 8) * 100}%`).join(' ')}
            />

            {/* Dashed Enemy Paths */}
            <polyline
              fill="none"
              stroke={currentSector.dashedLineColor}
              strokeWidth="3.5"
              strokeDasharray="9 6"
              opacity="0.9"
              points={LANE_PATHS[0].map((p) => `${((p.x + 0.5) / 12) * 100}%,${((p.y + 0.5) / 8) * 100}%`).join(' ')}
            />
            <polyline
              fill="none"
              stroke={currentSector.dashedLineColor}
              strokeWidth="3.5"
              strokeDasharray="9 6"
              opacity="0.9"
              points={LANE_PATHS[1].map((p) => `${((p.x + 0.5) / 12) * 100}%,${((p.y + 0.5) / 8) * 100}%`).join(' ')}
            />

            {/* Glowing Root Conduit Lines from Base */}
            <path
              d="M 68% 45% Q 55% 55% 40% 50% T 20% 70%"
              fill="none"
              stroke={currentSector.rootConduitColor}
              strokeWidth="3"
              opacity="0.65"
              strokeLinecap="round"
            />
            <path
              d="M 68% 42% Q 58% 30% 45% 25% T 25% 15%"
              fill="none"
              stroke={currentSector.rootConduitColor}
              strokeWidth="2.5"
              opacity="0.65"
              strokeLinecap="round"
            />

            {/* ============================================================== */}
            {/* DYNAMIC ATTACK BEAMS (LASERS & MAGIC STREAKS) */}
            {/* ============================================================== */}
            {sim.attackBeams.map((beam) => {
              const x1 = (beam.fromX / GRID_WIDTH) * 100;
              const y1 = (beam.fromY / GRID_HEIGHT) * 100;
              const x2 = (beam.toX / GRID_WIDTH) * 100;
              const y2 = (beam.toY / GRID_HEIGHT) * 100;
              const col = getElementColor(beam.element);
              const op = Math.max(0.2, beam.duration / beam.maxDuration);

              return (
                <g key={beam.id}>
                  <line
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${x2}%`}
                    y2={`${y2}%`}
                    stroke={col}
                    strokeWidth="5"
                    strokeOpacity={op * 0.85}
                    strokeLinecap="round"
                  />
                  <line
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${x2}%`}
                    y2={`${y2}%`}
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeOpacity={op}
                    strokeLinecap="round"
                  />
                </g>
              );
            })}

            {/* Range Circle of Selected / Inspected Hero */}
            {activeInspectHero && (
              <circle
                cx={`${((activeInspectHero.tileX + 0.5) / 12) * 100}%`}
                cy={`${((activeInspectHero.tileY + 0.5) / 8) * 100}%`}
                r={`${(activeInspectHero.range / 12) * 100}%`}
                fill={`${getElementColor(activeInspectHero.element)}18`}
                stroke={getElementColor(activeInspectHero.element)}
                strokeWidth="2"
                strokeDasharray="6 4"
              />
            )}
          </svg>

          {/* ============================================================== */}
          {/* MAP LANDMARK LABELS */}
          {/* ============================================================== */}
          <div className="absolute top-[6%] left-[16%] pointer-events-none z-15 font-mono text-[9px] text-cyan-200/80 uppercase tracking-widest bg-[#0a1820]/80 px-2 py-0.5 rounded border border-cyan-800/50 shadow">
            BARACKS & HANGARS
          </div>

          <div className="absolute top-[8%] left-[34%] pointer-events-none z-15 font-mono text-[9px] text-cyan-200/80 uppercase tracking-wider bg-[#0a1820]/80 px-2 py-0.5 rounded border border-cyan-800/50 shadow">
            SUBMERGED DISTRICT
          </div>

          <div className="absolute top-[38%] left-[23%] pointer-events-none z-15 font-mono text-[9px] text-cyan-300 uppercase tracking-wider bg-[#0c242e]/85 px-2 py-0.5 rounded border border-cyan-600/60 shadow">
            DROWNED MARKET ARCADE
          </div>

          <div className="absolute top-[52%] left-[42%] pointer-events-none z-15 font-mono text-[9px] text-amber-300 font-bold bg-[#1d1607]/90 px-2 py-0.5 rounded border border-amber-500/80 shadow flex items-center gap-1">
            <span>⚙️ REPAIR BRIDGE</span>
          </div>

          <div className="absolute bottom-[20%] right-[14%] pointer-events-none z-15 font-mono text-[9px] text-emerald-300 uppercase bg-[#092419]/80 px-2 py-0.5 rounded border border-emerald-600/50 shadow">
            BIO-LAB COMPLEX & SPORA INCUBATOR
          </div>

          {/* ============================================================== */}
          {/* ENEMY SPAWNS (PINTU MASUK 1 & 2) */}
          {/* ============================================================== */}
          <div
            style={{
              left: '2%',
              top: `${(1 / 8) * 100}%`,
              width: `${(1 / 12) * 100}%`,
              height: `${(1 / 8) * 100}%`,
            }}
            className="absolute z-20 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="relative flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-rose-950/90 border-2 border-rose-500 flex items-center justify-center shadow-lg shadow-rose-950 animate-pulse">
                <Skull className="w-4 h-4 text-rose-300" />
              </div>
              <div className="mt-1 px-1.5 py-0.2 bg-rose-950 text-rose-200 text-[8px] font-mono font-bold uppercase rounded border border-rose-500/80 whitespace-nowrap shadow">
                ENEMY SPAWN 1
              </div>
            </div>
          </div>

          <div
            style={{
              left: '2%',
              top: `${(6 / 8) * 100}%`,
              width: `${(1 / 12) * 100}%`,
              height: `${(1 / 8) * 100}%`,
            }}
            className="absolute z-20 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="relative flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-rose-950/90 border-2 border-rose-500 flex items-center justify-center shadow-lg shadow-rose-950 animate-pulse">
                <Skull className="w-4 h-4 text-rose-300" />
              </div>
              <div className="mt-1 px-1.5 py-0.2 bg-rose-950 text-rose-200 text-[8px] font-mono font-bold uppercase rounded border border-rose-500/80 whitespace-nowrap shadow">
                ENEMY SPAWN 2A
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* CENTRAL BIO-NEXUS / PLAYER BASE (BASE BUAT MUSUH SERANG) */}
          {/* ============================================================== */}
          <div
            style={{
              left: `${(10.2 / 12) * 100}%`,
              top: `${(2.6 / 8) * 100}%`,
              width: `${(1.7 / 12) * 100}%`,
              height: `${(2.8 / 8) * 100}%`,
            }}
            className="absolute z-25 flex flex-col items-center justify-center pointer-events-none"
          >
            {/* Health Meter Above Core */}
            <div className="flex flex-col items-center gap-0.5 mb-1">
              <div className="px-2 py-0.5 bg-[#051a22] text-cyan-300 text-[9px] font-mono font-bold uppercase rounded border border-cyan-400 shadow flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>NEXUS: {sim.baseHP}%</span>
              </div>
              <div className="w-20 h-2 bg-[#091b24] rounded-full overflow-hidden border border-cyan-600/60 shadow">
                <div
                  className={`h-full transition-all duration-300 ${
                    sim.baseHP > 50
                      ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                      : sim.baseHP > 25
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                      : 'bg-gradient-to-r from-rose-500 to-red-600 animate-pulse'
                  }`}
                  style={{ width: `${Math.max(0, sim.baseHP)}%` }}
                />
              </div>
            </div>

            {/* Glowing Bio-Core Roots & Core Sphere */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full blur-xl animate-ping opacity-30"
                style={{ backgroundColor: currentSector.nexusThemeColor }}
              />
              <div
                className="absolute inset-2 rounded-full border-2 animate-spin opacity-80"
                style={{ borderColor: currentSector.nexusThemeColor }}
              />

              <div
                className="relative w-14 h-14 rounded-2xl border-2 shadow-2xl flex flex-col items-center justify-center"
                style={{
                  backgroundColor: '#061d19',
                  borderColor: currentSector.nexusThemeColor,
                  boxShadow: `0 0 25px ${currentSector.nexusThemeColor}`,
                }}
              >
                <div
                  className="w-6 h-6 rounded-full blur-[1px] animate-pulse flex items-center justify-center"
                  style={{ backgroundColor: currentSector.nexusThemeColor }}
                >
                  <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_#ffffff]" />
                </div>
                <span className="text-[7px] font-mono font-extrabold text-white tracking-tighter uppercase mt-0.5">
                  CORE
                </span>
              </div>
            </div>

            <div className="mt-1 px-2 py-0.5 bg-[#07241c] text-emerald-300 text-[8px] font-mono font-bold uppercase rounded border border-emerald-500/80 shadow">
              {currentSector.nexusName}
            </div>
          </div>

          {/* ============================================================== */}
          {/* TOWER PLOT ZONES (WITH IN-PLACE UPGRADE & ULT CONTROLS) */}
          {/* ============================================================== */}
          {sim.tacticalSlots.map((slot) => {
            const hero = sim.heroes.find((h) => h.slotIndex === slot.slotIndex);
            const isSelected = selectedHero?.slotIndex === slot.slotIndex;
            const leftPct = (slot.tileX / GRID_WIDTH) * 100;
            const topPct = (slot.tileY / GRID_HEIGHT) * 100;
            const widthPct = (1 / GRID_WIDTH) * 100;
            const heightPct = (1 / GRID_HEIGHT) * 100;

            const elementBorder =
              slot.terrainBonus === 'Fire'
                ? 'border-orange-500/70 text-orange-400 shadow-orange-950/60'
                : slot.terrainBonus === 'Water'
                ? 'border-cyan-400/70 text-cyan-400 shadow-cyan-950/60'
                : slot.terrainBonus === 'Earth'
                ? 'border-lime-400/70 text-lime-400 shadow-lime-950/60'
                : 'border-purple-400/70 text-purple-400 shadow-purple-950/60';

            const nextUpgradeCost = hero && hero.level < 10 ? BALANCE_CONFIG.economy.upgradeCosts[hero.level - 1] : 0;
            const canAffordUpgrade = hero && hero.level < 10 && sim.gold >= nextUpgradeCost;
            const ultReady = hero && hero.energy >= 100 && hero.ultimateCooldown <= 0;

            return (
              <div
                key={slot.slotIndex}
                onClick={() => {
                  sound.playClick();
                  if (hero) {
                    onSelectHero(hero);
                  } else {
                    triggerDeploySlot(slot.slotIndex);
                  }
                }}
                onMouseEnter={() => hero && setHoveredHero(hero)}
                onMouseLeave={() => setHoveredHero(null)}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: `${widthPct}%`,
                  height: `${heightPct}%`,
                }}
                className={`absolute cursor-pointer flex items-center justify-center transition-all p-1 z-25 ${
                  isSelected ? 'scale-105 z-35' : 'hover:scale-105'
                }`}
              >
                {/* Outlined Tactical Tower Plot Zone Platform */}
                <div
                  className={`relative w-full h-full rounded-xl flex flex-col items-center justify-center border-2 transition-all ${
                    isSelected
                      ? 'border-amber-400 bg-[#162730] shadow-[0_0_15px_#f59e0b] ring-2 ring-amber-400/50'
                      : hero
                      ? 'border-[#2a5569] bg-[#0c1e26]/90 shadow-lg'
                      : `border-dashed bg-[#091b22]/70 hover:bg-[#112d38] ${elementBorder}`
                  }`}
                >
                  {/* Plot Corner Brackets */}
                  <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b-2 border-r-2 border-cyan-400" />

                  {/* Header Plot Tag */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-[#06141a] border border-[#1e4859] rounded text-[7px] font-mono font-bold text-cyan-300 uppercase whitespace-nowrap shadow z-20">
                    PLOT {slot.slotIndex + 1}
                  </div>

                  {hero ? (
                    /* Hero Champion Positioned On This Tower Plot */
                    <div className="relative flex flex-col items-center justify-center w-full h-full pt-1">
                      {/* Owner Badge (Co-op) */}
                      {sim.playerMode === 'coop' && hero.ownerPlayerId && (
                        <span className={`absolute -top-1 -left-1 px-1 text-[8px] font-mono font-bold rounded z-30 shadow border ${
                          hero.ownerPlayerId === 'P1'
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60'
                            : 'bg-purple-950 text-purple-300 border-purple-500/60'
                        }`}>
                          {hero.ownerPlayerId}
                        </span>
                      )}

                      {/* Level and Star Badge */}
                      <span className="absolute -top-1 -right-1 px-1 text-[8px] font-mono font-bold bg-[#06141a] text-amber-300 border border-amber-500/50 rounded z-30 shadow flex items-center gap-0.5">
                        Lv.{hero.level}{hero.starLevel > 1 ? ` ★${hero.starLevel}` : ''}
                      </span>

                      {/* In-place Quick Upgrade pill if hover/selected and not max */}
                      {(isSelected || hoveredHero?.instanceId === hero.instanceId) && hero.level < 10 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (canAffordUpgrade) {
                              sim.upgradeHero(hero.instanceId);
                            }
                          }}
                          disabled={!canAffordUpgrade}
                          className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-40 px-1.5 py-0.2 rounded text-[7px] font-mono font-bold shadow-md whitespace-nowrap transition-transform hover:scale-110 flex items-center gap-0.5 ${
                            canAffordUpgrade
                              ? 'bg-amber-500 text-slate-950 border border-yellow-200'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          <span>▲ +1 ({nextUpgradeCost}G)</span>
                        </button>
                      )}

                      {/* In-place Ultimate Ready Button */}
                      {ultReady && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.playUltimate();
                            sim.castHeroUltimate(hero);
                          }}
                          className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-40 px-1.5 py-0.2 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 rounded text-[7px] font-mono font-black shadow-[0_0_8px_#f59e0b] border border-white animate-pulse whitespace-nowrap"
                        >
                          ⚡ ULT READY
                        </button>
                      )}

                      {/* Avatar with Ultimate Ring */}
                      <div
                        className={`transition-transform duration-75 relative ${
                          ultReady ? 'ring-2 ring-amber-400 rounded-full shadow-[0_0_12px_#f59e0b]' : ''
                        }`}
                      >
                        <HeroAvatar
                          templateId={hero.templateId}
                          element={hero.element}
                          role={hero.role}
                          isDead={hero.isDead}
                          size={38}
                        />
                      </div>

                      <span className="text-[8px] font-mono font-bold text-white mt-0.5 leading-none drop-shadow">
                        {hero.name}
                      </span>

                      {/* Mini HP & Energy Bars */}
                      <div className="w-4/5 flex flex-col gap-0.5 mt-0.5">
                        <div className="w-full h-1 bg-[#06141a] rounded-full overflow-hidden border border-[#1b3d4d]">
                          <div
                            className="h-full bg-emerald-400"
                            style={{ width: `${Math.max(0, (hero.currentHP / hero.maxHP) * 100)}%` }}
                          />
                        </div>
                        <div className="w-full h-0.5 bg-[#06141a] rounded-full overflow-hidden border border-[#1b3d4d]">
                          <div
                            className="h-full bg-amber-400"
                            style={{ width: `${Math.max(0, hero.energy)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Vacant Grid Platform Prompt */
                    <div className="flex flex-col items-center justify-center gap-0.5 pt-1 text-center">
                      <div className="w-4 h-4 rounded border border-dashed border-current flex items-center justify-center opacity-80">
                        <Plus className="w-3 h-3" />
                      </div>
                      <span className="text-[7px] font-mono font-bold uppercase tracking-tighter opacity-90">
                        TOWER PLOT
                      </span>
                      <span className="text-[6px] font-mono text-cyan-300 font-semibold">
                        +{slot.terrainBonus}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* ============================================================== */}
          {/* EARTH WALLS */}
          {/* ============================================================== */}
          {sim.earthWalls.map((wall) => {
            const leftPct = (wall.tileX / GRID_WIDTH) * 100;
            const topPct = (wall.tileY / GRID_HEIGHT) * 100;
            return (
              <div
                key={wall.id}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: `${(1 / GRID_WIDTH) * 100}%`,
                  height: `${(1 / GRID_HEIGHT) * 100}%`,
                }}
                className="absolute z-20 flex flex-col items-center justify-center p-1 pointer-events-none"
              >
                <div className="w-full h-full bg-[#271b0a]/90 border-2 border-amber-600 rounded-lg shadow-lg flex flex-col items-center justify-center">
                  <span className="text-xs">🛡️</span>
                  <span className="text-[8px] font-mono font-bold text-amber-300">
                    {wall.currentHP}
                  </span>
                </div>
              </div>
            );
          })}

          {/* ============================================================== */}
          {/* PERIODIC ACTIVE ZONES */}
          {/* ============================================================== */}
          {sim.activeZones.map((zone) => {
            const leftPct = ((zone.x - zone.radius) / GRID_WIDTH) * 100;
            const topPct = ((zone.y - zone.radius) / GRID_HEIGHT) * 100;
            const widthPct = ((zone.radius * 2) / GRID_WIDTH) * 100;
            const heightPct = ((zone.radius * 2) / GRID_HEIGHT) * 100;

            return (
              <div
                key={zone.id}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: `${widthPct}%`,
                  height: `${heightPct}%`,
                }}
                className="absolute rounded-full pointer-events-none z-15 border border-dashed animate-spin border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              />
            );
          })}

          {/* ============================================================== */}
          {/* DYNAMIC PARTICLES (HIT SPARKS, EMBERS, CONFETTI) */}
          {/* ============================================================== */}
          {sim.particles.map((p) => {
            const leftPct = (p.x / GRID_WIDTH) * 100;
            const topPct = (p.y / GRID_HEIGHT) * 100;
            const opacity = Math.max(0, p.lifetime / p.maxLifetime);
            return (
              <div
                key={p.id}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                  opacity,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute rounded-full pointer-events-none z-35"
              />
            );
          })}

          {/* ============================================================== */}
          {/* WALKING ENEMIES WITH CONTINUOUS WAYPOINT MOVEMENT */}
          {/* ============================================================== */}
          {sim.enemies.map((enemy) => {
            const leftPct = (enemy.tileX / GRID_WIDTH) * 100;
            const topPct = (enemy.tileY / GRID_HEIGHT) * 100;
            const walkBob = Math.sin((enemy.pathIndex + enemy.instanceId) * 8) * 3;
            const isBoss = enemy.enemyClass === 'Boss' || enemy.enemyClass === 'MapBoss' || enemy.enemyClass === 'MiniBoss';

            return (
              <div
                key={enemy.instanceId}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  transform: `translate(-50%, -50%) translateY(${walkBob}px)`,
                }}
                className="absolute z-30 flex flex-col items-center pointer-events-none transition-transform"
              >
                {/* Mini HP Bar above enemy */}
                <div className={`h-1.5 bg-[#06141a] rounded-full overflow-hidden border border-slate-700 mb-0.5 shadow ${isBoss ? 'w-14' : 'w-9'}`}>
                  <div
                    className={`h-full ${
                      enemy.currentHP / enemy.maxHP > 0.5 ? 'bg-rose-500' : 'bg-red-600'
                    }`}
                    style={{ width: `${Math.max(0, (enemy.currentHP / enemy.maxHP) * 100)}%` }}
                  />
                </div>

                {/* Status Badges Row (Burns, Slow, Root, Earth Mark, Stun) */}
                <div className="flex items-center gap-0.5 text-[8px] font-mono leading-none mb-0.5">
                  {enemy.statuses.burns.length > 0 && (
                    <span className="text-orange-400 font-bold">
                      🔥{enemy.statuses.burns.length}
                    </span>
                  )}
                  {enemy.statuses.slow && <span className="text-cyan-400">❄️</span>}
                  {enemy.statuses.rootDuration !== undefined && (
                    <span className="text-lime-400 font-bold">🌿</span>
                  )}
                  {enemy.statuses.earthMarkDuration !== undefined && (
                    <span className="text-amber-400">⛰️</span>
                  )}
                  {enemy.statuses.stunDuration !== undefined && (
                    <span className="text-yellow-400 animate-spin">💫</span>
                  )}
                </div>

                {/* Enemy Avatar Graphic */}
                <EnemyAvatar
                  templateId={enemy.templateId}
                  element={enemy.element}
                  enemyClass={enemy.enemyClass}
                  size={
                    enemy.enemyClass === 'Boss' || enemy.enemyClass === 'MapBoss'
                      ? 46
                      : enemy.enemyClass === 'MiniBoss'
                      ? 40
                      : enemy.enemyClass === 'Elite'
                      ? 35
                      : 28
                  }
                />

                <span className="text-[7px] font-mono font-bold text-slate-200 mt-0.5 drop-shadow leading-none">
                  {enemy.name.substring(0, 9)}
                </span>
              </div>
            );
          })}

          {/* ============================================================== */}
          {/* FLYING PROJECTILES */}
          {/* ============================================================== */}
          {sim.projectiles.map((p) => {
            const leftPct = (p.x / GRID_WIDTH) * 100;
            const topPct = (p.y / GRID_HEIGHT) * 100;
            return (
              <div
                key={p.id}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: getElementColor(p.element),
                  boxShadow: `0 0 10px ${getElementColor(p.element)}`,
                }}
                className="absolute w-2.5 h-2.5 rounded-full pointer-events-none z-35 animate-ping"
              />
            );
          })}

          {/* ============================================================== */}
          {/* FLOATING DAMAGE NUMBERS */}
          {/* ============================================================== */}
          {sim.floatingNumbers.map((fn) => {
            const leftPct = (fn.x / GRID_WIDTH) * 100;
            const topPct = (fn.y / GRID_HEIGHT) * 100;

            return (
              <div
                key={fn.id}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  color: fn.color,
                  opacity: fn.opacity,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute pointer-events-none z-40 font-mono font-bold text-xs ${
                  fn.isCrit ? 'text-sm font-black scale-110 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]' : 'drop-shadow'
                }`}
              >
                {fn.text}
              </div>
            );
          })}

          {/* ============================================================== */}
          {/* TACTICAL MAP LEGEND (Bottom Left Corner) */}
          {/* ============================================================== */}
          {showLegend && (
            <div className="absolute bottom-2 left-2 bg-[#081820]/95 border-2 border-[#1c3f4e] rounded-xl p-2.5 shadow-2xl z-30 max-w-[210px] backdrop-blur-md">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-cyan-300 border-b border-[#1c3f4e] pb-1 mb-1.5 uppercase tracking-wider">
                <span>LEGEND</span>
                <button
                  onClick={() => setShowLegend(false)}
                  className="text-slate-400 hover:text-white px-1"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[8px] font-mono text-slate-300">
                <div className="flex items-center gap-1">
                  <span className="w-3 border-b-2 border-dashed border-white" />
                  <span>ENEMY PATHS</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 border border-dashed border-cyan-400" />
                  <span>TOWER PLOTS</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_5px_#10b981]" />
                  <span>BIO-NEXUS</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-rose-400 font-bold">▲</span>
                  <span>HAZARDS</span>
                </div>
              </div>
            </div>
          )}

          {/* Live Wave DPS Leaderboard Toggle Button */}
          <button
            onClick={() => setShowDPSMeter((prev) => !prev)}
            className="absolute top-2 right-2 z-30 px-2 py-1 bg-[#091b24]/90 hover:bg-[#112d38] border border-[#1b3d4d] text-cyan-300 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 shadow"
          >
            <BarChart3 className="w-3 h-3 text-cyan-400" />
            <span>DPS METER</span>
            {showDPSMeter ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Floating DPS Leaderboard Drawer */}
          {showDPSMeter && (
            <div className="absolute top-10 right-2 z-30 w-56 bg-[#081820]/95 border-2 border-[#1c3f4e] rounded-xl p-2.5 shadow-2xl backdrop-blur-md font-mono text-[10px]">
              <div className="font-bold text-white uppercase border-b border-[#1c3f4e] pb-1 mb-2 flex items-center justify-between">
                <span>COMBAT DPS METERS</span>
                <span className="text-[9px] text-cyan-400">TOTAL: {Math.round(totalHeroDamage)}</span>
              </div>

              {sim.heroes.length === 0 ? (
                <div className="text-slate-500 text-center py-2">No active heroes deployed</div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {sim.heroes.map((hero) => {
                    const share = totalHeroDamage > 0 ? (hero.damageDealt / totalHeroDamage) * 100 : 0;
                    const col = getElementColor(hero.element);
                    return (
                      <div key={hero.instanceId} className="flex flex-col gap-0.5">
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="font-bold text-slate-200">{hero.name} (Lv.{hero.level})</span>
                          <span className="text-slate-400">{Math.round(hero.damageDealt)} ({share.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#06141a] rounded-full overflow-hidden border border-[#1b3d4d]">
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, share)}%`,
                              backgroundColor: col,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* COMMANDER TACTICAL SUPERPOWERS DOCK */}
        {/* ============================================================== */}
        <div className="mt-3 w-full bg-[#08151c] border-2 border-[#193947] rounded-2xl p-2.5 shadow-xl flex flex-wrap items-center justify-between gap-2.5 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-bold text-white tracking-wider">COMMANDER PROTOCOLS:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Q: Orbital Strike */}
            <button
              onClick={() => {
                if (sim.commanderCooldowns.orbitalStrike <= 0) {
                  sound.playClick();
                  setIsTargetingOrbital(!isTargetingOrbital);
                }
              }}
              disabled={sim.commanderCooldowns.orbitalStrike > 0}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                sim.commanderCooldowns.orbitalStrike > 0
                  ? 'bg-[#0a141a] border-slate-800 text-slate-600 cursor-not-allowed'
                  : isTargetingOrbital
                  ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_15px_#f43f5e] ring-2 ring-rose-400/50 scale-105'
                  : 'bg-[#12232c] border-orange-500/60 hover:border-orange-400 text-orange-300 hover:bg-[#1a3340] shadow'
              }`}
            >
              <span className="px-1 py-0.2 bg-black/40 rounded text-[9px] font-bold text-slate-400">Q</span>
              <Crosshair className="w-3.5 h-3.5 text-orange-400" />
              <span className="font-bold text-[11px]">Orbital Strike</span>
              {sim.commanderCooldowns.orbitalStrike > 0 && (
                <span className="text-[10px] text-slate-400">({sim.commanderCooldowns.orbitalStrike.toFixed(0)}s)</span>
              )}
            </button>

            {/* W: Bio-Nexus Overdrive */}
            <button
              onClick={() => {
                if (sim.commanderCooldowns.bioBarrier <= 0) {
                  sound.playClick();
                  sim.useBioBarrierOverdrive();
                }
              }}
              disabled={sim.commanderCooldowns.bioBarrier > 0}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                sim.commanderCooldowns.bioBarrier > 0
                  ? 'bg-[#0a141a] border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-[#12232c] border-emerald-500/60 hover:border-emerald-400 text-emerald-300 hover:bg-[#1a3340] shadow'
              }`}
            >
              <span className="px-1 py-0.2 bg-black/40 rounded text-[9px] font-bold text-slate-400">W</span>
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-[11px]">Core Overdrive</span>
              {sim.commanderCooldowns.bioBarrier > 0 && (
                <span className="text-[10px] text-slate-400">({sim.commanderCooldowns.bioBarrier.toFixed(0)}s)</span>
              )}
            </button>

            {/* E: Cryo Freeze Wave */}
            <button
              onClick={() => {
                if (sim.commanderCooldowns.cryoFreeze <= 0) {
                  sound.playClick();
                  sim.useCryoFreezeWave();
                }
              }}
              disabled={sim.commanderCooldowns.cryoFreeze > 0}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                sim.commanderCooldowns.cryoFreeze > 0
                  ? 'bg-[#0a141a] border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-[#12232c] border-cyan-500/60 hover:border-cyan-400 text-cyan-300 hover:bg-[#1a3340] shadow'
              }`}
            >
              <span className="px-1 py-0.2 bg-black/40 rounded text-[9px] font-bold text-slate-400">E</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-[11px]">Cryo Blizzard</span>
              {sim.commanderCooldowns.cryoFreeze > 0 && (
                <span className="text-[10px] text-slate-400">({sim.commanderCooldowns.cryoFreeze.toFixed(0)}s)</span>
              )}
            </button>

            {/* R: Gold Drones */}
            <button
              onClick={() => {
                if (sim.commanderCooldowns.droneHarvest <= 0) {
                  sound.playClick();
                  sim.useGoldDroneHarvest();
                }
              }}
              disabled={sim.commanderCooldowns.droneHarvest > 0}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                sim.commanderCooldowns.droneHarvest > 0
                  ? 'bg-[#0a141a] border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-[#12232c] border-yellow-500/60 hover:border-yellow-400 text-yellow-300 hover:bg-[#1a3340] shadow'
              }`}
            >
              <span className="px-1 py-0.2 bg-black/40 rounded text-[9px] font-bold text-slate-400">R</span>
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              <span className="font-bold text-[11px]">Harvest Drones</span>
              {sim.commanderCooldowns.droneHarvest > 0 && (
                <span className="text-[10px] text-slate-400">({sim.commanderCooldowns.droneHarvest.toFixed(0)}s)</span>
              )}
            </button>

            {/* F: Elemental Burst */}
            <button
              onClick={() => {
                if (burstReady) {
                  sound.playClick();
                  onOpenBurst?.();
                }
              }}
              disabled={!burstReady}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                !burstReady
                  ? 'bg-[#0a141a] border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-extrabold border-amber-300 shadow-[0_0_15px_#f59e0b] animate-pulse'
              }`}
            >
              <span className="px-1 py-0.2 bg-black/40 rounded text-[9px] font-bold text-white">F</span>
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-bold text-[11px]">BURST</span>
              {!burstReady && (
                <span className="text-[10px] text-slate-400">({burstCdRemaining.toFixed(0)}s)</span>
              )}
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* BOTTOM MILITARY TERMINAL STATUS DECK */}
        {/* ============================================================== */}
        <div className="mt-3 px-3 py-2 bg-[#09171e] border-2 border-[#1a3845] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            {onExitBattleToLobby && (
              <button
                onClick={() => {
                  sound.playClick();
                  onExitBattleToLobby();
                }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-700 font-sans font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="Keluar dari Pertempuran & Kembali ke Lobby"
              >
                <span>← Lobby</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#06141a] rounded border border-[#1b3d4d]">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-[11px] text-slate-300">
                Spore Toxicity: <strong className="text-rose-400">HIGH</strong>
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-[#06141a] rounded border border-[#1b3d4d]">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] text-slate-300">
                Sector: <strong className="text-cyan-300">{currentSector.name}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#0e2733] px-3 py-1 rounded-lg border border-[#22556b]">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-white tracking-wider">
              {isFourElementAwakening ? '4-ELEMENT AWAKENING: ACTIVE' : 'COMMAND OVERVIEW: NORMAL'}
            </span>
          </div>

          {/* Right Status LED Indicators & Speed Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-1.5 py-1 bg-[#06141a] rounded border border-[#1b3d4d]">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-[0_0_5px_#f43f5e]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 shadow-[0_0_5px_#fbbf24]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_5px_#22d3ee]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 shadow-[0_0_5px_#3b82f6]" />
            </div>

            {/* Quick Speed Selector */}
            <div className="flex items-center bg-[#06141a] p-0.5 rounded border border-[#1b3d4d]">
              <button
                onClick={handleTogglePause}
                className={`p-1 rounded text-xs ${
                  sim.isPaused ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                {sim.isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              </button>
              <button
                onClick={() => handleSpeedChange(1)}
                className={`px-1.5 py-0.5 text-[10px] rounded font-bold ${
                  !sim.isPaused && sim.gameSpeed === 1 ? 'bg-[#1b3d4d] text-cyan-300' : 'text-slate-500'
                }`}
              >
                1X
              </button>
              <button
                onClick={() => handleSpeedChange(2)}
                className={`px-1.5 py-0.5 text-[10px] rounded font-bold ${
                  !sim.isPaused && sim.gameSpeed === 2 ? 'bg-[#1b3d4d] text-cyan-300' : 'text-slate-500'
                }`}
              >
                2X
              </button>
              <button
                onClick={() => handleSpeedChange(3)}
                className={`px-1.5 py-0.5 text-[10px] rounded font-bold ${
                  !sim.isPaused && sim.gameSpeed === 3 ? 'bg-[#1b3d4d] text-cyan-300' : 'text-slate-500'
                }`}
              >
                3X
              </button>
            </div>

            {sim.phase === 'PREPARATION' && (
              <button
                onClick={handleForceStartCombat}
                className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded transition-colors flex items-center gap-1 shadow"
              >
                <span>ENGAGE</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* QUICK DEPLOY CHAMPION BENCH DOCK (Direct Hero Management) */}
      {/* ============================================================== */}
      <div className="bg-[#0a151b] border-2 border-[#1a3845] rounded-2xl p-3.5 shadow-lg flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs border-b border-[#1a3845] pb-2 font-mono">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white tracking-wider">
              DEFENDER SQUAD: {sim.heroes.length}/6 ACTIVE
            </span>
          </div>

          {/* Quick starter team deployment if no heroes */}
          {sim.heroes.length === 0 && onQuickDeployStarterTeam && (
            <button
              onClick={onQuickDeployStarterTeam}
              className="px-3 py-1 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all flex items-center gap-1.5 animate-pulse"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Deploy Starter Squad (Pyra, Terra, Aqua)</span>
            </button>
          )}
        </div>

        {/* Heroes List / Bench */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {sim.heroes.map((hero) => {
            const isSelected = selectedHero?.instanceId === hero.instanceId;
            return (
              <div
                key={hero.instanceId}
                onClick={() => {
                  sound.playClick();
                  onSelectHero(hero);
                }}
                className={`p-2 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-[#162730] border-amber-400 shadow-[0_0_12px_#f59e0b]'
                    : 'bg-[#06141a] border-[#1b3d4d] hover:border-cyan-500'
                }`}
              >
                <HeroAvatar
                  templateId={hero.templateId}
                  element={hero.element}
                  role={hero.role}
                  isDead={hero.isDead}
                  size={36}
                />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white font-mono truncate">
                    {hero.name}
                  </div>
                  <div className="text-[10px] text-cyan-300 font-mono">
                    Lv.{hero.level} · P{hero.slotIndex + 1}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Open Plots Prompts */}
          {Array.from({ length: 6 - sim.heroes.length }).map((_, i) => (
            <div
              key={`empty_${i}`}
              onClick={() => {
                sound.playClick();
                const openSlot = sim.tacticalSlots.find((s) => !s.occupiedHeroInstanceId);
                if (openSlot) {
                  triggerDeploySlot(openSlot.slotIndex);
                }
              }}
              className="p-2 rounded-xl border border-dashed border-[#1b3d4d] hover:border-cyan-400 bg-[#06141a]/60 hover:bg-[#0c222c] cursor-pointer transition-colors flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-cyan-300 font-mono"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ DEPLOY</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
