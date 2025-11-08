import type { RouterComponent } from "../../components";
import type { ConfiguracionFirewall, DireccionTrafico } from "../../../types/FirewallTypes";
import type { TipoProtocolo } from "../../../types/TrafficEnums";
import type { ConectividadService } from "./ConectividadService";
import type { EventoRedService } from "./EventoRedService";

/**
 * Servicio responsable de validar y evaluar firewalls
 */
export class FirewallService {
    constructor(
        private conectividadService: ConectividadService,
        private eventoService: EventoRedService
    ) {}

    // Valida si el tráfico pasa los firewalls de origen y destino
     
    validarFirewall(
        nombreOrigen: string,
        nombreDestino: string,
        protocolo: TipoProtocolo
    ): boolean {
        const routers = this.conectividadService.obtenerRoutersDeRed(nombreOrigen, nombreDestino);
        
        // Si no hay routers con firewall, permitir tráfico
        if (routers.length === 0) {
            return true;
        }

        // Obtener routers únicos del origen y destino (puede haber overlap)
        const routerOrigen = this.conectividadService.obtenerRouterDelDispositivo(nombreOrigen);
        const routerDestino = this.conectividadService.obtenerRouterDelDispositivo(nombreDestino);

        // Caso 1: Ambos dispositivos en el mismo router
        if (routerOrigen && routerDestino && routerOrigen === routerDestino) {
            return this.evaluarFirewallDeRouter(routerOrigen, nombreOrigen, nombreDestino, protocolo);
        }

        // Caso 2: Dispositivos en routers diferentes (tráfico pasa por ambos)
        let permitido = true;

        // Evaluar firewall del router de ORIGEN (SALIENTE)
        if (routerOrigen) {
            const permitidoSaliente = this.evaluarFirewallDeRouter(
                routerOrigen, 
                nombreOrigen, 
                nombreDestino, 
                protocolo
            );
            
            if (!permitidoSaliente) {
                this.eventoService.emitirEventoBloqueado(nombreOrigen, nombreDestino, protocolo, 'Router origen');
                return false;
            }
        }

        // Evaluar firewall del router de DESTINO (ENTRANTE)
        if (routerDestino && routerOrigen !== routerDestino) {
            const permitidoEntrante = this.evaluarFirewallDeRouter(
                routerDestino, 
                nombreOrigen, 
                nombreDestino, 
                protocolo
            );
            
            if (!permitidoEntrante) {
                this.eventoService.emitirEventoBloqueado(nombreOrigen, nombreDestino, protocolo, 'Router destino');
                return false;
            }
        }

        // Si pasó ambos firewalls, emitir evento de éxito
        if (permitido) {
            this.eventoService.emitirEventoPermitido(nombreOrigen, nombreDestino, protocolo);
        }

        return permitido;
    }

    // Evalúa el firewall de un router específico
    evaluarFirewallDeRouter(
        router: RouterComponent,
        nombreOrigen: string,
        nombreDestino: string,
        protocolo: TipoProtocolo
    ): boolean {
        // Obtener las redes del router resolviendo las entidades
        const redes = this.conectividadService.obtenerRedesDelRouter(router);
        
        // Sin redes configuradas, permitir tráfico
        if (redes.length === 0) {
            return true;
        }

        // Buscar en qué redes están el origen y destino
        let origenEnRedInterna = false;
        let destinoEnRedInterna = false;
        let mismaRed = false;

        for (const red of redes) {
            const origenEnEstaRed = red.dispositivosConectados.includes(nombreOrigen);
            const destinoEnEstaRed = red.dispositivosConectados.includes(nombreDestino);
            
            if (origenEnEstaRed) origenEnRedInterna = true;
            if (destinoEnEstaRed) destinoEnRedInterna = true;
            
            // Si ambos están en la MISMA red, es tráfico local
            if (origenEnEstaRed && destinoEnEstaRed) {
                mismaRed = true;
                break;
            }
        }

        // Si AMBOS están en la misma red interna → Tráfico LOCAL, no aplica firewall
        if (mismaRed) {
            return true; // Permitir siempre tráfico interno en la misma red
        }
        if (!origenEnRedInterna && !destinoEnRedInterna) {
            return true; 
        }

        // Determinar dirección del tráfico (origen en red → SALIENTE, destino en red → ENTRANTE)
        const direccion = origenEnRedInterna ? 'SALIENTE' : 'ENTRANTE';

        return this.evaluarReglaFirewall(
            router.firewall, 
            protocolo, 
            nombreOrigen,
            direccion
        );
    }

    // Evalúa las reglas del firewall según protocolo, dispositivo y dirección
    evaluarReglaFirewall(
        firewall: ConfiguracionFirewall,
        protocolo: TipoProtocolo,
        nombreDispositivo: string,
        direccion: DireccionTrafico
    ): boolean {
        // Si el firewall está deshabilitado, permitir todo
        if (!firewall.habilitado) {
            return true;
        }

        // 1. Verificar si hay excepción específica para este dispositivo (máxima prioridad)
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

        // 2. Aplicar reglas globales del protocolo con dirección
        const reglasGlobales = firewall.reglasGlobales.get(protocolo);
        if (reglasGlobales && reglasGlobales.length > 0) {
            // Buscar regla que coincida con la dirección del tráfico
            const reglaAplicable = reglasGlobales.find(regla => 
                this.coincideDireccion(regla.direccion, direccion)
            );
            
            if (reglaAplicable) {
                return reglaAplicable.accion === 'PERMITIR';
            }
        }

        // 3. Aplicar política por defecto según dirección (menor prioridad)
        return this.aplicarPoliticaPorDefecto(firewall, direccion);
    }

    // Verifica si la dirección de la regla coincide con la del tráfico
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
