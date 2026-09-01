"use client";

import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

interface TeamLogoProps {
  team?: any;
  teamName?: string;
  logoUrl?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  alt?: string;
}

/**
 * Extrae la URL del logo soportando todos los formatos y campos posibles de Supabase / base de datos
 */
export function getTeamLogoUrl(team?: any): string {
  if (!team) return '';
  if (typeof team === 'string') return team;
  return (
    team.logoUrl ||
    team.logo_url ||
    team.logo ||
    team.image ||
    team.image_url ||
    team.escudo ||
    team.escudo_url ||
    team.avatar ||
    team.avatar_url ||
    team.icon ||
    team.icon_url ||
    team.img ||
    team.foto ||
    team.badge ||
    team.badge_url ||
    ''
  );
}

/**
 * Resuelve rutas relativas para garantizar compatibilidad con GitHub Pages (/DeportLambert/) y dominios raíz
 */
export function resolveLogoUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  
  // URLs absolutas, blob o data URIs
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Si estamos en entorno navegador y en subdirectorio como /DeportLambert
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    if (pathname.includes('/DeportLambert') && !trimmed.startsWith('/DeportLambert')) {
      return `/DeportLambert${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
    }
  }

  return trimmed;
}

export function compressImageFileToDataUri(file: File, maxDimension: number = 256, quality: number = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const dataUri = canvas.toDataURL('image/webp', quality);
          resolve(dataUri);
        } catch {
          const dataUri = canvas.toDataURL('image/png');
          resolve(dataUri);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getTeamInitials(name?: string): string {
  if (!name) return 'JL';
  const clean = name.trim().split(/\s+/);
  if (clean.length === 1) return clean[0].substring(0, 2).toUpperCase();
  return (clean[0][0] + clean[1][0]).toUpperCase();
}

/**
 * Generador de temas de color para escudos vectoriales
 */
function getTeamTheme(name?: string) {
  const normalized = (name || '').toLowerCase().trim();
  
  if (normalized.includes('viking')) {
    return { bg: 'from-amber-600 via-orange-600 to-slate-950', border: 'border-amber-400', stroke: '#F59E0B', text: 'text-amber-300', icon: 'viking' };
  }
  if (normalized.includes('motor')) {
    return { bg: 'from-orange-600 via-red-600 to-slate-950', border: 'border-orange-500', stroke: '#FF8A00', text: 'text-orange-300', icon: 'motor' };
  }
  if (normalized.includes('caripito') || normalized.includes('abc')) {
    return { bg: 'from-emerald-600 via-teal-700 to-slate-950', border: 'border-emerald-400', stroke: '#10B981', text: 'text-emerald-300', icon: 'star' };
  }
  if (normalized.includes('halcon')) {
    return { bg: 'from-cyan-600 via-blue-700 to-slate-950', border: 'border-cyan-400', stroke: '#06B6D4', text: 'text-cyan-300', icon: 'hawk' };
  }
  if (normalized.includes('cibapac')) {
    return { bg: 'from-purple-600 via-indigo-700 to-slate-950', border: 'border-purple-400', stroke: '#A855F7', text: 'text-purple-300', icon: 'ball' };
  }
  if (normalized.includes('spartan')) {
    return { bg: 'from-red-700 via-rose-800 to-slate-950', border: 'border-red-500', stroke: '#EF4444', text: 'text-red-300', icon: 'helmet' };
  }
  if (normalized.includes('amazonas')) {
    return { bg: 'from-emerald-600 via-green-700 to-slate-950', border: 'border-emerald-400', stroke: '#10B981', text: 'text-emerald-300', icon: 'ball' };
  }
  if (normalized.includes('pantera')) {
    return { bg: 'from-fuchsia-600 via-purple-800 to-slate-950', border: 'border-fuchsia-400', stroke: '#D946EF', text: 'text-fuchsia-300', icon: 'claw' };
  }
  if (normalized.includes('aguila') || normalized.includes('águila')) {
    return { bg: 'from-amber-500 via-yellow-600 to-slate-950', border: 'border-amber-400', stroke: '#F59E0B', text: 'text-amber-300', icon: 'hawk' };
  }
  if (normalized.includes('fenix') || normalized.includes('fénix')) {
    return { bg: 'from-orange-500 via-red-600 to-slate-950', border: 'border-orange-400', stroke: '#EA580C', text: 'text-orange-300', icon: 'flame' };
  }
  if (normalized.includes('valkiria')) {
    return { bg: 'from-sky-600 via-indigo-800 to-slate-950', border: 'border-sky-400', stroke: '#38BDF8', text: 'text-sky-300', icon: 'wings' };
  }
  if (normalized.includes('tita')) {
    return { bg: 'from-violet-600 via-indigo-900 to-slate-950', border: 'border-violet-400', stroke: '#8B5CF6', text: 'text-violet-300', icon: 'lightning' };
  }
  if (normalized.includes('monagas') || normalized.includes('deportivo')) {
    return { bg: 'from-blue-600 via-indigo-800 to-slate-950', border: 'border-blue-400', stroke: '#3B82F6', text: 'text-blue-300', icon: 'ball' };
  }
  if (normalized.includes('galactico') || normalized.includes('galáctico')) {
    return { bg: 'from-violet-600 via-fuchsia-800 to-slate-950', border: 'border-violet-400', stroke: '#A855F7', text: 'text-violet-300', icon: 'star' };
  }
  if (normalized.includes('guerrero')) {
    return { bg: 'from-red-600 via-amber-700 to-slate-950', border: 'border-red-400', stroke: '#DC2626', text: 'text-red-300', icon: 'shield' };
  }
  if (normalized.includes('huracan') || normalized.includes('huracán')) {
    return { bg: 'from-cyan-600 via-teal-800 to-slate-950', border: 'border-cyan-400', stroke: '#06B6D4', text: 'text-cyan-300', icon: 'cyclone' };
  }
  if (normalized.includes('criollo') || normalized.includes('diamante') || normalized.includes('rayo') || normalized.includes('leon') || normalized.includes('león')) {
    return { bg: 'from-amber-600 via-blue-800 to-slate-950', border: 'border-amber-400', stroke: '#F59E0B', text: 'text-amber-300', icon: 'diamond' };
  }

  // Hash determinístico por defecto
  const themes = [
    { bg: 'from-amber-600 via-orange-600 to-slate-950', border: 'border-amber-400', stroke: '#F59E0B', text: 'text-amber-300', icon: 'shield' },
    { bg: 'from-blue-600 via-indigo-700 to-slate-950', border: 'border-blue-400', stroke: '#3B82F6', text: 'text-cyan-300', icon: 'ball' },
    { bg: 'from-emerald-600 via-teal-700 to-slate-950', border: 'border-emerald-400', stroke: '#10B981', text: 'text-emerald-300', icon: 'star' },
    { bg: 'from-purple-600 via-fuchsia-700 to-slate-950', border: 'border-purple-400', stroke: '#A855F7', text: 'text-fuchsia-300', icon: 'crown' },
    { bg: 'from-rose-600 via-red-700 to-slate-950', border: 'border-rose-400', stroke: '#F43F5E', text: 'text-rose-300', icon: 'flame' },
    { bg: 'from-cyan-600 via-sky-700 to-slate-950', border: 'border-cyan-400', stroke: '#06B6D4', text: 'text-sky-300', icon: 'wings' },
  ];

  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = (name || '').charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % themes.length;
  return themes[index];
}

export default function TeamLogo({
  team,
  teamName,
  logoUrl,
  className = '',
  size = 'md',
  alt = 'Logo del Equipo'
}: TeamLogoProps) {
  const [loadFailed, setLoadFailed] = useState(false);
  const [attemptedFallback, setAttemptedFallback] = useState(false);

  const rawUrl = logoUrl || getTeamLogoUrl(team);
  const name = teamName || (typeof team === 'object' ? (team?.name || team?.team_name) : '') || '';
  const initials = getTeamInitials(name);
  const theme = getTeamTheme(name);

  // Reiniciar estado si cambia la URL o el equipo
  useEffect(() => {
    setLoadFailed(false);
    setAttemptedFallback(false);
  }, [rawUrl, name]);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-12 h-12 text-xs',
    lg: 'w-16 h-16 text-sm',
    xl: 'w-20 h-20 text-base',
    custom: 'w-full h-full'
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  // 1. Si existe URL de imagen y no ha fallado la carga, renderizar la imagen
  if (rawUrl && !loadFailed) {
    const resolved = resolveLogoUrl(rawUrl);

    return (
      <div className={`relative flex items-center justify-center shrink-0 overflow-hidden ${currentSizeClass} ${className}`}>
        <img
          src={resolved}
          alt={name || alt}
          className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] select-none transition-transform duration-200"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          onError={(e) => {
            const el = e.currentTarget;
            if (!attemptedFallback && !el.src.includes('/DeportLambert/') && !el.src.startsWith('data:')) {
              setAttemptedFallback(true);
              el.src = `/DeportLambert/${rawUrl.replace(/^\/+/, '')}`;
            } else {
              setLoadFailed(true);
            }
          }}
        />
      </div>
    );
  }

  // 2. Escudo Oficial Vectorial Dinámico 3D con Emblema del Equipo
  return (
    <div 
      className={`relative rounded-2xl bg-gradient-to-br ${theme.bg} border-2 ${theme.border} shadow-[0_4px_16px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center select-none shrink-0 overflow-hidden p-1 ${currentSizeClass} ${className}`}
      title={name}
    >
      {/* Brillo superior en bisel 3D */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/25 pointer-events-none" />
      
      {/* Gráfico Vectorial SVG de Escudo Deportivo */}
      <svg 
        className="w-full h-full max-w-[85%] max-h-[85%] relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Escudo Base */}
        <path 
          d="M50 8L88 20V52C88 74 50 92 50 92C50 92 12 74 12 52V20L50 8Z" 
          fill="url(#shieldGrad)" 
          stroke={theme.stroke} 
          strokeWidth="3"
        />
        
        {/* Balón / Patrón Deportivo */}
        <circle cx="50" cy="46" r="22" stroke={theme.stroke} strokeWidth="2.5" fill="rgba(0,0,0,0.35)" opacity="0.9" />
        <path d="M50 24V68M28 46H72M34 30C42 38 42 54 34 62M66 30C58 38 58 54 66 62" stroke={theme.stroke} strokeWidth="1.5" opacity="0.6" />
        
        {/* Texto de Iniciales del Equipo */}
        <text 
          x="50" 
          y="53" 
          textAnchor="middle" 
          dominantBaseline="central" 
          fill="#FFFFFF" 
          fontSize="20" 
          fontWeight="900" 
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="1"
          filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.9))"
        >
          {initials}
        </text>

        {/* Gradiente Interno */}
        <defs>
          <linearGradient id="shieldGrad" x1="50" y1="8" x2="50" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0b0f19" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
