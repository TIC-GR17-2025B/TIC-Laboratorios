import { Componente } from "../core";

// Componente generalizado para cualquier evento de la simulación.
/* Es prácticamente como el de ataque, por lo que los atributos homónimos de aquí
   tienen el mismo significado. Es una nueva aparte del de ataque para no romper tanto
   lo que ya se tenía. La lógica es prácticamente la misma, y no es conveniente estar
   modificando todos los archivos involucrados para cada tipo de evento que vaya apareciendo
   durante el desarrollo, por lo cual, se
*/
export class EventoComponent extends Componente {
    constructor(
        public nombreEvento: string,
        public tiempoNotificacion: number,
        public descripcion: string,
        public fase: number,
        public tiempoEnOcurrir: number = tiempoNotificacion + 10,
        // Similar a condicionAMitigar en AtaqueComponent, pero en este caso es para brindar cualquier infor útil adicional
        public infoAdicional?: unknown,
    ) {
        super();
    }
}