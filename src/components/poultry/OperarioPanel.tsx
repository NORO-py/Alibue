/**
 * Panel del Operario: dashboard con 9 módulos.
 */
import { useState, type ComponentType } from "react";
import {
  Bird,
  Boxes,
  Calculator,
  FileBarChart,
  LineChart,
  Bell,
  ListChecks,
  Download,
  LayoutDashboard,
} from "lucide-react";
import { getAlertas } from "@/lib/poultry/database";
import { useDataVersion } from "@/lib/poultry/useData";
import { GestionAves } from "./operario/GestionAves";
import { Cajones } from "./operario/Cajones";
import { Calculos } from "./operario/Calculos";
import { Reportes } from "./operario/Reportes";
import { Graficos } from "./operario/Graficos";
import { Alertas } from "./operario/Alertas";
import { Tareas } from "./operario/Tareas";
import { Exportacion } from "./operario/Exportacion";
import { PlantelPrincipal } from "./operario/PlantelPrincipal";

interface Modulo {
  id: string;
  titulo: string;
  desc: string;
  icon: ComponentType<{ className?: string }>;
  Comp: ComponentType;
}

const MODULOS: Modulo[] = [
  { id: "aves", titulo: "Gestión de Aves", desc: "Stock de gallinas y gallos", icon: Bird, Comp: GestionAves },
  { id: "cajones", titulo: "Cajones por Plantel", desc: "Consolidado a 360 huevos", icon: Boxes, Comp: Cajones },
  { id: "calculos", titulo: "Cálculos Automáticos", desc: "Postura, mortalidad, tendencias", icon: Calculator, Comp: Calculos },
  { id: "reportes", titulo: "Reportes", desc: "Diario, semanal, comparativos", icon: FileBarChart, Comp: Reportes },
  { id: "graficos", titulo: "Gráficos y Estadísticas", desc: "Evolución y rankings", icon: LineChart, Comp: Graficos },
  { id: "alertas", titulo: "Alertas Automáticas", desc: "Activas e historial", icon: Bell, Comp: Alertas },
  { id: "tareas", titulo: "Gestión de Tareas", desc: "Crear, editar, completar", icon: ListChecks, Comp: Tareas },
  { id: "exportar", titulo: "Exportación", desc: "Excel, PDF, imprimir, compartir", icon: Download, Comp: Exportacion },
  { id: "principal", titulo: "Plantel Principal", desc: "Dashboard en tiempo real", icon: LayoutDashboard, Comp: PlantelPrincipal },
];

export function OperarioPanel({
  active,
  setActive,
}: {
  active: string | null;
  setActive: (id: string | null) => void;
}) {
  useDataVersion();
  const alertasActivas = getAlertas().filter((a) => a.activa).length;
  const current = MODULOS.find((m) => m.id === active);

  if (current) {
    const Comp = current.Comp;
    return <Comp />;
  }

  return (
    <div className="space-y-5">
      {alertasActivas > 0 && (
        <button
          onClick={() => setActive("alertas")}
          className="flex w-full items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-left"
        >
          <Bell className="h-5 w-5 shrink-0 text-destructive" />
          <span className="text-sm font-medium text-foreground">
            {alertasActivas} alerta(s) activa(s). Toque para revisar.
          </span>
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        {MODULOS.map((m) => (
          <button
            key={m.id}
            onClick={() => setActive(m.id)}
            className="flex flex-col gap-2 rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.98]"
          >
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <m.icon className="h-5 w-5" />
            </span>
            <span className="font-display text-sm font-semibold leading-tight text-foreground">{m.titulo}</span>
            <span className="text-xs text-muted-foreground">{m.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export { MODULOS };
