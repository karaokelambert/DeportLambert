"use client";

/**
 * JL Sports Club 360 – Realtime Cloud Sync Engine v3
 * Enables instant multi-device synchronization across PCs, iPhones, Androids, and tablets.
 */

export interface CloudTournamentState {
  version: number;
  updatedAt: number;
  updatedBy?: string;
  disciplineData: any;
  disciplinesList?: any;
  branding?: any;
  registeredAdmins?: any;
}

const STORAGE_KEYS = [
  'jl360_discipline_data_v2',
  'jl360_saved_tournament_data_v1',
  'jl360_discipline_data',
  'jl360_cloud_state_v2',
  'sports_manager_data',
  'deportlambert_tournament_state'
];

const CONFIG_KEY = 'jl360_sync_config_v3';
// Global deterministic master object ID shared across all devices worldwide
const MASTER_OBJECT_ID = 'ff808181a04ccf2d01a04fc723fd0e1b';
const CLOUD_SYNC_ENDPOINT = 'https://api.restful-api.dev/objects';

export interface SyncConfig {
  enabled: boolean;
  channelId: string;
  customEndpoint?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  firebaseUrl?: string;
  lastSyncedAt?: number;
}

export function getSyncConfig(): SyncConfig {
  if (typeof window === 'undefined') {
    return { enabled: true, channelId: 'deportlambert_tournament_2026' };
  }
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { enabled: true, channelId: 'deportlambert_tournament_2026' };
}

export function saveSyncConfig(config: SyncConfig) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {}
}

export function getLocalState(): CloudTournamentState | null {
  if (typeof window === 'undefined') return null;
  for (const key of STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) {
          if (parsed.disciplineData) return parsed;
          if (parsed.baloncesto || parsed.futsal || parsed.voleibol) {
            return {
              version: 3,
              updatedAt: Date.now(),
              disciplineData: parsed
            };
          }
        }
      }
    } catch (e) {}
  }
  return null;
}

export function saveLocalState(state: CloudTournamentState) {
  if (typeof window === 'undefined' || !state) return;
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem('jl360_cloud_state_v2', serialized);
    localStorage.setItem('jl360_discipline_data_v2', serialized);
    localStorage.setItem('jl360_saved_tournament_data_v1', serialized);
    if (state.disciplineData) {
      localStorage.setItem('jl360_discipline_data', JSON.stringify(state.disciplineData));
    }
  } catch (e) {}
}

// Cross-tab Broadcast Channel
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('jl360_sync_bus');
  } catch (e) {}
}

export function subscribeToLocalBroadcast(onMessage: (state: CloudTournamentState) => void) {
  if (!broadcastChannel) return () => {};
  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type === 'STATE_UPDATE' && event.data.state) {
      onMessage(event.data.state);
    }
  };
  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel?.removeEventListener('message', handler);
  };
}

/**
 * Push tournament state to the global cloud database & all devices
 */
export async function pushStateToCloud(state: CloudTournamentState, config?: SyncConfig): Promise<boolean> {
  saveLocalState(state);

  // Broadcast to other tabs immediately
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'STATE_UPDATE', state });
    } catch (e) {}
  }

  const cfg = config || getSyncConfig();
  if (!cfg.enabled) return true;

  try {
    // 1. Supabase REST API (if user configured)
    if (cfg.supabaseUrl && cfg.supabaseKey) {
      try {
        const url = `${cfg.supabaseUrl.replace(/\/$/, '')}/rest/v1/tournament_sync`;
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': cfg.supabaseKey,
            'Authorization': `Bearer ${cfg.supabaseKey}`,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({ id: cfg.channelId, data: state, updated_at: new Date().toISOString() })
        });
      } catch (e) {}
    }

    // 2. Custom Firebase Realtime Database (if user configured)
    if (cfg.firebaseUrl) {
      try {
        const url = cfg.firebaseUrl.replace(/\/$/, '') + `/tournaments/${cfg.channelId}.json`;
        await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state),
        });
      } catch (e) {}
    }

    // 3. Global Cloud Relay (Universal Multi-Device Sync Channel)
    const payload = {
      name: `JL360_${cfg.channelId || 'deportlambert_tournament_2026'}`,
      data: {
        channel: cfg.channelId || 'deportlambert_tournament_2026',
        stateJson: JSON.stringify(state),
        updatedAt: state.updatedAt
      }
    };

    const res = await fetch(`${CLOUD_SYNC_ENDPOINT}/${MASTER_OBJECT_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      return true;
    }
  } catch (error) {
    console.warn('[CloudSync] Fallo en push a la nube, guardado localmente:', error);
  }
  return false;
}

/**
 * Fetch latest tournament state from the global cloud database
 */
export async function fetchStateFromCloud(config?: SyncConfig): Promise<CloudTournamentState | null> {
  const cfg = config || getSyncConfig();
  if (!cfg.enabled) return getLocalState();

  try {
    // 1. Supabase REST (if configured)
    if (cfg.supabaseUrl && cfg.supabaseKey) {
      try {
        const url = `${cfg.supabaseUrl.replace(/\/$/, '')}/rest/v1/tournament_sync?id=eq.${cfg.channelId}&select=*`;
        const res = await fetch(url, {
          headers: {
            'apikey': cfg.supabaseKey,
            'Authorization': `Bearer ${cfg.supabaseKey}`
          },
          cache: 'no-store'
        });
        if (res.ok) {
          const list = await res.json();
          if (list && list[0] && list[0].data) return list[0].data;
        }
      } catch (e) {}
    }

    // 2. Firebase Realtime DB (if configured)
    if (cfg.firebaseUrl) {
      try {
        const url = cfg.firebaseUrl.replace(/\/$/, '') + `/tournaments/${cfg.channelId}.json`;
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.updatedAt) return data;
        }
      } catch (e) {}
    }

    // 3. Global Cloud Relay (Universal Multi-Device Sync Channel)
    const res = await fetch(`${CLOUD_SYNC_ENDPOINT}/${MASTER_OBJECT_ID}?t=${Date.now()}`, { 
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (res.ok) {
      const item = await res.json();
      if (item && item.data && item.data.stateJson) {
        const parsed = JSON.parse(item.data.stateJson);
        return parsed;
      }
    }
  } catch (error) {
    console.warn('[CloudSync] Error en fetch de la nube:', error);
  }

  return getLocalState();
}
