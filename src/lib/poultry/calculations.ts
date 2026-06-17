/**
 * Cálculos del negocio avícola. Funciones puras y testeables.
 */
import {
  HUEVOS_POR_CAJON_GALPON,
  HUEVOS_POR_CAJON_PLANTEL,
  UMBRALES,
} from "./constants";
import type { Registro, Alerta, Stock } from "./database";
import { uid } from "./database";

export function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + (Number(b) || 0), 0);
}

/** Huevos aptos = total - defectos. */
export function huevosAptos(
  total: number,
  d: { dobleYema: number; lavado: number; deforme: number; piso: number; rotos: number },
): number {
  return Math.max(0, total - d.dobleYema - d.lavado - d.deforme - d.piso - d.rotos);
}

/** Conversión a cajones. Devuelve cajones completos y huevos sobrantes (de nido). */
export function calcularCajones(huevos: number, porCajon = HUEVOS_POR_CAJON_GALPON) {
  const cajones = Math.floor(huevos / porCajon);
  const sobrantes = huevos % porCajon;
  return { cajones, sobrantes };
}

export const cajonesPlantel = (huevos: number) =>
  calcularCajones(huevos, HUEVOS_POR_CAJON_PLANTEL);

/** Postura % = huevos producidos / gallinas vivas * 100. */
export function postura(produccion: number, gallinasVivas: number): number {
  if (gallinasVivas <= 0) return 0;
  return (produccion / gallinasVivas) * 100;
}

export function pct(parte: number, total: number): number {
  if (total <= 0) return 0;
  return (parte / total) * 100;
}

export type Tendencia = "subio" | "bajo" | "mantuvo";

export function tendencia(actual: number, anterior: number): Tendencia {
  const diff = actual - anterior;
  if (Math.abs(diff) < 0.01) return "mantuvo";
  return diff > 0 ? "subio" : "bajo";
}

export function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Genera alertas automáticas a partir de un registro recién guardado.
 */
export function generarAlertas(r: Registro, stock: Stock): Alerta[] {
  const out: Alerta[] = [];
  const vivas = stock.gallinas;
  const post = postura(r.totalProducido, vivas);
  const now = new Date().toISOString();

  if (vivas > 0 && post < UMBRALES.posturaMinima) {
    out.push({
      id: uid(),
      tipo: "Caída de postura",
      mensaje: `${r.galpon} ${r.sector}: postura ${post.toFixed(1)}% (mínimo ${UMBRALES.posturaMinima}%)`,
      nivel: post < UMBRALES.produccionBajaPct ? "alta" : "media",
      fecha: now,
      registroId: r.id,
      activa: true,
    });
  }
  const muertes = r.hembrasMuertas + r.machosMuertos;
  if (muertes > UMBRALES.mortalidadMaxima) {
    out.push({
      id: uid(),
      tipo: "Mortalidad elevada",
      mensaje: `${r.galpon} ${r.sector}: ${muertes} aves muertas`,
      nivel: "alta",
      fecha: now,
      registroId: r.id,
      activa: true,
    });
  }
  const rotosPct = pct(r.rotos, r.totalProducido);
  if (rotosPct > UMBRALES.rotosMaximoPct) {
    out.push({
      id: uid(),
      tipo: "Exceso de huevos rotos",
      mensaje: `${r.galpon} ${r.sector}: ${rotosPct.toFixed(1)}% de huevos rotos`,
      nivel: "media",
      fecha: now,
      registroId: r.id,
      activa: true,
    });
  }
  if (vivas > 0 && post < UMBRALES.produccionBajaPct) {
    out.push({
      id: uid(),
      tipo: "Producción anormalmente baja",
      mensaje: `${r.galpon} ${r.sector}: producción muy baja (${r.totalProducido} huevos)`,
      nivel: "alta",
      fecha: now,
      registroId: r.id,
      activa: true,
    });
  }
  return out;
}

export const fmt = (n: number, dec = 0) =>
  Number.isFinite(n) ? n.toLocaleString("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec }) : "0";
