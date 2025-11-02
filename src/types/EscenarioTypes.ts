import type { AtaqueComponent, FaseComponent } from "../ecs/components";
import type { Entidad } from "../ecs/core";
import {
  EstadoAtaqueDispositivo,
  Mueble,
  TipoDispositivo,
} from "./DeviceEnums";

export interface Escenario {
  id: number;
  titulo: string;
  descripcion: string;
  presupuestoInicial: number;
  zonas: Entidad[];
  ataques: AtaqueComponent[];
  fases: FaseComponent[];
}

export interface Zona {
  id: number;
  nombre: string;
}

export interface Dispositivo {
  id: number;
  tipo: TipoDispositivo;
  nombre?: string;
  sistemaOperativo?: string;
  hardware: string;
  software?: string;
  posicion?: { x: number; y: number; z: number };
  estadoAtaque?: EstadoAtaqueDispositivo;
  // Id de la entidad ECS asociada (útil para acciones sobre la entidad)
  entidadId?: number;
  // Configuraciones del Workstation si aplica (las provee WorkstationComponent)
  configuraciones?: unknown;
  redes: string[];
  activos: Activo[];
}

export interface Activo {
  nombre: string;
  contenido: string;
}

export interface Espacio {
  id: number;
  mueble: Mueble | null;
  posicion?: { x: number; y: number; z: number; rotacionY?: number };
  dispositivos: Dispositivo[];
}

export interface Oficina {
  id: number;
  nombre?: string;
  posicion?: { x: number; y: number; z: number };
  espacios: Espacio[];
}
