"use client";

import React, { useState } from 'react';
import { 
  BasketballIcon3D, 
  VolleyballIcon3D, 
  FutsalIcon3D, 
  BaseballIcon3D 
} from './SportsIcons3D';
import { ArrowRight, Sparkles, Shield, Trophy } from 'lucide-react';

export interface DisciplineData {
  id: string;
  badgeNumber: string;
  title: string;
  category: string;
  subtitle: string;
  icon: 'basketball' | 'volleyball' | 'futsal' | 'baseball' | 'custom';
  customLogoUrl?: string;
  accentTheme: string;
  badgeColor: string;
}

export const DISCIPLINES: DisciplineData[] = [
  {
    id: 'baloncesto',
    badgeNumber: 'DISCIPLINA 1',
    title: 'Baloncesto STOB',
    category: 'Torneo Oficial Masculino / Libre',
    subtitle: 'Gestión integral de torneo',
    icon: 'basketball',
    accentTheme: 'from-orange-500/20 via-amber-500/10 to-transparent',
    badgeColor: 'bg-amber-950/70 border-amber-500/50 text-amber-400',
  },
  {
    id: 'voleibol',
    badgeNumber: 'DISCIPLINA 2',
    title: 'Voleibol Femenino Master',
    category: 'Liga Máster Femenina 2026',
    subtitle: 'Gestión integral de torneo',
    icon: 'volleyball',
    accentTheme: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    badgeColor: 'bg-cyan-950/70 border-cyan-500/50 text-cyan-400',
  },
  {
    id: 'futsal',
    badgeNumber: 'DISCIPLINA 3',
    title: 'Fútbol Sala Master Libre 2026',
    category: 'Campeonato de Tabloncillo 2026',
    subtitle: 'Gestión integral de torneo',
    icon: 'futsal',
    accentTheme: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    badgeColor: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-400',
  },
  {
    id: 'beisbol5',
    badgeNumber: 'DISCIPLINA 4',
    title: 'Béisbol Five',
    category: 'Circuito Nacional B5 Mixto',
    subtitle: 'Gestión integral de torneo',
    icon: 'baseball',
    accentTheme: 'from-rose-500/20 via-red-500/10 to-transparent',
    badgeColor: 'bg-rose-950/70 border-rose-500/50 text-rose-400',
  },
];

interface DisciplinesPortalProps {
  disciplines?: DisciplineData[];
  onSelectDiscipline: (discipline: DisciplineData) => void;
}

function DisciplineLogoIcon({ disc }: { disc: DisciplineData }) {
  const [imgError, setImgError] = useState(false);

  if (disc.customLogoUrl && !imgError) {
    return (
      <img 
        src={disc.customLogoUrl} 
        alt={disc.title} 
        onError={() => setImgError(true)}
        className="w-20 h-20 sm:w-24 sm:h-24 max-w-[96px] max-h-[96px] object-contain rounded-2xl drop-shadow-[0_0_15px_rgba(255,138,0,0.4)]"
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
      />
    );
  }

  switch (disc.icon) {
    case 'basketball':
      return <BasketballIcon3D className="w-24 h-24 sm:w-28 sm:h-28" />;
    case 'volleyball':
      return <VolleyballIcon3D className="w-24 h-24 sm:w-28 sm:h-28" />;
    case 'futsal':
      return <FutsalIcon3D className="w-24 h-24 sm:w-28 sm:h-28" />;
    case 'baseball':
      return <BaseballIcon3D className="w-24 h-24 sm:w-28 sm:h-28" />;
    default:
      return <BasketballIcon3D className="w-24 h-24 sm:w-28 sm:h-28" />;
  }
}

