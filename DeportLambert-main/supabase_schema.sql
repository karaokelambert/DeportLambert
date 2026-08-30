-- ==============================================================================
-- JL Sports Club 360 – Esquema de Tablas para Supabase Realtime Database
-- Proyecto Supabase: https://nhurcieffcazroqfarrh.supabase.co
-- Copia y ejecuta este script en el SQL Editor de tu Dashboard de Supabase.
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

-- 3. Tabla de Posiciones / Tabla General
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

-- 4. Tabla de Nómina Oficial de Jugadores (Batch Sync)
CREATE TABLE IF NOT EXISTS public.jugadores (
    id TEXT PRIMARY KEY,
    discipline TEXT NOT NULL DEFAULT 'baloncesto',
    team_id TEXT NOT NULL,
    team_name TEXT NOT NULL,
    name TEXT NOT NULL,
    player_number INTEGER DEFAULT 0,
    position TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Estado Global del Torneo (Multi-Disciplina y Configuración 360)
CREATE TABLE IF NOT EXISTS public.tournament_sync (
    id TEXT PRIMARY KEY, -- 'deportlambert_live'
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- Índices para optimización de consultas
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_equipos_discipline ON public.equipos(discipline);
CREATE INDEX IF NOT EXISTS idx_partidos_discipline ON public.partidos(discipline);
CREATE INDEX IF NOT EXISTS idx_posiciones_discipline ON public.posiciones(discipline);
CREATE INDEX IF NOT EXISTS idx_jugadores_team ON public.jugadores(team_id);
CREATE INDEX IF NOT EXISTS idx_jugadores_discipline ON public.jugadores(discipline);

-- ==============================================================================
-- Políticas de Seguridad RLS (Row Level Security)
-- Permitir lectura y escritura pública para tiempo real instantáneo
-- ==============================================================================

ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posiciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_sync ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de equipos" ON public.equipos;
DROP POLICY IF EXISTS "Escritura pública de equipos" ON public.equipos;
CREATE POLICY "Lectura pública de equipos" ON public.equipos FOR SELECT USING (true);
CREATE POLICY "Escritura pública de equipos" ON public.equipos FOR ALL USING (true);

DROP POLICY IF EXISTS "Lectura pública de partidos" ON public.partidos;
DROP POLICY IF EXISTS "Escritura pública de partidos" ON public.partidos;
CREATE POLICY "Lectura pública de partidos" ON public.partidos FOR SELECT USING (true);
CREATE POLICY "Escritura pública de partidos" ON public.partidos FOR ALL USING (true);

DROP POLICY IF EXISTS "Lectura pública de posiciones" ON public.posiciones;
DROP POLICY IF EXISTS "Escritura pública de posiciones" ON public.posiciones;
CREATE POLICY "Lectura pública de posiciones" ON public.posiciones FOR SELECT USING (true);
CREATE POLICY "Escritura pública de posiciones" ON public.posiciones FOR ALL USING (true);

DROP POLICY IF EXISTS "Lectura pública de jugadores" ON public.jugadores;
DROP POLICY IF EXISTS "Escritura pública de jugadores" ON public.jugadores;
CREATE POLICY "Lectura pública de jugadores" ON public.jugadores FOR SELECT USING (true);
CREATE POLICY "Escritura pública de jugadores" ON public.jugadores FOR ALL USING (true);

DROP POLICY IF EXISTS "Lectura pública de sync" ON public.tournament_sync;
DROP POLICY IF EXISTS "Escritura pública de sync" ON public.tournament_sync;
CREATE POLICY "Lectura pública de sync" ON public.tournament_sync FOR SELECT USING (true);
CREATE POLICY "Escritura pública de sync" ON public.tournament_sync FOR ALL USING (true);

-- ==============================================================================
-- Habilitar Publicación en Tiempo Real (Realtime)
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'equipos') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.equipos;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'partidos') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.partidos;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'posiciones') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.posiciones;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'jugadores') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.jugadores;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tournament_sync') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_sync;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;
