import type { ECSManager } from "../../core/ECSManager";
import type { Entidad } from "../../core";
import { ActivoComponent, DispositivoComponent } from "../../components";
import type { EventoRedService } from "./EventoRedService";
import { EventosRed } from "../../../types/EventosEnums";

// Servicio responsable de transferir activos entre dispositivos
export class TransferenciaService {
  constructor(
    private ecsManager: ECSManager,
    private eventoService?: EventoRedService
  ) {}

  // Transfiere un activo de un dispositivo a otro (protocolo FTP)
  enviarActivo(
    entidadEnvio: Entidad,
    entidadReceptor: Entidad,
    activo: string
  ): void {
    // Obtener componentes de activos de ambos dispositivos
    const activosReceptor = this.ecsManager
      .getComponentes(entidadReceptor)
      ?.get(ActivoComponent);
    const activosEmisor = this.ecsManager
      .getComponentes(entidadEnvio)
      ?.get(ActivoComponent);
    const dispReceptor = this.ecsManager
      .getComponentes(entidadReceptor)
      ?.get(DispositivoComponent);
    const dispEmisor = this.ecsManager
      .getComponentes(entidadEnvio)
      ?.get(DispositivoComponent);

    if (!activosReceptor || !dispReceptor) {
      this.ecsManager.emit(EventosRed.RED_ACTIVO_NO_ENVIADO, {
        descripcion: `Activo no enviado: ${dispReceptor?.nombre} no tiene componente de activos.`,
      });
      return;
    }

    if (!activosEmisor || !dispEmisor) {
      this.ecsManager.emit(EventosRed.RED_ACTIVO_NO_ENVIADO, {
        descripcion: `Activo no enviado: ${dispEmisor?.nombre} no tiene componente de activos.`,
      });
      return;
    }

    // Obtener el activo a enviar
    const activoAenviar = activosEmisor.activos.find(
      (a) => a.nombre === activo
    );
    if (!activoAenviar) {
      this.ecsManager.emit(EventosRed.RED_ACTIVO_NO_ENVIADO, {
        descripcion: `Activo no enviado: ${dispEmisor?.nombre} no tiene el activo: ${activo}.`,
      });
      return;
    }

    // Verificar si el receptor ya tiene el activo
    if (
      activosReceptor.activos.some(
        (a) =>
          a.nombre === activoAenviar.nombre &&
          a.contenido === activoAenviar.contenido
      )
    ) {
      console.warn("El dispositivo receptor ya contiene activo:", activo);
      this.ecsManager.emit(EventosRed.RED_ACTIVO_NO_ENVIADO, {
        descripcion: `Activo no enviado: ${dispReceptor?.nombre} ya contiene el activo: ${activo}.`,
      });
      return;
    }

    // Transferir activo
    activosReceptor.activos.push(activoAenviar);

    this.eventoService?.emitirActivoEnviado(
      activo,
      dispEmisor.nombre,
      dispReceptor.nombre
    );
  }
}
