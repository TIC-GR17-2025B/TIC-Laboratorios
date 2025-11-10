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
  VPN = "vpn",
  NAS = "nas",
  OTRO = "otro",
}

export enum EstadoAtaqueDispositivo {
  NORMAL = "normal",
  COMPROMETIDO = "comprometido", // Que está bajo un ataque
}

export enum TipoProteccionVPN {
  EA = "Encriptar y Autenticar",
  A = "Solo Autenticar",
  N = "Ninguna",
  B = "Bloquear",
}

export enum TipoAtaque {
  INFECCION_TROYANO = "Infección de troyano",
}

export enum TipoEvento {
  ENVIO_ACTIVO = "Envío de activo",
  TRAFICO_RED = "Tráfico de red",
  CONEXION_VPN = "Conexión VPN",
}
