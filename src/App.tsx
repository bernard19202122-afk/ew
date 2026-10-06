/**
 * Elemental Wildguard - Main Application Root
 * Mandated by Master PRD v1.0 — Lobby State Fix & Full 3D Animated Visual Overhaul
 *
 * Enforces:
 * - GOLDEN RULE (Section 3): Gameplay only runs in BATTLE state after countdown
 * - Game State Lifecycle (Section 4): BOOT -> MAIN_LOBBY -> STAGE_SELECT -> PRE_BATTLE -> BATTLE -> RESULT -> MAIN_LOBBY
 * - Non-Battle states freeze battle simulation completely (Section 5, 6, 7)
 * - 3D Living World Lobby, 3D World Map Stage Select, Pre-Battle staging, and Countdown 3-2-1-GO
 * - Complete battle cleanup upon exit or return to lobby (Section 13, 14)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameSimulation, createNewGameSession } from './game/engine/gameSimulation';
import { HeroInstance, PlayerRole, TargetPriority } from './game/types/gameTypes';
import { TopBar, ActiveTab } from './components/TopBar';
import { Battlefield } from './components/Battlefield';
import { HeroDetailPanel } from './components/HeroDetailPanel';
import { HeroDeployModal } from './components/HeroDeployModal';
import { RosterView } from './components/RosterView';
import { BalanceConfigView } from './components/BalanceConfigView';
import { TestSuiteView } from './components/TestSuiteView';
import { CodexView } from './components/CodexView';
import { LevelResultModal } from './components/LevelResultModal';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { MainLobby } from './components/MainLobby';
import { BaseUpgradeModal } from './components/BaseUpgradeModal';
import { MissionsModal } from './components/MissionsModal';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { WorldMap3D } from './components/3d/WorldMap3D';
import { PreBattleView } from './components/3d/PreBattleView';
import { CountdownOverlay } from './components/CountdownOverlay';
import { multiplayer } from './game/multiplayer/multiplayerTransport';
import { progression } from './game/engine/progressionManager';
import { sound } from './game/audio/soundSynthesizer';
import { BALANCE_CONFIG } from './game/config/balanceConfig';
import { Save, Download, Upload, ListFilter, Users, ArrowLeft, X, ArrowUpRight } from 'lucide-react';

export type GameState =
  | 'BOOT'
  | 'MAIN_LOBBY'
  | 'STAGE_SELECT'
  | 'PRE_BATTLE'
  | 'BATTLE'
  | 'RESULT';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MAIN_LOBBY');
  const [activeTab, setActiveTab] = useState<ActiveTab>('lobby');
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);
  const [countdownActive, setCountdownActive] = useState<boolean>(false);

  const [playerMode, setPlayerMode] = useState<'single' | 'coop'>('single');
  const [myRole, setMyRole] = useState<PlayerRole>('P1');
  const [isCoopMatchActive, setIsCoopMatchActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedHero, setSelectedHero] = useState<HeroInstance | null>(null);
  const [deploySlotIndex, setDeploySlotIndex] = useState<number | null>(null);

  // Modals state (Non-battle sub-screens)
  const [isBaseUpgradeOpen, setIsBaseUpgradeOpen] = useState<boolean>(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Simulation instance stored in ref to maintain deterministic 60Hz ticks
  const simRef = useRef<GameSimulation>(new GameSimulation(42n));
  const [, setRenderTrigger] = useState(0);

  const sim = simRef.current;

  // Co-op Real-time Bidirectional Networking Listener
  useEffect(() => {
    const unsub = multiplayer.subscribeActions((msg) => {
      if (msg.type === 'DEPLOY_HERO') {
        const payload = msg.payload || {};
        sim.deployHero(payload.templateId, payload.slotIndex, payload.owner);
      } else if (msg.type === 'UPGRADE_HERO') {
        const payload = msg.payload || {};
        sim.upgradeHero(payload.instanceId, payload.owner);
      } else if (msg.type === 'MERGE_HEROES') {
        const payload = msg.payload || {};
        sim.mergeHeroes(payload.targetInstanceId, payload.sourceInstanceId, payload.owner);
      } else if (msg.type === 'SELL_HERO') {
        const payload = msg.payload || {};
        sim.sellHero(payload.instanceId, payload.owner);
        setSelectedHero(null);
      } else if (msg.type === 'START_WAVE') {
        sim.startCombatPhase();
      } else if (msg.type === 'CALL_EARLY_WAVE') {
        sim.callWaveEarly();
      } else if (msg.type === 'RESET_SESSION') {
        const targetLvl = msg.payload?.levelId || sim.currentLevel;
        sim.createNewGameSession(targetLvl, 'coop', myRole);
        setSelectedHero(null);
      } else if (msg.type === 'SYNC_SNAPSHOT') {
        if (myRole === 'P2' && msg.payload) {
          sim.loadSnapshot(msg.payload);
        }
      } else if (msg.type === 'LEAVE_ROOM') {
        sim.addLog(`Ally left the co-op session.`, 'system');
      }
    });

    return () => {
      unsub();
    };
  }, [sim, myRole]);

  // Host (P1) periodic state synchronization to Guest (P2)
  useEffect(() => {
    if (playerMode === 'coop' && isCoopMatchActive && myRole === 'P1') {
      const interval = setInterval(() => {
        if (sim.phase === 'COMBAT') {
          multiplayer.sendAction('SYNC_SNAPSHOT', sim.createSnapshot());
        }
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [playerMode, isCoopMatchActive, myRole, sim]);

  // Main 60Hz simulation game loop
  // GOLDEN RULE (PRD Section 3): Gameplay ONLY runs in BATTLE state after countdown!
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // STRICT GOLDEN RULE: If not in BATTLE or countdown active, simulation is OFF!
      if (gameState === 'BATTLE' && !countdownActive && sim.isBattleActive && !sim.isPaused) {
        const ticksToStep = sim.gameSpeed;
        sim.step(ticksToStep);
        setRenderTrigger((prev) => (prev + 1) % 10000);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [sim, gameState, countdownActive]);

  // Battle Result Detection
  useEffect(() => {
    if (gameState === 'BATTLE' && (sim.phase === 'LEVEL_VICTORY' || sim.phase === 'LEVEL_DEFEAT')) {
      sim.stopBattleSession();
      setGameState('RESULT');
    }
  }, [gameState, sim.phase, sim]);

  // Return to Lobby handler (PRD Section 13: Return to Lobby & Battle Cleanup)
  const handleReturnToLobby = () => {
    sound.playClick();
    sim.stopBattleSession();
    setSelectedHero(null);
    setCountdownActive(false);
    setGameState('MAIN_LOBBY');
    setActiveTab('lobby');
  };

  // Pre-Battle Launch (PRD Section 10 & 11)
  const handleStartBattleFromPreBattle = (chosenSquad: string[]) => {
    sim.createNewGameSession(selectedLevelId, playerMode, myRole);

    // Deploy chosen squad into the initial tactical slots
    chosenSquad.forEach((heroId, idx) => {
      if (idx < sim.tacticalSlots.length) {
        sim.deployHero(heroId, sim.tacticalSlots[idx].slotIndex, myRole);
      }
    });

    setGameState('BATTLE');
    setActiveTab('battlefield');
    setSelectedHero(null);
    setCountdownActive(true);
    // Simulation remains frozen during countdown (PRD Section 12)
  };

  // Countdown complete -> Activate Battle Simulation (PRD Section 12)
  const handleCountdownComplete = useCallback(() => {
    setCountdownActive(false);
    sim.startBattleSession();
    sim.startCombatPhase();
    setRenderTrigger((prev) => (prev + 1) % 10000);
  }, [sim]);

  // Reset Run Handler
  const handleRestartRun = () => {
    sound.playClick();
    sim.stopBattleSession();
    setGameState('PRE_BATTLE');
    setActiveTab('pre_battle');
    setSelectedHero(null);
  };

  // Toggle Mute Audio
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
    progression.updateSettings({ isMuted: nextMuted });
  };

  // Deploy Hero
  const handleDeployHero = (templateId: string, slotIndex: number) => {
    const success = sim.deployHero(templateId, slotIndex, myRole);
    if (success && playerMode === 'coop') {
      multiplayer.sendAction('DEPLOY_HERO', { templateId, slotIndex, owner: myRole });
    }
    setDeploySlotIndex(null);
  };

  // Upgrade Hero
  const handleUpgradeHero = (instanceId: string) => {
    const success = sim.upgradeHero(instanceId, myRole);
    if (success && playerMode === 'coop') {
      multiplayer.sendAction('UPGRADE_HERO', { instanceId, owner: myRole });
    }
  };

  // Merge Heroes
  const handleMergeHeroes = (targetInstanceId: string, sourceInstanceId: string) => {
    const success = sim.mergeHeroes(targetInstanceId, sourceInstanceId, myRole);
    if (success && playerMode === 'coop') {
      multiplayer.sendAction('MERGE_HEROES', { targetInstanceId, sourceInstanceId, owner: myRole });
    }
  };

  // Sell Hero
  const handleSellHero = (instanceId: string) => {
    const success = sim.sellHero(instanceId, myRole);
    if (success) {
      if (playerMode === 'coop') {
        multiplayer.sendAction('SELL_HERO', { instanceId, owner: myRole });
      }
      setSelectedHero(null);
    }
  };

  // Start Wave
  const handleStartWave = () => {
    sim.startCombatPhase();
    if (playerMode === 'coop') {
      multiplayer.sendAction('START_WAVE');
    }
  };

  // Call Early Wave
  const handleCallEarlyWave = () => {
    sim.callWaveEarly();
    if (playerMode === 'coop') {
      multiplayer.sendAction('CALL_EARLY_WAVE');
    }
  };

  // Navigate to 3D World Map
  const handleOpenPlayFlow = () => {
    sound.playClick();
    sim.stopBattleSession();
    setGameState('STAGE_SELECT');
    setActiveTab('stages');
  };

  return (
    <div className="min-h-screen bg-[#101614] text-[#F3F4EF] flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* 3-Zone Top Navigation Bar */}
      <TopBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          sound.playClick();
          if (tab === 'base') {
            if (gameState === 'BATTLE') sim.stopBattleSession();
            setIsBaseUpgradeOpen(true);
            setActiveTab('base');
          } else if (tab === 'missions') {
            if (gameState === 'BATTLE') sim.stopBattleSession();
            setIsMissionsOpen(true);
            setActiveTab('missions');
          } else if (tab === 'profile') {
            if (gameState === 'BATTLE') sim.stopBattleSession();
            setIsProfileOpen(true);
            setActiveTab('profile');
          } else if (tab === 'lobby') {
            handleReturnToLobby();
          } else if (tab === 'stages') {
            if (gameState === 'BATTLE') sim.stopBattleSession();
            setGameState('STAGE_SELECT');
            setActiveTab('stages');
          } else if (tab === 'battlefield') {
            if (gameState !== 'BATTLE') {
              // Redirect to pre-battle flow if no active battle exists
              setGameState('PRE_BATTLE');
              setActiveTab('pre_battle');
            } else {
              setActiveTab('battlefield');
            }
          } else {
            if (gameState === 'BATTLE') sim.stopBattleSession();
            setActiveTab(tab);
          }
        }}
        onRestartRun={handleRestartRun}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        currentLevel={selectedLevelId}
        totalStars={progression.getTotalStars()}
        playerMode={playerMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* 1. STATE: MAIN LOBBY (PRD Sections 19-23) */}
        {activeTab === 'lobby' && (
          <MainLobby
            progress={progression.getProgress()}
            onOpenPlayFlow={handleOpenPlayFlow}
            onOpenHeroes={() => setActiveTab('roster')}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenBase={() => setIsBaseUpgradeOpen(true)}
            onOpenMissions={() => setIsMissionsOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenMultiplayer={() => setActiveTab('coop')}
            onOpenTests={() => setActiveTab('tests')}
            onOpenCodex={() => setActiveTab('codex')}
          />
        )}

        {/* 2. STATE: 3D WORLD MAP & STAGE SELECT (PRD Sections 24-27) */}
        {activeTab === 'stages' && (
          <WorldMap3D
            unlockedLevels={progression.getProgress().unlockedLevels}
            levelStars={progression.getProgress().levelStars}
            selectedLevel={selectedLevelId}
            onSelectLevel={(lvlId) => setSelectedLevelId(lvlId)}
            onProceedToPreBattle={(lvlId) => {
              setSelectedLevelId(lvlId);
              setGameState('PRE_BATTLE');
              setActiveTab('pre_battle');
            }}
            onBackToLobby={handleReturnToLobby}
          />
        )}

        {/* 3. STATE: PRE-BATTLE STAGING (PRD Sections 9, 10, 28) */}
        {activeTab === 'pre_battle' && (
          <PreBattleView
            selectedLevel={selectedLevelId}
            playerMode={playerMode}
            onStartBattle={handleStartBattleFromPreBattle}
            onBackToStageSelect={() => {
              setGameState('STAGE_SELECT');
              setActiveTab('stages');
            }}
          />
        )}

        {/* 4. STATE: 2-PLAYER CO-OP LOBBY */}
        {activeTab === 'coop' && (
          <MultiplayerLobby
            currentRole={myRole}
            onStartCoopGame={(levelId, role) => {
              setPlayerMode('coop');
              setMyRole(role);
              setIsCoopMatchActive(true);
              setSelectedLevelId(levelId || 1);
              setGameState('PRE_BATTLE');
              setActiveTab('pre_battle');
            }}
            onLeaveLobby={handleReturnToLobby}
          />
        )}

        {/* 5. STATE: BATTLEFIELD & ACTIVE COMBAT (PRD Sections 29-35) */}
        {activeTab === 'battlefield' && (
          <div className="flex flex-col gap-4 relative">
            {/* 3D Animated Countdown (PRD Section 12) */}
            {countdownActive && <CountdownOverlay onComplete={handleCountdownComplete} />}

            <Battlefield
              sim={sim}
              selectedHero={selectedHero}
              onSelectHero={setSelectedHero}
              onDeploySlot={setDeploySlotIndex}
              onStartWave={handleStartWave}
              onCallEarlyWave={handleCallEarlyWave}
              playerMode={playerMode}
              myPlayerRole={myRole}
              onExitBattleToLobby={handleReturnToLobby}
              onOpenStageSelect={() => {
                sim.stopBattleSession();
                setGameState('STAGE_SELECT');
                setActiveTab('stages');
              }}
              onSelectLevel={(levelNum) => {
                setSelectedLevelId(levelNum);
                sim.stopBattleSession();
                setGameState('PRE_BATTLE');
                setActiveTab('pre_battle');
              }}
            />

            {/* Sub-Panel: Hero Management & Live Combat Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8">
                {selectedHero ? (
                  <HeroDetailPanel
                    hero={selectedHero}
                    gold={sim.getPlayerGold(myRole)}
                    phase={sim.phase}
                    allHeroes={sim.heroes}
                    onUpgrade={handleUpgradeHero}
                    onSell={handleSellHero}
                    onMerge={handleMergeHeroes}
                    onCastSkill={(h) => sim.castHeroSkill(h)}
                    onCastUltimate={(h) => sim.castHeroUltimate(h)}
                    onClose={() => setSelectedHero(null)}
                    playerMode={playerMode}
                    myPlayerRole={myRole}
                  />
                ) : (
                  <div className="bg-[#18211E] border border-dashed border-[#24332D] rounded-2xl p-6 text-center text-slate-400 flex flex-col items-center justify-center gap-2 min-h-[140px]">
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 font-bold">
                      👆
                    </div>
                    <span className="text-xs font-semibold">
                      Klik hero atau plot di medan perang untuk inspeksi detail, atur target prioritas, upgrade level, atau fusi merge.
                    </span>
                  </div>
                )}
              </div>

              {/* Combat Log */}
              <div className="lg:col-span-4 bg-[#18211E] border border-[#24332D] rounded-2xl p-4 flex flex-col justify-between max-h-[300px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Log Taktis Pertempuran
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    60Hz Live
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {sim.combatLogs.length === 0 ? (
                    <div className="text-xs text-slate-500 italic text-center py-6">
                      Menunggu musuh memasuki jangkauan...
                    </div>
                  ) : (
                    sim.combatLogs.map((log) => {
                      const badgeColor =
                        log.type === 'synergy'
                          ? 'text-amber-400'
                          : log.type === 'burst'
                          ? 'text-yellow-300 font-bold'
                          : log.type === 'boss'
                          ? 'text-rose-400 font-semibold'
                          : log.type === 'kill'
                          ? 'text-emerald-400'
                          : log.type === 'leak'
                          ? 'text-red-500 font-bold'
                          : 'text-slate-400';

                      return (
                        <div
                          key={log.id}
                          className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 flex flex-col gap-0.5"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                            <span>Wave {log.wave}</span>
                            <span>Tick {log.tick}</span>
                          </div>
                          <p className={`text-[11px] leading-tight ${badgeColor}`}>
                            {log.message}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. SUB-SCREENS: 20 Heroes */}
        {activeTab === 'roster' && <RosterView />}

        {/* 7. SUB-SCREENS: Balance Config */}
        {activeTab === 'balance' && <BalanceConfigView />}

        {/* 8. SUB-SCREENS: PRD Test Suite */}
        {activeTab === 'tests' && <TestSuiteView />}

        {/* 9. SUB-SCREENS: Codex */}
        {activeTab === 'codex' && <CodexView />}

        {/* 10. SUB-SCREENS: Base Upgrade */}
        {activeTab === 'base' && (
          <BaseUpgradeModal
            onClose={() => {
              setActiveTab('lobby');
              setIsBaseUpgradeOpen(false);
            }}
            onRefresh={() => setRenderTrigger((prev) => (prev + 1) % 10000)}
          />
        )}

        {/* 11. SUB-SCREENS: Missions */}
        {activeTab === 'missions' && (
          <MissionsModal
            onClose={() => {
              setActiveTab('lobby');
              setIsMissionsOpen(false);
            }}
            onRefresh={() => setRenderTrigger((prev) => (prev + 1) % 10000)}
          />
        )}

        {/* 12. SUB-SCREENS: Profile */}
        {activeTab === 'profile' && (
          <ProfileModal
            onClose={() => {
              setActiveTab('lobby');
              setIsProfileOpen(false);
            }}
          />
        )}
      </main>

      {/* Level Victory & Defeat Modal (PRD Section 13, 14) */}
      {(sim.phase === 'LEVEL_VICTORY' || sim.phase === 'LEVEL_DEFEAT') && (
        <LevelResultModal
          phase={sim.phase}
          currentLevel={sim.currentLevel}
          currentWaveInLevel={sim.currentWaveInLevel}
          levelWavesCount={sim.levelWavesCount}
          baseHP={sim.baseHP}
          totalDamageDealt={sim.totalDamageDealt}
          totalEnemiesDefeated={sim.totalEnemiesDefeated}
          victoryDetails={sim.levelVictoryDetails}
          onRetry={() => {
            sim.stopBattleSession();
            setGameState('PRE_BATTLE');
            setActiveTab('pre_battle');
          }}
          onNextLevel={() => {
            const nextLvl = Math.min(10, sim.currentLevel + 1);
            setSelectedLevelId(nextLvl);
            sim.stopBattleSession();
            setGameState('PRE_BATTLE');
            setActiveTab('pre_battle');
          }}
          onOpenStageSelect={() => {
            sim.stopBattleSession();
            setGameState('STAGE_SELECT');
            setActiveTab('stages');
          }}
          onReturnToLobby={handleReturnToLobby}
        />
      )}

      {/* Base Upgrade Modal */}
      {isBaseUpgradeOpen && activeTab !== 'base' && (
        <BaseUpgradeModal
          onClose={() => setIsBaseUpgradeOpen(false)}
          onRefresh={() => setRenderTrigger((prev) => (prev + 1) % 10000)}
        />
      )}

      {/* Missions & Quests Modal */}
      {isMissionsOpen && activeTab !== 'missions' && (
        <MissionsModal
          onClose={() => setIsMissionsOpen(false)}
          onRefresh={() => setRenderTrigger((prev) => (prev + 1) % 10000)}
        />
      )}

      {/* Commander Profile Modal */}
      {isProfileOpen && activeTab !== 'profile' && (
        <ProfileModal onClose={() => setIsProfileOpen(false)} />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          onRefresh={() => setRenderTrigger((prev) => (prev + 1) % 10000)}
        />
      )}

      {/* Hero Deployment Modal */}
      {deploySlotIndex !== null && (
        <HeroDeployModal
          slotIndex={deploySlotIndex}
          deployedHeroIds={sim.heroes.map((h) => h.templateId)}
          gold={sim.gold}
          onDeploy={handleDeployHero}
          onClose={() => setDeploySlotIndex(null)}
        />
      )}
    </div>
  );
}
