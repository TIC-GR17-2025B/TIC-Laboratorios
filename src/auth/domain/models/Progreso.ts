export interface Progreso {
    id_progreso: number;
    id_estudiante: number;
    id_escenario: number;
    terminado: boolean;
    tiempo: number;
}

export type ProgresoInput = Omit<Progreso, 'id_progreso'>;
