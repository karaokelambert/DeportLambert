"use client";

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from Environment Variables or configured default endpoint
const DEFAULT_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nhurcieffcazroqfarrh.supabase.co';
const DEFAULT_SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odXJjaWVmZmNhenJvcWZhcnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMDI2MTgsImV4cCI6MjEwMzY3ODYxOH0.EF6MjOtR4kqVXPRJtspq0v2mpF-Kq-IwH3zZ5jBNKNg';

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
      if (parsed.url && parsed.key && parsed.key.startsWith('eyJ') && parsed.url.includes('nhurcieffcazroqfarrh')) {
        return parsed;
      }
    }
  } catch (e) {}
  const freshConfig: SupabaseConfig = { url: DEFAULT_SUPABASE_URL, key: DEFAULT_SUPABASE_KEY, channel: 'deportlambert_live' };
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(freshConfig));
  } catch (e) {}
  return freshConfig;
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

export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<{ ok: boolean; message: string }> {
  const url = (customUrl || getStoredSupabaseConfig().url || DEFAULT_SUPABASE_URL || '').trim();
  const key = (customKey || getStoredSupabaseConfig().key || DEFAULT_SUPABASE_KEY || '').trim();

  if (!url || !key) {
    return { ok: false, message: 'Falta la URL o la API Key de Supabase.' };
  }

  if (key.startsWith('Sb_publishable') || !key.startsWith('eyJ')) {
    return { 
      ok: false, 
      message: 'La clave proporcionada no es válida para PostgREST/Realtime. En Supabase debes usar la clave "anon public" (empieza con "eyJhbGciOi..."). Encuéntrala en tu Dashboard de Supabase en Project Settings > API > Project API keys > anon.' 
    };
  }

  try {
    const tempClient = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await tempClient.from('tournament_sync').select('id').limit(1);
    if (error) {
      if (error.message && (error.message.includes('Invalid API key') || error.message.includes('JWT') || error.message.includes('apiKey'))) {
        return { 
          ok: false, 
          message: 'Error de autenticación en Supabase: Clave API no válida. Debe ser la clave anon pública (JWT).' 
        };
      }
      if (error.message && error.message.includes('does not exist')) {
        return { 
          ok: true, 
          message: 'Conectado a Supabase correctamente. Recuerda ejecutar el script SQL de creación de tablas en el SQL Editor.' 
        };
      }
      return { ok: false, message: `Error Supabase: ${error.message}` };
    }
    return { ok: true, message: '¡Conexión y tablas de Supabase verificadas exitosamente!' };
  } catch (e: any) {
    return { ok: false, message: `Error de conexión: ${e?.message || e}` };
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
      logo_url: t.logoUrl || t.logo_url || t.logo || t.image_url || '',
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

export async function syncPlayersToSupabaseTable(discipline: string, teams: any[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !teams || teams.length === 0) return false;
  try {
    const playerRows: any[] = [];
    teams.forEach(team => {
      if (Array.isArray(team.jugadores)) {
        team.jugadores.forEach((playerName: string, idx: number) => {
          if (playerName && playerName.trim()) {
            playerRows.push({
              id: `${discipline}_${team.id}_p${idx + 1}`,
              discipline,
              team_id: `${discipline}_${team.id}`,
              team_name: team.name,
              name: playerName.trim(),
              player_number: idx + 1,
              position: '',
              updated_at: new Date().toISOString()
            });
          }
        });
      }
    });

    if (playerRows.length === 0) return true;

    const { error } = await client
      .from('jugadores')
      .upsert(playerRows, { onConflict: 'id' });

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

// Canal persistente compartido para Broadcast de ultra-baja latencia (< 500ms)
const activeBroadcastChannels: Record<string, any> = {};

export function getBroadcastChannel(discipline: string = 'baloncesto') {
  const client = getSupabaseClient();
  if (!client) return null;
  const channelName = `${discipline}-live`;
  
  if (activeBroadcastChannels[channelName]) {
    return activeBroadcastChannels[channelName];
  }

  const channel = client.channel(channelName, {
    config: {
      broadcast: { ack: false, self: true },
    }
  });

  channel.subscribe((status: string) => {
    console.log(`[Supabase Broadcast] Canal ${channelName} suscripción:`, status);
  });

  activeBroadcastChannels[channelName] = channel;
  return channel;
}

/**
 * Emisión instantánea por Broadcast WebSocket (sub-segundo / 0.5s)
 */
export async function broadcastScoreUpdate(discipline: string, payload: any) {
  try {
    const channel = getBroadcastChannel(discipline);
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'score-update',
        payload: {
          ...payload,
          discipline,
          timestamp: Date.now(),
        }
      });
      console.log('[Supabase Broadcast] Emitido score-update instantáneo:', payload.gameId || payload.id);
    }
  } catch (err) {
    console.warn('[Supabase Broadcast] Error al emitir score-update:', err);
  }
}

/**
 * Actualiza un único partido en Supabase directamente con verificación de respuesta y Broadcast instantáneo
 */
export async function updateSingleGameInSupabase(discipline: string, game: any): Promise<{ ok: boolean; status?: number; error?: any }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: new Error('No Supabase client initialized') };
  
  const rawId = String(game.id || '').replace(/^[a-z0-9]+_/, '');
  const primaryId = String(game.id || '').includes('_') ? game.id : `${discipline}_${game.id}`;
  
  const homeScore = Number(game.homeScore !== undefined ? game.homeScore : (game.marcador_local || 0));
  const awayScore = Number(game.awayScore !== undefined ? game.awayScore : (game.marcador_visitante || 0));
  const homeQuarters = Array.isArray(game.homeQuarters) ? game.homeQuarters : (game.cuartos_local || [0, 0, 0, 0]);
  const awayQuarters = Array.isArray(game.awayQuarters) ? game.awayQuarters : (game.cuartos_visitante || [0, 0, 0, 0]);
  const currentQuarter = Number(game.currentQuarter || 1);
  const status = game.status || game.estado || 'Programado';
  const nowIso = new Date().toISOString();

  // 1. Emitir inmediatamente por el canal de Broadcast para sincronización instantánea sub-segundo (< 0.5s)
  broadcastScoreUpdate(discipline, {
    gameId: rawId,
    id: primaryId,
    homeTeam: game.homeTeam,
    awayTeam: game.awayTeam,
    homeScore,
    awayScore,
    homeQuarters,
    awayQuarters,
    currentQuarter,
    status,
    discipline,
  });

  try {
    // 2. Ejecutar UPDATE asíncrono real en tabla 'partidos'
    const updateStandard: any = {
      home_score: homeScore,
      away_score: awayScore,
      home_quarters: homeQuarters,
      away_quarters: awayQuarters,
      current_quarter: currentQuarter,
      status: status,
      updated_at: nowIso,
    };

    let { data, error } = await client
      .from('partidos')
      .update(updateStandard)
      .eq('id', primaryId)
      .select();

    // Si no se afectaron filas por primaryId, intentar con rawId
    if (!error && (!data || data.length === 0)) {
      const resRaw = await client
        .from('partidos')
        .update(updateStandard)
        .eq('id', rawId)
        .select();
      
      if (!resRaw.error && resRaw.data && resRaw.data.length > 0) {
        data = resRaw.data;
      }
    }

    // Si falló por nombres de columnas en español, intentar con esquema alternativo en español
    if (error && error.message && (error.message.includes('column') || (error as any).code === '42703')) {
      const updateSpanish: any = {
        marcador_local: homeScore,
        marcador_visitante: awayScore,
        q1_local: Number(homeQuarters[0] || 0),
        q2_local: Number(homeQuarters[1] || 0),
        q3_local: Number(homeQuarters[2] || 0),
        q4_local: Number(homeQuarters[3] || 0),
        q1_vis: Number(awayQuarters[0] || 0),
        q2_vis: Number(awayQuarters[1] || 0),
        q3_vis: Number(awayQuarters[2] || 0),
        q4_vis: Number(awayQuarters[3] || 0),
        cuartos_local: homeQuarters,
        cuartos_visitante: awayQuarters,
        cuartos: [homeQuarters, awayQuarters],
        estado: status,
        updated_at: nowIso,
      };

      const resSp = await client
        .from('partidos')
        .update(updateSpanish)
        .eq('id', primaryId)
        .select();
      
      if (!resSp.error && resSp.data && resSp.data.length > 0) {
        data = resSp.data;
        error = null;
      } else if (!resSp.error) {
        const resSpRaw = await client
          .from('partidos')
          .update(updateSpanish)
          .eq('id', rawId)
          .select();
        data = resSpRaw.data;
        error = resSpRaw.error;
      } else {
        error = resSp.error;
      }
    }

    // Si todavía no se afectaron filas (partido no insertado previamente en la tabla), hacer upsert completo
    if (!error && (!data || data.length === 0)) {
      const upsertRow: any = {
        id: primaryId,
        discipline,
        home_team: game.homeTeam,
        away_team: game.awayTeam,
        home_score: homeScore,
        away_score: awayScore,
        home_quarters: homeQuarters,
        away_quarters: awayQuarters,
        current_quarter: currentQuarter,
        date: game.date || '',
        time: game.time || '',
        location: game.location || '',
        phase: game.phase || '',
        status: status,
        updated_at: nowIso,
      };

      const upsertRes = await client
        .from('partidos')
        .upsert(upsertRow, { onConflict: 'id' })
        .select();

      if (!upsertRes.error) {
        console.log('[Supabase Direct] Partido persistido vía upsert:', primaryId);
        return { ok: true, status: 200 };
      }
      error = upsertRes.error;
    }

    if (error) {
      console.error('[Supabase Direct] Error al persistir en tabla partidos:', error);
      return { ok: false, error };
    }

    console.log('[Supabase Direct] Partido actualizado exitosamente en BD:', primaryId);
    return { ok: true, status: 200 };
  } catch (err: any) {
    console.error('[Supabase Direct] Excepción al persistir:', err);
    return { ok: false, error: err };
  }
}

