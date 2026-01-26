import { ActivoComponent } from "../components";
import { Sistema, type ClaseComponente, type Entidad } from "../core";

export class SistemaComandos extends Sistema {
    public componentesRequeridos: Set<ClaseComponente> = new Set();
    private MENSAJE_AYUDA: string = "Parece que el comando ingresado no existe o tiene un formato inválido. Ingresa 'h' para ver todos los comandos disponibles."

    public ejecutarComando(c: string, entidadDispActual?: Entidad): string {
        const comando = this.formatearEntradaComando(c);

        const numArgumentos = comando.length;

        let respuesta = "";

        switch(numArgumentos){
            case 0: return respuesta;
            case 1: {
                switch(comando[0]) {
                    case "h": {
                        respuesta = "Comandos disponibles:\nh\tVer este mensaje de ayuda\n"+
                                     "cat\tMostrar el contenido de un archivo -> cat nombreArchivo\n"+
                                     "ls\tListar los archivos del equipo actual\n"+
                                     "ssh\tAcceder remótamente a un dispositivo -> ssh usuario@nombre-dispositivo";
                        break;
                    }
                    case "ls": respuesta = this.ejecutarLS(entidadDispActual!); break;
                    default: respuesta = this.MENSAJE_AYUDA; break;
                }
                break;
            }
            case 2: {
                switch(comando[0]) {
                    case "cat": respuesta = this.ejecutarCAT(comando[1], entidadDispActual!); break;
                    case "ssh": respuesta = this.ejecutarSSH(comando[1]); break;
                    default: respuesta = this.MENSAJE_AYUDA; break;
                }
                break;
            }
            default: respuesta = this.MENSAJE_AYUDA; break;
        }

        return respuesta;
    }

    private ejecutarLS(entidadDispActual: Entidad): string {
        const activosDisp = this.ecsManager.getComponentes(entidadDispActual)?.get(ActivoComponent);
        let lista = "";
        for (const activo of (activosDisp?.activos ?? [])) {
            lista += activo.nombre+"\n";
        }
        return lista;
    }

    private ejecutarCAT(nombreArchivo: string, entidadDispActual: Entidad): string {
        const activosDisp = this.ecsManager.getComponentes(entidadDispActual)?.get(ActivoComponent);
        for (const activo of (activosDisp?.activos ?? [])) {
            if (activo.nombre == nombreArchivo) return activo.contenido!;
        }
        return `Error: No existe el archivo '${nombreArchivo}'`;
    }

    private ejecutarSSH(argumentoSSH: string): string {
        const credenciales = argumentoSSH.split("@");
        const usuario = credenciales[0];
        const dispositivo = credenciales[1];
    }

    // Quita todos los espacios en blanco y deja los textos/palabras
    // separados en un array
    private formatearEntradaComando(entrada: string): string[] {
        return entrada.trim().split(/\s+/);
    }
}
