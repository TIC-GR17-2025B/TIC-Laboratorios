import { Componente } from "../core/Componente";

export class Transform extends Componente {
    constructor(
        public x: number,
        public y: number,
        public z: number,
        public rotacionY: number
    ){
        super();
    }
}
