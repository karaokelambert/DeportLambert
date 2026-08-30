"use client";

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from Environment Variables or configured default endpoint
const DEFAULT_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kwjoxqydwquztdjrlfxg.supabase.co';
const DEFAULT_SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3am94cXlkd3F1enRkanJsZnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4NTYwMDAsImV4cCI6MjAyNTQzMjAwMH0.sample_public_anon_key_for_broadcast';

const SUPABASE_CONFIG_KEY = 'jl360_supabase_config_v2';

export interface SupabaseConfig {
  url: string;
  key: string;
  channel: string;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  if (typeof window === 'undefined') {
    return { url: DEFAULT_SUPABASE_URL, key: DEFAULT_SUPABASE_KEY, channel: 'deportlambert_live' };
  }
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.key) return parsed;
    }
  } catch (e) {}
  return { url: DEFAULT_SUPABASE_URL, key: DEFAULT_SUPABASE_KEY, channel: 'deportlambert_live' };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {}
}

let cachedClient: SupabaseClient | null = null;
let currentConfigSig = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  const url = (config.url || DEFAULT_SUPABASE_URL || '').trim();
  const key = (config.key || DEFAULT_SUPABASE_KEY || '').trim();
  
  const sig = `${url}_${key}`;
  if (cachedClient && currentConfigSig === sig) {
    return cachedClient;
  }
  if (!url || !key) return null;
  try {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    currentConfigSig = sig;
    return cachedClient;
  } catch (e) {
    console.warn('[Supabase] Error inicializando cliente:', e);
    return null;
  }
}

// ── Helpers directos de Supabase para Tablas 'partidos', 'equipos', 'posiciones', 'tournament_sync' ──

export async function fetchSupabaseTournamentState(channelId: string = 'deportlambert_live'): Promise<any | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('tournament_sync')
      .select('data, updated_at')
      .eq('id', channelId)
      .maybeSingle();

    if (!error && data && data.data) {
      return data.data;
    }
  } catch (e) {
    console.warn('[Supabase] tournament_sync query falló:', e);
  }
  return null;
}

export async function saveSupabaseTournamentState(channelId: string = 'deportlambert_live', state: any): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client
      .from('tournament_sync')
      .upsert({
        id: channelId,
        data: state,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    return !error;
  } catch (e) {
    console.warn('[Supabase] Error en upsert tournament_sync:', e);
    return false;
  }
}

export async function syncGamesToSupabaseTable(discipline: string, games: any[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !games || games.length === 0) return false;
  try {
    const rows = games.map(g => ({
      id: `${discipline}_${g.id}`,
      discipline,
      home_team: g.homeTeam,
      away_team: g.awayTeam,
      home_score: g.homeScore || 0,
      away_score: g.awayScore || 0,
      home_quarters: g.homeQuarters || [0, 0, 0, 0],
      away_quarters: g.awayQuarters || [0, 0, 0, 0],
      current_quarter: g.currentQuarter || 1,
      date: g.date || '',
      time: g.time || '',
      location: g.location || '',
      phase: g.phase || '',
      status: g.status || 'Programado',
      updated_at: new Date().toISOString()
    }));

    const { error } = await client
      .from('partidos')
      .upsert(rows, { onConflict: 'id' });

    return !error;
  } catch (e) {
    return false;
  }
}

export async function syncTeamsToSupabaseTable(discipline: string, teams: any[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !teams || teams.length === 0) return false;
  try {
    const rows = teams.map(t => ({
      id: `${discipline}_${t.id}`,
      discipline,
      name: t.name,
      delegado: t.delegado || '',
      telefono: t.telefono || '',
      group_name: t.group || 'Grupo A',
      logo_url: t.logoUrl || '',
      jugadores: t.jugadores || [],
      delegate_pin: t.delegatePin || '0000',
      updated_at: new Date().toISOString()
    }));

    const { error } = await client
      .from('equipos')
      .upsert(rows, { onConflict: 'id' });

    return !error;
  } catch (e) {
    return false;
  }
}
