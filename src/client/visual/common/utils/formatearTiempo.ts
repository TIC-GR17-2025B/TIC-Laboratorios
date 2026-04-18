/**
 * Convierte segundos a formato "HH:MM:SS".
 *
 * @param totalSeconds número de segundos (puede ser float; si es negativo se preserva el signo)
 * @returns string en formato "HH:MM:SS" (horas puede tener más de 2 dígitos si corresponde)
 */
export function formatearTiempo(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || isNaN(totalSeconds)) {
    throw new TypeError("totalSeconds debe ser un número finito");
  }

  const sign = totalSeconds < 0 ? "-" : "";
  const absSeconds = Math.floor(Math.abs(totalSeconds));

  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const seconds = absSeconds % 60;

  const parts: string[] = [];

  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return sign + parts.join(" ");
}
