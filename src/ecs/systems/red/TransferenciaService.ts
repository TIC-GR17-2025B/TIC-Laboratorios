import type { ECSManager } from "../../core/ECSManager";
import { ActivoComponent, DispositivoComponent } from "../../components";
import type { EventoRedService } from "./EventoRedService";

// Servicio responsable de transferir activos entre dispositivos
 
export class TransferenciaService {
    constructor(
        private ecsManager: ECSManager,
        private eventoService: EventoRedService
    ) {}

    // Transfiere un activo de un dispositivo a otro (protocolo FTP)
    enviarActivo(dispEnvio: string, dispReceptor: string, activo: string): void {
        // Obtener componentes de activos de ambos dispositivos
        const activosReceptor = this.obtenerActivosDispositivo(dispReceptor);
        const activosEmisor = this.obtenerActivosDispositivo(dispEnvio);

        if (!activosReceptor) {
            console.warn("El dispositivo receptor no tiene componente de activos");
            return;
        }

        if (!activosEmisor) {
            console.warn("El dispositivo emisor no tiene componente de activos");
            return;
        }

        // Obtener el activo a enviar
        const activoAenviar = activosEmisor.activos.find((a) => a.nombre === activo);
        if (!activoAenviar) {
            console.warn(`El dispositivo emisor no tiene el activo: ${activo}`);
            return;
        }

        // Verificar si el receptor ya tiene el activo
        if (activosReceptor.activos.some(a => a.nombre === activoAenviar.nombre &&
                                   a.contenido === activoAenviar.contenido)) {
            console.warn("El dispositivo receptor ya contiene activo:", activo);
            return;
        }
 
        // Transferir activo
        activosReceptor.activos.push(activoAenviar);

        this.eventoService.emitirActivoEnviado(activo, dispEnvio, dispReceptor);
    }

    // Obtiene el componente ActivoComponent de un dispositivo por nombre
    private obtenerActivosDispositivo(nombreDispositivo: string): ActivoComponent | null {
        for (const [, container] of this.ecsManager.getEntidades()) {
            const dispositivo = container.get(DispositivoComponent);
            if (dispositivo?.nombre === nombreDispositivo) {
                return container.get(ActivoComponent) || null;
            }
        }
        return null;
    }
}
