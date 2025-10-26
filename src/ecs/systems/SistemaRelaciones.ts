import type { Entidad } from "../core/Componente";
import { Sistema } from "../core";

/**
 * Sistema genérico para gestionar relaciones padre -> hijo.
 * Ejemplos de uso: Zona->Oficina, Oficina->Espacio, Espacio->Dispositivo.
 * Se parametriza por la clase del componente padre, la clase del componente hijo
 * y el nombre de la propiedad en el componente padre que contiene el array de hijos.
 */
export class SistemaRelaciones extends Sistema {
  // Conjunto de componentes requeridos por este sistema (se completa en el constructor)
  public componentesRequeridos = new Set<Function>();

  constructor(
    private ClasePadre: Function,
    private ClaseHijo: Function,
    private propiedadPadre: string // nombre de la propiedad en el componente padre que contiene Entidad[]
  ) {
    super();
    // registrar ambos tipos para que el ECS pueda filtrar entidades si hace falta
    this.componentesRequeridos.add(this.ClasePadre);
    this.componentesRequeridos.add(this.ClaseHijo);
  }

  // Añade childId al array padre[propiedadPadre] si existen ambos componentes
  agregar(padreId: Entidad, hijoId: Entidad): void {
    const padre = this.ecsManager
      ?.getComponentes(padreId)
      ?.get(this.ClasePadre as any);
    const hijo = this.ecsManager
      ?.getComponentes(hijoId)
      ?.get(this.ClaseHijo as any);
    if (!padre || !hijo) return;

    const arr = (padre as any)[this.propiedadPadre] as Entidad[] | undefined;
    if (!Array.isArray(arr)) return;
    if (!arr.includes(hijoId)) arr.push(hijoId);
  }

  // Devuelve copia del array de hijos
  obtenerHijos(padreId: Entidad): Entidad[] {
    const padre = this.ecsManager
      ?.getComponentes(padreId)
      ?.get(this.ClasePadre as any);
    const arr = padre
      ? ((padre as any)[this.propiedadPadre] as Entidad[] | undefined)
      : undefined;
    return arr ? [...arr] : [];
  }
}
