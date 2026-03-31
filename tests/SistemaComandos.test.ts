import { ECSManager, Entidad } from "../src/ecs/core";
import { SistemaComandos } from "../src/ecs/systems";
import { ActivoComponent, DispositivoComponent } from "../src/ecs/components";
import { ComandoTerminal, EstadoAtaqueDispositivo, TipoActivo, TipoDispositivo } from "../src/types/DeviceEnums";
import { beforeEach, test, describe, expect } from "vitest";

describe("SistemaComandos", () => {

    let em: ECSManager;
    let sistemaComandos: SistemaComandos;
    let entidadDispJacob: Entidad;
    let activoComponente: ActivoComponent;
    let entidadDispLisa: Entidad;
    let comando: string;

    beforeEach(() => {
        em = new ECSManager();
        
        sistemaComandos = new SistemaComandos();
        em.agregarSistema(sistemaComandos);

        entidadDispJacob = em.agregarEntidad();
        em.agregarComponente(
            entidadDispJacob,
            new DispositivoComponent(
                "Computadora Jacob",
                "Windows",
                "DELL",
                TipoDispositivo.WORKSTATION,
                EstadoAtaqueDispositivo.NORMAL,
                "pc-jacob",
                "jgarcia",
                "j123"
            )
        );

        activoComponente = new ActivoComponent();
        activoComponente.activos.push(
            {
                nombre: "Activo1",
                contenido: "Infor importante",
                tipo: TipoActivo.DOCUMENTO
            },
            {
                nombre: "Activo2",
                contenido: "Infor importante 2",
                tipo: TipoActivo.DOCUMENTO
            },
        );
        em.agregarComponente(entidadDispJacob, activoComponente);

        entidadDispLisa = em.agregarEntidad();
        em.agregarComponente(
            entidadDispLisa,
            new DispositivoComponent(
                "Computadora Lisa",
                "Windows",
                "DELL",
                TipoDispositivo.WORKSTATION,
                EstadoAtaqueDispositivo.NORMAL,
                "pc-lisa",
                "lrodriguez",
                "l123"
            )
        );
    });

    test("ejecución de comando vacío", () => {
        sistemaComandos.iniciarSistemaComandos(entidadDispJacob);

        comando = "";

        let respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispJacob);
        expect(respuesta.texto).toBe("");

        comando = " ";

        respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispJacob);
        expect(respuesta.texto).toBe("");
    });

    test("ejecución de comando no válido", () => {
        const mensajeAyuda = "Parece que el comando ingresado no existe o tiene un formato inválido. Ingresa 'h' para ver todos los comandos disponibles."

        sistemaComandos.iniciarSistemaComandos(entidadDispJacob);

        comando = "asdgf";

        let respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispJacob);
        expect(respuesta.texto).toBe(mensajeAyuda);

        comando = "asdgf asjdb";

        respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispJacob);
        expect(respuesta.texto).toBe(mensajeAyuda);
    });

    test("ejecución comando 'h'", () => {
        const comandosDisponibles = Object.values(ComandoTerminal); 

        sistemaComandos.iniciarSistemaComandos(entidadDispJacob);
        
        comando = ComandoTerminal.H; 

        const respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispJacob);
        expect(respuesta.texto).contains("Comandos disponibles:\n");
        comandosDisponibles.forEach((c) => {
            expect(respuesta.texto).contains(c+"\t");
        });
    });

    test("ejecución comando 'ls'", () => {
        sistemaComandos.iniciarSistemaComandos(entidadDispJacob);

        comando = ComandoTerminal.LS;

        const respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispJacob);
        activoComponente.activos.forEach((a) => {
            expect(respuesta.texto).contains(a.nombre+"\n");
        });
    });

    test("ejecución comando 'cat'", () => {
        sistemaComandos.iniciarSistemaComandos(entidadDispJacob);

        comando = "cat Activo1";

        const respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispJacob);
        expect(respuesta.texto).toBe(activoComponente.activos[0].contenido);
    });

    test("ejecución comando 'cat' con archivo que no existe", () => {
        sistemaComandos.iniciarSistemaComandos(entidadDispJacob);

        const archivoInexistente = "archivo_inexistente";
        comando = "cat "+archivoInexistente;

        const respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispJacob);
        expect(respuesta.texto).toBe(`Error: No existe el archivo '${archivoInexistente}'`);
    });

    test("ejecución comando 'ssh'", () => {
        sistemaComandos.iniciarSistemaComandos(entidadDispLisa);

        comando = "ssh jgarcia@pc-jacob j123"; // En el frontend se controla el ingreso de la contraseña como tercer argumento del comando

        const respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispJacob);
        expect(respuesta.texto).toBe(`¡Bienvenido de nuevo jgarcia!\nEscribe 'h' para ver todos los comandos disponibles.\n`);
    });

    test("ejecución comando 'ssh' con equipo inexistente", () => {
        sistemaComandos.iniciarSistemaComandos(entidadDispLisa);

        comando = "ssh jgarcia@pc-aaaa j123";

        const respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispLisa);
        expect(respuesta.texto).toBe(`Error: No se ha encontrado el dispositivo 'pc-aaaa'.`);
    });

    test("ejecución comando 'ssh' con usuario inexistente", () => {
        sistemaComandos.iniciarSistemaComandos(entidadDispLisa);

        comando = "ssh abcdfg@pc-jacob j123";

        const respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispLisa);
        expect(respuesta.texto).toBe(`Error: No existe el usuario 'abcdfg' en el dispositivo 'pc-jacob'.`);
    });

    test("ejecución comando 'ssh' con contraseña incorrecta", () => {
        sistemaComandos.iniciarSistemaComandos(entidadDispLisa);

        comando = "ssh jgarcia@pc-jacob j7777";

        const respuesta = sistemaComandos.ejecutarComando(comando);

        expect(respuesta.entidadActual).toBe(entidadDispLisa);
        expect(respuesta.texto).toBe(`Error: Contraseña incorrecta para el usuario 'jgarcia'.`);
    });
});
