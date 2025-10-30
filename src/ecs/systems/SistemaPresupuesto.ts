import { Sistema, type Entidad } from "../core";
import { WorkstationComponent, PresupuestoComponent, DispositivoComponent } from "../components";

export class SistemaPresupuesto extends Sistema {
  public componentesRequeridos = new Set([PresupuestoComponent]);

  public toggleConfiguracionWorkstation(
    entidadPresupuesto: Entidad,
    entidadWorkstation: Entidad,
    config: string
  ) {
    const componentesEntidadWorkstation =
      this.ecsManager.getComponentes(entidadWorkstation);
    const componenteConfigWorkstaion =
      componentesEntidadWorkstation?.get(WorkstationComponent);
    const listaConfigsWorkstation = componenteConfigWorkstaion?.configuraciones;

    if (!listaConfigsWorkstation)
      throw new Error(
        `No existe lista de configuraciones en la Entidad ${entidadWorkstation}`
      );
    for (let i = 0; i < listaConfigsWorkstation.length; i++) {
      if (listaConfigsWorkstation[i].nombreConfig != config) continue;
     
      // Al hacer click, primero se verifica si la config está desactivada
      if (!listaConfigsWorkstation[i].activado){
        if(this.hayPresupuestoSuficiente(entidadPresupuesto,
                                    listaConfigsWorkstation[i].costoActivacion)){
          // Aquí recién se hace el toggle
          listaConfigsWorkstation[i].activado = !listaConfigsWorkstation[i].activado;
          
          this.ecsManager
            .getComponentes(entidadPresupuesto)!
            .get(PresupuestoComponent).monto -=
            listaConfigsWorkstation[i].costoActivacion;
        }else break;
        
        this.ecsManager.registrarAccion("Click",
                                        "Configuracion Workstation",
                                        -1,
                                        { nombreConfig: listaConfigsWorkstation[i].nombreConfig,
                                          dispositivoAAtacar: componentesEntidadWorkstation?.get(DispositivoComponent).nombre,
                                          activado: listaConfigsWorkstation[i].activado
                                        });
        break;
      // Caso contrario significa que está activada
      }else{
        if(this.hayPresupuestoSuficiente(entidadPresupuesto,
                                    listaConfigsWorkstation[i].costoActivacion*0.5)){
          
          listaConfigsWorkstation[i].activado = !listaConfigsWorkstation[i].activado; 
          
          this.ecsManager
            .getComponentes(entidadPresupuesto)!
            .get(PresupuestoComponent).monto -=
            listaConfigsWorkstation[i].costoActivacion * 0.5;
        }else break;

        this.ecsManager.registrarAccion("Click",
                                        "Configuracion Workstation",
                                        -1,
                                        { nombreConfig: listaConfigsWorkstation[i].nombreConfig,
                                          dispositivoAAtacar: componentesEntidadWorkstation?.get(DispositivoComponent).nombre,
                                          activado: listaConfigsWorkstation[i].activado
                                        });
        break;
      }
    }
    this.ecsManager.emit("presupuesto:actualizado", {
      presupuesto: this.ecsManager
        .getComponentes(entidadPresupuesto)!
        .get(PresupuestoComponent).monto,
    });
    this.notificarPresupuestoAgotado(entidadPresupuesto);
  }

  private hayPresupuestoSuficiente(entidadPresupuesto: Entidad, montoAProcesar: number): boolean{
    const presupuestoActual = this.ecsManager.getComponentes(entidadPresupuesto)!
                                             .get(PresupuestoComponent).monto;
    
    if(montoAProcesar > presupuestoActual) return false;
    
    return true;    
  }

  private notificarPresupuestoAgotado(entidadPresupuesto: Entidad): void {
    if (this.ecsManager
        .getComponentes(entidadPresupuesto)!
        .get(PresupuestoComponent).monto == 0)
      this.ecsManager.emit("presupuesto:agotado");
  }
}
