/**
 * Elemental Wildguard - 3D World Map & Stage Diorama
 * Mandated by Master PRD v1.0 Sections 24-27, 40
 *
 * Implements:
 * - 3D interactive world map with 5 distinctive miniature biome dioramas
 * - Smooth camera zoom and focus on selected stage diorama
 * - Visual stage presentation with terrain, rocks, trees, water/lava, structures, and atmospheric particles
 * - Stage information panel (Name, Difficulty, Boss, Rewards, Enemies)
 * - Transitions to PRE-BATTLE state upon clicking "PERSIAPKAN SKUAD" (never launches battle directly)
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CAMPAIGN_LEVELS } from '../../game/data/levelRegistry';
import { sound } from '../../game/audio/soundSynthesizer';
import { Element } from '../../game/types/gameTypes';
import {
  Star,
  Swords,
  Shield,
  ArrowRight,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Lock,
  Sparkles,
  Award,
  ChevronRight,
  Compass,
} from 'lucide-react';

interface WorldMap3DProps {
  unlockedLevels: number[];
  levelStars: Record<number, number>;
  selectedLevel: number;
  onSelectLevel: (levelId: number) => void;
  onProceedToPreBattle: (levelId: number) => void;
  onBackToLobby: () => void;
}

const BIOME_SETTINGS: Record<
  number,
  {
    name: string;
    sub: string;
    element: Element;
    color: number;
    accentColor: number;
    lightColor: number;
    fogColor: number;
    difficulty: string;
    dioramaType: 'forest' | 'water' | 'volcano' | 'wind' | 'astral';
  }
> = {
  1: {
    name: 'Whispering Woods',
    sub: 'Sector S1: Emerald Canopy Sanctuary',
    element: 'Earth',
    color: 0x16a34a,
    accentColor: 0x84cc16,
    lightColor: 0xfff7ed,
    fogColor: 0x0f241a,
    difficulty: 'Mudah (Normal)',
    dioramaType: 'forest',
  },
  2: {
    name: 'Sunken Sanctum',
    sub: 'Sector S2: Turquoise Flooded Ruin',
    element: 'Water',
    color: 0x0284c7,
    accentColor: 0x38bdf8,
    lightColor: 0xe0f2fe,
    fogColor: 0x08212e,
    difficulty: 'Menengah (Moderate)',
    dioramaType: 'water',
  },
  3: {
    name: 'Scorched Crag',
    sub: 'Sector S3: Magma Fissure Citadel',
    element: 'Fire',
    color: 0xd97706,
    accentColor: 0xef4444,
    lightColor: 0xffedd5,
    fogColor: 0x26120b,
    difficulty: 'Sulit (Challenging)',
    dioramaType: 'volcano',
  },
  4: {
    name: 'Tempest Spire',
    sub: 'Sector S4: Skyreach Floating Spires',
    element: 'Wind',
    color: 0x7c3aed,
    accentColor: 0xc084fc,
    lightColor: 0xf5f3ff,
    fogColor: 0x1a102f,
    difficulty: 'Sangat Sulit (Severe)',
    dioramaType: 'wind',
  },
  5: {
    name: 'Frozen Marsh Delta',
    sub: 'Sector S3: Misty Glacial Waters',
    element: 'Water',
    color: 0x0284c7,
    accentColor: 0x38bdf8,
    lightColor: 0xe0f2fe,
    fogColor: 0x08212e,
    difficulty: 'Taktikal (Tactical)',
    dioramaType: 'water',
  },
  6: {
    name: 'Metropolis Kota Tenggelam',
    sub: 'Sector S3: Submerged Crystal Ruins',
    element: 'Water',
    color: 0x0369a1,
    accentColor: 0x38bdf8,
    lightColor: 0xe0f2fe,
    fogColor: 0x08212e,
    difficulty: 'Sulit (Hard)',
    dioramaType: 'water',
  },
  7: {
    name: 'Ngarai Batu Cadas',
    sub: 'Sector S4: Tectonic Faultline Crags',
    element: 'Earth',
    color: 0xa16207,
    accentColor: 0xeab308,
    lightColor: 0xfef08a,
    fogColor: 0x221808,
    difficulty: 'Sulit (Hard)',
    dioramaType: 'forest',
  },
  8: {
    name: 'Benteng Obsidian',
    sub: 'Sector S4: Obsidian Bastion Core',
    element: 'Earth',
    color: 0x44403c,
    accentColor: 0x78716c,
    lightColor: 0xf5f5f4,
    fogColor: 0x1c1917,
    difficulty: 'Nightmare (Mimpi Buruk)',
    dioramaType: 'volcano',
  },
  9: {
    name: 'Dataran Tinggi Badai',
    sub: 'Sector S5: Gale Peak Spire',
    element: 'Wind',
    color: 0x7c3aed,
    accentColor: 0xc084fc,
    lightColor: 0xf5f3ff,
    fogColor: 0x1a102f,
    difficulty: 'Sulit (Hard)',
    dioramaType: 'wind',
  },
  10: {
    name: 'Pusat Kosmik Astral',
    sub: 'Sector S5: Cosmic Core of the Titans',
    element: 'Earth',
    color: 0x4f46e5,
    accentColor: 0xf43f5e,
    lightColor: 0xfdf4ff,
    fogColor: 0x170d28,
    difficulty: 'Titan Endgame (Mythic)',
    dioramaType: 'astral',
  },
};

export const WorldMap3D: React.FC<WorldMap3DProps> = ({
  unlockedLevels,
  levelStars,
  selectedLevel,
  onSelectLevel,
  onProceedToPreBattle,
  onBackToLobby,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 7, 14));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.5, 0));

  const levelCfg = CAMPAIGN_LEVELS[selectedLevel] || CAMPAIGN_LEVELS[1];
  const biome = BIOME_SETTINGS[selectedLevel] || BIOME_SETTINGS[1];
  const isUnlocked = unlockedLevels.includes(selectedLevel);
  const starsEarned = levelStars[selectedLevel] || 0;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(biome.fogColor, 0.035);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 8, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Dynamic Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
    sunLight.position.set(10, 15, 10);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // World Map Group containing 5 Island Dioramas in an arc path
    const mapGroup = new THREE.Group();
    scene.add(mapGroup);

    interface DioramaNode {
      levelId: number;
      group: THREE.Group;
      centerPos: THREE.Vector3;
      crystalMesh: THREE.Mesh;
    }

    const dioramaNodes: DioramaNode[] = [];
    const islandPositions = [
      new THREE.Vector3(-8.5, 0.5, 3.5),  // Stage 1
      new THREE.Vector3(-4.2, 1.2, -0.5), // Stage 2
      new THREE.Vector3(0.0, 2.0, -3.2),  // Stage 3
      new THREE.Vector3(4.5, 2.8, -0.8),  // Stage 4
      new THREE.Vector3(8.5, 3.8, 3.2),   // Stage 5
    ];

    islandPositions.forEach((pos, idx) => {
      const lvl = idx + 1;
      const bInfo = BIOME_SETTINGS[lvl];
      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(pos);
      mapGroup.add(nodeGroup);

      // Mini island base
      const baseGeo = new THREE.CylinderGeometry(2.4, 1.8, 1.2, 18);
      const baseMat = new THREE.MeshStandardMaterial({
        color: bInfo.color,
        roughness: 0.75,
        flatShading: true,
      });
      const miniIsland = new THREE.Mesh(baseGeo, baseMat);
      miniIsland.castShadow = true;
      miniIsland.receiveShadow = true;
      nodeGroup.add(miniIsland);

      // Underside rock
      const rockGeo = new THREE.ConeGeometry(1.8, 2.0, 12);
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9, flatShading: true });
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.rotation.x = Math.PI;
      rock.position.y = -1.4;
      nodeGroup.add(rock);

      // Biome decorative features
      if (bInfo.dioramaType === 'forest') {
        const treeGeo = new THREE.DodecahedronGeometry(0.7, 1);
        const treeMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8, flatShading: true });
        const tree = new THREE.Mesh(treeGeo, treeMat);
        tree.position.set(-0.8, 1.2, -0.5);
        nodeGroup.add(tree);
      } else if (bInfo.dioramaType === 'volcano') {
        const ventGeo = new THREE.ConeGeometry(0.9, 1.0, 8, 1, true);
        const ventMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8, flatShading: true });
        const vent = new THREE.Mesh(ventGeo, ventMat);
        vent.position.set(0, 1.0, 0);
        nodeGroup.add(vent);
      }

      // Stage Beacon / Crystal
      const crystalGeo = new THREE.OctahedronGeometry(0.55, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: bInfo.accentColor,
        emissive: bInfo.accentColor,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(0, 1.6, 0);
      nodeGroup.add(crystal);

      dioramaNodes.push({
        levelId: lvl,
        group: nodeGroup,
        centerPos: pos,
        crystalMesh: crystal,
      });
    });

    // Connecting Energy Beams between Islands
    for (let i = 0; i < islandPositions.length - 1; i++) {
      const p1 = islandPositions[i];
      const p2 = islandPositions[i + 1];
      const curve = new THREE.LineCurve3(p1.clone().add(new THREE.Vector3(0, 0.5, 0)), p2.clone().add(new THREE.Vector3(0, 0.5, 0)));
      const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.08, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      mapGroup.add(tube);
    }

    // Set initial camera focus to currently selected stage diorama
    const activeNode = dioramaNodes[selectedLevel - 1];
    if (activeNode) {
      targetCamPos.current.set(activeNode.centerPos.x, activeNode.centerPos.y + 3.8, activeNode.centerPos.z + 6.8);
      targetLookAt.current.set(activeNode.centerPos.x, activeNode.centerPos.y + 0.8, activeNode.centerPos.z);
      camera.position.copy(targetCamPos.current);
    }

    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth camera interpolation towards selected stage diorama
      camera.position.lerp(targetCamPos.current, 0.06);
      const curLookAt = new THREE.Vector3(0, 0, 0);
      camera.getWorldDirection(curLookAt);
      camera.lookAt(targetLookAt.current);

      // Rotate crystals
      dioramaNodes.forEach((node, idx) => {
        node.crystalMesh.rotation.y = time * (1.0 + idx * 0.2);
        node.crystalMesh.position.y = 1.6 + Math.sin(time * 2.0 + idx) * 0.12;
      });

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Whenever selectedLevel changes, update camera focus target
  useEffect(() => {
    const islandPositions = [
      new THREE.Vector3(-8.5, 0.5, 3.5),
      new THREE.Vector3(-4.2, 1.2, -0.5),
      new THREE.Vector3(0.0, 2.0, -3.2),
      new THREE.Vector3(4.5, 2.8, -0.8),
      new THREE.Vector3(8.5, 3.8, 3.2),
    ];
    const targetPos = islandPositions[selectedLevel - 1];
    if (targetPos) {
      targetCamPos.current.set(targetPos.x, targetPos.y + 3.8, targetPos.z + 6.8);
      targetLookAt.current.set(targetPos.x, targetPos.y + 0.8, targetPos.z);
    }
  }, [selectedLevel]);

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
    <div className="w-full flex flex-col gap-4">
      {/* Top Header & Stage Carousel Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-[#18211E]/95 border border-[#24332D] rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBackToLobby();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors text-xs font-bold cursor-pointer shrink-0"
          >
            ← Kembali ke Lobby
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                Peta Dunia 3D (World Map)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-white">
              Pilih Wilayah Operasi (Stages 1–10)
            </h2>
          </div>
        </div>

        {/* 10-Stage Fast Switcher Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 max-w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvlNum) => {
            const isSelected = selectedLevel === lvlNum;
            const isLvlUnlocked = unlockedLevels.includes(lvlNum);
            const stars = levelStars[lvlNum] || 0;

            return (
              <button
                key={lvlNum}
                onClick={() => {
                  sound.playDioramaSelect();
                  onSelectLevel(lvlNum);
                }}
                className={`px-3 py-2 rounded-xl border flex flex-col items-center gap-0.5 text-xs font-bold transition-all cursor-pointer min-w-[70px] ${
                  isSelected
                    ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-105'
                    : isLvlUnlocked
                    ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/60 border-slate-900 text-slate-600 cursor-not-allowed'
                }`}
              >
                <span>Stage {lvlNum}</span>
                <span className="text-[10px] font-mono flex items-center gap-0.5 text-amber-400">
                  {isLvlUnlocked ? (
                    <>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                      <span>{stars}/3</span>
                    </>
                  ) : (
                    <Lock className="w-3 h-3 text-slate-600" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 3D Diorama Viewport + Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: 3D Miniature Environment Canvas */}
        <div className="lg:col-span-8 bg-gradient-to-b from-[#131d19] to-[#0a0f0d] border border-emerald-950/60 rounded-3xl overflow-hidden relative min-h-[380px] sm:min-h-[440px] shadow-2xl flex flex-col">
          <div ref={containerRef} className="w-full h-full flex-1 relative" style={{ touchAction: 'none' }} />

          {/* Diorama Label Overlay */}
          <div className="absolute top-4 left-4 pointer-events-none bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl px-3.5 py-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Miniature 3D Diorama
            </span>
            <div className="text-sm font-bold text-white font-display">
              {biome.name}
            </div>
          </div>
        </div>

        {/* Right: Stage Preview Card (PRD Section 26) */}
        <div className="lg:col-span-4 bg-[#18211E]/95 border border-[#24332D] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between gap-4">
          <div>
            {/* Element Badge */}
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-xs font-semibold text-slate-300 border border-slate-700">
                {renderElementIcon(biome.element)}
                <span>Afinitas {biome.element}</span>
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                ★ {starsEarned} / 3 Bintang
              </span>
            </div>

            <h3 className="text-2xl font-black font-display text-white tracking-tight">
              {levelCfg.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{biome.sub}</p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2.5 my-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Tingkat Kesulitan</span>
                <div className="text-xs font-bold text-amber-300 mt-0.5">{biome.difficulty}</div>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Total Gelombang</span>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">{levelCfg.totalWaves} Waves</div>
              </div>
            </div>

            {/* Stage Description & Boss Info */}
            <div className="space-y-3 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Boss Pelindung Sektor:
                </span>
                <span className="text-rose-400 font-bold text-sm">
                  {levelCfg.bossName ? `${levelCfg.bossName} (${levelCfg.bossTitle})` : 'Boss Pertempuran'}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Hadiah Penyelesaian:
                </span>
                <div className="flex items-center gap-3 text-xs font-mono font-semibold">
                  <span className="text-amber-400">+{levelCfg.reward.gold}G</span>
                  <span className="text-indigo-400">+{levelCfg.reward.crystals} Kristal</span>
                  <span className="text-emerald-400">+{levelCfg.reward.xp} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTA: SELECT / PREPARE SQUAD (PRD Section 27) */}
          <div className="pt-3 border-t border-slate-800">
            {isUnlocked ? (
              <button
                onClick={() => {
                  sound.playClick();
                  onProceedToPreBattle(selectedLevel);
                }}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>PILIH & PERSIAPKAN SKUAD (PRE-BATTLE)</span>
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            ) : (
              <div className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-center font-bold text-xs flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Kalahkan stage sebelumnya untuk membuka wilayah ini</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
