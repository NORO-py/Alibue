/**
 * Capa de persistencia.
 *
 * Hoy: localStorage del navegador (funciona como sitio estático en GitHub Pages).
 * La interfaz pública (getRegistros, addRegistro, etc.) abstrae el motor de
 * almacenamiento para poder migrar a MySQL / PostgreSQL / Firebase sin tocar
 * la UI: bastará con reimplementar estas funciones contra una API REST.
 */

export interface Registro {
  id: string;
  fecha: string; // ISO date (yyyy-mm-dd)
  creado: string; // ISO datetime
  sectorId: string;
  plantel: string;
  galpon: string;
  sector: string;
  // Mortalidad
  hembrasMuertas: number;
  machosMuertos: number;
  // Producción
  producciones: number[]; // 5 valores
  totalProducido: number;
  // Clasificación
  dobleYema: number;
  lavado: number;
  deforme: number;
  piso: number;
  rotos: number;
  // Calculado
  huevosAptos: number;
  cajones: number;
  sobrantes: number;
}

export interface Stock {
  sectorId: string;
  gallinas: number;
  gallos: number;
}

export interface Tarea {
  id: string;
  titulo: string;
  detalle: string;
  completada: boolean;
  creado: string;
}

export interface Alerta {
  id: string;
  tipo: string;
  mensaje: string;
  nivel: "alta" | "media";
  fecha: string;
  registroId?: string;
  activa: boolean;
}

const KEYS = {
  registros: "alibue:registros",
  stock: "alibue:stock",
  tareas: "alibue:tareas",
  alertas: "alibue:alertas",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("alibue:data-changed", { detail: { key } }));
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ---------- Registros ---------- */
export function getRegistros(): Registro[] {
  return read<Registro[]>(KEYS.registros, []).sort((a, b) => b.creado.localeCompare(a.creado));
}

export function addRegistro(r: Registro): void {
  const all = read<Registro[]>(KEYS.registros, []);
  all.push(r);
  write(KEYS.registros, all);
  // Descontar mortalidad del stock automáticamente
  if (r.hembrasMuertas > 0 || r.machosMuertos > 0) {
    const s = getStock(r.sectorId);
    setStock({
      sectorId: r.sectorId,
      gallinas: Math.max(0, s.gallinas - r.hembrasMuertas),
      gallos: Math.max(0, s.gallos - r.machosMuertos),
    });
  }
}

/* ---------- Stock de aves ---------- */
export function getStockAll(): Stock[] {
  return read<Stock[]>(KEYS.stock, []);
}

export function getStock(sectorId: string): Stock {
  return getStockAll().find((s) => s.sectorId === sectorId) ?? { sectorId, gallinas: 0, gallos: 0 };
}

export function setStock(stock: Stock): void {
  const all = getStockAll().filter((s) => s.sectorId !== stock.sectorId);
  all.push(stock);
  write(KEYS.stock, all);
}

/* ---------- Tareas ---------- */
export function getTareas(): Tarea[] {
  return read<Tarea[]>(KEYS.tareas, []).sort((a, b) => b.creado.localeCompare(a.creado));
}
export function saveTareas(t: Tarea[]): void {
  write(KEYS.tareas, t);
}

/* ---------- Alertas ---------- */
export function getAlertas(): Alerta[] {
  return read<Alerta[]>(KEYS.alertas, []).sort((a, b) => b.fecha.localeCompare(a.fecha));
}
export function saveAlertas(a: Alerta[]): void {
  write(KEYS.alertas, a);
}
export function addAlertas(nuevas: Alerta[]): void {
  if (!nuevas.length) return;
  const all = getAlertas();
  all.push(...nuevas);
  write(KEYS.alertas, all);
}
