/**
 * BOTÓN 7 — Gestión de Tareas.
 * Crear, editar, completar y eliminar tareas.
 */
import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { getTareas, saveTareas, uid, type Tarea } from "@/lib/poultry/database";
import { useDataVersion } from "@/lib/poultry/useData";
import { EmptyState } from "../ui";

export function Tareas() {
  useDataVersion();
  const tareas = getTareas();
  const [titulo, setTitulo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  function persist(next: Tarea[]) {
    saveTareas(next);
  }

  function crear() {
    if (!titulo.trim()) return;
    if (editId) {
      persist(tareas.map((t) => (t.id === editId ? { ...t, titulo, detalle } : t)));
      setEditId(null);
    } else {
      persist([{ id: uid(), titulo, detalle, completada: false, creado: new Date().toISOString() }, ...tareas]);
    }
    setTitulo("");
    setDetalle("");
  }

  function toggle(id: string) {
    persist(tareas.map((t) => (t.id === id ? { ...t, completada: !t.completada } : t)));
  }
  function eliminar(id: string) {
    persist(tareas.filter((t) => t.id !== id));
  }
  function editar(t: Tarea) {
    setEditId(t.id);
    setTitulo(t.titulo);
    setDetalle(t.detalle);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2 rounded-lg border bg-card p-4">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título (ej: Viernes — tirar viruta en Galpón 4)"
          className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <input
          value={detalle}
          onChange={(e) => setDetalle(e.target.value)}
          placeholder="Detalle (opcional)"
          className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <div className="flex gap-2">
          <button
            onClick={crear}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {editId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editId ? "Guardar cambios" : "Agregar tarea"}
          </button>
          {editId && (
            <button
              onClick={() => {
                setEditId(null);
                setTitulo("");
                setDetalle("");
              }}
              className="rounded-md border border-input px-3 text-sm text-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {tareas.length === 0 ? (
        <EmptyState>No hay tareas registradas.</EmptyState>
      ) : (
        <div className="grid gap-2">
          {tareas.map((t) => (
            <div key={t.id} className="flex items-start gap-3 rounded-lg border bg-card p-3">
              <button
                onClick={() => toggle(t.id)}
                aria-label="Completar"
                className={
                  "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border " +
                  (t.completada ? "border-success bg-success text-success-foreground" : "border-input")
                }
              >
                {t.completada && <Check className="h-4 w-4" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={"text-sm font-medium text-foreground " + (t.completada ? "line-through opacity-60" : "")}>
                  {t.titulo}
                </p>
                {t.detalle && <p className="text-xs text-muted-foreground">{t.detalle}</p>}
              </div>
              <button onClick={() => editar(t)} aria-label="Editar" className="shrink-0 text-muted-foreground hover:text-foreground">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => eliminar(t.id)} aria-label="Eliminar" className="shrink-0 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
