import { RouterComponent, DispositivoComponent } from "../../components";
import type { ConfiguracionFirewall, DireccionTrafico } from "../../../types/FirewallTypes";
import type { TipoProtocolo } from "../../../types/TrafficEnums";
import type { ConectividadService } from "./ConectividadService";
import type { EventoRedService } from "./EventoRedService";
import type { Entidad } from "../../core";
import type { ECSManager } from "../../core/ECSManager";


export class FirewallService {
    constructor(
        private conectividadService: ConectividadService,
        private eventoService: EventoRedService,
        private ecsManager: ECSManager
    ) {}

    // Valida si el tráfico pasa los firewalls de origen y destino
    validarFirewall(
        entidadOrigen: Entidad,
        entidadDestino: Entidad,
        protocolo: TipoProtocolo
    ): boolean {
        const routers = this.conectividadService.obtenerRoutersDeRed(entidadOrigen, entidadDestino);
        
        // Si no hay routers con firewall, permitir tráfico
        if (routers.length === 0) {
            return true;
        }

        // Obtener información completa de routers (componente + zona)
        const infoRouterOrigen = this.conectividadService.buscarRouterConDispositivo(entidadOrigen);
        const infoRouterDestino = this.conectividadService.buscarRouterConDispositivo(entidadDestino);

        // Obtener nombres de dispositivos para eventos
        const dispOrigen = this.ecsManager.getComponentes(entidadOrigen)?.get(DispositivoComponent);
        const dispDestino = this.ecsManager.getComponentes(entidadDestino)?.get(DispositivoComponent);
        const nombreOrigen = dispOrigen?.nombre || 'origen';
        const nombreDestino = dispDestino?.nombre || 'destino';

        // Caso 1: Ambos dispositivos en el mismo router
        if (infoRouterOrigen && infoRouterDestino && infoRouterOrigen.zonaId === infoRouterDestino.zonaId) {
            // Encontrar la entidad del router
            const entidadRouter = this.encontrarEntidadRouter(infoRouterOrigen.router);
            if (entidadRouter) {
                return this.evaluarFirewallDeRouter(entidadRouter, infoRouterOrigen.router, entidadOrigen, entidadDestino, protocolo);
            }
            return true;
        }

        // Caso 2: Dispositivos en routers diferentes (tráfico pasa por ambos)
        let permitido = true;

        // Evaluar firewall del router de ORIGEN (SALIENTE)
        if (infoRouterOrigen) {
            const entidadRouterOrigen = this.encontrarEntidadRouter(infoRouterOrigen.router);
            if (entidadRouterOrigen) {
                const permitidoSaliente = this.evaluarFirewallDeRouter(
                    entidadRouterOrigen,
                    infoRouterOrigen.router, 
                    entidadOrigen, 
                    entidadDestino, 
                    protocolo
                );
                
                if (!permitidoSaliente) {
                    this.eventoService.emitirEventoBloqueado(nombreOrigen, nombreDestino, protocolo, 'Router origen', entidadRouterOrigen);
                    return false;
                }
            }
        }

        // Evaluar firewall del router de DESTINO (ENTRANTE)
        if (infoRouterDestino && (!infoRouterOrigen || infoRouterOrigen.zonaId !== infoRouterDestino.zonaId)) {
            const entidadRouterDestino = this.encontrarEntidadRouter(infoRouterDestino.router);
            if (entidadRouterDestino) {
                const permitidoEntrante = this.evaluarFirewallDeRouter(
                    entidadRouterDestino,
                    infoRouterDestino.router, 
                    entidadOrigen, 
                    entidadDestino, 
                    protocolo
                );
                
                if (!permitidoEntrante) {
                    this.eventoService.emitirEventoBloqueado(nombreOrigen, nombreDestino, protocolo, 'Router destino', entidadRouterDestino);
                    return false;
                }
            }
        }

        // Si pasó ambos firewalls, emitir evento de éxito
        // Emitir con la entidad del router correspondiente (preferir router de destino si existe)
        let entidadRouterPermitido: Entidad | null = null;
        if (infoRouterDestino) {
            entidadRouterPermitido = this.encontrarEntidadRouter(infoRouterDestino.router);
        } else if (infoRouterOrigen) {
            entidadRouterPermitido = this.encontrarEntidadRouter(infoRouterOrigen.router);
        }
        
        if (permitido) {
            this.eventoService.emitirEventoPermitido(nombreOrigen, nombreDestino, protocolo, entidadRouterPermitido ?? undefined);
        }

        return permitido;
    }

