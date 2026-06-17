/**
 * Pantalla inicial: selección de tipo de usuario.
 */
import { Bird, ShieldCheck } from "lucide-react";

export function RoleSelect({ onSelect }: { onSelect: (role: "galponero" | "operario") => void }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
        <p className="font-display text-2xl font-bold text-foreground">Sistema de Gestión Avícola</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Seleccione su perfil para comenzar la jornada.
        </p>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => onSelect("galponero")}
          className="flex items-center gap-4 rounded-xl border bg-card p-5 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
        >
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Bird className="h-7 w-7" />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-lg font-semibold text-foreground">Galponero</span>
            <span className="block text-sm text-muted-foreground">
              Acceso libre. Carga de producción diaria por galpón y sector.
            </span>
          </span>
        </button>

        <button
          onClick={() => onSelect("operario")}
          className="flex items-center gap-4 rounded-xl border bg-card p-5 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
        >
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent-foreground">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-lg font-semibold text-foreground">Operario</span>
            <span className="block text-sm text-muted-foreground">
              Panel de gestión, reportes, estadísticas y alertas. Requiere contraseña.
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
