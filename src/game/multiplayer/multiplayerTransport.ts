/**
 * Elemental Wildguard - 2-Player Co-op Real-Time Networking Manager
 * Handles Room Creation, Joining with 6-char code, Ready System,
 * and live bidirectional synchronization between Player 1 (Host) and Player 2 (Guest).
 */

import { GameMode, MultiplayerActionType, MultiplayerMessage, PlayerRole } from '../types/gameTypes';

export interface RoomParticipant {
  role: PlayerRole;
  ready: boolean;
  connected: boolean;
  lastPing: number;
}

export type ActionCallback = (action: MultiplayerMessage) => void;

class MultiplayerTransport {
  private channel: BroadcastChannel | null = null;
  private storageKey = 'ew_coop_active_room_sync';
  private heartbeatInterval: any = null;

  public roomId: string | null = null;
  public myRole: PlayerRole = 'P1';
  public isHost: boolean = false;
  public hostReady: boolean = false;
  public guestReady: boolean = false;
  public guestConnected: boolean = false;
  public selectedLevel: number = 1;

  private actionListeners: Set<ActionCallback> = new Set();
  private stateChangeListeners: Set<() => void> = new Set();

  constructor() {
    this.initTransport();
  }

  private initTransport(): void {
    if (typeof window === 'undefined') return;

    try {
      this.channel = new BroadcastChannel('elemental_wildguard_coop_bus');
      this.channel.onmessage = (event) => {
        this.handleIncomingRawMessage(event.data);
      };
    } catch {
      // Fallback to storage event
    }

    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey && e.newValue) {
        try {
          const msg = JSON.parse(e.newValue);
          this.handleIncomingRawMessage(msg);
        } catch {}
      }
    });

    // Start heartbeat
    this.heartbeatInterval = setInterval(() => {
      this.checkHeartbeat();
    }, 2000);
  }

  private notifyStateChange(): void {
    for (const listener of this.stateChangeListeners) {
      listener();
    }
  }

  private handleIncomingRawMessage(msg: MultiplayerMessage): void {
    if (!this.roomId || msg.roomId !== this.roomId) return;
    // Don't process self echoes
    if (msg.sender === this.myRole) return;

    if (msg.type === 'ROOM_UPDATE') {
      const payload = msg.payload || {};
      if (typeof payload.hostReady === 'boolean') this.hostReady = payload.hostReady;
      if (typeof payload.guestReady === 'boolean') this.guestReady = payload.guestReady;
      if (typeof payload.guestConnected === 'boolean') this.guestConnected = payload.guestConnected;
      if (typeof payload.selectedLevel === 'number') this.selectedLevel = payload.selectedLevel;
      this.notifyStateChange();
    } else if (msg.type === 'LEAVE_ROOM') {
      if (this.isHost) {
        this.guestConnected = false;
        this.guestReady = false;
        this.notifyStateChange();
      } else {
        // Host left
        this.leaveRoom();
      }
    }

    // Forward to game action listeners
    for (const cb of this.actionListeners) {
      cb(msg);
    }
  }

  public subscribeState(listener: () => void): () => void {
    this.stateChangeListeners.add(listener);
    return () => this.stateChangeListeners.delete(listener);
  }

  public subscribeActions(callback: ActionCallback): () => void {
    this.actionListeners.add(callback);
    return () => this.actionListeners.delete(callback);
  }

  public sendAction(type: MultiplayerActionType, payload?: any): void {
    if (!this.roomId) return;
    const msg: MultiplayerMessage = {
      roomId: this.roomId,
      sender: this.myRole,
      timestamp: Date.now(),
      type,
      payload,
    };

    if (this.channel) {
      this.channel.postMessage(msg);
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(msg));
    } catch {}
  }

  /**
   * Generates a unique 6-character room code (e.g. "WG8291")
   */
  public generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  public createRoom(level: number = 1): string {
    const code = this.generateRoomCode();
    this.roomId = code;
    this.myRole = 'P1';
    this.isHost = true;
    this.hostReady = false;
    this.guestReady = false;
    this.guestConnected = false;
    this.selectedLevel = level;

    // Broadcast room existence
    this.sendAction('ROOM_UPDATE', {
      hostReady: false,
      guestReady: false,
      guestConnected: false,
      selectedLevel: level,
    });

    this.notifyStateChange();
    return code;
  }

  public joinRoom(code: string): boolean {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 6) return false;

    this.roomId = cleanCode;
    this.myRole = 'P2';
    this.isHost = false;
    this.guestConnected = true;
    this.guestReady = false;

    // Inform host that guest has connected
    this.sendAction('ROOM_UPDATE', {
      guestConnected: true,
      guestReady: false,
    });

    this.notifyStateChange();
    return true;
  }

  public toggleReady(): void {
    if (this.isHost) {
      this.hostReady = !this.hostReady;
    } else {
      this.guestReady = !this.guestReady;
    }

    this.sendAction('ROOM_UPDATE', {
      hostReady: this.hostReady,
      guestReady: this.guestReady,
      guestConnected: this.guestConnected,
      selectedLevel: this.selectedLevel,
    });

    this.notifyStateChange();
  }

  public setLevel(level: number): void {
    if (!this.isHost) return;
    this.selectedLevel = level;
    this.sendAction('ROOM_UPDATE', {
      selectedLevel: level,
      hostReady: this.hostReady,
      guestReady: this.guestReady,
    });
    this.notifyStateChange();
  }

  public leaveRoom(): void {
    if (this.roomId) {
      this.sendAction('LEAVE_ROOM');
    }
    this.roomId = null;
    this.myRole = 'P1';
    this.isHost = false;
    this.hostReady = false;
    this.guestReady = false;
    this.guestConnected = false;
    this.notifyStateChange();
  }

  private checkHeartbeat(): void {
    if (!this.roomId) return;
    // Periodic sync
    if (this.isHost) {
      this.sendAction('ROOM_UPDATE', {
        hostReady: this.hostReady,
        guestConnected: this.guestConnected,
        guestReady: this.guestReady,
        selectedLevel: this.selectedLevel,
      });
    }
  }

  public destroy(): void {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.channel) this.channel.close();
  }
}

export const multiplayer = new MultiplayerTransport();
