import { ECSManager } from "../core/ECSManager";
import {
  Transform,
  DispositivoComponent,
  EspacioComponent,
  OficinaComponent,
  ZonaComponent,
  EscenarioComponent,
  AtaqueComponent,
  FaseComponent,
  WorkstationComponent,
  RouterComponent,
  ActivoComponent,
  EventoComponent,
} from "../components";
import type { ComponenteContainer, Entidad } from "../core/Componente";
import type { Dispositivo, Escenario } from "../../types/EscenarioTypes";
import { SistemaRelaciones } from "../systems/SistemaRelaciones";
import {
  TipoAtaque,
  TipoDispositivo,
  EstadoAtaqueDispositivo,
  TipoEvento,
} from "../../types/DeviceEnums";
import { RedComponent } from "../components/RedComponent";
import { FirewallBuilder } from "./FirewallBuilder";

/**
 * Builder para crear escenarios de forma declarativa y simple
 * Facilita la construcción inicial y modificaciones posteriores
 */
export class ScenarioBuilder {
  private ecsManager: ECSManager;

  constructor(ecsManager: ECSManager) {
    this.ecsManager = ecsManager;
  }

  /**
   * Construye el escenario a partir de un objeto de configuración
   * Recorre las zonas, oficinas, espacios y dispositivos del objeto y crea las entidades correspondientes
   */
  construirDesdeArchivo(escenario: Escenario): this {
    const escenarioPadre = this.crearEscenario(escenario);

    escenario.ataques.forEach((ataque: unknown) => {
      this.crearAtaque(ataque);
    });

    escenario.eventos.forEach((evento: unknown) => {
      this.crearEvento(evento);
    });

    escenario.fases.forEach((fase: unknown) => {
      this.crearFase(fase);
    });

    escenario.redes.forEach((red: unknown) => {
      this.crearRed(red);
    });

    escenario.zonas.forEach((zona: unknown) => {
      const zonaEntidad = this.crearZona(zona, escenarioPadre);
      const z = zona as { oficinas?: unknown[]; };
      (z.oficinas ?? []).forEach((oficina: unknown) => {
        const oficinaEntidad = this.crearOficina(oficina, zonaEntidad);
        const ofi = oficina as { espacios?: unknown[] };
        (ofi.espacios ?? []).forEach((espacio: unknown) => {
          const espacioEntidad = this.crearEspacio(espacio, oficinaEntidad);
          const esp = espacio as { dispositivos?: Dispositivo[] };
          (esp.dispositivos ?? []).forEach((dispositivo: Dispositivo) => {
            let dispositivoEntidad: Entidad;
            
            // Detectar si es un router y usar método específico
            if (dispositivo.tipo === TipoDispositivo.ROUTER) {
              dispositivoEntidad = this.crearRouter(dispositivo, espacioEntidad);
            } else {
              dispositivoEntidad = this.crearDispositivo(dispositivo, espacioEntidad);
            }
            
            this.crearActivos(dispositivoEntidad, dispositivo.activos);
          });
        });
      });
    });

    return this;
  }

  crearEscenario(escenario: Escenario): Entidad {
    const entidadEscenario = this.ecsManager.agregarEntidad();
    this.ecsManager.agregarComponente(
      entidadEscenario,
      new EscenarioComponent(
        escenario.id,
        escenario.titulo,
        escenario.descripcion,
        escenario.presupuestoInicial
      )
    );
    return entidadEscenario;
  }

  crearAtaque(ataque: unknown) {
    const a = ataque as {
      nombreAtaque: string;
      tiempoNotificacion: number;
      tipoAtaque: unknown;
      dispositivoAAtacar: string;
      descripcion: string;
      fase: number;
      condicionMitigacion: {
        accion: string;
        objeto: string;
        tiempo?: number;
        val?: unknown;
      };
    };
    const entidadAtaque = this.ecsManager.agregarEntidad();
    this.ecsManager.agregarComponente(
      entidadAtaque,
      new AtaqueComponent(
        a.nombreAtaque,
        a.tiempoNotificacion,
        a.tipoAtaque as unknown as TipoAtaque,
        a.dispositivoAAtacar,
        a.descripcion,
        a.fase,
        a.condicionMitigacion
      )
    );
  }

