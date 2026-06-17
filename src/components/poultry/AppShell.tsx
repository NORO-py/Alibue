/**
 * Cabecera + pie de página comunes a toda la aplicación.
 */
import { type ReactNode } from "react";
import { ChevronLeft, Egg } from "lucide-react";

export function AppShell({
  children,
  subtitle,
  onBack,
  right,
}: {
  children: ReactNode;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="no-print sticky top-0 z-20 border-b bg-primary text-primary-foreground shadow-sm">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
          {onBack ? (
            <button
              onClick={onBack}
              aria-label="Volver"
              className="-ml-1 grid h-9 w-9 shrink-0 place-items-center rounded-md transition-colors hover:bg-primary-foreground/15"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary-foreground/15">
              <Egg className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg font-bold leading-tight">ALIBUE</h1>
            <p className="truncate text-xs text-primary-foreground/80">
              {subtitle ?? "Gestión Avícola Profesional"}
            </p>
          </div>
          {right}
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">{children}</main>

      <footer className="no-print border-t bg-card py-4 text-center text-xs text-muted-foreground">
        Creado por Aparicio Agustín
      </footer>
    </div>
  );
}
