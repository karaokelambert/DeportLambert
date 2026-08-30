"use client";

import React, { useState } from 'react';
import { Trophy, Shield } from 'lucide-react';

interface TeamLogoProps {
  team?: any;
  teamName?: string;
  logoUrl?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  alt?: string;
}

export function getTeamLogoUrl(team?: any): string {
  if (!team) return '';
  if (typeof team === 'string') return team;
  return team.logoUrl || team.logo_url || team.logo || team.image_url || team.avatar || '';
}

export function getTeamInitials(name?: string): string {
  if (!name) return 'JL';
  const clean = name.trim().split(/\s+/);
  if (clean.length === 1) return clean[0].substring(0, 2).toUpperCase();
  return (clean[0][0] + clean[1][0]).toUpperCase();
}

export default function TeamLogo({
  team,
  teamName,
  logoUrl,
  className = '',
  size = 'md',
  alt = 'Team Logo'
}: TeamLogoProps) {
  const [hasError, setHasError] = useState(false);

  const rawUrl = logoUrl || getTeamLogoUrl(team);
  const name = teamName || (typeof team === 'object' ? team?.name : '') || '';
  const initials = getTeamInitials(name);

  // Size styling maps
  const sizeClasses = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-12 h-12 text-xs',
    lg: 'w-16 h-16 text-sm',
    xl: 'w-20 h-20 text-base',
    custom: ''
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  if (rawUrl && !hasError) {
    return (
      <div className={`relative overflow-hidden flex items-center justify-center shrink-0 ${currentSizeClass} ${className}`}>
        <img
          src={rawUrl}
          alt={name || alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </div>
    );
  }

  // Fallback styling with team initials and elegant shield gradient
  return (
    <div 
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border border-slate-700/80 shadow-md flex items-center justify-center font-black tracking-wider text-amber-400 select-none shrink-0 ${currentSizeClass} ${className}`}
      title={name}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-transparent to-white/5 pointer-events-none" />
      {initials ? (
        <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {initials}
        </span>
      ) : (
        <Shield className="w-1/2 h-1/2 text-amber-400/80 relative z-10" />
      )}
    </div>
  );
}