export default function DisciplinesPortal({ 
  disciplines = DISCIPLINES, 
  onSelectDiscipline 
}: DisciplinesPortalProps) {
  const renderIcon = (disc: DisciplineData) => {
    return <DisciplineLogoIcon disc={disc} />;
  };

  const activeDisciplines = disciplines;

  return (
    <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col items-center">
      
      {/* ── Sección Principal de Bienvenida ── */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-4">
        
        {/* Badge superior: Etiqueta flotante en tono marrón/naranja oscuro */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3d1a08]/90 border border-orange-600/60 shadow-[0_0_15px_rgba(234,88,12,0.3)] animate-pulse-slow">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-orange-300">
            SISTEMA MULTI-DISCIPLINA
          </span>
        </div>

        {/* Título principal: Selecciona tu Disciplina con borde de línea negro y "Disciplina" en naranja */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-tight">
          <span className="text-white text-stroke-black-lg">
            Selecciona tu{' '}
          </span>
          <span className="text-[#ff6b00] text-stroke-black-lg drop-shadow-[0_0_25px_rgba(255,107,0,0.6)]">
            Disciplina
          </span>
        </h2>

        {/* Descripción: Texto con alto contraste sobre el fondo azul claro */}
        <p className="text-slate-900 font-bold text-base md:text-lg text-center max-w-2xl mx-auto drop-shadow-sm my-3 leading-relaxed">
          Cada disciplina tiene su propio sistema de torneo independiente con equipos, jugadores, calendario y resultados.
        </p>

        {/* Botón Destacado de Instalación PWA */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={async () => {
              const promptEvent = (window as unknown as { deferredPrompt?: { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } }).deferredPrompt;
              if (promptEvent && typeof promptEvent.prompt === 'function') {
                try {
                  await promptEvent.prompt();
                } catch {
                  window.dispatchEvent(new CustomEvent('open-pwa-modal'));
                }
              } else {
                window.dispatchEvent(new CustomEvent('open-pwa-modal'));
              }
            }}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-orange-950/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-300/60"
          >
            <span className="text-base">📲</span>
            <span>Instalar App JL Sports 360</span>
          </button>
        </div>
      </div>

      {/* ── Tarjetas de Disciplinas (Cards) ── */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-7">
        {activeDisciplines.map((disc) => (
          <div
            key={disc.id}
            className="card-metallic-crystal card-neon-border rounded-3xl p-6 flex flex-col justify-between items-center text-center group cursor-pointer"
            onClick={() => onSelectDiscipline(disc)}
          >
            {/* Resplandor superior sutil */}
            <div className={`absolute top-0 inset-x-0 h-36 bg-gradient-to-b ${disc.accentTheme} rounded-t-3xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`} />

            {/* Contenido Superior */}
            <div className="w-full flex flex-col items-center z-10">
              
              {/* Badge de disciplina: Etiqueta interna con la identificación */}
              <div className={`mb-5 px-3.5 py-1 rounded-full border text-[10px] sm:text-[11px] font-black uppercase tracking-widest ${disc.badgeColor} shadow-sm`}>
                {disc.badgeNumber}
              </div>

              {/* Icono / Avatar superior en 3D: Círculo central representativo */}
              <div className="relative mb-5 p-2 rounded-full bg-slate-950/70 border border-slate-700/60 shadow-inner group-hover:scale-105 transition-transform duration-300">
                {renderIcon(disc)}
              </div>

              {/* Título de la disciplina: Texto en blanco con bordes naranja y tipografía bold/extra bold */}
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white group-hover:text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] transition-colors min-h-[56px] flex items-center justify-center px-2">
                <span className="border-b-2 border-transparent group-hover:border-orange-500 transition-all text-stroke-black">
                  {disc.title}
                </span>
              </h3>

              {/* Subtítulo: Texto descriptivo en gris claro */}
              <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-2 mb-6 group-hover:text-slate-300 transition-colors">
                {disc.subtitle}
              </p>
            </div>

            {/* Botón de acción inferior: Botón en verde con bordes naranja brillante neón y texto negro bold */}
            <div className="w-full z-10 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDiscipline(disc);
                }}
                className="btn-neon-action w-full py-3.5 px-4 rounded-2xl text-slate-950 font-black uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 group/btn"
              >
                <span>Ingresar al Sistema</span>
                <ArrowRight className="w-4 h-4 text-slate-950 stroke-[3] group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Indicador inferior de pie de tarjetas */}
      <div className="mt-12 flex items-center gap-4 text-center justify-center">
        <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-slate-700" />
        <p className="text-[11px] uppercase tracking-[0.3em] font-black text-slate-400/70 flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-amber-500/80" /> JL SPORTS CLUB 360 · TEMPORADA OFICIAL 2026
        </p>
        <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-slate-700" />
      </div>
    </section>
  );
}
