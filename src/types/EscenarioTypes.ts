import type {
  AtaqueComponent,
  EventoComponent,
  FaseComponent,
} from "../ecs/components";
import type { Entidad } from "../ecs/core";
import {
  EstadoAtaqueDispositivo,
  Mueble,
  TipoDispositivo,
  TipoProteccionVPN,
} from "./DeviceEnums";
import type { TipoLogGeneral } from "./EventosEnums";

export interface Escenario {
  id: number;
  titulo: string;
  descripcion: string;
  presupuestoInicial: number;
  zonas: Entidad[];
  ataques: AtaqueComponent[];
  eventos: EventoComponent[];
  fases: FaseComponent[];
  redes: Entidad[];
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
  activos: Activo[];
  redes?: Array<{ nombre: string; color: string; entidadId: number }>;
}

export interface Activo {
  nombre: string;
  contenido: string;
}

export interface PerfilVPNGateway {
  lanLocal: string;
  hostLan: string;
  proteccion: TipoProteccionVPN;
  dominioRemoto: string;
  hostRemoto: string;
}

export interface PerfilClienteVPN {
  proteccion: TipoProteccionVPN;
  dominioRemoto: string;
  hostRemoto: string;
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

export interface LogGeneral {
  tipo: TipoLogGeneral;
  mensaje: string;
  pausarTiempo: boolean;
}

export interface ObjetivoFase {
    descripcion: string;
    completado: boolean;
}
