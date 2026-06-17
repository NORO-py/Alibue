/**
 * Estructura productiva de ALIBUE.
 * Define planteles, galpones y sectores. Pensado para escalar:
 * agregar planteles/galpones aquí se propaga a toda la app.
 */

export interface Sector {
  id: string; // identificador único: "g1a"
  galpon: string; // "Galpón 1"
  sector: string; // "Sector A"
  label: string; // "Galpón 1 Sector A"
  plantel: string; // "Plantel 149"
}

export interface Plantel {
  id: string;
  nombre: string;
  sectores: Sector[];
}

export const PLANTELES: Plantel[] = [
  {
    id: "149",
    nombre: "Plantel 149",
    sectores: [
      { id: "g1a", galpon: "Galpón 1", sector: "Sector A", label: "Galpón 1 Sector A", plantel: "Plantel 149" },
      { id: "g1b", galpon: "Galpón 1", sector: "Sector B", label: "Galpón 1 Sector B", plantel: "Plantel 149" },
      { id: "g2a", galpon: "Galpón 2", sector: "Sector A", label: "Galpón 2 Sector A", plantel: "Plantel 149" },
      { id: "g2b", galpon: "Galpón 2", sector: "Sector B", label: "Galpón 2 Sector B", plantel: "Plantel 149" },
    ],
  },
  {
    id: "150",
    nombre: "Plantel 150",
    sectores: [
      { id: "g3a", galpon: "Galpón 3", sector: "Sector A", label: "Galpón 3 Sector A", plantel: "Plantel 150" },
      { id: "g3b", galpon: "Galpón 3", sector: "Sector B", label: "Galpón 3 Sector B", plantel: "Plantel 150" },
      { id: "g4a", galpon: "Galpón 4", sector: "Sector A", label: "Galpón 4 Sector A", plantel: "Plantel 150" },
      { id: "g4b", galpon: "Galpón 4", sector: "Sector B", label: "Galpón 4 Sector B", plantel: "Plantel 150" },
      { id: "g5a", galpon: "Galpón 5", sector: "Sector A", label: "Galpón 5 Sector A", plantel: "Plantel 150" },
      { id: "g5b", galpon: "Galpón 5", sector: "Sector B", label: "Galpón 5 Sector B", plantel: "Plantel 150" },
    ],
  },
];

export const ALL_SECTORES: Sector[] = PLANTELES.flatMap((p) => p.sectores);

export function getSector(id: string): Sector | undefined {
  return ALL_SECTORES.find((s) => s.id === id);
}

export const OPERARIO_PASSWORD = "Alibue";

/** Huevos por cajón: galponero usa 180, consolidado de operario usa 360. */
export const HUEVOS_POR_CAJON_GALPON = 180;
export const HUEVOS_POR_CAJON_PLANTEL = 360;

/** Umbrales para alertas automáticas. */
export const UMBRALES = {
  posturaMinima: 70, // % por debajo del cual se alerta caída de postura
  mortalidadMaxima: 5, // aves muertas por registro
  rotosMaximoPct: 4, // % de huevos rotos
  produccionBajaPct: 60, // postura considerada anormalmente baja
};
