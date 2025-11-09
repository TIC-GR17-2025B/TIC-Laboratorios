import { EventosRed } from "../../types/EventosEnums";
import type { DireccionTrafico } from "../../types/FirewallTypes";
import { TipoProtocolo } from "../../types/TrafficEnums";
import type { ECSManager, Entidad } from "../core";
import { SistemaRed } from "../systems";
import { DispositivoComponent, RouterComponent, RedComponent, ZonaComponent, EspacioComponent, OficinaComponent } from "../components";

export class RedController {
  public ecsManager: ECSManager;
    
  private sistemaRed?: SistemaRed;

  private static instance: RedController | null = null;
  
  constructor(ecsManager: ECSManager){
      this.ecsManager = ecsManager;
  }

  // Singleton
  public static getInstance(ecsManager?: ECSManager): RedController {
    if (!RedController.instance) {
      if (!ecsManager) {
        throw new Error(
          "Debe proporcionar una instancia de ECSManager para inicializar el controlador la primera vez."
        );
      }
      RedController.instance = new RedController(ecsManager);
    } else if (ecsManager) {
      RedController.instance.ecsManager = ecsManager;
    }
    return RedController.instance;
  }

  public iniciarController(): void {
    if (!this.sistemaRed) {
      this.sistemaRed = new SistemaRed();
      this.ecsManager.agregarSistema(this.sistemaRed);
    }

    this.ecsManager.on(EventosRed.RED_ENVIAR_ACTIVO, (data: unknown) => {
      const d = data as { evento: unknown };
      this.sistemaRed?.enviarTrafico(d.evento.infoAdicional.dispositivoEmisor,
                                    d.evento.infoAdicional.dispositivoReceptor,
                                    TipoProtocolo.FTP,
                                    d.evento.infoAdicional.nombreActivo);
    });

    this.ecsManager.on(EventosRed.RED_ACTIVO_ENVIADO, (data: unknown) => {
      const d = data as { d1: string, d2: string, nombreActivo: string };
      console.log(`Se envió el activo "${d.nombreActivo}" desde ${d.d1} hacia ${d.d2}.`);
    });

    this.ecsManager.on(EventosRed.TRAFICO_ENVIADO, (data: unknown) => {
      const registro = data as { origen: string, destino: string, protocolo: TipoProtocolo };
      console.log(`Tráfico enviado: ${registro.origen} -> ${registro.destino}. Protocolo: ${registro.protocolo}`);
    });
  }

