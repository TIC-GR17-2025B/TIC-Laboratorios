import { RouterComponent, DispositivoComponent } from "../../components";
import { DireccionTrafico, AccionFirewall } from "../../../types/FirewallTypes";
import type { TipoProtocolo } from "../../../types/TrafficEnums";
import type { ConectividadService } from "./ConectividadService";
import type { Entidad } from "../../core";
import type { ECSManager } from "../../core/ECSManager";

/**
 * Servicio para validar tráfico a través del firewall
 * Valida basándose en bloqueosFirewall: Map<Entidad, Reglas[]>
 * donde la Entidad es la red
 */
export class FirewallService {
  constructor(
    private conectividadService: ConectividadService,
    private ecsManager: ECSManager
  ) {}

  /**
   * Valida si el tráfico pasa los firewalls de todos los routers en la ruta
   * 
   * LÓGICA DEL FIREWALL:
   * - Si configuras "internet ENTRANTE bloqueado" → bloqueas tráfico que VIENE DE internet
   * - Si configuras "internet SALIENTE bloqueado" → bloqueas tráfico que VA HACIA internet
   * - Si configuras "lan1 ENTRANTE bloqueado" → bloqueas tráfico que VIENE DE lan1
   * - Si configuras "lan1 SALIENTE bloqueado" → bloqueas tráfico que VA HACIA lan1
   */
  validarFirewall(
    entidadOrigen: Entidad,
    entidadDestino: Entidad,
    protocolo: TipoProtocolo
  ): { permitido: boolean; entidadRouter?: Entidad } {
    console.log("\nVALIDANDO FIREWALL");
    console.log(`Origen: ${entidadOrigen}, Destino: ${entidadDestino}, Protocolo: ${protocolo}`);


    const rutaRoutersEntidades = this.conectividadService.obtenerRutaRouters(
      entidadOrigen,
      entidadDestino
    );

    console.log(`Ruta de routers:`, rutaRoutersEntidades);

    if (rutaRoutersEntidades === null) {
      console.log("No hay ruta disponible");
      return { permitido: false };
    }

    if (rutaRoutersEntidades.length === 0) {
      console.log("Misma red, sin routers intermedios");
      return { permitido: true };
    }

    // Obtener las redes de origen y destino
    const redesOrigen = this.conectividadService["obtenerRedesDelDispositivo"](entidadOrigen);
    const redesDestino = this.conectividadService["obtenerRedesDelDispositivo"](entidadDestino);
    
    console.log(`Redes Origen:`, redesOrigen);
    console.log(`Redes Destino:`, redesDestino);

    // 2. Iterar sobre cada router en la ruta
    for (let i = 0; i < rutaRoutersEntidades.length; i++) {
      const entidadRouterActual = rutaRoutersEntidades[i];
      
      console.log(`\n Evaluando Router ${i} (Entidad ${entidadRouterActual})`);
      
      const routerContainer = this.ecsManager.getComponentes(entidadRouterActual);
      const routerComponente = routerContainer?.get(RouterComponent);
      const dispositivoComponente = routerContainer?.get(DispositivoComponent);
      
      if (!routerComponente || !dispositivoComponente) continue;

      console.log(`   Redes del router:`, dispositivoComponente.redes);

      // 3. Determinar desde qué red viene el tráfico y hacia qué red va
      let redDesdeViene: Entidad[] = []; // Red desde donde viene el tráfico
      let redHaciaVa: Entidad[] = [];    // Red hacia donde va el tráfico
      
      if (i === 0) {
        // Primer router: viene desde la red de origen
        redDesdeViene = redesOrigen;
        // Va hacia las otras redes del router (no origen)
        redHaciaVa = dispositivoComponente.redes.filter(r => !redesOrigen.includes(r));
        console.log(`   Tipo: PRIMER ROUTER`);
      } else if (i === rutaRoutersEntidades.length - 1) {
        // Último router: va hacia la red de destino
        redHaciaVa = redesDestino;
        // Viene desde las otras redes del router (no destino)
        redDesdeViene = dispositivoComponente.redes.filter(r => !redesDestino.includes(r));
        console.log(`   Tipo: ÚLTIMO ROUTER`);
      } else {
        // Routers intermedios: determinar entrada/salida basándose en router anterior
        console.log(`   Tipo: ROUTER INTERMEDIO`);
        const entidadRouterAnterior = rutaRoutersEntidades[i - 1];
        const routerAnterior = this.ecsManager.getComponentes(entidadRouterAnterior)?.get(DispositivoComponent);
        
        if (routerAnterior) {
          // Encuentra la red compartida con el router anterior (por donde viene)
          redDesdeViene = dispositivoComponente.redes.filter(r => routerAnterior.redes.includes(r));
          // Las otras redes son hacia donde va
          redHaciaVa = dispositivoComponente.redes.filter(r => !redDesdeViene.includes(r));
        } else {
          // Si no hay router anterior, evaluar todas las redes
          redDesdeViene = dispositivoComponente.redes;
          redHaciaVa = dispositivoComponente.redes;
        }
      }

      console.log(`   Tráfico VIENE DE (red):`, redDesdeViene);
      console.log(`   Tráfico VA HACIA (red):`, redHaciaVa);

      // 4. Verificar reglas ENTRANTES en las redes desde donde VIENE el tráfico
      // Si la red tiene "ENTRANTE bloqueado" = bloquea lo que viene de esa red
      console.log(`   Verificando reglas ENTRANTES en redes desde donde viene...`);
      const permitidoDesdeOrigen = this.evaluarFirewallDeRouter(
        routerComponente,
        redDesdeViene,
        protocolo,
        DireccionTrafico.ENTRANTE
      );
      
      console.log(`   Resultado ENTRANTE: ${permitidoDesdeOrigen ? " PERMITIDO" : " BLOQUEADO"}`);
      
      if (!permitidoDesdeOrigen) {
        console.log(` TRÁFICO BLOQUEADO: La red ${redDesdeViene} tiene ENTRANTE bloqueado (no deja SALIR tráfico de esa red)`);
        return { permitido: false, entidadRouter: entidadRouterActual };
      }

      // 5. Verificar reglas SALIENTES en las redes hacia donde VA el tráfico
      // Si la red tiene "SALIENTE bloqueado" = bloquea lo que va hacia esa red
      console.log(`   Verificando reglas SALIENTES en redes hacia donde va...`);
      const permitidoHaciaDestino = this.evaluarFirewallDeRouter(
        routerComponente,
        redHaciaVa,
        protocolo,
        DireccionTrafico.SALIENTE
      );
      
      console.log(`   Resultado SALIENTE: ${permitidoHaciaDestino ? " PERMITIDO" : " BLOQUEADO"}`);
      
      if (!permitidoHaciaDestino) {
        console.log(` TRÁFICO BLOQUEADO: La red ${redHaciaVa} tiene SALIENTE bloqueado (no deja ENTRAR tráfico a esa red)`);
        return { permitido: false, entidadRouter: entidadRouterActual };
      }
    }

    // 6. Todos los routers permiten el tráfico
    console.log("\n TRÁFICO PERMITIDO por todos los routers\n");
    return { permitido: true };
  }

