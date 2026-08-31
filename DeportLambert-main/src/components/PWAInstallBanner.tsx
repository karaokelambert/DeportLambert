"use client";

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';
import { InstallAppModal } from './PortalModals';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Verificar si ya está en modo standalone (PWA instalada)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detección de iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    // Si ya existe prompt previo
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
    }

    // Listener para beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.deferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      console.log('[JL360 PWA] Evento beforeinstallprompt listo para activación directa.');
    };

    // Listener cuando la app ya se instaló
    const handleAppInstalled = () => {
      console.log('[JL360 PWA] App instalada correctamente.');
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    const handleOpenModal = () => setModalOpen(true);
    window.addEventListener('open-pwa-modal', handleOpenModal);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-pwa-modal', handleOpenModal);
    };
  }, []);

  const handleDirectInstall = async () => {
    const promptEvent = deferredPrompt || window.deferredPrompt;
    
    if (promptEvent && typeof promptEvent.prompt === 'function') {
      try {
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        console.log('[JL360 PWA] Elección del usuario:', choiceResult.outcome);
        
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          window.deferredPrompt = null;
        }
      } catch (err) {
        console.error('[JL360 PWA] Error al ejecutar prompt:', err);
        setModalOpen(true);
      }
    } else {
      // Si el navegador no soporta prompt automático (ej. Safari iOS o PC sin prompt activo), abrir modal guiado
      setModalOpen(true);
    }
  };

  // Si ya está instalada o el usuario lo cerró en la sesión, no mostrar banner flotante
  if (isInstalled || dismissed) {
    return <InstallAppModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />;
  }

  return (
    <>
      {/* ── Banner Flotante Destacado de Instalación Directa PWA ── */}
      <aside 
        aria-label="Instalación de Aplicación JL Sports 360"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-bounce-subtle"
      >
        <div className="relative overflow-hidden rounded-3xl bg-slate-950/95 border-2 border-amber-500/80 shadow-[0_10px_40px_rgba(245,158,11,0.4)] backdrop-blur-2xl p-4 sm:p-5 text-white transition-all">
          
          {/* Luz de neón decorativa */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-orange-500/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
          
          {/* Botón Cerrar banner */}
          <button
            onClick={() => setDismissed(true)}
            aria-label="Cerrar banner de instalación"
            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5 pr-6 mb-3">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.5)] shrink-0 flex items-center justify-center">
              <img 
                src="/pwa-192x192.png" 
                alt="Logo JL Sports Club 360" 
                className="w-full h-full object-contain rounded-[14px]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[9px] font-black uppercase text-amber-300 tracking-wider mb-1">
                <Sparkles className="w-2.5 h-2.5" /> PWA OFICIAL
              </div>
              <h4 className="text-sm font-black uppercase tracking-tight text-white leading-tight">
                JL Sports Club 360
              </h4>
              <p className="text-[11px] text-slate-300 font-semibold">
                {isIOS ? 'Añade a tu pantalla de inicio' : 'Instalación instantánea 1 clic'}
              </p>
            </div>
          </div>

          {/* Botón de Instalación Directa Destacado */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleDirectInstall}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-slate-950 font-black uppercase text-xs sm:text-sm tracking-wider shadow-lg shadow-orange-600/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="text-base">📲</span>
              <span>Instalar App JL Sports 360</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Modal con instrucciones detalladas si se requiere */}
      <InstallAppModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
