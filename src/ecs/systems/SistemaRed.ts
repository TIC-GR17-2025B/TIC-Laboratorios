import { ActivoComponent, DispositivoComponent } from "../components";
import { RedComponent } from "../components";
import { Sistema } from "../core";
import type { TipoProtocolo, RegistroTrafico } from "../../types/TrafficEnums";
import { PROTOCOLOS } from "../../types/TrafficEnums";
import { EventosRed } from "../../types/EventosEnums";
import type { Activo } from "../../types/EscenarioTypes";

export class SistemaRed extends Sistema {
    public componentesRequeridos = new Set([ActivoComponent, RedComponent]);

    public asignarRed(nombreDisp: string, nombreRed: string): void {
        // Obtenemos la red
        let red;
        for (const [,c] of this.ecsManager.getEntidades()) {
            if (c.get(RedComponent)?.nombre == nombreRed) {
                red = c.get(RedComponent);
                break;
            }
        }

        // Verificamos que el dispositivo no esté en la red
        if(red?.dispositivosConectados.some((d) => d == nombreDisp)){
            console.warn(`El dispositivo ${nombreDisp} ya se encuentra conectado a la red ${nombreRed}`);
            return;
        }

        red?.dispositivosConectados.push(nombreDisp);
    }

    public enviarActivo(dispEnvio: string, dispReceptor: string, activo: string): void {
        // Verificar conectividad
        if (!this.estanConectados(dispEnvio, dispReceptor)) {
            console.log("El dispositivo receptor no está conectado a una red del dispositivo de envío");
            return;
        }

        // Obtener lista de activos del receptor
        let activosDispR;
        for (const [,c] of this.ecsManager.getEntidades()) {
            if (c.get(DispositivoComponent)?.nombre == dispReceptor) {
                activosDispR = c.get(ActivoComponent)?.activos;
                break;
            }
        }

        if (!activosDispR) {
            console.log("El dispositivo receptor no tiene componente de activos");
            return;
        }

        // Obtener el objeto activo del emisor
        let activoAenviar: Activo;
        for (const [,c] of this.ecsManager.getEntidades()) {
            if (c.get(DispositivoComponent)?.nombre == dispEnvio) {
                activoAenviar = c.get(ActivoComponent)?.activos.find((a) => a.nombre == activo)!;
                break;
            }
        }

        // Verificar si el receptor ya tiene el activo
        if (activosDispR.some(a => a.nombre === activoAenviar.nombre &&
                                   a.contenido === activoAenviar.contenido)) {
            console.log("El dispositivo receptor ya contiene activo:", activo);
            return;
        }
 
        // Transferir activo
        activosDispR.push(activoAenviar!);

        this.ecsManager.emit(EventosRed.RED_ACTIVO_ENVIADO, {
            nombreActivo: activo,
            d1: dispEnvio,
            d2: dispReceptor
        });
    }

    public enviarTrafico(
        entidadOrigen: number,
        entidadDestino: number,
        protocolo: TipoProtocolo
    ): boolean {
        // Obtener dispositivos
        const dispOrigen = this.getDispositivo(entidadOrigen);
        const dispDestino = this.getDispositivo(entidadDestino);
        // Podría eliminarse si se asume que las entidades siempre son válidas
        if (!dispOrigen || !dispDestino) {
            console.log("Dispositivos no encontrados");
            return false;
        }

        // Verificar conectividad
        if (!this.estanConectados(dispOrigen.nombre, dispDestino.nombre)) {
            console.log(`${dispOrigen.nombre} y ${dispDestino.nombre} no están en la misma red`);
            return false;
        }

        // Tráfico exitoso
        this.mostrarInfoTrafico(dispOrigen.nombre, dispDestino.nombre, protocolo);
        this.registrarTrafico(dispOrigen.nombre, dispDestino.nombre, protocolo);
        
        return true;
    }

    private getRedes(): RedComponent[] {
        const redes: RedComponent[] = [];
        this.ecsManager.getEntidades().forEach((container) => {
            if(container.tiene(RedComponent)) redes.push(container.get(RedComponent)!)
        });
        return redes;
    }

    private getDispositivo(entidadId: number): DispositivoComponent | null {
        const componentes = this.ecsManager.getComponentes(entidadId);
        return componentes?.get(DispositivoComponent) || null;
    }

    private estanConectados(nombreDispOrigen: string, nombreDispDestino: string): boolean {
        const redes = this.getRedes();
        
        return redes.some((red: RedComponent) => 
            red.dispositivosConectados.includes(nombreDispOrigen) &&
            red.dispositivosConectados.includes(nombreDispDestino)
        );
    }
    private mostrarInfoTrafico(
        nombreOrigen: string,
        nombreDestino: string,
        protocolo: TipoProtocolo
    ): void {
        const protocoloInfo = PROTOCOLOS[protocolo];
        console.log(
            `Tráfico ${protocolo}: ${nombreOrigen} → ${nombreDestino} (puerto ${protocoloInfo.puerto})`
        );
    }

    private registrarTrafico(
        origen: string,
        destino: string,
        protocolo: TipoProtocolo
    ): void {
        const registro: RegistroTrafico = {
            origen,
            destino,
            protocolo
        };

        this.ecsManager.emit(EventosRed.TRAFICO_ENVIADO, registro);
    }
}
