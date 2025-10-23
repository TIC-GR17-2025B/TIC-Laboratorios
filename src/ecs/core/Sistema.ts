import type { Entidad } from "./Componente";
import { ECSManager } from "./ECSManager";

export abstract class Sistema {
    public abstract componentesRequeridos: Set<Function>

    public abstract actualizar(entidades: Set<Entidad>): void

    public ecsManager!: ECSManager
}
