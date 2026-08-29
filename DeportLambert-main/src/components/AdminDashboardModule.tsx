"use client";

/**
 * AdminDashboardModule – JL Sports Club 360
 * ==========================================
 * MÓDULO ADITIVO E INDEPENDIENTE.
 * Solo realiza lecturas de los datos que recibe por props.
 * No escribe ni altera ningún estado de la aplicación principal.
 * Exportación JSON y CSV/Excel sin modificar registros.
 */

import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Users,
  CalendarDays,
  CheckCircle2,
  Trophy,
  Download,
  FileJson,
  Table2,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Clock,
  AlertCircle,
  Activity,
} from 'lucide-react';

// ── Tipos recibidos por props (solo lectura) ──────────────────
interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  time: string;
  location: string;
  status: 'Programado' | 'En Curso' | 'Finalizado';
}

interface Team {
  id: string;
  name: string;
  delegado: string;
  telefono: string;
  jugadores: string[];
  logoUrl?: string;
}

interface Props {
  games: Game[];
  teams: Team[];
}

// ── Utilitario de exportación JSON ────────────────────────────
function exportJSON(filename: string, data: unknown) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Utilitario de exportación CSV ────────────────────────────
function exportCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Utilitario de exportación Excel (.xlsx) ─────────────────
function exportExcel(filename: string, sheetName: string, data: Record<string, unknown>[]) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// ── Componente principal ──────────────────────────────────────
export default function AdminDashboardModule({ games, teams }: Props) {
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  const finishedGames = useMemo(() => games.filter(g => g.status === 'Finalizado'), [games]);
  const pendingGames  = useMemo(() => games.filter(g => g.status === 'Programado'),  [games]);
  const liveGames     = useMemo(() => games.filter(g => g.status === 'En Curso'),     [games]);
  const totalPlayers  = useMemo(() => teams.reduce((acc, t) => acc + t.jugadores.length, 0), [teams]);

  const metrics = [
    {
      label: 'Equipos Inscritos',
      value: teams.length,
      icon: Users,
      border: 'border-[#FF3D00]',
      iconBg: 'bg-blue-950/80 border border-blue-500/40 text-blue-400',
    },
    {
      label: 'Juegos en Vivo',
      value: liveGames.length,
      icon: Activity,
      border: 'border-[#00E676]',
      iconBg: 'bg-orange-950/80 border border-orange-500/40 text-[#FF8A00] animate-pulse',
    },
    {
      label: 'Juegos Finalizados',
      value: finishedGames.length,
      icon: CheckCircle2,
      border: 'border-[#FFC107]',
      iconBg: 'bg-emerald-950/80 border border-emerald-500/40 text-[#00E676]',
    },
    {
      label: 'Juegos Pendientes',
      value: pendingGames.length,
      icon: CalendarDays,
      border: 'border-[#8B5CF6]',
      iconBg: 'bg-purple-950/80 border border-purple-500/40 text-[#8B5CF6]',
    },
  ];

  const showExportMsg = (msg: string) => {
    setExportMsg(msg);
    setTimeout(() => setExportMsg(null), 3000);
  };

  // ── Handlers de exportación (solo lectura) ───────────────────
  const handleExportTeamsJSON = () => {
    exportJSON('jl360-equipos', teams.map(t => ({
      id: t.id,
      nombre: t.name,
      delegado: t.delegado,
      telefono: t.telefono,
      totalJugadores: t.jugadores.length,
      jugadores: t.jugadores,
    })));
    showExportMsg('✅ Equipos exportados como JSON');
  };

  const handleExportTeamsCSV = () => {
    const headers = ['ID', 'Nombre Equipo', 'Delegado', 'Teléfono', 'Total Jugadores'];
    const rows = teams.map(t => [t.id, t.name, t.delegado, t.telefono, t.jugadores.length]);
    exportCSV('jl360-equipos', headers, rows);
    showExportMsg('✅ Equipos exportados como CSV');
  };

  const handleExportTeamsExcel = () => {
    exportExcel('jl360-equipos', 'Equipos', teams.map(t => ({
      'ID': t.id,
      'Nombre Equipo': t.name,
      'Delegado': t.delegado,
      'Teléfono': t.telefono,
      'Total Jugadores': t.jugadores.length,
      'Jugadores': t.jugadores.join(', '),
    })));
    showExportMsg('✅ Equipos exportados como Excel (.xlsx)');
  };

  const handleExportGamesJSON = () => {
    exportJSON('jl360-partidos', games.map(g => ({
      id: g.id,
      equipoLocal: g.homeTeam,
      equipoVisitante: g.awayTeam,
      marcadorLocal: g.homeScore,
      marcadorVisitante: g.awayScore,
      fecha: g.date,
      hora: g.time,
      cancha: g.location,
      estado: g.status,
    })));
    showExportMsg('✅ Partidos exportados como JSON');
  };

  const handleExportGamesCSV = () => {
    const headers = ['ID', 'Equipo Local', 'Equipo Visitante', 'Marcador Local', 'Marcador Visitante', 'Fecha', 'Hora', 'Cancha', 'Estado'];
    const rows = games.map(g => [g.id, g.homeTeam, g.awayTeam, g.homeScore, g.awayScore, g.date, g.time, g.location, g.status]);
    exportCSV('jl360-partidos', headers, rows);
    showExportMsg('✅ Partidos exportados como CSV');
  };

  const handleExportGamesExcel = () => {
    exportExcel('jl360-partidos', 'Partidos', games.map(g => ({
      'ID': g.id,
      'Equipo Local': g.homeTeam,
      'Equipo Visitante': g.awayTeam,
      'Marcador Local': g.homeScore,
      'Marcador Visitante': g.awayScore,
      'Fecha': g.date,
      'Hora': g.time,
      'Cancha': g.location,
      'Estado': g.status,
    })));
    showExportMsg('✅ Partidos exportados como Excel (.xlsx)');
  };

  const handleExportCompleteJSON = () => {
    exportJSON('jl360-datos-completos', {
      exportadoEn: new Date().toISOString(),
      sistema: 'JL Sports Club 360 v2.0',
      resumen: {
        equipos: teams.length,
        partidosJugados: finishedGames.length,
        partidosPendientes: pendingGames.length,
        jugadoresTotales: totalPlayers,
      },
      equipos: teams,
      partidos: games,
    });
    showExportMsg('✅ Exportación completa generada como JSON');
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Cabecera del módulo ──────────────────────────────── */}
      <div className="bg-[#0F172A] border border-slate-700/80 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <span className="w-10 h-10 bg-[#FF8A00] text-slate-950 rounded-xl flex items-center justify-center shadow-lg font-black">
              <BarChart3 className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </span>
            Panel de Administrador
          </h2>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            Vista ejecutiva de métricas y exportación para producción
          </p>
        </div>
        <span className="self-start sm:self-auto flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#00E676] bg-emerald-950/70 border border-[#00E676]/40 rounded-full px-3 py-1.5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" /> Administrador Activo
        </span>
      </div>

      {/* ── Toast de exportación ─────────────────────────────── */}
      {exportMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#0F172A] border border-[#00E676] text-white text-sm font-bold px-5 py-3 rounded-xl shadow-2xl animate-scale-in flex items-center gap-2">
          {exportMsg}
        </div>
      )}

      {/* ── Métricas ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div
            key={i}
            className={`bg-[#0F172A] border-2 ${m.border} rounded-2xl p-4 sm:p-5 shadow-xl flex items-center justify-between hover:scale-[1.01] transition-transform`}
          >
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">{m.label}</p>
              <p className="text-3xl sm:text-4xl font-black text-white">
                {String(m.value).padStart(2, '0')}
              </p>
            </div>
            <div className={`p-3 rounded-xl shadow-md ${m.iconBg}`}>
              <m.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Tablas y Exportación ─────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Tabla de Equipos */}
        <div className="bg-[#0F172A] rounded-2xl border border-slate-700/80 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-black uppercase text-sm tracking-wider text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" /> Equipos Inscritos
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{teams.length} registros oficiales</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={handleExportTeamsExcel}
                className="flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-900/50 text-[#00E676] border border-slate-700 hover:border-[#00E676] transition-all"
                title="Exportar a Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
              <button
                onClick={handleExportTeamsCSV}
                className="flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-teal-900/50 text-teal-400 border border-slate-700 hover:border-teal-400 transition-all"
                title="Exportar a CSV"
              >
                <Table2 className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                onClick={handleExportTeamsJSON}
                className="flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-900/50 text-blue-400 border border-slate-700 hover:border-blue-400 transition-all"
                title="Exportar a JSON"
              >
                <FileJson className="w-3.5 h-3.5" /> JSON
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800">
                  <th className="text-left p-3 font-black uppercase text-[10px] tracking-wider text-slate-400">Equipo</th>
                  <th className="text-left p-3 font-black uppercase text-[10px] tracking-wider text-slate-400">Delegado</th>
                  <th className="text-center p-3 font-black uppercase text-[10px] tracking-wider text-slate-400">Jugadores</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {teams.map((t, i) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <span className="font-black uppercase text-white">{t.name}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-300">{t.delegado}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-950 border border-blue-500/40 text-blue-400 font-black text-[10px]">
                        {t.jugadores.length}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla de Partidos */}
        <div className="bg-[#0F172A] rounded-2xl border border-slate-700/80 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-black uppercase text-sm tracking-wider text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#00E676]" /> Partidos del Torneo
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{games.length} registros</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={handleExportGamesExcel}
                className="flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-900/50 text-[#00E676] border border-slate-700 hover:border-[#00E676] transition-all"
                title="Exportar a Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
              <button
                onClick={handleExportGamesCSV}
                className="flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-teal-900/50 text-teal-400 border border-slate-700 hover:border-teal-400 transition-all"
                title="Exportar a CSV"
              >
                <Table2 className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                onClick={handleExportGamesJSON}
                className="flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-900/50 text-blue-400 border border-slate-700 hover:border-blue-400 transition-all"
                title="Exportar a JSON"
              >
                <FileJson className="w-3.5 h-3.5" /> JSON
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800">
                  <th className="text-left p-3 font-black uppercase text-[10px] tracking-wider text-slate-400">Enfrentamiento</th>
                  <th className="text-center p-3 font-black uppercase text-[10px] tracking-wider text-slate-400">Marcador</th>
                  <th className="text-center p-3 font-black uppercase text-[10px] tracking-wider text-slate-400">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {games.map(g => (
                  <tr key={g.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <span className="font-black uppercase text-white text-[11px]">{g.homeTeam}</span>
                      <span className="font-bold text-slate-400 mx-1 text-[10px]">vs</span>
                      <span className="font-black uppercase text-white text-[11px]">{g.awayTeam}</span>
                      <p className="text-[9px] text-slate-400 mt-0.5">{g.date} · {g.location}</p>
                    </td>
                    <td className="p-3 text-center">
                      {g.status === 'Finalizado' ? (
                        <span className="font-black text-sm">
                          <span className="text-[#00E676]">{g.homeScore}</span> – <span className="text-[#FF3D00]">{g.awayScore}</span>
                        </span>
                      ) : g.status === 'En Curso' ? (
                        <span className="font-black text-sm">
                          <span className="text-[#00E676]">{g.homeScore}</span> – <span className="text-[#FF3D00]">{g.awayScore}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 font-black">–</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-block text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        g.status === 'Finalizado' 
                          ? 'bg-yellow-950/70 border-[#FFC107] text-[#FFC107]' 
                          : g.status === 'En Curso'
                          ? 'bg-red-950/70 border-[#FF3D00] text-[#FF3D00] animate-pulse'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {g.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Exportación Completa ─────────────────────────────── */}
      <div className="bg-[#0F172A] border border-[#FFC107] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FF8A00] text-slate-950 rounded-xl flex items-center justify-center font-black shadow-lg shadow-orange-950/50 shrink-0">
            <Download className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-black uppercase text-white text-sm tracking-wider">Exportación Completa del Sistema</h3>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">
              Genera un JSON integral con todos los equipos, partidos y balance general
            </p>
          </div>
        </div>
        <button
          onClick={handleExportCompleteJSON}
          className="flex items-center gap-2 bg-[#FFC107] hover:bg-yellow-400 text-slate-950 font-black uppercase text-[11px] px-5 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 shrink-0 tracking-wider"
        >
          <TrendingUp className="w-4 h-4" />
          Descargar Reporte Completo
        </button>
      </div>

      {/* ── Nota de Seguridad ─────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-[#0F172A] border border-amber-500/40 rounded-xl p-4 shadow-md">
        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">
          Este módulo opera en modo solo-lectura. Las exportaciones generan copias locales sin modificar ningún registro del sistema.
        </p>
      </div>
    </div>
  );
}
