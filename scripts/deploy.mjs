#!/usr/bin/env node
/**
 * Script de Despliegue Automatizado para JL Sports Club 360
 * Realiza:
 * 1. Build estático de Next.js (export a DeportLambert-main/out).
 * 2. Copia de artefactos generados a la raíz del repositorio para GitHub Pages.
 * 3. Verificación de versión v11 de Service Worker en todos los directorios.
 * 4. Commit y Push a origin main en GitHub.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const appDir = path.join(rootDir, 'DeportLambert-main');
const outDir = path.join(appDir, 'out');

function run(cmd, cwd = rootDir) {
  console.log(`\n> [Deploy] ${cmd} (en ${cwd})`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function main() {
  console.log('=====================================================');
  console.log('🚀 Iniciando Despliegue de JL Sports Club 360 (v11)');
  console.log('=====================================================');

  // 1. Asegurar database_seed.json
  if (fs.existsSync(path.join(appDir, 'public', 'database_seed.json'))) {
    fs.copyFileSync(
      path.join(appDir, 'public', 'database_seed.json'),
      path.join(rootDir, 'database_seed.json')
    );
  }

  // 2. Compilar aplicación Next.js
  console.log('\n[1/4] Compilando aplicación Next.js en export estático...');
  run('npm run build', appDir);

  // 3. Sincronizar artefactos de out a la raíz para GitHub Pages
  console.log('\n[2/4] Copiando archivos de out/ a la raíz del repositorio...');
  if (fs.existsSync(outDir)) {
    copyRecursiveSync(outDir, rootDir);
    console.log('✓ Artefactos copiados a la raíz.');
  } else {
    console.error('❌ Error: out/ no existe tras el build.');
    process.exit(1);
  }

  // 4. Asegurar versión de sw.js en todas las rutas
  console.log('\n[3/4] Verificando versión de Service Worker (jl-sports-hub-v11)...');
  const swPaths = [
    path.join(rootDir, 'sw.js'),
    path.join(appDir, 'public', 'sw.js'),
    path.join(appDir, 'out', 'sw.js')
  ];

  swPaths.forEach(swPath => {
    if (fs.existsSync(swPath)) {
      let content = fs.readFileSync(swPath, 'utf-8');
      if (!content.includes("'jl-sports-hub-v11'")) {
        content = content.replace(/CACHE_NAME\s*=\s*['"][^'"]+['"]/, "CACHE_NAME = 'jl-sports-hub-v11'");
        fs.writeFileSync(swPath, content, 'utf-8');
        console.log(`✓ Actualizada versión a jl-sports-hub-v11 en: ${swPath}`);
      }
    }
  });

  // 5. Git Commit y Push
  console.log('\n[4/4] Publicando cambios en GitHub Pages (origin main)...');
  try {
    run('git add -A');
    const status = execSync('git status --porcelain', { cwd: rootDir }).toString();
    if (status.trim().length > 0) {
      run('git commit -m "release: actualizar a jl-sports-hub-v11 con invalidación de caché y sincronización de base de datos"');
      run('git push origin main');
      console.log('\n✅ ¡Despliegue completado con éxito a origin main!');
      console.log('GitHub Pages actualizará los cambios y el Service Worker v11 invalidará la caché móvil de inmediato.');
    } else {
      console.log('ℹ️ No hay cambios pendientes para commitear.');
      run('git push origin main');
    }
  } catch (err) {
    console.error('Error durante git commit / push:', err.message);
    process.exit(1);
  }
}

main();
