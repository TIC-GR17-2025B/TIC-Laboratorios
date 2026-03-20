export interface Progreso {
    id_progreso: number;
    id_estudiante: number;
    slug_escenario: string;
    terminado: boolean;
    tiempo: number;
}

export type ProgresoInput = Omit<Progreso, 'id_progreso'>;

export interface ProgresoConNombreEscenario {
    id_progreso: number;
    id_estudiante: number;
    slug_escenario: string;
    nombre_escenario: string;
    terminado: boolean;
    tiempo: number | null;
    fecha_creacion: string | null;
}

export interface ProgresoResumen {
    terminado: boolean;
    intentos: number;
}
