"use client";

import React from 'react';

// ── 1. Icono 3D Baloncesto STOB ─────────────────────────────
export function BasketballIcon3D({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className} animate-float`}>
      {/* Resplandor exterior de energía */}
      <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
      
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_12px_20px_rgba(234,88,12,0.45)]">
        <defs>
          {/* Degradado 3D de la esfera de baloncesto */}
          <radialGradient id="bballSpherical" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ff9a44" />
            <stop offset="35%" stopColor="#f97316" />
            <stop offset="70%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#7c2d12" />
          </radialGradient>

          {/* Brillo especular superior */}
          <linearGradient id="bballGloss" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Anillo de aura neón */}
          <linearGradient id="neonRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          
          <filter id="glowDark" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Anillo orbital decorativo */}
        <ellipse cx="50" cy="50" rx="46" ry="18" fill="none" stroke="url(#neonRing)" strokeWidth="2.5" transform="rotate(-25 50 50)" opacity="0.8" strokeDasharray="6 3" />

        {/* Esfera base de baloncesto */}
        <circle cx="50" cy="50" r="38" fill="url(#bballSpherical)" />

        {/* Textura de puntos sutiles */}
        <circle cx="50" cy="50" r="38" fill="none" stroke="#ea580c" strokeWidth="0.5" opacity="0.3" strokeDasharray="1 3" />

        {/* Líneas negras características del balón */}
        <g stroke="#1a0b05" strokeWidth="2.8" strokeLinecap="round" opacity="0.85" filter="url(#glowDark)">
          {/* Línea horizontal central curvada */}
          <path d="M12 50 Q 50 54 88 50" fill="none" />
          {/* Línea vertical central */}
          <line x1="50" y1="12" x2="50" y2="88" />
          {/* Canal izquierdo */}
          <path d="M23 23 Q 48 50 23 77" fill="none" />
          {/* Canal derecho */}
          <path d="M77 23 Q 52 50 77 77" fill="none" />
        </g>

        {/* Resalte de brillo 3D */}
        <ellipse cx="38" cy="30" rx="18" ry="10" fill="url(#bballGloss)" transform="rotate(-30 38 30)" />
        
        {/* Reflejo inferior secundario */}
        <path d="M 28 80 Q 50 88 72 80" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  );
}

// ── 2. Icono 3D Voleibol Femenino Master ────────────────────
export function VolleyballIcon3D({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className} animate-float`}>
      {/* Resplandor exterior */}
      <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />

      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_12px_20px_rgba(6,182,212,0.4)]">
        <defs>
          <radialGradient id="vballShade" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#cbd5e1" />
            <stop offset="85%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </radialGradient>
          <linearGradient id="vballBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="vballYellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="vballGloss" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Anillo orbital */}
        <ellipse cx="50" cy="50" rx="46" ry="18" fill="none" stroke="url(#vballBlue)" strokeWidth="2" transform="rotate(35 50 50)" opacity="0.75" strokeDasharray="5 4" />

        {/* Esfera base */}
        <circle cx="50" cy="50" r="38" fill="url(#vballShade)" />

        {/* Paneles de colores estilo Mikasa oficial */}
        <g opacity="0.9">
          {/* Panel curvado azul superior */}
          <path d="M22 25 C 35 15, 65 15, 78 25 C 65 38, 35 38, 22 25 Z" fill="url(#vballBlue)" />
          {/* Panel curvado amarillo central izquierdo */}
          <path d="M14 42 C 25 35, 45 45, 50 65 C 32 75, 20 60, 14 42 Z" fill="url(#vballYellow)" />
          {/* Panel curvado azul central derecho */}
          <path d="M86 42 C 75 35, 55 45, 50 65 C 68 75, 80 60, 86 42 Z" fill="url(#vballBlue)" />
          {/* Panel amarillo inferior */}
          <path d="M30 80 C 45 70, 55 70, 70 80 C 60 88, 40 88, 30 80 Z" fill="url(#vballYellow)" />
        </g>

        {/* Ranuras de costura 3D */}
        <g stroke="#0f172a" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7">
          <path d="M12 50 Q 50 40 88 50" />
          <path d="M30 18 Q 40 50 30 82" />
          <path d="M70 18 Q 60 50 70 82" />
          <circle cx="50" cy="50" r="38" />
        </g>

        {/* Brillo especular */}
        <ellipse cx="36" cy="28" rx="16" ry="8" fill="url(#vballGloss)" transform="rotate(-25 36 28)" />
      </svg>
    </div>
  );
}

