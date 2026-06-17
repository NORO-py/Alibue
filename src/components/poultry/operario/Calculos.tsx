/**
 * BOTÓN 3 — Cálculos Automáticos.
 * Postura %, mortalidad diaria, % rotos, % defectuosos, producción por sector
 * y por galpón, con indicadores de tendencia (subió/bajó/se mantuvo) respecto
 * al día anterior.
 */
import { ALL_SECTORES, PLANTELES } from "@/lib/poultry/constants";
import { getRegistros } from "@/lib/poultry/database";
import {
  aggregate,
  byDate,
  gallinasVivas,
  lastDays,
} from "@/lib/poultry/aggregations";
import { postura, pct, tendencia, fmt } from "@/lib/poultry/calculations";
import { useDataVersion } from "@/lib/poultry/useData";
import { Section, StatCard, TrendBadge } from "../ui";

export function Calculos() {
  useDataVersion();
  const regs = getRegistros();
  const [hoy, ayer] = lastDays(2).reverse(); // [hoy, ayer]
  const aHoy = aggregate(byDate(regs, hoy));
  const aAyer = aggregate(byDate(regs, ayer));
  const vivas = gallinasVivas();

  const postHoy = postura(aHoy.total, vivas);
  const postAyer = postura(aAyer.total, vivas);
  const rotosHoy = pct(aHoy.rotos, aHoy.total);
  const rotosAyer = pct(aAyer.rotos, aAyer.total);
  const defHoy = pct(aHoy.defectuosos, aHoy.total);
  const defAyer = pct(aAyer.defectuosos, aAyer.total);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Comparación contra el día anterior.</p>

      <div className="grid grid-cols-2 gap-3">
        <Indicador label="Postura general" valor={`${postHoy.toFixed(1)}%`} t={tendencia(postHoy, postAyer)} />
        <Indicador label="Mortalidad diaria" valor={fmt(aHoy.muertes)} t={tendencia(aHoy.muertes, aAyer.muertes)} />
        <Indicador label="Huevos rotos" valor={`${rotosHoy.toFixed(1)}%`} t={tendencia(rotosHoy, rotosAyer)} />
        <Indicador label="Defectuosos" valor={`${defHoy.toFixed(1)}%`} t={tendencia(defHoy, defAyer)} />

      </div>

      <Section title="Producción por sector (hoy)">
        <div className="grid gap-2">
          {ALL_SECTORES.map((s) => {
            const r = byDate(regs, hoy).filter((x) => x.sectorId === s.id);
            const a = aggregate(r);
            const post = postura(a.total, gallinasVivas(s.id));
            return (
              <div key={s.id} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm">
                <span className="text-foreground">{s.label}</span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{fmt(a.total)}</span>
                  <span className="text-xs text-muted-foreground">{post.toFixed(0)}%</span>
                </span>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Producción por galpón (hoy)">
        <div className="grid gap-2">
          {PLANTELES.flatMap((p) => p.sectores).reduce<string[]>((acc, s) => {
            if (!acc.includes(s.galpon)) acc.push(s.galpon);
            return acc;
          }, []).map((galpon) => {
            const r = byDate(regs, hoy).filter((x) => x.galpon === galpon);
            const a = aggregate(r);
            return (
              <div key={galpon} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm">
                <span className="text-foreground">{galpon}</span>
                <span className="font-semibold text-foreground">{fmt(a.total)} huevos</span>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function Indicador({
  label,
  valor,
  t,
}: {
  label: string;
  valor: string;
  t: "subio" | "bajo" | "mantuvo";
}) {

  return (
    <StatCard
      label={label}
      value={valor}
      hint={<TrendBadge t={t} />}
    />
  );
}