  crearEvento(evento: unknown) {
    const a = evento as {
      nombreEvento: string;
      tipoEvento: TipoEvento;
      tiempoNotificacion: number;
      descripcion: string;
      fase: number;
      infoAdicional?: unknown;
    };
    const entidadEvento = this.ecsManager.agregarEntidad();
    this.ecsManager.agregarComponente(
      entidadEvento,
      new EventoComponent(
        a.nombreEvento,
        a.tipoEvento,
        a.tiempoNotificacion,
        a.descripcion,
        a.fase,
        a.infoAdicional
      )
    );
  }

  crearFase(fase: unknown) {
    const f = fase as {
      id: number;
      nombre: string;
      descripcion?: string;
      faseActual?: boolean;
    };
    const entidadFase = this.ecsManager.agregarEntidad();
    this.ecsManager.agregarComponente(
      entidadFase,
      new FaseComponent(
        f.id,
        f.nombre,
        f.descripcion ?? "",
        f.faseActual ?? false
      )
    );
  }

  crearZona(zona: unknown, escenarioEntidad?: Entidad): Entidad {
    const entidadZona = this.ecsManager.agregarEntidad();
    const z = zona as { id: number; nombre: string; };
    this.ecsManager.agregarComponente(
      entidadZona,
      new ZonaComponent(z.id, z.nombre)
    );
    const escEntidad = escenarioEntidad;
    if (escEntidad != null) {
      const relacion = new SistemaRelaciones(
        EscenarioComponent,
        ZonaComponent,
        "zonas"
      );
      relacion.ecsManager = this.ecsManager;
      relacion.agregar(escEntidad, entidadZona);
    }
    return entidadZona;
  }

  crearRed(red: unknown) {
    const r = red as {
      nombre: string;
      color: string;
      dispositivosConectados: string[];
      zona: string;
    }
    const entidadRed = this.ecsManager.agregarEntidad();
    const redComponente = new RedComponent(
      r.nombre,
      r.color,
      r.dispositivosConectados,
      r.zona
    )
    this.ecsManager.agregarComponente(entidadRed, redComponente);
  }

  crearOficina(oficina: unknown, zonaId: number): Entidad {
    const entidadOficina = this.ecsManager.agregarEntidad();
    const ofi = oficina as { id: number; nombre?: string };
    this.ecsManager.agregarComponente(
      entidadOficina,
      new OficinaComponent(ofi.id, ofi.nombre ?? "", zonaId)
    );

    const ofiEntidad = entidadOficina;
    if (ofiEntidad != null) {
      const relacion = new SistemaRelaciones(
        ZonaComponent,
        OficinaComponent,
        "oficinas"
      );
      relacion.ecsManager = this.ecsManager;
      relacion.agregar(zonaId, ofiEntidad);
    }
    return entidadOficina;
  }

  crearEspacio(espacio: unknown, oficinaId: number): Entidad {
    const entidadEspacio = this.ecsManager.agregarEntidad();
    const esp = espacio as {
      id: number;
      mueble: unknown;
      posicion?: { x: number; y: number; z: number; rotacionY?: number };
    };
    this.ecsManager.agregarComponente(
      entidadEspacio,
      new EspacioComponent(esp.id, oficinaId, String(esp.mueble ?? "libre"))
    );
    this.ecsManager.agregarComponente(
      entidadEspacio,
      new Transform(
        esp.posicion?.x ?? 0,
        esp.posicion?.y ?? 0,
        esp.posicion?.z ?? 0,
        esp.posicion?.rotacionY ?? 0
      )
    );
    const espEntidad = entidadEspacio;
    if (espEntidad != null) {
      const relacion = new SistemaRelaciones(
        OficinaComponent,
        EspacioComponent,
        "espacios"
      );
      relacion.ecsManager = this.ecsManager;
      relacion.agregar(oficinaId, espEntidad);
    }
    return entidadEspacio;
  }

