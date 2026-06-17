/**
 * BOTÓN 4 — Reportes.
 * Diario, semanal, mensual, por galpón, por sector, por plantel,
 * comparaciones y historial de producción.
 */
import { useMemo, useState } from "react";
import { ALL_SECTORES, PLANTELES } from "@/lib/poultry/constants";
import { getRegistros, type Registro } from "@/lib/poultry/database";
import { aggregate, lastDays, gallinasVivas } from "@/lib/poultry/aggregations";
import { postura, pct, fmt } from "@/lib/poultry/calculations";
import { useDataVersion } from "@/lib/poultry/useData";
import { EmptyState } from "../ui";

type Tipo =
  | "diario"
  | "semanal"
  | "mensual"
  | "galpon"
  | "sector"
  | "plantel"
  | "compGalpones"
  | "compSectores"
  | "historial";

const TABS: { id: Tipo; label: string }[] = [
  { id: "diario", label: "Diario" },
  { id: "semanal", label: "Semanal" },
  { id: "mensual", label: "Mensual" },
  { id: "galpon", label: "Por galpón" },
  { id: "sector", label: "Por sector" },
  { id: "plantel", label: "Por plantel" },
  { id: "compGalpones", label: "Comparar galpones" },
  { id: "compSectores", label: "Sector A vs B" },
  { id: "historial", label: "Historial" },
];

function Tabla({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  if (!rows.length) return <EmptyState>Sin datos para este reporte.</EmptyState>;
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            {head.map((h) => (
              <th key={h} className="px-3 py-2 font-semibold text-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i % 2 ? "bg-muted/30" : ""}>
              {r.map((c, j) => (
                <td key={j} className="px-3 py-2 text-foreground">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Reportes() {
  useDataVersion();
  const [tipo, setTipo] = useState<Tipo>("diario");
  const regs = getRegistros();

  const content = useMemo(() => buildReport(tipo, regs), [tipo, regs]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTipo(t.id)}
            className={
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors " +
              (tipo === t.id
                ? "bg-primary text-primary-foreground"
                : "border border-input bg-card text-foreground hover:bg-muted")
            }
          >
            {t.label}
          </button>
        ))}
      </div>
      <Tabla head={content.head} rows={content.rows} />
    </div>
  );
}

function row(label: string, a: ReturnType<typeof aggregate>, vivas: number) {
  return [
    label,
    fmt(a.total),
    fmt(a.aptos),
    `${postura(a.total, vivas).toFixed(1)}%`,
    `${pct(a.rotos, a.total).toFixed(1)}%`,
    fmt(a.muertes),
  ];
}

function buildReport(tipo: Tipo, regs: Registro[]): { head: string[]; rows: (string | number)[][] } {
  const headStd = ["Detalle", "Producción", "Aptos", "Postura", "Rotos", "Muertes"];

  if (tipo === "diario" || tipo === "semanal" || tipo === "mensual") {
    const dias = tipo === "diario" ? 1 : tipo === "semanal" ? 7 : 30;
    const fechas = lastDays(dias);
    const rango = regs.filter((r) => fechas.includes(r.fecha));
    return { head: headStd, rows: [row(`Últimos ${dias} día(s)`, aggregate(rango), gallinasVivas())] };
  }

  if (tipo === "galpon") {
    const galpones = [...new Set(ALL_SECTORES.map((s) => s.galpon))];
    return {
      head: headStd,
      rows: galpones.map((g) => {
        const r = regs.filter((x) => x.galpon === g);
        const vivas = ALL_SECTORES.filter((s) => s.galpon === g).reduce((acc, s) => acc + gallinasVivas(s.id), 0);
        return row(g, aggregate(r), vivas);
      }),
    };
  }

  if (tipo === "sector") {
    return {
      head: headStd,
      rows: ALL_SECTORES.map((s) => row(s.label, aggregate(regs.filter((x) => x.sectorId === s.id)), gallinasVivas(s.id))),
    };
  }

  if (tipo === "plantel") {
    return {
      head: headStd,
      rows: PLANTELES.map((p) => {
        const ids = p.sectores.map((s) => s.id);
        const r = regs.filter((x) => ids.includes(x.sectorId));
        const vivas = p.sectores.reduce((acc, s) => acc + gallinasVivas(s.id), 0);
        return row(p.nombre, aggregate(r), vivas);
      }),
    };
  }

  if (tipo === "compGalpones") {
    const galpones = [...new Set(ALL_SECTORES.map((s) => s.galpon))];
    return {
      head: ["Galpón", "Producción", "Aptos", "% del total"],
      rows: (() => {
        const totalGlobal = aggregate(regs).total || 1;
        return galpones.map((g) => {
          const a = aggregate(regs.filter((x) => x.galpon === g));
          return [g, fmt(a.total), fmt(a.aptos), `${pct(a.total, totalGlobal).toFixed(1)}%`];
        });
      })(),
    };
  }

  if (tipo === "compSectores") {
    const a = aggregate(regs.filter((x) => x.sector === "Sector A"));
    const b = aggregate(regs.filter((x) => x.sector === "Sector B"));
    return {
      head: ["Métrica", "Sector A", "Sector B"],
      rows: [
        ["Producción", fmt(a.total), fmt(b.total)],
        ["Huevos aptos", fmt(a.aptos), fmt(b.aptos)],
        ["Rotos %", `${pct(a.rotos, a.total).toFixed(1)}%`, `${pct(b.rotos, b.total).toFixed(1)}%`],
        ["Muertes", fmt(a.muertes), fmt(b.muertes)],
      ],
    };
  }

  // historial
  return {
    head: ["Fecha", "Galpón/Sector", "Producción", "Aptos", "Cajones"],
    rows: regs.slice(0, 60).map((r) => [r.fecha, `${r.galpon} ${r.sector}`, fmt(r.totalProducido), fmt(r.huevosAptos), fmt(r.cajones)]),
  };
}
