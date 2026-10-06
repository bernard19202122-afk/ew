/**
 * Elemental Wildguard - Map Environment & Terrain Registry
 * Supports multiple distinct battlefield maps with unique visuals, road styles, and props.
 */

import { Element } from '../types/gameTypes';

export interface MapDecoration {
  x: number;
  y: number;
  type: 'tree' | 'crystal' | 'rock' | 'ruin' | 'lava_vent' | 'pillar';
  icon: string;
  size: number;
}

export interface MapEnvironment {
  id: string;
  name: string;
  englishName: string;
  elementAffinity: Element;
  themeColor: string;
  description: string;
  surfaceStyle: {
    groundBg: string;
    roadTexture: string;
    roadBorder: string;
    curbColor: string;
    pathLineColor: string;
    plotBg: string;
    plotBorder: string;
    portalGlow: string;
    baseAccent: string;
  };
  decorations: MapDecoration[];
}

export const MAP_ENVIRONMENTS: MapEnvironment[] = [
  {
    id: 'emerald_forest',
    name: 'Hutan Zamrud Kuno',
    englishName: 'Ancient Emerald Forest',
    elementAffinity: 'Earth',
    themeColor: '#84cc16',
    description: 'Hutan suci terlindung dengan jalan batu berlumut purba dan vegetasi sihir lebat.',
    surfaceStyle: {
      groundBg: '#05180f',
      roadTexture: '#1e382b',
      roadBorder: '#2d5a43',
      curbColor: '#4d8b67',
      pathLineColor: '#86efac',
      plotBg: '#0a2318',
      plotBorder: '#4ade80',
      portalGlow: '#a855f7',
      baseAccent: '#38bdf8',
    },
    decorations: [
      { x: 1, y: 0, type: 'tree', icon: '🌲', size: 24 },
      { x: 3, y: 0, type: 'tree', icon: '🌳', size: 22 },
      { x: 8, y: 0, type: 'tree', icon: '🌲', size: 26 },
      { x: 10, y: 0, type: 'ruin', icon: '🏛️', size: 28 },
      { x: 0, y: 3, type: 'tree', icon: '🌲', size: 22 },
      { x: 1, y: 4, type: 'tree', icon: '🌳', size: 24 },
      { x: 9, y: 1, type: 'crystal', icon: '💎', size: 20 },
      { x: 1, y: 7, type: 'tree', icon: '🌲', size: 26 },
      { x: 8, y: 7, type: 'tree', icon: '🌳', size: 24 },
      { x: 10, y: 7, type: 'tree', icon: '🌲', size: 22 },
    ],
  },
  {
    id: 'volcanic_caldera',
    name: 'Kawah Vulkanik Cinder',
    englishName: 'Volcanic Cinder Caldera',
    elementAffinity: 'Fire',
    themeColor: '#f97316',
    description: 'Wilayah pegunungan magma dengan jalan batu obsidian hangus dan rekahan lava pijar.',
    surfaceStyle: {
      groundBg: '#180805',
      roadTexture: '#361510',
      roadBorder: '#5c2419',
      curbColor: '#9a3412',
      pathLineColor: '#fdba74',
      plotBg: '#2c0e08',
      plotBorder: '#fb923c',
      portalGlow: '#f43f5e',
      baseAccent: '#f59e0b',
    },
    decorations: [
      { x: 1, y: 0, type: 'lava_vent', icon: '🌋', size: 26 },
      { x: 5, y: 0, type: 'rock', icon: '🪨', size: 22 },
      { x: 9, y: 0, type: 'lava_vent', icon: '🔥', size: 22 },
      { x: 0, y: 4, type: 'rock', icon: '🪨', size: 24 },
      { x: 8, y: 2, type: 'crystal', icon: '♦️', size: 20 },
      { x: 1, y: 7, type: 'rock', icon: '🪨', size: 24 },
      { x: 8, y: 7, type: 'lava_vent', icon: '🔥', size: 22 },
      { x: 10, y: 7, type: 'lava_vent', icon: '🌋', size: 26 },
    ],
  },
  {
    id: 'desert_canyon',
    name: 'Ngarai Gurun Badai',
    englishName: 'Storm Sand Canyon',
    elementAffinity: 'Wind',
    themeColor: '#eab308',
    description: 'Ngarai gurun pasir berangin kencang dengan reruntuhan pilar kuil kuno dan jalan batu pasir.',
    surfaceStyle: {
      groundBg: '#1a1306',
      roadTexture: '#3a2e16',
      roadBorder: '#5e4b25',
      curbColor: '#854d0e',
      pathLineColor: '#fde047',
      plotBg: '#2a1f0a',
      plotBorder: '#facc15',
      portalGlow: '#c084fc',
      baseAccent: '#67e8f9',
    },
    decorations: [
      { x: 1, y: 0, type: 'pillar', icon: '🏺', size: 22 },
      { x: 5, y: 0, type: 'ruin', icon: '🏛️', size: 26 },
      { x: 9, y: 0, type: 'pillar', icon: '🏜️', size: 24 },
      { x: 0, y: 3, type: 'rock', icon: '🪨', size: 20 },
      { x: 8, y: 1, type: 'crystal', icon: '🔮', size: 20 },
      { x: 1, y: 7, type: 'pillar', icon: '🏺', size: 22 },
      { x: 7, y: 7, type: 'ruin', icon: '🏛️', size: 24 },
      { x: 10, y: 7, type: 'pillar', icon: '🏜️', size: 24 },
    ],
  },
];