  public asignarRed(nombreDisp: string, nombreRed: string): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.asignarRed(nombreDisp, nombreRed);
  }

  public toggleActivacionFirewall(nombreRouter: string, habilitado: boolean): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }

    this.sistemaRed.toggleFirewall(nombreRouter, habilitado);
  }

  public agregarReglaFirewall(nombreRouter: string,
    protocolo: TipoProtocolo,
    accion: "PERMITIR" | "DENEGAR",
    direccion: DireccionTrafico
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.agregarReglaFirewall(nombreRouter, protocolo, accion, direccion);
  }

  public agregarExcepcionFirewall(
    nombreRouter: string,
    protocolo: TipoProtocolo,
    nombreDispositivo: string,
    accion: "PERMITIR" | "DENEGAR",
    direccion: DireccionTrafico
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.agregarExcepcionFirewall(nombreRouter, protocolo, nombreDispositivo, accion, direccion);
  }

  public setPoliticaFirewall(
    nombreRouter: string,
    politica: "PERMITIR" | "DENEGAR"
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.setPoliticaFirewall(nombreRouter, politica);
  }

  public setPoliticaFirewallSaliente(
    nombreRouter: string,
    politica: "PERMITIR" | "DENEGAR"
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.setPoliticaFirewallSaliente(nombreRouter, politica);
  }

  public setPoliticaFirewallEntrante(
    nombreRouter: string,
    politica: "PERMITIR" | "DENEGAR"
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.setPoliticaFirewallEntrante(nombreRouter, politica);
  }

  /**
   * Verifica si dos dispositivos están conectados (pueden comunicarse)
   */
  public estanConectados(nombreDispOrigen: string, nombreDispDestino: string): boolean {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return false;
    }
    // Accedemos al servicio de conectividad a través del sistema
    return this.sistemaRed['getConectividadService']().estanConectados(nombreDispOrigen, nombreDispDestino);
  }

  /**
   * Obtiene el router que gestiona un dispositivo específico
   */
  public obtenerRouterDelDispositivo(nombreDispositivo: string): string | null {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return null;
    }
    const router = this.sistemaRed['getConectividadService']().obtenerRouterDelDispositivo(nombreDispositivo);
    
    if (!router) return null;
    
    // Obtener el nombre del router desde el DispositivoComponent
    for (const [, container] of this.ecsManager.getEntidades()) {
      const routerComp = container.get(RouterComponent);
      if (routerComp === router) {
        const dispComp = container.get(DispositivoComponent);
        return dispComp?.nombre || null;
      }
    }
    return null;
  }

  /**
   * Obtiene información sobre la red de un dispositivo
   */
  public obtenerRedDelDispositivo(nombreDispositivo: string): { nombreRed: string; color: string; zona: string } | null {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return null;
    }
    
    const resultado = this.sistemaRed['getConectividadService']().buscarRouterConDispositivo(nombreDispositivo);
    
    if (!resultado) return null;
    
    return {
      nombreRed: resultado.red.nombre,
      color: resultado.red.color,
      zona: resultado.red.zona
    };
  }

  /**
   * Obtiene todas las redes de un router específico
   */
  public obtenerRedesDelRouter(nombreRouter: string): Array<{ nombre: string; color: string; }> {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return [];
    }

    // Buscar el router por nombre
    let routerComponent: RouterComponent | null = null;
    
    for (const [, container] of this.ecsManager.getEntidades()) {
      const dispComp = container.get(DispositivoComponent);
      const routerComp = container.get(RouterComponent);
      
      if (dispComp?.nombre === nombreRouter && routerComp) {
        routerComponent = routerComp;
        break;
      }
    }

    if (!routerComponent) {
      console.warn(`Router "${nombreRouter}" no encontrado`);
      return [];
    }

    // Obtener las redes del router
    const redes = this.sistemaRed['getConectividadService']().obtenerRedesDelRouter(routerComponent);
    
    return redes.map(red => ({
      nombre: red.nombre,
      color: red.color
    }));
  }

  /**
   * Obtiene todos los dispositivos conectados a una red específica
   */
  public obtenerDispositivosDeRed(nombreRed: string): string[] {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return [];
    }

    // Buscar la red como entidad RedComponent
    for (const [, container] of this.ecsManager.getEntidades()) {
      const redComp = container.get(RedComponent);
      if (redComp && redComp.nombre === nombreRed) {
        return [...redComp.dispositivosConectados];
      }
    }

    console.warn(`Red "${nombreRed}" no encontrada`);
    return [];
  }

  /**
   * Desconecta un dispositivo de su red actual
   */
  public desconectarDeRed(nombreDispositivo: string): boolean {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return false;
    }

    // Buscar en qué red está el dispositivo
    for (const [, container] of this.ecsManager.getEntidades()) {
      const redComp = container.get(RedComponent);
      if (redComp) {
        const index = redComp.dispositivosConectados.indexOf(nombreDispositivo);
        if (index !== -1) {
          redComp.dispositivosConectados.splice(index, 1);
          console.log(`Dispositivo "${nombreDispositivo}" desconectado de la red "${redComp.nombre}"`);
          return true;
        }
      }
    }

    console.warn(`Dispositivo "${nombreDispositivo}" no encontrado en ninguna red`);
    return false;
  }

  // Se obtienen todas las redes que pertenecen a la zona del dispositivo indicado
  public getRedesZonaPorDispositivo(nombreDisp: string): string[] {
    let redesZonaDispActual: string[] = [];

    let entidadDispActual: Entidad;

    // Se busca la entidad que coincida con el nombre del dispositivo
    for (const [entidad, c] of this.ecsManager.getEntidades()) {
      if (c.tiene(DispositivoComponent)) {
        if (c.get(DispositivoComponent)?.nombre == nombreDisp) {
          entidadDispActual = entidad;
          break;
        }
      }
    }

    let entidadEspacioDispActual: Entidad;

    // Con la entidad del dispositivo se busca a qué espacio pertence
    for (const [entidad, c] of this.ecsManager.getEntidades()) {
      if (c.tiene(EspacioComponent)) {
        if (c.get(EspacioComponent)?.dispositivos.includes(entidadDispActual!)) {
          entidadEspacioDispActual = entidad; 
          break;
        }
      }
    }
    
    let entidadOficinaDispActual: Entidad;

    // Con la entidad del espacio se busca a qué oficina pertence
    for (const [entidad, c] of this.ecsManager.getEntidades()) {
      if (c.tiene(OficinaComponent)) {
        if (c.get(OficinaComponent)?.espacios.includes(entidadEspacioDispActual!)) {
          entidadOficinaDispActual = entidad; 
          break;
        }
      }
    }

    let zonaDispActual: string;

    // Con la entidad de la oficina se busca a qué zona pertence,
    // y cuando la encuentre se extrae el nombre de la zona a la que pertenece
    for (const [,c] of this.ecsManager.getEntidades()) {
      if (c.tiene(ZonaComponent)) {
        if (c.get(ZonaComponent)?.oficinas.includes(entidadOficinaDispActual!)) {
          zonaDispActual = c.get(ZonaComponent)?.nombre!; 
          break;
        }
      }
    }

    // Con el nombre de la zona del dispositivo actual, se busca 
    // entre las entidades de redes, cuáles son las que están definidas para esa zona
    for (const [,c] of this.ecsManager.getEntidades()) {
      if (c.tiene(RedComponent)) {
        if (c.get(RedComponent)?.zona == zonaDispActual!) {
          redesZonaDispActual.push(c.get(RedComponent)?.nombre!);
        }
      }
    }

    return redesZonaDispActual;
  }
}