  /**
   * Evalúa el firewall de un router para las redes especificadas
   * Retorna false si alguna regla DENIEGA el tráfico
   * Retorna true si no hay reglas o si alguna regla PERMITE el tráfico
   */
  private evaluarFirewallDeRouter(
    router: RouterComponent,
    redes: Entidad[],
    protocolo: TipoProtocolo,
    direccionTrafico: DireccionTrafico
  ): boolean {
    console.log(`      Evaluando redes:`, redes, `con dirección: ${direccionTrafico}`);
    
    // Revisar si hay reglas de bloqueo para alguna de las redes
    for (const red of redes) {
      const reglasRed = router.bloqueosFirewall.get(red);
      
      console.log(`        Red ${red}: ${reglasRed ? reglasRed.length : 0} reglas`);
      
      if (!reglasRed || reglasRed.length === 0) {
        // No hay reglas para esta red, continuar con la siguiente
        continue;
      }

      // Buscar reglas que apliquen al protocolo y dirección
      for (const regla of reglasRed) {
        console.log(`          Regla: protocolo=${regla.protocolo}, dirección=${regla.direccion}, acción=${regla.accion}`);
        
        if (regla.protocolo !== protocolo) {
          console.log(`        Protocolo no coincide (buscando ${protocolo})`);
          continue;
        }

        // Verificar si la dirección coincide
        const direccionCoincide = 
          regla.direccion === direccionTrafico || 
          regla.direccion === DireccionTrafico.AMBAS ||
          direccionTrafico === DireccionTrafico.AMBAS;

        console.log(`          Dirección coincide: ${direccionCoincide}`);

        if (direccionCoincide) {
          // Si hay una regla que aplica, usar su acción
          const permitir = regla.accion === AccionFirewall.PERMITIR;
          console.log(`           REGLA APLICADA: ${permitir ? "PERMITIR" : "DENEGAR"}`);
          return permitir;
        }
      }
    }

    // Si no hay reglas específicas que apliquen, permitir por defecto
    console.log(`       Sin reglas aplicables, permitir por defecto`);
    return true;
  }
}
