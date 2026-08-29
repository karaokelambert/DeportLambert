"use client";

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Share2, 
  Settings, 
  X, 
  Copy, 
  Check, 
  Smartphone, 
  Monitor, 
  Volume2, 
  VolumeX, 
  Bell, 
  ShieldCheck, 
  Sparkles,
  QrCode,
  Sliders,
  Palette,
  CheckCircle2,
  Save,
  Globe,
  Plus,
  Trash2,
  Edit3,
  KeyRound,
  UserCheck,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Phone,
  Layers,
  Award,
  Users,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { DisciplineData, DISCIPLINES } from './DisciplinesPortal';
import { 
  BasketballIcon3D, 
  VolleyballIcon3D, 
  FutsalIcon3D, 
  BaseballIcon3D,
  GoldTrophyIcon3D
} from './SportsIcons3D';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── 1. Modal Instalar App ─────────────────────────────────────
export function InstallAppModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  const handleInstallClick = () => {
    const deferredPrompt = (window as unknown as { deferredPrompt?: { prompt: () => void } }).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
    } else {
      alert('Para instalar en tu dispositivo:\n\n📱 En Móvil: Abre las opciones del navegador y selecciona "Agregar a la pantalla de inicio".\n💻 En PC: Haz clic en el icono de instalación en la barra de direcciones.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-slate-100 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/40">
            <Download className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-wide text-white">Instalar JL Sports Club 360</h3>
            <p className="text-xs text-amber-400/90 font-medium">Experiencia nativa PWA ultrarrápida y sin conexión</p>
          </div>
        </div>

        <div className="space-y-4 my-6">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <Smartphone className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-white uppercase">En Teléfonos (Android / iOS)</p>
              <p className="text-xs text-slate-300 mt-1">
                Toca los 3 puntos (o botón Compartir en Safari) y pulsa <strong className="text-amber-400">"Instalar Aplicación"</strong> o <strong className="text-amber-400">"Añadir a pantalla de inicio"</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <Monitor className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-white uppercase">En Computadoras (Chrome / Edge)</p>
              <p className="text-xs text-slate-300 mt-1">
                Haz clic en el icono de instalación en el lateral derecho de la barra de direcciones del navegador.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 py-3.5 px-6 rounded-2xl font-black uppercase text-xs tracking-wider bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 shadow-lg shadow-orange-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Instalar en este dispositivo
          </button>
          <button
            onClick={onClose}
            className="py-3.5 px-6 rounded-2xl font-bold uppercase text-xs tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 2. Modal Compartir App ───────────────────────────────────
export function ShareAppModal({ isOpen, onClose }: ModalProps) {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://jlsportsclub360.app';

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'JL Sports Club 360 – Centro de Gestión Deportiva',
          text: 'Accede a los torneos de Baloncesto, Voleibol, Fútbol Sala y Béisbol Five en tiempo real.',
          url: currentUrl,
        });
      } catch {
        /* share cancelado */
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-slate-100 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600" />
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-wide text-white">Compartir App</h3>
            <p className="text-xs text-cyan-400 font-medium">Invita a delegados, jugadores y fanáticos</p>
          </div>
        </div>

        {/* Visual QR decorativo */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3 my-5">
          <div className="w-32 h-32 bg-white rounded-xl p-2.5 flex items-center justify-center shadow-inner">
            <QrCode className="w-full h-full text-slate-900" />
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
            Escanea para acceder directo al portal
          </p>
        </div>

        {/* Input con enlace */}
        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 p-2 rounded-xl">
          <input 
            type="text" 
            readOnly 
            value={currentUrl} 
            className="bg-transparent text-xs text-slate-300 flex-1 outline-none px-2 font-mono truncate"
          />
          <button
            onClick={handleCopyLink}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={handleNativeShare}
            className="w-full py-3 rounded-xl font-bold uppercase text-xs tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-700/30 transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" /> Compartir Enlace
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 3. Modal Configurar & SuperAdmin ──────────────────────────

export interface SuperAdminUser {
  id: string;
  name: string;
  user: string;
  pin: string;
  role: string;
  disciplineId?: string;
  disciplineName?: string;
}

// ── 3. Modal Configurar & SuperAdmin ──────────────────────────
export function SettingsAppModal({ 
  isOpen, 
  onClose,
  branding,
  onSaveBranding,
  disciplines = DISCIPLINES,
  onUpdateDisciplines,
  admins,
  onUpdateAdmins,
}: ModalProps & {
  branding?: { title: string, subtitle: string, season: string },
  onSaveBranding?: (b: { title: string, subtitle: string, season: string }) => void,
  disciplines?: DisciplineData[],
  onUpdateDisciplines?: (d: DisciplineData[]) => void,
  admins?: SuperAdminUser[],
  onUpdateAdmins?: (a: SuperAdminUser[]) => void,
}) {
  // ── Modo General vs Modo SuperAdmin ─────────────────────────
  const [modalSection, setModalSection] = useState<'general' | 'superadmin'>('general');

  // ── Estado de Autenticación de Superadmin ───────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // ── Sub-Pestañas del Panel SuperAdmin (Solo 3 pestañas: Disciplinas, Branding y Admins) ──
  const [superAdminTab, setSuperAdminTab] = useState<'disciplinas' | 'branding' | 'admins'>('disciplinas');

  // ── Preferencias Generales ──────────────────────────────────
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [liveAutoRefresh, setLiveAutoRefresh] = useState(true);
  
  // ── Branding Local ──────────────────────────────────────────
  const [localTitle, setLocalTitle] = useState(branding?.title || 'JL Sports Club 360');
  const [localSubtitle, setLocalSubtitle] = useState(branding?.subtitle || 'CENTRO DE GESTIÓN DEPORTIVA');
  const [localSeason, setLocalSeason] = useState(branding?.season || 'TEMPORADA 2026');

  // ── Lista Local de Disciplinas ──────────────────────────────
  const [localDisciplines, setLocalDisciplines] = useState<DisciplineData[]>(disciplines);
  const [editingDiscId, setEditingDiscId] = useState<string | null>(null);

  // Formulario de Nueva Disciplina
  const [showNewDiscForm, setShowNewDiscForm] = useState(false);
  const [newDiscTitle, setNewDiscTitle] = useState('');
  const [newDiscCategory, setNewDiscCategory] = useState('');
  const [newDiscSubtitle, setNewDiscSubtitle] = useState('');
  const [newDiscIcon, setNewDiscIcon] = useState<DisciplineData['icon']>('basketball');
  const [newDiscCustomLogo, setNewDiscCustomLogo] = useState<string>('');

  // ── Lista Local de Administradores con Disciplina Asignada ───
  const defaultAdmins: SuperAdminUser[] = [
    { id: '1', name: 'José Lambert', user: 'jlambert', pin: '123456', role: 'Superadministrador Principal', disciplineId: 'global', disciplineName: 'Todas las Disciplinas (Global)' },
    { id: '2', name: 'Administrador Baloncesto', user: 'admin_basket', pin: '123', role: 'Administrador de Disciplina', disciplineId: 'baloncesto', disciplineName: 'Baloncesto STOB' },
    { id: '3', name: 'Administrador Voleibol', user: 'admin_voley', pin: '123', role: 'Administrador de Disciplina', disciplineId: 'voleibol', disciplineName: 'Voleibol Femenino Master' },
  ];
  const [localAdmins, setLocalAdmins] = useState<SuperAdminUser[]>(admins || defaultAdmins);
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});

  // Formulario de Nuevo Administrador
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPin, setNewAdminPin] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('Administrador de Disciplina');
  const [newAdminDiscipline, setNewAdminDiscipline] = useState('global');

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sincronizar si cambian las props
  useEffect(() => {
    if (disciplines) setLocalDisciplines(disciplines);
  }, [disciplines]);

  useEffect(() => {
    if (admins) setLocalAdmins(admins);
  }, [admins]);

  if (!isOpen) return null;

  // ── Helper para Cargar Imagen Local (FileReader Base64) ─────
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, onComplete: (dataUrl: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen seleccionada es mayor a 5MB. Por favor selecciona una imagen más liviana.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onComplete(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ── Bloqueo Automático al Cerrar ────────────────────────────
  const handleModalClose = () => {
    setIsAuthenticated(false);
    setAuthPassword('');
    setAuthUsername('');
    setAuthError(null);
    setModalSection('general');
    onClose();
  };

  // ── Login de Superadmin ─────────────────────────────────────
  const handleSuperAdminLogin = () => {
    const enteredPin = authPassword.trim();
    if (enteredPin === '123456' || localAdmins.some(a => (a.pin === enteredPin || a.user === authUsername.trim()) && (a.role === 'Superadministrador Principal' || a.disciplineId === 'global'))) {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('⚠️ Clave o credenciales de Superadministrador incorrectas.');
    }
  };

  // ── Handlers de Disciplinas ─────────────────────────────────
  const handleUpdateSingleDiscipline = (id: string, updates: Partial<DisciplineData>) => {
    setLocalDisciplines(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const handleDeleteDiscipline = (id: string) => {
    if (localDisciplines.length <= 1) {
      alert('Debe existir al menos una disciplina en el sistema.');
      return;
    }
    if (confirm('¿Estás seguro de eliminar esta disciplina de la pantalla principal?')) {
      setLocalDisciplines(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleCreateDiscipline = () => {
    if (!newDiscTitle.trim()) {
      alert('Por favor ingresa un nombre para la disciplina.');
      return;
    }
    const newId = newDiscTitle.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Date.now();
    const newNum = `DISCIPLINA ${localDisciplines.length + 1}`;
    
    let accent = 'from-orange-500/20 via-amber-500/10 to-transparent';
    let badgeCol = 'bg-amber-950/70 border-amber-500/50 text-amber-400';
    if (newDiscIcon === 'volleyball') {
      accent = 'from-cyan-500/20 via-blue-500/10 to-transparent';
      badgeCol = 'bg-cyan-950/70 border-cyan-500/50 text-cyan-400';
    } else if (newDiscIcon === 'futsal') {
      accent = 'from-emerald-500/20 via-teal-500/10 to-transparent';
      badgeCol = 'bg-emerald-950/70 border-emerald-500/50 text-emerald-400';
    } else if (newDiscIcon === 'baseball') {
      accent = 'from-rose-500/20 via-red-500/10 to-transparent';
      badgeCol = 'bg-rose-950/70 border-rose-500/50 text-rose-400';
    }

    const created: DisciplineData = {
      id: newId,
      badgeNumber: newNum,
      title: newDiscTitle.trim(),
      category: newDiscCategory.trim() || 'Torneo Oficial 2026',
      subtitle: newDiscSubtitle.trim() || 'Gestión integral de torneo',
      icon: newDiscCustomLogo ? 'custom' : newDiscIcon,
      customLogoUrl: newDiscCustomLogo || undefined,
      accentTheme: accent,
      badgeColor: badgeCol,
    };

    setLocalDisciplines(prev => [...prev, created]);
    setNewDiscTitle('');
    setNewDiscCategory('');
    setNewDiscSubtitle('');
    setNewDiscCustomLogo('');
    setShowNewDiscForm(false);
  };

  // ── Handlers de Administradores ─────────────────────────────
  const handleAddAdmin = () => {
    if (!newAdminName.trim() || !newAdminUser.trim() || !newAdminPin.trim()) {
      alert('Por favor completa todos los campos del nuevo administrador.');
      return;
    }
    
    const discObj = localDisciplines.find(d => d.id === newAdminDiscipline);
    const discName = newAdminDiscipline === 'global' ? 'Todas las Disciplinas (Global)' : (discObj?.title || newAdminDiscipline);

    const newAdmin: SuperAdminUser = {
      id: Date.now().toString(),
      name: newAdminName.trim(),
      user: newAdminUser.trim(),
      pin: newAdminPin.trim(),
      role: newAdminRole,
      disciplineId: newAdminDiscipline,
      disciplineName: discName,
    };

    setLocalAdmins(prev => [...prev, newAdmin]);
    setNewAdminName('');
    setNewAdminUser('');
    setNewAdminPin('');
    setNewAdminDiscipline('global');
  };

  const handleDeleteAdmin = (adminId: string) => {
    if (adminId === '1') {
      alert('No puedes eliminar al Superadministrador Principal.');
      return;
    }
    setLocalAdmins(prev => prev.filter(a => a.id !== adminId));
  };

  // ── Guardar Todo ────────────────────────────────────────────
  const handleSaveAll = () => {
    if (onSaveBranding) {
      onSaveBranding({
        title: localTitle,
        subtitle: localSubtitle,
        season: localSeason,
      });
    }
    if (onUpdateDisciplines) {
      onUpdateDisciplines(localDisciplines);
    }
    if (onUpdateAdmins) {
      onUpdateAdmins(localAdmins);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      handleModalClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" onClick={handleModalClose}>
      <div 
        className="w-full max-w-3xl max-h-[92vh] bg-[#0F172A] border-2 border-[#FF8A00] rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(255,138,0,0.3)] text-slate-100 relative overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF8A00] via-[#FFC107] to-[#8B5CF6]" />
        
        {/* Botón Cerrar (Bloquea y resetea automáticamente) */}
        <button 
          onClick={handleModalClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-20"
          title="Cerrar y Bloquear Configuración"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── Barra Superior de Navegación del Modal ── */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center p-1.5 shadow-md">
              <GoldTrophyIcon3D className="w-full h-full" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-wide">
                Configuración del Sistema
              </h3>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                {branding?.title || 'JL Sports Club 360'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Pestañas Principales: Ajustes Generales vs Superadministrador ── */}
        <div className="flex border-b border-slate-800 gap-2 mb-4">
          <button
            onClick={() => setModalSection('general')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-2 ${
              modalSection === 'general'
                ? 'border-[#00E676] text-[#00E676] bg-emerald-950/20 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" /> 1. Ajustes Generales
          </button>
          <button
            onClick={() => setModalSection('superadmin')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-2 ${
              modalSection === 'superadmin'
                ? 'border-[#FF8A00] text-[#FF8A00] bg-orange-950/20 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" /> 2. Superadministrador {isAuthenticated && '(Desbloqueado)'}
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECCIÓN 1: AJUSTES GENERALES (PÚBLICA / SIN CLAVE)          */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {modalSection === 'general' && (
          <div className="flex-1 overflow-y-auto space-y-4 py-2">
            <div className="bg-slate-900/90 border border-slate-700/70 rounded-2xl p-4 sm:p-5 space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">Preferencias de Experiencia</h4>
              
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-3">
                  {soundEnabled ? <Volume2 className="w-5 h-5 text-[#00E676]" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white">Efectos de Sonido y Silbatos</p>
                    <p className="text-[11px] text-slate-400">Sonidos al anotar puntos y alertas de partidos</p>
                  </div>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-[#00E676]' : 'bg-slate-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${soundEnabled ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white">Live Sync & Notificaciones</p>
                    <p className="text-[11px] text-slate-400">Sincronización en vivo y alertas automáticas de resultados</p>
                  </div>
                </div>
                <button
                  onClick={() => setLiveAutoRefresh(!liveAutoRefresh)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${liveAutoRefresh ? 'bg-cyan-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${liveAutoRefresh ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-700/70 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-slate-300">Versión del Sistema 360</p>
                <p className="text-[11px] text-slate-400 mt-0.5">JL Sports Club 360 Multi-Discipline Enterprise v2.4</p>
              </div>
              <span className="text-[10px] font-black uppercase text-[#00E676] bg-emerald-950 border border-emerald-500/40 px-3 py-1 rounded-full">
                Activo
              </span>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECCIÓN 2: SECCIÓN PRIVADA DE SUPERADMINISTRADOR            */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {modalSection === 'superadmin' && (
          !isAuthenticated ? (
            /* Sub-Pantalla: Login de Superadmin Privado y Limpio */
            <div className="py-4 space-y-5 animate-scale-in">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF8A00] to-amber-600 flex items-center justify-center shadow-lg shadow-orange-950/60 shrink-0">
                  <Lock className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-lg font-black uppercase tracking-wide text-white">Autenticación de Superadministrador</h4>
                  <p className="text-xs text-amber-400 font-bold mt-0.5">Acceso exclusivo a configuración central, disciplinas, logos y administradores</p>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                    Nombre de Usuario / Correo SuperAdmin
                  </label>
                  <input
                    type="text"
                    value={authUsername}
                    onChange={e => setAuthUsername(e.target.value)}
                    placeholder="Ingrese usuario Superadmin"
                    className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-[#FF8A00]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                    Clave PIN / Password SuperAdmin
                  </label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSuperAdminLogin()}
                    placeholder="Ingrese clave de acceso"
                    className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-[#FF8A00] tracking-widest text-center"
                  />
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-500 text-red-300 text-xs font-bold flex items-center gap-2">
                    <span>{authError}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSuperAdminLogin}
                  className="flex-1 py-3.5 px-6 rounded-xl font-black uppercase text-xs tracking-wider bg-[#FF8A00] hover:bg-orange-500 text-slate-950 shadow-lg shadow-orange-950/50 transition-all flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4 stroke-[2.5]" /> Desbloquear Panel Superadministrador
                </button>
              </div>
            </div>
          ) : (
            /* Sub-Pantalla: Panel Desbloqueado de Superadmin */
            <div className="flex-1 flex flex-col min-h-0 space-y-3">
              
              {/* Header de Superadmin Autorizado con botón Bloquear */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] animate-pulse" />
                  <span className="text-xs font-black uppercase text-[#00E676]">
                    Superusuario Activo: {authUsername || 'SUPERADMIN'}
                  </span>
                </div>
                <button
                  onClick={() => { setIsAuthenticated(false); setAuthPassword(''); setAuthUsername(''); }}
                  className="text-[10px] font-black uppercase px-3 py-1 rounded-lg bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white border border-red-700 transition-colors"
                  title="Bloquear sesión de Superadmin inmediatamente"
                >
                  Bloquear / Cerrar Sesión
                </button>
              </div>

              {/* Sub-Pestañas Superadmin (Exactamente 3 pestañas: DISCIPLINAS, EVENTO & LOGO, ADMINS) */}
              <div className="grid grid-cols-3 gap-1.5 border-b border-slate-800 pb-2">
                {[
                  { id: 'disciplinas', label: '🏆 Disciplinas' },
                  { id: 'branding',    label: '🏛️ Evento & Logo' },
                  { id: 'admins',      label: '🔑 Admins' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSuperAdminTab(tab.id as any)}
                    className={`py-2 px-1 text-[10px] sm:text-xs font-black uppercase rounded-lg transition-all truncate text-center ${
                      superAdminTab === tab.id
                        ? 'bg-[#FF8A00] text-slate-950 shadow-md font-black'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Contenido Scrollable de Superadmin */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[48vh]">

                {/* ── SUB-PESTAÑA A: DISCIPLINAS (Editar, Renombrar, Subir Logos Locales, Agregar, Quitar) ── */}
                {superAdminTab === 'disciplinas' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-slate-300">
                        Gestiona disciplinas, edita nombres y sube logos/avatares directamente desde tu computadora.
                      </p>
                      <button
                        onClick={() => setShowNewDiscForm(!showNewDiscForm)}
                        className="px-3 py-1.5 rounded-lg bg-[#FF8A00] hover:bg-orange-500 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" /> {showNewDiscForm ? 'Cancelar' : 'Nueva Disciplina'}
                      </button>
                    </div>

                    {/* Formulario de Nueva Disciplina */}
                    {showNewDiscForm && (
                      <div className="p-4 rounded-2xl bg-slate-900 border-2 border-[#FF8A00] space-y-3 animate-slide-in">
                        <h5 className="text-xs font-black uppercase text-[#FF8A00]">Nueva Disciplina Deportiva</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Nombre (ej. Baloncesto 3x3)</label>
                            <input
                              type="text"
                              placeholder="Nombre de la disciplina"
                              value={newDiscTitle}
                              onChange={e => setNewDiscTitle(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Categoría / Liga</label>
                            <input
                              type="text"
                              placeholder="ej. Torneo Máster Libre"
                              value={newDiscCategory}
                              onChange={e => setNewDiscCategory(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Subtítulo Descriptivo</label>
                            <input
                              type="text"
                              placeholder="Gestión integral de torneo"
                              value={newDiscSubtitle}
                              onChange={e => setNewDiscSubtitle(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-500"
                            />
                          </div>

                          {/* Carga de Logo Local o Selección 3D */}
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                              Logo / Avatar (Subir Archivo o Seleccionar 3D)
                            </label>
                            
                            {newDiscCustomLogo ? (
                              <div className="flex items-center gap-3 p-2 bg-slate-950 border border-amber-500/60 rounded-lg">
                                <img src={newDiscCustomLogo} alt="Logo" className="w-9 h-9 object-contain rounded-lg border border-slate-700 bg-slate-900" />
                                <div className="flex-1 overflow-hidden">
                                  <p className="text-[10px] font-black text-amber-400 uppercase truncate">Logo personalizado cargado</p>
                                  <button
                                    type="button"
                                    onClick={() => setNewDiscCustomLogo('')}
                                    className="text-[9px] font-bold text-red-400 hover:text-red-300 underline"
                                  >
                                    Quitar y usar ícono 3D
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <label className="flex-1 cursor-pointer py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-dashed border-amber-500/70 rounded-lg flex items-center justify-center gap-2 text-amber-400 text-xs font-bold transition-colors">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Subir Logo desde PC</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => handleImageFileUpload(e, url => setNewDiscCustomLogo(url))}
                                  />
                                </label>
                                <select
                                  value={newDiscIcon}
                                  onChange={e => setNewDiscIcon(e.target.value as any)}
                                  className="w-36 bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs font-bold text-slate-300 outline-none"
                                >
                                  <option value="basketball">🏀 Baloncesto</option>
                                  <option value="volleyball">🏐 Voleibol</option>
                                  <option value="futsal">⚽ Futsal</option>
                                  <option value="baseball">⚾ Béisbol 5</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={handleCreateDiscipline}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs rounded-xl shadow-md transition-colors"
                        >
                          + Guardar y Publicar Disciplina
                        </button>
                      </div>
                    )}

                    {/* Lista de Disciplinas con Edición Completa y Subida de Archivos */}
                    <div className="space-y-2.5">
                      {localDisciplines.map(disc => (
                        <div key={disc.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-2.5 transition-all">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-1 overflow-hidden shrink-0">
                                {disc.customLogoUrl ? (
                                  <img src={disc.customLogoUrl} alt={disc.title} className="w-full h-full object-contain" />
                                ) : (
                                  <span className="text-xl">
                                    {disc.icon === 'basketball' && '🏀'}
                                    {disc.icon === 'volleyball' && '🏐'}
                                    {disc.icon === 'futsal' && '⚽'}
                                    {disc.icon === 'baseball' && '⚾'}
                                    {disc.icon === 'custom' && '🏆'}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-black uppercase text-xs sm:text-sm text-white flex items-center gap-2">
                                  {disc.title}
                                  {disc.customLogoUrl && (
                                    <span className="text-[8px] font-black uppercase bg-amber-950 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded">
                                      Logo Propio
                                    </span>
                                  )}
                                </p>
                                <p className="text-[9px] text-slate-400 font-bold">{disc.category} · {disc.badgeNumber}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setEditingDiscId(editingDiscId === disc.id ? null : disc.id)}
                                className={`p-2 rounded-lg border transition-colors flex items-center gap-1 text-xs font-bold ${
                                  editingDiscId === disc.id
                                    ? 'bg-[#FF8A00] text-slate-950 border-amber-400 shadow-md'
                                    : 'bg-slate-800 hover:bg-amber-500/20 text-amber-400 border-slate-700'
                                }`}
                                title="Editar Disciplina y Cambiar Logo"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="text-[10px] hidden sm:inline">{editingDiscId === disc.id ? 'Cerrar' : 'Editar'}</span>
                              </button>
                              <button
                                onClick={() => handleDeleteDiscipline(disc.id)}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-red-950 text-red-400 border border-slate-700 transition-colors"
                                title="Eliminar Disciplina"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Panel de Edición Desplegado con Carga Directa de Archivo de Logo */}
                          {editingDiscId === disc.id && (
                            <div className="pt-3 border-t border-slate-800 space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-amber-500/30 animate-slide-in">
                              <div className="flex items-center justify-between">
                                <h6 className="text-[10px] font-black uppercase text-amber-400">
                                  Editar Información y Logo de {disc.title}
                                </h6>
                                <span className="text-[9px] text-slate-400 font-bold">Cambios en tiempo real</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Nombre / Título</label>
                                  <input
                                    type="text"
                                    value={disc.title}
                                    onChange={e => handleUpdateSingleDiscipline(disc.id, { title: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white outline-none focus:border-amber-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Categoría / Liga</label>
                                  <input
                                    type="text"
                                    value={disc.category}
                                    onChange={e => handleUpdateSingleDiscipline(disc.id, { category: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white outline-none focus:border-amber-500"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Subtítulo</label>
                                  <input
                                    type="text"
                                    value={disc.subtitle}
                                    onChange={e => handleUpdateSingleDiscipline(disc.id, { subtitle: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white outline-none focus:border-amber-500"
                                  />
                                </div>

                                {/* Logo / Avatar Upload */}
                                <div>
                                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">
                                    Logo / Avatar (Subir Archivo desde PC)
                                  </label>
                                  
                                  {disc.customLogoUrl ? (
                                    <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-amber-500/50 rounded-lg">
                                      <img src={disc.customLogoUrl} alt="Logo" className="w-7 h-7 object-contain rounded bg-slate-950" />
                                      <label className="cursor-pointer text-[9px] font-bold text-amber-400 hover:underline flex items-center gap-1">
                                        <Upload className="w-3 h-3" /> Reemplazar
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={e => handleImageFileUpload(e, url => handleUpdateSingleDiscipline(disc.id, { customLogoUrl: url, icon: 'custom' }))}
                                        />
                                      </label>
                                      <span className="text-slate-600">|</span>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateSingleDiscipline(disc.id, { customLogoUrl: undefined, icon: 'basketball' })}
                                        className="text-[9px] font-bold text-red-400 hover:text-red-300"
                                      >
                                        Usar Ícono 3D
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <label className="flex-1 cursor-pointer py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 border border-dashed border-amber-500/60 rounded-lg flex items-center justify-center gap-1.5 text-amber-400 text-[11px] font-bold transition-colors">
                                        <Upload className="w-3 h-3" />
                                        <span>Subir Imagen</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={e => handleImageFileUpload(e, url => handleUpdateSingleDiscipline(disc.id, { customLogoUrl: url, icon: 'custom' }))}
                                        />
                                      </label>
                                      <select
                                        value={disc.icon}
                                        onChange={e => handleUpdateSingleDiscipline(disc.id, { icon: e.target.value as any, customLogoUrl: undefined })}
                                        className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-[11px] font-bold text-amber-400 outline-none"
                                      >
                                        <option value="basketball">🏀 Baloncesto</option>
                                        <option value="volleyball">🏐 Voleibol</option>
                                        <option value="futsal">⚽ Futsal</option>
                                        <option value="baseball">⚾ Béisbol 5</option>
                                      </select>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingDiscId(null)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] rounded-lg shadow flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" /> Listo / Finalizar Edición
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── SUB-PESTAÑA B: NOMBRE DEL EVENTO Y BRANDING ── */}
                {superAdminTab === 'branding' && (
                  <div className="space-y-3.5">
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-3.5">
                      <h5 className="text-xs font-black uppercase text-amber-400">Identidad y Marca del Evento Principal</h5>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Nombre Comercial del Evento / Plataforma</label>
                        <input
                          type="text"
                          value={localTitle}
                          onChange={e => setLocalTitle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-[#FF8A00]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Lema / Subtítulo Institucional</label>
                        <input
                          type="text"
                          value={localSubtitle}
                          onChange={e => setLocalSubtitle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-[#FF8A00]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Temporada Oficial</label>
                        <input
                          type="text"
                          value={localSeason}
                          onChange={e => setLocalSeason(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-[#FF8A00]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SUB-PESTAÑA C: ADMINISTRADORES DEL SISTEMA CON ASIGNACIÓN POR DISCIPLINA ── */}
                {superAdminTab === 'admins' && (
                  <div className="space-y-3.5">
                    {/* Formulario de Nuevo Administrador con Selector Obligatorio de Disciplina Asignada */}
                    <div className="p-4 rounded-2xl bg-slate-900 border-2 border-[#8B5CF6] space-y-3">
                      <h5 className="text-xs font-black uppercase text-[#8B5CF6] flex items-center gap-2">
                        <KeyRound className="w-4 h-4" /> Agregar Nuevo Administrador
                      </h5>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Nombre Completo</label>
                          <input
                            type="text"
                            placeholder="Ej. Carlos Méndez"
                            value={newAdminName}
                            onChange={e => setNewAdminName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Usuario / ID de Acceso</label>
                          <input
                            type="text"
                            placeholder="Ej. admin_carlos"
                            value={newAdminUser}
                            onChange={e => setNewAdminUser(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Clave de Acceso / PIN</label>
                          <input
                            type="text"
                            placeholder="Ej. 123"
                            value={newAdminPin}
                            onChange={e => setNewAdminPin(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-black text-amber-400 outline-none tracking-wider text-center focus:border-purple-500"
                          />
                        </div>

                        {/* SELECTOR OBLIGATORIO: DISCIPLINA ASIGNADA */}
                        <div>
                          <label className="block text-[9px] font-black uppercase text-amber-400 mb-1">
                            Disciplina Asignada *
                          </label>
                          <select
                            value={newAdminDiscipline}
                            onChange={e => setNewAdminDiscipline(e.target.value)}
                            className="w-full bg-slate-950 border-2 border-amber-500/70 rounded-lg px-2.5 py-2 text-xs font-bold text-amber-300 outline-none focus:border-amber-400"
                          >
                            <option value="global">🌐 Todas las Disciplinas (Acceso Global)</option>
                            {localDisciplines.map(d => (
                              <option key={d.id} value={d.id}>
                                🏆 {d.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Rol / Privilegio</label>
                          <select
                            value={newAdminRole}
                            onChange={e => setNewAdminRole(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-500"
                          >
                            <option value="Administrador de Disciplina">Administrador de Disciplina</option>
                            <option value="Administrador General">Administrador General</option>
                            <option value="Mesa Técnica / Anotador">Mesa Técnica / Anotador</option>
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={handleAddAdmin}
                        className="w-full py-2.5 bg-[#8B5CF6] hover:bg-purple-500 text-white font-black uppercase text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Registrar Administrador
                      </button>
                    </div>

                    {/* Lista de Administradores con Disciplina Asignada */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-3">
                      <h5 className="text-xs font-black uppercase text-slate-300">Administradores Activos y Asignaciones</h5>
                      <div className="divide-y divide-slate-800">
                        {localAdmins.map(adm => {
                          const isPinVisible = showPins[adm.id] || false;
                          const discDisplay = adm.disciplineName || (adm.disciplineId === 'global' ? 'Todas las Disciplinas (Global)' : (localDisciplines.find(d => d.id === adm.disciplineId)?.title || adm.disciplineId)) || 'Todas las Disciplinas (Global)';
                          
                          return (
                            <div key={adm.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                              <div>
                                <p className="font-black uppercase text-xs text-white flex items-center gap-2">
                                  {adm.name}
                                  {adm.id === '1' && (
                                    <span className="text-[8px] bg-amber-950 text-amber-400 border border-amber-500/50 px-1.5 py-0.2 rounded font-mono uppercase">
                                      Principal
                                    </span>
                                  )}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-bold mt-0.5">
                                  <span>Usuario: <strong className="text-cyan-400 font-mono">@{adm.user}</strong></span>
                                  <span>·</span>
                                  <span>Rol: <strong className="text-purple-400">{adm.role}</strong></span>
                                  <span>·</span>
                                  <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 font-black text-[9px] uppercase">
                                    {discDisplay}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5 font-mono text-xs font-black text-amber-400">
                                  <span>{isPinVisible ? adm.pin : '••••••'}</span>
                                  <button 
                                    onClick={() => setShowPins(prev => ({ ...prev, [adm.id]: !isPinVisible }))}
                                    className="text-slate-500 hover:text-slate-300 transition-colors"
                                    title={isPinVisible ? "Ocultar PIN" : "Ver PIN"}
                                  >
                                    {isPinVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  </button>
                                </div>
                                {adm.id !== '1' && (
                                  <button
                                    onClick={() => handleDeleteAdmin(adm.id)}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-red-400 border border-slate-700 transition-colors"
                                    title="Revocar Acceso"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mensaje de Guardado Exitoso */}
              {savedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500 text-[#00E676] text-xs font-bold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Cambios de Superadministrador guardados y aplicados con éxito
                </div>
              )}

              {/* Botón de Guardar Todo */}
              <div className="pt-2">
                <button
                  onClick={handleSaveAll}
                  className="w-full py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider bg-gradient-to-r from-[#FF8A00] via-[#FFC107] to-[#8B5CF6] text-slate-950 hover:brightness-110 shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4 stroke-[2.5]" /> Guardar y Aplicar Cambios Globales
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ── 4. Modal de Sincronización en la Nube y Multi-Dispositivo (Supabase Realtime) ───
export function CloudSyncModal({
  isOpen,
  onClose,
  syncStatus,
  lastSyncTime,
  onForceSync,
}: {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: 'synced' | 'syncing' | 'offline';
  lastSyncTime: string;
  onForceSync: () => void;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [spUrl, setSpUrl] = useState('');
  const [spKey, setSpKey] = useState('');
  const [spChannel, setSpChannel] = useState('deportlambert_live');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('jl360_supabase_config_v2');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSpUrl(parsed.url || '');
          setSpKey(parsed.key || '');
          setSpChannel(parsed.channel || 'deportlambert_live');
        } catch (e) {}
      } else {
        setSpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kwjoxqydwquztdjrlfxg.supabase.co');
        setSpKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample_anon_key');
        setSpChannel('deportlambert_live');
      }
    }
  }, [isOpen]);

  const handleSaveConfig = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jl360_supabase_config_v2', JSON.stringify({
        url: spUrl.trim(),
        key: spKey.trim(),
        channel: spChannel.trim() || 'deportlambert_live'
      }));
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onForceSync();
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.3)] text-slate-100 relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[#00E676] to-cyan-500" />
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/60 p-2">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-wide text-white">Sincronización en Tiempo Real</h3>
            <p className="text-xs text-emerald-400 font-bold">Supabase Realtime · Teléfonos y Computadoras</p>
          </div>
        </div>

        {/* Estado actual */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400">Estado de Conexión:</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase ${
              syncStatus === 'synced'
                ? 'bg-emerald-950 border border-emerald-500 text-[#00E676]'
                : syncStatus === 'syncing'
                ? 'bg-amber-950 border border-amber-500 text-amber-300 animate-pulse'
                : 'bg-red-950 border border-red-500 text-red-400'
            }`}>
              <span className="h-2 w-2 rounded-full bg-current" />
              {syncStatus === 'synced' ? 'Nube Conectada y Sincronizada' : syncStatus === 'syncing' ? 'Transmitiendo Datos...' : 'Modo Offline / Local'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Última sincronización:</span>
            <span className="font-mono text-slate-200 font-bold">{lastSyncTime || 'Recién iniciada'}</span>
          </div>
        </div>

        {/* Explicación de funcionamiento */}
        <div className="space-y-3 mb-5 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-black uppercase text-white mb-0.5">Sincronización Instantánea Supabase</p>
              <p className="text-slate-300">Cada vez que un administrador registra o modifica un marcador, se transmite por WebSockets en tiempo real a todas las pantallas y teléfonos conectados simultáneamente.</p>
            </div>
          </div>
        </div>

        {/* Toggle Ajustes de Supabase */}
        <div className="mb-5 border-t border-slate-800/80 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center justify-between w-full"
          >
            <span>⚙️ Configuración del Proyecto Supabase (Opcional)</span>
            <span>{showAdvanced ? '▲ Ocultar' : '▼ Ver Credenciales'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-3 p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  NEXT_PUBLIC_SUPABASE_URL
                </label>
                <input
                  type="text"
                  value={spUrl}
                  onChange={e => setSpUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </label>
                <input
                  type="password"
                  value={spKey}
                  onChange={e => setSpKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  Canal Realtime (ID del Torneo)
                </label>
                <input
                  type="text"
                  value={spChannel}
                  onChange={e => setSpChannel(e.target.value)}
                  placeholder="deportlambert_live"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveConfig}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black uppercase text-xs rounded-xl shadow transition-colors"
              >
                {savedSuccess ? '✓ Credenciales Guardadas' : 'Guardar y Reconectar Supabase'}
              </button>
            </div>
          )}
        </div>

        {/* Botón de Sincronización Forzada */}
        <div className="flex gap-3">
          <button
            onClick={() => { onForceSync(); onClose(); }}
            className="flex-1 py-3 px-4 rounded-xl font-black uppercase text-xs tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" /> Sincronizar Ahora
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl font-bold uppercase text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

