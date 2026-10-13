#!/usr/bin/env node
/**
 * Script de Sincronización y Exportación de Base de Datos para JL Sports Club 360
 * Permite sincronizar y exportar datos/logos entre la PC local, Supabase y GitHub Pages.
 * 
 * Uso:
 *   node scripts/sync-database.mjs --export   (Descarga el estado actual de Supabase a archivo local)
 *   node scripts/sync-database.mjs --push     (Sube el archivo local a Supabase)
 *   node scripts/sync-database.mjs            (Sincronización bidireccional y verificación de estado)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://giqvkcgfxdffxpzklxri.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpcXZrY2dmeGRmZnhwemtseHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NjU4OTgsImV4cCI6MjEwMDI0MTg5OH0.9gzYz5L3eiOLd-J4TjTM4VKAcuT_O1Ya8prU85X_2rM';
const CHANNEL_ID = 'deportlambert_live';

const seedFilePublic = path.join(rootDir, 'DeportLambert-main', 'public', 'database_seed.json');
const seedFileRoot = path.join(rootDir, 'database_seed.json');

async function exportDatabase() {
  console.log(`[Sync-DB] Conectando a Supabase (${SUPABASE_URL})...`);
  try {
    const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/tournament_sync?id=eq.${CHANNEL_ID}&select=*&_t=${Date.now()}`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data || data.length === 0 || !data[0].data) {
      console.warn('[Sync-DB] Advertencia: No se encontró registro en tournament_sync con id ' + CHANNEL_ID);
      return;
    }

    const payload = data[0].data;
    const jsonStr = JSON.stringify(payload, null, 2);

    fs.writeFileSync(seedFilePublic, jsonStr, 'utf-8');
    fs.writeFileSync(seedFileRoot, jsonStr, 'utf-8');

    console.log(`[Sync-DB] ✓ Base de datos exportada exitosamente.`);
    console.log(`  - Guardado en: ${seedFilePublic}`);
    console.log(`  - Guardado en: ${seedFileRoot}`);
  } catch (err) {
    console.error('[Sync-DB] Error exportando base de datos:', err.message);
  }
}

async function pushDatabase() {
  if (!fs.existsSync(seedFileRoot) && !fs.existsSync(seedFilePublic)) {
    console.error('[Sync-DB] No se encontró archivo de respaldo database_seed.json para subir.');
    process.exit(1);
  }

  const src = fs.existsSync(seedFileRoot) ? seedFileRoot : seedFilePublic;
  console.log(`[Sync-DB] Leyendo datos locales desde ${src}...`);
  const raw = fs.readFileSync(src, 'utf-8');
  const payload = JSON.parse(raw);

  payload.updatedAt = Date.now();
  payload.version = Date.now();

  console.log(`[Sync-DB] Transmitiendo a Supabase channel: ${CHANNEL_ID}...`);
  try {
    const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/tournament_sync`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: CHANNEL_ID,
        data: payload,
        updated_at: new Date().toISOString()
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    console.log(`[Sync-DB] ✓ Base de datos y logos sincronizados a Supabase con éxito.`);
  } catch (err) {
    console.error('[Sync-DB] Error al subir a Supabase:', err.message);
  }
}

const arg = process.argv[2];
if (arg === '--push') {
  pushDatabase();
} else {
  exportDatabase();
}
