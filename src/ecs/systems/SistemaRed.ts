import { ActivoComponent, DispositivoComponent, RouterComponent  } from "../components";
import { RedComponent } from "../components";
import { Sistema } from "../core";
import { TipoProtocolo } from "../../types/TrafficEnums";
import type { RegistroTrafico, RegistroFirewallBloqueado, RegistroFirewallPermitido } from "../../types/TrafficEnums";
import { EventosRed } from "../../types/EventosEnums";
import type { Activo } from "../../types/EscenarioTypes";
import type { ConfiguracionFirewall, DireccionTrafico } from "../../types/FirewallTypes";
export class SistemaRed extends Sistema {
    public componentesRequeridos = new Set([ActivoComponent, RedComponent]);

    public asignarRed(nombreDisp: string, nombreRed: string): void {
        // Obtenemos la red
        let red;
        for (const [,c] of this.ecsManager.getEntidades()) {
            if (c.get(RedComponent)?.nombre == nombreRed) {
                red = c.get(RedComponent);
                break;
            }
        }

        // Verificamos que el dispositivo no esté en la red
        if(red?.dispositivosConectados.some((d) => d == nombreDisp)){
            console.warn(`El dispositivo ${nombreDisp} ya se encuentra conectado a la red ${nombreRed}`);
            return;
        }

        red?.dispositivosConectados.push(nombreDisp);
    } 

    public enviarTrafico(
        dispOrigen: string,
        dispDestino: string,
        protocolo: TipoProtocolo,
        payload: unknown
    ): boolean {
        // Verificar conectividad
        if (!this.estanConectados(dispOrigen, dispDestino)) {
            console.log(`${dispOrigen} y ${dispDestino} no están en la misma red`);
            return false;
        }

        // Verificar firewall
        if (!this.validarFirewall(dispOrigen, dispDestino, protocolo)) {
            console.log(`Firewall bloqueó tráfico ${protocolo} desde ${dispOrigen}`);
            return false;
        }

        // Se verifica qué tipo de comunicación es y según eso se aplica el método correspondiente
        switch(protocolo){
            case TipoProtocolo.FTP: {
                const activo = payload as string;
                this.enviarActivo(dispOrigen, dispDestino, activo);
                break;
            }
            // Próximamente para otros protocolos
        }

        // Tráfico exitoso
        this.registrarTrafico(dispOrigen, dispDestino, protocolo);
        
        return true;
    }

    private enviarActivo(dispEnvio: string, dispReceptor: string, activo: string): void {
        // Obtener lista de activos del receptor
        let activosDispR;
        for (const [,c] of this.ecsManager.getEntidades()) {
            if (c.get(DispositivoComponent)?.nombre == dispReceptor) {
                activosDispR = c.get(ActivoComponent)?.activos;
                break;
            }
        }

        if (!activosDispR) {
            console.warn("El dispositivo receptor no tiene componente de activos");
            return;
        }

        // Obtener el objeto activo del emisor
        let activoAenviar: Activo;
        for (const [,c] of this.ecsManager.getEntidades()) {
            if (c.get(DispositivoComponent)?.nombre == dispEnvio) {
                activoAenviar = c.get(ActivoComponent)?.activos.find((a) => a.nombre == activo)!;
                break;
            }
        }

        // Verificar si el receptor ya tiene el activo
        if (activosDispR.some(a => a.nombre === activoAenviar.nombre &&
                                   a.contenido === activoAenviar.contenido)) {
            console.warn("El dispositivo receptor ya contiene activo:", activo);
            return;
        }
 
        // Transferir activo
        activosDispR.push(activoAenviar!);

        this.ecsManager.emit(EventosRed.RED_ACTIVO_ENVIADO, {
            nombreActivo: activo,
            d1: dispEnvio,
            d2: dispReceptor
        });
    }

    private getRedes(): RedComponent[] {
        const redes: RedComponent[] = [];
        this.ecsManager.getEntidades().forEach((container) => {
            if(container.tiene(RedComponent)) redes.push(container.get(RedComponent)!)
        });
        return redes;
    }

