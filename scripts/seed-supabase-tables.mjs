import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://giqvkcgfxdffxpzklxri.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpcXZrY2dmeGRmZnhwemtseHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NjU4OTgsImV4cCI6MjEwMDI0MTg5OH0.9gzYz5L3eiOLd-J4TjTM4VKAcuT_O1Ya8prU85X_2rM';

const seedFile = path.join(rootDir, 'database_seed.json');
const raw = fs.readFileSync(seedFile, 'utf-8');
const data = JSON.parse(raw);

async function upsertTable(tableName, rows) {
  if (!rows || rows.length === 0) return;
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${tableName}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(rows)
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error(`Error upserting ${tableName}:`, res.status, errText);
  } else {
    console.log(`✓ Sincronizados ${rows.length} registros en tabla '${tableName}'`);
  }
}

async function run() {
  console.log('Sincronizando tablas relacionales de Supabase...');
  const disciplineData = data.disciplineData || {};

  for (const [discKey, disc] of Object.entries(disciplineData)) {
    console.log(`\nProcesando disciplina: ${discKey}`);
    
    // 1. Equipos
    if (disc.teams && disc.teams.length > 0) {
      const teamRows = disc.teams.map(t => ({
        id: `${discKey}_${t.id}`,
        discipline: discKey,
        name: t.name,
        delegado: t.delegado || '',
        telefono: t.telefono || '',
        group_name: t.group || 'Grupo A',
        logo_url: t.logoUrl || t.logo || '',
        jugadores: t.jugadores || [],
        delegate_pin: t.delegatePin || '0000',
        updated_at: new Date().toISOString()
      }));
      await upsertTable('equipos', teamRows);

      // Jugadores
      const playerRows = [];
      disc.teams.forEach(t => {
        if (Array.isArray(t.jugadores)) {
          t.jugadores.forEach((pName, idx) => {
            if (pName && pName.trim()) {
              playerRows.push({
                id: `${discKey}_${t.id}_p${idx + 1}`,
                discipline: discKey,
                team_id: `${discKey}_${t.id}`,
                team_name: t.name,
                name: pName.trim(),
                player_number: idx + 1,
                position: '',
                updated_at: new Date().toISOString()
              });
            }
          });
        }
      });
      if (playerRows.length > 0) {
        await upsertTable('jugadores', playerRows);
      }
    }

    // 2. Partidos
    if (disc.games && disc.games.length > 0) {
      const gameRows = disc.games.map(g => ({
        id: `${discKey}_${g.id}`,
        discipline: discKey,
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
      await upsertTable('partidos', gameRows);
    }
  }

  console.log('\n✅ ¡Todas las tablas relacionales de Supabase han sido pobladas con éxito!');
}

run().catch(console.error);
