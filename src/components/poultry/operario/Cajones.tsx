/**
 * BOTÓN 2 — Cajones por Plantel.
 * Consolidado por plantel a 360 huevos por cajón + clasificación + historial diario.
 */
import { porPlantel } from "@/lib/poultry/aggregations";
import { cajonesPlantel, fmt } from "@/lib/poultry/calculations";
import { getRegistros } from "@/lib/poultry/database";
import { useDataVersion } from "@/lib/poultry/useData";
import { Section, StatCard, EmptyState } from "../ui";

export function Cajones() {
  useDataVersion();
  const planteles = porPlantel();
  const registros = getRegistros();

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Consolidado por plantel · 1 cajón = 360 huevos.</p>

      {planteles.map(({ plantel, agg }) => {
        const { cajones, sobrantes } = cajonesPlantel(agg.aptos);
        return (
          <Section key={plantel.id} title={plantel.nombre}>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Cajones obtenidos" value={fmt(cajones)} hint={`${fmt(sobrantes)} huevos sobrantes`} accent />
              <StatCard label="Huevos aptos" value={fmt(agg.aptos)} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Mini label="Doble yema" v={agg.dobleYema} />
              <Mini label="Lavado" v={agg.lavado} />
              <Mini label="Deforme" v={agg.deforme} />
              <Mini label="Piso" v={agg.piso} />
              <Mini label="Rotos" v={agg.rotos} />
              <Mini label="Producción" v={agg.total} />
            </div>
          </Section>
        );
      })}

      <Section title="Historial diario">
        {registros.length === 0 ? (
          <EmptyState>Aún no hay registros cargados.</EmptyState>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-card">
            {registros.slice(0, 40).map((r, i) => (
              <div key={r.id} className={"flex items-center justify-between gap-2 px-3 py-2 text-sm " + (i % 2 ? "bg-muted/40" : "")}>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {r.galpon} {r.sector}
                  </p>
                  <p className="text-xs text-muted-foreground">{r.fecha} · {r.plantel}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold text-foreground">{fmt(r.huevosAptos)} aptos</p>
                  <p className="text-xs text-muted-foreground">{fmt(r.cajones)} cajones</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Mini({ label, v }: { label: string; v: number }) {
  return (
    <div className="rounded-md border bg-card px-2 py-2 text-center">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-display text-base font-bold text-foreground">{fmt(v)}</p>
    </div>
  );
}
