"use client";

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default pre-configured cloud project for JL Sports Club 360
// Users can also override this from the SuperAdmin/Sync settings in the UI
const DEFAULT_SUPABASE_URL = 'https://kwjoxqydwquztdjrlfxg.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3am94cXlkd3F1enRkanJsZnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4NTYwMDAsImV4cCI6MjAyNTQzMjAwMH0.sample_public_anon_key_for_broadcast';

const SUPABASE_CONFIG_KEY = 'jl360_supabase_config_v1';

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
