export interface Curso {
  id_curso: number
  id_profesor: number
  nombre: string  
}

export type CursoInput = Omit<Curso, 'id_curso'>