// ── 3. Icono 3D Fútbol Sala Master Libre ────────────────────
export function FutsalIcon3D({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className} animate-float`}>
      {/* Resplandor exterior */}
      <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />

      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_12px_20px_rgba(16,185,129,0.4)]">
        <defs>
          <radialGradient id="futsalBase" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#e2e8f0" />
            <stop offset="85%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
          <linearGradient id="patchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="neonGreenAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="futsalGloss" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Halo neón verde */}
        <ellipse cx="50" cy="50" rx="46" ry="18" fill="none" stroke="url(#neonGreenAccent)" strokeWidth="2.5" transform="rotate(-15 50 50)" opacity="0.85" strokeDasharray="7 3" />

        {/* Esfera base */}
        <circle cx="50" cy="50" r="38" fill="url(#futsalBase)" />

        {/* Pentágono Central con detalles metálicos */}
        <polygon points="50,34 62,43 57,58 43,58 38,43" fill="url(#patchGrad)" stroke="#10b981" strokeWidth="1" />

        {/* Pentágonos circundantes */}
        <polygon points="50,14 58,18 55,25 45,25 42,18" fill="url(#patchGrad)" />
        <polygon points="76,30 83,38 78,46 70,42 70,33" fill="url(#patchGrad)" />
        <polygon points="68,70 75,76 68,84 60,80 60,72" fill="url(#patchGrad)" />
        <polygon points="32,70 40,72 40,80 32,84 25,76" fill="url(#patchGrad)" />
        <polygon points="24,30 30,33 30,42 22,46 17,38" fill="url(#patchGrad)" />

        {/* Líneas de costura de tabloncillo */}
        <g stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" opacity="0.75">
          <line x1="50" y1="34" x2="50" y2="25" />
          <line x1="62" y1="43" x2="70" y2="42" />
          <line x1="57" y1="58" x2="60" y2="72" />
          <line x1="43" y1="58" x2="40" y2="72" />
          <line x1="38" y1="43" x2="30" y2="42" />
        </g>

        {/* Brillo especular esférico */}
        <ellipse cx="36" cy="28" rx="16" ry="9" fill="url(#futsalGloss)" transform="rotate(-30 36 28)" />
      </svg>
    </div>
  );
}

// ── 4. Icono 3D Béisbol Five ────────────────────────────────
export function BaseballIcon3D({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className} animate-float`}>
      {/* Resplandor exterior */}
      <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />

      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_12px_20px_rgba(239,68,68,0.4)]">
        <defs>
          <radialGradient id="bball5Base" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#f1f5f9" />
            <stop offset="85%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#1e293b" />
          </radialGradient>
          <linearGradient id="neonRedAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
          <linearGradient id="baseballGloss" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Halo orbital neón */}
        <ellipse cx="50" cy="50" rx="46" ry="18" fill="none" stroke="url(#neonRedAccent)" strokeWidth="2.5" transform="rotate(-40 50 50)" opacity="0.85" strokeDasharray="5 3" />

        {/* Pelota base */}
        <circle cx="50" cy="50" r="38" fill="url(#bball5Base)" />

        {/* Costuras Rojas icónicas de Béisbol 5 */}
        <g stroke="#dc2626" strokeWidth="2.2" fill="none" strokeLinecap="round">
          {/* Arco izquierdo */}
          <path d="M26 16 Q 40 50 26 84" />
          {/* Arco derecho */}
          <path d="M74 16 Q 60 50 74 84" />
        </g>

        {/* Puntadas transversales rojas en V */}
        <g stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round">
          {/* Puntadas costura izquierda */}
          <line x1="23" y1="22" x2="28" y2="25" />
          <line x1="27" y1="32" x2="33" y2="34" />
          <line x1="31" y1="43" x2="37" y2="44" />
          <line x1="32" y1="55" x2="38" y2="54" />
          <line x1="28" y1="67" x2="34" y2="65" />
          <line x1="23" y1="78" x2="28" y2="75" />

          {/* Puntadas costura derecha */}
          <line x1="77" y1="22" x2="72" y2="25" />
          <line x1="73" y1="32" x2="67" y2="34" />
          <line x1="69" y1="43" x2="63" y2="44" />
          <line x1="68" y1="55" x2="62" y2="54" />
          <line x1="72" y1="67" x2="66" y2="65" />
          <line x1="77" y1="78" x2="72" y2="75" />
        </g>

        {/* Emblema central "5" sutil */}
        <circle cx="50" cy="50" r="12" fill="rgba(239, 68, 68, 0.12)" stroke="#ef4444" strokeWidth="0.8" opacity="0.6" />
        <text x="50" y="55" textAnchor="middle" fill="#dc2626" fontSize="14" fontWeight="900" fontFamily="sans-serif">5</text>

        {/* Brillo 3D */}
        <ellipse cx="36" cy="28" rx="16" ry="9" fill="url(#baseballGloss)" transform="rotate(-35 36 28)" />
      </svg>
    </div>
  );
}

// ── 5. Copa Dorada 3D para Navbar y Encabezados ─────────────
export function GoldTrophyIcon3D({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Resplandor dorado */}
      <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-md" />
      
      <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-[0_4px_8px_rgba(245,158,11,0.6)]">
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="25%" stopColor="#facc15" />
            <stop offset="60%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
          <linearGradient id="goldHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Asas laterales */}
        <path d="M 12 14 C 6 14, 6 24, 15 26" fill="none" stroke="url(#goldGradient)" strokeWidth="3" strokeLinecap="round" />
        <path d="M 36 14 C 42 14, 42 24, 33 26" fill="none" stroke="url(#goldGradient)" strokeWidth="3" strokeLinecap="round" />

        {/* Cuerpo de la copa */}
        <path d="M 14 10 L 34 10 C 34 22, 28 28, 24 28 C 20 28, 14 22, 14 10 Z" fill="url(#goldGradient)" />
        
        {/* Brillo en el cuerpo */}
        <path d="M 16 12 L 20 12 C 20 20, 18 24, 16 22 Z" fill="url(#goldHighlight)" />

        {/* Tallo */}
        <path d="M 22 28 L 26 28 L 26 34 L 22 34 Z" fill="url(#goldGradient)" />
        
        {/* Base escalonada */}
        <path d="M 18 34 L 30 34 L 32 38 L 16 38 Z" fill="url(#goldGradient)" />
        <rect x="14" y="38" width="20" height="4" rx="1" fill="#713f12" stroke="#facc15" strokeWidth="1" />

        {/* Estrella brillante en el centro */}
        <polygon points="24,15 25.5,18.5 29,19 26.5,21.5 27,25 24,23 21,25 21.5,21.5 19,19 22.5,18.5" fill="#ffffff" opacity="0.95" />
      </svg>
    </div>
  );
}
