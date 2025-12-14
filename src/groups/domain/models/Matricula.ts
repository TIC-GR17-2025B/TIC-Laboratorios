export interface Matricula {
  id_matricula: number
  id_curso: number
  id_estudiante: number
  fecha: Date
}

export type MatriculaInput = Omit<Matricula, 'id_matricula'>

export interface MatriculaByCode {
  codigo_curso: string
  id_estudiante: number
}

export interface MatriculaUpdate {
  id_curso?: number
  id_estudiante?: number
}