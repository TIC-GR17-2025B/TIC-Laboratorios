export interface Curso {
  id_curso: number
  id_profesor: number
  nombre: string  
}

export type CursoInput = Omit<Curso, 'id_curso'>

export interface CursoUpdate {
  id_profesor?: number
  nombre?: string
}

export interface DeleteResult {
  success: boolean
  message: string
}