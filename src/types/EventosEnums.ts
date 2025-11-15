export enum EventosInternos {
  TIEMPO_EJECUCION_ATAQUE = "tiempo:ejecucionAtaque",
  TIEMPO_EJECUCION_EVENTO = "tiempo:ejecucionEvento",
  RED_ENVIAR_ACTIVO = "red:enviarActivo",
  RED_TRAFICO = "red:trafico",
  VPN_SOLICITUD_CONEXION = "vpn:solicitudConexion",
}

export enum EventosPublicos {
  RED_ASIGNADA = "red:asignada",
  RED_REMOVIDA = "red:removida",
  ATAQUE_REALIZADO = "ataque:ataqueRealizado",
  ATAQUE_MITIGADO = "ataque:ataqueMitigado",
  TIEMPO_NOTIFICACION_ATAQUE = "tiempo:notificacionAtaque",
  TIEMPO_NOTIFICACION_EVENTO = "tiempo:notificacionEvento",
  VPN_CONEXION_ESTABLECIDA = "vpn:conexionEstablecida",
  VPN_CONEXION_RECHAZADA = "vpn:conexionRechazada",
  VPN_GATEWAY_PERFIL_AGREGADO = "vpn:gatewayPerfilAgregado",
  VPN_GATEWAY_PERFIL_ELIMINADO = "vpn:gatewayPerfilEliminado",
  VPN_CLIENTE_PERFIL_AGREGADO = "vpn:clientePerfilAgregado",
  VPN_CLIENTE_PERFIL_ELIMINADO = "vpn:clientePerfilEliminado",
  RED_ACTIVO_ENVIADO = "red:activoEnviado",
  RED_ACTIVO_NO_ENVIADO = "red:activoNoEnviado",
  TRAFICO_PERMITIDO = "firewall:traficoPermitido",
  TRAFICO_BLOQUEADO = "firewall:traficoBloqueado",
  TIEMPO_PAUSADO = "tiempo:pausado",
  TIEMPO_REANUDADO = "tiempo:reanudado",
  TIEMPO_ACTUALIZADO = "tiempo:actualizado",
  PRESUPUESTO_ACTUALIZADO = "presupuesto:actualizado",
  PRESUPUESTO_AGOTADO = "presupuesto:agotado",

  LOGS_GENERALES_ACTUALIZADOS = "logsGenerales:actualizados",
}

export enum TipoLogGeneral {
  ATAQUE = "ataque",
  ADVERTENCIA = "advertencia",
  COMPLETADO = "completado",
}
