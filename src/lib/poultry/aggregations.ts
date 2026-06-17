/**
 * Agregaciones de datos para reportes, estadísticas y dashboards.
 */
import { ALL_SECTORES, PLANTELES } from "./constants";
import { getRegistros, getStockAll, type Registro } from "./database";
import { postura, pct, sum } from "./calculations";

export interface Agg {
  total: number;
  aptos: number;
  rotos: number;
  defectuosos: number; // doble yema + lavado + deforme + piso + rotos
  muertes: number;
  registros: number;
  dobleYema: number;
  lavado: number;
  deforme: number;
  piso: number;
}

const empty = (): Agg => ({
  total: 0,
  aptos: 0,
  rotos: 0,
  defectuosos: 0,
  muertes: 0,
  registros: 0,
  dobleYema: 0,
  lavado: 0,
  deforme: 0,
  piso: 0,
});

export function aggregate(regs: Registro[]): Agg {
  const a = empty();
  for (const r of regs) {
    a.total += r.totalProducido;
    a.aptos += r.huevosAptos;
    a.rotos += r.rotos;
    a.dobleYema += r.dobleYema;
    a.lavado += r.lavado;
    a.deforme += r.deforme;
    a.piso += r.piso;
    a.defectuosos += r.dobleYema + r.lavado + r.deforme + r.piso + r.rotos;
    a.muertes += r.hembrasMuertas + r.machosMuertos;
    a.registros += 1;
  }
  return a;
}

export function byDate(regs: Registro[], fecha: string): Registro[] {
  return regs.filter((r) => r.fecha === fecha);
}

/** Rango: últimos N días incluyendo hoy. */
export function lastDays(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
}

export function gallinasVivas(sectorId?: string): number {
  const all = getStockAll();
  if (sectorId) return all.find((s) => s.sectorId === sectorId)?.gallinas ?? 0;
  return sum(all.map((s) => s.gallinas));
}

export function posturaDe(regs: Registro[], gallinas: number): number {
  return postura(aggregate(regs).total, gallinas);
}

/** Serie diaria de producción total (todos los sectores). */
export function serieProduccion(dias: number) {
  const regs = getRegistros();
  return lastDays(dias).map((fecha) => {
    const dia = byDate(regs, fecha);
    const a = aggregate(dia);
    return {
      fecha: fecha.slice(5),
      total: a.total,
      rotos: a.rotos,
      defectuosos: a.defectuosos,
      muertes: a.muertes,
      postura: Number(postura(a.total, gallinasVivas()).toFixed(1)),
    };
  });
}

/** Ranking de rendimiento por sector (postura % usando stock actual). */
export function rankingSectores() {
  const regs = getRegistros();
  return ALL_SECTORES.map((s) => {
    const r = regs.filter((x) => x.sectorId === s.id);
    const vivas = gallinasVivas(s.id);
    const a = aggregate(r);
    return {
      ...s,
      total: a.total,
      postura: Number(postura(a.total, vivas).toFixed(1)),
      rotosPct: Number(pct(a.rotos, a.total).toFixed(1)),
    };
  }).sort((a, b) => b.postura - a.postura);
}

export function porPlantel() {
  const regs = getRegistros();
  return PLANTELES.map((p) => {
    const ids = p.sectores.map((s) => s.id);
    const r = regs.filter((x) => ids.includes(x.sectorId));
    return { plantel: p, agg: aggregate(r) };
  });
}
