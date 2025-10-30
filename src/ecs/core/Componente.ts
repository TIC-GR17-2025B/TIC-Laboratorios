export type Entidad = number;

export abstract class Componente {}

export type ClaseComponente<T extends Componente> = new (...args: any[]) => T;

export class ComponenteContainer {
  private map = new Map<Function, Componente>();

  public agregar(componente: Componente): void {
    this.map.set(componente.constructor, componente);
  }

  public get<T extends Componente>(claseComponente: ClaseComponente<T>): T {
    return this.map.get(claseComponente) as T;
  }

  public tiene(claseComponente: Function): boolean {
    return this.map.has(claseComponente);
  }

  public tieneTodos(clasesComponente: Iterable<Function>): boolean {
    for (let clase of clasesComponente) {
      if (!this.map.has(clase)) return false;
    }
    return true;
  }

  public eliminar(claseComponente: Function): void {
    this.map.delete(claseComponente);
  }
}
