/**
 * Elemental Wildguard - 3D Living World Lobby Scene
 * Mandated by Master PRD v1.0 Sections 17-23, 39, 43
 *
 * Implements:
 * - Premium stylized 3D animated fantasy aesthetics (warm, expressive, cinematic, rounded)
 * - Living sanctuary island with floating stones, crystal conduit, swaying trees, and flowing river
 * - Cute stylized 3D hero avatars with breathing, blinking, and subtle idle gestures
 * - Cinematic floating camera with gentle orbital drift & mouse parallax
 * - Soft warm directional lighting, ambient sky fill, and sparkling elemental motes
 * - 60 FPS performance with optimized Three.js geometries and automatic cleanup
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Lobby3DSceneProps {
  onHeroClick?: (heroName: string) => void;
}

export const Lobby3DScene: React.FC<Lobby3DSceneProps> = ({ onHeroClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x13231e, 0.025);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 6.5, 15);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // --- Lighting (Warm, soft, cinematic - Section 39) ---
    const ambientLight = new THREE.AmbientLight(0xd4f0e2, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff3d6, 2.2);
    sunLight.position.set(12, 18, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -10;
    sunLight.shadow.camera.right = 10;
    sunLight.shadow.camera.top = 10;
    sunLight.shadow.camera.bottom = -10;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.8);
    rimLight.position.set(-10, 8, -12);
    scene.add(rimLight);

    // --- Stylized Floating Island Mesh ---
    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    // Main island plateau (lush green grass top)
    const islandGeo = new THREE.CylinderGeometry(7.2, 5.5, 2.2, 28, 2);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.8,
      metalness: 0.05,
      flatShading: true,
    });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.y = -0.2;
    island.receiveShadow = true;
    islandGroup.add(island);

    // Cliff underside (warm earthy stone)
    const cliffGeo = new THREE.ConeGeometry(5.8, 4.2, 24);
    const cliffMat = new THREE.MeshStandardMaterial({
      color: 0x3d352e,
      roughness: 0.9,
      flatShading: true,
    });
    const cliff = new THREE.Mesh(cliffGeo, cliffMat);
    cliff.rotation.x = Math.PI;
    cliff.position.y = -2.8;
    cliff.receiveShadow = true;
    islandGroup.add(cliff);

    // Stone Sanctuary Base & Portal
    const basePillarGeo = new THREE.CylinderGeometry(1.6, 2.0, 1.2, 8);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.7,
      flatShading: true,
    });
    const basePillar = new THREE.Mesh(basePillarGeo, stoneMat);
    basePillar.position.set(0, 1.2, -1.8);
    basePillar.castShadow = true;
    basePillar.receiveShadow = true;
    islandGroup.add(basePillar);

    // Glowing Primordial Conduit Crystal (rotating & pulsing)
    const crystalGeo = new THREE.OctahedronGeometry(0.75, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.2,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.set(0, 2.6, -1.8);
    islandGroup.add(crystal);

    // Flowing Crystal Spring / Water Stream
    const waterGeo = new THREE.PlaneGeometry(1.8, 7.5, 12, 12);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.1,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85,
    });
    const waterStream = new THREE.Mesh(waterGeo, waterMat);
    waterStream.rotation.x = -Math.PI / 2;
    waterStream.rotation.z = -0.35;
    waterStream.position.set(1.5, 0.92, 1.2);
    waterStream.receiveShadow = true;
    islandGroup.add(waterStream);

    // --- Stylized Cute Trees with Swaying Canopy ---
    interface SwayingTree {
      trunk: THREE.Mesh;
      foliage: THREE.Mesh;
      initialRotZ: number;
      speed: number;
    }
    const trees: SwayingTree[] = [];
    const treePositions = [
      { x: -4.8, z: -2.2, s: 1.1, c: 0x16a34a },
      { x: -3.8, z: 0.8, s: 0.85, c: 0x22c55e },
      { x: 4.5, z: -1.8, s: 1.0, c: 0x15803d },
      { x: 4.2, z: 1.5, s: 0.75, c: 0x10b981 },
      { x: -1.8, z: -4.2, s: 0.95, c: 0x059669 },
    ];

    treePositions.forEach((pos, idx) => {
      const trunkGeo = new THREE.CylinderGeometry(0.18 * pos.s, 0.28 * pos.s, 1.4 * pos.s, 6);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9, flatShading: true });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(pos.x, 0.9 + 0.7 * pos.s, pos.z);
      trunk.castShadow = true;
      islandGroup.add(trunk);

      // Rounded, puffy stylized foliage
      const foliageGeo = new THREE.DodecahedronGeometry(1.2 * pos.s, 1);
      const foliageMat = new THREE.MeshStandardMaterial({ color: pos.c, roughness: 0.75, flatShading: true });
      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.set(pos.x, 0.9 + 1.8 * pos.s, pos.z);
      foliage.castShadow = true;
      islandGroup.add(foliage);

      trees.push({
        trunk,
        foliage,
        initialRotZ: 0,
        speed: 1.2 + idx * 0.3,
      });
    });

    // --- Cute Stylized 3D Animated Hero Avatars (Section 21 & 31) ---
    // Characters: Pyra (Fire), Aqua (Water), Terra (Earth), Zephyr (Wind)
    interface AnimatedCharacter {
      group: THREE.Group;
      head: THREE.Mesh;
      body: THREE.Mesh;
      eyes: THREE.Mesh[];
      weapon?: THREE.Mesh;
      baseY: number;
      breathSpeed: number;
      breathOffset: number;
      lookTimer: number;
      blinkTimer: number;
      heroName: string;
    }

    const characters: AnimatedCharacter[] = [];

    const createStylizedHero = (
      name: string,
      elementColor: number,
      accentColor: number,
      posX: number,
      posZ: number,
      rotY: number
    ): AnimatedCharacter => {
      const charGroup = new THREE.Group();
      charGroup.position.set(posX, 1.0, posZ);
      charGroup.rotation.y = rotY;
      islandGroup.add(charGroup);

      // Torso / Body (Rounded stylized shape)
      const bodyGeo = new THREE.CylinderGeometry(0.32, 0.42, 0.75, 12);
      const bodyMat = new THREE.MeshStandardMaterial({ color: elementColor, roughness: 0.6, flatShading: true });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.45;
      body.castShadow = true;
      charGroup.add(body);

      // Head (Large, expressive rounded sphere)
      const headGeo = new THREE.SphereGeometry(0.38, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({ color: 0xffdfba, roughness: 0.5 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.05;
      head.castShadow = true;
      charGroup.add(head);

      // Cute Eyes (Blinking capability)
      const eyeGeo = new THREE.SphereGeometry(0.065, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.12, 1.08, 0.33);
      charGroup.add(leftEye);

      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.12, 1.08, 0.33);
      charGroup.add(rightEye);

      // Element Hat / Hair piece
      const hatGeo = new THREE.ConeGeometry(0.42, 0.55, 8);
      const hatMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.5, flatShading: true });
      const hat = new THREE.Mesh(hatGeo, hatMat);
      hat.position.set(0, 1.4, -0.05);
      hat.rotation.x = -0.15;
      charGroup.add(hat);

      // Weapon / Accessory
      const weaponGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 6);
      const weaponMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
      const weapon = new THREE.Mesh(weaponGeo, weaponMat);
      weapon.position.set(0.42, 0.6, 0.1);
      weapon.rotation.z = -0.2;
      weapon.castShadow = true;
      charGroup.add(weapon);

      return {
        group: charGroup,
        head,
        body,
        eyes: [leftEye, rightEye],
        weapon,
        baseY: 1.0,
        breathSpeed: 2.0 + Math.random() * 0.8,
        breathOffset: Math.random() * Math.PI * 2,
        lookTimer: Math.random() * 3,
        blinkTimer: Math.random() * 4,
        heroName: name,
      };
    };

    // Hero 1: Pyra (Fire) - Front left
    characters.push(createStylizedHero('Pyra', 0xef4444, 0xf97316, -1.3, 0.8, 0.35));
    // Hero 2: Aqua (Water) - Front right
    characters.push(createStylizedHero('Aqua', 0x0284c7, 0x38bdf8, 1.2, 0.6, -0.4));
    // Hero 3: Terra (Earth) - Mid left near pillar
    characters.push(createStylizedHero('Terra', 0x65a30d, 0x84cc16, -2.4, -0.8, 0.7));
    // Hero 4: Zephyr (Wind) - Mid right
    characters.push(createStylizedHero('Zephyr', 0x8b5cf6, 0xc084fc, 2.3, -0.7, -0.65));

    // --- Floating Clouds in Sky ---
    const clouds: THREE.Mesh[] = [];
    const cloudGeo = new THREE.DodecahedronGeometry(1.6, 1);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      transparent: true,
      opacity: 0.75,
      flatShading: true,
    });

    for (let i = 0; i < 6; i++) {
      const cloud = new THREE.Mesh(cloudGeo, cloudMat);
      cloud.position.set(-14 + i * 5.5 + Math.random() * 2, 7.5 + Math.random() * 2, -10 - Math.random() * 8);
      cloud.scale.set(1.5 + Math.random(), 0.7, 1.2);
      scene.add(cloud);
      clouds.push(cloud);
    }

    // --- Floating Elemental Spores / Fireflies Particles (Section 35, 41) ---
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3 + 0] = (Math.random() - 0.5) * 12;
      particlePos[i * 3 + 1] = 0.5 + Math.random() * 5.5;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      particleVel[i * 3 + 0] = (Math.random() - 0.5) * 0.2;
      particleVel[i * 3 + 1] = 0.2 + Math.random() * 0.4;
      particleVel[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.18,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- Mouse Parallax Handling ---
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = normX * 0.45;
      mouseY = normY * 0.25;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // --- Main 60 FPS Render Loop ---
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const dt = clock.getDelta();

      // 1. Cinematic Camera Slow Orbit & Subtle Parallax (Section 22)
      const baseCamX = Math.sin(time * 0.15) * 1.2;
      const baseCamY = 6.2 + Math.cos(time * 0.2) * 0.35;
      camera.position.x += (baseCamX + mouseX * 2.5 - camera.position.x) * 0.04;
      camera.position.y += (baseCamY + mouseY * 1.5 - camera.position.y) * 0.04;
      camera.lookAt(0, 1.3, 0);

      // 2. Crystal Rotation & Gentle Float
      crystal.rotation.y = time * 0.8;
      crystal.rotation.x = Math.sin(time * 0.5) * 0.15;
      crystal.position.y = 2.6 + Math.sin(time * 1.5) * 0.12;

      // 3. Tree Foliage Wind Sway
      trees.forEach((t) => {
        t.foliage.rotation.z = Math.sin(time * t.speed) * 0.06;
        t.foliage.rotation.x = Math.cos(time * (t.speed * 0.8)) * 0.04;
      });

      // 4. Character Animations (Breathing, Blinking, Head Tilts - Section 21)
      characters.forEach((char) => {
        // Breathing: torso vertical scaling and gentle position offset
        const breath = Math.sin(time * char.breathSpeed + char.breathOffset);
        char.body.scale.y = 1.0 + breath * 0.04;
        char.body.position.y = 0.45 + breath * 0.02;
        char.head.position.y = 1.05 + breath * 0.035;

        // Head looking around randomly
        char.lookTimer -= 0.016;
        if (char.lookTimer <= 0) {
          char.head.rotation.y = (Math.random() - 0.5) * 0.5;
          char.head.rotation.x = (Math.random() - 0.5) * 0.15;
          char.lookTimer = 2.0 + Math.random() * 3.5;
        }

        // Blinking
        char.blinkTimer -= 0.016;
        if (char.blinkTimer <= 0) {
          char.eyes.forEach((eye) => (eye.scale.y = 0.1));
          if (char.blinkTimer <= -0.15) {
            char.eyes.forEach((eye) => (eye.scale.y = 1.0));
            char.blinkTimer = 2.5 + Math.random() * 4.0;
          }
        }
      });

      // 5. Cloud Drifting
      clouds.forEach((c) => {
        c.position.x += 0.008;
        if (c.position.x > 18) {
          c.position.x = -18;
        }
      });

      // 6. Particle Fireflies Floating
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.012;
        positions[i * 3 + 0] += Math.sin(time + i) * 0.006;
        if (positions[i * 3 + 1] > 6.5) {
          positions[i * 3 + 1] = 0.8;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount (Section 15, 41)
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      islandGeo.dispose();
      islandMat.dispose();
      cliffGeo.dispose();
      cliffMat.dispose();
      crystalGeo.dispose();
      crystalMat.dispose();
      waterGeo.dispose();
      waterMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [onHeroClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[380px] sm:min-h-[460px] md:min-h-[520px] rounded-3xl overflow-hidden relative"
      style={{ touchAction: 'none' }}
    />
  );
};
