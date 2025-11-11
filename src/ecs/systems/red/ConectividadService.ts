import type { ECSManager } from "../../core/ECSManager";
import { RouterComponent, RedComponent, ZonaComponent, DispositivoComponent } from "../../components";
import type { Entidad } from "../../core/Componente";
import { SistemaRelaciones } from "../SistemaRelaciones";


export class ConectividadService {
    constructor(private ecsManager: ECSManager) {}


    public obtenerRedesDeZona(zonaEntidad: Entidad): Entidad[] {
        const sistemasArray = Array.from(this.ecsManager.getSistemas().keys());
        const sistemasRelaciones = sistemasArray.filter((s): s is SistemaRelaciones => s instanceof SistemaRelaciones);
        for (const sistema of sistemasRelaciones) {
            const hijos = sistema.obtenerHijos(zonaEntidad);
            if (hijos.length > 0) {
                const primerHijo = this.ecsManager.getComponentes(hijos[0])?.get(RedComponent);
                if (primerHijo) {
                    return hijos; 
                }
            }
        }
        
        return [];
    }

    private obtenerRedesDelDispositivo(entidadDispositivo: Entidad): Entidad[] {
        const disp = this.ecsManager.getComponentes(entidadDispositivo)?.get(DispositivoComponent);
        return disp?.redes || [];
    }

    private compartanRed(entidadDisp1: Entidad, entidadDisp2: Entidad): boolean {
        const redesDisp1 = this.obtenerRedesDelDispositivo(entidadDisp1);
        const redesDisp2 = this.obtenerRedesDelDispositivo(entidadDisp2);
        
        // Verificar si comparten alguna red
        return redesDisp1.some(red1 => redesDisp2.includes(red1));
    }

    /**
     * Verifica si dos dispositivos están conectados (pueden comunicarse)
     * Nueva arquitectura: Los dispositivos tienen referencias a redes (DispositivoComponent.redes)
     * 
     * Casos:
     * 1. Ambos en la misma red → Conectados
     * 2. Uno en red, otro externo + router con internet → Conectados
     * 3. Ambos en redes diferentes pero routers con internet → Conectados
     */
    estanConectados(entidadOrigen: Entidad, entidadDestino: Entidad): boolean {
        // Caso 1: Si comparten alguna red, están directamente conectados
        if (this.compartanRed(entidadOrigen, entidadDestino)) {
            return true;
        }
        
        // Caso 2 y 3: Verificar conectividad a través de routers con Internet
        const origenTieneRed = this.obtenerRedesDelDispositivo(entidadOrigen).length > 0;
        const destinoTieneRed = this.obtenerRedesDelDispositivo(entidadDestino).length > 0;
        
        // Si uno está en red y otro no, verificar si hay router con Internet
        if (origenTieneRed !== destinoTieneRed) {
            const entidadInterna = origenTieneRed ? entidadOrigen : entidadDestino;
            const routerInfo = this.buscarRouterConDispositivo(entidadInterna);
            
            if (routerInfo?.router.conectadoAInternet) {
                return true; // Router con Internet permite acceso externo
            }
        }
        
        // Si ambos están en redes diferentes, verificar si ambos tienen routers con Internet
        if (origenTieneRed && destinoTieneRed) {
            const routerOrigenInfo = this.buscarRouterConDispositivo(entidadOrigen);
            const routerDestinoInfo = this.buscarRouterConDispositivo(entidadDestino);
            
            // Si ambos routers tienen internet, pueden comunicarse a través de internet
            if (routerOrigenInfo?.router.conectadoAInternet && routerDestinoInfo?.router.conectadoAInternet) {
                return true;
            }
        }
        
        return false;
    }


    buscarRouterConDispositivo(entidadDispositivo: Entidad): { router: RouterComponent; zonaId: Entidad } | null {
        // 1. Obtener las redes del dispositivo
        const redesDelDispositivo = this.obtenerRedesDelDispositivo(entidadDispositivo);
        if (redesDelDispositivo.length === 0) return null;
        
        // 2. Encontrar la zona que contiene alguna de estas redes
        for (const [zonaEntidad, container] of this.ecsManager.getEntidades()) {
            const zona = container.get(ZonaComponent);
            if (!zona) continue;
            
            // Obtener las redes de esta zona usando SistemaRelaciones
            const redesZona = this.obtenerRedesDeZona(zonaEntidad);
            
            // Verificar si la zona contiene alguna red del dispositivo
            const zonaContieneDispositivo = redesZona.some(redId => 
                redesDelDispositivo.includes(redId)
            );
            
            if (!zonaContieneDispositivo) continue;
            
            // 3. Buscar el router en esta zona
            // El router es un dispositivo que tiene redes de esta zona
            for (const [routerEntidad, routerContainer] of this.ecsManager.getEntidades()) {
                const router = routerContainer.get(RouterComponent);
                if (!router) continue;
                
                // Verificar si este router tiene redes de esta zona
                const redesRouter = this.obtenerRedesDelDispositivo(routerEntidad);
                const routerEnZona = redesRouter.some(redId => redesZona.includes(redId));
                
                if (routerEnZona) {
                    return { router, zonaId: zonaEntidad };
                }
            }
        }
        
        return null;
    }

    obtenerRoutersDeRed(entidadDisp1: Entidad, entidadDisp2: Entidad): RouterComponent[] {
        const routersAplicables: RouterComponent[] = [];
        
        if (this.compartanRed(entidadDisp1, entidadDisp2)) {
            const routerInfo = this.buscarRouterConDispositivo(entidadDisp1);
            if (routerInfo) {
                routersAplicables.push(routerInfo.router);
            }
            return routersAplicables;
        }
        
        const routerDisp1 = this.buscarRouterConDispositivo(entidadDisp1);
        const routerDisp2 = this.buscarRouterConDispositivo(entidadDisp2);
        
        if (routerDisp1 && routerDisp1.router.conectadoAInternet) {
            routersAplicables.push(routerDisp1.router);
        }
        
        if (routerDisp2 && routerDisp2.router !== routerDisp1?.router && routerDisp2.router.conectadoAInternet) {
            routersAplicables.push(routerDisp2.router);
        }
        
        return routersAplicables;
    }
}
