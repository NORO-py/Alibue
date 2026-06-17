/**
 * Acceso de Operario. Contraseña fija: "Alibue" (A mayúscula obligatoria).
 * Nota: validación en cliente acorde a un sitio estático en GitHub Pages.
 */
import { useState } from "react";
import { Lock } from "lucide-react";
import { OPERARIO_PASSWORD } from "@/lib/poultry/constants";

export function OperarioLogin({ onSuccess }: { onSuccess: () => void }) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pwd === OPERARIO_PASSWORD) {
      onSuccess();
    } else {
      setError(true);
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 pt-6">
      <div className="text-center">
        <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
          <Lock className="h-7 w-7" />
        </span>
        <h2 className="font-display text-xl font-bold text-foreground">Acceso Operario</h2>
        <p className="mt-1 text-sm text-muted-foreground">Ingrese la contraseña para continuar.</p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          autoFocus
          value={pwd}
          onChange={(e) => {
            setPwd(e.target.value);
            setError(false);
          }}
          placeholder="Contraseña"
          className="w-full rounded-md border border-input bg-card px-3 py-3 text-base text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        {error && <p className="text-sm font-medium text-destructive">Contraseña incorrecta.</p>}
        <button
          type="submit"
          className="w-full rounded-md bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}
