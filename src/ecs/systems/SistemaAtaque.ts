import { Componente, Sistema, type Entidad } from "../core";

export class ComponenteParaTest extends Componente{
    constructor(public x: number){ super();}
}

export class SistemaAtaque extends Sistema {
    // Valores e implentaciones arbitrarios. TOCA CAMBIAR
    public componentesRequeridos: Set<Function> = new Set([ComponenteParaTest]);
    public entidadesProcesadas: Entidad[] = []; // Solo para tests

    public actualizar(entidades: Set<Entidad>): void {
        this.entidadesProcesadas = Array.from(entidades);
    }
}
