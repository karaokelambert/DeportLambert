import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const seed = {
  version: 11,
  updatedAt: Date.now(),
  updatedBy: "Sistema JL Sports 360",
  branding: {
    title: "JL Sports Club 360",
    subtitle: "CENTRO DE GESTIÓN DEPORTIVA",
    season: "TEMPORADA 2026"
  },
  disciplinesList: [
    {
      id: "baloncesto",
      badgeNumber: "DISCIPLINA 1",
      title: "Baloncesto STOB",
      category: "Torneo Oficial Masculino / Libre",
      subtitle: "Gestión integral de torneo",
      icon: "basketball",
      accentTheme: "from-orange-500/20 via-amber-500/10 to-transparent",
      badgeColor: "bg-amber-950/70 border-amber-500/50 text-amber-400"
    },
    {
      id: "voleibol",
      badgeNumber: "DISCIPLINA 2",
      title: "Voleibol Femenino Master",
      category: "Liga Máster Femenina 2026",
      subtitle: "Gestión integral de torneo",
      icon: "volleyball",
      accentTheme: "from-cyan-500/20 via-blue-500/10 to-transparent",
      badgeColor: "bg-cyan-950/70 border-cyan-500/50 text-cyan-400"
    },
    {
      id: "futsal",
      badgeNumber: "DISCIPLINA 3",
      title: "Fútbol Sala Master Libre 2026",
      category: "Campeonato de Tabloncillo 2026",
      subtitle: "Gestión integral de torneo",
      icon: "futsal",
      accentTheme: "from-emerald-500/20 via-teal-500/10 to-transparent",
      badgeColor: "bg-emerald-950/70 border-emerald-500/50 text-emerald-400"
    },
    {
      id: "beisbol5",
      badgeNumber: "DISCIPLINA 4",
      title: "Béisbol Five",
      category: "Circuito Nacional B5 Mixto",
      subtitle: "Gestión integral de torneo",
      icon: "baseball",
      accentTheme: "from-rose-500/20 via-red-500/10 to-transparent",
      badgeColor: "bg-rose-950/70 border-rose-500/50 text-rose-400"
    }
  ],
  disciplineData: {
    baloncesto: {
      groups: ["Grupo A", "Grupo B"],
      teams: [
        { id: "1", name: "Vikingos", delegado: "José Fuentes", telefono: "0414-1234567", group: "Grupo A", delegatePin: "1111", jugadores: ["José Alonso", "Manuel Vélix", "Daniel Cruz", "Roberto Núñez"] },
        { id: "2", name: "Motorratones", delegado: "Manuel Fernández", telefono: "0412-7654321", group: "Grupo A", delegatePin: "456", jugadores: ["Mario Molino", "Pedro García", "Daniel García", "Luis Maestre"] },
        { id: "3", name: "ABC Caripito", delegado: "Gerson Tamoy", telefono: "0416-9998877", group: "Grupo A", delegatePin: "2222", jugadores: ["Eric Lamberg", "Fabián Perdomo", "Daniel Álvarez", "Bryan Ortiz"] },
        { id: "4", name: "Halcones", delegado: "Jesús Mondaraín", telefono: "0424-5554433", group: "Grupo B", delegatePin: "3333", jugadores: ["Daniel Montaraín", "Pedro Casas", "Manuel Véliz", "Simón Acanto"] },
        { id: "5", name: "CIBAPAC", delegado: "Andrés López", telefono: "0414-0001122", group: "Grupo B", delegatePin: "4444", jugadores: ["Luis Pérez", "Carlos Rivas", "Antonio Salazar"] },
        { id: "6", name: "Spartans", delegado: "Luis Guerra", telefono: "0412-3334455", group: "Grupo B", delegatePin: "5555", jugadores: ["Kevin Rivera", "Juan Díaz", "Marcos Velásquez"] }
      ],
      games: [
        { id: "1", homeTeam: "Vikingos", awayTeam: "Motorratones", homeScore: 84, awayScore: 72, homeQuarters: [22, 18, 24, 20], awayQuarters: [18, 20, 16, 18], date: "15-06-2026", time: "19:30", location: "Gimnasio Cubierto", phase: "Fase de Grupos", status: "Finalizado" },
        { id: "2", homeTeam: "ABC Caripito", awayTeam: "Halcones", homeScore: 45, awayScore: 42, homeQuarters: [15, 14, 16, 0], awayQuarters: [12, 16, 14, 0], date: "15-06-2026", time: "18:00", location: "Gimnasio Cubierto", phase: "Fase de Grupos", status: "En Curso" },
        { id: "3", homeTeam: "Vikingos", awayTeam: "Halcones", homeScore: 0, awayScore: 0, homeQuarters: [0, 0, 0, 0], awayQuarters: [0, 0, 0, 0], date: "15-06-2026", time: "20:00", location: "Gimnasio Cubierto", phase: "Fase de Grupos", status: "Programado" },
        { id: "4", homeTeam: "Motorratones", awayTeam: "ABC Caripito", homeScore: 0, awayScore: 0, homeQuarters: [0, 0, 0, 0], awayQuarters: [0, 0, 0, 0], date: "15-06-2026", time: "19:00", location: "Gimnasio Cubierto", phase: "Fase de Grupos", status: "Programado" },
        { id: "5", homeTeam: "CIBAPAC", awayTeam: "Spartans", homeScore: 0, awayScore: 0, homeQuarters: [0, 0, 0, 0], awayQuarters: [0, 0, 0, 0], date: "15-06-2026", time: "21:00", location: "Gimnasio Cubierto", phase: "Fase de Grupos", status: "Programado" }
      ]
    },
    voleibol: {
      groups: ["Grupo A", "Grupo B"],
      teams: [
        { id: "1", name: "Amazonas Voleibol", delegado: "Elena Rojas", telefono: "0414-8889900", group: "Grupo A", delegatePin: "1111", jugadores: ["Carla Méndez", "Patricia Gómez", "Sofía Castillo", "Valeria Silva"] },
        { id: "2", name: "Panteras Master", delegado: "María Fernández", telefono: "0412-4445566", group: "Grupo A", delegatePin: "2222", jugadores: ["Adriana Lugo", "Carmen Bello", "Daniela Paz", "Lucía Torres"] },
        { id: "3", name: "Águilas Doradas", delegado: "Yolanda Vargas", telefono: "0424-2223344", group: "Grupo A", delegatePin: "3333", jugadores: ["Gabriela Rivas", "Lorena Ortiz", "Marisol Mora", "Natalia Gil"] },
        { id: "4", name: "Fénix Club", delegado: "Teresa Blanco", telefono: "0416-7778899", group: "Grupo B", delegatePin: "4444", jugadores: ["Andrea Soto", "Camila Peña", "Jimena Cruz", "Rosa Marcano"] },
        { id: "5", name: "Valkirias", delegado: "Isabel Delgado", telefono: "0414-3331122", group: "Grupo B", delegatePin: "5555", jugadores: ["Ana Salazar", "Diana Suárez"] },
        { id: "6", name: "Titanes Volley", delegado: "Claudia Medina", telefono: "0412-5556677", group: "Grupo B", delegatePin: "6666", jugadores: ["Verónica León", "Raquel Vidal"] }
      ],
      games: [
        { id: "1", homeTeam: "Amazonas Voleibol", awayTeam: "Panteras Master", homeScore: 3, awayScore: 1, homeQuarters: [25, 20, 25, 25], awayQuarters: [21, 25, 18, 19], date: "2026-06-14", time: "17:00", location: "Gimnasio Techado", phase: "Temporada Regular", status: "Finalizado" },
        { id: "2", homeTeam: "Águilas Doradas", awayTeam: "Fénix Club", homeScore: 0, awayScore: 0, homeQuarters: [0, 0, 0, 0], awayQuarters: [0, 0, 0, 0], date: "2026-06-15", time: "18:30", location: "Gimnasio Techado", phase: "Temporada Regular", status: "Programado" },
        { id: "3", homeTeam: "Valkirias", awayTeam: "Titanes Volley", homeScore: 0, awayScore: 0, homeQuarters: [0, 0, 0, 0], awayQuarters: [0, 0, 0, 0], date: "2026-06-16", time: "19:00", location: "Cancha 2", phase: "Temporada Regular", status: "Programado" }
      ]
    },
    futsal: {
      groups: ["Grupo A", "Grupo B"],
      teams: [
        { id: "1", name: "Atlético Futsal", delegado: "Roberto Sifontes", telefono: "0414-7771234", group: "Grupo A", delegatePin: "1111", jugadores: ["Carlos Rondón", "Miguel Ángel", "Javier Peña", "Oscar Luna"] },
        { id: "2", name: "Deportivo Monagas", delegado: "Fernando Ruiz", telefono: "0412-8884321", group: "Grupo A", delegatePin: "2222", jugadores: ["Nelson Bravo", "Víctor Sosa", "Héctor Campos", "Raúl Medina"] },
        { id: "3", name: "Real Master FC", delegado: "Gonzalo Padrón", telefono: "0416-9993344", group: "Grupo A", delegatePin: "3333", jugadores: ["Armando Díaz", "Freddy Ramos", "Julio Navas", "César Mora"] },
        { id: "4", name: "Los Galácticos", delegado: "Marcos Herrera", telefono: "0424-6667788", group: "Grupo B", delegatePin: "4444", jugadores: ["Eduardo Pinto", "Gabriel Rojas", "Lucas Vera", "Tomás Silva"] },
        { id: "5", name: "Guerreros Tabloncillo", delegado: "David Romero", telefono: "0414-2228899", group: "Grupo B", delegatePin: "5555", jugadores: ["Enrique Marín", "Simón Acosta"] },
        { id: "6", name: "Huracán FS", delegado: "Pablo Valera", telefono: "0412-1114455", group: "Grupo B", delegatePin: "6666", jugadores: ["Manuel Castillo", "Iván Guerra"] }
      ],
      games: [
        { id: "1", homeTeam: "Atlético Futsal", awayTeam: "Deportivo Monagas", homeScore: 5, awayScore: 3, homeQuarters: [3, 2, 0, 0], awayQuarters: [1, 2, 0, 0], date: "2026-06-14", time: "20:00", location: "Tabloncillo Central", phase: "Fase de Grupos", status: "Finalizado" },
        { id: "2", homeTeam: "Real Master FC", awayTeam: "Los Galácticos", homeScore: 0, awayScore: 0, homeQuarters: [0, 0, 0, 0], awayQuarters: [0, 0, 0, 0], date: "2026-06-15", time: "21:00", location: "Tabloncillo Central", phase: "Fase de Grupos", status: "Programado" },
        { id: "3", homeTeam: "Guerreros Tabloncillo", awayTeam: "Huracán FS", homeScore: 0, awayScore: 0, homeQuarters: [0, 0, 0, 0], awayQuarters: [0, 0, 0, 0], date: "2026-06-16", time: "19:30", location: "Tabloncillo Central", phase: "Fase de Grupos", status: "Programado" }
      ]
    },
    beisbol5: {
      groups: ["Grupo A", "Grupo B"],
      teams: [
        { id: "1", name: "Criollos B5", delegado: "Alex Cabrera", telefono: "0414-9990011", group: "Grupo A", delegatePin: "1111", jugadores: ["Jonathan Lugo", "Brayan Solís", "Keiver Rojas", "Dayana Moreno"] },
        { id: "2", name: "Diamantes BBC", delegado: "Ramón Hernández", telefono: "0412-3332211", group: "Grupo A", delegatePin: "2222", jugadores: ["Franklin Márquez", "José Colmenares", "Mariana Padrón", "Yorbis Gil"] },
        { id: "3", name: "Rayos Béisbol 5", delegado: "Gustavo Chacón", telefono: "0416-5556677", group: "Grupo A", delegatePin: "3333", jugadores: ["Wilmer Flores", "Ángel Zerpa", "Génesis León", "Kevin Ramos"] },
        { id: "4", name: "Relámpagos", delegado: "Héctor Sánchez", telefono: "0424-8889900", group: "Grupo B", delegatePin: "4444", jugadores: ["Jorge Arcia", "Ender Inciarte", "Mayerling Silva", "Samuel Vega"] },
        { id: "5", name: "Centauros", delegado: "Oswaldo Guillén", telefono: "0414-6665544", group: "Grupo B", delegatePin: "5555", jugadores: ["Luis Aparicio Jr", "César Tovar"] },
        { id: "6", name: "Leones B5", delegado: "Víctor Davalillo", telefono: "0412-7778899", group: "Grupo B", delegatePin: "6666", jugadores: ["Baudilio Díaz", "Ugueth Urbina"] }
      ],
      games: [
        { id: "1", homeTeam: "Criollos B5", awayTeam: "Diamantes BBC", homeScore: 6, awayScore: 4, homeQuarters: [2, 1, 0, 3], awayQuarters: [1, 0, 2, 1], date: "2026-06-14", time: "16:00", location: "Plaza Central B5", phase: "Ronda Regular", status: "Finalizado" },
        { id: "2", homeTeam: "Rayos Béisbol 5", awayTeam: "Relámpagos", homeScore: 0, awayScore: 0, homeQuarters: [0, 0, 0, 0], awayQuarters: [0, 0, 0, 0], date: "2026-06-15", time: "17:30", location: "Plaza Central B5", phase: "Ronda Regular", status: "Programado" },
        { id: "3", homeTeam: "Centauros", awayTeam: "Leones B5", homeScore: 0, awayScore: 0, homeQuarters: [0, 0, 0, 0], awayQuarters: [0, 0, 0, 0], date: "2026-06-16", time: "18:00", location: "Plaza Central B5", phase: "Ronda Regular", status: "Programado" }
      ]
    }
  }
};

const jsonStr = JSON.stringify(seed, null, 2);
fs.writeFileSync(path.join(rootDir, "DeportLambert-main", "public", "database_seed.json"), jsonStr, "utf-8");
fs.writeFileSync(path.join(rootDir, "database_seed.json"), jsonStr, "utf-8");
console.log("database_seed.json generado con exito en public y root!");
