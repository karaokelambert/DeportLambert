"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  ArrowLeft,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import AdminDashboardModule from '@/components/AdminDashboardModule';

// Datos iniciales en modo lectura para la ruta /admin/dashboard
const initialTeams = [
  { id: '1', name: 'Vikingos',     delegado: 'José Fuentes',     telefono: '0414-1234567', jugadores: ['José Alonso', 'Manuel Vélix', 'Daniel Cruz', 'Roberto Núñez'] },
  { id: '2', name: 'Motorratones', delegado: 'Manuel Fernández',  telefono: '0412-7654321', jugadores: ['Mario Molino', 'Pedro García', 'Daniel García', 'Luis Maestre'] },
  { id: '3', name: 'ABC Caripito', delegado: 'Gerson Tamoy',     telefono: '0416-9998877', jugadores: ['Eric Lamberg', 'Fabián Perdomo', 'Daniel Álvarez', 'Bryan Ortiz'] },
  { id: '4', name: 'Halcones',     delegado: 'Jesús Mondaraín',  telefono: '0424-5554433', jugadores: ['Daniel Montaraín', 'Pedro Casas', 'Manuel Véliz', 'Simón Acanto'] },
  { id: '5', name: 'CIBAPAC',      delegado: 'Andrés López',     telefono: '0414-0001122', jugadores: ['Luis Pérez', 'Carlos Rivas'] },
  { id: '6', name: 'Spartans',     delegado: 'Luis Guerra',      telefono: '0412-3334455', jugadores: ['Kevin Rivera', 'Juan Díaz'] },
];

const initialGames = [
  { id: '1', homeTeam: 'Vikingos',     awayTeam: 'Motorratones', homeScore: 84, awayScore: 72, date: '2026-06-14', time: '19:30', location: 'Cancha Principal',  status: 'Finalizado' as const },
  { id: '2', homeTeam: 'ABC Caripito', awayTeam: 'Halcones',     homeScore: 0,  awayScore: 0,  date: '2026-06-15', time: '18:00', location: 'Gimnasio Cubierto', status: 'Programado' as const },
  { id: '3', homeTeam: 'Vikingos',     awayTeam: 'Halcones',     homeScore: 0,  awayScore: 0,  date: '2026-06-16', time: '20:00', location: 'Cancha Principal',  status: 'Programado' as const },
  { id: '4', homeTeam: 'Motorratones', awayTeam: 'ABC Caripito', homeScore: 0,  awayScore: 0,  date: '2026-06-17', time: '19:00', location: 'Gimnasio Cubierto', status: 'Programado' as const },
];

export default function AdminDashboardPage() {
  const [teams] = useState(initialTeams);
  const [games] = useState(initialGames);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-black uppercase text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 px-3 py-2 rounded-xl transition-all border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la App Principal
          </Link>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center shadow-md">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xs font-black uppercase tracking-wider text-slate-800 leading-none">
                JL Sports Club 360
              </h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Ruta Administrativa /admin/dashboard
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Acceso de Administrador
          </span>
        </div>
      </header>

      {/* ── Dashboard Content ──────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <AdminDashboardModule games={games} teams={teams} />
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
        JL Sports Club 360 · Módulo de Panel de Administrador y Exportación Segura (Solo Lectura)
      </footer>
    </div>
  );
}
