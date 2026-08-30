"use client";

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from Environment Variables or configured default endpoint
const DEFAULT_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nhurcieffcazroqfarrh.supabase.co';
const DEFAULT_SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'Sb_publishable_mPalpF6GtAfQu1h21M7jrA_Iq8-ccUZ';

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

export async function syncStandingsToSupabaseTable(discipline: string, teams: any[], games: any[], groups: string[] = ['Grupo A', 'Grupo B']): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !teams || teams.length === 0) return false;
  try {
    const groupMap: Record<string, Record<string, any>> = {};
    groups.forEach(g => { groupMap[g] = {}; });

    teams.forEach(team => {
      const g = team.group && groups.includes(team.group) ? team.group : groups[0] || 'Grupo A';
      if (!groupMap[g]) groupMap[g] = {};
      groupMap[g][team.name] = { 
        id: `${discipline}_${g.replace(/\s+/g, '_')}_${team.name.replace(/\s+/g, '_')}`,
        discipline,
        group_name: g,
        team_name: team.name, 
        jj: 0, 
        jg: 0, 
        jp: 0, 
        pf: 0, 
        pc: 0, 
        dif: 0, 
        ptos: 0 
      };
    });

    (games || []).forEach(game => {
      if (game.status === 'Finalizado') {
        const homeTeamObj = teams.find(t => t.name === game.homeTeam);
        const awayTeamObj = teams.find(t => t.name === game.awayTeam);
        const homeGroup = homeTeamObj?.group && groups.includes(homeTeamObj.group) ? homeTeamObj.group : groups[0] || 'Grupo A';
        const awayGroup = awayTeamObj?.group && groups.includes(awayTeamObj.group) ? awayTeamObj.group : groups[0] || 'Grupo A';

        const homeStat = groupMap[homeGroup]?.[game.homeTeam];
        const awayStat = groupMap[awayGroup]?.[game.awayTeam];

        if (homeStat) {
          homeStat.jj += 1;
          homeStat.pf += (game.homeScore || 0);
          homeStat.pc += (game.awayScore || 0);
          if ((game.homeScore || 0) > (game.awayScore || 0)) {
            homeStat.jg += 1;
            homeStat.ptos += 2;
          } else {
            homeStat.jp += 1;
            homeStat.ptos += 1;
          }
          homeStat.dif = homeStat.pf - homeStat.pc;
        }

        if (awayStat) {
          awayStat.jj += 1;
          awayStat.pf += (game.awayScore || 0);
          awayStat.pc += (game.homeScore || 0);
          if ((game.awayScore || 0) > (game.homeScore || 0)) {
            awayStat.jg += 1;
            awayStat.ptos += 2;
          } else {
            awayStat.jp += 1;
            awayStat.ptos += 1;
          }
          awayStat.dif = awayStat.pf - awayStat.pc;
        }
      }
    });

    const rows: any[] = [];
    Object.values(groupMap).forEach(teamsInGroup => {
      Object.values(teamsInGroup).forEach(stat => {
        rows.push({
          ...stat,
          updated_at: new Date().toISOString()
        });
      });
    });

    if (rows.length === 0) return true;

    const { error } = await client
      .from('posiciones')
      .upsert(rows, { onConflict: 'id' });

    return !error;
  } catch (e) {
    return false;
  }
}
