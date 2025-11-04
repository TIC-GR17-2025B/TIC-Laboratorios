export enum Mueble {
  MESA = "mesa",
  RACK = "rack",
  LIBRE = "libre",
}

export enum TipoDispositivo {
  WORKSTATION = "workstation",
  SERVER = "server",
  ROUTER = "router",
  SWITCH = "switch",
  PORTATIL = "portatil",
  NAS = "nas",
  OTRO = "otro",
}

export enum EstadoAtaqueDispositivo {
    NORMAL = "normal",
    COMPROMETIDO = "comprometido", // Que está bajo un ataque
}

export enum TipoAtaque {
    INFECCION_TROYANO = "Infección de troyano",
}

export enum TipoEvento {
    ENVIO_ACTIVO = "Envío de activo",
}