    private estanConectados(nombreDispOrigen: string, nombreDispDestino: string): boolean {
        const redes = this.getRedes();
        
        // Caso 1: Ambos en la misma red interna
        const mismaRed = redes.some((red: RedComponent) => 
            red.dispositivosConectados.includes(nombreDispOrigen) &&
            red.dispositivosConectados.includes(nombreDispDestino)
        );
        
        console.log("Llegó caso 1")
        if (mismaRed) {
            console.log("Verificó caso 1")
            return true;
        }
        
        // Caso 2: Uno interno y otro externo - verificar si hay router con Internet
        const origenEnRed = redes.some(red => red.dispositivosConectados.includes(nombreDispOrigen));
        const destinoEnRed = redes.some(red => red.dispositivosConectados.includes(nombreDispDestino));
       
        console.log("Llegó caso 2")
        // Si uno está en red y otro no, verificar router con Internet
        if (origenEnRed !== destinoEnRed) {
            // Buscar router con Internet en la red del dispositivo interno
            for (const container of this.ecsManager.getEntidades().values()) {
                const router = container.get(RouterComponent);
                const red = container.get(RedComponent);
                console.log(red?.nombre, red?.dispositivosConectados);
                
                if (router?.conectadoAInternet && red) {
                    // Verificar que el dispositivo interno esté en esta red
                    const dispositivoInterno = origenEnRed ? nombreDispOrigen : nombreDispDestino;
                    if (red.dispositivosConectados.includes(dispositivoInterno)) {
                        return true; // Router con Internet permite acceso externo
                    }
                }
            }
        }
       
        console.log("LLegó caso 3")
        // Caso 3: Ambos en redes diferentes - verificar si ambos tienen routers con Internet
        if (origenEnRed && destinoEnRed) {
            let routerOrigenTieneInternet = false;
            let routerDestinoTieneInternet = false;
            
            for (const container of this.ecsManager.getEntidades().values()) {
                const router = container.get(RouterComponent);
                const red = container.get(RedComponent);
                
                if (router?.conectadoAInternet && red) {
                    if (red.dispositivosConectados.includes(nombreDispOrigen)) {
                        routerOrigenTieneInternet = true;
                    }
                    if (red.dispositivosConectados.includes(nombreDispDestino)) {
                        routerDestinoTieneInternet = true;
                    }
                }
            }
           
            console.log("Llegó a ultimo if caso 3")
            // Si ambos routers tienen internet, pueden comunicarse a través de internet
            if (routerOrigenTieneInternet && routerDestinoTieneInternet) {
                return true;
            }
        }
        
        return false;
    }

