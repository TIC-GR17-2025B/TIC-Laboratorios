import type { ECSManager } from "../../core/ECSManager";
import { RedComponent, RouterComponent } from "../../components";

/**
 * Servicio responsable de verificar conectividad entre dispositivos
 */
export class ConectividadService {
    constructor(private ecsManager: ECSManager) {}

    /**
     * Verifica si dos dispositivos están conectados (pueden comunicarse)
     * Casos: misma red, uno interno + router internet, dos redes con internet
     */
    estanConectados(nombreDispOrigen: string, nombreDispDestino: string): boolean {
        const redes = this.getRedes();
        
        // Caso 1: Ambos en la misma red interna
        const mismaRed = redes.some((red: RedComponent) => 
            red.dispositivosConectados.includes(nombreDispOrigen) &&
            red.dispositivosConectados.includes(nombreDispDestino)
        );
        
        if (mismaRed) {
            return true;
        }
        
        // Caso 2: Uno interno y otro externo - verificar si hay router con Internet
        const origenEnRed = redes.some(red => red.dispositivosConectados.includes(nombreDispOrigen));
        const destinoEnRed = redes.some(red => red.dispositivosConectados.includes(nombreDispDestino));
        
        // Si uno está en red y otro no, verificar router con Internet
        if (origenEnRed !== destinoEnRed) {
            const dispositivoInterno = origenEnRed ? nombreDispOrigen : nombreDispDestino;
            const resultado = this.buscarRouterConDispositivo(dispositivoInterno);
            
            if (resultado?.router.conectadoAInternet) {
                return true; // Router con Internet permite acceso externo
            }
        }
        
        // Caso 3: Ambos en redes diferentes - verificar si ambos tienen routers con Internet
        if (origenEnRed && destinoEnRed) {
            const routerOrigen = this.buscarRouterConDispositivo(nombreDispOrigen);
            const routerDestino = this.buscarRouterConDispositivo(nombreDispDestino);
            
            // Si ambos routers tienen internet, pueden comunicarse a través de internet
            if (routerOrigen?.router.conectadoAInternet && routerDestino?.router.conectadoAInternet) {
                return true;
            }
        }
        
        return false;
    }

    //Obtiene los routers que gestionan la comunicación entre dos dispositivos

    obtenerRoutersDeRed(nombreDisp1: string, nombreDisp2: string): RouterComponent[] {
        const routersAplicables: RouterComponent[] = [];
        
        for (const container of this.ecsManager.getEntidades().values()) {
            const red = container.get(RedComponent);
            const router = container.get(RouterComponent);
            
            if (!router || !red) continue;
            
            const disp1EnRed = red.dispositivosConectados.includes(nombreDisp1);
            const disp2EnRed = red.dispositivosConectados.includes(nombreDisp2);
        
            // Caso 1: Ambos dispositivos están en la misma red
            if (disp1EnRed && disp2EnRed) {
                routersAplicables.push(router);
                continue;
            }
            
            // Caso 2: Uno está en red y otro externo, y el router tiene Internet
            if ((disp1EnRed || disp2EnRed) && !(disp1EnRed && disp2EnRed) && router.conectadoAInternet) {
                routersAplicables.push(router);
            }
        }
        
        return routersAplicables;
    }

    // Obtiene el router que gestiona un dispositivo específico
    obtenerRouterDelDispositivo(nombreDispositivo: string): RouterComponent | null {
        return this.buscarRouterConDispositivo(nombreDispositivo)?.router || null;
    }

    // Busca un router que tenga conectado un dispositivo específico
    buscarRouterConDispositivo(nombreDispositivo: string): { router: RouterComponent; red: RedComponent } | null {
        for (const container of this.ecsManager.getEntidades().values()) {
            const red = container.get(RedComponent);
            const router = container.get(RouterComponent);
            
            if (red?.dispositivosConectados.includes(nombreDispositivo) && router) {
                return { router, red };
            }
        }
        return null;
    }

    // Obtiene la red asociada a un router
    obtenerRedDelRouter(router: RouterComponent): RedComponent | null {
        for (const container of this.ecsManager.getEntidades().values()) {
            if (container.get(RouterComponent) === router) {
                return container.get(RedComponent) || null;
            }
        }
        return null;
    }

    // Obtiene todas las redes del escenario
    private getRedes(): RedComponent[] {
        const redes: RedComponent[] = [];
        this.ecsManager.getEntidades().forEach((container) => {
            if(container.tiene(RedComponent)) redes.push(container.get(RedComponent)!)
        });
        return redes;
    }
}
