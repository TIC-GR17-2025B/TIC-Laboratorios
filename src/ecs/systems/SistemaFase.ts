import { FaseComponent } from "../components";
import { Sistema } from "../core";

export class SistemaFase extends Sistema {
    public componentesRequeridos: Set<Function> = new Set([FaseComponent]);
    
    constructor(){
        super();
    }
    
}