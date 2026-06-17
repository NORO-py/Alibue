/**
 * Primitivas de UI reutilizables del sistema ALIBUE.
 * Estilos basados exclusivamente en tokens del design system.
 */
import { type ReactNode } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { Tendencia } from "@/lib/poultry/calculations";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 shadow-sm",
        accent && "border-primary/30 bg-primary/5",
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function TrendBadge({ t, label }: { t: Tendencia; label?: string }) {
  const map = {
    subio: { icon: ArrowUp, cls: "text-success bg-success/10", txt: "Subió" },
    bajo: { icon: ArrowDown, cls: "text-destructive bg-destructive/10", txt: "Bajó" },
    mantuvo: { icon: Minus, cls: "text-muted-foreground bg-muted", txt: "Se mantuvo" },
  } as const;
  const { icon: Icon, cls, txt } = map[t];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", cls)}>
      <Icon className="h-3 w-3" />
      {label ?? txt}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/40 p-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