    private validarFirewall(
        nombreOrigen: string,
        nombreDestino: string,
        protocolo: TipoProtocolo
    ): boolean {
        const routers = this.obtenerRoutersDeRed(nombreOrigen, nombreDestino);
        
        // Si no hay routers con firewall, permitir tráfico
        if (routers.length === 0) {
            return true;
        }

        // Obtener routers únicos del origen y destino (puede haber overlap)
        const routerOrigen = this.obtenerRouterDelDispositivo(nombreOrigen);
        const routerDestino = this.obtenerRouterDelDispositivo(nombreDestino);

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
                this.emitirEventoBloqueado(nombreOrigen, nombreDestino, protocolo, 'Router origen');
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
                this.emitirEventoBloqueado(nombreOrigen, nombreDestino, protocolo, 'Router destino');
                return false;
            }
        }

        // Si pasó ambos firewalls, emitir evento de éxito
        if (permitido) {
            this.emitirEventoPermitido(nombreOrigen, nombreDestino, protocolo);
        }

        return permitido;
    }

    private obtenerRouterDelDispositivo(nombreDispositivo: string): RouterComponent | null {
        for (const container of this.ecsManager.getEntidades().values()) {
            const red = container.get(RedComponent);
            const router = container.get(RouterComponent);
            
            if (red?.dispositivosConectados.includes(nombreDispositivo) && router) {
                return router;
            }
        }
        
        return null;
    }


    private evaluarFirewallDeRouter(
        router: RouterComponent,
        nombreOrigen: string,
        nombreDestino: string,
        protocolo: TipoProtocolo
    ): boolean {
        const redRouter = this.obtenerRedDelRouter(router);
        
        if (!redRouter) {
            return true; // Sin red, permitir tráfico
        }

        // Verificar si origen y destino están en la red interna
        const origenEnRedInterna = redRouter.dispositivosConectados.includes(nombreOrigen);
        const destinoEnRedInterna = redRouter.dispositivosConectados.includes(nombreDestino);

        // Si AMBOS están en la red interna → Tráfico LOCAL, no aplica firewall
        if (origenEnRedInterna && destinoEnRedInterna) {
            return true; // Permitir siempre tráfico interno
        }

        // Si NINGUNO está en la red → No gestiona este router
        if (!origenEnRedInterna && !destinoEnRedInterna) {
            return true; // No es responsabilidad de este router
        }

        // Determinar dirección del tráfico (origen en red → SALIENTE, destino en red → ENTRANTE)
        const direccion = origenEnRedInterna ? 'SALIENTE' : 'ENTRANTE';

        // Evaluar regla del firewall con dirección
        return this.evaluarReglaFirewall(
            router.firewall, 
            protocolo, 
            nombreOrigen,
            direccion
        );
    }


    private emitirEventoPermitido(origen: string, destino: string, protocolo: TipoProtocolo): void {
        const mensaje = `Conexión permitida: ${origen} → ${destino} [${protocolo}]`;
        
        const registro: RegistroFirewallPermitido = {
            origen,
            destino,
            protocolo,
            mensaje,
            tipo: 'PERMITIDO'
        };
        
        this.ecsManager.emit(EventosRed.FIREWALL_TRAFICO_PERMITIDO, registro);
    }


    private emitirEventoBloqueado(origen: string, destino: string, protocolo: TipoProtocolo, razon?: string): void {
        const razonTexto = razon ? ` - Bloqueado por: ${razon}` : '';
        const mensaje = `Conexión bloqueado: ${origen} → ${destino} [${protocolo}]${razonTexto}`;
        
        const registro: RegistroFirewallBloqueado = {
            origen,
            destino,
            protocolo,
            mensaje,
            tipo: 'BLOQUEADO',
            razon
        };
        
        this.ecsManager.emit(EventosRed.FIREWALL_TRAFICO_BLOQUEADO, registro);
        
        if (razon) {
            console.log(`   Razón: ${razon}`);
        }
    }

    private obtenerRedDelRouter(router: RouterComponent): RedComponent | null {
        for (const container of this.ecsManager.getEntidades().values()) {
            const routerComp = container.get(RouterComponent);
            const redComp = container.get(RedComponent);
            
            // Verificar que sea el mismo router y tenga red
            if (routerComp === router && redComp) {
                return redComp;
            }
        }
        
        return null;
    }

    private evaluarReglaFirewall(
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


    private coincideDireccion(
        direccionRegla: DireccionTrafico,
        direccionTrafico: DireccionTrafico
    ): boolean {
        return direccionRegla === 'AMBAS' || direccionRegla === direccionTrafico;
    }


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


    private obtenerRoutersDeRed(nombreDisp1: string, nombreDisp2: string): RouterComponent[] {
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

    private registrarTrafico(
        origen: string,
        destino: string,
        protocolo: TipoProtocolo
    ): void {
        const registro: RegistroTrafico = {
            origen,
            destino,
            protocolo
        };

        this.ecsManager.emit(EventosRed.TRAFICO_ENVIADO, registro);
    }

    // ===========================
    // API PÚBLICA PARA CONFIGURACIÓN DE FIREWALL
    // ===========================

    /**
     * Habilita o deshabilita el firewall de un router
     * @param nombreRouter Nombre del router (nombre del DispositivoComponent)
     * @param habilitado true para habilitar, false para deshabilitar
     */
    public toggleFirewall(nombreRouter: string, habilitado: boolean): void {
        const router = this.obtenerRouterPorNombre(nombreRouter);
        if (!router) {
            console.error(`Router "${nombreRouter}" no encontrado`);
            return;
        }

        // Preservar la configuración actual y solo cambiar el estado
        const configActual = router.firewall;
        router.firewall = {
            ...configActual,
            habilitado
        };

        // Emitir evento de cambio de estado
        const evento = habilitado ? EventosRed.FIREWALL_HABILITADO : EventosRed.FIREWALL_DESHABILITADO;
        this.ecsManager.emit(evento, {
            router: nombreRouter,
            mensaje: `Firewall del router "${nombreRouter}" ${habilitado ? 'habilitado' : 'deshabilitado'}`,
            tipo: habilitado ? 'HABILITADO' : 'DESHABILITADO'
        });
    }

    /**
     * Agrega una regla global al firewall de un router
     * @param nombreRouter Nombre del router
     * @param protocolo Protocolo a filtrar
     * @param accion "PERMITIR" o "DENEGAR"
     * @param direccion "SALIENTE", "ENTRANTE" o "AMBAS"
     */
    public agregarReglaFirewall(
        nombreRouter: string,
        protocolo: TipoProtocolo,
        accion: "PERMITIR" | "DENEGAR",
        direccion: DireccionTrafico
    ): void {
        const router = this.obtenerRouterPorNombre(nombreRouter);
        if (!router) {
            console.error(`Router "${nombreRouter}" no encontrado`);
            return;
        }

        // Obtener reglas existentes para este protocolo
        const reglasExistentes = router.firewall.reglasGlobales.get(protocolo) || [];
        
        // Agregar la nueva regla
        const nuevaRegla = { accion, direccion };
        router.firewall.reglasGlobales.set(protocolo, [...reglasExistentes, nuevaRegla]);

        // Emitir evento
        this.ecsManager.emit(EventosRed.FIREWALL_REGLA_AGREGADA, {
            router: nombreRouter,
            mensaje: `Regla agregada en "${nombreRouter}": ${accion} ${protocolo} (${direccion})`,
            tipo: 'REGLA_AGREGADA',
            protocolo,
            accion,
            direccion
        });
    }

    /**
     * Agrega una excepción (regla por dispositivo específico) al firewall
     * @param nombreRouter Nombre del router
     * @param protocolo Protocolo a filtrar
     * @param nombreDispositivo Nombre del dispositivo específico
     * @param accion "PERMITIR" o "DENEGAR"
     * @param direccion "SALIENTE", "ENTRANTE" o "AMBAS"
     */
    public agregarExcepcionFirewall(
        nombreRouter: string,
        protocolo: TipoProtocolo,
        nombreDispositivo: string,
        accion: "PERMITIR" | "DENEGAR",
        direccion: DireccionTrafico
    ): void {
        const router = this.obtenerRouterPorNombre(nombreRouter);
        if (!router) {
            console.error(`Router "${nombreRouter}" no encontrado`);
            return;
        }

        // Obtener excepciones existentes para este protocolo
        const excepcionesExistentes = router.firewall.excepciones.get(protocolo) || [];
        
        // Agregar la nueva excepción
        const nuevaExcepcion = {
            nombreDispositivo,
            accion,
            direccion
        };
        router.firewall.excepciones.set(protocolo, [...excepcionesExistentes, nuevaExcepcion]);

        // Emitir evento (usando FIREWALL_REGLA_AGREGADA ya que es una regla específica)
        this.ecsManager.emit(EventosRed.FIREWALL_REGLA_AGREGADA, {
            router: nombreRouter,
            mensaje: `Excepción agregada en "${nombreRouter}": ${accion} ${protocolo} para "${nombreDispositivo}" (${direccion})`,
            tipo: 'REGLA_AGREGADA',
            protocolo,
            accion,
            direccion
        });
    }

    /**
     * Cambia la política por defecto del firewall de un router
     * @param nombreRouter Nombre del router
     * @param politica "PERMITIR" o "DENEGAR"
     */
    public setPoliticaFirewall(
        nombreRouter: string,
        politica: "PERMITIR" | "DENEGAR"
    ): void {
        const router = this.obtenerRouterPorNombre(nombreRouter);
        if (!router) {
            console.error(`Router "${nombreRouter}" no encontrado`);
            return;
        }

        const politicaAnterior = router.firewall.politicaPorDefecto;
        router.firewall.politicaPorDefecto = politica;

        // Emitir evento
        this.ecsManager.emit(EventosRed.FIREWALL_POLITICA_CAMBIADA, {
            router: nombreRouter,
            mensaje: `Política de "${nombreRouter}" cambiada de ${politicaAnterior} a ${politica}`,
            tipo: 'POLITICA_CAMBIADA',
            politicaAnterior,
            politicaNueva: politica
        });
    }

    /**
     * Obtiene todos los nombres de routers del escenario
     * @returns Array de nombres de routers
     */
    public obtenerRouters(): string[] {
        const routers: string[] = [];

        for (const [, container] of this.ecsManager.getEntidades()) {
            const router = container.get(RouterComponent);
            const dispositivo = container.get(DispositivoComponent);
            
            if (router && dispositivo) {
                routers.push(dispositivo.nombre);
            }
        }

        return routers;
    }

    /**
     * Busca un router por nombre (nombre del DispositivoComponent)
     * @private
     */
    private obtenerRouterPorNombre(nombreRouter: string): RouterComponent | null {
        for (const [, container] of this.ecsManager.getEntidades()) {
            const router = container.get(RouterComponent);
            const dispositivo = container.get(DispositivoComponent);
            
            if (router && dispositivo && dispositivo.nombre === nombreRouter) {
                return router;
            }
        }

        return null;
    }
}
 
