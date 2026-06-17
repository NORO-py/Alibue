/**
 * Hook reactivo: re-renderiza cuando cambian los datos (mismo tab u otro).
 */
import { useCallback, useEffect, useState } from "react";

export function useDataVersion(): number {
  const [v, setV] = useState(0);
  const bump = useCallback(() => setV((x) => x + 1), []);
  useEffect(() => {
    window.addEventListener("alibue:data-changed", bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener("alibue:data-changed", bump);
      window.removeEventListener("storage", bump);
    };
  }, [bump]);
  return v;
}
