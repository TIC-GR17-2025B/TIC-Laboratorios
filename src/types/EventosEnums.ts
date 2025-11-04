export enum EventosTiempo {
    TIEMPO_PAUSADO = "tiempo:pausado",
    TIEMPO_REANUDADO = "tiempo:reanudado",
    TIEMPO_ACTUALIZADO = "tiempo:actualizado",
    TIEMPO_NOTIFICACION_ATAQUE = "tiempo:notificacionAtaque",
    TIEMPO_NOTIFICACION_EVENTO = "tiempo:notificacionEvento",
    TIEMPO_EJECUCION_ATAQUE = "tiempo:ejecucionAtaque",
    TIEMPO_EJECUCION_EVENTO = "tiempo:ejecucionEvento",
};

export enum EventosPresupuesto {
    PRESUPUESTO_ACTUALIZADO = "presupuesto:actualizado",
    PRESUPUESTO_AGOTADO = "presupuesto:agotado",
};

export enum EventosAtaque {
    ATAQUE_REALIZADO = "ataque:ataqueRealizado",
    ATAQUE_MITIGADO = "ataque:ataqueMitigado",
};

export enum EventosRed {
    RED_ENVIAR_ACTIVO = "red:enviarActivo",
    RED_ACTIVO_ENVIADO = "red:activoEnviado",
    TRAFICO_ENVIADO = "trafico:enviado",
};
