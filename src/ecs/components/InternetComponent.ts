import { Componente, /*type Entidad*/ } from "../core";

export class InternetComponent extends Componente {
    constructor(
        // public dispositivosConectados: Entidad[] // Lista de dispositivos tipo gateway (routers o VPNs) conectados al internet  
        // Le tenía definido pero creo que es más sencillo poner un boolean en el dispositivo para verificar la conexión a internet
        // Le dejo comentado por si acaso
        
        // public activos: Array<Activo> = [] // Posiblemente para simular descargas de internet
    ){
        super();
    }
}
