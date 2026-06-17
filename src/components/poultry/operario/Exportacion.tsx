/**
 * BOTÓN 8 — Exportación.
 * Exportar a Excel (CSV), generar PDF (vía impresión del navegador),
 * imprimir y compartir resumen para gerencia.
 */
import { FileSpreadsheet, FileText, Printer, Share2 } from "lucide-react";
import { getRegistros } from "@/lib/poultry/database";
import { aggregate, gallinasVivas, porPlantel } from "@/lib/poultry/aggregations";
import { postura, pct, fmt } from "@/lib/poultry/calculations";
import { exportCSV, imprimir, compartir } from "@/lib/poultry/exports";

export function Exportacion() {
  const regs = getRegistros();

  function excel() {
    const head = [
      "Fecha",
      "Plantel",
      "Galpón",
      "Sector",
      "Producción",
      "Doble yema",
      "Lavado",
      "Deforme",
      "Piso",
      "Rotos",
      "Aptos",
      "Cajones",
      "Sobrantes",
      "Hembras muertas",
      "Machos muertos",
    ];
    const rows = regs.map((r) => [
      r.fecha,
      r.plantel,
      r.galpon,
      r.sector,
      r.totalProducido,
      r.dobleYema,
      r.lavado,
      r.deforme,
      r.piso,
      r.rotos,
      r.huevosAptos,
      r.cajones,
      r.sobrantes,
      r.hembrasMuertas,
      r.machosMuertos,
    ]);
    exportCSV(`alibue-produccion-${new Date().toISOString().slice(0, 10)}`, [head, ...rows]);
  }

  function resumenTexto(): string {
    const a = aggregate(regs);
    const lineas = porPlantel().map(({ plantel, agg }) => {
      const vivas = plantel.sectores.reduce((acc, s) => acc + gallinasVivas(s.id), 0);
      return `${plantel.nombre}: ${fmt(agg.total)} huevos · postura ${postura(agg.total, vivas).toFixed(1)}%`;
    });
    return [
      "Reporte ALIBUE — Gestión Avícola",
      `Producción total: ${fmt(a.total)} huevos`,
      `Huevos aptos: ${fmt(a.aptos)}`,
      `Rotos: ${pct(a.rotos, a.total).toFixed(1)}%`,
      `Mortalidad total: ${fmt(a.muertes)} aves`,
      "",
      ...lineas,
    ].join("\n");
  }

  const opciones = [
    { icon: FileSpreadsheet, label: "Exportar a Excel", desc: "Descarga todos los registros (.csv)", action: excel },
    { icon: FileText, label: "Exportar a PDF", desc: "Genera un PDF con la vista de impresión", action: imprimir },
    { icon: Printer, label: "Imprimir reportes", desc: "Envía la vista actual a la impresora", action: imprimir },
    {
      icon: Share2,
      label: "Compartir con gerencia",
      desc: "Comparte un resumen ejecutivo",
      action: () => compartir("Reporte ALIBUE", resumenTexto()),
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Generación de reportes para gerencia.</p>
      {opciones.map((o) => (
        <button
          key={o.label}
          onClick={o.action}
          className="flex w-full items-center gap-4 rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/40"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <o.icon className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold text-foreground">{o.label}</span>
            <span className="block text-sm text-muted-foreground">{o.desc}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
