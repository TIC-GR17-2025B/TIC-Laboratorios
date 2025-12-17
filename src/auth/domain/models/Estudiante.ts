export interface Estudiante {
  id_estudiante: number
  codigo_unico: number
  primernombre: string
  segundo_nombre: string
  primer_apellido: string
  segundo_apellido: string
  correo_electronico: string
  contrasenia: string
}

export type EstudianteInput = Omit<Estudiante, 'id_estudiante'>
export type EstudiantePublic = Omit<Estudiante, 'contrasenia'>