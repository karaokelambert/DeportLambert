"use client";

import React, { useState } from 'react';
import { Download, Share2, Settings } from 'lucide-react';
import { GoldTrophyIcon3D } from './SportsIcons3D';
import { InstallAppModal, ShareAppModal, SettingsAppModal } from './PortalModals';

import { DisciplineData } from './DisciplinesPortal';
import { SuperAdminUser } from './PortalModals';

interface Navbar360Props {
  onBackToPortal?: () => void;
  showBackPortal?: boolean;
  branding?: {
    title: string;
    subtitle: string;
    season: string;
  };
  onSaveBranding?: (b: { title: string, subtitle: string, season: string }) => void;
  disciplines?: DisciplineData[];
  onUpdateDisciplines?: (d: DisciplineData[]) => void;
  admins?: SuperAdminUser[];
  onUpdateAdmins?: (a: SuperAdminUser[]) => void;
}

export default function Navbar360({ 
  onBackToPortal, 
  showBackPortal = false,
  branding = {
    title: 'JL Sports Club 360',
    subtitle: 'CENTRO DE GESTIÓN DEPORTIVA',
    season: 'TEMPORADA 2026'
  },
  onSaveBranding,
  disciplines,
  onUpdateDisciplines,
  admins,
  onUpdateAdmins,
}: Navbar360Props) {
  const [modalOpen, setModalOpen] = useState<'install' | 'share' | 'settings' | null>(null);

  return (
    <>
      <header className="w-full sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* ── Encabezado principal (Logo + Título + Subtítulo) ── */}
          <div 
            onClick={onBackToPortal} 
            className={`flex items-center gap-3.5 group ${onBackToPortal ? 'cursor-pointer' : ''}`}
          >
            {/* Ícono de Copa Dorada 3D */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-900/60 via-slate-900 to-amber-950/40 p-2 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <GoldTrophyIcon3D className="w-8 h-8" />
            </div>

            {/* Textos */}
            <div className="flex flex-col justify-center">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#ff7300] drop-shadow-[0_2px_8px_rgba(255,115,0,0.4)] leading-tight">
                {branding.title}
              </h1>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-300 tracking-[0.2em] uppercase leading-none mt-0.5">
                {branding.subtitle}
              </p>
            </div>
          </div>

          {/* ── Centro: Indicador de Estado En Línea ── */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00ff88] shadow-[0_0_8px_#00ff88]" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-[#00ff88] drop-shadow-[0_0_6px_rgba(0,255,136,0.6)]">
              En línea
            </span>
          </div>

          {/* ── Botones de acción superior ── */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Indicador móvil de en línea */}
            <div className="flex md:hidden items-center p-2 rounded-xl bg-slate-900 border border-emerald-500/30" title="Sistema en línea">
              <span className="h-2.5 w-2.5 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88]" />
            </div>

            {/* 1. Instalar App */}
            <button
              onClick={() => setModalOpen('install')}
              className="btn-gold-gradient px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black uppercase text-[11px] sm:text-xs text-slate-950 flex items-center gap-2 shadow-lg tracking-wider"
              title="Instalar App en tu dispositivo"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Instalar App</span>
            </button>

            {/* 2. Compartir App */}
            <button
              onClick={() => setModalOpen('share')}
              className="btn-gold-metallic px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold uppercase text-[11px] sm:text-xs text-slate-100 flex items-center gap-2 tracking-wider"
              title="Compartir enlace de la App"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Compartir App</span>
            </button>

            {/* 3. Configurar */}
            <button
              onClick={() => setModalOpen('settings')}
              className="btn-gold-metallic px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold uppercase text-[11px] sm:text-xs text-slate-100 flex items-center gap-2 tracking-wider"
              title="Configuración de la plataforma"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Configurar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Modales Interactivos */}
      <InstallAppModal isOpen={modalOpen === 'install'} onClose={() => setModalOpen(null)} />
      <ShareAppModal isOpen={modalOpen === 'share'} onClose={() => setModalOpen(null)} />
      <SettingsAppModal 
        isOpen={modalOpen === 'settings'} 
        onClose={() => setModalOpen(null)} 
        branding={branding}
        onSaveBranding={onSaveBranding}
        disciplines={disciplines}
        onUpdateDisciplines={onUpdateDisciplines}
        admins={admins}
        onUpdateAdmins={onUpdateAdmins}
      />
    </>
  );
}
