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
} from "../components";
import type { ComponenteContainer, Entidad } from "../core/Componente";
import type { Escenario } from "../../types/EscenarioTypes";
import { SistemaRelaciones } from "../systems/SistemaRelaciones";
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
    
    escenario.ataques.forEach((ataque: any) => {
      this.crearAtaque(ataque);
    });

    escenario.fases.forEach((fase: any) => {
      this.crearFase(fase);
    });

    escenario.zonas.forEach((zona: any) => {
      const zonaEntidad = this.crearZona(zona, escenarioPadre);
      zona.oficinas.forEach((oficina: any) => {
        const oficinaEntidad = this.crearOficina(oficina, zonaEntidad);
        oficina.espacios.forEach((espacio: any) => {
          const espacioEntidad = this.crearEspacio(espacio, oficinaEntidad);
          espacio.dispositivos.forEach((dispositivo: any) => {
            this.crearDispositivo(dispositivo, espacioEntidad);
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

  crearAtaque(ataque: any) {
    const entidadAtaque = this.ecsManager.agregarEntidad();
    this.ecsManager.agregarComponente(
      entidadAtaque,
      new AtaqueComponent(
        ataque.nombreAtaque,
        ataque.tiempoNotificacion,
        ataque.tipoAtaque,
        ataque.dispositivoAAtacar,
        ataque.descripcion,
        ataque.fase,
        ataque.condicionMitigacion
      )
    );
  }

  crearFase(fase: any) {
    const entidadFase = this.ecsManager.agregarEntidad();
    this.ecsManager.agregarComponente(
      entidadFase,
      new FaseComponent(
        fase.id,
        fase.nombre,
        fase.descripcion,
        fase.faseActual
      )
    );
  }

  crearZona(zona: any, escenarioEntidad?: Entidad): Entidad {
    const entidadZona = this.ecsManager.agregarEntidad();
    this.ecsManager.agregarComponente(
      entidadZona,
      new ZonaComponent(zona.id, zona.nombre)
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

  crearOficina(oficina: any, zonaId: number): Entidad {
    const entidadOficina = this.ecsManager.agregarEntidad();
    this.ecsManager.agregarComponente(
      entidadOficina,
      new OficinaComponent(oficina.id, oficina.nombre, zonaId)
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

  crearEspacio(espacio: any, oficinaId: number): Entidad {
    const entidadEspacio = this.ecsManager.agregarEntidad();
    this.ecsManager.agregarComponente(
      entidadEspacio,
      new EspacioComponent(espacio.id, oficinaId, espacio.mueble)
    );
    this.ecsManager.agregarComponente(
      entidadEspacio,
      new Transform(
        espacio.posicion.x,
        espacio.posicion.y,
        espacio.posicion.z,
        espacio.posicion.rotacionY
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

  crearDispositivo(dispositivo: any, espacioId: number): Entidad {
    const entidadDispositivo = this.ecsManager.agregarEntidad();
    this.ecsManager.agregarComponente(
      entidadDispositivo,
      new DispositivoComponent(
        dispositivo.nombre,
        dispositivo.sistemaOperativo,
        dispositivo.hardware,
        dispositivo.tipo,
        dispositivo.estadoAtaque
      )
    );
    this.ecsManager.agregarComponente(
      entidadDispositivo,
      new Transform(
        dispositivo.posicion.x,
        dispositivo.posicion.y,
        dispositivo.posicion.z,
        dispositivo.posicion.rotacionY
      )
    );
    // TO-DO: agregar condicional para cada tipo de dispositivo segun dispositivo.tipo (IMPORTANTE)
    this.ecsManager.agregarComponente(
      entidadDispositivo,
      new WorkstationComponent()
    );

    const disEntidad = entidadDispositivo;
    if (disEntidad != null) {
      const relacion = new SistemaRelaciones(
        EspacioComponent,
        DispositivoComponent,
        "dispositivos"
      );
      relacion.ecsManager = this.ecsManager;
      relacion.agregar(espacioId, disEntidad);
    }
    return entidadDispositivo;
  }

  public getEntidades(): Map<Entidad, ComponenteContainer> {
    return this.ecsManager.getEntidades();
  }
}
