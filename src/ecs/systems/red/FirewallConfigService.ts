import type { ECSManager } from "../../core/ECSManager";
import type { Entidad } from "../../core";
import { DispositivoComponent, RouterComponent } from "../../components";
import type { TipoProtocolo } from "../../../types/TrafficEnums";
import type { DireccionTrafico } from "../../../types/FirewallTypes";

export class FirewallConfigService {
  constructor(private ecsManager: ECSManager) {}

  toggleFirewall(entidadRouter: Entidad, habilitado: boolean): void {
    const router = this.ecsManager
      .getComponentes(entidadRouter)
      ?.get(RouterComponent);
    const dispositivo = this.ecsManager
      .getComponentes(entidadRouter)
      ?.get(DispositivoComponent);

    if (!router || !dispositivo) {
      console.error(`Router con entidad "${entidadRouter}" no encontrado`);
      return;
    }

    const configActual = router.firewall;
    router.firewall = {
      ...configActual,
      habilitado,
    };

    const registroEvento = {
      router: dispositivo.nombre,
      mensaje: `Firewall del router "${dispositivo.nombre}" ${
        habilitado ? "habilitado" : "deshabilitado"
      }`,
      tipo: habilitado ? "HABILITADO" : "DESHABILITADO",
    };

    router.logsFirewall.push(registroEvento);
  }

  agregarReglaFirewall(
    entidadRouter: Entidad,
    protocolo: TipoProtocolo,
    accion: "PERMITIR" | "DENEGAR",
    direccion: DireccionTrafico
  ): void {
    const router = this.ecsManager
      .getComponentes(entidadRouter)
      ?.get(RouterComponent);
    const dispositivo = this.ecsManager
      .getComponentes(entidadRouter)
      ?.get(DispositivoComponent);

    if (!router || !dispositivo) {
      console.error(`Router con entidad "${entidadRouter}" no encontrado`);
      return;
    }

    const reglasExistentes =
      router.firewall.reglasGlobales.get(protocolo) || [];

    const reglasFiltradas = reglasExistentes.filter(
      (regla) => regla.direccion !== direccion && regla.direccion !== "AMBAS"
    );

    const nuevaRegla = { accion, direccion };
    router.firewall.reglasGlobales.set(protocolo, [
      ...reglasFiltradas,
      nuevaRegla,
    ]);
  }

  agregarExcepcionFirewall(
    entidadRouter: Entidad,
    protocolo: TipoProtocolo,
    entidadDispositivo: Entidad,
    accion: "PERMITIR" | "DENEGAR",
    direccion: DireccionTrafico
  ): void {
    const router = this.ecsManager
      .getComponentes(entidadRouter)
      ?.get(RouterComponent);
    const dispositivoRouter = this.ecsManager
      .getComponentes(entidadRouter)
      ?.get(DispositivoComponent);
    const dispositivoExcepcion = this.ecsManager
      .getComponentes(entidadDispositivo)
      ?.get(DispositivoComponent);

    if (!router || !dispositivoRouter || !dispositivoExcepcion) {
      console.error(`Router o dispositivo no encontrado`);
      return;
    }

    const excepcionesExistentes =
      router.firewall.excepciones.get(protocolo) || [];

    const nuevaExcepcion = {
      nombreDispositivo: dispositivoExcepcion.nombre,
      accion,
      direccion,
    };
    router.firewall.excepciones.set(protocolo, [
      ...excepcionesExistentes,
      nuevaExcepcion,
    ]);

    const registroEvento = {
      router: dispositivoRouter.nombre,
      mensaje: `Excepción agregada en "${dispositivoRouter.nombre}": ${accion} ${protocolo} para "${dispositivoExcepcion.nombre}" (${direccion})`,
      tipo: "REGLA_AGREGADA",
      protocolo,
      accion,
      direccion,
    };

    router.logsFirewall.push(registroEvento);
  }

  setPoliticaFirewall(
    entidadRouter: Entidad,
    politica: "PERMITIR" | "DENEGAR"
  ): void {
    const router = this.ecsManager
      .getComponentes(entidadRouter)
      ?.get(RouterComponent);
    const dispositivo = this.ecsManager
      .getComponentes(entidadRouter)
      ?.get(DispositivoComponent);

    if (!router || !dispositivo) {
      console.error(`Router con entidad "${entidadRouter}" no encontrado`);
      return;
    }

    const politicaAnterior = router.firewall.politicaPorDefecto;
    router.firewall.politicaPorDefecto = politica;

    const registroEvento = {
      router: dispositivo.nombre,
      mensaje: `Política general de "${dispositivo.nombre}" cambiada de ${politicaAnterior} a ${politica}`,
      tipo: "POLITICA_CAMBIADA",
      politicaAnterior,
      politicaNueva: politica,
    };

    router.logsFirewall.push(registroEvento);
  }

  setPoliticaFirewallSaliente(
    entidadRouter: Entidad,
    politica: "PERMITIR" | "DENEGAR"
  ): void {
    const router = this.ecsManager
      .getComponentes(entidadRouter)
      ?.get(RouterComponent);
    const dispositivo = this.ecsManager
      .getComponentes(entidadRouter)
      ?.get(DispositivoComponent);

    if (!router || !dispositivo) {
      console.error(`Router con entidad "${entidadRouter}" no encontrado`);
      return;
    }

    const politicaAnterior =
      router.firewall.politicaPorDefectoSaliente ||
      router.firewall.politicaPorDefecto;
    router.firewall.politicaPorDefectoSaliente = politica;

    const registroEvento = {
      router: dispositivo.nombre,
      mensaje: `Política SALIENTE de "${dispositivo.nombre}" cambiada de ${politicaAnterior} a ${politica}`,
      tipo: "POLITICA_CAMBIADA",
      politicaAnterior,
      politicaNueva: politica,
    };

    router.logsFirewall.push(registroEvento);
  }

  setPoliticaFirewallEntrante(
    entidadRouter: Entidad,
    politica: "PERMITIR" | "DENEGAR"
  ): void {
    const router = this.ecsManager
      .getComponentes(entidadRouter)
      ?.get(RouterComponent);
    const dispositivo = this.ecsManager
      .getComponentes(entidadRouter)
      ?.get(DispositivoComponent);

    if (!router || !dispositivo) {
      console.error(`Router con entidad "${entidadRouter}" no encontrado`);
      return;
    }

    const politicaAnterior =
      router.firewall.politicaPorDefectoEntrante ||
      router.firewall.politicaPorDefecto;
    router.firewall.politicaPorDefectoEntrante = politica;

    const registroEvento = {
      router: dispositivo.nombre,
      mensaje: `Política ENTRANTE de "${dispositivo.nombre}" cambiada de ${politicaAnterior} a ${politica}`,
      tipo: "POLITICA_CAMBIADA",
      politicaAnterior,
      politicaNueva: politica,
    };

    router.logsFirewall.push(registroEvento);
  }
}
