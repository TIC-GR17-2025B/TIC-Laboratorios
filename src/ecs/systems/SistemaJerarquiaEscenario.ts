import { Sistema } from "../core";
import type { Entidad, ClaseComponente } from "../core/Componente";
import { SistemaRelaciones } from "./SistemaRelaciones";
import {
  EscenarioComponent,
  ZonaComponent,
  OficinaComponent,
  EspacioComponent,
  DispositivoComponent,
} from "../components";
import { PersonaComponent } from "../components/PersonaComponent";

/**
 * Sistema centralizado para gestionar todas las relaciones jerárquicas del escenario.
 * Mantiene un registro único de las relaciones Escenario->Zona->Oficina->Espacio->Dispositivo.
 *
 * Este sistema actúa como fachada para facilitar la navegación en la jerarquía
 * sin necesidad de conocer los detalles internos de cada SistemaRelaciones.
 *
 * Arquitectura:
 * - Se registra una única vez en el ECSManager
 * - ScenarioBuilder y Controllers lo usan sin crear nuevas instancias
 * - Garantiza consistencia de datos entre diferentes partes de la aplicación
 */
export class SistemaJerarquiaEscenario extends Sistema {
  public componentesRequeridos = new Set<ClaseComponente>();

  // Sistemas de relaciones para cada nivel jerárquico
  private relacionEscenarioZona: SistemaRelaciones;
  private relacionZonaOficina: SistemaRelaciones;
  private relacionOficinaEspacio: SistemaRelaciones;
  private relacionEspacioDispositivo: SistemaRelaciones;
  private relacionZonaPersona: SistemaRelaciones;

  constructor() {
    super();

    // Registrar todos los componentes involucrados en la jerarquía
    this.componentesRequeridos.add(EscenarioComponent);
    this.componentesRequeridos.add(ZonaComponent);
    this.componentesRequeridos.add(OficinaComponent);
    this.componentesRequeridos.add(EspacioComponent);
    this.componentesRequeridos.add(DispositivoComponent);
    this.componentesRequeridos.add(PersonaComponent);

    // Inicializar sistemas de relaciones
    this.relacionEscenarioZona = new SistemaRelaciones(
      EscenarioComponent,
      ZonaComponent,
      "zonas"
    );

    this.relacionZonaOficina = new SistemaRelaciones(
      ZonaComponent,
      OficinaComponent,
      "oficinas"
    );

    this.relacionOficinaEspacio = new SistemaRelaciones(
      OficinaComponent,
      EspacioComponent,
      "espacios"
    );

    this.relacionEspacioDispositivo = new SistemaRelaciones(
      EspacioComponent,
      DispositivoComponent,
      "dispositivos"
    );

    this.relacionZonaPersona = new SistemaRelaciones(
      ZonaComponent,
      PersonaComponent,
      "personas"
    );
  }

  /**
   * Inicializa el sistema propagando el ECSManager a todos los subsistemas
   * Llamado automáticamente la primera vez que se usa el sistema
   */
  private inicializarSiEsNecesario(): void {
    if (!this.relacionEscenarioZona.ecsManager) {
      this.relacionEscenarioZona.ecsManager = this.ecsManager;
      this.relacionZonaOficina.ecsManager = this.ecsManager;
      this.relacionOficinaEspacio.ecsManager = this.ecsManager;
      this.relacionEspacioDispositivo.ecsManager = this.ecsManager;
      this.relacionZonaPersona.ecsManager = this.ecsManager;
    }
  }

  // Métodos para AGREGAR relaciones

  agregarZonaAEscenario(escenarioId: Entidad, zonaId: Entidad): void {
    this.inicializarSiEsNecesario();
    this.relacionEscenarioZona.agregar(escenarioId, zonaId);
  }

  agregarOficinaAZona(zonaId: Entidad, oficinaId: Entidad): void {
    this.relacionZonaOficina.agregar(zonaId, oficinaId);
  }

  agregarEspacioAOficina(oficinaId: Entidad, espacioId: Entidad): void {
    this.relacionOficinaEspacio.agregar(oficinaId, espacioId);
  }

  agregarDispositivoAEspacio(espacioId: Entidad, dispositivoId: Entidad): void {
    this.relacionEspacioDispositivo.agregar(espacioId, dispositivoId);
  }

  agregarPersonaAZona(personaId: Entidad, zonaId: Entidad): void {
    this.relacionZonaPersona.agregar(personaId, zonaId);
  }

  // Métodos para OBTENER hijos

  obtenerZonasDeEscenario(escenarioId: Entidad): Entidad[] {
    return this.relacionEscenarioZona.obtenerHijos(escenarioId);
  }

  obtenerOficinasDeZona(zonaId: Entidad): Entidad[] {
    return this.relacionZonaOficina.obtenerHijos(zonaId);
  }

  obtenerEspaciosDeOficina(oficinaId: Entidad): Entidad[] {
    return this.relacionOficinaEspacio.obtenerHijos(oficinaId);
  }

