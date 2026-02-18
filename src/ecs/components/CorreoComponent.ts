import { Componente } from "../core";

export class CorreoComponent extends Componente {
    constructor(
        public destinatario: string,
        public asunto: string,
        public mensaje: string
    ){
        super();
    }
}
