/**
 * BOTÓN 9 — Plantel Principal.
 * Dashboard general con indicadores en tiempo real.
 */
import { ALL_SECTORES } from "@/lib/poultry/constants";
import { getRegistros, getAlertas } from "@/lib/poultry/database";
import {
  aggregate,
  byDate,
  gallinasVivas,
  porPlantel,
} from "@/lib/poultry/aggregations";
import { postura, hoyISO, fmt } from "@/lib/poultry/calculations";
import { useDataVersion } from "@/lib/poultry/useData";
import { Section, StatCard, EmptyState } from "../ui";

export function PlantelPrincipal() {
  useDataVersion();
  const regs = getRegistros();
  const hoy = byDate(regs, hoyISO());
  const aHoy = aggregate(hoy);
  const vivas = gallinasVivas();
  const activas = getAlertas().filter((a) => a.activa);

  return (
    <div className="space-y-6">
      <Section title="Resumen del día">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Producción del día" value={fmt(aHoy.total)} accent />
          <StatCard label="Postura general" value={`${postura(aHoy.total, vivas).toFixed(1)}%`} />
          <StatCard label="Mortalidad diaria" value={fmt(aHoy.muertes)} />
          <StatCard label="Aves vivas" value={fmt(vivas)} />
        </div>
      </Section>

      {activas.length > 0 && (
        <Section title={`Alertas activas (${activas.length})`}>
          <div className="grid gap-2">
            {activas.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className={
                  "rounded-lg border px-3 py-2 text-sm " +
                  (a.nivel === "alta" ? "border-destructive/40 bg-destructive/5" : "border-warning/50 bg-warning/10")
                }
              >
                <span className="font-semibold text-foreground">{a.tipo}: </span>
                <span className="text-muted-foreground">{a.mensaje}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Producción por plantel (hoy)">
        <div className="grid gap-3">
          {porPlantel().map(({ plantel }) => {
            const ids = plantel.sectores.map((s) => s.id);
            const a = aggregate(hoy.filter((x) => ids.includes(x.sectorId)));
            const v = plantel.sectores.reduce((acc, s) => acc + gallinasVivas(s.id), 0);
            return (
              <div key={plantel.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="font-display text-base font-semibold text-foreground">{plantel.nombre}</p>
                  <p className="text-sm font-semibold text-primary">{postura(a.total, v).toFixed(1)}%</p>
                </div>
                <p className="text-sm text-muted-foreground">{fmt(a.total)} huevos · {fmt(a.muertes)} muertes</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Producción por sector (hoy)">
        {hoy.length === 0 ? (
          <EmptyState>Sin registros cargados hoy.</EmptyState>
        ) : (
          <div className="grid gap-2">
            {ALL_SECTORES.map((s) => {
              const a = aggregate(hoy.filter((x) => x.sectorId === s.id));
              if (a.total === 0) return null;
              return (
                <div key={s.id} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm">
                  <span className="text-foreground">{s.label}</span>
                  <span className="font-semibold text-foreground">{fmt(a.total)}</span>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}

