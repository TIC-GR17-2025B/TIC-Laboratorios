import { FaseComponent } from "../components";
import { Sistema, type Entidad } from "../core";

export class SistemaFase extends Sistema {
    public componentesRequeridos: Set<Function> = new Set([FaseComponent]);
    
    constructor(){
        super();
    }

    public actualizar(entidades: Set<Entidad>): void {
        throw new Error("Method not implemented.");
    }
    
}