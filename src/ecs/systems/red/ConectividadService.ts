import type { ECSManager } from "../../core/ECSManager";
import { RouterComponent, RedComponent } from "../../components";

// Servicio encargado de gestionar la conectividad entre dispositivos y redes
export class ConectividadService {
    constructor(private ecsManager: ECSManager) {}

    obtenerRedesDelRouter(router: RouterComponent): RedComponent[] {
        const redes: RedComponent[] = [];
        for (const redId of router.redesIds) {
            const red = this.ecsManager.getEntidades().get(redId)?.get(RedComponent);
            if (red) {
                redes.push(red);
            }
        }
        return redes;
    }

    // Verifica si dos dispositivos están conectados (pueden comunicarse)
    // Casos: misma red, uno interno + router internet, dos redes con internet
    estanConectados(nombreDispOrigen: string, nombreDispDestino: string): boolean {
        const redes = this.getRedes();
        
        // Caso 1: Ambos en la misma red interna
        const mismaRed = redes.some((red) => 
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

    // Obtiene los routers que gestionan la comunicación entre dos dispositivos
    obtenerRoutersDeRed(nombreDisp1: string, nombreDisp2: string): RouterComponent[] {
        const routersAplicables: RouterComponent[] = [];
        
        for (const container of this.ecsManager.getEntidades().values()) {
            const router = container.get(RouterComponent);
            if (!router) continue;
            
            const redes = this.obtenerRedesDelRouter(router);
            
            // Buscar en todas las redes del router
            for (const red of redes) {
                const disp1EnRed = red.dispositivosConectados.includes(nombreDisp1);
                const disp2EnRed = red.dispositivosConectados.includes(nombreDisp2);
            
                // Caso 1: Ambos dispositivos están en la misma red
                if (disp1EnRed && disp2EnRed) {
                    routersAplicables.push(router);
                    break; // Ya encontramos una red con ambos, no seguir buscando en este router
                }
                
                // Caso 2: Uno está en red y otro externo, y el router tiene Internet
                if ((disp1EnRed || disp2EnRed) && !(disp1EnRed && disp2EnRed) && router.conectadoAInternet) {
                    routersAplicables.push(router);
                    break; // Ya agregamos este router
                }
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
            const router = container.get(RouterComponent);
            if (!router) continue;
            
            const redes = this.obtenerRedesDelRouter(router);
            
            // Buscar en todas las redes del router
            for (const red of redes) {
                if (red.dispositivosConectados.includes(nombreDispositivo)) {
                    return { router, red };
                }
            }
        }
        return null;
    }

    // Obtiene la red donde está un dispositivo en un router específico
    obtenerRedDelRouter(router: RouterComponent, nombreDispositivo?: string): RedComponent | null {
        const redes = this.obtenerRedesDelRouter(router);
        
        // Si se proporciona nombre de dispositivo, buscar su red específica
        if (nombreDispositivo) {
            return redes.find(red => 
                red.dispositivosConectados.includes(nombreDispositivo)
            ) || null;
        }
        
        // Si no, devolver la primera red (compatibilidad con código antiguo)
        return redes[0] || null;
    }

    // Obtiene todas las redes del escenario (de todos los routers)
    private getRedes(): RedComponent[] {
        const redes: RedComponent[] = [];
        this.ecsManager.getEntidades().forEach((container) => {
            const router = container.get(RouterComponent);
            if (router) {
                const redesDelRouter = this.obtenerRedesDelRouter(router);
                redes.push(...redesDelRouter);
            }
        });
        return redes;
    }
}
