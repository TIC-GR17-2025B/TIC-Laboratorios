// Catálogo de metadatos de escenarios para el backend.
// Fuente de verdad: los archivos escenario*.ts en este directorio.
// Si agregas/renombras un escenario, actualiza este mapa.

interface EscenarioMeta {
  id: number;
  titulo: string;
}

const escenarioMap = new Map<number, EscenarioMeta>([
  [1, { id: 1, titulo: "Demo: Asignar Red, Firewall y VPN" }],
  [2, { id: 2, titulo: "Verificación de Firma Digital" }],
  [3, { id: 3, titulo: "Empresa Multinacional: Auditoría de Seguridad" }],
  [4, { id: 4, titulo: "Hacking Ético" }],
  [5, { id: 5, titulo: "Segmentación de Red: Empresa Retail" }],
  [6, { id: 6, titulo: "Respuesta a Incidentes: Ransomware" }],
  [7, { id: 7, titulo: "Banco Nacional: Operación Firewall — Defensa APT" }],
]);

export function getNombreEscenario(id: number): string {
  return escenarioMap.get(id)?.titulo ?? `Escenario #${id}`;
}

export { escenarioMap };
