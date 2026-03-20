// Catálogo de metadatos de escenarios para el backend.
// Fuente de verdad: los archivos escenario*.ts en este directorio.
// Si agregas/renombras un escenario, actualiza este mapa.

interface EscenarioMeta {
  slug: string;
  titulo: string;
}

const escenarioMap = new Map<string, EscenarioMeta>([
  ["tutorial", { slug: "tutorial", titulo: "Tutorial: Introducción a la Seguridad" }],
  ["criptografia", { slug: "criptografia", titulo: "Criptografía: Firma Digital y Comunicación Segura" }],
  ["autenticacion", { slug: "autenticacion", titulo: "Autenticación y Control de Acceso" }],
  ["redes", { slug: "redes", titulo: "Seguridad de Redes: Firewall, Segmentación y VPN" }],
  ["hacking-etico", { slug: "hacking-etico", titulo: "Hacking Ético y Análisis de Vulnerabilidades" }],
  ["ransomware", { slug: "ransomware", titulo: "Gestión de Riesgos: Respuesta a Incidentes" }],
  ["banco", { slug: "banco", titulo: "Banco Nacional: Operación Firewall — Defensa APT" }],
]);

export function getNombreEscenario(slug: string): string {
  return escenarioMap.get(slug)?.titulo ?? `Escenario: ${slug}`;
}

export { escenarioMap };
