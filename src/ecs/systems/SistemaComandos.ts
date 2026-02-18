import { AccionesRealizables, ObjetosManejables } from "../../types/AccionesEnums";
import type { RespuestaComando } from "../../types/EscenarioTypes";
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

    public ejecutarComando(c: string): RespuestaComando {
        const comando = this.formatearEntradaComando(c);

        const numArgumentos = comando.length;

        let respuesta = { texto: "", entidadActual: this.entidadDispActual };

        switch(numArgumentos){
            case 0: return respuesta;
            case 1: {
                switch(comando[0]) {
                    case "h": respuesta = this.ejecutarH(); break;
                    case "ls": respuesta = this.ejecutarLS(); break;
                    default: respuesta = {texto: this.MENSAJE_AYUDA, entidadActual: this.entidadDispActual}; break;
                }
                break;
            }
            case 2: {
                switch(comando[0]) {
                    case "cat": respuesta = this.ejecutarCAT(comando[1]); break;
                    default: respuesta = {texto: this.MENSAJE_AYUDA, entidadActual: this.entidadDispActual}; break;
                }
                break;
            }
            case 3: {
                switch(comando[0]) {
                    case "ssh": respuesta = this.ejecutarSSH(comando[1], comando[2]); break;
                    default: respuesta = {texto: this.MENSAJE_AYUDA, entidadActual: this.entidadDispActual}; break;
                }
                break;
            }
            default: respuesta = {texto: this.MENSAJE_AYUDA, entidadActual: this.entidadDispActual}; break;
        }

        return respuesta;
    }

    private ejecutarLS(): RespuestaComando {
        const activosDisp = this.ecsManager.getComponentes(this.entidadDispActual)?.get(ActivoComponent);
        const nombreDisp = this.ecsManager.getComponentes(this.entidadDispActual)?.get(DispositivoComponent)?.nombre;
        let lista = "";
        for (const activo of (activosDisp?.activos ?? [])) {
            lista += activo.nombre+"\n";
        }

        this.ecsManager.registrarAccion(
            AccionesRealizables.EJECUTAR,
            ObjetosManejables.COMANDO,
            0,
            {
                comando: "ls",
                nombreDispositivo: nombreDisp
            }
        );

        return { texto: lista, entidadActual: this.entidadDispActual};
    }

    private ejecutarCAT(nombreArchivo: string): RespuestaComando {
        const activosDisp = this.ecsManager.getComponentes(this.entidadDispActual)?.get(ActivoComponent);
        const nombreDisp = this.ecsManager.getComponentes(this.entidadDispActual)?.get(DispositivoComponent)?.nombre;
        for (const activo of (activosDisp?.activos ?? [])) {
            if (activo.nombre == nombreArchivo) {
                
                this.ecsManager.registrarAccion(
                    AccionesRealizables.EJECUTAR,
                    ObjetosManejables.COMANDO,
                    0,
                    {
                        comando: "cat",
                        archivo: nombreArchivo,
                        nombreDispositivo: nombreDisp
                    }
                );

                return { texto: activo.contenido!, entidadActual: this.entidadDispActual };
            }
        }
        return { texto: `Error: No existe el archivo '${nombreArchivo}'`, entidadActual: this.entidadDispActual };
    }

    private ejecutarSSH(usuarioYEquipo: string, contrasenia: string): RespuestaComando {
        const credenciales = usuarioYEquipo.split("@");
        const usuario = credenciales[0];
        const nombreEquipo = credenciales[1]; 

        let entidadDispAConectar = null;
        for (const [entidad, container] of this.ecsManager.getEntidades()) {
            const dispositivo = container.get(DispositivoComponent);
            if (dispositivo && dispositivo.nombreEquipo === nombreEquipo) {
                entidadDispAConectar = entidad;
                break;
            }
        }

        if (!entidadDispAConectar) return { 
            texto: `Error: No se ha encontrado el dispositivo '${nombreEquipo}'.`,
            entidadActual: this.entidadDispActual
        };

        const usuarioDisp = this.ecsManager.getComponentes(entidadDispAConectar)?.get(DispositivoComponent)?.usuario;

        if (usuario != usuarioDisp) return {
            texto: `Error: No existe el usuario '${usuario}' en el dispositivo '${nombreEquipo}'.`,
            entidadActual: this.entidadDispActual
        };

        const contraDisp = this.ecsManager.getComponentes(entidadDispAConectar)?.get(DispositivoComponent)?.contrasenia;

        if (contrasenia != contraDisp) return {
            texto: `Error: Contraseña incorrecta para el usuario '${usuario}'.`,
            entidadActual: this.entidadDispActual
        };

        this.entidadDispAnterior = this.entidadDispActual;
        this.entidadDispActual = entidadDispAConectar;

        const nombreDispositivoAnterior = this.ecsManager.getComponentes(this.entidadDispAnterior)?.get(DispositivoComponent)?.nombre;

        this.ecsManager.registrarAccion(
            AccionesRealizables.EJECUTAR,
            ObjetosManejables.COMANDO,
            0,
            {
                comando: "ssh",
                nombreEquipo: nombreEquipo,
                usuario: usuario,
                contrasenia: contrasenia,
                conectadoDesde: nombreDispositivoAnterior
            }
        );

        return {
            texto: `¡Bienvenido de nuevo ${usuario}!\nEscribe 'h' para ver todos los comandos disponibles.\n`,
            entidadActual: this.entidadDispActual
        };
    }

    private ejecutarH(): RespuestaComando {
        return { 
            texto: "Comandos disponibles:\nh\tVer este mensaje de ayuda\n"+
                   "cat\tMostrar el contenido de un archivo -> cat nombreArchivo\n"+
                   "ls\tListar los archivos del equipo actual\n"+
                   "ssh\tAcceder remótamente a un dispositivo -> ssh usuario@nombre-dispositivo\n",
            entidadActual: this.entidadDispActual
        };
    }

    // Quita todos los espacios en blanco y deja los textos/palabras
    // separados en un array
    private formatearEntradaComando(entrada: string): string[] {
        return entrada.trim().split(/\s+/);
    }
}
