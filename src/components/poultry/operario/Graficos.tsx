/**
 * BOTÓN 5 — Gráficos y Estadísticas (recharts).
 * Evolución de postura, mortalidad, producción, rotos, defectuosos,
 * tendencia semanal/mensual y rankings de rendimiento.
 */
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { serieProduccion, rankingSectores } from "@/lib/poultry/aggregations";
import { fmt } from "@/lib/poultry/calculations";
import { useDataVersion } from "@/lib/poultry/useData";
import { Section, EmptyState } from "../ui";

const axis = { fontSize: 11, stroke: "var(--muted-foreground)" };
const grid = "var(--border)";

export function Graficos() {
  useDataVersion();
  const [rango, setRango] = useState<7 | 30>(7);
  const serie = serieProduccion(rango);
  const ranking = rankingSectores().filter((r) => r.total > 0);
  const hayDatos = serie.some((s) => s.total > 0);

  if (!hayDatos && ranking.length === 0) {
    return <EmptyState>Aún no hay datos suficientes para generar gráficos.</EmptyState>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {([7, 30] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRango(r)}
            className={
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors " +
              (rango === r ? "bg-primary text-primary-foreground" : "border border-input bg-card text-foreground")
            }
          >
            {r === 7 ? "Tendencia semanal" : "Tendencia mensual"}
          </button>
        ))}
      </div>

      <Section title="Producción total">
        <Chart>
          <AreaChart data={serie}>
            <defs>
              <linearGradient id="gProd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="fecha" tick={axis} />
            <YAxis tick={axis} width={36} />
            <Tooltip contentStyle={tooltip} />
            <Area type="monotone" dataKey="total" stroke="var(--chart-1)" fill="url(#gProd)" strokeWidth={2} name="Producción" />
          </AreaChart>
        </Chart>
      </Section>

      <Section title="Evolución de postura (%)">
        <Chart>
          <LineChart data={serie}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="fecha" tick={axis} />
            <YAxis tick={axis} width={36} />
            <Tooltip contentStyle={tooltip} />
            <Line type="monotone" dataKey="postura" stroke="var(--chart-3)" strokeWidth={2} dot={false} name="Postura %" />
          </LineChart>
        </Chart>
      </Section>

      <Section title="Mortalidad, rotos y defectuosos">
        <Chart>
          <BarChart data={serie}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="fecha" tick={axis} />
            <YAxis tick={axis} width={36} />
            <Tooltip contentStyle={tooltip} />
            <Bar dataKey="muertes" fill="var(--chart-4)" name="Muertes" radius={[3, 3, 0, 0]} />
            <Bar dataKey="rotos" fill="var(--chart-2)" name="Rotos" radius={[3, 3, 0, 0]} />
            <Bar dataKey="defectuosos" fill="var(--chart-5)" name="Defectuosos" radius={[3, 3, 0, 0]} />
          </BarChart>
        </Chart>
      </Section>

      {ranking.length > 0 && (
        <Section title="Ranking de rendimiento (postura %)">
          <div className="grid gap-2">
            {ranking.map((r, i) => {
              const peor = i === ranking.length - 1 && ranking.length > 1;
              return (
                <div
                  key={r.id}
                  className={
                    "flex items-center justify-between rounded-lg border px-3 py-2 text-sm " +
                    (i === 0 ? "border-success/40 bg-success/5" : peor ? "border-destructive/40 bg-destructive/5" : "bg-card")
                  }
                >
                  <span className="flex items-center gap-2 text-foreground">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-xs font-bold">{i + 1}</span>
                    {r.label}
                  </span>
                  <span className="font-semibold text-foreground">
                    {r.postura}% <span className="text-xs text-muted-foreground">({fmt(r.total)})</span>
                  </span>
                </div>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}

const tooltip = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  fontSize: "12px",
  color: "var(--popover-foreground)",
} as const;

function Chart({ children }: { children: React.ReactElement }) {
  return (
    <div className="h-56 w-full rounded-lg border bg-card p-2">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
