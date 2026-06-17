/**
 * Utilidades de exportación: CSV (compatible con Excel), impresión y compartir.
 * Sin dependencias externas para mantener el bundle liviano y estático.
 */

export function exportCSV(filename: string, rows: (string | number)[][]): void {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  // BOM para que Excel respete acentos
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function imprimir(): void {
  window.print();
}

export async function compartir(titulo: string, texto: string): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share({ title: titulo, text: texto });
      return;
    } catch {
      /* cancelado */
    }
  }
  await navigator.clipboard?.writeText(`${titulo}\n\n${texto}`);
  alert("Reporte copiado al portapapeles para enviar a gerencia.");
}
