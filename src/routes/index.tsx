import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "sonner";
import { AppShell } from "@/components/poultry/AppShell";
import { RoleSelect } from "@/components/poultry/RoleSelect";
import { Galponero } from "@/components/poultry/Galponero";
import { OperarioLogin } from "@/components/poultry/OperarioLogin";
import { OperarioPanel, MODULOS } from "@/components/poultry/OperarioPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ALIBUE | Gestión Avícola" },
      {
        name: "description",
        content:
          "Sistema profesional de gestión avícola ALIBUE: producción diaria, clasificación de huevos, postura, mortalidad, reportes y alertas por plantel, galpón y sector.",
      },
    ],
  }),
  component: App,
});

type View = "role" | "galponero" | "operario-login" | "operario";

function App() {
  const [view, setView] = useState<View>("role");
  const [modulo, setModulo] = useState<string | null>(null);

  // Subtítulo y handler de retroceso según la vista
  let subtitle: string | undefined;
  let onBack: (() => void) | undefined;

  if (view === "galponero") {
    subtitle = "Carga de Producción";
    onBack = () => setView("role");
  } else if (view === "operario-login") {
    subtitle = "Acceso Operario";
    onBack = () => setView("role");
  } else if (view === "operario") {
    const activo = MODULOS.find((m) => m.id === modulo);
    subtitle = activo ? activo.titulo : "Panel de Operario";
    onBack = modulo ? () => setModulo(null) : () => setView("role");
  }

  return (
    <>
      <AppShell subtitle={subtitle} onBack={onBack}>
        {view === "role" && <RoleSelect onSelect={(r) => setView(r === "galponero" ? "galponero" : "operario-login")} />}
        {view === "galponero" && <Galponero onExit={() => setView("role")} />}
        {view === "operario-login" && <OperarioLogin onSuccess={() => setView("operario")} />}
        {view === "operario" && <OperarioPanel active={modulo} setActive={setModulo} />}
      </AppShell>
      <Toaster position="top-center" richColors />
    </>
  );
}