/**
 * Actualiza un único equipo en Supabase directamente con su logo_url
 */
export async function updateSingleTeamInSupabase(discipline: string, team: any): Promise<{ ok: boolean; error?: any }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'No Supabase client' };
  
  const primaryId = team.id.includes('_') ? team.id : `${discipline}_${team.id}`;
  
  try {
    const row: any = {
      id: primaryId,
      discipline,
      name: team.name,
      delegado: team.delegado || '',
      telefono: team.telefono || '',
      group_name: team.group || 'Grupo A',
      logo_url: team.logoUrl || team.logo_url || team.logo || '',
      jugadores: team.jugadores || [],
      delegate_pin: team.delegatePin || team.delegate_pin || '1234',
      updated_at: new Date().toISOString()
    };

    const res = await client
      .from('equipos')
      .upsert(row, { onConflict: 'id' });

    return { ok: !res.error, error: res.error };
  } catch (e) {
    return { ok: false, error: e };
  }
}

/**
 * Consulta directa de datos de tablas Supabase ('equipos' y 'partidos')
 * Embebe directamente los logos de los equipos en la consulta de partidos mediante JOIN relacional
 */
export async function fetchSupabaseDirectData(disciplineId: string = 'baloncesto'): Promise<{ teams: any[]; games: any[] } | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    // 1. Obtener equipos
    const teamsRes = await client.from('equipos').select('*').eq('discipline', disciplineId);
    
    // 2. Intentar consulta con JOIN relacional explícito para partidos con logos embebidos
    let gamesRaw: any[] = [];
    const joinRes = await client
      .from('partidos')
      .select(`
        *,
        equipo_local:equipos!id_local(id, name, logo_url, logo),
        equipo_visitante:equipos!id_visitante(id, name, logo_url, logo)
      `)
      .eq('discipline', disciplineId);

    if (!joinRes.error && joinRes.data && joinRes.data.length > 0) {
      gamesRaw = joinRes.data;
    } else {
      // Fallback a select general de partidos
      const fallbackRes = await client.from('partidos').select('*').eq('discipline', disciplineId);
      gamesRaw = fallbackRes.data || [];
    }

    const teams = (teamsRes.data || []).map(t => ({
      id: t.id.replace(`${disciplineId}_`, ''),
      name: t.name,
      delegado: t.delegado || '',
      telefono: t.telefono || '',
      group: t.group_name || 'Grupo A',
      logoUrl: t.logo_url || t.logo || '',
      jugadores: t.jugadores || [],
      delegatePin: t.delegate_pin || '1234',
    }));

    // Mapa de logos de equipos para resolución ultra-rápida y defensiva
    const teamLogoMap: Record<string, string> = {};
    teams.forEach(t => {
      if (t.name) teamLogoMap[t.name.toLowerCase().trim()] = t.logoUrl;
      if (t.id) teamLogoMap[t.id.toLowerCase().trim()] = t.logoUrl;
    });

    const games = gamesRaw.map(g => {
      const homeName = g.home_team || g.equipo_local?.name || (typeof g.equipo_local === 'string' ? g.equipo_local : '') || '';
      const awayName = g.away_team || g.equipo_visitante?.name || (typeof g.equipo_visitante === 'string' ? g.equipo_visitante : '') || '';

      const logoLocal = g.equipo_local?.logo_url || g.equipo_local?.logo || g.logo_local || g.home_team_logo || g.home_logo || teamLogoMap[homeName.toLowerCase().trim()] || teamLogoMap[g.id_local?.toLowerCase()?.trim()] || '';
      const logoVisitante = g.equipo_visitante?.logo_url || g.equipo_visitante?.logo || g.logo_visitante || g.away_team_logo || g.away_logo || teamLogoMap[awayName.toLowerCase().trim()] || teamLogoMap[g.id_visitante?.toLowerCase()?.trim()] || '';

      const homeQuarters = Array.isArray(g.home_quarters) && g.home_quarters.length === 4
        ? g.home_quarters
        : Array.isArray(g.cuartos_local) && g.cuartos_local.length === 4
        ? g.cuartos_local
        : (g.q1_local !== undefined || g.q2_local !== undefined || g.q3_local !== undefined || g.q4_local !== undefined)
        ? [Number(g.q1_local || 0), Number(g.q2_local || 0), Number(g.q3_local || 0), Number(g.q4_local || 0)]
        : [0, 0, 0, 0];

      const awayQuarters = Array.isArray(g.away_quarters) && g.away_quarters.length === 4
        ? g.away_quarters
        : Array.isArray(g.cuartos_visitante) && g.cuartos_visitante.length === 4
        ? g.cuartos_visitante
        : (g.q1_vis !== undefined || g.q2_vis !== undefined || g.q3_vis !== undefined || g.q4_vis !== undefined)
        ? [Number(g.q1_vis || 0), Number(g.q2_vis || 0), Number(g.q3_vis || 0), Number(g.q4_vis || 0)]
        : [0, 0, 0, 0];

      return {
        id: g.id.replace(`${disciplineId}_`, ''),
        homeTeam: homeName,
        awayTeam: awayName,
        homeScore: g.home_score !== undefined ? g.home_score : (g.marcador_local !== undefined ? g.marcador_local : 0),
        awayScore: g.away_score !== undefined ? g.away_score : (g.marcador_visitante !== undefined ? g.marcador_visitante : 0),
        homeQuarters,
        awayQuarters,
        currentQuarter: g.current_quarter || 1,
        date: g.date || g.fecha || '',
        time: g.time || g.hora || '',
        location: g.location || g.lugar || '',
        phase: g.phase || '',
        status: g.status || g.estado || 'Programado',
        equipo_local: g.equipo_local || { id: g.id_local || '', name: homeName, logo_url: logoLocal, logo: logoLocal },
        equipo_visitante: g.equipo_visitante || { id: g.id_visitante || '', name: awayName, logo_url: logoVisitante, logo: logoVisitante },
        logo_local: logoLocal,
        logo_visitante: logoVisitante,
        homeTeamLogo: logoLocal,
        awayTeamLogo: logoVisitante,
      };
    });

    return { teams, games };
  } catch (e) {
    console.warn('[Supabase] Error en fetchSupabaseDirectData:', e);
  }
  return null;
}
