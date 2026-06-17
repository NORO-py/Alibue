/**
 * BOTÓN 1 — Gestión de Aves.
 * Registrar/editar stock de gallinas y gallos por galpón y sector.
 * La mortalidad cargada por el galponero descuenta el stock automáticamente
 * (ver addRegistro en database.ts).
 */
import { useState } from "react";
import { toast } from "sonner";
import { PLANTELES } from "@/lib/poultry/constants";
import { getStock, setStock } from "@/lib/poultry/database";
import { useDataVersion } from "@/lib/poultry/useData";
import { fmt } from "@/lib/poultry/calculations";
import { Section } from "../ui";

export function GestionAves() {
  useDataVersion();
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Stock de aves por sector. La mortalidad registrada se descuenta automáticamente.
      </p>
      {PLANTELES.map((p) => (
        <Section key={p.id} title={p.nombre}>
          <div className="grid gap-2">
            {p.sectores.map((s) => (
              <FilaStock key={s.id} sectorId={s.id} label={s.label} />
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}

function FilaStock({ sectorId, label }: { sectorId: string; label: string }) {
  const current = getStock(sectorId);
  const [gallinas, setGallinas] = useState(String(current.gallinas));
  const [gallos, setGallos] = useState(String(current.gallos));
  const [edit, setEdit] = useState(false);

  function guardar() {
    setStock({ sectorId, gallinas: Number(gallinas) || 0, gallos: Number(gallos) || 0 });
    setEdit(false);
    toast.success(`Stock actualizado: ${label}`);
  }

  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {edit ? (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="text-xs text-muted-foreground">
            Gallinas
            <input
              type="number"
              value={gallinas}
              onChange={(e) => setGallinas(e.target.value)}
              className="mt-0.5 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
            />
          </label>
          <label className="text-xs text-muted-foreground">
            Gallos
            <input
              type="number"
              value={gallos}
              onChange={(e) => setGallos(e.target.value)}
              className="mt-0.5 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
            />
          </label>
          <button onClick={guardar} className="col-span-2 rounded-md bg-primary py-1.5 text-sm font-semibold text-primary-foreground">
            Guardar
          </button>
        </div>
      ) : (
        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {fmt(current.gallinas)} gallinas · {fmt(current.gallos)} gallos
          </p>
          <button
            onClick={() => setEdit(true)}
            className="rounded-md border border-input px-3 py-1 text-xs font-medium text-foreground hover:bg-muted"
          >
            Editar
          </button>
        </div>
      )}
    </div>
  );
}
