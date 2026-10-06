/**
 * Elemental Wildguard - 2-Player Co-op Room Lobby
 * Provides Room Creation, 6-character Room Code sharing, Join Room flow,
 * Ready system, and instant session initialization.
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Copy,
  Check,
  Play,
  ArrowLeft,
  Shield,
  Coins,
  Sparkles,
  Wifi,
  WifiOff,
  UserCheck,
  Clock,
  Radio,
} from 'lucide-react';
import { multiplayer } from '../game/multiplayer/multiplayerTransport';
import { CAMPAIGN_LEVELS } from '../game/data/levelRegistry';
import { sound } from '../game/audio/soundSynthesizer';
import { PlayerRole } from '../game/types/gameTypes';

interface MultiplayerLobbyProps {
  onStartCoopGame: (levelId: number, role: PlayerRole) => void;
  onBackToSinglePlayer?: () => void;
  onLeaveLobby?: () => void;
  currentRole?: PlayerRole;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  onStartCoopGame,
  onBackToSinglePlayer,
  onLeaveLobby,
  currentRole,
}) => {
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [selectedLevelId, setSelectedLevelId] = useState(1);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Force re-render on transport updates
  const [, setTrigger] = useState(0);

  useEffect(() => {
    const unsub = multiplayer.subscribeState(() => {
      setTrigger((prev) => prev + 1);
    });

    const unsubActions = multiplayer.subscribeActions((msg) => {
      if (msg.type === 'GAME_START') {
        sound.playWaveHorn();
        onStartCoopGame(multiplayer.selectedLevel, multiplayer.myRole);
      }
    });

    return () => {
      unsub();
      unsubActions();
    };
  }, [onStartCoopGame]);

  const handleCreateRoom = () => {
    sound.playClick();
    setErrorMessage(null);
    const code = multiplayer.createRoom(selectedLevelId);
    setTrigger((p) => p + 1);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setErrorMessage(null);
    const trimmed = joinCodeInput.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setErrorMessage('Room code must be exactly 6 characters (e.g. WG8291).');
      return;
    }
    const success = multiplayer.joinRoom(trimmed);
    if (!success) {
      setErrorMessage('Failed to join room. Verify the code.');
    }
  };

  const handleCopyCode = () => {
    if (!multiplayer.roomId) return;
    navigator.clipboard?.writeText(multiplayer.roomId);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleReady = () => {
    sound.playClick();
    multiplayer.toggleReady();
  };

  const handleLaunchGame = () => {
    sound.playWaveHorn();
    multiplayer.sendAction('GAME_START', { level: multiplayer.selectedLevel });
    onStartCoopGame(multiplayer.selectedLevel, multiplayer.myRole);
  };

  const handleLeave = () => {
    sound.playClick();
    multiplayer.leaveRoom();
    if (onLeaveLobby) {
      onLeaveLobby();
    } else if (onBackToSinglePlayer) {
      onBackToSinglePlayer();
    }
  };

  const isBothReady = multiplayer.hostReady && multiplayer.guestReady;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Users className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-300">
              Cooperative Multiplayer Protocol
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-white tracking-tight">
            2-Player Co-op Command
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Kendalikan medan perang bersama pemain kedua. Berbagi Core HP &amp; kemajuan wave,
            dengan cadangan emas dan kepemilikan hero terpisah secara real-time!
          </p>
        </div>

        <button
          onClick={handleLeave}
          className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Single Player</span>
        </button>
      </div>

      {/* Main Flow: Either Room Creation / Join OR Inside Room Lobby */}
      {!multiplayer.roomId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Create Room */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between gap-5 shadow-lg backdrop-blur-sm">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h2 className="text-lg font-display font-bold text-white">Create New Room (Host P1)</h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Buat room baru dan dapatkan kode 6 karakter untuk dibagikan ke temanmu.
                Sebagai Host, kamu akan memimpin strategi operasi!
              </p>

              {/* Level Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Select Campaign Stage:</label>
                <select
                  value={selectedLevelId}
                  onChange={(e) => setSelectedLevelId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-medium focus:outline-none focus:border-cyan-500"
                >
                  {[1, 2, 3, 4, 5].map((lvl) => {
                    const cfg = CAMPAIGN_LEVELS[lvl];
                    return (
                      <option key={lvl} value={lvl}>
                        {cfg.code}: {cfg.englishTitle} ({cfg.totalWaves} Waves)
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <button
              onClick={handleCreateRoom}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>Create 2-Player Room</span>
            </button>
          </div>

          {/* Card 2: Join Room */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between gap-5 shadow-lg backdrop-blur-sm">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
                <h2 className="text-lg font-display font-bold text-white">Join Room (Guest P2)</h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Masukkan 6 karakter kode room yang diberikan oleh temanmu untuk langsung bergabung
                ke sesi medan pertempuran kooperatif.
              </p>

              <form onSubmit={handleJoinRoom} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    6-Character Room Code:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. WG9482"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-center font-mono font-bold tracking-widest text-lg text-amber-300 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 uppercase"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-rose-400 font-semibold">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40 transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Join Co-op Session</span>
                </button>
              </form>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Tip: Kamu juga bisa membuka tab browser kedua untuk menguji P1 dan P2 langsung di perangkat yang sama!</span>
            </div>
          </div>
        </div>
      ) : (
        /* Inside Active Room Lobby */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-6">
          {/* Room Code Display */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800 gap-4">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                ACTIVE ROOM CODE (SHARE WITH FRIEND)
              </span>
              <span className="text-3xl font-mono font-black tracking-widest text-amber-300 drop-shadow">
                {multiplayer.roomId}
              </span>
            </div>

            <button
              onClick={handleCopyCode}
              className="py-2 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* 2 Players Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Player 1 (Host) */}
            <div className="bg-slate-950/70 border border-cyan-500/40 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500 flex items-center justify-center font-bold text-cyan-300 font-mono">
                  P1
                </div>
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    Player 1 (Host) {multiplayer.isHost && <span className="text-[10px] text-cyan-400 font-normal">(You)</span>}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono block">Cyan Color Palette</span>
                </div>
              </div>

              <div>
                {multiplayer.hostReady ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-400" /> READY
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> WAITING
                  </span>
                )}
              </div>
            </div>

            {/* Player 2 (Guest) */}
            <div className="bg-slate-950/70 border border-purple-500/40 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500 flex items-center justify-center font-bold text-purple-300 font-mono">
                  P2
                </div>
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    Player 2 (Guest) {!multiplayer.isHost && <span className="text-[10px] text-purple-400 font-normal">(You)</span>}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono block">
                    {multiplayer.guestConnected ? 'Purple Color Palette' : 'Waiting for connection...'}
                  </span>
                </div>
              </div>

              <div>
                {!multiplayer.guestConnected ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900 text-slate-500 border border-slate-800 flex items-center gap-1">
                    <WifiOff className="w-3 h-3 text-slate-500" /> NOT CONNECTED
                  </span>
                ) : multiplayer.guestReady ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-400" /> READY
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> WAITING
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stage Details & Host Selector */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400">Selected Stage:</span>
              {multiplayer.isHost ? (
                <select
                  value={multiplayer.selectedLevel}
                  onChange={(e) => {
                    const newLvl = Number(e.target.value);
                    multiplayer.setLevel(newLvl);
                  }}
                  className="bg-slate-900 border border-cyan-500/50 rounded-lg px-2.5 py-1 text-white font-display font-bold text-xs focus:outline-none cursor-pointer"
                >
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {CAMPAIGN_LEVELS[lvl]?.code}: {CAMPAIGN_LEVELS[lvl]?.name} ({CAMPAIGN_LEVELS[lvl]?.totalWaves} W)
                    </option>
                  ))}
                </select>
              ) : (
                <strong className="text-white font-display">
                  {CAMPAIGN_LEVELS[multiplayer.selectedLevel]?.code}: {CAMPAIGN_LEVELS[multiplayer.selectedLevel]?.name}
                </strong>
              )}
            </div>
            <span className="text-amber-400 font-mono font-bold">
              {CAMPAIGN_LEVELS[multiplayer.selectedLevel]?.totalWaves} Waves · Shared Core HP
            </span>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-800">
            <button
              onClick={handleToggleReady}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                (multiplayer.isHost ? multiplayer.hostReady : multiplayer.guestReady)
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40'
              }`}
            >
              {(multiplayer.isHost ? multiplayer.hostReady : multiplayer.guestReady) ? (
                <span>CANCEL READY</span>
              ) : (
                <span>SET READY TO BATTLE</span>
              )}
            </button>

            {multiplayer.isHost && (
              <button
                onClick={handleLaunchGame}
                disabled={!isBothReady}
                className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  isBothReady
                    ? 'bg-gradient-to-r from-amber-500 via-rose-600 to-indigo-600 text-white shadow-lg shadow-rose-950/50 cursor-pointer animate-pulse'
                    : 'bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isBothReady ? 'LAUNCH CO-OP BATTLE (ALL READY!)' : 'WAITING FOR BOTH PLAYERS TO BE READY...'}</span>
              </button>
            )}

            <button
              onClick={handleLeave}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Leave Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
