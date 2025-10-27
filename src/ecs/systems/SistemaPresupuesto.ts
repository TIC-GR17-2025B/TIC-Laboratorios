import { Sistema, type Entidad } from "../core";
import { WorkstationComponent, PresupuestoComponent } from "../components";
import { ConfiguracionWorkstation } from "../../data/configuraciones/configWorkstation";

export class SistemaPresupuesto extends Sistema {
    public componentesRequeridos = new Set([PresupuestoComponent]);

    public actualizar(entidades: Set<Entidad>): void {
        console.log("SistemaPresupuesto: actualizar. Entidades", entidades.size);
    }

    public toggleConfiguracionWorkstation(entidadPresupuesto: Entidad, entidadWorkstation: Entidad,
                                config: ConfiguracionWorkstation){
        const componentesEntidadWorkstation = this.ecsManager.getComponentes(entidadWorkstation);
        const componenteConfigWorkstaion = componentesEntidadWorkstation?.get(WorkstationComponent);
        const listaConfigsWorkstation = componenteConfigWorkstaion?.configuraciones;
        
        if(!listaConfigsWorkstation) throw new Error(`No existe lista de configuraciones en la Entidad ${entidadWorkstation}`);

        for (let i = 0; i < listaConfigsWorkstation.length; i++){
            if(listaConfigsWorkstation[i].configuracion != config) continue;
            
            listaConfigsWorkstation[i].activado = !listaConfigsWorkstation[i].activado
            
            // Si al hacer toggle se pone en activado
            if(listaConfigsWorkstation[i].activado) this.ecsManager.getComponentes(entidadPresupuesto)!.get(PresupuestoComponent).monto -= listaConfigsWorkstation[i].costoActivacion;
            // Caso contrario significa que se desactivó
            else this.ecsManager.getComponentes(entidadPresupuesto)!.get(PresupuestoComponent).monto -= listaConfigsWorkstation[i].costoDesactivacion;
        }      
    }

}