  crearDispositivo(dispositivo: unknown, espacioId: number): Entidad {
    const entidadDispositivo = this.ecsManager.agregarEntidad();
    const d = dispositivo as {
      nombre?: string;
      sistemaOperativo?: string;
      hardware?: string;
      tipo?: unknown;
      estadoAtaque?: unknown;
      posicion?: { x: number; y: number; z: number; rotacionY?: number };
    };
    
    // Agregar componente de dispositivo
    this.ecsManager.agregarComponente(
      entidadDispositivo,
      new DispositivoComponent(
        d.nombre ?? "",
        d.sistemaOperativo ?? "",
        d.hardware ?? "",
        d.tipo as unknown as TipoDispositivo,
        d.estadoAtaque as EstadoAtaqueDispositivo
      )
    );
    
    // Agregar Transform (posición 3D)
    this.ecsManager.agregarComponente(
      entidadDispositivo,
      new Transform(
        d.posicion?.x ?? 0,
        d.posicion?.y ?? 0,
        d.posicion?.z ?? 0,
        d.posicion?.rotacionY ?? 0
      )
    );

    // Agregar componentes específicos según tipo
    switch (d.tipo) {
      case TipoDispositivo.WORKSTATION: {
        this.ecsManager.agregarComponente(
          entidadDispositivo,
          new WorkstationComponent()
        );
        break;
      }
    }

    // Agregar relación con espacio
    const relacion = new SistemaRelaciones(
      EspacioComponent,
      DispositivoComponent,
      "dispositivos"
    );
    relacion.ecsManager = this.ecsManager;
    relacion.agregar(espacioId, entidadDispositivo);
    
    return entidadDispositivo;
  }

  crearRouter(router: unknown, espacioId: number): Entidad {
    const entidadRouter = this.ecsManager.agregarEntidad();
    const r = router as {
      nombre?: string;
      sistemaOperativo?: string;
      hardware?: string;
      tipo?: unknown;
      posicion?: { x: number; y: number; z: number; rotacionY?: number };
      conectadoAInternet?: boolean;
      redes?: string[]; // Array de NOMBRES de redes (referencias)
    };
    
    // 1. Agregar DispositivoComponent (routers no tienen estadoAtaque)
    this.ecsManager.agregarComponente(
      entidadRouter,
      new DispositivoComponent(
        r.nombre ?? "",
        r.sistemaOperativo ?? "",
        r.hardware ?? "",
        r.tipo as unknown as TipoDispositivo,
        EstadoAtaqueDispositivo.NORMAL // Default para routers
      )
    );
    
    // 2. Agregar Transform (posición 3D)
    this.ecsManager.agregarComponente(
      entidadRouter,
      new Transform(
        r.posicion?.x ?? 0,
        r.posicion?.y ?? 0,
        r.posicion?.z ?? 0,
        r.posicion?.rotacionY ?? 0
      )
    );

    // 3. Buscar las entidades RedComponent existentes por nombre
    const redesIds: Entidad[] = [];
    const nombresRedes = r.redes ?? [];
    
    for (const nombreRed of nombresRedes) {
      let redEncontrada = false;
      for (const [entidadId, container] of this.ecsManager.getEntidades()) {
        const redComp = container.get(RedComponent);
        if (redComp && redComp.nombre === nombreRed) {
          redesIds.push(entidadId);
          redEncontrada = true;
          break;
        }
      }
      
      if (!redEncontrada) {
        console.warn(`Red "${nombreRed}" no encontrada para el router "${r.nombre}". Asegúrate de definir la red en escenario.redes antes de referenciarla.`);
      }
    }

    // 4. Agregar RouterComponent con firewall y referencias a redes
    const firewallConfig = new FirewallBuilder().build();
    
    this.ecsManager.agregarComponente(
      entidadRouter,
      new RouterComponent(r.conectadoAInternet ?? true, firewallConfig, redesIds)
    );
    
    // 4. Agregar relación con espacio
    const relacion = new SistemaRelaciones(
      EspacioComponent,
      DispositivoComponent,
      "dispositivos"
    );
    relacion.ecsManager = this.ecsManager;
    relacion.agregar(espacioId, entidadRouter);
    
    return entidadRouter;
  }

  crearActivos(entidadDispositivo: number, activos: any) {
    const activoComponente = new ActivoComponent();
    activoComponente.activos = activos;
    this.ecsManager.agregarComponente(entidadDispositivo, activoComponente);
  }

  public getEntidades(): Map<Entidad, ComponenteContainer> {
    return this.ecsManager.getEntidades();
  }
}
