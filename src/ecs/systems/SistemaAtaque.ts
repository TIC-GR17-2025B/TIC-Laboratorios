import { EstadoAtaqueDispositivo } from "../../types/DeviceEnums";
import { AtaqueComponent, DispositivoComponent } from "../components";
import { Sistema, type Entidad } from "../core";

export class SistemaAtaque extends Sistema {
    public componentesRequeridos: Set<Function> = new Set([AtaqueComponent]);

    public actualizar(entidades: Set<Entidad>): void {
        //
    }

    public on(eventName: string, callback: (data: any) => void): () => void {
        return this.ecsManager.on(eventName, callback);
    }

    public ejecutarAtaque(entidadDispositivo: Entidad, ataque: AtaqueComponent): void {
        const container3 = this.ecsManager.getComponentes(entidadDispositivo);
        if(!container3) return;
        const dispositivoAAtacar = container3.get(DispositivoComponent);

        if(!this.ecsManager.consultarAccion(ataque.condicionMitigacion.accion,
                                         ataque.condicionMitigacion.objeto,
                                         ataque.condicionMitigacion.tiempo!,
                                         ataque.condicionMitigacion.val
                                        )){ 
            dispositivoAAtacar.estadoAtaque = EstadoAtaqueDispositivo.COMPROMETIDO;
            this.ecsManager.emit("ataque:ataqueRealizado", { ataque });
        }else{
            this.ecsManager.emit("ataque:ataqueMitigado", { ataque });
        }
    }

    public verificarMitigacionAtaque(ataque: any) {
        ataque.condicionMitigacion = true;
    }
}
