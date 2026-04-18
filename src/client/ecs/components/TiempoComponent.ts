import { Componente } from "../core/Componente";

export class TiempoComponent extends Componente {
    constructor(
        public transcurrido: number = 0, // tiempo total transcurrido en segundos
        public pausado: boolean = false,
        public tiempoInicialFaseActual: number = 0 // tiempo en el que se terminó una fase y se comenzó la siguiente
    ){
        super();
    }
}
