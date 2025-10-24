import { ComponenteContainer, Componente, type Entidad } from "./Componente"
import type { Sistema } from "./Sistema"

export class ECSManager {
    private entidades = new Map<Entidad, ComponenteContainer>()
    private sistemas = new Map<Sistema, Set<Entidad>>()

    private idSiguienteEntidad: number = 0
    private entidadesADestruir = new Array<Entidad>()

    // Para Entidades

    public agregarEntidad(): Entidad {
        let entidad = this.idSiguienteEntidad;
        this.idSiguienteEntidad++;
        this.entidades.set(entidad, new ComponenteContainer());
        return entidad;
    }

    public removerEntidad(entidad: Entidad): void{
        this.entidadesADestruir.push(entidad);
    }

    // Para Componentes

    public agregarComponente(entidad: Entidad, componente: Componente): void {
        this.entidades.get(entidad)?.agregar(componente);
        this.verificarEntidad(entidad);
    }

    public getComponentes(entidad: Entidad): ComponenteContainer | undefined {
        return this.entidades.get(entidad);
    }

    public removerComponente(entidad: Entidad, claseComponente: Function): void {
        this.entidades.get(entidad)?.eliminar(claseComponente);
        this.verificarEntidad(entidad);
    }

    // Para Sistemas

    public agregarSistema(sistema: Sistema): void {
        if (sistema.componentesRequeridos.size == 0) {
            console.warn(`Sistema ${sistema} no agregado: lista de componentes vacía.`);
            return;
        }

        sistema.ecsManager = this;

        this.sistemas.set(sistema, new Set());
        for (let entidad of this.entidades.keys()) {
            this.verificarEntidadSistema(entidad, sistema);
        }
    }

    public removerSistema(sistema: Sistema): void {
        this.sistemas.delete(sistema);
    }

    public actualizar(): void {
        for (let [sistema, entidades] of this.sistemas.entries()) {
            sistema.actualizar(entidades)
        }
        while (this.entidadesADestruir.length > 0) {
            const entidad = this.entidadesADestruir.pop();
            if (entidad !== undefined) {
                this.destruirEntidad(entidad);
            }
        }
    }

    // Para verificaciones internas

    private destruirEntidad(entidad: Entidad): void {
        this.entidades.delete(entidad);
        for (let entidades of this.sistemas.values()) {
            entidades.delete(entidad);
        }
    }

    private verificarEntidad(entidad: Entidad): void {
        for (let sistema of this.sistemas.keys()) {
            this.verificarEntidadSistema(entidad, sistema);
        }
    }

    private verificarEntidadSistema(entidad: Entidad, sistema: Sistema): void {
        let componenteContainer = this.entidades.get(entidad);
        let componentesRequeridos = sistema.componentesRequeridos;
        if (componenteContainer?.tieneTodos(componentesRequeridos)) {
            this.sistemas.get(sistema)?.add(entidad);
        } else {
            this.sistemas.get(sistema)?.delete(entidad);
        }
    }
}
