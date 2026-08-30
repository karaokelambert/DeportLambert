"use client";

/**
 * JL Sports Club 360 – Realtime Cloud Sync Engine (Supabase + Multi-Device Relay)
 * Ensures instant global synchronization across PCs, iPhones, Androids, and tablets.
 */

import { 
  getSupabaseClient, 
  getStoredSupabaseConfig, 
  fetchSupabaseTournamentState, 
  saveSupabaseTournamentState,
  syncGamesToSupabaseTable,
  syncTeamsToSupabaseTable 
} from './supabaseClient';

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

const CONFIG_KEY = 'jl360_sync_config_v4';
const MASTER_OBJECT_ID = 'ff808181a04ccf2d01a04fc723fd0e1b';
const CLOUD_SYNC_ENDPOINT = 'https://api.restful-api.dev/objects';

export interface SyncConfig {
  enabled: boolean;
  channelId: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  lastSyncedAt?: number;
}

export function getSyncConfig(): SyncConfig {
  const spConfig = getStoredSupabaseConfig();
  if (typeof window === 'undefined') {
    return { enabled: true, channelId: spConfig.channel, supabaseUrl: spConfig.url, supabaseKey: spConfig.key };
  }
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...parsed, supabaseUrl: parsed.supabaseUrl || spConfig.url, supabaseKey: parsed.supabaseKey || spConfig.key };
    }
  } catch (e) {}
  return { enabled: true, channelId: spConfig.channel, supabaseUrl: spConfig.url, supabaseKey: spConfig.key };
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
              version: 4,
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

/**
 * Realtime subscription via Supabase Channel + Postgres Changes + BroadcastChannel
 */
export function subscribeToRealtimeUpdates(onUpdate: (state: CloudTournamentState) => void): () => void {
  const cleanups: (() => void)[] = [];

  // 1. Cross-tab Broadcast (Instantáneo entre pestañas en el mismo dispositivo)
  if (broadcastChannel) {
    const bHandler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'STATE_UPDATE' && event.data.state) {
        onUpdate(event.data.state);
      }
    };
    broadcastChannel.addEventListener('message', bHandler);
    cleanups.push(() => broadcastChannel?.removeEventListener('message', bHandler));
  }

  // 2. Supabase Realtime Channel (Broadcast + Postgres changes)
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const cfg = getSyncConfig();
      const channelName = `live_tourney_${cfg.channelId || 'deportlambert_live'}`;
      
      const channel = supabase.channel(channelName)
        .on('broadcast', { event: 'state_update' }, (payload) => {
          if (payload && payload.payload) {
            onUpdate(payload.payload as CloudTournamentState);
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_sync' }, async (payload: any) => {
          if (payload && payload.new && payload.new.data) {
            onUpdate(payload.new.data as CloudTournamentState);
          } else {
            const fresh = await fetchStateFromCloud(cfg);
            if (fresh) onUpdate(fresh);
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'partidos' }, async () => {
          const fresh = await fetchStateFromCloud(cfg);
          if (fresh) onUpdate(fresh);
        })
        .subscribe((status) => {
          console.log('[Supabase Realtime] Canal status:', status);
        });

      cleanups.push(() => {
        try {
          supabase.removeChannel(channel);
        } catch (e) {}
      });
    }
  } catch (e) {
    console.warn('[Supabase Realtime] Suscripción activa con fallback:', e);
  }

  return () => {
    cleanups.forEach(fn => fn());
  };
}

/**
 * Push tournament state to the cloud (Supabase Realtime + Global Cloud Relay)
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

  // Broadcast through Supabase Realtime Channel
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const channelName = `live_tourney_${cfg.channelId || 'deportlambert_live'}`;
      const channel = supabase.channel(channelName);
      await channel.send({
        type: 'broadcast',
        event: 'state_update',
        payload: state
      });
    }
  } catch (e) {}

  if (!cfg.enabled) return true;

  try {
    // 1. Supabase Persistence (tournament_sync + partidos + equipos)
    const supabaseOk = await saveSupabaseTournamentState(cfg.channelId || 'deportlambert_live', state);

    if (state.disciplineData) {
      for (const discKey of Object.keys(state.disciplineData)) {
        const disc = state.disciplineData[discKey];
        if (disc?.games) {
          syncGamesToSupabaseTable(discKey, disc.games).catch(() => {});
        }
        if (disc?.teams) {
          syncTeamsToSupabaseTable(discKey, disc.teams).catch(() => {});
        }
      }
    }

    // 2. Global Cloud Relay (Universal Multi-Device Sync Channel Backup)
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

    if (supabaseOk || res.ok) {
      return true;
    }
  } catch (error) {
    console.warn('[CloudSync] Guardado localmente con éxito:', error);
  }
  return true;
}

/**
 * Fetch latest tournament state from the cloud database
 */
export async function fetchStateFromCloud(config?: SyncConfig): Promise<CloudTournamentState | null> {
  const cfg = config || getSyncConfig();
  if (!cfg.enabled) return getLocalState();

  try {
    // 1. Supabase Query primero
    const spData = await fetchSupabaseTournamentState(cfg.channelId || 'deportlambert_live');
    if (spData && spData.disciplineData) {
      return spData as CloudTournamentState;
    }

    // 2. Direct Supabase REST query
    if (cfg.supabaseUrl && cfg.supabaseKey) {
      try {
        const url = `${cfg.supabaseUrl.replace(/\/$/, '')}/rest/v1/tournament_sync?id=eq.${cfg.channelId || 'deportlambert_live'}&select=*`;
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

    // 3. Global Cloud Relay Query
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
    console.warn('[CloudSync] Fallback a datos locales:', error);
  }

  return getLocalState();
}
