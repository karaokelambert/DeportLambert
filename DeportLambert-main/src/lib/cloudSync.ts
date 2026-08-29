"use client";

/**
 * JL Sports Club 360 – Realtime Cloud Sync Engine
 * Enables real-time synchronization between phones and web browsers.
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

const CONFIG_KEY = 'jl360_sync_config_v2';
const DEFAULT_CHANNEL_ID = 'deportlambert_tournament_2026';
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
    return { enabled: true, channelId: DEFAULT_CHANNEL_ID };
  }
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { enabled: true, channelId: DEFAULT_CHANNEL_ID };
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
          // If stored directly as disciplineData or as CloudTournamentState
          if (parsed.disciplineData) return parsed;
          if (parsed.baloncesto || parsed.futsal || parsed.voleibol) {
            return {
              version: 2,
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

let remoteObjectId: string | null = null;
if (typeof window !== 'undefined') {
  remoteObjectId = localStorage.getItem('jl360_remote_obj_id');
}

/**
 * Upload tournament state to the cloud
 */
export async function pushStateToCloud(state: CloudTournamentState, config?: SyncConfig): Promise<boolean> {
  saveLocalState(state);
  const cfg = config || getSyncConfig();
  if (!cfg.enabled) return true;

  try {
    // 1. If custom Firebase Realtime Database is configured
    if (cfg.firebaseUrl) {
      const url = cfg.firebaseUrl.replace(/\/$/, '') + `/tournaments/${cfg.channelId || DEFAULT_CHANNEL_ID}.json`;
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      return true;
    }

    // 2. If Supabase REST is configured
    if (cfg.supabaseUrl && cfg.supabaseKey) {
      const url = `${cfg.supabaseUrl.replace(/\/$/, '')}/rest/v1/tournament_sync`;
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': cfg.supabaseKey,
          'Authorization': `Bearer ${cfg.supabaseKey}`,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({ id: cfg.channelId || DEFAULT_CHANNEL_ID, data: state, updated_at: new Date().toISOString() })
      });
      return true;
    }

    // 3. Built-in Multi-Device Relay Sync (KV Storage API)
    const payload = {
      name: `JL360_${cfg.channelId || DEFAULT_CHANNEL_ID}`,
      data: {
        channel: cfg.channelId || DEFAULT_CHANNEL_ID,
        stateJson: JSON.stringify(state),
        updatedAt: state.updatedAt
      }
    };

    if (remoteObjectId) {
      try {
        const res = await fetch(`${CLOUD_SYNC_ENDPOINT}/${remoteObjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) return true;
      } catch (e) {}
    }

    const createRes = await fetch(CLOUD_SYNC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (createRes.ok) {
      const data = await createRes.json();
      if (data && data.id) {
        remoteObjectId = data.id;
        if (typeof window !== 'undefined') {
          localStorage.setItem('jl360_remote_obj_id', data.id);
        }
      }
      return true;
    }
  } catch (error) {
    console.warn('[CloudSync] Fallback a local storage:', error);
  }
  return false;
}

/**
 * Fetch latest tournament state from the cloud
 */
export async function fetchStateFromCloud(config?: SyncConfig): Promise<CloudTournamentState | null> {
  const cfg = config || getSyncConfig();
  if (!cfg.enabled) return getLocalState();

  try {
    // 1. Firebase Realtime DB
    if (cfg.firebaseUrl) {
      const url = cfg.firebaseUrl.replace(/\/$/, '') + `/tournaments/${cfg.channelId || DEFAULT_CHANNEL_ID}.json`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.updatedAt) return data;
      }
    }

    // 2. Supabase REST
    if (cfg.supabaseUrl && cfg.supabaseKey) {
      const url = `${cfg.supabaseUrl.replace(/\/$/, '')}/rest/v1/tournament_sync?id=eq.${cfg.channelId || DEFAULT_CHANNEL_ID}&select=*`;
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
    }

    // 3. Built-in Relay KV Storage
    if (remoteObjectId) {
      const res = await fetch(`${CLOUD_SYNC_ENDPOINT}/${remoteObjectId}`, { cache: 'no-store' });
      if (res.ok) {
        const item = await res.json();
        if (item && item.data && item.data.stateJson) {
          const parsed = JSON.parse(item.data.stateJson);
          return parsed;
        }
      }
    }
  } catch (error) {
    console.warn('[CloudSync] Error al descargar de la nube:', error);
  }

  return getLocalState();
}