    private encontrarEntidadRouter(routerComponent: RouterComponent): Entidad | null {
        for (const [entidad, container] of this.ecsManager.getEntidades()) {
            const router = container.get(RouterComponent);
            if (router === routerComponent) {
                return entidad;
            }
        }
        return null;
    }

    evaluarFirewallDeRouter(
        entidadRouter: Entidad,
        router: RouterComponent,
        entidadOrigen: Entidad,
        entidadDestino: Entidad,
        protocolo: TipoProtocolo
    ): boolean {
        const redesOrigen = this.conectividadService['obtenerRedesDelDispositivo'](entidadOrigen);
        const redesDestino = this.conectividadService['obtenerRedesDelDispositivo'](entidadDestino);
        
        const redesRouter = this.conectividadService['obtenerRedesDelDispositivo'](entidadRouter);
        
        if (redesOrigen.length === 0 && redesDestino.length === 0) {
            return true;
        }

        const mismaRed = redesOrigen.some(redOrigen => redesDestino.includes(redOrigen));
        
        if (mismaRed) {
            return true; 
        }


        const origenEnEsteRouter = redesOrigen.some(red => redesRouter.includes(red));
        const destinoEnEsteRouter = redesDestino.some(red => redesRouter.includes(red));
        
        let direccion: DireccionTrafico;
        if (origenEnEsteRouter && !destinoEnEsteRouter) {
            direccion = 'SALIENTE'; 
        } else if (!origenEnEsteRouter && destinoEnEsteRouter) {
            direccion = 'ENTRANTE'; 
        } else if (origenEnEsteRouter && destinoEnEsteRouter) {
           
            direccion = 'SALIENTE'; // Por defecto
        } else {
            return true;
        }
        const dispOrigen = this.ecsManager.getComponentes(entidadOrigen)?.get(DispositivoComponent);
        const nombreDispositivo = dispOrigen?.nombre || 'dispositivo';

        return this.evaluarReglaFirewall(
            router.firewall, 
            protocolo, 
            nombreDispositivo,
            direccion
        );
    }

    evaluarReglaFirewall(
        firewall: ConfiguracionFirewall,
        protocolo: TipoProtocolo,
        nombreDispositivo: string,
        direccion: DireccionTrafico
    ): boolean {
        if (!firewall.habilitado) {
            return true;
        }

        const excepciones = firewall.excepciones.get(protocolo);
        if (excepciones) {
            const excepcion = excepciones.find(r => 
                r.nombreDispositivo === nombreDispositivo &&
                this.coincideDireccion(r.direccion, direccion)
            );
            if (excepcion) {
                return excepcion.accion === 'PERMITIR';
            }
        }

        const reglasGlobales = firewall.reglasGlobales.get(protocolo);
        if (reglasGlobales && reglasGlobales.length > 0) {
            const reglaAplicable = reglasGlobales.find(regla => 
                this.coincideDireccion(regla.direccion, direccion)
            );
            
            if (reglaAplicable) {
                return reglaAplicable.accion === 'PERMITIR';
            }
        }

        return this.aplicarPoliticaPorDefecto(firewall, direccion);
    }

    private coincideDireccion(
        direccionRegla: DireccionTrafico,
        direccionTrafico: DireccionTrafico
    ): boolean {
        return direccionRegla === 'AMBAS' || direccionRegla === direccionTrafico;
    }

    // Aplica la política por defecto del firewall según dirección
    private aplicarPoliticaPorDefecto(
        firewall: ConfiguracionFirewall,
        direccion: DireccionTrafico
    ): boolean {
        // Usar política específica si existe, sino usar política general
        if (direccion === 'SALIENTE' && firewall.politicaPorDefectoSaliente) {
            return firewall.politicaPorDefectoSaliente === 'PERMITIR';
        }
        
        if (direccion === 'ENTRANTE' && firewall.politicaPorDefectoEntrante) {
            return firewall.politicaPorDefectoEntrante === 'PERMITIR';
        }
        
        // Política general por defecto
        return firewall.politicaPorDefecto === 'PERMITIR';
    }
}