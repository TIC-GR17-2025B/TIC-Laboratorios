import { ECSManager } from "../core/ECSManager";
import {
  Transform,
  MuebleComponent,
  DispositivoComponent,
  EspacioComponent, agregarDispositivo,
  OficinaComponent, agregarEspacio,
  ZonaComponent,
} from "../components";
import { Mueble, TipoDispositivo } from "../../visual/types/DeviceEnums";
import type { Entidad } from "../core/Componente";
import type { EscenarioMock } from "../../visual/types/EscenarioTypes";

/**
 * Builder para crear escenarios de forma declarativa y simple
 * Facilita la construcción inicial y modificaciones posteriores
 */
export class ScenarioBuilder {
  private ecsManager: ECSManager;
  private oficinaActual: Entidad | null = null;
  private espacioActual: Entidad | null = null;

  // Mapas para buscar entidades fácilmente
  private zonas = new Map<number, Entidad>();
  private oficinas = new Map<number, Entidad>();
  private espacios = new Map<string, Entidad>(); // key: "oficinaId-espacioId"
  private dispositivos = new Map<number, Entidad>();

  constructor(ecsManager: ECSManager) {
    this.ecsManager = ecsManager;
  }

  /**
   * Crea una nueva zona en el escenario
   */
  crearZona(id: number, nombre: string): this {
    const entidad = this.ecsManager.agregarEntidad();
    this.ecsManager.agregarComponente(entidad, new ZonaComponent(id, nombre));
    this.zonas.set(id, entidad);
    return this;
  }

  /**
   * Crea una nueva oficina dentro de una zona en el escenario
   */
  crearOficina(id: number, nombre: string, zonaId: number = 1): this {
    const entidad = this.ecsManager.agregarEntidad();
    this.ecsManager.agregarComponente(
      entidad,
      new OficinaComponent(id, nombre, zonaId)
    );
    this.ecsManager.agregarComponente(entidad, new Transform(0, 0, 0, 0));

    this.oficinas.set(id, entidad);
    this.oficinaActual = entidad;

    return this;
  }

  /**
   * Agrega un espacio (mesa/rack) a la oficina actual
   */
  agregarEspacio(
    espacioId: number,
    mueble: Mueble,
    x: number,
    y: number,
    z: number,
    rotacionY: number = 0
  ): this {
    if (!this.oficinaActual) {
      throw new Error("Debes crear una oficina primero con crearOficina()");
    }

    const oficinaComp = this.ecsManager
      .getComponentes(this.oficinaActual)
      ?.get(OficinaComponent);
    if (!oficinaComp) {
      throw new Error("La oficina actual no tiene OficinaComponent");
    }

    const entidad = this.ecsManager.agregarEntidad();
    this.ecsManager.agregarComponente(
      entidad,
      new Transform(x, y, z, rotacionY)
    );
    this.ecsManager.agregarComponente(
      entidad,
      new EspacioComponent(espacioId, oficinaComp.id)
    );

    const capacidad =
      mueble === Mueble.MESA ? 2 : mueble === Mueble.RACK ? 1 : 0;
    this.ecsManager.agregarComponente(
      entidad,
      new MuebleComponent(mueble, capacidad)
    );

    agregarEspacio(oficinaComp, entidad);

    const key = `${oficinaComp.id}-${espacioId}`;
    this.espacios.set(key, entidad);
    this.espacioActual = entidad;

    return this;
  }

