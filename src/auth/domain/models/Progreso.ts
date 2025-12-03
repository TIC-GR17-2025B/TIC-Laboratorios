export interface Progreso {
    id_progreso: number;
    id_estudiante: number;
    id_escenario: number;
    terminado: boolean;
    tiempo: number;
}

export type ProgresoInput = Omit<Progreso, 'id_progreso'>;

export interface ProgresoConNombreEscenario {
    id_progreso: number;
    id_estudiante: number;
    nombre_escenario: string;
    terminado: boolean;
    tiempo: number | null;
}

export interface ProgresoResumen {
    terminado: boolean;
    intentos: number;
}
