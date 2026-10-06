/**
 * Elemental Wildguard - High-Fidelity Character and Monster Visual Avatars
 * Handcrafted domain-specific SVG game assets for all 20 Heroes and 10 Enemies + Bosses.
 */

import React from 'react';
import { Element, Role, EnemyClass } from '../game/types/gameTypes';

interface HeroAvatarProps {
  templateId: string;
  element: Element;
  role: Role;
  isDead?: boolean;
  size?: number;
}

export const HeroAvatar: React.FC<HeroAvatarProps> = ({
  templateId,
  element,
  role,
  isDead = false,
  size = 48,
}) => {
  const getElementTheme = () => {
    switch (element) {
      case 'Fire':
        return {
          primary: '#ea580c',
          secondary: '#f97316',
          glow: '#fb923c',
          bg: '#431407',
        };
      case 'Water':
        return {
          primary: '#0284c7',
          secondary: '#38bdf8',
          glow: '#7dd3fc',
          bg: '#082f49',
        };
      case 'Earth':
        return {
          primary: '#65a30d',
          secondary: '#84cc16',
          glow: '#bef264',
          bg: '#1a2e05',
        };
      case 'Wind':
        return {
          primary: '#9333ea',
          secondary: '#c084fc',
          glow: '#e9d5ff',
          bg: '#3b0764',
        };
    }
  };

  const theme = getElementTheme();

  return (
    <div
      className={`relative rounded-full flex items-center justify-center overflow-hidden border-2 shadow-md transition-transform ${
        isDead ? 'grayscale opacity-60 border-slate-700 bg-slate-900' : ''
      }`}
      style={{
        width: size,
        height: size,
        borderColor: isDead ? '#475569' : theme.secondary,
        backgroundColor: theme.bg,
        boxShadow: isDead ? 'none' : `0 0 10px ${theme.primary}50`,
      }}
    >
      <svg
        viewBox="0 0 40 40"
        className="w-full h-full p-1"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Element Background Sigil */}
        <circle cx="20" cy="20" r="16" fill={theme.primary} fillOpacity="0.25" />

        {/* Character-specific Silhouette / Gear */}
        {templateId === 'Pyra' && (
          <g>
            {/* Fire Sorceress Flame Crown & Staff */}
            <path d="M20 7 C23 12, 26 10, 24 16 C27 15, 29 18, 26 23 C22 28, 18 28, 14 23 C11 18, 13 15, 16 16 C14 10, 17 12, 20 7 Z" fill="#f97316" />
            <circle cx="20" cy="21" r="5" fill="#fed7aa" />
            <path d="M12 28 L28 28 L24 36 L16 36 Z" fill="#c2410c" />
            <circle cx="17" cy="21" r="1" fill="#431407" />
            <circle cx="23" cy="21" r="1" fill="#431407" />
          </g>
        )}

        {templateId === 'Terra' && (
          <g>
            {/* Earth Guardian Greatshield & Horned Helm */}
            <path d="M13 13 L27 13 L24 28 L20 33 L16 28 Z" fill="#4d7c0f" stroke="#a3e635" strokeWidth="1.5" />
            <path d="M20 16 L20 30" stroke="#f7fee7" strokeWidth="1.5" />
            <path d="M15 21 L25 21" stroke="#f7fee7" strokeWidth="1.5" />
            <circle cx="20" cy="21" r="2.5" fill="#facc15" />
            {/* Horns */}
            <path d="M14 13 L11 7 L15 10 Z" fill="#65a30d" />
            <path d="M26 13 L29 7 L25 10 Z" fill="#65a30d" />
          </g>
        )}

        {templateId === 'Aqua' && (
          <g>
            {/* Water Siren Veil & Pearl Trident */}
            <path d="M20 8 C25 14, 27 20, 25 26 C23 31, 17 31, 15 26 C13 20, 15 14, 20 8 Z" fill="#38bdf8" fillOpacity="0.8" />
            <circle cx="20" cy="18" r="5" fill="#e0f2fe" />
            <path d="M20 12 L20 34" stroke="#0284c7" strokeWidth="1.5" />
            <path d="M16 16 L20 18 L24 16" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="20" cy="11" r="1.5" fill="#f0f9ff" />
          </g>
        )}

        {templateId === 'Aeris' && (
          <g>
            {/* Wind Ranger Hood & Feathered Bow */}
            <path d="M14 14 C16 9, 24 9, 26 14 C27 20, 25 26, 20 28 C15 26, 13 20, 14 14 Z" fill="#a855f7" />
            <circle cx="20" cy="19" r="4.5" fill="#fae8ff" />
            {/* Bow Arc */}
            <path d="M10 10 Q14 20 10 30" stroke="#f3e8ff" strokeWidth="1.5" fill="none" />
            <line x1="10" y1="10" x2="10" y2="30" stroke="#c084fc" strokeWidth="0.8" strokeDasharray="1 1" />
            <path d="M8 20 L24 20" stroke="#fbbf24" strokeWidth="1.5" />
          </g>
        )}

        {templateId === 'Volkar' && (
          <g>
            {/* Magma Berserker Colossus */}
            <rect x="14" y="12" width="12" height="15" rx="3" fill="#7f1d1d" stroke="#f87171" strokeWidth="1.5" />
            <path d="M16 17 L24 17 M17 21 L23 21" stroke="#fca5a5" strokeWidth="1.5" />
            {/* Greatsword on back */}
            <path d="M8 6 L14 12 M11 9 L9 11" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
            <circle cx="17" cy="14" r="1" fill="#fef08a" />
            <circle cx="23" cy="14" r="1" fill="#fef08a" />
          </g>
        )}

        {/* Fallback / Generic Hero Roles */}
        {templateId !== 'Pyra' &&
          templateId !== 'Terra' &&
          templateId !== 'Aqua' &&
          templateId !== 'Aeris' &&
          templateId !== 'Volkar' && (
            <g>
              {role === 'Tank' && (
                <path d="M13 12 L27 12 L24 28 L20 32 L16 28 Z" fill={theme.primary} stroke={theme.glow} strokeWidth="1.5" />
              )}
              {role === 'Ranged' && (
                <g>
                  <circle cx="20" cy="20" r="8" stroke={theme.glow} strokeWidth="1.5" strokeDasharray="2 2" />
                  <path d="M20 10 L20 30 M10 20 L30 20" stroke={theme.secondary} strokeWidth="1.5" />
                </g>
              )}
              {role === 'Melee' && (
                <g>
                  <path d="M14 26 L26 14 M26 14 L23 13 M26 14 L27 17" stroke={theme.glow} strokeWidth="2" strokeLinecap="round" />
                  <path d="M26 26 L14 14 M14 14 L17 13 M14 14 L13 17" stroke={theme.secondary} strokeWidth="2" strokeLinecap="round" />
                </g>
              )}
              {role === 'Support' && (
                <g>
                  <path d="M20 10 C16 15, 12 20, 20 28 C28 20, 24 15, 20 10 Z" fill={theme.secondary} />
                  <circle cx="20" cy="20" r="3" fill="#ffffff" />
                </g>
              )}
              <text
                x="20"
                y="24"
                textAnchor="middle"
                fontSize="8"
                fontWeight="bold"
                fill="#ffffff"
                fontFamily="Cinzel, serif"
              >
                {templateId.substring(0, 2)}
              </text>
            </g>
          )}
      </svg>
    </div>
  );
};