  /**
   * Agrega un dispositivo al espacio actual
   */
  agregarDispositivo(
    dispositivoId: number,
    tipo: TipoDispositivo,
    nombre: string = "",
    offsetX: number = 0,
    offsetY: number = 0.5,
    offsetZ: number = 0
  ): this {
    if (!this.espacioActual) {
      throw new Error("Debes agregar un espacio primero con agregarEspacio()");
    }

    const espacioComp = this.ecsManager
      .getComponentes(this.espacioActual)
      ?.get(EspacioComponent);
    const espacioTransform = this.ecsManager
      .getComponentes(this.espacioActual)
      ?.get(Transform);

    if (!espacioComp || !espacioTransform) {
      throw new Error("El espacio actual no tiene los componentes necesarios");
    }

    const entidad = this.ecsManager.agregarEntidad();

    // Posición relativa al espacio
    const x = espacioTransform.x + offsetX;
    const y = espacioTransform.y + offsetY;
    const z = espacioTransform.z + offsetZ;

    this.ecsManager.agregarComponente(
      entidad,
      new Transform(x, y, z, espacioTransform.rotacionY)
    );
    this.ecsManager.agregarComponente(
      entidad,
      new DispositivoComponent(tipo, nombre)
    );

    agregarDispositivo(espacioComp, entidad);
    this.dispositivos.set(dispositivoId, entidad);

    return this;
  }

  /**
   * Obtiene una oficina por ID para modificarla
   */
  // obtenerOficina(oficinaId: number): Entidad | undefined {
  //   return this.oficinas.get(oficinaId);
  // }

  /**
   * Obtiene un espacio por oficina y espacio ID
   */
  obtenerEspacio(oficinaId: number, espacioId: number): Entidad | undefined {
    return this.espacios.get(`${oficinaId}-${espacioId}`);
  }

  /**
   * Obtiene un dispositivo por ID
   */
  // obtenerDispositivo(dispositivoId: number): Entidad | undefined {
  //   return this.dispositivos.get(dispositivoId);
  // }

  /**
   * Modifica la posición de un espacio
   */
  // moverEspacio(
  //   oficinaId: number,
  //   espacioId: number,
  //   x: number,
  //   y: number,
  //   z: number
  // ): this {
  //   const espacio = this.obtenerEspacio(oficinaId, espacioId);
  //   if (espacio) {
  //     const transform = this.ecsManager.getComponentes(espacio)?.get(Transform);
  //     if (transform) {
  //       transform.x = x;
  //       transform.y = y;
  //       transform.z = z;
  //     }
  //   }
  //   return this;
  // }

  /**
   * Construye el escenario a partir de un objeto de configuración
   * Recorre las zonas, oficinas, espacios y dispositivos del objeto y crea las entidades correspondientes
   */
  construirDesdeArchivo(escenario: EscenarioMock): this {
    // Recorrer las zonas
    if (escenario.zonas) {
      for (const zona of escenario.zonas) {
        const zonaId = zona.id ?? 1;
        this.crearZona(zonaId, zona.nombre);

        // Recorrer las oficinas de cada zona
        if (zona.oficinas) {
          for (const oficina of zona.oficinas) {
            const nombreOficina = oficina.nombre ?? `Oficina ${oficina.id}`;
            this.crearOficina(oficina.id, nombreOficina, zonaId);

            // Recorrer los espacios de cada oficina
            if (oficina.espacios) {
              for (const espacio of oficina.espacios) {
                // Valores por defecto para posición
                const posicion = espacio.posicion ?? {
                  x: 0,
                  y: 0,
                  z: 0,
                  rotacionY: 0,
                };
                const x = posicion.x ?? 0;
                const y = posicion.y ?? 0;
                const z = posicion.z ?? 0;
                const rotacionY = posicion.rotacionY ?? 0;

                // Agregar el espacio (mesa/rack)
                this.agregarEspacio(
                  espacio.id,
                  espacio.mueble,
                  x,
                  y,
                  z,
                  rotacionY
                );

                // Agregar los dispositivos del espacio
                if (espacio.dispositivos) {
                  for (const dispositivo of espacio.dispositivos) {
                    this.agregarDispositivo(
                      dispositivo.id,
                      dispositivo.tipo,
                      dispositivo.nombre ?? `Dispositivo ${dispositivo.id}`
                    );
                  }
                }
              }
            }
          }
        }
      }
    }

    return this;
  }

  construir() {
    return {
      oficinas: this.oficinas,
      espacios: this.espacios,
      dispositivos: this.dispositivos,
      ecsManager: this.ecsManager,
    };
  }
}
