import { ActivoComponent, DispositivoComponent } from "../components";
import { Sistema } from "../core";

export class SistemaRed extends Sistema {
    public componentesRequeridos = new Set([ActivoComponent]);
    
    public enviarActivo(entidadDispEnvio: number, entidadDispReceptor: number, activo: any) {
        const c1 = this.ecsManager.getComponentes(entidadDispEnvio);
        const redesDispE = c1?.get(DispositivoComponent).redes;

        const c2 = this.ecsManager.getComponentes(entidadDispReceptor);
        const redesDispR = c2?.get(DispositivoComponent).redes;
        const activosDispR = c2?.get(ActivoComponent).activos;

        // Verificamos que el receptor esté también conectado en al menos una red del de envío
        if (!redesDispE?.some(red => redesDispR?.includes(red))){
            console.log("El dispositivo receptor no está conectado a una red del dispositivo de envío");
            return;
        }

        // Verificamos si el receptor ya tiene el activo, si lo tiene entonces no se hace nada
        // (De momento así porque no le veo algo útil en que tenga copias del mismo activo)
        if (activosDispR?.some(a => a.nombre === activo.nombre && a.contenido === activo.contenido)){
            console.log("El dispositivo receptor ya contiene activo:", activo.nombre);
            return;
        }
         
        activosDispR?.push(activo);

        this.ecsManager.emit("red:activoEnviado", {
            nombreActivo: activo.nombre,
            d1: c1?.get(DispositivoComponent).nombre,
            d2: c2?.get(DispositivoComponent).nombre
        });
    }
}