interface EnemyAvatarProps {
  templateId: string;
  element: Element;
  enemyClass: EnemyClass;
  size?: number;
}

export const EnemyAvatar: React.FC<EnemyAvatarProps> = ({
  templateId,
  element,
  enemyClass,
  size = 32,
}) => {
  const isBoss = enemyClass === 'Boss' || enemyClass === 'MapBoss';
  const isMiniBoss = enemyClass === 'MiniBoss';
  const isElite = enemyClass === 'Elite';

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full flex items-center justify-center shadow-lg transition-transform ${
        isBoss
          ? 'ring-2 ring-rose-500 shadow-rose-950/80 bg-slate-950'
          : isMiniBoss
          ? 'ring-2 ring-amber-500 shadow-amber-950/70 bg-slate-950'
          : isElite
          ? 'ring-1 ring-yellow-400 bg-slate-900'
          : 'bg-slate-900'
      }`}
    >
      <svg
        viewBox="0 0 32 32"
        className="w-full h-full p-0.5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Monster Specific Art */}
        {templateId === 'ForestCrawler' && (
          <g>
            {/* Insectoid Crawler */}
            <ellipse cx="16" cy="16" rx="7" ry="5" fill="#4d7c0f" />
            <circle cx="22" cy="16" r="3.5" fill="#365314" />
            {/* Mandibles */}
            <path d="M24 14 L27 13 M24 18 L27 19" stroke="#bef264" strokeWidth="1.5" strokeLinecap="round" />
            {/* Skittering Legs */}
            <path d="M12 11 L9 7 M16 11 L16 6 M20 11 L23 7" stroke="#65a30d" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M12 21 L9 25 M16 21 L16 26 M20 21 L23 25" stroke="#65a30d" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="23" cy="15" r="0.8" fill="#facc15" />
          </g>
        )}

        {templateId === 'WildRunner' && (
          <g>
            {/* Agile Wolf/Beast Runner */}
            <path d="M8 18 Q16 11 24 14 L27 12 L25 17 Q18 20 10 21 Z" fill="#9333ea" />
            {/* Ears */}
            <path d="M22 13 L23 9 L25 13 Z" fill="#c084fc" />
            {/* Tail */}
            <path d="M8 18 Q4 16 5 12" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
            {/* Eye */}
            <circle cx="23" cy="14" r="1" fill="#fef08a" />
          </g>
        )}

        {templateId === 'RootBeast' && (
          <g>
            {/* Wooden Treant Golem */}
            <rect x="10" y="10" width="12" height="13" rx="3" fill="#78350f" stroke="#b45309" strokeWidth="1.5" />
            <path d="M8 10 L6 6 L10 8 Z" fill="#451a03" />
            <path d="M24 10 L26 6 L22 8 Z" fill="#451a03" />
            <line x1="13" y1="15" x2="16" y2="15" stroke="#fde047" strokeWidth="1.5" />
            <line x1="18" y1="15" x2="21" y2="15" stroke="#fde047" strokeWidth="1.5" />
            <path d="M14 19 Q16 22 19 19" stroke="#b45309" strokeWidth="1.5" fill="none" />
          </g>
        )}

        {templateId === 'ShadowBat' && (
          <g>
            {/* Flying Shadow Bat */}
            <path d="M16 12 C13 8, 7 8, 4 12 C7 16, 12 16, 16 20 C20 16, 25 16, 28 12 C25 8, 19 8, 16 12 Z" fill="#6b21a8" />
            <circle cx="16" cy="16" r="3" fill="#3b0764" />
            <circle cx="15" cy="15.5" r="0.8" fill="#ef4444" />
            <circle cx="17" cy="15.5" r="0.8" fill="#ef4444" />
          </g>
        )}

        {templateId === 'SporeMage' && (
          <g>
            {/* Hooded Fungal Sorcerer */}
            <path d="M16 8 C11 8, 9 14, 11 22 L21 22 C23 14, 21 8, 16 8 Z" fill="#0e7490" />
            <ellipse cx="16" cy="10" rx="7" ry="4" fill="#0891b2" />
            <circle cx="14" cy="15" r="1" fill="#a5f3fc" />
            <circle cx="18" cy="15" r="1" fill="#a5f3fc" />
            {/* Spore particles */}
            <circle cx="23" cy="10" r="1.2" fill="#67e8f9" />
            <circle cx="8" cy="12" r="1" fill="#67e8f9" />
          </g>
        )}

        {/* Bosses */}
        {isBoss && (
          <g>
            {/* Boss Horned Skull / Crown */}
            <circle cx="16" cy="16" r="12" fill="#881337" fillOpacity="0.4" />
            <path d="M10 8 L13 14 L16 9 L19 14 L22 8 L22 18 L10 18 Z" fill="#f43f5e" stroke="#ffe4e6" strokeWidth="1" />
            <circle cx="13" cy="15" r="1.5" fill="#facc15" />
            <circle cx="19" cy="15" r="1.5" fill="#facc15" />
            <path d="M13 21 L19 21" stroke="#ffe4e6" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}

        {isMiniBoss && (
          <g>
            {/* Mini Boss Ancient Root Tyrant */}
            <circle cx="16" cy="16" r="11" fill="#713f12" fillOpacity="0.4" />
            <path d="M11 9 L16 6 L21 9 L23 18 L9 18 Z" fill="#ca8a04" stroke="#fef08a" strokeWidth="1" />
            <circle cx="13" cy="14" r="1.5" fill="#ef4444" />
            <circle cx="19" cy="14" r="1.5" fill="#ef4444" />
          </g>
        )}

        {/* Generic Monster Icon for other types */}
        {!isBoss &&
          !isMiniBoss &&
          templateId !== 'ForestCrawler' &&
          templateId !== 'WildRunner' &&
          templateId !== 'RootBeast' &&
          templateId !== 'ShadowBat' &&
          templateId !== 'SporeMage' && (
            <g>
              <circle cx="16" cy="16" r="8" fill="#334155" />
              <path d="M12 14 L14 13 M18 13 L20 14" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M14 20 Q16 22 18 20" stroke="#f87171" strokeWidth="1.5" />
            </g>
          )}
      </svg>
    </div>
  );
};
