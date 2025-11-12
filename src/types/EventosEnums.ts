export enum EventosTiempo {
  TIEMPO_PAUSADO = "tiempo:pausado",
  TIEMPO_REANUDADO = "tiempo:reanudado",
  TIEMPO_ACTUALIZADO = "tiempo:actualizado",
  TIEMPO_NOTIFICACION_ATAQUE = "tiempo:notificacionAtaque",
  TIEMPO_NOTIFICACION_EVENTO = "tiempo:notificacionEvento",
  TIEMPO_EJECUCION_ATAQUE = "tiempo:ejecucionAtaque",
  TIEMPO_EJECUCION_EVENTO = "tiempo:ejecucionEvento",
}

export enum EventosPresupuesto {
  PRESUPUESTO_ACTUALIZADO = "presupuesto:actualizado",
  PRESUPUESTO_AGOTADO = "presupuesto:agotado",
}

export enum EventosAtaque {
  ATAQUE_REALIZADO = "ataque:ataqueRealizado",
  ATAQUE_MITIGADO = "ataque:ataqueMitigado",
}

export enum EventosRed {
  RED_FIREWALL_BLOQUEO = "red:firewallBloqueo",
  RED_ENVIAR_ACTIVO = "red:enviarActivo",
  RED_ACTIVO_ENVIADO = "red:activoEnviado",
  RED_ACTIVO_NO_ENVIADO = "red_activoNoEnviado",
  RED_TRAFICO = "red:trafico",
  TRAFICO_ENVIADO = "trafico:enviado",
  RED_ASIGNADA = "red:redAsignada",
  RED_REMOVIDA = "red:redRemovida",
  INTERNET_CONECTADO = "red:internetConectado",
  INTERNET_DESCONECTADO = "red:internetDesconectado",
}

export enum EventosFirewall {
  TRAFICO_PERMITIDO = "firewall:traficoPermitido",
  TRAFICO_BLOQUEADO = "firewall:traficoBloqueado",
  HABILITADO = "firewall:habilitado",
  DESHABILITADO = "firewall:deshabilitado",
  REGLA_AGREGADA = "firewall:reglaAgregada",
  POLITICA_CAMBIADA = "firewall:politicaCambiada",
}

export enum EventosVPN {
  VPN_SOLICITUD_CONEXION = "vpn:solicitudConexion",
  VPN_CONEXION_ESTABLECIDA = "vpn:conexionEstablecida",
  VPN_CONEXION_RECHAZADA = "vpn:conexionRechazada",
}
