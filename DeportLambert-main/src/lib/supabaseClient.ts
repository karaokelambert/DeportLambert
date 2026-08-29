"use client";

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from Environment Variables or pre-configured cloud endpoint
const ENV_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kwjoxqydwquztdjrlfxg.supabase.co';
const ENV_SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3am94cXlkd3F1enRkanJsZnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4NTYwMDAsImV4cCI6MjAyNTQzMjAwMH0.sample_public_anon_key_for_broadcast';

const SUPABASE_CONFIG_KEY = 'jl360_supabase_config_v2';

export interface SupabaseConfig {
  url: string;
  key: string;
  channel: string;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  if (typeof window === 'undefined') {
    return { url: ENV_SUPABASE_URL, key: ENV_SUPABASE_KEY, channel: 'deportlambert_live' };
  }
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.key) return parsed;
    }
  } catch (e) {}
  return { url: ENV_SUPABASE_URL, key: ENV_SUPABASE_KEY, channel: 'deportlambert_live' };
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
  const sig = `${config.url}_${config.key}`;
  if (cachedClient && currentConfigSig === sig) {
    return cachedClient;
  }
  if (!config.url || !config.key) return null;
  try {
    cachedClient = createClient(config.url, config.key, {
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
      });

    return !error;
  } catch (e) {
    console.warn('[Supabase] Error en upsert tournament_sync:', e);
    return false;
  }
}
