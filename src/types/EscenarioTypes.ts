import { Mueble, TipoDispositivo } from "./DeviceEnums";

export interface Dispositivo {
  id: number;
  tipo: TipoDispositivo;
  nombre?: string;
  sistemaOperativo?: string;
  hardware: string;
  software?: string;
  posicion?: { x: number; y: number; z: number };
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

export interface Zona {
  nombre: string;
  id?: number;
  oficinas: Oficina[];
}

export interface Escenario {
  id: number;
  titulo: string;
  zonas: Zona[];
}