  obtenerDispositivosDeEspacio(espacioId: Entidad): Entidad[] {
    return this.relacionEspacioDispositivo.obtenerHijos(espacioId);
  }

  obtenerPersonasDeZona(zonaId: Entidad): Entidad[] {
    return this.relacionZonaPersona.obtenerHijos(zonaId);
  }

  // Métodos para OBTENER padre directo

  obtenerEscenarioDeZona(zonaId: Entidad): Entidad | undefined {
    return this.relacionEscenarioZona.obtenerPadre(zonaId);
  }

  obtenerZonaDeOficina(oficinaId: Entidad): Entidad | undefined {
    return this.relacionZonaOficina.obtenerPadre(oficinaId);
  }

  obtenerOficinaDeEspacio(espacioId: Entidad): Entidad | undefined {
    return this.relacionOficinaEspacio.obtenerPadre(espacioId);
  }

  obtenerEspacioDeDispositivo(dispositivoId: Entidad): Entidad | undefined {
    return this.relacionEspacioDispositivo.obtenerPadre(dispositivoId);
  }

  obtenerZonaDePersona(personaId: Entidad): Entidad | undefined {
    return this.relacionZonaPersona.obtenerPadre(personaId);
  }

  // Métodos para NAVEGACIÓN en jerarquía (múltiples niveles)

  /**
   * Obtiene la zona a la que pertenece un dispositivo
   * Navega: Dispositivo -> Espacio -> Oficina -> Zona
   */
  obtenerZonaDeDispositivo(dispositivoId: Entidad): Entidad | undefined {
    const espacioId = this.obtenerEspacioDeDispositivo(dispositivoId);
    //console.log("ESPACIO ID", espacioId);
    if (!espacioId) return undefined;

    const oficinaId = this.obtenerOficinaDeEspacio(espacioId);
    //console.log("OFICINA ID", oficinaId);
    if (!oficinaId) return undefined;

    return this.obtenerZonaDeOficina(oficinaId);
  }

  /**
   * Obtiene la oficina a la que pertenece un dispositivo
   * Navega: Dispositivo -> Espacio -> Oficina
   */
  obtenerOficinaDeDispositivo(dispositivoId: Entidad): Entidad | undefined {
    const espacioId = this.obtenerEspacioDeDispositivo(dispositivoId);
    if (!espacioId) return undefined;

    return this.obtenerOficinaDeEspacio(espacioId);
  }

  /**
   * Obtiene la zona a la que pertenece un espacio
   * Navega: Espacio -> Oficina -> Zona
   */
  obtenerZonaDeEspacio(espacioId: Entidad): Entidad | undefined {
    const oficinaId = this.obtenerOficinaDeEspacio(espacioId);
    if (!oficinaId) return undefined;

    return this.obtenerZonaDeOficina(oficinaId);
  }

  /**
   * Obtiene todos los dispositivos de una oficina (en todos sus espacios)
   */
  obtenerDispositivosDeOficina(oficinaId: Entidad): Entidad[] {
    const espacios = this.obtenerEspaciosDeOficina(oficinaId);
    const dispositivos: Entidad[] = [];

    for (const espacioId of espacios) {
      dispositivos.push(...this.obtenerDispositivosDeEspacio(espacioId));
    }

    return dispositivos;
  }

  /**
   * Obtiene todos los dispositivos de una zona (en todas sus oficinas y espacios)
   */
  obtenerDispositivosDeZona(zonaId: Entidad): Entidad[] {
    const oficinas = this.obtenerOficinasDeZona(zonaId);
    const dispositivos: Entidad[] = [];

    for (const oficinaId of oficinas) {
      dispositivos.push(...this.obtenerDispositivosDeOficina(oficinaId));
    }

    return dispositivos;
  }

  // Métodos para REMOVER relaciones

  removerZonaDeEscenario(escenarioId: Entidad, zonaId: Entidad): void {
    this.relacionEscenarioZona.remover(escenarioId, zonaId);
  }

  removerOficinaDeZona(zonaId: Entidad, oficinaId: Entidad): void {
    this.relacionZonaOficina.remover(zonaId, oficinaId);
  }

  removerEspacioDeOficina(oficinaId: Entidad, espacioId: Entidad): void {
    this.relacionOficinaEspacio.remover(oficinaId, espacioId);
  }

  removerDispositivoDeEspacio(
    espacioId: Entidad,
    dispositivoId: Entidad
  ): void {
    this.relacionEspacioDispositivo.remover(espacioId, dispositivoId);
  }

  removerPersonaDeZona(zonaId: Entidad, personaId: Entidad): void {
    this.relacionZonaPersona.remover(zonaId, personaId);
  }

  // Métodos de utilidad

  /**
   * Limpia todas las relaciones del sistema
   */
  limpiarTodo(): void {
    this.relacionEscenarioZona.limpiar();
    this.relacionZonaOficina.limpiar();
    this.relacionOficinaEspacio.limpiar();
    this.relacionEspacioDispositivo.limpiar();
    this.relacionZonaPersona.limpiar();
  }
}
