"use client";

/**
 * SportsManager.tsx – JL Sports Club 360
 * ========================================
 * Centro de Gestión Deportiva Multi-Disciplina
 * 
 * ESPECIFICACIONES TÉCNICAS INTEGRADAS:
 *  1. Sistema de Autenticación Unificado con 3 Perfiles (Admin, Delegado con PIN, Fanático con Cédula y Bienvenida personalizada).
 *  2. Rediseño del Dashboard con resultados equilibrados, logos de equipos y edición rápida para Admin.
 *  3. Gestión de Equipos y Permisos por Rol (Restricción estricta de Delegado a su propia franquicia).
 *  4. MÓDULO DE CONFIGURACIÓN DE GRUPOS AVANZADO:
 *     - Selector Inicial de Formato de Competencia (Por Grupos, Todos Contra Todos / Round Robin, Eliminación Directa / Playoffs).
 *     - Asignación y Selección de Equipos por Desplegable en tiempo real.
 *     - Gestión Completa de Grupos: Crear Grupo, Modificar Nombre de Grupo y Eliminar Grupo (con reasignación segura).
 *     - Sección de Equipos Sin Asignar / Sin Grupo.
 *     - Visualizador Interactivo de Cuadro de Playoffs / Brackets.
 *  5. Módulo "Resultados Live" Optimizado (Logos fijos, panel compacto Q1-Q4 sin scroll excesivo, selector de juegos y Push).
 *  6. Tabla de Posiciones Dinámica por Grupos (Tablas independientes separadas por cada grupo con resaltado de clasificación).
 *  7. Seguridad y Auditoría en Tiempo Real (Exclusivo Admin, tabla viva de registros con Usuario, Cédula, Acción y Timestamp).
 *  8. Configuración SuperAdmin (Personalización de Nombre, Lema y Temporada).
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  Layers,
  CalendarDays,
  Trophy,
  Shield,
  LogOut,
  ChevronRight,
  Bell,
  BellOff,
  BellRing,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Save,
  MapPin,
  Clock,
  UserPlus,
  ShieldCheck,
  User,
  Upload,
  X,
  Download,
  HelpCircle,
  ArrowDownToLine,
  ExternalLink,
  BarChart3,
  Menu,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Activity,
  Play,
  RotateCcw,
  Check,
  Phone,
  Filter,
  Lock,
  Key,
  Flame,
  FileSpreadsheet,
  Settings,
  ChevronDown,
  GitBranch,
  SplitSquareVertical,
  CheckCheck,
  Shuffle,
  Eye,
  EyeOff,
  Cloud,
  CloudUpload,
  RefreshCw,
  Smartphone,
  Globe,
  Radio,
} from 'lucide-react';
import DisciplinesPortal, { DISCIPLINES, DisciplineData } from './DisciplinesPortal';
import Navbar360 from './Navbar360';
import { SuperAdminUser, CloudSyncModal } from './PortalModals';
import { BasketballIcon3D, VolleyballIcon3D, FutsalIcon3D, BaseballIcon3D, GoldTrophyIcon3D } from './SportsIcons3D';
import { 
  fetchStateFromCloud, 
  pushStateToCloud, 
  getLocalState,
  saveLocalState,
  getSyncConfig, 
  subscribeToRealtimeUpdates,
  SyncConfig, 
  CloudTournamentState 
} from '../lib/cloudSync';

// ── Tipos ────────────────────────────────────────────────────
export type Role = 'ADMIN' | 'DELEGADO' | 'VISITANTE';
export type TournamentFormat = 'groups' | 'round_robin' | 'playoffs';

export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeQuarters?: number[]; // [Q1, Q2, Q3, Q4]
  awayQuarters?: number[]; // [Q1, Q2, Q3, Q4]
  currentQuarter?: number;
  date: string;
  time: string;
  location: string;
  phase: string;
  status: 'Programado' | 'En Curso' | 'Finalizado';
}

export interface Team {
  id: string;
  name: string;
  delegado: string;
  telefono: string;
  jugadores: string[];
  logoUrl?: string;
  group: string; // 'Grupo A', 'Grupo B', 'Sin Grupo', etc.
  delegatePin?: string;
}

export interface TeamStanding {
  name: string;
  group: string;
  jj: number;
  jg: number;
  jp: number;
  pf: number;
  pc: number;
  dif: number;
  ptos: number;
}

export interface AuditLog {
  id: string;
  userName: string;
  userRole: Role;
  identifier: string;
  action: string;
  timestamp: string;
  type: 'auth' | 'score' | 'team' | 'group' | 'schedule';
}

// ── Datos Iniciales por Disciplina ───────────────────────────
const INITIAL_DISCIPLINE_DATA: Record<string, { teams: Team[], games: Game[], groups: string[] }> = {
  baloncesto: {
    groups: ['Grupo A', 'Grupo B'],
    teams: [
      { id: '1', name: 'Vikingos',     delegado: 'José Fuentes',    telefono: '0414-1234567', group: 'Grupo A', delegatePin: '1111', jugadores: ['José Alonso', 'Manuel Vélix', 'Daniel Cruz', 'Roberto Núñez'] },
      { id: '2', name: 'Motorratones', delegado: 'Manuel Fernández', telefono: '0412-7654321', group: 'Grupo A', delegatePin: '456',  jugadores: ['Mario Molino', 'Pedro García', 'Daniel García', 'Luis Maestre'] },
      { id: '3', name: 'ABC Caripito', delegado: 'Gerson Tamoy',    telefono: '0416-9998877', group: 'Grupo A', delegatePin: '2222', jugadores: ['Eric Lamberg', 'Fabián Perdomo', 'Daniel Álvarez', 'Bryan Ortiz'] },
      { id: '4', name: 'Halcones',     delegado: 'Jesús Mondaraín', telefono: '0424-5554433', group: 'Grupo B', delegatePin: '3333', jugadores: ['Daniel Montaraín', 'Pedro Casas', 'Manuel Véliz', 'Simón Acanto'] },
      { id: '5', name: 'CIBAPAC',      delegado: 'Andrés López',    telefono: '0414-0001122', group: 'Grupo B', delegatePin: '4444', jugadores: ['Luis Pérez', 'Carlos Rivas', 'Antonio Salazar'] },
      { id: '6', name: 'Spartans',     delegado: 'Luis Guerra',     telefono: '0412-3334455', group: 'Grupo B', delegatePin: '5555', jugadores: ['Kevin Rivera', 'Juan Díaz', 'Marcos Velásquez'] },
    ],
    games: [
      { id: '1', homeTeam: 'Vikingos',     awayTeam: 'Motorratones', homeScore: 84, awayScore: 72, homeQuarters: [22, 18, 24, 20], awayQuarters: [18, 20, 16, 18], date: '15-06-2026', time: '19:30', location: 'Gimnasio Cubierto', phase: 'Fase de Grupos', status: 'Finalizado' },
      { id: '2', homeTeam: 'ABC Caripito', awayTeam: 'Halcones',     homeScore: 45, awayScore: 42, homeQuarters: [15, 14, 16, 0],  awayQuarters: [12, 16, 14, 0],  date: '15-06-2026', time: '18:00', location: 'Gimnasio Cubierto', phase: 'Fase de Grupos', status: 'En Curso' },
      { id: '3', homeTeam: 'Vikingos',     awayTeam: 'Halcones',     homeScore: 0,  awayScore: 0,  homeQuarters: [0, 0, 0, 0],      awayQuarters: [0, 0, 0, 0],      date: '15-06-2026', time: '20:00', location: 'Gimnasio Cubierto', phase: 'Fase de Grupos', status: 'Programado' },
      { id: '4', homeTeam: 'Motorratones', awayTeam: 'ABC Caripito', homeScore: 0,  awayScore: 0,  homeQuarters: [0, 0, 0, 0],      awayQuarters: [0, 0, 0, 0],      date: '15-06-2026', time: '19:00', location: 'Gimnasio Cubierto', phase: 'Fase de Grupos', status: 'Programado' },
      { id: '5', homeTeam: 'CIBAPAC',      awayTeam: 'Spartans',     homeScore: 0,  awayScore: 0,  homeQuarters: [0, 0, 0, 0],      awayQuarters: [0, 0, 0, 0],      date: '15-06-2026', time: '21:00', location: 'Gimnasio Cubierto', phase: 'Fase de Grupos', status: 'Programado' },
    ]
  },
  voleibol: {
    groups: ['Grupo A', 'Grupo B'],
    teams: [
      { id: '1', name: 'Amazonas Voleibol', delegado: 'Elena Rojas',     telefono: '0414-8889900', group: 'Grupo A', delegatePin: '1111', jugadores: ['Carla Méndez', 'Patricia Gómez', 'Sofía Castillo', 'Valeria Silva'] },
      { id: '2', name: 'Panteras Master',   delegado: 'María Fernández', telefono: '0412-4445566', group: 'Grupo A', delegatePin: '2222', jugadores: ['Adriana Lugo', 'Carmen Bello', 'Daniela Paz', 'Lucía Torres'] },
      { id: '3', name: 'Águilas Doradas',   delegado: 'Yolanda Vargas',  telefono: '0424-2223344', group: 'Grupo A', delegatePin: '3333', jugadores: ['Gabriela Rivas', 'Lorena Ortiz', 'Marisol Mora', 'Natalia Gil'] },
      { id: '4', name: 'Fénix Club',        delegado: 'Teresa Blanco',   telefono: '0416-7778899', group: 'Grupo B', delegatePin: '4444', jugadores: ['Andrea Soto', 'Camila Peña', 'Jimena Cruz', 'Rosa Marcano'] },
      { id: '5', name: 'Valkirias',         delegado: 'Isabel Delgado',  telefono: '0414-3331122', group: 'Grupo B', delegatePin: '5555', jugadores: ['Ana Salazar', 'Diana Suárez'] },
      { id: '6', name: 'Titanes Volley',    delegado: 'Claudia Medina',  telefono: '0412-5556677', group: 'Grupo B', delegatePin: '6666', jugadores: ['Verónica León', 'Raquel Vidal'] },
    ],
    games: [
      { id: '1', homeTeam: 'Amazonas Voleibol', awayTeam: 'Panteras Master', homeScore: 3, awayScore: 1, homeQuarters: [25, 20, 25, 25], awayQuarters: [21, 25, 18, 19], date: '2026-06-14', time: '17:00', location: 'Gimnasio Techado', phase: 'Temporada Regular', status: 'Finalizado' },
      { id: '2', homeTeam: 'Águilas Doradas',   awayTeam: 'Fénix Club',      homeScore: 0, awayScore: 0, homeQuarters: [0, 0, 0, 0],     awayQuarters: [0, 0, 0, 0],     date: '2026-06-15', time: '18:30', location: 'Gimnasio Techado', phase: 'Temporada Regular', status: 'Programado' },
      { id: '3', homeTeam: 'Valkirias',         awayTeam: 'Titanes Volley',  homeScore: 0, awayScore: 0, homeQuarters: [0, 0, 0, 0],     awayQuarters: [0, 0, 0, 0],     date: '2026-06-16', time: '19:00', location: 'Cancha 2',         phase: 'Temporada Regular', status: 'Programado' },
    ]
  },
  futsal: {
    groups: ['Grupo A', 'Grupo B'],
    teams: [
      { id: '1', name: 'Atlético Futsal',       delegado: 'Roberto Sifontes', telefono: '0414-7771234', group: 'Grupo A', delegatePin: '1111', jugadores: ['Carlos Rondón', 'Miguel Ángel', 'Javier Peña', 'Oscar Luna'] },
      { id: '2', name: 'Deportivo Monagas',     delegado: 'Fernando Ruiz',    telefono: '0412-8884321', group: 'Grupo A', delegatePin: '2222', jugadores: ['Nelson Bravo', 'Víctor Sosa', 'Héctor Campos', 'Raúl Medina'] },
      { id: '3', name: 'Real Master FC',        delegado: 'Gonzalo Padrón',   telefono: '0416-9993344', group: 'Grupo A', delegatePin: '3333', jugadores: ['Armando Díaz', 'Freddy Ramos', 'Julio Navas', 'César Mora'] },
      { id: '4', name: 'Los Galácticos',        delegado: 'Marcos Herrera',   telefono: '0424-6667788', group: 'Grupo B', delegatePin: '4444', jugadores: ['Eduardo Pinto', 'Gabriel Rojas', 'Lucas Vera', 'Tomás Silva'] },
      { id: '5', name: 'Guerreros Tabloncillo', delegado: 'David Romero',     telefono: '0414-2228899', group: 'Grupo B', delegatePin: '5555', jugadores: ['Enrique Marín', 'Simón Acosta'] },
      { id: '6', name: 'Huracán FS',            delegado: 'Pablo Valera',     telefono: '0412-1114455', group: 'Grupo B', delegatePin: '6666', jugadores: ['Manuel Castillo', 'Iván Guerra'] },
    ],
    games: [
      { id: '1', homeTeam: 'Atlético Futsal',   awayTeam: 'Deportivo Monagas', homeScore: 5, awayScore: 3, homeQuarters: [3, 2, 0, 0], awayQuarters: [1, 2, 0, 0], date: '2026-06-14', time: '20:00', location: 'Tabloncillo Central', phase: 'Fase de Grupos', status: 'Finalizado' },
      { id: '2', homeTeam: 'Real Master FC',    awayTeam: 'Los Galácticos',    homeScore: 0, awayScore: 0, homeQuarters: [0, 0, 0, 0], awayQuarters: [0, 0, 0, 0], date: '2026-06-15', time: '21:00', location: 'Tabloncillo Central', phase: 'Fase de Grupos', status: 'Programado' },
      { id: '3', homeTeam: 'Guerreros Tabloncillo', awayTeam: 'Huracán FS',    homeScore: 0, awayScore: 0, homeQuarters: [0, 0, 0, 0], awayQuarters: [0, 0, 0, 0], date: '2026-06-16', time: '19:30', location: 'Tabloncillo Central', phase: 'Fase de Grupos', status: 'Programado' },
    ]
  },
  beisbol5: {
    groups: ['Grupo A', 'Grupo B'],
    teams: [
      { id: '1', name: 'Criollos B5',    delegado: 'Alex Cabrera',    telefono: '0414-9990011', group: 'Grupo A', delegatePin: '1111', jugadores: ['Jonathan Lugo', 'Brayan Solís', 'Keiver Rojas', 'Dayana Moreno'] },
      { id: '2', name: 'Diamantes BBC',  delegado: 'Ramón Hernández', telefono: '0412-3332211', group: 'Grupo A', delegatePin: '2222', jugadores: ['Franklin Márquez', 'José Colmenares', 'Mariana Padrón', 'Yorbis Gil'] },
      { id: '3', name: 'Rayos Béisbol 5',delegado: 'Gustavo Chacón',  telefono: '0416-5556677', group: 'Grupo A', delegatePin: '3333', jugadores: ['Wilmer Flores', 'Ángel Zerpa', 'Génesis León', 'Kevin Ramos'] },
      { id: '4', name: 'Relámpagos',     delegado: 'Héctor Sánchez',  telefono: '0424-8889900', group: 'Grupo B', delegatePin: '4444', jugadores: ['Jorge Arcia', 'Ender Inciarte', 'Mayerling Silva', 'Samuel Vega'] },
      { id: '5', name: 'Centauros',      delegado: 'Oswaldo Guillén', telefono: '0414-6665544', group: 'Grupo B', delegatePin: '5555', jugadores: ['Luis Aparicio Jr', 'César Tovar'] },
      { id: '6', name: 'Leones B5',      delegado: 'Víctor Davalillo',telefono: '0412-7778899', group: 'Grupo B', delegatePin: '6666', jugadores: ['Baudilio Díaz', 'Ugueth Urbina'] },
    ],
    games: [
      { id: '1', homeTeam: 'Criollos B5',     awayTeam: 'Diamantes BBC', homeScore: 6, awayScore: 4, homeQuarters: [2, 1, 0, 3], awayQuarters: [1, 0, 2, 1], date: '2026-06-14', time: '16:00', location: 'Plaza Central B5', phase: 'Ronda Regular', status: 'Finalizado' },
      { id: '2', homeTeam: 'Rayos Béisbol 5', awayTeam: 'Relámpagos',    homeScore: 0, awayScore: 0, homeQuarters: [0, 0, 0, 0], awayQuarters: [0, 0, 0, 0], date: '2026-06-15', time: '17:30', location: 'Plaza Central B5', phase: 'Ronda Regular', status: 'Programado' },
      { id: '3', homeTeam: 'Centauros',       awayTeam: 'Leones B5',     homeScore: 0, awayScore: 0, homeQuarters: [0, 0, 0, 0], awayQuarters: [0, 0, 0, 0], date: '2026-06-16', time: '18:00', location: 'Plaza Central B5', phase: 'Ronda Regular', status: 'Programado' },
    ]
  }
};

// ── Componente principal ──────────────────────────────────────
export default function SportsManager() {
  const [disciplinesList, setDisciplinesList] = useState<DisciplineData[]>(DISCIPLINES);
  const [registeredAdmins, setRegisteredAdmins] = useState<SuperAdminUser[]>([
    { id: '1', name: 'José Lambert', user: 'jlambert', pin: '123456', role: 'Superadministrador Principal', disciplineId: 'global', disciplineName: 'Todas las Disciplinas (Global)' },
    { id: '2', name: 'Administrador Baloncesto', user: 'admin_basket', pin: '123', role: 'Administrador de Disciplina', disciplineId: 'baloncesto', disciplineName: 'Baloncesto STOB' },
    { id: '3', name: 'Administrador Voleibol', user: 'admin_voley', pin: '123', role: 'Administrador de Disciplina', disciplineId: 'voleibol', disciplineName: 'Voleibol Femenino Master' },
    { id: '4', name: 'Administrador Futsal', user: 'admin_futsal', pin: '123', role: 'Administrador de Disciplina', disciplineId: 'futsal', disciplineName: 'Fútbol Sala Master Libre 2026' },
    { id: '5', name: 'Administrador Béisbol 5', user: 'admin_b5', pin: '123', role: 'Administrador de Disciplina', disciplineId: 'beisbol5', disciplineName: 'Béisbol Five' },
  ]);

  const [selectedDiscipline, setSelectedDiscipline] = useState<DisciplineData | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // ── Auth & Perfil State (Inicia limpio requiriendo autenticación por disciplina) ───
  const [role, setRole] = useState<Role>('VISITANTE');
  const [isLogged, setIsLogged] = useState(false);
  const [authProfile, setAuthProfile] = useState<'ADMIN' | 'DELEGADO' | 'FANATICO'>('FANATICO');
  const [userName, setUserName] = useState('');
  const [userCedula, setUserCedula] = useState('');
  const [delegateTeamId, setDelegateTeamId] = useState('');
  const [delegatePin, setDelegatePin] = useState('');
  const [showDelegatePin, setShowDelegatePin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);

  // ── Formato de Torneo ───────────────────────────────────────
  const [tournamentFormat, setTournamentFormat] = useState<TournamentFormat>('groups');

  // ── Branding / SuperAdmin ───────────────────────────────────
  const [branding, setBranding] = useState({
    title: 'JL Sports Club 360',
    subtitle: 'CENTRO DE GESTIÓN DEPORTIVA',
    season: 'TEMPORADA 2026',
  });

  // ── Auditoría en Tiempo Real ────────────────────────────────
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: '1', userName: 'Administrador General', userRole: 'ADMIN', identifier: '123', action: 'Sistema iniciado correctamente', timestamp: '2026-08-27 17:30:00', type: 'auth' },
    { id: '2', userName: 'José Fuentes', userRole: 'DELEGADO', identifier: 'PIN-1111', action: 'Acceso a nómina de Vikingos', timestamp: '2026-08-27 17:35:12', type: 'auth' },
  ]);

  const addAuditLog = useCallback((action: string, type: AuditLog['type'] = 'auth', customName?: string, customRole?: Role, customId?: string) => {
    const now = new Date();
    const formatted = now.toISOString().replace('T', ' ').substring(0, 19);
    const newEntry: AuditLog = {
      id: Date.now().toString(),
      userName: customName || userName || (role === 'ADMIN' ? 'Administrador' : role === 'DELEGADO' ? 'Delegado' : 'Fanático'),
      userRole: customRole || role,
      identifier: customId || userCedula || (role === 'ADMIN' ? '123' : 'PIN-AUTH'),
      action,
      timestamp: formatted,
      type,
    };
    setAuditLogs(prev => [newEntry, ...prev.slice(0, 99)]);
  }, [userName, role, userCedula]);

  const [showExportModal, setShowExportModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Sincronización en la Nube y Multi-Dispositivo ────────
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncConfig] = useState<SyncConfig>(getSyncConfig());

  // ── Estado de notificaciones ─────────────
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
      setNotifEnabled(Notification.permission === 'granted');
    }
  }, []);

  // ── Datos por disciplina con Supabase como Única Fuente de Verdad ──
  const [disciplineData, setDisciplineData] = useState<Record<string, { groups: string[], teams: Team[], games: Game[] }>>(INITIAL_DISCIPLINE_DATA);

  // Inicialización de datos desde Supabase con prioridad absoluta
  const localVersionRef = useRef<number>(1);
  const localUpdatedAtRef = useRef<number>(0);
  const isHydratedRef = useRef<boolean>(false);
  const isLocallyMutatingRef = useRef<boolean>(false);
  const localMutationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const disciplineDataRef = useRef(disciplineData);
  disciplineDataRef.current = disciplineData;

  useEffect(() => {
    async function initCloud() {
      try {
        setSyncStatus('syncing');
        // 1. Consultar PRIMERO la nube Supabase como Fuente Única de Verdad
        const remote = await fetchStateFromCloud(syncConfig);
        if (remote && remote.disciplineData && Object.keys(remote.disciplineData).length > 0) {
          disciplineDataRef.current = remote.disciplineData;
          setDisciplineData(remote.disciplineData);
          if (remote.disciplinesList) setDisciplinesList(remote.disciplinesList);
          if (remote.branding) setBranding(remote.branding);
          if (remote.registeredAdmins) setRegisteredAdmins(remote.registeredAdmins);
          localVersionRef.current = Math.max(remote.version || 1, localVersionRef.current);
          localUpdatedAtRef.current = remote.updatedAt || Date.now();
          setLastSyncTime(new Date(localUpdatedAtRef.current).toLocaleTimeString());
          saveLocalState(remote);
        } else {
          // 2. Solo si no hay conexión a Supabase se cargan datos locales de rescate
          const local = getLocalState();
          if (local && local.disciplineData && Object.keys(local.disciplineData).length > 0) {
            disciplineDataRef.current = local.disciplineData;
            setDisciplineData(local.disciplineData);
            if (local.disciplinesList) setDisciplinesList(local.disciplinesList);
            if (local.branding) setBranding(local.branding);
            if (local.registeredAdmins) setRegisteredAdmins(local.registeredAdmins);
            if (local.version) localVersionRef.current = local.version;
            if (local.updatedAt) localUpdatedAtRef.current = local.updatedAt;
          }
        }
        setSyncStatus('synced');
      } catch (e) {
        setSyncStatus('offline');
      } finally {
        isHydratedRef.current = true;
      }
    }
    initCloud();
  }, [syncConfig]);

  // Aplicar actualización remota de forma segura sin re-empujar datos
  const applyRemoteUpdate = useCallback((remote: CloudTournamentState) => {
    if (!remote || !remote.disciplineData || Object.keys(remote.disciplineData).length === 0) return;
    
    // Si estamos editando localmente en este mismo instante, no sobreescribir
    if (isLocallyMutatingRef.current) return;

    const remoteStr = JSON.stringify(remote.disciplineData);
    const localStr = JSON.stringify(disciplineDataRef.current);

    // Si los datos en la nube son diferentes o la versión es mayor, actualizar inmediatamente
    if (remoteStr !== localStr || (remote.version && remote.version > localVersionRef.current)) {
      disciplineDataRef.current = remote.disciplineData;
      setDisciplineData(remote.disciplineData);
      if (remote.disciplinesList) setDisciplinesList(remote.disciplinesList);
      if (remote.branding) setBranding(remote.branding);
      if (remote.registeredAdmins) setRegisteredAdmins(remote.registeredAdmins);
      localVersionRef.current = Math.max(remote.version || 1, localVersionRef.current);
      localUpdatedAtRef.current = remote.updatedAt || Date.now();
      setLastSyncTime(new Date(localUpdatedAtRef.current).toLocaleTimeString());
      setSyncStatus('synced');
      saveLocalState(remote);
    }
  }, []);

  // Escuchar actualizaciones en tiempo real (Supabase Channel WebSockets + Broadcast)
  useEffect(() => {
    const unsub = subscribeToRealtimeUpdates((remote) => {
      applyRemoteUpdate(remote);
    });
    return unsub;
  }, [applyRemoteUpdate]);

  // Polling de respaldo cada 2s para sincronizar marcadores y equipos inmediatamente
  useEffect(() => {
    const timer = setInterval(async () => {
      if (!syncConfig.enabled || isLocallyMutatingRef.current) return;
      try {
        const remote = await fetchStateFromCloud(syncConfig);
        if (remote) {
          applyRemoteUpdate(remote);
        }
      } catch (e) {}
    }, 2000);

    return () => clearInterval(timer);
  }, [syncConfig, applyRemoteUpdate]);

  // Función de sincronización forzada exclusiva para acciones del usuario
  const triggerPushSync = useCallback(async (customData?: Partial<CloudTournamentState>) => {
    const now = Date.now();
    const nextVersion = now;
    localVersionRef.current = nextVersion;
    localUpdatedAtRef.current = now;
    isLocallyMutatingRef.current = true;
    if (localMutationTimeoutRef.current) clearTimeout(localMutationTimeoutRef.current);

    setSyncStatus('syncing');
    const currentDataToPush = customData?.disciplineData || disciplineDataRef.current || disciplineData;

    const payload: CloudTournamentState = {
      version: nextVersion,
      updatedAt: now,
      updatedBy: userName || role,
      disciplineData: currentDataToPush,
      disciplinesList: customData?.disciplinesList || disciplinesList,
      branding: customData?.branding || branding,
      registeredAdmins: customData?.registeredAdmins || registeredAdmins,
    };
    saveLocalState(payload);
    const ok = await pushStateToCloud(payload, syncConfig);
    setSyncStatus(ok ? 'synced' : 'offline');
    setLastSyncTime(new Date(now).toLocaleTimeString());

    localMutationTimeoutRef.current = setTimeout(() => {
      isLocallyMutatingRef.current = false;
    }, 500);
  }, [disciplineData, disciplinesList, branding, registeredAdmins, syncConfig, userName, role]);

  const currentDiscKey = selectedDiscipline ? selectedDiscipline.id : 'baloncesto';
  const defaultForCurrentDisc = INITIAL_DISCIPLINE_DATA[currentDiscKey] || { teams: [], games: [], groups: ['Grupo A', 'Grupo B'] };

  const currentTeams = disciplineData[currentDiscKey]?.teams || defaultForCurrentDisc.teams;
  const currentGames = disciplineData[currentDiscKey]?.games || defaultForCurrentDisc.games;
  const currentGroups = disciplineData[currentDiscKey]?.groups || defaultForCurrentDisc.groups;

  const setTeams = (action: React.SetStateAction<Team[]>) => {
    setDisciplineData(prev => {
      const discState = prev[currentDiscKey] || defaultForCurrentDisc;
      const curr = discState.teams;
      const updated = typeof action === 'function' ? action(curr) : action;
      const nextDisciplineData = {
        ...prev,
        [currentDiscKey]: {
          ...discState,
          teams: updated,
        }
      };
      disciplineDataRef.current = nextDisciplineData;
      triggerPushSync({ disciplineData: nextDisciplineData });
      return nextDisciplineData;
    });
  };

  const setGames = (action: React.SetStateAction<Game[]>) => {
    setDisciplineData(prev => {
      const discState = prev[currentDiscKey] || defaultForCurrentDisc;
      const curr = discState.games;
      const updated = typeof action === 'function' ? action(curr) : action;
      const nextDisciplineData = {
        ...prev,
        [currentDiscKey]: {
          ...discState,
          games: updated,
        }
      };
      disciplineDataRef.current = nextDisciplineData;
      triggerPushSync({ disciplineData: nextDisciplineData });
      return nextDisciplineData;
    });
  };

  const setGroups = (action: React.SetStateAction<string[]>) => {
    setDisciplineData(prev => {
      const discState = prev[currentDiscKey] || defaultForCurrentDisc;
      const curr = discState.groups;
      const updated = typeof action === 'function' ? action(curr) : action;
      const nextDisciplineData = {
        ...prev,
        [currentDiscKey]: {
          ...discState,
          groups: updated,
        }
      };
      disciplineDataRef.current = nextDisciplineData;
      triggerPushSync({ disciplineData: nextDisciplineData });
      return nextDisciplineData;
    });
  };

  // ── Handlers de Formato de Torneo ──────────────────────────
  const handleFormatChange = (newFormat: TournamentFormat) => {
    setTournamentFormat(newFormat);
    if (newFormat === 'round_robin') {
      setGroups(['Grupo Único']);
      setTeams(prev => prev.map(t => ({ ...t, group: 'Grupo Único' })));
      addAuditLog('Formato de torneo cambiado a: Todos Contra Todos (Round Robin)', 'group');
    } else if (newFormat === 'groups') {
      if (currentGroups.length === 1 && currentGroups[0] === 'Grupo Único') {
        const defaultG = ['Grupo A', 'Grupo B'];
        setGroups(defaultG);
        setTeams(prev => prev.map((t, i) => ({ ...t, group: defaultG[i % 2] })));
      }
      addAuditLog('Formato de torneo cambiado a: Por Grupos (Fase de Grupos)', 'group');
    } else if (newFormat === 'playoffs') {
      addAuditLog('Formato de torneo cambiado a: Eliminación Directa (Playoffs / Bracket)', 'group');
    }
  };

  // ── Renombrar y Eliminar Grupo ─────────────────────────────
  const handleRenameGroup = (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) return;
    setGroups(prev => prev.map(g => g === oldName ? newName.trim() : g));
    setTeams(prev => prev.map(t => t.group === oldName ? { ...t, group: newName.trim() } : t));
    addAuditLog(`Grupo renombrado: "${oldName}" a "${newName.trim()}"`, 'group');
  };

  const handleDeleteGroup = (groupNameToDelete: string) => {
    if (currentGroups.length <= 1) {
      alert('Debe existir al menos un grupo en el torneo.');
      return;
    }
    const remainingGroups = currentGroups.filter(g => g !== groupNameToDelete);
    setGroups(remainingGroups);
    // Los equipos del grupo eliminado pasan a "Sin Grupo" o al primer grupo restante
    setTeams(prev => prev.map(t => t.group === groupNameToDelete ? { ...t, group: 'Sin Grupo' } : t));
    addAuditLog(`Grupo "${groupNameToDelete}" eliminado. Equipos reasignados a "Sin Grupo"`, 'group');
  };

  // ── Disparador central de notificaciones Push ────────────
  const triggerNotification = useCallback((title: string, body: string, gameId?: string) => {
    if (notifEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        new Notification(title, {
          body,
          icon: '/icon-192.png',
          tag: gameId ? `game-end-${gameId}` : 'sports-notification',
          badge: '/icon-192.png',
        });
      } catch (_) { /* browser context fail-safe */ }
    }

    try {
      fetch('/api/push-notifications/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          homeTeam: body.split(':')[1]?.split('vs')[0]?.trim() || 'Equipo Local',
          awayTeam: body.split('vs')[1]?.trim() || 'Equipo Visitante',
          homeScore: 0,
          awayScore: 0,
          status: 'Finalizado',
        }),
      }).catch(() => { /* webhook fail-safe */ });
    } catch (_) {}
  }, [notifEnabled]);

  // ── Cálculo de posiciones por Grupos (useMemo) ────
  const standingsByGroup = useMemo(() => {
    const groupMap: Record<string, Record<string, TeamStanding>> = {};
    
    // Inicializar cada grupo
    currentGroups.forEach(g => {
      groupMap[g] = {};
    });

    currentTeams.forEach(team => {
      const g = team.group && currentGroups.includes(team.group) ? team.group : currentGroups[0] || 'Grupo A';
      if (!groupMap[g]) groupMap[g] = {};
      groupMap[g][team.name] = { name: team.name, group: g, jj: 0, jg: 0, jp: 0, pf: 0, pc: 0, dif: 0, ptos: 0 };
    });

    currentGames.forEach(game => {
      if (game.status === 'Finalizado') {
        const homeTeamObj = currentTeams.find(t => t.name === game.homeTeam);
        const awayTeamObj = currentTeams.find(t => t.name === game.awayTeam);
        const homeGroup = homeTeamObj?.group && currentGroups.includes(homeTeamObj.group) ? homeTeamObj.group : currentGroups[0] || 'Grupo A';
        const awayGroup = awayTeamObj?.group && currentGroups.includes(awayTeamObj.group) ? awayTeamObj.group : currentGroups[0] || 'Grupo A';

        const homeStat = groupMap[homeGroup]?.[game.homeTeam];
        const awayStat = groupMap[awayGroup]?.[game.awayTeam];

        if (homeStat) {
          homeStat.jj += 1;
          homeStat.pf += game.homeScore;
          homeStat.pc += game.awayScore;
          if (game.homeScore > game.awayScore) {
            homeStat.jg += 1;
            homeStat.ptos += 2;
          } else {
            homeStat.jp += 1;
            homeStat.ptos += 1;
          }
          homeStat.dif = homeStat.pf - homeStat.pc;
        }

        if (awayStat) {
          awayStat.jj += 1;
          awayStat.pf += game.awayScore;
          awayStat.pc += game.homeScore;
          if (game.awayScore > game.homeScore) {
            awayStat.jg += 1;
            awayStat.ptos += 2;
          } else {
            awayStat.jp += 1;
            awayStat.ptos += 1;
          }
          awayStat.dif = awayStat.pf - awayStat.pc;
        }
      }
    });

    const result: Record<string, TeamStanding[]> = {};
    Object.keys(groupMap).forEach(g => {
      result[g] = Object.values(groupMap[g]).sort((a, b) => b.ptos - a.ptos || b.dif - a.dif);
    });
    return result;
  }, [currentGames, currentTeams, currentGroups]);

  // ── Auth Handlers para los 3 Perfiles ──────────────────────
  const handleLoginSubmit = () => {
    if (authProfile === 'ADMIN') {
      const enteredPass = adminPassword.trim();
      const matchedAdmin = registeredAdmins.find(adm => 
        (adm.pin.trim() === enteredPass || adm.user.trim().toLowerCase() === enteredPass.toLowerCase()) &&
        (adm.disciplineId === 'global' || !adm.disciplineId || adm.disciplineId === selectedDiscipline?.id || adm.role === 'Superadministrador Principal' || adm.role === 'Administrador General')
      ) || (enteredPass === '123' ? { name: 'Administrador General', user: 'admin', pin: '123', role: 'Administrador General', disciplineId: 'global' } : null);

      if (matchedAdmin) {
        setRole('ADMIN');
        setUserName(matchedAdmin.name);
        setIsLogged(true);
        setShowWelcomeBanner(true);
        addAuditLog(`Inicio de sesión exitoso como ${matchedAdmin.role} (${matchedAdmin.name})`, 'auth', matchedAdmin.name, 'ADMIN', matchedAdmin.pin);
      } else {
        alert(`⚠️ Clave o credencial incorrecta para administrar ${selectedDiscipline?.title || 'esta disciplina'}. Ingrese la clave asignada.`);
      }
    } else if (authProfile === 'DELEGADO') {
      const selectedTeam = currentTeams.find(t => t.id === delegateTeamId) || currentTeams[0];
      const validPin = (selectedTeam?.delegatePin || '1234').trim();
      if (delegatePin.trim() && delegatePin.trim() === validPin) {
        setRole('DELEGADO');
        setDelegateTeamId(selectedTeam.id);
        setUserName(`${selectedTeam.delegado} (${selectedTeam.name})`);
        setIsLogged(true);
        setShowWelcomeBanner(true);
        addAuditLog(`Inicio de sesión de Delegado para franquicia: ${selectedTeam?.name}`, 'auth', selectedTeam?.delegado, 'DELEGADO', `PIN-${delegatePin}`);
      } else {
        alert(`⚠️ Clave / PIN incorrecto para el equipo ${selectedTeam?.name || 'seleccionado'}. Ingrese el PIN asignado a este delegado.`);
      }
    } else {
      // Fanático / Usuario
      const fanName = userName.trim() || 'Fanático Fan';
      const fanCedula = userCedula.trim() || 'V-00000000';
      setRole('VISITANTE');
      setUserName(fanName);
      setUserCedula(fanCedula);
      setIsLogged(true);
      setShowWelcomeBanner(true);
      addAuditLog(`Acceso público de Fanático / Espectador`, 'auth', fanName, 'VISITANTE', fanCedula);
    }
  };

  const handleLogout = () => {
    addAuditLog(`Cierre de sesión de usuario`, 'auth');
    setIsLogged(false);
    setRole('VISITANTE');
    setUserName('');
    setUserCedula('');
    setDelegatePin('');
    setAdminPassword('');
    setActiveTab('dashboard');
  };

  // ── Handlers de datos con Auditoría en Tiempo Real ────────
  const updateGame = useCallback((gameId: string, updates: Partial<Game>) => {
    setGames(prev => prev.map(g => {
      if (g.id === gameId) {
        const updated = { ...g, ...updates };

        // Disparo de notificación y auditoría al finalizar partido
        if (updates.status === 'Finalizado' && g.status !== 'Finalizado') {
          const hs = updates.homeScore ?? updated.homeScore;
          const as = updates.awayScore ?? updated.awayScore;
          const body = `Finalizó: ${updated.homeTeam} ${hs} – ${as} ${updated.awayTeam}`;
          triggerNotification(`⏱ Partido Finalizado · ${selectedDiscipline?.title || branding.title}`, body, gameId);
          addAuditLog(`Marcador Final Guardado: ${updated.homeTeam} ${hs} - ${as} ${updated.awayTeam}`, 'score');
        } else if (updates.homeScore !== undefined || updates.awayScore !== undefined) {
          addAuditLog(`Actualización en vivo: ${updated.homeTeam} vs ${updated.awayTeam}`, 'score');
        }
        return updated;
      }
      return g;
    }));
  }, [selectedDiscipline, branding.title, triggerNotification, addAuditLog]);

  const handleAddGame = (newGame: Omit<Game, 'id'>) => {
    const id = Date.now().toString();
    setGames(prev => [...prev, { ...newGame, id }]);
    addAuditLog(`Partido agendado: ${newGame.homeTeam} vs ${newGame.awayTeam} (${newGame.date})`, 'schedule');
  };

  const handleDeleteGame = (gameId: string) => {
    const g = currentGames.find(item => item.id === gameId);
    setGames(prev => prev.filter(item => item.id !== gameId));
    addAuditLog(`Partido eliminado: ${g?.homeTeam || 'Local'} vs ${g?.awayTeam || 'Visitante'}`, 'schedule');
  };

  const handleUpdateTeam = (teamId: string, updates: Partial<Team>) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...updates } : t));
    const t = currentTeams.find(item => item.id === teamId);
    if (updates.group && t && updates.group !== t.group) {
      addAuditLog(`Equipo ${t.name} transferido a ${updates.group}`, 'group');
    } else {
      addAuditLog(`Datos de equipo actualizados: ${t?.name || ''}`, 'team');
    }
  };

  const handleAddTeam = (newTeam: Omit<Team, 'id'>) => {
    const id = Date.now().toString();
    setTeams(prev => [...prev, { ...newTeam, id }]);
    addAuditLog(`Nuevo equipo inscrito: ${newTeam.name} (${newTeam.group})`, 'team');
  };

  const handleDeleteTeam = (teamId: string) => {
    const t = currentTeams.find(item => item.id === teamId);
    setTeams(prev => prev.filter(item => item.id !== teamId));
    addAuditLog(`Equipo eliminado del torneo: ${t?.name || ''}`, 'team');
  };

  // ── Handler de notificaciones ────────────
  const handleToggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones push.');
      return;
    }
    if (notifPermission === 'denied') {
      alert('Los permisos de notificación fueron denegados. Habilítalos desde la configuración de tu navegador.');
      return;
    }
    if (notifPermission !== 'granted') {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === 'granted') {
        setNotifEnabled(true);
        triggerNotification('✅ JL Sports Club 360', 'Notificaciones activadas. Te avisaremos cuando finalice un partido.');
      }
    } else {
      setNotifEnabled(prev => !prev);
    }
  };

  const handleSaveBranding = (newBranding: typeof branding) => {
    setBranding(newBranding);
    triggerPushSync({ branding: newBranding });
  };

  const handleUpdateDisciplines = (newList: typeof disciplinesList) => {
    setDisciplinesList(newList);
    triggerPushSync({ disciplinesList: newList });
  };

  const handleUpdateAdmins = (newAdmins: typeof registeredAdmins) => {
    setRegisteredAdmins(newAdmins);
    triggerPushSync({ registeredAdmins: newAdmins });
  };

  // ── 1. Portal Multi-Disciplina (Landing Principal) ─────────
  if (!selectedDiscipline) {
    return (
      <div className="bg-sports-portal sports-grid-pattern min-h-screen flex flex-col justify-between">
        <Navbar360 
          branding={branding}
          onSaveBranding={handleSaveBranding}
          disciplines={disciplinesList}
          onUpdateDisciplines={handleUpdateDisciplines}
          admins={registeredAdmins}
          onUpdateAdmins={handleUpdateAdmins}
        />
        <main className="flex-1 flex flex-col justify-center py-6">
          <DisciplinesPortal 
            disciplines={disciplinesList}
            onSelectDiscipline={(disc) => {
              setSelectedDiscipline(disc);
              setIsLogged(false);
              setRole('VISITANTE');
              setAuthProfile('FANATICO');
              setUserName('');
              setUserCedula('');
              setDelegateTeamId('');
              setDelegatePin('');
              setAdminPassword('');
            }} 
          />
        </main>
        <footer className="w-full py-4 text-center border-t border-slate-800/80 bg-slate-950/60 backdrop-blur">
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400/60">
            {branding.title} • {branding.subtitle}
          </p>
        </footer>
      </div>
    );
  }

  // ── 2. Pantalla de Login Unificada con 3 Perfiles ──────────
  if (!isLogged) {
    return (
      <div className="bg-sports-portal sports-grid-pattern min-h-screen flex flex-col justify-between font-sans">
        <Navbar360 
          onBackToPortal={() => setSelectedDiscipline(null)} 
          showBackPortal 
          branding={branding}
          onSaveBranding={handleSaveBranding}
          disciplines={disciplinesList}
          onUpdateDisciplines={handleUpdateDisciplines}
          admins={registeredAdmins}
          onUpdateAdmins={handleUpdateAdmins}
        />

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md flex flex-col items-center gap-5">
            
            {/* Botón Volver a Disciplinas */}
            <button
              onClick={() => setSelectedDiscipline(null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-amber-500 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg group"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
              <span>Cambiar de Disciplina</span>
            </button>

            {/* Card Unificada de Login con Bisel Neón */}
            <div className="w-full card-metallic-crystal card-neon-border rounded-3xl overflow-hidden shadow-2xl">
              
              {/* Banner superior con Avatar 3D o Logo personalizado de la disciplina */}
              <div className="h-28 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-emerald-500/10 to-cyan-500/10" />
                <div className="text-center relative z-10 flex items-center gap-3">
                  <div className="p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg flex items-center justify-center w-14 h-14 overflow-hidden">
                    {selectedDiscipline.customLogoUrl ? (
                      <img src={selectedDiscipline.customLogoUrl} alt={selectedDiscipline.title} className="w-full h-full object-contain" />
                    ) : (
                      <>
                        {selectedDiscipline.icon === 'basketball' && <BasketballIcon3D className="w-12 h-12" />}
                        {selectedDiscipline.icon === 'volleyball' && <VolleyballIcon3D className="w-12 h-12" />}
                        {selectedDiscipline.icon === 'futsal'     && <FutsalIcon3D className="w-12 h-12" />}
                        {selectedDiscipline.icon === 'baseball'   && <BaseballIcon3D className="w-12 h-12" />}
                        {selectedDiscipline.icon === 'custom'     && <GoldTrophyIcon3D className="w-12 h-12" />}
                      </>
                    )}
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-black text-white uppercase text-stroke-black leading-tight">
                      {selectedDiscipline.title}
                    </h2>
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                      {selectedDiscipline.badgeNumber} · {selectedDiscipline.category}
                    </p>
                  </div>
                </div>
              </div>

              {/* Selector de Perfil (3 Roles) */}
              <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/60 p-1">
                {[
                  { id: 'FANATICO', label: 'Fanático', icon: User },
                  { id: 'DELEGADO', label: 'Delegado', icon: Users },
                  { id: 'ADMIN',    label: 'Admin',    icon: ShieldCheck },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setAuthProfile(p.id as any)}
                    className={`py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 ${
                      authProfile === p.id 
                        ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <p.icon className="w-3.5 h-3.5" />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>

              {/* Formulario según perfil seleccionado */}
              <div className="p-6 space-y-4">
                
                {/* Perfil 1: Fanático / Usuario Público */}
                {authProfile === 'FANATICO' && (
                  <div className="space-y-3.5">
                    <div className="text-center pb-1">
                      <p className="text-xs font-bold text-slate-300">Acceso de Aficionado y Consulta en Vivo</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        placeholder="Ej. José Rodríguez"
                        value={userName}
                        onChange={e => setUserName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleLoginSubmit()}
                        className="w-full h-11 border border-slate-700 bg-slate-950/80 rounded-xl px-3.5 font-bold text-sm text-white outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Cédula de Identidad</label>
                      <input
                        type="text"
                        placeholder="Ej. V-18234567"
                        value={userCedula}
                        onChange={e => setUserCedula(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleLoginSubmit()}
                        className="w-full h-11 border border-slate-700 bg-slate-950/80 rounded-xl px-3.5 font-bold text-sm text-white outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                )}

                {/* Perfil 2: Delegado Oficial */}
                {authProfile === 'DELEGADO' && (
                  <div className="space-y-3.5">
                    <div className="text-center pb-1">
                      <p className="text-xs font-bold text-amber-400">Acceso a Franquicia y Gestión de Jugadores</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Franquicia / Equipo</label>
                      <select
                        value={delegateTeamId || currentTeams[0]?.id}
                        onChange={e => setDelegateTeamId(e.target.value)}
                        className="w-full h-11 border border-slate-700 bg-slate-950 text-amber-400 font-bold text-xs rounded-xl px-3 outline-none"
                      >
                        {currentTeams.map(t => (
                          <option key={t.id} value={t.id}>{t.name} (Del: {t.delegado})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">PIN / Clave de Acceso del Delegado</label>
                      <div className="relative">
                        <input
                          type={showDelegatePin ? 'text' : 'password'}
                          placeholder="Ingrese PIN asignado a este equipo"
                          value={delegatePin}
                          onChange={e => setDelegatePin(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleLoginSubmit()}
                          className="w-full h-11 border border-slate-700 bg-slate-950/80 rounded-xl pl-3.5 pr-10 font-black text-sm text-amber-400 outline-none focus:ring-2 focus:ring-orange-500 tracking-widest text-center"
                        />
                        <button
                          type="button"
                          onClick={() => setShowDelegatePin(!showDelegatePin)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-white"
                          title={showDelegatePin ? 'Ocultar PIN' : 'Mostrar PIN'}
                        >
                          {showDelegatePin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold mt-1 text-center">
                        Valida la clave asignada por el Administrador a este equipo.
                      </p>
                    </div>
                  </div>
                )}

                {/* Perfil 3: Administrador General */}
                {authProfile === 'ADMIN' && (
                  <div className="space-y-3.5">
                    <div className="text-center pb-1">
                      <p className="text-xs font-bold text-amber-400">Control Total y Administración de la Disciplina</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Clave de Acceso / PIN Admin</label>
                      <input
                        type="password"
                        placeholder="Ingrese clave de acceso"
                        value={adminPassword}
                        onChange={e => setAdminPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleLoginSubmit()}
                        className="w-full h-11 border border-slate-700 bg-slate-950/80 rounded-xl px-3.5 font-bold text-sm text-white outline-none focus:ring-2 focus:ring-amber-500 tracking-widest text-center"
                      />
                    </div>
                  </div>
                )}

                {/* Botón de Ingreso */}
                <button
                  onClick={handleLoginSubmit}
                  className="btn-neon-action w-full py-3.5 text-slate-950 font-black uppercase tracking-wider text-xs rounded-xl shadow-xl transition-all mt-2"
                >
                  Ingresar como {authProfile === 'ADMIN' ? 'Administrador' : authProfile === 'DELEGADO' ? 'Delegado' : 'Fanático'}
                </button>

                <div className="text-center pt-2">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Sugerencias: <span className="text-amber-400 font-black">123</span> (Admin) · <span className="text-cyan-400 font-black">PIN Delegado</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="w-full py-4 text-center border-t border-slate-800/80 bg-slate-950/60 backdrop-blur">
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400/60">
            {branding.title} • {branding.season}
          </p>
        </footer>
      </div>
    );
  }

  // ── 3. App Principal (Post-Login) ────────────────────────────
  const myDelegateTeam = role === 'DELEGADO' 
    ? (currentTeams.find(t => t.id === delegateTeamId) || currentTeams.find(t => t.name.toLowerCase().includes('motorratones')) || currentTeams[0])
    : null;

  const navItems = [
    { id: 'dashboard',       label: 'PANEL PRINCIPAL',       icon: LayoutDashboard, roles: ['ADMIN', 'DELEGADO', 'VISITANTE'] },
    { id: 'equipos',         label: role === 'DELEGADO' ? 'MI FRANQUICIA' : 'GESTION EQUIPOS', icon: Users, roles: ['ADMIN', 'DELEGADO', 'VISITANTE'] },
    { id: 'grupos',          label: 'CONFIG. GRUPOS',         icon: Layers,          roles: ['ADMIN', 'DELEGADO', 'VISITANTE'] },
    { id: 'calendario',      label: 'CALENDARIO',             icon: CalendarDays,    roles: ['ADMIN', 'DELEGADO', 'VISITANTE'] },
    { id: 'live-results',    label: 'RESULTADOS LIVE',        icon: Activity,        roles: ['ADMIN', 'DELEGADO', 'VISITANTE'], isLiveBadge: true },
    { id: 'posiciones',      label: 'TABLA POSICIONES',       icon: Trophy,          roles: ['ADMIN', 'DELEGADO', 'VISITANTE'] },
    { id: 'seguridad',       label: 'SEGURIDAD & AUDITORÍA',  icon: Shield,          roles: ['ADMIN'] },
  ].filter(item => item.roles.includes(role));

  return (
    <div className="min-h-screen w-full bg-[#70B6E8] p-3 sm:p-5 flex flex-col md:flex-row gap-5 font-sans relative">

      {/* ── 1. Desktop Sidebar (Dark Midnight #0F172A - Fixed Viewport en Pantallas Grandes) ── */}
      <aside
        className={`hidden md:flex ${sidebarOpen ? 'w-72' : 'w-20'} bg-[#0F172A] border border-slate-700/80 rounded-3xl shadow-2xl flex-col shrink-0 transition-all duration-300 overflow-hidden md:fixed md:top-5 md:left-5 md:bottom-5 md:z-40`}
      >
        {/* Logo & Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between overflow-hidden shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-950/60 p-2">
              <GoldTrophyIcon3D className="w-full h-full" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h2 className="text-sm font-black text-[#FF8A00] uppercase truncate leading-tight tracking-wider">{branding.title}</h2>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest truncate mt-0.5">{selectedDiscipline.title}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-3 sm:p-4 space-y-2 overflow-y-auto">
          {/* Opción destacada: CAMBIAR DISCIPLINA */}
          {sidebarOpen && (
            <button
              onClick={() => setSelectedDiscipline(null)}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-amber-500/40 text-amber-400 font-black uppercase text-xs tracking-wider transition-all shadow-md group mb-3"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform shrink-0" />
              <span className="truncate">CAMBIAR DISCIPLINA</span>
            </button>
          )}

          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all text-xs font-black uppercase tracking-wider ${
                  isActive
                    ? 'bg-[#FF8A00] text-white shadow-lg shadow-orange-950/60 font-black'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white font-bold'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </div>
                {item.isLiveBadge && sidebarOpen && (
                  <span className="flex h-2.5 w-2.5 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF3D00]" />
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-[#0b1222]/80 shrink-0">
          {/* Badge de Sincronización en la Nube */}
          {sidebarOpen && (
            <button
              onClick={() => setShowSyncModal(true)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/60 transition-all text-left group"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Cloud className={`w-4 h-4 shrink-0 ${syncStatus === 'synced' ? 'text-[#00E676]' : syncStatus === 'syncing' ? 'text-amber-400 animate-spin' : 'text-slate-400'}`} />
                <div className="truncate">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Multi-Dispositivo</p>
                  <p className="text-[11px] font-black text-white truncate">
                    {syncStatus === 'synced' ? '🟢 Sincronizado' : syncStatus === 'syncing' ? '🔄 Actualizando...' : '⚪ Local'}
                  </p>
                </div>
              </div>
              <RefreshCw className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
            </button>
          )}

          {/* Switch de notificaciones */}
          {sidebarOpen && (
            <div className="bg-[#0F172A] rounded-xl p-3 space-y-2 border border-slate-700/60 shadow-inner">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Notificaciones Push</p>
              <button
                onClick={handleToggleNotifications}
                title={notifEnabled ? 'Desactivar notificaciones' : 'Activar notificaciones de partidos'}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-[11px] font-bold uppercase ${
                  notifEnabled
                    ? 'bg-emerald-950/70 text-[#00E676] border border-[#00E676]/50 shadow-sm'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  {notifEnabled ? <BellRing className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                  {notifEnabled ? 'Activadas' : 'Desactivadas'}
                </span>
                <div className={`relative w-9 h-5 rounded-full transition-colors ${notifEnabled ? 'bg-[#00E676]' : 'bg-slate-600'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${notifEnabled ? 'left-[18px]' : 'left-0.5'}`} />
                </div>
              </button>
            </div>
          )}

          {/* Usuario activo */}
          {sidebarOpen && (
            <div className="bg-[#0F172A] rounded-xl p-3 border border-slate-700/60 shadow-inner">
              <p className="text-[9px] font-black uppercase text-slate-400 mb-0.5 tracking-widest">Usuario Activo</p>
              <p className="text-xs font-black text-white uppercase truncate">{userName || 'ADMINISTRADOR GENERAL'}</p>
              <span className="inline-block mt-1 text-[9px] font-black px-2 py-0.5 rounded bg-[#FF8A00]/20 border border-[#FF8A00]/50 text-[#FF8A00] uppercase tracking-wider">
                Rol: {role}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-800/40 hover:border-red-600 font-black uppercase text-[11px] h-10 rounded-xl transition-all shadow-md"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && 'Cerrar Sesión'}
          </button>
        </div>
      </aside>

      {/* ── 2. Mobile Slide-Over Drawer (Menú Hamburguesa Flotante en Móviles) ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Oscuro */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          />
          
          {/* Contenedor del Drawer */}
          <div className="relative w-4/5 max-w-xs bg-[#0F172A] border-r border-slate-700/80 h-full flex flex-col z-50 shadow-2xl overflow-hidden animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center p-1.5 shadow-md">
                  <GoldTrophyIcon3D className="w-full h-full" />
                </div>
                <div>
                  <h2 className="text-xs font-black text-[#FF8A00] uppercase truncate">{branding.title}</h2>
                  <p className="text-[9px] text-slate-400 uppercase font-black">{selectedDiscipline.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
              <button
                onClick={() => { setSelectedDiscipline(null); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800 border border-amber-500/40 text-amber-400 font-black uppercase text-xs mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>CAMBIAR DISCIPLINA</span>
              </button>

              {navItems.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-black uppercase tracking-wider ${
                      isActive
                        ? 'bg-[#FF8A00] text-white shadow-lg font-black'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.isLiveBadge && (
                      <span className="flex h-2 w-2 relative shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF3D00]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="p-3 border-t border-slate-800 space-y-2 bg-[#0b1222]">
              <button
                onClick={() => { setShowSyncModal(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200"
              >
                <span className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-[#00E676]" />
                  <span>Sincronización Nube</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">En Vivo</span>
              </button>

              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 bg-red-950/40 text-red-400 border border-red-800/40 font-black uppercase text-xs h-9 rounded-xl"
              >
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Mobile Bottom Navigation Bar (Barra Inferior Compacta en Móviles) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0F172A]/95 backdrop-blur-xl border-t border-slate-700/80 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_25px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'dashboard' ? 'text-[#FF8A00] font-black' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-bold">Panel</span>
        </button>

        <button
          onClick={() => setActiveTab('equipos')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'equipos' ? 'text-[#FF8A00] font-black' : 'text-slate-400'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-bold">Equipos</span>
        </button>

        <button
          onClick={() => setActiveTab('calendario')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'calendario' ? 'text-[#FF8A00] font-black' : 'text-slate-400'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-bold">Calendario</span>
        </button>

        <button
          onClick={() => setActiveTab('live-results')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl relative transition-all ${
            activeTab === 'live-results' ? 'text-[#FF3D00] font-black' : 'text-slate-400'
          }`}
        >
          <div className="relative">
            <Activity className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF3D00]" />
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-wider font-bold">En Vivo</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-slate-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-bold">Menú</span>
        </button>
      </nav>

      {/* ── 4. Contenido Principal Responsivo ────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 max-w-full gap-5 transition-all duration-300 ml-0 ${sidebarOpen ? 'md:ml-[308px]' : 'md:ml-[100px]'} pb-24 md:pb-0 overflow-x-hidden`}>
        
        {/* Header superior */}
        <header className="bg-[#0F172A] border border-slate-700/80 rounded-2xl md:rounded-3xl px-3 sm:px-6 py-3.5 sm:py-4 shadow-xl flex items-center justify-between gap-3 w-full overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  setMobileMenuOpen(true);
                } else {
                  setSidebarOpen(p => !p);
                }
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 shrink-0"
              title="Menú de Navegación"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-black uppercase tracking-wider min-w-0 truncate">
              <span className="text-[#FF8A00] truncate">{selectedDiscipline.title}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0 hidden sm:inline" />
              <span className="text-white truncate hidden sm:inline">{activeTab.replace('-', ' ').toUpperCase()}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Indicador de Nube Multi-Dispositivo */}
            <button
              onClick={() => setShowSyncModal(true)}
              title="Sincronización en la Nube en Tiempo Real"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all ${
                syncStatus === 'synced'
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-[#00E676] shadow-[0_0_12px_rgba(0,230,118,0.25)]'
                  : syncStatus === 'syncing'
                  ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <span className={`relative flex h-2 w-2 shrink-0 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  syncStatus === 'synced' ? 'bg-emerald-400' : syncStatus === 'syncing' ? 'bg-amber-400' : 'bg-slate-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  syncStatus === 'synced' ? 'bg-[#00E676]' : syncStatus === 'syncing' ? 'bg-amber-400' : 'bg-slate-400'
                }`} />
              </span>
              <span className="hidden sm:inline">
                {syncStatus === 'synced' ? 'En Vivo' : syncStatus === 'syncing' ? 'Sincronizando' : 'Local'}
              </span>
              <Cloud className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setSelectedDiscipline(null)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 hover:border-amber-500 bg-slate-800/80 text-amber-300 text-[10px] font-black uppercase tracking-wider transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Disciplinas
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#FF8A00] bg-[#FF8A00]/10 text-[#FF8A00] font-black uppercase text-[10px] hover:bg-[#FF8A00] hover:text-white transition-all shadow-sm"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" /> ZIP
            </button>

            <button
              onClick={handleToggleNotifications}
              title={notifEnabled ? 'Notificaciones activas' : 'Activar notificaciones'}
              className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            >
              {notifEnabled
                ? <BellRing className="w-4 h-4 text-[#00E676]" />
                : <Bell className="w-4 h-4" />
              }
            </button>
          </div>
        </header>

        {/* Contenido de pestaña */}
        <main className="flex-1 overflow-y-auto space-y-6 w-full max-w-full">
          {activeTab === 'dashboard'       && <DashboardView role={role} games={currentGames} teams={currentTeams} onShowExport={() => setShowExportModal(true)} onUpdateGame={updateGame} userName={userName} />}
          {activeTab === 'equipos'         && <TeamsView role={role} teams={currentTeams} myTeam={myDelegateTeam} groups={currentGroups} onUpdateTeam={handleUpdateTeam} onAddTeam={handleAddTeam} onDeleteTeam={handleDeleteTeam} />}
          {activeTab === 'grupos'          && (
            <GroupsView 
              role={role} 
              teams={currentTeams} 
              groups={currentGroups} 
              games={currentGames}
              tournamentFormat={tournamentFormat}
              onFormatChange={handleFormatChange}
              onUpdateTeam={handleUpdateTeam} 
              onSetGroups={setGroups}
              onRenameGroup={handleRenameGroup}
              onDeleteGroup={handleDeleteGroup}
              onAddGame={handleAddGame}
              onUpdateGame={updateGame}
              onGoToCalendar={() => setActiveTab('calendario')}
            />
          )}
          {activeTab === 'calendario'      && <CalendarView role={role} games={currentGames} teams={currentTeams} tournamentFormat={tournamentFormat} onAddGame={handleAddGame} onUpdateGame={updateGame} onDeleteGame={handleDeleteGame} onGoToLive={() => setActiveTab('live-results')} />}
          {activeTab === 'live-results'    && <LiveResultsView role={role} games={currentGames} teams={currentTeams} onUpdateGame={updateGame} disciplineTitle={selectedDiscipline.title} />}
          {activeTab === 'posiciones'      && <StandingsView standingsByGroup={standingsByGroup} tournamentFormat={tournamentFormat} />}
          {activeTab === 'seguridad'       && <SecurityView auditLogs={auditLogs} onClearLogs={() => setAuditLogs([])} />}
        </main>
      </div>

      {/* ── Modal de exportación ─────────────────────────────── */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowExportModal(false)}>
          <div className="bg-[#0F172A] border-2 border-[#FFC107] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 text-slate-100 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black uppercase text-[#FFC107] flex items-center gap-2 text-base">
                  <Download className="w-5 h-5" /> Exportación de Código
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  {branding.title} · {selectedDiscipline.title}
                </p>
              </div>
              <button onClick={() => setShowExportModal(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 py-2 border-y border-slate-800">
              {[
                'Busca en la barra superior de la plataforma AI el botón "Download ZIP".',
                'Haz clic para descargar los archivos (.tsx, package.json, etc.) comprimidos.',
                'Sube el archivo a Vercel o extráelo localmente para ejecutar con npm install y npm run dev.',
              ].map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#FFC107] text-slate-950 flex items-center justify-center font-black text-xs shrink-0">{i + 1}</div>
                  <p className="text-xs font-semibold text-slate-300">{step}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="w-full h-11 bg-[#FFC107] hover:bg-yellow-400 text-slate-950 font-black uppercase rounded-xl transition-colors text-xs tracking-wider shadow-lg"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
      {/* ── Modal de Sincronización en la Nube ───────────────── */}
      <CloudSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        onForceSync={triggerPushSync}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-MÓDULOS DE VISTAS (PERFECCIONADOS Y SIMÉTRICOS)
// ═══════════════════════════════════════════════════════════════

// ── 1. DashboardView (Rediseñado según Especificación Global) ────
function DashboardView({ 
  role, games, teams, onShowExport, onUpdateGame, userName 
}: { 
  role: Role, 
  games: Game[], 
  teams: Team[], 
  onShowExport: () => void,
  onUpdateGame: (id: string, updates: Partial<Game>) => void,
  userName?: string
}) {
  const finished = games.filter(g => g.status === 'Finalizado').length;
  const liveCount = games.filter(g => g.status === 'En Curso').length;
  const pending  = games.length - finished - liveCount;

  const [quickEditingGame, setQuickEditingGame] = useState<Game | null>(null);

  // 4 Tarjetas de Métricas Horizontales con Bordes Gruesos (border-4) y Colores Vivos
  const metricCards = [
    { 
      label: 'Equipos Inscritos',  
      val: teams.length,  
      border: 'border-4 border-[#FF0000] shadow-[0_0_20px_rgba(255,0,0,0.2)]', 
      icon: Users,
      iconClass: 'text-red-400 bg-red-950/80 border border-red-500/50' 
    },
    { 
      label: 'Juegos en Vivo',     
      val: liveCount,     
      border: 'border-4 border-[#00A859] shadow-[0_0_20px_rgba(0,168,89,0.2)]', 
      icon: Activity,
      iconClass: 'text-[#00E676] bg-emerald-950/80 border border-emerald-500/50 animate-pulse' 
    },
    { 
      label: 'Juegos Finalizados', 
      val: finished,      
      border: 'border-4 border-[#EAB308] shadow-[0_0_20px_rgba(234,179,8,0.2)]', 
      icon: CheckCircle2,
      iconClass: 'text-[#FFC107] bg-yellow-950/80 border border-[#FFC107]/50' 
    },
    { 
      label: 'Juegos Pendientes',  
      val: pending > 0 ? pending : 0, 
      border: 'border-4 border-[#A855F7] shadow-[0_0_20px_rgba(168,85,247,0.2)]', 
      icon: CalendarDays,
      iconClass: 'text-[#C084FC] bg-purple-950/80 border border-purple-500/50' 
    },
  ];

  const getTeamLogo = (teamName: string) => {
    const t = teams.find(item => item.name.toLowerCase() === teamName.toLowerCase());
    return t?.logoUrl;
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── 3.1 Banner Superior de Bienvenida ── */}
      <div className="bg-[#0F172A] border-2 border-[#FFC107] rounded-2xl p-4 sm:p-5 shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-[#FFC107]/20 border border-[#FFC107]/60 rounded-xl flex items-center justify-center text-[#FFC107] shrink-0">
            <Sparkles className="w-5 h-5 text-[#FFC107]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-wide">
              ¡Bienvenido a <span className="text-[#FF8A00]">JL Sports Club 360</span>, {userName || 'Administrador General'}!
            </h2>
            <p className="text-xs text-slate-300 font-bold mt-0.5">
              Panel de control y gestión en tiempo real con permisos de {role}.
            </p>
          </div>
        </div>
      </div>

      {/* ── 3.2 Banner de Estado de Producción ── */}
      <div className="bg-[#0F172A] border border-[#FFC107] rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-12 h-12 bg-[#FF8A00] text-slate-950 rounded-xl flex items-center justify-center font-black shadow-lg shadow-orange-950/50 shrink-0">
            <Download className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-black uppercase text-sm tracking-wider text-white">LISTO PARA EXPORTAR A PRODUCCIÓN</h3>
            <p className="text-xs text-slate-400 mt-0.5">Exporta el código fuente y publica en la nube con un solo clic.</p>
          </div>
        </div>
        <button
          onClick={onShowExport}
          className="w-full sm:w-auto bg-[#FFC107] hover:bg-yellow-400 text-slate-950 font-black uppercase text-xs px-5 py-3 rounded-xl transition-all shadow-lg shrink-0 flex items-center justify-center gap-2 tracking-wider"
        >
          VER INSTRUCCIONES <ExternalLink className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* ── 4. Tarjetas de Métricas Rápidas (4 Compact Horizontal Cards con Borde Grueso) ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((m, i) => (
          <div 
            key={i} 
            className={`bg-[#0F172A] ${m.border} rounded-2xl p-4 sm:p-5 shadow-xl flex items-center justify-between hover:scale-[1.01] transition-transform`}
          >
            <div>
              <p className="text-[11px] font-black uppercase text-slate-400 mb-1 tracking-wider">{m.label}</p>
              <p className="text-3xl sm:text-4xl font-black text-white">{String(m.val).padStart(2, '0')}</p>
            </div>
            <div className={`p-3 rounded-xl shadow-md ${m.iconClass}`}>
              <m.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* ── 5. Sección "Resultados Recientes y en Vivo" ── */}
      <div className="bg-[#0F172A] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-black uppercase text-sm sm:text-base tracking-wider text-white flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-orange-500/20 border border-orange-500/40 text-[#FF8A00]">
              <Activity className="w-4 h-4" />
            </span>
            RESULTADOS RECIENTES Y EN VIVO
          </h3>
          <span className="text-[10px] font-black uppercase text-[#00E676] bg-emerald-950/70 px-3.5 py-1.5 rounded-full border border-emerald-500/50 shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-ping" />
            JL360 LIVE SYNC
          </span>
        </div>

        <div className="space-y-3.5">
          {games.map(g => {
            const homeLogo = getTeamLogo(g.homeTeam);
            const awayLogo = getTeamLogo(g.awayTeam);

            return (
              <div 
                key={g.id} 
                className="bg-gradient-to-r from-slate-900 via-[#0F172A] to-slate-900 border-2 border-amber-500 hover:border-amber-400 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-[0_6px_25px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.35)] transition-all duration-300 flex flex-col items-center justify-between gap-4 w-full max-w-full overflow-hidden"
              >
                {/* Enfrentamiento Vertical 3 Columnas Responsivo */}
                <div className="grid grid-cols-3 md:flex md:flex-row items-center justify-between gap-2 sm:gap-6 w-full max-w-full overflow-hidden">
                  {/* 1. BLOQUE EQUIPO LOCAL (Vertical) */}
                  <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2 flex-1 min-w-0 max-w-full md:max-w-[180px]">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 max-w-[80px] max-h-[80px] rounded-2xl bg-gradient-to-b from-slate-800 via-[#0a1120] to-slate-950 p-1 sm:p-1.5 border-2 border-amber-400/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_10px_25px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-all duration-300">
                      {homeLogo ? (
                        <img src={homeLogo} alt={g.homeTeam} className="w-full h-full max-w-full max-h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.75)]" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : (
                        <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.75)]" />
                      )}
                    </div>
                    <p className="font-black uppercase text-xs sm:text-base text-white tracking-wide leading-tight text-center break-words w-full px-0.5">
                      {g.homeTeam}
                    </p>
                    <span className="inline-flex items-center text-[9px] sm:text-xs font-black text-amber-400 bg-amber-950/90 border border-amber-500/70 px-2 sm:px-3 py-0.5 rounded-lg uppercase tracking-widest shadow-sm">
                      LOCAL
                    </span>
                  </div>

                  {/* 2. BLOQUE MARCADOR / TIEMPO (Centro) - SIEMPRE EN UNA SOLA LÍNEA HORIZONTAL */}
                  <div className="flex flex-col items-center justify-center px-1 shrink-0 space-y-1.5 min-w-fit">
                    <div className="flex flex-row flex-nowrap items-center justify-center whitespace-nowrap bg-slate-950/90 px-2 sm:px-5 py-1 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-800 shadow-inner shrink-0 tracking-tight leading-none">
                      <span className="text-base sm:text-2xl md:text-5xl font-black text-[#00E676] font-mono drop-shadow-[0_2px_8px_rgba(0,230,118,0.45)] whitespace-nowrap leading-none">
                        {g.homeScore}
                      </span>
                      <span className="text-amber-400 font-black text-xs sm:text-xl font-mono px-1 sm:px-2 whitespace-nowrap leading-none">
                        -
                      </span>
                      <span className="text-base sm:text-2xl md:text-5xl font-black text-[#FF3D00] font-mono drop-shadow-[0_2px_8px_rgba(255,61,0,0.45)] whitespace-nowrap leading-none">
                        {g.awayScore}
                      </span>
                    </div>
                    <div className="flex flex-row flex-wrap items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap">
                      {g.status === 'Finalizado' && (
                        <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 sm:px-3 py-0.5 rounded-full bg-yellow-950/80 border border-[#FFC107] text-[#FFC107] shadow-sm whitespace-nowrap">
                          Finalizado
                        </span>
                      )}
                      {g.status === 'En Curso' && (
                        <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 sm:px-3 py-0.5 rounded-full bg-red-950/90 border border-[#FF3D00] text-[#FF3D00] animate-pulse shadow-sm whitespace-nowrap">
                          En Vivo
                        </span>
                      )}
                      {g.status === 'Programado' && (
                        <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 sm:px-3 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 whitespace-nowrap">
                          Programado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3. BLOQUE EQUIPO VISITANTE (Vertical) */}
                  <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2 flex-1 min-w-0 max-w-full md:max-w-[180px] relative">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 max-w-[80px] max-h-[80px] rounded-2xl bg-gradient-to-b from-slate-800 via-[#0a1120] to-slate-950 p-1 sm:p-1.5 border-2 border-purple-400/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_10px_25px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-all duration-300">
                      {awayLogo ? (
                        <img src={awayLogo} alt={g.awayTeam} className="w-full h-full max-w-full max-h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.75)]" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : (
                        <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-[#E879F9] filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.75)]" />
                      )}
                    </div>
                    <p className="font-black uppercase text-xs sm:text-base text-white tracking-wide leading-tight text-center break-words w-full px-0.5">
                      {g.awayTeam}
                    </p>
                    <span className="inline-flex items-center text-[9px] sm:text-xs font-black text-[#E879F9] bg-fuchsia-950/90 border border-fuchsia-500/70 px-2 sm:px-3 py-0.5 rounded-lg uppercase tracking-widest shadow-sm">
                      VISITANTE
                    </span>

                    {role === 'ADMIN' && (
                      <button
                        onClick={() => setQuickEditingGame(g)}
                        className="absolute -top-2 -right-1 sm:-right-2 p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700 hover:border-amber-400 transition-all shadow-md shrink-0"
                        title="Edición rápida de partido"
                      >
                        <Edit className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="w-full pt-2 border-t border-slate-800/80 text-center">
                  <span className="text-[10px] sm:text-[11px] text-slate-300 font-bold uppercase tracking-wider">
                    {g.date} · {g.location} {g.time ? `· ${g.time}` : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Edición Rápida de Partido (Admin) */}
      {quickEditingGame && (
        <SimpleDialog title={`Edición Rápida de Partido`} onClose={() => setQuickEditingGame(null)}>
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-700">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{quickEditingGame.homeTeam}</p>
                <input
                  type="number"
                  min={0}
                  value={quickEditingGame.homeScore}
                  onChange={e => setQuickEditingGame({ ...quickEditingGame, homeScore: +e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 text-center text-xl font-black text-[#00E676]"
                />
              </div>
              <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-700">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{quickEditingGame.awayTeam}</p>
                <input
                  type="number"
                  min={0}
                  value={quickEditingGame.awayScore}
                  onChange={e => setQuickEditingGame({ ...quickEditingGame, awayScore: +e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 text-center text-xl font-black text-[#FF3D00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Estado del Partido</label>
              <select
                value={quickEditingGame.status}
                onChange={e => setQuickEditingGame({ ...quickEditingGame, status: e.target.value as any })}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white"
              >
                <option value="Programado">Programado</option>
                <option value="En Curso">En Curso (Live)</option>
                <option value="Finalizado">Finalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Sede / Ubicación</label>
              <input
                type="text"
                value={quickEditingGame.location}
                onChange={e => setQuickEditingGame({ ...quickEditingGame, location: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setQuickEditingGame(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold uppercase text-xs rounded-xl">Cancelar</button>
            <button onClick={() => { onUpdateGame(quickEditingGame.id, quickEditingGame); setQuickEditingGame(null); }} className="flex-1 bg-[#FF8A00] hover:bg-orange-500 py-2.5 text-white font-black uppercase text-xs rounded-xl shadow-lg">Guardar</button>
          </div>
        </SimpleDialog>
      )}
    </div>
  );
}

// ── 2. TeamsView (Gestión de Equipos con Restricción Delegado) 
function TeamsView({
  role, teams, myTeam, groups, onUpdateTeam, onAddTeam, onDeleteTeam
}: {
  role: Role,
  teams: Team[],
  myTeam: Team | null,
  groups: string[],
  onUpdateTeam: (id: string, updates: Partial<Team>) => void,
  onAddTeam: (team: Omit<Team, 'id'>) => void,
  onDeleteTeam: (id: string) => void
}) {
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [managingPlayersTeam, setManagingPlayersTeam] = useState<Team | null>(null);
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newTeam, setNewTeam] = useState({ name: '', delegado: '', telefono: '', group: groups[0] || 'Grupo A', delegatePin: '1234' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveTeam = () => {
    if (editingTeam) { 
      onUpdateTeam(editingTeam.id, editingTeam); 
      setEditingTeam(null); 
    }
  };

  const handleAddPlayer = () => {
    if (managingPlayersTeam && newPlayerName.trim()) {
      const updatedJugadores = [...managingPlayersTeam.jugadores, newPlayerName.trim()];
      onUpdateTeam(managingPlayersTeam.id, { jugadores: updatedJugadores });
      setManagingPlayersTeam({ ...managingPlayersTeam, jugadores: updatedJugadores });
      setNewPlayerName('');
    }
  };

  const handleDeletePlayer = (name: string) => {
    if (managingPlayersTeam) {
      const updatedJugadores = managingPlayersTeam.jugadores.filter(p => p !== name);
      onUpdateTeam(managingPlayersTeam.id, { jugadores: updatedJugadores });
      setManagingPlayersTeam({ ...managingPlayersTeam, jugadores: updatedJugadores });
    }
  };

  const handleCreateTeam = () => {
    if (newTeam.name.trim() && newTeam.delegado.trim()) {
      onAddTeam({ ...newTeam, jugadores: [] });
      setNewTeam({ name: '', delegado: '', telefono: '', group: groups[0] || 'Grupo A', delegatePin: '1234' });
      setIsAddingTeam(false);
    }
  };

  // Si es DELEGADO, únicamente mostrar su propia franquicia
  const displayedTeams = role === 'DELEGADO' ? (myTeam ? [myTeam] : teams.slice(0, 1)) : teams;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado del Módulo */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-orange-500" />
            <span>{role === 'DELEGADO' ? `Panel de Mi Franquicia (${myTeam?.name || 'Mi Equipo'})` : 'Gestión de Equipos'}</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
            {role === 'DELEGADO' 
              ? 'Gestión exclusiva de la plantilla y nómina de jugadores autorizados'
              : 'Control de franquicias inscritas, delegados y nóminas oficiales de jugadores'}
          </p>
        </div>

        {/* Solo ADMIN puede agregar nuevos equipos */}
        {role === 'ADMIN' && (
          <button 
            onClick={() => setIsAddingTeam(true)} 
            className="btn-neon-action py-3 px-5 rounded-xl text-slate-950 font-black uppercase text-xs tracking-wider flex items-center gap-2 shadow-lg shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Agregar Nuevo Equipo</span>
          </button>
        )}
      </div>

      {/* Grid de Tarjetas de Equipos en Dark Mode */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {displayedTeams.map(team => (
          <div 
            key={team.id} 
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1"
          >
            <div>
              <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500" />
              
              {/* Header del Equipo */}
              <div className="p-5 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 max-w-[64px] max-h-[64px] rounded-2xl bg-gradient-to-b from-slate-800 via-[#0b1222] to-slate-950 p-2 border-2 border-amber-500/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_8px_20px_rgba(0,0,0,0.7)] flex items-center justify-center overflow-hidden shrink-0">
                  {team.logoUrl ? (
                    <img src={team.logoUrl} alt="Logo" className="w-full h-full max-w-full max-h-full object-contain filter drop-shadow-[0_6px_8px_rgba(0,0,0,0.6)]" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Trophy className="w-8 h-8 text-amber-400 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-950/80 border border-amber-500/40 text-amber-400 mb-1">
                    {team.group || 'Grupo General'}
                  </span>
                  <h3 className="font-black uppercase text-base sm:text-lg text-white truncate">
                    {team.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-0.5 truncate">
                    <User className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span>Del: {team.delegado}</span>
                  </p>
                  {role === 'ADMIN' && (
                    <p className="text-[10px] text-amber-400 font-black flex items-center gap-1.5 mt-1.5 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 w-fit">
                      <Key className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>PIN Delegado: <strong className="font-mono text-white text-xs">{team.delegatePin || '1234'}</strong></span>
                    </p>
                  )}
                </div>
              </div>

              {/* Información y Nómina de Jugadores */}
              <div className="p-5 space-y-3">
                {team.telefono && (
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{team.telefono}</span>
                  </p>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-black uppercase text-slate-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Jugadores Registrados ({team.jugadores.length})</span>
                    </p>
                  </div>
                  
                  <div className="h-24 bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 overflow-y-auto space-y-1.5">
                    {team.jugadores.length > 0 ? (
                      team.jugadores.map((j, i) => (
                        <div key={i} className="flex items-center justify-between text-xs text-slate-200 border-b border-slate-800/60 pb-1 last:border-0">
                          <span className="font-semibold">{i + 1}. {j}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs italic text-slate-500 text-center py-4 uppercase font-bold">
                        Sin jugadores cargados
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex flex-wrap gap-2">
              <button
                onClick={() => setManagingPlayersTeam(team)}
                className="flex-1 min-w-[120px] py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Jugadores</span>
              </button>

              {role === 'ADMIN' && (
                <>
                  <button
                    onClick={() => setEditingTeam(team)}
                    className="py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`¿Estás seguro de eliminar al equipo ${team.name}?`)) {
                        onDeleteTeam(team.id);
                      }
                    }}
                    className="py-2 px-3 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5"
                    title="Eliminar equipo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Editar Equipo (Admin) */}
      {editingTeam && (
        <EditTeamDialog 
          team={editingTeam} 
          groups={groups}
          onChange={setEditingTeam} 
          onSave={handleSaveTeam} 
          onClose={() => setEditingTeam(null)} 
          fileInputRef={fileInputRef} 
        />
      )}

      {/* Modal: Gestionar Jugadores (Admin y Delegado de su equipo) */}
      {managingPlayersTeam && (
        <SimpleDialog 
          title={`Nómina Oficial: ${managingPlayersTeam.name}`} 
          onClose={() => setManagingPlayersTeam(null)}
        >
          <div className="space-y-4">
            {(role === 'ADMIN' || (role === 'DELEGADO' && managingPlayersTeam.id === myTeam?.id)) && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre y Apellido del Jugador"
                  value={newPlayerName}
                  onChange={e => setNewPlayerName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={handleAddPlayer}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs px-4 rounded-xl transition-colors shrink-0"
                >
                  + Añadir
                </button>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {managingPlayersTeam.jugadores.map((jugador, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl">
                  <span className="font-bold text-xs uppercase text-slate-200">{idx + 1}. {jugador}</span>
                  {(role === 'ADMIN' || (role === 'DELEGADO' && managingPlayersTeam.id === myTeam?.id)) && (
                    <button
                      onClick={() => handleDeletePlayer(jugador)}
                      className="p-1 rounded-lg text-red-400 hover:bg-red-950/60 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setManagingPlayersTeam(null)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase text-xs rounded-xl tracking-wider transition-colors"
            >
              Listo / Cerrar
            </button>
          </div>
        </SimpleDialog>
      )}

      {/* Modal: Agregar Nuevo Equipo (Admin) */}
      {isAddingTeam && (
        <SimpleDialog title="Agregar Nuevo Equipo" onClose={() => setIsAddingTeam(false)}>
          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Nombre del Equipo</label>
              <input
                placeholder="Ej. Centauros BBC"
                value={newTeam.name}
                onChange={e => setNewTeam(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Delegado Responsable</label>
              <input
                placeholder="Nombre completo"
                value={newTeam.delegado}
                onChange={e => setNewTeam(p => ({ ...p, delegado: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Teléfono de Contacto</label>
              <input
                placeholder="04XX-XXXXXXX"
                value={newTeam.telefono}
                onChange={e => setNewTeam(p => ({ ...p, telefono: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Grupo Asignado</label>
              <select
                value={newTeam.group}
                onChange={e => setNewTeam(p => ({ ...p, group: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-amber-400 outline-none"
              >
                {groups.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">CLAVE / PIN DEL DELEGADO *</label>
              <input
                placeholder="Ej. 456 o PIN personalizado"
                value={newTeam.delegatePin}
                onChange={e => setNewTeam(p => ({ ...p, delegatePin: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-black text-amber-400 outline-none focus:ring-2 focus:ring-orange-500 tracking-wider"
              />
              <p className="text-[9px] text-slate-500 font-bold mt-1">Clave de acceso que usará el delegado para gestionar su plantilla.</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setIsAddingTeam(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase text-xs rounded-xl transition-colors">
              Cancelar
            </button>
            <button onClick={handleCreateTeam} className="flex-1 btn-neon-action py-3 text-slate-950 font-black uppercase text-xs rounded-xl tracking-wider transition-all">
              Crear Equipo
            </button>
          </div>
        </SimpleDialog>
      )}
    </div>
  );
}

// ── 3. GroupsView (Configuración Completa y Formatos de Torneo) 
function GroupsView({ 
  role, 
  teams, 
  groups, 
  games,
  tournamentFormat,
  onFormatChange,
  onUpdateTeam, 
  onSetGroups,
  onRenameGroup,
  onDeleteGroup,
  onAddGame,
  onUpdateGame,
  onGoToCalendar,
}: { 
  role: Role, 
  teams: Team[], 
  groups: string[], 
  games: Game[],
  tournamentFormat: TournamentFormat,
  onFormatChange: (fmt: TournamentFormat) => void,
  onUpdateTeam: (id: string, updates: Partial<Team>) => void,
  onSetGroups: React.Dispatch<React.SetStateAction<string[]>>,
  onRenameGroup: (oldName: string, newName: string) => void,
  onDeleteGroup: (groupName: string) => void,
  onAddGame?: (game: Omit<Game, 'id'>) => void,
  onUpdateGame?: (id: string, updates: Partial<Game>) => void,
  onGoToCalendar?: () => void,
}) {
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupName, setEditingGroupName] = useState<{ oldName: string, newName: string } | null>(null);

  // ── Estado de Bracket Personalizable para Eliminación Directa ──
  interface BracketSlot {
    id: string;
    round: 'cuartos' | 'semis' | 'final';
    roundLabel: string;
    matchNum: number;
    homeTeam: string;
    awayTeam: string;
    date: string;
    time: string;
    location: string;
  }

  const defaultPlayoffSlots = useMemo<BracketSlot[]>(() => {
    return [
      { id: 'q1', round: 'cuartos', roundLabel: 'Cuartos de Final · Llave #1', matchNum: 1, homeTeam: teams[0]?.name || '1° Grupo A', awayTeam: teams[7]?.name || teams[3]?.name || '2° Grupo B', date: '2026-06-20', time: '17:00', location: 'Cancha Principal' },
      { id: 'q2', round: 'cuartos', roundLabel: 'Cuartos de Final · Llave #2', matchNum: 2, homeTeam: teams[1]?.name || '1° Grupo B', awayTeam: teams[6]?.name || teams[2]?.name || '2° Grupo A', date: '2026-06-20', time: '18:30', location: 'Cancha Principal' },
      { id: 'q3', round: 'cuartos', roundLabel: 'Cuartos de Final · Llave #3', matchNum: 3, homeTeam: teams[2]?.name || '2° Grupo B', awayTeam: teams[5]?.name || teams[4]?.name || '3° Grupo A', date: '2026-06-21', time: '17:00', location: 'Cancha Principal' },
      { id: 'q4', round: 'cuartos', roundLabel: 'Cuartos de Final · Llave #4', matchNum: 4, homeTeam: teams[3]?.name || '2° Grupo A', awayTeam: teams[4]?.name || teams[5]?.name || '3° Grupo B', date: '2026-06-21', time: '18:30', location: 'Cancha Principal' },
      { id: 's1', round: 'semis', roundLabel: 'Semifinal · Llave #1', matchNum: 1, homeTeam: 'Ganador Llave #1', awayTeam: 'Ganador Llave #2', date: '2026-06-25', time: '18:00', location: 'Gimnasio Cubierto' },
      { id: 's2', round: 'semis', roundLabel: 'Semifinal · Llave #2', matchNum: 2, homeTeam: 'Ganador Llave #3', awayTeam: 'Ganador Llave #4', date: '2026-06-25', time: '19:30', location: 'Gimnasio Cubierto' },
      { id: 'f1', round: 'final', roundLabel: 'Gran Final por el Campeonato', matchNum: 1, homeTeam: 'Finalista 1', awayTeam: 'Finalista 2', date: '2026-06-28', time: '19:00', location: 'Tabloncillo Central' },
    ];
  }, [teams]);

  const [bracketSlots, setBracketSlots] = useState<BracketSlot[]>(defaultPlayoffSlots);
  const [editingBracketMatch, setEditingBracketMatch] = useState<BracketSlot | null>(null);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const availableSeedOptions = useMemo(() => {
    const activeTeamNames = teams.map(t => t.name);
    const presets = [
      '1° Grupo A', '2° Grupo A', '3° Grupo A',
      '1° Grupo B', '2° Grupo B', '3° Grupo B',
      '1° Ronda Regular', '2° Ronda Regular', '3° Ronda Regular', '4° Ronda Regular',
      'Ganador Llave #1', 'Ganador Llave #2', 'Ganador Llave #3', 'Ganador Llave #4',
      'Ganador Semifinal #1', 'Ganador Semifinal #2',
    ];
    return { activeTeamNames, presets };
  }, [teams]);

  const handleDirectSlotChange = (slotId: string, field: 'homeTeam' | 'awayTeam', value: string) => {
    setBracketSlots(prev => prev.map(s => s.id === slotId ? { ...s, [field]: value } : s));
  };

  const handleUpdateBracketMatch = (updated: BracketSlot) => {
    setBracketSlots(prev => prev.map(s => s.id === updated.id ? updated : s));
    setEditingBracketMatch(null);
  };

  const handleResetDefaultBracket = () => {
    if (confirm('¿Restablecer el cuadro de llaves a la sugerencia automática por defecto?')) {
      setBracketSlots(defaultPlayoffSlots);
    }
  };

  const handleSyncBracketToCalendar = () => {
    if (!onAddGame) return;
    let addedCount = 0;
    let updatedCount = 0;

    bracketSlots.forEach(slot => {
      // Validar si el slot tiene equipos asignados reales
      const isRealHome = teams.some(t => t.name === slot.homeTeam);
      const isRealAway = teams.some(t => t.name === slot.awayTeam);
      
      const existing = games.find(g => 
        (g.homeTeam === slot.homeTeam && g.awayTeam === slot.awayTeam) ||
        (g.phase === slot.roundLabel)
      );

      if (existing && onUpdateGame) {
        onUpdateGame(existing.id, {
          homeTeam: slot.homeTeam,
          awayTeam: slot.awayTeam,
          phase: slot.roundLabel,
          date: slot.date,
          time: slot.time,
          location: slot.location,
        });
        updatedCount++;
      } else if (slot.homeTeam && slot.awayTeam && slot.homeTeam !== slot.awayTeam) {
        onAddGame({
          homeTeam: slot.homeTeam,
          awayTeam: slot.awayTeam,
          phase: slot.roundLabel,
          date: slot.date,
          time: slot.time,
          location: slot.location,
          status: 'Programado',
          homeScore: 0,
          awayScore: 0,
          homeQuarters: [0, 0, 0, 0],
          awayQuarters: [0, 0, 0, 0],
        });
        addedCount++;
      }
    });

    setSyncSuccessMsg(`¡Sincronización completada! ${addedCount} partidos programados y ${updatedCount} actualizados en el Calendario Oficial.`);
    setTimeout(() => setSyncSuccessMsg(null), 5000);
  };

  const findMatchingGame = (home: string, away: string, label: string) => {
    return games.find(g => 
      (g.homeTeam === home && g.awayTeam === away) ||
      (g.phase === label)
    );
  };

  const handleAddGroup = () => {
    const trimmed = newGroupName.trim();
    if (trimmed && !groups.includes(trimmed)) {
      onSetGroups(prev => [...prev, trimmed]);
      setNewGroupName('');
    }
  };

  const handleMoveTeam = (teamId: string, targetGroup: string) => {
    onUpdateTeam(teamId, { group: targetGroup });
  };

  // Equipos que quedaron sin asignar o en "Sin Grupo"
  const unassignedTeams = teams.filter(t => !t.group || t.group === 'Sin Grupo' || !groups.includes(t.group));

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ── 1. SELECTOR INICIAL DE FORMATO DE COMPETENCIA ── */}
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-cyan-500" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-950/70 border border-amber-500/40 text-amber-400 mb-1.5">
              <Sparkles className="w-3 h-3" /> Formato de Torneo Oficial
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase italic text-white flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-amber-400" />
              <span>Configuración de Grupos & Sistema de Competencia</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">
              Selecciona el sistema de disputa del torneo y administra la distribución de franquicias
            </p>
          </div>

          {/* Selector de Formato (Dropdown / Botones 3 Opciones) */}
          <div className="flex flex-wrap gap-2 shrink-0">
            {[
              { id: 'groups',      label: 'Por Grupos',       sub: 'Fase de Grupos A, B, C...', icon: Layers },
              { id: 'round_robin', label: 'Todos vs Todos',   sub: 'Round Robin (Grupo Único)', icon: RotateCcw },
              { id: 'playoffs',    label: 'Eliminación Directa', sub: 'Playoffs / Bracket Oficial', icon: Trophy },
            ].map(f => (
              <button
                key={f.id}
                disabled={role !== 'ADMIN'}
                onClick={() => onFormatChange(f.id as any)}
                className={`py-2 px-3.5 rounded-xl text-left transition-all flex items-center gap-2.5 border ${
                  tournamentFormat === f.id
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 border-amber-400 text-white shadow-lg shadow-orange-950/50 scale-[1.02]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <f.icon className={`w-4 h-4 shrink-0 ${tournamentFormat === f.id ? 'text-white' : 'text-amber-400'}`} />
                <div>
                  <p className="text-xs font-black uppercase leading-tight">{f.label}</p>
                  <p className="text-[9px] opacity-75 font-semibold leading-tight">{f.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Notificación informativa del formato activo */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <p className="text-slate-300 font-semibold">
              Formato Actual:{' '}
              <strong className="text-amber-400 uppercase">
                {tournamentFormat === 'groups' && 'Fase por Grupos (Creación y Asignación Dinámica)'}
                {tournamentFormat === 'round_robin' && 'Todos Contra Todos / Round Robin (Liga Corrida en Grupo Único)'}
                {tournamentFormat === 'playoffs' && 'Eliminación Directa / Playoffs (Llaves Personalizables de Cuartos, Semifinal y Final)'}
              </strong>
            </p>
          </div>
          {tournamentFormat === 'round_robin' && (
            <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
              Subgrupos bloqueados
            </span>
          )}
        </div>
      </div>

      {/* ── 2. BARRA DE CREACIÓN DE NUEVO GRUPO (Solo en modo 'groups' y Admin) ── */}
      {tournamentFormat === 'groups' && role === 'ADMIN' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div>
            <h3 className="font-black uppercase text-white text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-orange-500" /> Crear Serie / Grupo Adicional
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Añade series (ej. Grupo C, Grupo Occidental) para segmentar el campeonato
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nombre del nuevo grupo (ej. Grupo C)"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddGroup()}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-orange-500 min-w-[220px]"
            />
            <button
              onClick={handleAddGroup}
              className="btn-neon-action px-5 py-2 rounded-xl text-slate-950 font-black uppercase text-xs tracking-wider shrink-0 shadow-md"
            >
              + Crear Grupo
            </button>
          </div>
        </div>
      )}

      {/* ── 3. EQUIPOS SIN ASIGNAR / PENDIENTES (Si existen) ── */}
      {unassignedTeams.length > 0 && tournamentFormat === 'groups' && (
        <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <h3 className="font-black uppercase text-sm text-red-300">
                  Equipos Pendientes de Asignación ({unassignedTeams.length})
                </h3>
                <p className="text-[10px] text-red-400/80 font-semibold">
                  Selecciona a qué grupo deseas transferir estas franquicias
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {unassignedTeams.map(t => (
              <div key={t.id} className="p-3 bg-slate-900 border border-red-500/30 rounded-xl flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-black uppercase text-xs text-white truncate">{t.name}</p>
                  <p className="text-[9px] text-slate-400 truncate">Del: {t.delegado}</p>
                </div>
                {role === 'ADMIN' && (
                  <select
                    value=""
                    onChange={e => e.target.value && handleMoveTeam(t.id, e.target.value)}
                    className="bg-slate-950 border border-amber-500 text-amber-400 text-[10px] font-black uppercase rounded-lg px-2 py-1 outline-none cursor-pointer"
                  >
                    <option value="">Asignar a... ▾</option>
                    {groups.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. TARJETAS DE GRUPOS DINÁMICAS (Crear, Modificar, Eliminar & Desplegables) ── */}
      {tournamentFormat !== 'playoffs' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {groups.map(groupName => {
            const groupTeams = teams.filter(t => (t.group || groups[0] || 'Grupo A') === groupName);

            return (
              <div 
                key={groupName} 
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Cabecera del Grupo con Acciones de Edición y Eliminación */}
                  <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shadow">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-black uppercase text-white tracking-widest text-base truncate">
                        {groupName}
                      </h3>
                      <p className="text-white/80 text-[10px] font-bold uppercase mt-0.5">
                        {groupTeams.length} {groupTeams.length === 1 ? 'equipo' : 'equipos'}
                      </p>
                    </div>

                    {/* Botones de Cabecera: Modificar y Eliminar Grupo */}
                    {role === 'ADMIN' && tournamentFormat === 'groups' && (
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {/* Modificar Nombre de Grupo */}
                        <button
                          onClick={() => setEditingGroupName({ oldName: groupName, newName: groupName })}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                          title="Modificar nombre del grupo"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Eliminar Grupo */}
                        {groups.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`¿Estás seguro de eliminar "${groupName}"?\nLos equipos dentro de este grupo pasarán a estado "Sin Grupo".`)) {
                                onDeleteGroup(groupName);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-red-600/40 hover:bg-red-600 text-white transition-colors"
                            title="Eliminar este grupo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Listado de Equipos en el Grupo */}
                  <div className="p-4 space-y-2.5">
                    {groupTeams.length > 0 ? (
                      groupTeams.map((team, idx) => (
                        <div 
                          key={team.id} 
                          className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-2.5 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-6 h-6 bg-orange-600 text-white rounded-lg flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="font-black uppercase text-xs sm:text-sm text-white truncate">{team.name}</p>
                              <p className="text-[9px] text-slate-400 font-semibold truncate">Del: {team.delegado}</p>
                            </div>
                          </div>

                          {/* Selector Desplegable de Transferencia Inmediata */}
                          {role === 'ADMIN' && tournamentFormat === 'groups' ? (
                            <div className="relative shrink-0">
                              <select
                                value={team.group || groupName}
                                onChange={e => handleMoveTeam(team.id, e.target.value)}
                                className="bg-slate-900 border border-amber-500/50 hover:border-amber-400 text-amber-400 text-[10px] font-black uppercase rounded-lg px-2.5 py-1.5 outline-none cursor-pointer pr-6 appearance-none shadow"
                              >
                                {groups.map(g => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                                <option value="Sin Grupo">Sin Grupo</option>
                              </select>
                              <ChevronDown className="w-3 h-3 text-amber-400 absolute right-1.5 top-2.5 pointer-events-none" />
                            </div>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                              {team.group || groupName}
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-slate-500 text-xs italic font-bold uppercase">
                        Sin equipos asignados
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer de Tarjeta con Selector Rápido para Añadir Equipo */}
                {role === 'ADMIN' && tournamentFormat === 'groups' && (
                  <div className="p-3 border-t border-slate-800 bg-slate-950/60">
                    <select
                      value=""
                      onChange={e => e.target.value && handleMoveTeam(e.target.value, groupName)}
                      className="w-full bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-300 text-[10px] font-bold uppercase rounded-xl py-2 px-3 outline-none cursor-pointer"
                    >
                      <option value="">+ Mover equipo a {groupName}... ▾</option>
                      {teams.filter(t => t.group !== groupName).map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} (Actual: {t.group || 'Sin Grupo'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ── 5. VISUALIZADOR DE BRACKET / PLAYOFFS (Eliminación Directa con Selectores Desplegables en Vivo) ── */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
          
          {/* Cabecera del Bracket con Controles y Botón de Guardado */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h3 className="text-xl font-black uppercase text-white flex items-center gap-2.5">
                <Trophy className="w-6 h-6 text-amber-400" />
                <span>Cuadro Oficial de Playoffs / Eliminación Directa</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Selecciona libremente los equipos mediante los menús desplegables en cada ranura y guarda los cruces
              </p>
            </div>

            {role === 'ADMIN' && (
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleResetDefaultBracket}
                  className="py-2.5 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 font-black uppercase text-[10px] flex items-center gap-1.5 transition-all shadow"
                  title="Restablecer sugerencia de cruces"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer Sugerencias</span>
                </button>
                <button
                  onClick={handleSyncBracketToCalendar}
                  className="btn-neon-action py-2.5 px-5 rounded-xl text-slate-950 font-black uppercase text-xs tracking-wider flex items-center gap-2 shadow-xl scale-[1.02] hover:scale-105 transition-all"
                >
                  <Save className="w-4 h-4 stroke-[3]" />
                  <span>Guardar Cuadro de Playoffs / Actualizar Llaves</span>
                </button>
              </div>
            )}
          </div>

          {/* Mensaje de Sincronización Exitosa */}
          {syncSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-black uppercase text-xs flex items-center justify-between gap-2 animate-scale-in shadow-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{syncSuccessMsg}</span>
              </div>
              {onGoToCalendar && (
                <button
                  onClick={onGoToCalendar}
                  className="px-3 py-1 bg-emerald-500 text-slate-950 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-400"
                >
                  Ver Calendario ➜
                </button>
              )}
            </div>
          )}

          {/* 3 Columnas del Bracket con Desplegables de Selección Libre */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Cuartos de Final (4 Llaves con Selección Directa) */}
            <div className="space-y-4">
              <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-center font-black uppercase text-xs text-amber-400 shadow-inner flex items-center justify-center gap-2">
                <Layers className="w-4 h-4" /> Cuartos de Final (4 Llaves)
              </div>
              <div className="space-y-3.5">
                {bracketSlots.filter(s => s.round === 'cuartos').map((slot, idx) => {
                  const matchingGame = findMatchingGame(slot.homeTeam, slot.awayTeam, slot.roundLabel);
                  const isFinished = matchingGame?.status === 'Finalizado';
                  const isLive = matchingGame?.status === 'En Curso';

                  return (
                    <div 
                      key={slot.id} 
                      className={`bg-slate-950/90 border rounded-2xl p-4 space-y-3 transition-all shadow-md ${
                        isLive ? 'border-red-500/60 ring-1 ring-red-500/30' :
                        isFinished ? 'border-emerald-500/40' :
                        'border-slate-800 hover:border-amber-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 border-b border-slate-800/80 pb-2">
                        <span className="text-amber-400 flex items-center gap-1">
                          Llave #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isLive && <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-500 text-[8px] animate-pulse">LIVE</span>}
                          {isFinished && <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500 text-[8px]">FIN</span>}
                          <span className="text-[9px] text-slate-500 font-bold">{slot.time}</span>
                        </div>
                      </div>

                      {/* Desplegable Equipo 1 (Local) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-400">
                          <span className="text-amber-400/90">Equipo 1 (Local)</span>
                          {matchingGame && (
                            <span className={`font-mono text-xs font-black ${
                              isFinished && matchingGame.homeScore > matchingGame.awayScore ? 'text-emerald-400' : 'text-white'
                            }`}>
                              PTS: {matchingGame.homeScore}
                            </span>
                          )}
                        </div>
                        {role === 'ADMIN' ? (
                          <div className="relative">
                            <select
                              value={slot.homeTeam}
                              onChange={e => handleDirectSlotChange(slot.id, 'homeTeam', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 hover:border-amber-400 focus:border-amber-500 text-amber-300 text-[11px] font-black uppercase rounded-xl px-3 py-2 outline-none cursor-pointer appearance-none transition-colors pr-7 shadow-inner"
                            >
                              <optgroup label="Franquicias Inscritas">
                                {teams.map(t => (
                                  <option key={t.id} value={t.name}>{t.name} ({t.group || 'Sin Grupo'})</option>
                                ))}
                              </optgroup>
                              <optgroup label="Posiciones / Comodines de Clasificación">
                                {availableSeedOptions.presets.map(p => (
                                  <option key={p} value={p}>{p}</option>
                                ))}
                              </optgroup>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-amber-400 absolute right-2.5 top-2.5 pointer-events-none" />
                          </div>
                        ) : (
                          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-black uppercase text-white truncate">
                            {slot.homeTeam}
                          </div>
                        )}
                      </div>

                      {/* Desplegable Equipo 2 (Visitante) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-400">
                          <span className="text-cyan-400/90">Equipo 2 (Visitante)</span>
                          {matchingGame && (
                            <span className={`font-mono text-xs font-black ${
                              isFinished && matchingGame.awayScore > matchingGame.homeScore ? 'text-emerald-400' : 'text-white'
                            }`}>
                              PTS: {matchingGame.awayScore}
                            </span>
                          )}
                        </div>
                        {role === 'ADMIN' ? (
                          <div className="relative">
                            <select
                              value={slot.awayTeam}
                              onChange={e => handleDirectSlotChange(slot.id, 'awayTeam', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 hover:border-cyan-400 focus:border-cyan-500 text-cyan-300 text-[11px] font-black uppercase rounded-xl px-3 py-2 outline-none cursor-pointer appearance-none transition-colors pr-7 shadow-inner"
                            >
                              <optgroup label="Franquicias Inscritas">
                                {teams.map(t => (
                                  <option key={t.id} value={t.name}>{t.name} ({t.group || 'Sin Grupo'})</option>
                                ))}
                              </optgroup>
                              <optgroup label="Posiciones / Comodines de Clasificación">
                                {availableSeedOptions.presets.map(p => (
                                  <option key={p} value={p}>{p}</option>
                                ))}
                              </optgroup>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2.5 top-2.5 pointer-events-none" />
                          </div>
                        ) : (
                          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-black uppercase text-white truncate">
                            {slot.awayTeam}
                          </div>
                        )}
                      </div>

                      <div className="pt-1.5 border-t border-slate-900/90 flex items-center justify-between text-[9px] text-slate-500 font-medium">
                        <span>📅 {slot.date}</span>
                        <span>📍 {slot.location}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Semifinales (2 Llaves con Selección Directa) */}
            <div className="space-y-4">
              <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-center font-black uppercase text-xs text-cyan-400 shadow-inner flex items-center justify-center gap-2">
                <SplitSquareVertical className="w-4 h-4" /> Semifinales (2 Llaves)
              </div>
              <div className="space-y-4 md:mt-6">
                {bracketSlots.filter(s => s.round === 'semis').map((slot, idx) => {
                  const matchingGame = findMatchingGame(slot.homeTeam, slot.awayTeam, slot.roundLabel);
                  const isFinished = matchingGame?.status === 'Finalizado';
                  const isLive = matchingGame?.status === 'En Curso';

                  return (
                    <div 
                      key={slot.id} 
                      className={`bg-slate-950/90 border rounded-2xl p-4 space-y-3 transition-all shadow-xl ${
                        isLive ? 'border-red-500/60 ring-1 ring-red-500/30' :
                        isFinished ? 'border-cyan-500/40' :
                        'border-cyan-500/20 hover:border-cyan-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 border-b border-slate-800/80 pb-2">
                        <span className="text-cyan-400">Semifinal #{idx + 1}</span>
                        <div className="flex items-center gap-1.5">
                          {isLive && <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-500 text-[8px] animate-pulse">LIVE</span>}
                          {isFinished && <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500 text-[8px]">FIN</span>}
                          <span className="text-[9px] text-slate-500 font-bold">{slot.time}</span>
                        </div>
                      </div>

                      {/* Semifinalista 1 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-400">
                          <span className="text-amber-400/90">Semifinalista 1</span>
                          {matchingGame && (
                            <span className="font-mono text-xs font-black text-amber-400">PTS: {matchingGame.homeScore}</span>
                          )}
                        </div>
                        {role === 'ADMIN' ? (
                          <div className="relative">
                            <select
                              value={slot.homeTeam}
                              onChange={e => handleDirectSlotChange(slot.id, 'homeTeam', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 hover:border-amber-400 focus:border-amber-500 text-amber-300 text-[11px] font-black uppercase rounded-xl px-3 py-2 outline-none cursor-pointer appearance-none transition-colors pr-7"
                            >
                              <optgroup label="Posiciones / Ganadores">
                                {availableSeedOptions.presets.map(p => (
                                  <option key={p} value={p}>{p}</option>
                                ))}
                              </optgroup>
                              <optgroup label="Franquicias Inscritas">
                                {teams.map(t => (
                                  <option key={t.id} value={t.name}>{t.name} ({t.group || 'Sin Grupo'})</option>
                                ))}
                              </optgroup>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-amber-400 absolute right-2.5 top-2.5 pointer-events-none" />
                          </div>
                        ) : (
                          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-black uppercase text-white truncate">
                            {slot.homeTeam}
                          </div>
                        )}
                      </div>

                      {/* Semifinalista 2 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-400">
                          <span className="text-cyan-400/90">Semifinalista 2</span>
                          {matchingGame && (
                            <span className="font-mono text-xs font-black text-cyan-400">PTS: {matchingGame.awayScore}</span>
                          )}
                        </div>
                        {role === 'ADMIN' ? (
                          <div className="relative">
                            <select
                              value={slot.awayTeam}
                              onChange={e => handleDirectSlotChange(slot.id, 'awayTeam', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 hover:border-cyan-400 focus:border-cyan-500 text-cyan-300 text-[11px] font-black uppercase rounded-xl px-3 py-2 outline-none cursor-pointer appearance-none transition-colors pr-7"
                            >
                              <optgroup label="Posiciones / Ganadores">
                                {availableSeedOptions.presets.map(p => (
                                  <option key={p} value={p}>{p}</option>
                                ))}
                              </optgroup>
                              <optgroup label="Franquicias Inscritas">
                                {teams.map(t => (
                                  <option key={t.id} value={t.name}>{t.name} ({t.group || 'Sin Grupo'})</option>
                                ))}
                              </optgroup>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2.5 top-2.5 pointer-events-none" />
                          </div>
                        ) : (
                          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-black uppercase text-white truncate">
                            {slot.awayTeam}
                          </div>
                        )}
                      </div>

                      <div className="pt-1.5 border-t border-slate-900 flex items-center justify-between text-[9px] text-slate-500 font-medium">
                        <span>📅 {slot.date}</span>
                        <span>📍 {slot.location}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Gran Final (Selección Directa de Finalistas) */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 rounded-xl text-center font-black uppercase text-xs text-slate-950 shadow-lg flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4 text-slate-950 stroke-[3]" /> Gran Final del Torneo
              </div>
              <div className="md:mt-12 bg-slate-950 border border-amber-500/60 rounded-3xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping inline-block" />
                </div>
                
                <div className="text-center pb-1">
                  <GoldTrophyIcon3D className="w-14 h-14 mx-auto drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
                  <p className="text-[11px] font-black uppercase text-amber-400 tracking-widest mt-2">Duelo por la Corona</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">{bracketSlots.find(s => s.round === 'final')?.location}</p>
                </div>

                {bracketSlots.filter(s => s.round === 'final').map(slot => {
                  const matchingGame = findMatchingGame(slot.homeTeam, slot.awayTeam, slot.roundLabel);

                  return (
                    <div key={slot.id} className="space-y-3">
                      {/* Finalista 1 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-400">
                          <span className="text-amber-400 font-bold">Finalista 1 (Local)</span>
                          {matchingGame && (
                            <span className="font-mono text-sm font-black text-amber-400">{matchingGame.homeScore}</span>
                          )}
                        </div>
                        {role === 'ADMIN' ? (
                          <div className="relative">
                            <select
                              value={slot.homeTeam}
                              onChange={e => handleDirectSlotChange(slot.id, 'homeTeam', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 hover:border-amber-400 text-amber-300 text-xs font-black uppercase rounded-xl px-3 py-2.5 outline-none cursor-pointer appearance-none pr-7 shadow-inner"
                            >
                              <optgroup label="Ganadores de Semifinal">
                                <option value="Ganador Semifinal #1">Ganador Semifinal #1</option>
                                <option value="Ganador Semifinal #2">Ganador Semifinal #2</option>
                              </optgroup>
                              <optgroup label="Franquicias Directas">
                                {teams.map(t => (
                                  <option key={t.id} value={t.name}>{t.name}</option>
                                ))}
                              </optgroup>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-amber-400 absolute right-2.5 top-3 pointer-events-none" />
                          </div>
                        ) : (
                          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-black uppercase text-white truncate">
                            {slot.homeTeam}
                          </div>
                        )}
                      </div>

                      {/* Finalista 2 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-400">
                          <span className="text-cyan-400 font-bold">Finalista 2 (Visitante)</span>
                          {matchingGame && (
                            <span className="font-mono text-sm font-black text-cyan-400">{matchingGame.awayScore}</span>
                          )}
                        </div>
                        {role === 'ADMIN' ? (
                          <div className="relative">
                            <select
                              value={slot.awayTeam}
                              onChange={e => handleDirectSlotChange(slot.id, 'awayTeam', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-xs font-black uppercase rounded-xl px-3 py-2.5 outline-none cursor-pointer appearance-none pr-7 shadow-inner"
                            >
                              <optgroup label="Ganadores de Semifinal">
                                <option value="Ganador Semifinal #2">Ganador Semifinal #2</option>
                                <option value="Ganador Semifinal #1">Ganador Semifinal #1</option>
                              </optgroup>
                              <optgroup label="Franquicias Directas">
                                {teams.map(t => (
                                  <option key={t.id} value={t.name}>{t.name}</option>
                                ))}
                              </optgroup>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2.5 top-3 pointer-events-none" />
                          </div>
                        ) : (
                          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-black uppercase text-white truncate">
                            {slot.awayTeam}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-900 text-center text-[10px] text-slate-500 font-bold uppercase">
                        📅 {slot.date} · {slot.time}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Botón inferior de confirmación y guardado */}
          {role === 'ADMIN' && (
            <div className="pt-2 flex justify-center">
              <button
                onClick={handleSyncBracketToCalendar}
                className="btn-neon-action py-3 px-8 rounded-2xl text-slate-950 font-black uppercase text-xs tracking-wider flex items-center gap-2.5 shadow-2xl scale-[1.02] hover:scale-105 transition-all"
              >
                <Save className="w-4 h-4 stroke-[3]" />
                <span>Guardar Cuadro de Playoffs & Sincronizar con Calendario</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── 7. MODAL PARA MODIFICAR NOMBRE DE GRUPO ── */}
      {editingGroupName && (
        <SimpleDialog title={`Renombrar Serie / Grupo`} onClose={() => setEditingGroupName(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                Nombre Actual: <strong className="text-white">{editingGroupName.oldName}</strong>
              </label>
              <input
                type="text"
                value={editingGroupName.newName}
                onChange={e => setEditingGroupName({ ...editingGroupName, newName: e.target.value })}
                placeholder="Nuevo nombre (ej. Grupo Occidental)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <p className="text-[10px] text-slate-400 italic">
              * Al renombrar, todos los equipos asignados a este grupo actualizarán su serie automáticamente.
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setEditingGroupName(null)}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase text-xs rounded-xl"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onRenameGroup(editingGroupName.oldName, editingGroupName.newName);
                setEditingGroupName(null);
              }}
              className="flex-1 btn-neon-action py-2.5 text-slate-950 font-black uppercase text-xs rounded-xl"
            >
              Guardar Nombre
            </button>
          </div>
        </SimpleDialog>
      )}
    </div>
  );
}

// ── 4. CalendarView (Control Manual, Flexible y Edición Total) ──
function CalendarView({
  role, games, teams, tournamentFormat, onAddGame, onUpdateGame, onDeleteGame, onGoToLive
}: {
  role: Role,
  games: Game[],
  teams: Team[],
  tournamentFormat?: TournamentFormat,
  onAddGame: (game: Omit<Game, 'id'>) => void,
  onUpdateGame: (id: string, updates: Partial<Game>) => void,
  onDeleteGame: (id: string) => void,
  onGoToLive: () => void,
}) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'Programado' | 'En Curso' | 'Finalizado'>('TODOS');

  // Valores predeterminados para creación manual
  const defaultPhase = tournamentFormat === 'playoffs' ? 'Cuartos de Final' : tournamentFormat === 'round_robin' ? 'Ronda Regular' : 'Fase de Grupos';

  const [newGame, setNewGame] = useState({
    homeTeam: teams[0]?.name || '',
    awayTeam: teams[1]?.name || '',
    phase: defaultPhase,
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    location: 'Cancha Principal',
    status: 'Programado' as const,
  });

  const venueSuggestions = ['Cancha Principal', 'Gimnasio Cubierto', 'Tabloncillo Central', 'Plaza Central B5', 'Cancha 2'];
  const phaseSuggestions = ['Jornada 1', 'Jornada 2', 'Jornada 3', 'Jornada 4', 'Fase de Grupos', 'Ronda Regular', 'Cuartos de Final', 'Semifinal', 'Gran Final'];

  const handleScheduleSubmit = () => {
    if (newGame.homeTeam && newGame.awayTeam && newGame.homeTeam !== newGame.awayTeam) {
      onAddGame({
        ...newGame,
        homeScore: 0,
        awayScore: 0,
        homeQuarters: [0, 0, 0, 0],
        awayQuarters: [0, 0, 0, 0],
      });
      setIsScheduling(false);
    } else {
      alert('Selecciona dos franquicias diferentes para programar el partido.');
    }
  };

  const filteredGames = games.filter(g => filterStatus === 'TODOS' ? true : g.status === filterStatus);

  const getTeamLogo = (teamName: string) => {
    const t = teams.find(item => item.name === teamName);
    return t?.logoUrl;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Barra superior de control y Agendamiento */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-white flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-amber-400" />
            <span>Calendario Oficial & Fixture</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
            Programación manual de partidos, selección libre de emparejamientos y sedes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filtros de Estado */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-black uppercase">
            {(['TODOS', 'En Curso', 'Programado', 'Finalizado'] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === st ? 'bg-orange-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Botón de Creación Manual */}
          {role === 'ADMIN' && (
            <button
              onClick={() => setIsScheduling(true)}
              className="btn-neon-action py-2.5 px-4 rounded-xl text-slate-950 font-black uppercase text-xs tracking-wider flex items-center gap-2 shadow-lg shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Crear / Agendar Partido</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Formulario de Creación / Agendamiento Manual ── */}
      {isScheduling && (
        <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-6 shadow-2xl animate-scale-in space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-black uppercase text-amber-400 text-base flex items-center gap-2">
              <CalendarDays className="w-5 h-5" /> Programar Nuevo Partido Manualmente
            </h3>
            <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              Elección Libre de Franquicias
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Equipo Local */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Equipo Local</label>
              <select
                value={newGame.homeTeam}
                onChange={e => setNewGame(p => ({ ...p, homeTeam: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-orange-500"
              >
                {teams.map(t => (
                  <option key={t.id} value={t.name}>{t.name} ({t.group || 'Sin Grupo'})</option>
                ))}
              </select>
            </div>

            {/* Equipo Visitante */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Equipo Visitante</label>
              <select
                value={newGame.awayTeam}
                onChange={e => setNewGame(p => ({ ...p, awayTeam: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-orange-500"
              >
                {teams.map(t => (
                  <option key={t.id} value={t.name}>{t.name} ({t.group || 'Sin Grupo'})</option>
                ))}
              </select>
            </div>

            {/* Jornada / Ronda / Fase */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Jornada / Ronda / Fase</label>
              <input
                type="text"
                value={newGame.phase}
                onChange={e => setNewGame(p => ({ ...p, phase: e.target.value }))}
                placeholder="Ej. Jornada 1, Cuartos de Final"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {phaseSuggestions.slice(0, 5).map(sug => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setNewGame(p => ({ ...p, phase: sug }))}
                    className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Fecha del Encuentro</label>
              <input
                type="date"
                value={newGame.date}
                onChange={e => setNewGame(p => ({ ...p, date: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Hora */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Hora</label>
              <input
                type="time"
                value={newGame.time}
                onChange={e => setNewGame(p => ({ ...p, time: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Sede / Cancha */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Cancha / Sede</label>
              <input
                type="text"
                value={newGame.location}
                onChange={e => setNewGame(p => ({ ...p, location: e.target.value }))}
                placeholder="Gimnasio Techado, Cancha 1..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {venueSuggestions.slice(0, 3).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setNewGame(p => ({ ...p, location: v }))}
                    className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsScheduling(false)}
              className="py-2.5 px-5 rounded-xl bg-slate-800 text-slate-300 font-bold uppercase text-xs hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleScheduleSubmit}
              className="btn-neon-action py-2.5 px-6 rounded-xl text-slate-950 font-black uppercase text-xs tracking-wider shadow-lg"
            >
              Confirmar y Agendar
            </button>
          </div>
        </div>
      )}

      {/* ── Lista de Partidos Agendados ── */}
      <div className="space-y-3.5">
        {filteredGames.length > 0 ? (
          filteredGames.map(game => {
            const homeLogo = getTeamLogo(game.homeTeam);
            const awayLogo = getTeamLogo(game.awayTeam);

            return (
              <div 
                key={game.id} 
                className="bg-gradient-to-r from-slate-900 via-[#0F172A] to-slate-900 border-2 border-amber-500/80 hover:border-amber-400 rounded-3xl p-5 sm:p-7 shadow-[0_6px_25px_rgba(0,0,0,0.7)] transition-all flex flex-col gap-5"
              >
                {/* Cabecera metadata del partido */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                      game.status === 'Finalizado' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' :
                      game.status === 'En Curso' ? 'bg-red-950 text-red-400 border border-red-500/50 animate-pulse' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {game.status}
                    </span>
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                      {game.phase}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-cyan-400" /> {game.date} · {game.time}
                    </span>
                    <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-400" /> {game.location}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={onGoToLive}
                      className="py-2 px-3.5 rounded-xl bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/40 font-black uppercase text-[11px] tracking-wider transition-all flex items-center gap-1.5"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Resultados Live</span>
                    </button>

                    {role === 'ADMIN' && (
                      <>
                        <button
                          onClick={() => setEditingGame(game)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                          title="Editar partido manualmente"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de eliminar el partido "${game.homeTeam} vs ${game.awayTeam}"?`)) {
                              onDeleteGame(game.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-400 border border-slate-700 transition-colors"
                          title="Eliminar partido"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Enfrentamiento Vertical 3 Columnas Responsivo */}
                <div className="grid grid-cols-3 md:flex md:flex-row items-center justify-between gap-2 sm:gap-6 pt-1 w-full max-w-full overflow-hidden">
                  {/* Local */}
                  <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2 flex-1 min-w-0 max-w-full md:max-w-[180px]">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 max-w-[80px] max-h-[80px] rounded-2xl bg-gradient-to-b from-slate-800 via-[#0a1120] to-slate-950 p-1 sm:p-1.5 border-2 border-amber-400/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_10px_25px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden shrink-0">
                      {homeLogo ? (
                        <img src={homeLogo} alt={game.homeTeam} className="w-full h-full max-w-full max-h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.75)]" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : (
                        <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.75)]" />
                      )}
                    </div>
                    <span className="font-black uppercase text-xs sm:text-base text-white block leading-tight text-center break-words w-full px-0.5">
                      {game.homeTeam}
                    </span>
                    <span className="inline-block text-[9px] sm:text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-950/80 border border-amber-500/50 px-2 sm:px-2.5 py-0.5 rounded-lg">
                      LOCAL
                    </span>
                  </div>

                  {/* Marcador Central - SIEMPRE EN UNA SOLA LÍNEA HORIZONTAL */}
                  <div className="flex flex-col items-center justify-center shrink-0 space-y-1 min-w-fit px-1">
                    {game.status === 'Finalizado' || game.status === 'En Curso' ? (
                      <div className="flex flex-row flex-nowrap items-center justify-center whitespace-nowrap font-mono font-black text-base sm:text-2xl md:text-4xl text-amber-300 bg-slate-950 px-2 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl border border-slate-800 shadow-inner shrink-0 tracking-tight leading-none">
                        <span className="text-[#00E676] whitespace-nowrap">{game.homeScore}</span>
                        <span className="px-1 text-amber-500/80 whitespace-nowrap">-</span>
                        <span className="text-[#FF3D00] whitespace-nowrap">{game.awayScore}</span>
                      </div>
                    ) : (
                      <span className="font-black text-amber-400 text-xs sm:text-xl bg-slate-950 px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl border border-slate-800 whitespace-nowrap">
                        VS
                      </span>
                    )}
                  </div>

                  {/* Visitante */}
                  <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2 flex-1 min-w-0 max-w-full md:max-w-[180px]">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 max-w-[80px] max-h-[80px] rounded-2xl bg-gradient-to-b from-slate-800 via-[#0a1120] to-slate-950 p-1 sm:p-1.5 border-2 border-purple-400/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_10px_25px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden shrink-0">
                      {awayLogo ? (
                        <img src={awayLogo} alt={game.awayTeam} className="w-full h-full max-w-full max-h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.75)]" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : (
                        <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-[#E879F9] filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.75)]" />
                      )}
                    </div>
                    <span className="font-black uppercase text-xs sm:text-base text-white block leading-tight text-center break-words w-full px-0.5">
                      {game.awayTeam}
                    </span>
                    <span className="inline-block text-[9px] sm:text-[10px] font-black text-[#E879F9] uppercase tracking-widest bg-fuchsia-950/80 border border-fuchsia-500/50 px-2 sm:px-2.5 py-0.5 rounded-lg">
                      VISITANTE
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-500 font-bold uppercase text-xs">
            No hay partidos agendados en este filtro.
          </div>
        )}
      </div>

      {/* ── Modal de Edición Manual Completa de Partido ── */}
      {editingGame && (
        <SimpleDialog title={`Editar Encuentro Manualmente`} onClose={() => setEditingGame(null)}>
          <div className="space-y-4">
            
            {/* Selección de Franquicias */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Equipo Local</label>
                <select
                  value={editingGame.homeTeam}
                  onChange={e => setEditingGame({ ...editingGame, homeTeam: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.name}>{t.name} ({t.group})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Equipo Visitante</label>
                <select
                  value={editingGame.awayTeam}
                  onChange={e => setEditingGame({ ...editingGame, awayTeam: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.name}>{t.name} ({t.group})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Marcador directo (si aplica) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Puntos {editingGame.homeTeam}</label>
                <input
                  type="number"
                  min={0}
                  value={editingGame.homeScore}
                  onChange={e => setEditingGame({ ...editingGame, homeScore: +e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Puntos {editingGame.awayTeam}</label>
                <input
                  type="number"
                  min={0}
                  value={editingGame.awayScore}
                  onChange={e => setEditingGame({ ...editingGame, awayScore: +e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                />
              </div>
            </div>

            {/* Fase / Jornada */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Fase / Jornada</label>
              <input
                type="text"
                value={editingGame.phase}
                onChange={e => setEditingGame({ ...editingGame, phase: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {phaseSuggestions.map(sug => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setEditingGame({ ...editingGame, phase: sug })}
                    className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Fecha</label>
                <input
                  type="date"
                  value={editingGame.date}
                  onChange={e => setEditingGame({ ...editingGame, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Hora</label>
                <input
                  type="time"
                  value={editingGame.time}
                  onChange={e => setEditingGame({ ...editingGame, time: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                />
              </div>
            </div>

            {/* Sede y Estado */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Sede / Cancha</label>
                <input
                  type="text"
                  value={editingGame.location}
                  onChange={e => setEditingGame({ ...editingGame, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Estado</label>
                <select
                  value={editingGame.status}
                  onChange={e => setEditingGame({ ...editingGame, status: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                >
                  <option value="Programado">Programado</option>
                  <option value="En Curso">En Curso (Live)</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setEditingGame(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold uppercase text-xs rounded-xl">Cancelar</button>
            <button onClick={() => { onUpdateGame(editingGame.id, editingGame); setEditingGame(null); }} className="flex-1 btn-neon-action py-2.5 text-slate-950 font-black uppercase text-xs rounded-xl">Guardar Cambios</button>
          </div>
        </SimpleDialog>
      )}
    </div>
  );
}

// ── 5. LiveResultsView (Resultados Live Multi-Partido & Carga Directa Q1-Q4) ──
function LiveResultsView({
  role, games, teams, onUpdateGame, disciplineTitle
}: {
  role: Role,
  games: Game[],
  teams: Team[],
  onUpdateGame: (id: string, updates: Partial<Game>) => void,
  disciplineTitle: string,
}) {
  const [filter, setFilter] = useState<'TODOS' | 'En Curso' | 'Programado' | 'Finalizado'>('TODOS');

  const filteredGames = games.filter(g => {
    if (filter === 'TODOS') return true;
    return g.status === filter;
  });

  const liveCount = games.filter(g => g.status === 'En Curso').length;
  const scheduledCount = games.filter(g => g.status === 'Programado').length;
  const finishedCount = games.filter(g => g.status === 'Finalizado').length;

  return (
    <div className="py-2 px-3 space-y-3 animate-fade-in">
      
      {/* Cabecera & Barra de Filtros Rápidos (Ultra-Compacta) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl py-2 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-500 shadow-md shrink-0">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase italic text-white flex items-center gap-2 leading-none">
              <span>Resultados Live · {disciplineTitle}</span>
            </h2>
            <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider mt-0.5 leading-none">
              Carga manual directa en Q1-Q4 · Suma automática en tiempo real · Visualización multi-partido
            </p>
          </div>
        </div>

        {/* Pestañas de Filtro Rápido */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0">
          {[
            { id: 'TODOS', label: 'Todos', count: games.length },
            { id: 'En Curso', label: '🔴 Live', count: liveCount },
            { id: 'Programado', label: '📅 Programados', count: scheduledCount },
            { id: 'Finalizado', label: '✓ Finalizados', count: finishedCount },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-2.5 py-1 rounded-lg font-black uppercase text-[10px] transition-all flex items-center gap-1 shrink-0 ${
                filter === f.id
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{f.label}</span>
              <span className={`text-[8px] px-1 py-0.2 rounded ${
                filter === f.id ? 'bg-slate-950 text-amber-400' : 'bg-slate-900 text-slate-500'
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Multi-Partido (Rejilla Responsiva de 2 Columnas) */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2">
          {filteredGames.map(game => (
            <CompactMatchCard
              key={game.id}
              game={game}
              teams={teams}
              role={role}
              onUpdateGame={onUpdateGame}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-500 font-bold uppercase text-xs">
          No hay encuentros registrados en este filtro.
        </div>
      )}
    </div>
  );
}

// ── Tarjeta Compacta de Partido con Carga Directa en Cuartos ──
function CompactMatchCard({
  game,
  teams,
  role,
  onUpdateGame
}: {
  game: Game;
  teams: Team[];
  role: Role;
  onUpdateGame: (id: string, updates: Partial<Game>) => void;
}) {
  const [homeQ, setHomeQ] = useState<number[]>(game.homeQuarters || [0, 0, 0, 0]);
  const [awayQ, setAwayQ] = useState<number[]>(game.awayQuarters || [0, 0, 0, 0]);
  const [status, setStatus] = useState<'Programado' | 'En Curso' | 'Finalizado'>(game.status || 'Programado');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setHomeQ(game.homeQuarters || [0, 0, 0, 0]);
    setAwayQ(game.awayQuarters || [0, 0, 0, 0]);
    setStatus(game.status || 'Programado');
  }, [game]);

  const totalHome = homeQ.reduce((a, b) => a + Number(b || 0), 0);
  const totalAway = awayQ.reduce((a, b) => a + Number(b || 0), 0);

  const homeLogo = teams.find(t => t.name === game.homeTeam)?.logoUrl;
  const awayLogo = teams.find(t => t.name === game.awayTeam)?.logoUrl;

  const handleScoreChange = (teamId: 'home' | 'away', quarterIndex: number, val: number) => {
    const safeVal = Math.max(0, isNaN(val) ? 0 : val);
    if (teamId === 'home') {
      setHomeQ(prev => {
        const next = [...prev];
        next[quarterIndex] = safeVal;
        return next;
      });
    } else {
      setAwayQ(prev => {
        const next = [...prev];
        next[quarterIndex] = safeVal;
        return next;
      });
    }
  };

  const handleSave = () => {
    onUpdateGame(game.id, {
      homeScore: totalHome,
      awayScore: totalAway,
      homeQuarters: homeQ,
      awayQuarters: awayQ,
      status: status,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 mb-3 max-w-4xl mx-auto space-y-2.5 shadow-lg">
      {/* Cabecera Compacta */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[9px] font-black uppercase text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 truncate">
            {game.phase || 'Encuentro'}
          </span>
          <span className="text-[9px] text-slate-400 font-medium truncate">
            📍 {game.location} · 🕒 {game.time}
          </span>
        </div>
        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
          status === 'En Curso' ? 'bg-red-950 text-red-400 border border-red-500/50 animate-pulse' :
          status === 'Finalizado' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' :
          'bg-slate-950 text-slate-400 border border-slate-800'
        }`}>
          {status === 'En Curso' ? '🔴 LIVE' : status}
        </span>
      </div>

      {/* Marcador Global con Logos 3D y Equipos */}
      <div className="grid grid-cols-2 gap-3 items-center text-center bg-gradient-to-r from-slate-900 via-[#0F172A] to-slate-900 p-3 sm:p-4 rounded-2xl border-2 border-amber-500/70 shadow-lg">
        
        {/* Equipo Local */}
        <div className="flex flex-col items-center space-y-1.5 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 max-w-[64px] max-h-[64px] rounded-2xl bg-gradient-to-b from-slate-800 via-[#0b1222] to-slate-950 p-2 border-2 border-amber-500/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_8px_20px_rgba(0,0,0,0.7)] flex items-center justify-center overflow-hidden shrink-0">
            {homeLogo ? (
              <img src={homeLogo} alt={game.homeTeam} className="w-full h-full max-w-full max-h-full object-contain filter drop-shadow-[0_6px_8px_rgba(0,0,0,0.6)]" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <Trophy className="w-8 h-8 text-amber-400 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" />
            )}
          </div>
          <span className="text-xs sm:text-sm font-black text-white uppercase truncate max-w-full px-1">{game.homeTeam}</span>
          <span className="text-[9px] font-black text-amber-400 bg-amber-950/80 border border-amber-500/50 px-2 py-0.5 rounded uppercase">LOCAL</span>
          <p className="text-2xl sm:text-3xl font-black text-[#00E676] font-mono drop-shadow-[0_2px_8px_rgba(0,230,118,0.4)]">
            {totalHome}
          </p>
        </div>

        {/* Equipo Visitante */}
        <div className="flex flex-col items-center space-y-1.5 min-w-0 border-l border-slate-800 pl-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 max-w-[64px] max-h-[64px] rounded-2xl bg-gradient-to-b from-slate-800 via-[#0b1222] to-slate-950 p-2 border-2 border-purple-500/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_8px_20px_rgba(0,0,0,0.7)] flex items-center justify-center overflow-hidden shrink-0">
            {awayLogo ? (
              <img src={awayLogo} alt={game.awayTeam} className="w-full h-full max-w-full max-h-full object-contain filter drop-shadow-[0_6px_8px_rgba(0,0,0,0.6)]" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <Trophy className="w-8 h-8 text-[#E879F9] filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" />
            )}
          </div>
          <span className="text-xs sm:text-sm font-black text-white uppercase truncate max-w-full px-1">{game.awayTeam}</span>
          <span className="text-[9px] font-black text-purple-300 bg-purple-950/80 border border-purple-500/50 px-2 py-0.5 rounded uppercase">VISITANTE</span>
          <p className="text-2xl sm:text-3xl font-black text-[#FF3D00] font-mono drop-shadow-[0_2px_8px_rgba(255,61,0,0.4)]">
            {totalAway}
          </p>
        </div>

      </div>

      {/* Componente de Cuartos Q1-Q4 (Equipo Local) */}
      <div className="space-y-1">
        <span className="text-[9px] font-bold uppercase text-blue-400">Cuartos: {game.homeTeam} (Local)</span>
        <div className="grid grid-cols-4 gap-2 my-2">
          {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, index) => (
            <div key={quarter} className="flex flex-col items-center bg-slate-800/80 p-1.5 rounded border border-slate-700">
              <span className="text-[10px] text-gray-400 font-bold uppercase">{quarter}</span>
              <input
                type="number"
                min="0"
                disabled={role !== 'ADMIN'}
                className="w-full text-center bg-slate-900 text-white font-bold text-sm py-1 px-1 rounded border border-amber-500/40 focus:outline-none focus:border-amber-400 mt-1"
                value={homeQ[index] || 0}
                onChange={(e) => handleScoreChange('home', index, parseInt(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Componente de Cuartos Q1-Q4 (Equipo Visitante) */}
      <div className="space-y-1">
        <span className="text-[9px] font-bold uppercase text-purple-400">Cuartos: {game.awayTeam} (Visitante)</span>
        <div className="grid grid-cols-4 gap-2 my-2">
          {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, index) => (
            <div key={quarter} className="flex flex-col items-center bg-slate-800/80 p-1.5 rounded border border-slate-700">
              <span className="text-[10px] text-gray-400 font-bold uppercase">{quarter}</span>
              <input
                type="number"
                min="0"
                disabled={role !== 'ADMIN'}
                className="w-full text-center bg-slate-900 text-white font-bold text-sm py-1 px-1 rounded border border-cyan-500/40 focus:outline-none focus:border-cyan-400 mt-1"
                value={awayQ[index] || 0}
                onChange={(e) => handleScoreChange('away', index, parseInt(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Controles de Guardado & Estado */}
      {role === 'ADMIN' && (
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-black uppercase text-slate-400">Estado:</span>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 text-white text-[9px] font-bold uppercase rounded px-1.5 py-0.5 outline-none cursor-pointer"
            >
              <option value="En Curso">En Curso (Live)</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Programado">Programado</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            {savedSuccess && (
              <span className="text-[9px] font-black uppercase text-emerald-400 flex items-center gap-0.5 animate-scale-in">
                <Check className="w-3 h-3 stroke-[3]" /> Guardado
              </span>
            )}
            <button
              onClick={handleSave}
              className="btn-neon-action py-1 px-3 rounded-lg text-slate-950 font-black uppercase text-[9px] tracking-wider flex items-center gap-1 shadow hover:scale-105 transition-all"
            >
              <Save className="w-3 h-3 stroke-[3]" />
              <span>Guardar & Push</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 6. StandingsView (Tablas Oficiales Dinámicas e Independientes) ──
function StandingsView({ 
  standingsByGroup,
  tournamentFormat = 'groups'
}: { 
  standingsByGroup: Record<string, TeamStanding[]>,
  tournamentFormat?: TournamentFormat 
}) {
  const groupKeys = Object.keys(standingsByGroup);

  const headerTitle = tournamentFormat === 'round_robin' 
    ? 'Tabla General de Posiciones · Todos Contra Todos (Grupo Único)'
    : tournamentFormat === 'playoffs'
    ? 'Tabla Oficial de Posiciones & Rendimiento Acumulado'
    : 'Tabla Oficial de Posiciones por Grupos';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera Principal */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-white flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-400" />
            <span>{headerTitle}</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
            Acumulación automática e inmediata de JJ, JG, JP, PF, PC, DIF y PTS tras cada marcador oficial
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase bg-amber-950/70 border border-amber-500/40 text-amber-400 px-3.5 py-1.5 rounded-full">
            {groupKeys.length} {groupKeys.length === 1 ? 'Tabla Activa' : 'Grupos Oficiales'}
          </span>
        </div>
      </div>

      {/* Tablas Separadas e Independientes por Grupo / Tabla General */}
      <div className="space-y-6">
        {groupKeys.map(groupName => {
          const standings = standingsByGroup[groupName] || [];
          return (
            <div key={groupName} className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-800 via-indigo-800 to-slate-900 px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
                <h3 className="font-black uppercase text-white tracking-wider text-base flex items-center gap-2">
                  <span>{tournamentFormat === 'round_robin' ? 'Tabla Única General' : tournamentFormat === 'playoffs' ? `Rendimiento General · ${groupName}` : `Tabla de Posiciones · ${groupName}`}</span>
                </h3>
                <span className="text-[10px] font-black uppercase bg-slate-950/80 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
                  {standings.length} Franquicias
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      {['#', 'Equipo', 'JJ', 'JG', 'JP', 'PF', 'PC', 'DIF', 'PTS'].map(h => (
                        <th key={h} className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest first:text-center">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {standings.length > 0 ? (
                      standings.map((s, i) => (
                        <tr 
                          key={s.name} 
                          className={`hover:bg-slate-800/40 transition-colors ${
                            i < 2 ? 'border-l-4 border-l-amber-400 bg-amber-950/10' : ''
                          }`}
                        >
                          <td className="px-4 py-3.5 text-center">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black mx-auto ${
                              i === 0 ? 'bg-amber-400 text-slate-950' : i === 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-black uppercase text-sm text-white flex items-center gap-2">
                            <span>{s.name}</span>
                            {i < 2 && (
                              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                                Clasificado
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-sm text-slate-300">{s.jj}</td>
                          <td className="px-4 py-3.5 font-bold text-sm text-emerald-400">{s.jg}</td>
                          <td className="px-4 py-3.5 font-bold text-sm text-red-400">{s.jp}</td>
                          <td className="px-4 py-3.5 font-bold text-sm text-slate-300">{s.pf}</td>
                          <td className="px-4 py-3.5 font-bold text-sm text-slate-300">{s.pc}</td>
                          <td className="px-4 py-3.5 font-bold text-sm text-cyan-400">{s.dif > 0 ? `+${s.dif}` : s.dif}</td>
                          <td className="px-4 py-3.5 font-black text-base text-amber-400">{s.ptos}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-6 text-xs italic text-slate-500 uppercase font-bold">
                          Sin equipos ni resultados cargados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Banner Informativo de Criterio de Puntuación */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-300">
            Criterio Oficial de Acumulación: <strong className="text-amber-400">Victoria (+2 PTS)</strong> · <strong className="text-cyan-400">Derrota en juego disputado (+1 PT)</strong> · <strong className="text-emerald-400">DIF = PF - PC</strong>
          </span>
        </div>
        <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
          Procesamiento Reactivo 360
        </span>
      </div>
    </div>
  );
}

// ── 7. SecurityView (Auditoría en Tiempo Real Exclusiva Admin) ──
function SecurityView({ 
  auditLogs, 
  onClearLogs 
}: { 
  auditLogs: AuditLog[], 
  onClearLogs: () => void 
}) {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter(l => filterType === 'ALL' ? true : l.type === filterType);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-red-500" />
            <span>Módulo de Seguridad & Auditoría en Tiempo Real</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
            Registro dinámico e inmutable de accesos, modificaciones de nómina y carga de resultados (Exclusivo SuperAdmin)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearLogs}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase transition-colors"
          >
            Limpiar Logs
          </button>
        </div>
      </div>

      {/* Filtros de Logs */}
      <div className="flex gap-2">
        {[
          { id: 'ALL', label: 'Todos los Registros' },
          { id: 'auth', label: 'Inicios de Sesión' },
          { id: 'score', label: 'Marcadores & Live' },
          { id: 'team', label: 'Equipos & Nóminas' },
          { id: 'group', label: 'Grupos' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase transition-all ${
              filterType === f.id ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabla Dinámica de Auditoría */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest">Usuario / Persona</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest">Rol</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest">Identificador / Cédula</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest">Acción / Evento Registrado</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest">Fecha & Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-white font-sans uppercase">{log.userName}</td>
                    <td className="px-4 py-3 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        log.userRole === 'ADMIN' ? 'bg-red-950 text-red-400 border border-red-500/40' :
                        log.userRole === 'DELEGADO' ? 'bg-blue-950 text-blue-400 border border-blue-500/40' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {log.userRole}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-bold">{log.identifier}</td>
                    <td className="px-4 py-3 text-slate-200 font-sans">{log.action}</td>
                    <td className="px-4 py-3 text-amber-400 font-bold text-[11px]">{log.timestamp}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-xs text-slate-500 font-sans uppercase">
                    No hay registros de auditoría para este filtro
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DIALOGS Y MODALES REUTILIZABLES (DARK MODE)
// ═══════════════════════════════════════════════════════════════

function SimpleDialog({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in text-slate-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
          <h3 className="font-black uppercase text-white text-base tracking-wide">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EditTeamDialog({
  team, groups, onChange, onSave, onClose, fileInputRef
}: {
  team: Team,
  groups: string[],
  onChange: React.Dispatch<React.SetStateAction<Team | null>>,
  onSave: () => void,
  onClose: () => void,
  fileInputRef: React.RefObject<HTMLInputElement>,
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(p => p ? { ...p, logoUrl: URL.createObjectURL(file) } : null);
    }
  };

  return (
    <SimpleDialog title={`Editar Equipo: ${team.name}`} onClose={onClose}>
      <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Nombre del Equipo</label>
          <input
            value={team.name}
            onChange={e => onChange(p => p ? { ...p, name: e.target.value } : null)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Delegado Responsable</label>
          <input
            value={team.delegado}
            onChange={e => onChange(p => p ? { ...p, delegado: e.target.value } : null)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Grupo Asignado</label>
          <select
            value={team.group}
            onChange={e => onChange(p => p ? { ...p, group: e.target.value } : null)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-amber-400 outline-none"
          >
            {groups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
            <option value="Sin Grupo">Sin Grupo</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Teléfono</label>
          <input
            value={team.telefono}
            onChange={e => onChange(p => p ? { ...p, telefono: e.target.value } : null)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">CLAVE / PIN DEL DELEGADO *</label>
          <input
            type="text"
            placeholder="Ej. 456 o PIN asignado"
            value={team.delegatePin || ''}
            onChange={e => onChange(p => p ? { ...p, delegatePin: e.target.value } : null)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-black text-amber-400 outline-none focus:ring-2 focus:ring-orange-500 tracking-wider"
          />
          <p className="text-[9px] text-slate-500 font-bold mt-1">Clave de acceso exclusiva para que el delegado ingrese a este equipo.</p>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Logo</label>
          <div 
            onClick={() => fileInputRef.current?.click()} 
            className="border-2 border-dashed border-slate-700 rounded-xl p-4 cursor-pointer hover:border-orange-500 flex flex-col items-center justify-center gap-2 transition-colors bg-slate-950/60"
          >
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            {team.logoUrl ? (
              <img src={team.logoUrl} alt="Preview" className="w-14 h-14 object-contain" />
            ) : (
              <>
                <Upload className="w-5 h-5 text-slate-400" />
                <p className="text-[10px] uppercase font-bold text-slate-400">Hacer clic para subir logo</p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase text-xs rounded-xl">
          Cancelar
        </button>
        <button onClick={onSave} className="flex-1 btn-neon-action py-3 text-slate-950 font-black uppercase text-xs rounded-xl tracking-wider">
          Guardar Cambios
        </button>
      </div>
    </SimpleDialog>
  );
}