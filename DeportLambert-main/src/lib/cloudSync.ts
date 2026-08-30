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
  syncTeamsToSupabaseTable,
  syncStandingsToSupabaseTable
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

const PRIMARY_STORAGE_KEY = 'jl360_cloud_state_v4';

const CONFIG_KEY = 'jl360_sync_config_v4';

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
      if (parsed.supabaseKey && parsed.supabaseKey.startsWith('eyJ') && parsed.supabaseUrl?.includes('nhurcieffcazroqfarrh')) {
        return { ...parsed, supabaseUrl: parsed.supabaseUrl || spConfig.url, supabaseKey: parsed.supabaseKey || spConfig.key };
      }
    }
  } catch (e) {}
  const freshSync: SyncConfig = { enabled: true, channelId: spConfig.channel, supabaseUrl: spConfig.url, supabaseKey: spConfig.key };
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(freshSync));
  } catch (e) {}
  return freshSync;
}

export function saveSyncConfig(config: SyncConfig) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {}
}

export function getLocalState(): CloudTournamentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PRIMARY_STORAGE_KEY) || localStorage.getItem('jl360_cloud_state_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.disciplineData) return parsed;
    }
  } catch (e) {}
  return null;
}

export function saveLocalState(state: CloudTournamentState) {
  if (typeof window === 'undefined' || !state) return;
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(PRIMARY_STORAGE_KEY, serialized);
    localStorage.setItem('jl360_cloud_state_v2', serialized);
  } catch (e) {}
}

// Cross-tab Broadcast Channel
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('jl360_sync_bus');
  } catch (e) {}
}

let activeRealtimeChannel: any = null;

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
      
      const channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: false }
        }
      })
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
        .on('postgres_changes', { event: '*', schema: 'public', table: 'equipos' }, async () => {
          const fresh = await fetchStateFromCloud(cfg);
          if (fresh) onUpdate(fresh);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posiciones' }, async () => {
          const fresh = await fetchStateFromCloud(cfg);
          if (fresh) onUpdate(fresh);
        })
        .subscribe((status) => {
          console.log('[Supabase Realtime] Canal status:', status);
        });

      activeRealtimeChannel = channel;

      cleanups.push(() => {
        try {
          supabase.removeChannel(channel);
          if (activeRealtimeChannel === channel) {
            activeRealtimeChannel = null;
          }
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
    if (activeRealtimeChannel) {
      await activeRealtimeChannel.send({
        type: 'broadcast',
        event: 'state_update',
        payload: state
      });
    } else {
      const supabase = getSupabaseClient();
      if (supabase) {
        const channelName = `live_tourney_${cfg.channelId || 'deportlambert_live'}`;
        const channel = supabase.channel(channelName, { config: { broadcast: { self: false } } });
        channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.send({
              type: 'broadcast',
              event: 'state_update',
              payload: state
            });
          }
        });
      }
    }
  } catch (e) {}

  if (!cfg.enabled) return true;

  try {
    // 1. Supabase Persistence (tournament_sync + partidos + equipos + posiciones)
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
        if (disc?.teams && disc?.games) {
          syncStandingsToSupabaseTable(discKey, disc.teams, disc.games, disc.groups || ['Grupo A', 'Grupo B']).catch(() => {});
        }
      }
    }

    return supabaseOk;
  } catch (error) {
    console.warn('[CloudSync] Guardado localmente con éxito:', error);
  }
  return true;
}

/**
 * Fetch latest tournament state from the cloud database (Supabase)
 */
export async function fetchStateFromCloud(config?: SyncConfig): Promise<CloudTournamentState | null> {
  const cfg = config || getSyncConfig();
  if (!cfg.enabled) return getLocalState();

  try {
    // 1. Supabase Query primero
    const spData = await fetchSupabaseTournamentState(cfg.channelId || 'deportlambert_live');
    if (spData && spData.disciplineData && Object.keys(spData.disciplineData).length > 0) {
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
          if (list && list[0] && list[0].data && list[0].data.disciplineData) {
            return list[0].data as CloudTournamentState;
          }
        }
      } catch (e) {}
    }
  } catch (error) {
    console.warn('[CloudSync] Fallback a datos locales:', error);
  }

  return getLocalState();
}
