-- ==============================================================================
-- JL Sports Club 360 – Esquema de Tablas para Supabase Realtime Database
-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase (supabase.com)
-- ==============================================================================

-- 1. Tabla de Equipos
CREATE TABLE IF NOT EXISTS public.equipos (
    id TEXT PRIMARY KEY,
    discipline TEXT NOT NULL DEFAULT 'baloncesto',
    name TEXT NOT NULL,
    delegado TEXT,
    telefono TEXT,
    group_name TEXT DEFAULT 'Grupo A',
    logo_url TEXT,
    jugadores JSONB DEFAULT '[]'::jsonb,
    delegate_pin TEXT DEFAULT '0000',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Partidos / Encuentros
CREATE TABLE IF NOT EXISTS public.partidos (
    id TEXT PRIMARY KEY,
    discipline TEXT NOT NULL DEFAULT 'baloncesto',
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    home_quarters JSONB DEFAULT '[0,0,0,0]'::jsonb,
    away_quarters JSONB DEFAULT '[0,0,0,0]'::jsonb,
    current_quarter INTEGER DEFAULT 1,
    date TEXT DEFAULT '2026-06-15',
    time TEXT DEFAULT '19:30',
    location TEXT DEFAULT 'Gimnasio Cubierto',
    phase TEXT DEFAULT 'Fase de Grupos',
    status TEXT DEFAULT 'Programado', -- 'Programado' | 'En Curso' | 'Finalizado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Tabla de Posiciones
CREATE TABLE IF NOT EXISTS public.posiciones (
    id TEXT PRIMARY KEY,
    discipline TEXT NOT NULL DEFAULT 'baloncesto',
    group_name TEXT NOT NULL DEFAULT 'Grupo A',
    team_name TEXT NOT NULL,
    jj INTEGER DEFAULT 0,
    jg INTEGER DEFAULT 0,
    jp INTEGER DEFAULT 0,
    pf INTEGER DEFAULT 0,
    pc INTEGER DEFAULT 0,
    dif INTEGER DEFAULT 0,
    ptos INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Estado Global del Torneo (Multi-Disciplina y Configuración 360)
CREATE TABLE IF NOT EXISTS public.tournament_sync (
    id TEXT PRIMARY KEY, -- 'deportlambert_live'
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- Políticas de Seguridad RLS (Row Level Security)
-- Permitir lectura y escritura pública para tiempo real instantáneo
-- ==============================================================================

ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posiciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_sync ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de equipos" ON public.equipos FOR SELECT USING (true);
CREATE POLICY "Escritura pública de equipos" ON public.equipos FOR ALL USING (true);

CREATE POLICY "Lectura pública de partidos" ON public.partidos FOR SELECT USING (true);
CREATE POLICY "Escritura pública de partidos" ON public.partidos FOR ALL USING (true);

CREATE POLICY "Lectura pública de posiciones" ON public.posiciones FOR SELECT USING (true);
CREATE POLICY "Escritura pública de posiciones" ON public.posiciones FOR ALL USING (true);

CREATE POLICY "Lectura pública de sync" ON public.tournament_sync FOR SELECT USING (true);
CREATE POLICY "Escritura pública de sync" ON public.tournament_sync FOR ALL USING (true);

-- Habilitar Publicación en Tiempo Real (Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE public.equipos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.partidos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posiciones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_sync;
