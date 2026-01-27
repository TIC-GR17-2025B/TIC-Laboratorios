import { ActivoComponent, DispositivoComponent } from "../components";
import { Sistema, type ClaseComponente, type Entidad } from "../core";

export class SistemaComandos extends Sistema {
    public componentesRequeridos: Set<ClaseComponente> = new Set();
    private MENSAJE_AYUDA: string = "Parece que el comando ingresado no existe o tiene un formato inválido. Ingresa 'h' para ver todos los comandos disponibles.";
    private entidadDispAnterior: Entidad = -1;
    private entidadDispActual: Entidad = -1;

    public iniciarSistemaComandos(entidadDispActual: Entidad) {
        this.entidadDispActual = entidadDispActual;
    }

    public ejecutarComando(c: string): string {
        const comando = this.formatearEntradaComando(c);

        const numArgumentos = comando.length;

        let respuesta = "";

        switch(numArgumentos){
            case 0: return respuesta;
            case 1: {
                switch(comando[0]) {
                    case "h": {
                        respuesta = this.ejecutarH();
                        break;
                    }
                    case "ls": respuesta = this.ejecutarLS(); break;
                    default: respuesta = this.MENSAJE_AYUDA; break;
                }
                break;
            }
            case 2: {
                switch(comando[0]) {
                    case "cat": respuesta = this.ejecutarCAT(comando[1]); break;
                    case "ssh": respuesta = this.ejecutarSSH(comando[1]); break;
                    default: respuesta = this.MENSAJE_AYUDA; break;
                }
                break;
            }
            default: respuesta = this.MENSAJE_AYUDA; break;
        }

        return respuesta;
    }

    private ejecutarLS(): string {
        const activosDisp = this.ecsManager.getComponentes(this.entidadDispActual)?.get(ActivoComponent);
        let lista = "";
        for (const activo of (activosDisp?.activos ?? [])) {
            lista += activo.nombre+"\n";
        }
        return lista;
    }

    private ejecutarCAT(nombreArchivo: string): string {
        const activosDisp = this.ecsManager.getComponentes(this.entidadDispActual)?.get(ActivoComponent);
        for (const activo of (activosDisp?.activos ?? [])) {
            if (activo.nombre == nombreArchivo) return activo.contenido!;
        }
        return `Error: No existe el archivo '${nombreArchivo}'`;
    }

    private ejecutarSSH(argumentoSSH: string): string {
        const credenciales = argumentoSSH.split("@");
        const usuario = credenciales[0];
        const equipoYContrasenia = credenciales[1];
        const equipYContrSeparados = equipoYContrasenia.split(":");
        const nombreEquipo = equipYContrSeparados[0];
        const contrasenia = equipYContrSeparados[1];

        let entidadDispAConectar = null;
        for (const [entidad, container] of this.ecsManager.getEntidades()) {
            const dispositivo = container.get(DispositivoComponent);
            if (dispositivo && dispositivo.nombreEquipo === nombreEquipo) {
                entidadDispAConectar = entidad;
                break;
            }
        }

        if (!entidadDispAConectar) return `Error: No se ha encontrado el dispositivo '${nombreEquipo}'.`;

        const usuarioDisp = this.ecsManager.getComponentes(entidadDispAConectar)?.get(DispositivoComponent)?.usuario;

        if (!usuarioDisp) return `Error: No existe el usuario '${usuarioDisp}' en el dispositivo '${nombreEquipo}'`;

        return 
    }

    private ejecutarH(): string {
        return "Comandos disponibles:\nh\tVer este mensaje de ayuda\n"+
               "cat\tMostrar el contenido de un archivo -> cat nombreArchivo\n"+
               "ls\tListar los archivos del equipo actual\n"+
               "ssh\tAcceder remótamente a un dispositivo -> ssh usuario@nombre-dispositivo:contraseña\n";
    }

    // Quita todos los espacios en blanco y deja los textos/palabras
    // separados en un array
    private formatearEntradaComando(entrada: string): string[] {
        return entrada.trim().split(/\s+/);
    }
}
