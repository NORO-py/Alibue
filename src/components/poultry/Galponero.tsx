/**
 * Flujo del Galponero:
 * 1. Selección de galpón + sector (plantel detectado automáticamente)
 * 2. Formulario de producción (mortalidad, producción, clasificación)
 * 3. Resumen y guardado permanente
 */
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { PLANTELES, getSector } from "@/lib/poultry/constants";
import {
  addRegistro,
  getStock,
  addAlertas,
  uid,
  type Registro,
} from "@/lib/poultry/database";
import {
  sum,
  huevosAptos,
  calcularCajones,
  generarAlertas,
  hoyISO,
  fmt,
} from "@/lib/poultry/calculations";
import { Section, StatCard } from "./ui";

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-foreground">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-base text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}

const n = (s: string) => Number(s) || 0;

export function Galponero({ onExit }: { onExit: () => void }) {
  const [sectorId, setSectorId] = useState<string>("");
  const [step, setStep] = useState<"select" | "form" | "summary">("select");

  // Mortalidad
  const [hembras, setHembras] = useState("");
  const [machos, setMachos] = useState("");
  // Producción
  const [prod, setProd] = useState(["", "", "", "", ""]);
  // Clasificación
  const [dobleYema, setDobleYema] = useState("");
  const [lavado, setLavado] = useState("");
  const [deforme, setDeforme] = useState("");
  const [piso, setPiso] = useState("");
  const [rotos, setRotos] = useState("");

  const sector = getSector(sectorId);
  const total = useMemo(() => sum(prod.map(n)), [prod]);
  const clasif = {
    dobleYema: n(dobleYema),
    lavado: n(lavado),
    deforme: n(deforme),
    piso: n(piso),
    rotos: n(rotos),
  };
  const aptos = huevosAptos(total, clasif);
  const { cajones, sobrantes } = calcularCajones(aptos);

  function setProdAt(i: number, v: string) {
    setProd((p) => p.map((x, idx) => (idx === i ? v : x)));
  }

  function guardar() {
    if (!sector) return;
    const registro: Registro = {
      id: uid(),
      fecha: hoyISO(),
      creado: new Date().toISOString(),
      sectorId: sector.id,
      plantel: sector.plantel,
      galpon: sector.galpon,
      sector: sector.sector,
      hembrasMuertas: n(hembras),
      machosMuertos: n(machos),
      producciones: prod.map(n),
      totalProducido: total,
      ...clasif,
      huevosAptos: aptos,
      cajones,
      sobrantes,
    };
    addRegistro(registro);
    // Stock ya descontado dentro de addRegistro; generamos alertas con stock actualizado
    addAlertas(generarAlertas(registro, getStock(sector.id)));
    toast.success("Registro guardado correctamente");
    onExit();
  }

  /* ---------- Paso 1: Selección ---------- */
  if (step === "select") {
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Seleccione el galpón y sector. El plantel se identifica automáticamente.
        </p>
        {PLANTELES.map((p) => (
          <Section key={p.id} title={p.nombre}>
            <div className="grid gap-2">
              {p.sectores.map((s) => {
                const active = s.id === sectorId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSectorId(s.id)}
                    className={
                      "flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors " +
                      (active
                        ? "border-primary bg-primary/10 font-semibold text-foreground"
                        : "bg-card text-foreground hover:border-primary/40")
                    }
                  >
                    <span>{s.label}</span>
                    {active && <MapPin className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </Section>
        ))}

        {sector && (
          <div className="sticky bottom-4 rounded-xl border bg-card p-4 shadow-lg">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Plantel detectado</p>
            <p className="font-display text-xl font-bold text-primary">{sector.plantel}</p>
            <p className="text-sm text-muted-foreground">
              {sector.galpon} · {sector.sector}
            </p>
            <button
              onClick={() => setStep("form")}
              className="mt-3 w-full rounded-md bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ---------- Paso 2: Formulario ---------- */
  if (step === "form" && sector) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-secondary/60 px-4 py-3">
          <p className="font-display text-base font-semibold text-foreground">
            {sector.plantel} · {sector.galpon} {sector.sector}
          </p>
        </div>

        <Section title="Mortalidad">
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Hembras muertas" value={hembras} onChange={setHembras} />
            <NumberInput label="Machos muertos" value={machos} onChange={setMachos} />
          </div>
        </Section>

        <Section title="Producción de huevos">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {prod.map((v, i) => (
              <NumberInput key={i} label={`Producción ${i + 1}`} value={v} onChange={(val) => setProdAt(i, val)} />
            ))}
          </div>
          <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total producido</p>
            <p className="font-display text-2xl font-bold text-primary">{fmt(total)}</p>
          </div>
        </Section>

        <Section title="Clasificación de huevos">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <NumberInput label="Doble yema" value={dobleYema} onChange={setDobleYema} />
            <NumberInput label="Lavado" value={lavado} onChange={setLavado} />
            <NumberInput label="Deforme" value={deforme} onChange={setDeforme} />
            <NumberInput label="Piso" value={piso} onChange={setPiso} />
            <NumberInput label="Rotos" value={rotos} onChange={setRotos} />
          </div>
        </Section>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Huevos aptos" value={fmt(aptos)} accent />
          <StatCard label="Cajones (180 c/u)" value={fmt(cajones)} hint={`${fmt(sobrantes)} huevos de nido`} />
        </div>

        <button
          onClick={() => setStep("summary")}
          className="w-full rounded-md bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Revisar resumen
        </button>
      </div>
    );
  }

  /* ---------- Paso 3: Resumen ---------- */
  if (step === "summary" && sector) {
    const rows: [string, string][] = [
      ["Plantel", sector.plantel],
      ["Galpón", sector.galpon],
      ["Sector", sector.sector],
      ["Producción total", fmt(total)],
      ["Doble yema", fmt(clasif.dobleYema)],
      ["Lavado", fmt(clasif.lavado)],
      ["Deforme", fmt(clasif.deforme)],
      ["Piso", fmt(clasif.piso)],
      ["Rotos", fmt(clasif.rotos)],
      ["Huevos aptos", fmt(aptos)],
      ["Hembras muertas", fmt(n(hembras))],
      ["Machos muertos", fmt(n(machos))],
      ["Cajones obtenidos", fmt(cajones)],
      ["Huevos sobrantes", fmt(sobrantes)],
    ];
    return (
      <div className="space-y-6">
        <Section title="Resumen del registro">
          <div className="overflow-hidden rounded-lg border bg-card">
            {rows.map(([k, v], i) => (
              <div
                key={k}
                className={"flex items-center justify-between px-4 py-2.5 text-sm " + (i % 2 ? "bg-muted/40" : "")}
              >
                <span className="text-muted-foreground">{k}</span>
                <span className="font-semibold text-foreground">{v}</span>
              </div>
            ))}
          </div>
        </Section>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setStep("form")}
            className="rounded-md border border-input bg-card py-3 font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Volver a editar
          </button>
          <button
            onClick={guardar}
            className="rounded-md bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Guardar Registro
          </button>
        </div>
      </div>
    );
  }

  return null;
}
