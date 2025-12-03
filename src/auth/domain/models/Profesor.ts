export interface Profesor {
  id_profesor: number
  primernombre: string
  segundo_nombre: string
  primer_apellido: string
  segundo_apellido: string
  correo_electronico: string
  contrasenia: string
}

export type ProfesorInput = Omit<Profesor, 'id_profesor'>
export type ProfesorPublic = Omit<Profesor, 'contrasenia'>
