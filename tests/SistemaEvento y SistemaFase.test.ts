import { describe, beforeEach, test, expect } from "vitest";
import { ECSManager, Entidad } from "../src/ecs/core";
import { SistemaEvento, SistemaFase, SistemaPresupuesto, SistemaRed } from "../src/ecs/systems";
import { EstadoAtaqueDispositivo, TipoActivo, TipoAtaque, TipoDispositivo, TipoEvento } from "../src/types/DeviceEnums";
import { AccionesRealizables, ObjetosManejables } from "../src/types/AccionesEnums";
import { ActivoComponent, AtaqueComponent, DispositivoComponent, EscenarioComponent, EventoComponent, FaseComponent, RedComponent, RouterComponent, WorkstationComponent } from "../src/ecs/components";
import { PlantillasCorreoPhishing } from "../src/data/plantillas/Plantillas";
import { FirewallBuilder } from "../src/ecs/utils/FirewallBuilder";
import { RedController } from "../src/ecs/controllers/RedController";

describe("SistemaEvento y SistemaFase", () => {

    let em: ECSManager;
    let sistemaEvento: SistemaEvento;
    let entidadDispJacob: Entidad;
    let entidadDispLisa: Entidad;
    let sistemaPresupuesto: SistemaPresupuesto;
    let sistemaFase: SistemaFase;
    let entidadEscenario: Entidad;
    let fases: FaseComponent[];
    let activoComponenteJacob: ActivoComponent;
    let activoComponenteLisa: ActivoComponent;
    let eventos: EventoComponent[];
    let redController: RedController;

    const ataques: AtaqueComponent[] = [
        new AtaqueComponent(
          "ataque troyano",
          5,
          TipoAtaque.INFECCION_TROYANO,
          "Computadora Jacob",
          "Un dispositivo está por ser infectado con un troyano. Revisa la activación del antivirus para evitarlo.",
          1,
          {
            accion: AccionesRealizables.CLICK,
            objeto: ObjetosManejables.CONFIG_WORKSTATION,
            val: [ // Estas 2 por defecto son falsas, por lo que se quiere verificar que se han activado (puesto en true)
               {
                 nombreConfig: "Actualizaciones automáticas de antivirus", 
                 activado: true,
               },
               {
                 nombreConfig: "Antivirus gestionado",
                 activado: true,
               }
            ],
          },
        ),
    ];

    beforeEach(() => {
        em = new ECSManager();

        sistemaFase = new SistemaFase();
        em.agregarSistema(sistemaFase);
        sistemaFase.iniciarEscuchaDeEvento();

        sistemaEvento = new SistemaEvento();
        em.agregarSistema(sistemaEvento); 

        sistemaPresupuesto = new SistemaPresupuesto();
        em.agregarSistema(sistemaPresupuesto);

        const sistemaRed = new SistemaRed();
        em.agregarSistema(sistemaRed);

        redController = RedController.getInstance(em);
        redController.iniciarController();

        entidadEscenario = em.agregarEntidad();
        em.agregarComponente(entidadEscenario, new EscenarioComponent(1, "escenario", "escenario", 10));  

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
        em.agregarComponente(
            entidadDispJacob,
            new WorkstationComponent()
        );
        activoComponenteJacob = new ActivoComponent();
        activoComponenteJacob.activos.push(
            {
                nombre: "Activo1",
                contenido: "Infor importante",
                tipo: TipoActivo.DOCUMENTO
            }
        );
        em.agregarComponente(entidadDispJacob, activoComponenteJacob);

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
        activoComponenteLisa = new ActivoComponent();
        em.agregarComponente(entidadDispLisa, activoComponenteLisa);

        const router = em.agregarEntidad();
        em.agregarComponente(
          router,
          new DispositivoComponent(
            "router1",
            "Cisco",
            "hw",
            TipoDispositivo.ROUTER,
            EstadoAtaqueDispositivo.NORMAL,
            "router1",
            "admin",
            "1234"
          )
        );

        const red1 = em.agregarEntidad();
        em.agregarComponente(red1, new RedComponent("LAN1", "#00DD00"));

        const firewallConfig = new FirewallBuilder().build();
        em.agregarComponente(router, new RouterComponent(firewallConfig));

        sistemaRed.asignarRed(entidadDispJacob, red1);
        sistemaRed.asignarRed(entidadDispLisa, red1);
    });

    test("Verificación condición de mitigación Exitosa: Configuraciones de Workstation", () => {
        sistemaPresupuesto.toggleConfiguracionWorkstation(entidadDispJacob, "Actualizaciones automáticas de antivirus");
        sistemaPresupuesto.toggleConfiguracionWorkstation(entidadDispJacob, "Antivirus gestionado");

        sistemaEvento.ejecutarAtaque(entidadDispJacob, ataques[0]);

        const estadoAtaqueDispositivo = em.getEntidades().get(entidadDispJacob)?.get(DispositivoComponent)?.estadoAtaque;

        expect(estadoAtaqueDispositivo).toBe(EstadoAtaqueDispositivo.NORMAL);
    });

    test("Verificación condición de mitigación Fallida: Configuraciones de Workstation", () => {
        // No se activan las configuraciones esperadas //

        sistemaEvento.ejecutarAtaque(entidadDispJacob, ataques[0]);

        const estadoAtaqueDispositivo = em.getEntidades().get(entidadDispJacob)?.get(DispositivoComponent)?.estadoAtaque;

        expect(estadoAtaqueDispositivo).toBe(EstadoAtaqueDispositivo.COMPROMETIDO);
    });

    test("Verificación de ejecución de evento Exitoso: Envio de correo", () => {
        eventos = [
            new EventoComponent(
                "envio de correo",
                TipoEvento.ENVIO_CORREO,
                1,
                "envio de correo phishing",
                1,
                {
                    dispositivoEmisor: "Computadora Lisa",
                    destinatario: "jacob.garcia@corp.com",
                    asunto: PlantillasCorreoPhishing[0].asunto,
                }
            ),
        ];

        fases = [
            {
              id: 1,
              nombre: "Fase 1: Prueba",
              descripcion:
                "Prueba",
              faseActual: true,
              completada: false,
              objetivos: [ 
                {
                  descripcion: "envio de correo",
                  completado: false,
                },
              ],
            },
        ];

        sistemaFase.eventosEscenario = eventos;

        em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases = fases;

        // Se envía el correo
        em.registrarAccion(
            AccionesRealizables.ENVIO,
            ObjetosManejables.CORREO,
            undefined,
            {
                dispositivoEmisor: "Computadora Lisa",
                destinatario: "jacob.garcia@corp.com",
                asunto: PlantillasCorreoPhishing[0].asunto,
            }
        );

        sistemaEvento.ejecutarEvento(eventos[0]);
 
        const fasesDespuesDeEjecutarEvento = em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases;
        
        expect(fasesDespuesDeEjecutarEvento[0].objetivos[0].completado).toBe(true); // Como para este caso sólo hay una fase con un objetivo, seleccionamos directamente todo con el primer índice
    });

    test("Verificación de ejecución de evento Exitoso: Envio de activo", () => {
        eventos = [
            new EventoComponent(
                "envio de activo",
                TipoEvento.ENVIO_ACTIVO,
                1,
                "envio de activo a otra pc",
                1,
                {
                    nombreActivo: "Activo1",
                    dispositivoEmisor: "Computadora Jacob",
                    dispositivoReceptor: "Computadora Lisa",
                }
            ),
        ];

        fases = [
            {
              id: 1,
              nombre: "Fase 1: Prueba",
              descripcion:
                "Prueba",
              faseActual: true,
              completada: false,
              objetivos: [ 
                {
                  descripcion: "envio de activo",
                  completado: false,
                },
              ],
            },
        ];

        sistemaFase.eventosEscenario = eventos;

        em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases = fases;        

        sistemaEvento.ejecutarEvento(eventos[0]);

        const activosEnOtraPc = em.getEntidades().get(entidadDispLisa)!.get(ActivoComponent)!.activos;
 
        expect(activosEnOtraPc[0].nombre).toBe("Activo1");
    });
});
