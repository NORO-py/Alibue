/**
 * BOTÓN 6 — Alertas Automáticas.
 * Muestra alertas activas e historial. Las alertas se generan al guardar
 * registros (ver calculations.generarAlertas).
 */
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { getAlertas, saveAlertas } from "@/lib/poultry/database";
import { useDataVersion } from "@/lib/poultry/useData";
import { Section, EmptyState } from "../ui";

export function Alertas() {
  useDataVersion();
  const alertas = getAlertas();
  const activas = alertas.filter((a) => a.activa);
  const historial = alertas.filter((a) => !a.activa);

  function resolver(id: string) {
    saveAlertas(alertas.map((a) => (a.id === id ? { ...a, activa: false } : a)));
  }

  return (
    <div className="space-y-6">
      <Section title={`Alertas activas (${activas.length})`}>
        {activas.length === 0 ? (
          <EmptyState>No hay alertas activas. Producción dentro de los parámetros.</EmptyState>
        ) : (
          <div className="grid gap-2">
            {activas.map((a) => (
              <div
                key={a.id}
                className={
                  "flex items-start gap-3 rounded-lg border p-3 " +
                  (a.nivel === "alta" ? "border-destructive/40 bg-destructive/5" : "border-warning/50 bg-warning/10")
                }
              >
                <AlertTriangle className={"mt-0.5 h-5 w-5 shrink-0 " + (a.nivel === "alta" ? "text-destructive" : "text-warning")} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{a.tipo}</p>
                  <p className="text-sm text-muted-foreground">{a.mensaje}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{new Date(a.fecha).toLocaleString("es-AR")}</p>
                </div>
                <button
                  onClick={() => resolver(a.id)}
                  className="shrink-0 rounded-md border border-input px-2 py-1 text-xs font-medium text-foreground hover:bg-muted"
                >
                  Resolver
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Historial de alertas">
        {historial.length === 0 ? (
          <EmptyState>Sin alertas resueltas.</EmptyState>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-card">
            {historial.slice(0, 50).map((a, i) => (
              <div key={a.id} className={"flex items-center gap-2 px-3 py-2 text-sm " + (i % 2 ? "bg-muted/40" : "")}>
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                <span className="min-w-0 flex-1 truncate text-foreground">{a.tipo}: {a.mensaje}</span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
