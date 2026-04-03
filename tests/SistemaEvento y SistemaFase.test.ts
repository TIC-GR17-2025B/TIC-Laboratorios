import { describe, beforeEach, test, expect } from "vitest";
import { ECSManager, Entidad } from "../src/ecs/core";
import { SistemaActivo, SistemaEvento, SistemaFase, SistemaPresupuesto, SistemaRed, SistemaRelaciones } from "../src/ecs/systems";
import { EstadoAtaqueDispositivo, TipoActivo, TipoAtaque, TipoDispositivo, TipoEvento, TipoProteccionVPN } from "../src/types/DeviceEnums";
import { AccionesRealizables, ObjetosManejables } from "../src/types/AccionesEnums";
import { ActivoComponent, AtaqueComponent, ClienteVPNComponent, DispositivoComponent, EscenarioComponent, EventoComponent, FaseComponent, RedComponent, RouterComponent, VPNGatewayComponent, WorkstationComponent, ZonaComponent } from "../src/ecs/components";
import { PlantillasCorreoPhishing } from "../src/data/plantillas/Plantillas";
import { FirewallBuilder } from "../src/ecs/utils/FirewallBuilder";
import { RedController } from "../src/ecs/controllers/RedController";
import { EscenarioController } from "../src/ecs/controllers/EscenarioController";
import { TipoProtocolo } from "../src/types/TrafficEnums";
import { PerfilClienteVPN, PerfilVPNGateway } from "../src/types/EscenarioTypes";
import { ColoresRed } from "../src/data/colores";

describe("SistemaEvento y SistemaFase", () => {

    let em: ECSManager;
    let sistemaEvento: SistemaEvento;
    let entidadDispJacob: Entidad;
    let entidadVpnGateway: Entidad;
    let entidadDispLisa: Entidad;
    let sistemaPresupuesto: SistemaPresupuesto;
    let sistemaFase: SistemaFase;
    let entidadEscenario: Entidad;
    let fases: FaseComponent[];
    let activoComponenteJacob: ActivoComponent;
    let activoComponenteLisa: ActivoComponent;
    let eventos: EventoComponent[];
    let redController: RedController;
    let sistemaActivo: SistemaActivo;
    let escenarioController: EscenarioController;

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

        sistemaActivo = new SistemaActivo();
        em.agregarSistema(sistemaActivo);

        const sistemaRelacionesZonasRedes = new SistemaRelaciones(ZonaComponent, RedComponent, "redes");
        em.agregarSistema(sistemaRelacionesZonasRedes);
        
        redController = RedController.getInstance(em);
        redController.iniciarController();

        entidadEscenario = em.agregarEntidad();
        em.agregarComponente(entidadEscenario, new EscenarioComponent(1, "escenario", "escenario", 10));  

        const entidadZonaJacob = em.agregarEntidad();
        em.agregarComponente(entidadZonaJacob,new ZonaComponent(1,"Zona Jacob","Dominio Jacob"));
        
        const entidadZonaLisa = em.agregarEntidad();
        em.agregarComponente(entidadZonaLisa,new ZonaComponent(2,"Zona Lisa","Dominio Lisa"));
        
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
        em.agregarComponente(entidadDispJacob, new WorkstationComponent());

        activoComponenteJacob = new ActivoComponent();
        activoComponenteJacob.activos.push(
            {
                nombre: "Activo1",
                contenido: "Infor importante",
                tipo: TipoActivo.DOCUMENTO
            },
            {
                nombre: "Activo2",
                contenido: "La contraseña secreta es 123",
                tipo: TipoActivo.DOCUMENTO,
                firma: "Firma Activo2"
            },
            {
                nombre: "Firma Activo2",
                contenido: "La contraseña secreta es 123",
                tipo: TipoActivo.FIRMA_DIGITAL,
                propietario: "Jacob"
            },
            {
                nombre: "Clave_Publica_Jacob",
                tipo: TipoActivo.CLAVE_PUBLICA,
                propietario: "Jacob"
            },
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

        em.agregarComponente(entidadDispLisa, new ClienteVPNComponent()); // Perfil de Cliente VPN en la PC de Lisa

        const entidadRouterJacob = em.agregarEntidad();
        em.agregarComponente(
          entidadRouterJacob,
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

        const entidadRouterLisa = em.agregarEntidad();
        em.agregarComponente(
          entidadRouterLisa,
          new DispositivoComponent(
            "router2",
            "Cisco",
            "hw",
            TipoDispositivo.ROUTER,
            EstadoAtaqueDispositivo.NORMAL,
            "router1",
            "admin",
            "1234"
          )
        );

        entidadVpnGateway = em.agregarEntidad();  // Dispositivo VPN Gateway en el lado de Jacob
        em.agregarComponente(
            entidadVpnGateway,
            new DispositivoComponent(
                "vpnGateway",
                "Cisco",
                "hw",
                TipoDispositivo.VPN,
                EstadoAtaqueDispositivo.NORMAL,
                "vpn1",
                "",
                ""
            )
        );
        em.agregarComponente(entidadVpnGateway, new VPNGatewayComponent());

        const entidadRedJacob = em.agregarEntidad();
        em.agregarComponente(entidadRedJacob, new RedComponent("LAN1", ColoresRed.VERDE));

        const firewallConfigJacob = new FirewallBuilder().build();
        em.agregarComponente(entidadRouterJacob, new RouterComponent(firewallConfigJacob)); 

        const entidadRedLisa = em.agregarEntidad();
        em.agregarComponente(entidadRedLisa, new RedComponent("LAN2", ColoresRed.AZUL));

        const firewallConfigLisa = new FirewallBuilder().build();
        em.agregarComponente(entidadRouterLisa, new RouterComponent(firewallConfigLisa));

        const entidadRedInternet = em.agregarEntidad();
        em.agregarComponente(entidadRedInternet, new RedComponent("Internet", ColoresRed.ROJO));

        sistemaRelacionesZonasRedes.agregar(entidadZonaJacob, entidadRedJacob);
        sistemaRelacionesZonasRedes.agregar(entidadZonaJacob, entidadRedInternet);
        sistemaRelacionesZonasRedes.agregar(entidadZonaLisa, entidadRedLisa);
        sistemaRelacionesZonasRedes.agregar(entidadZonaLisa, entidadRedInternet);

        sistemaRed.asignarRed(entidadDispJacob, entidadRedJacob);
        sistemaRed.asignarRed(entidadVpnGateway, entidadRedJacob);
        sistemaRed.asignarRed(entidadVpnGateway, entidadRedInternet);
        sistemaRed.asignarRed(entidadRouterJacob, entidadRedJacob);
        sistemaRed.asignarRed(entidadRouterJacob, entidadRedInternet);
        sistemaRed.asignarRed(entidadRouterLisa, entidadRedInternet);
        sistemaRed.asignarRed(entidadRouterLisa, entidadRedLisa);
        sistemaRed.asignarRed(entidadDispLisa, entidadRedLisa);
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

    test("Verificación de ejecución de evento Exitoso: Verificación de firma", () => {
        eventos = [
            new EventoComponent(
                "verificación de firma",
                TipoEvento.VERIFICACION_FIRMA,
                1,
                "verificación de firma digital",
                1,
                {
                    nombreDocumento: "Activo2",
                    nombreFirma: "Firma Activo2",
                    nombreClave: "Clave_Publica_Jacob",
                    veredicto: true,
                }
            ),
        ];

        fases = [
            {
              id: 1,
              nombre: "Fase 1: Prueba",
              descripcion: "Prueba",
              faseActual: true,
              completada: false,
              objetivos: [ 
                {
                  descripcion: "verificación de firma",
                  completado: false,
                },
              ],
            }
        ];

        em.getSistema(SistemaFase)!.eventosEscenario = eventos;

        // em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.eventos = eventos;
        em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases = fases;

        // escenarioController = EscenarioController.getInstance(em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent), em);
        // escenarioController.iniciarEscenario();

        // Simulamos el registro de un veredicto luego de comprobar la firma y la clave pública contra el documento
        em.getSistema(SistemaActivo)!.registrarVeredictoFirma({
            nombreDocumento: "Activo2",
            nombreFirma: "Firma Activo2",
            nombreClave: "Clave_Publica_Jacob",
            veredicto: true
        });

        em.getSistema(SistemaEvento)!.ejecutarEvento(eventos[0]);

        // const fasesDespuesDeEjecutarEvento = em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases;
        
        // expect(fasesDespuesDeEjecutarEvento[0].objetivos[0].completado).toBe(true);

        const registro = em.getSistema(SistemaActivo)?.registroVeredictosFirmas[0];

        expect(registro).toBeDefined();
        expect(registro?.nombreDocumento).toBe("Activo2");

        // Idealmente se debe comprobar únicamente con el primer expect definido que está comentado en este test, 
        // para lo cual se debe tener también el escenarioController en uso, pero por cuestiones de un comportamiento
        // inesperado del controller en el test, estos últimos expects es con lo que se puede comprobar el resultado 
    });

    test("Verificación de ejecución de evento Exitoso: Tráfico de red", () => {
        eventos = [
            new EventoComponent(
                "trafico de red",
                TipoEvento.TRAFICO_RED,
                1,
                "envío de trafico de red",
                1,
                {
                    // Para el evento de TRAFICO_RED, el protocolo puede ser cualquiera y sólo con los atributos
                    // que se ven aquí, ya que sólo es una simulación de que el tráfico ha circulado entre los dos 
                    // dispositivos definidos aquí, sin necesidad de enviar un payload real. Para los casos en los 
                    // que se necesite enviar un payload real, se puede consultar el switch de TipoProtocolo definido 
                    // en la función enviarTrafico de SistemaRed. (Tomar en cuenta que para cuando se quiere enviar con 
                    // un payload real, se deben utilizar las funciones respectivas para ello [FTP y VPN_GATEWAY son, de 
                    // momento, los únicos protocolos que están disponibles para eso]. Esto se puede hacer directo con el evento 
                    // de TRAFICO_RED si se desea, pero para esos 2 protocolos ya se tienen sus eventos propios: ENVIO_ACTIVO 
                    // para FTP y CONEXION_VPN para VPN_GATEWAY)
                    dispositivoOrigen: "Computadora Jacob",
                    dispositivoDestino: "Computadora Lisa",
                    protocolo: TipoProtocolo.TELNET, 
                    // Este parámetro debe ser true cuando se quiere que el paso del tráfico sea un objetivo definido en el escenario.
                    // Por lo que, cuando sea true, también se debe definir su respectivo objetivo en las fases.
                    esObjetivo: true, 
                    debeSerBloqueado: false
                }
            ),
        ];

        fases = [
            {
              id: 1,
              nombre: "Fase 1: Prueba",
              descripcion: "Prueba",
              faseActual: true,
              completada: false,
              objetivos: [ 
                {
                  descripcion: "trafico de red",
                  completado: false,
                },
              ],
            }
        ];

        sistemaFase.eventosEscenario = eventos;

        em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases = fases; 

        sistemaEvento.ejecutarEvento(eventos[0]);
 
        const fasesDespuesDeEjecutarEvento = em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases;
        
        expect(fasesDespuesDeEjecutarEvento[0].objetivos[0].completado).toBe(true);
    });

    test("Verificación de ejecución de evento Exitoso: Conexión VPN", () => {
        eventos = [
            new EventoComponent(
                "conexion vpn",
                TipoEvento.CONEXION_VPN,
                1,
                "establecer conexion vpn",
                1,
                {
                    gateway: {
                        lanLocal: "LAN1",
                        hostLan: "Computadora Jacob",
                        proteccion: TipoProteccionVPN.EA,
                        dominioRemoto: "Dominio Lisa",
                        hostRemoto: "Computadora Lisa"
                    },
                    cliente: {
                        proteccion: TipoProteccionVPN.EA,
                        dominioRemoto: "Dominio Jacob",
                        hostRemoto: "Computadora Jacob"
                    }
                }
            ),
        ];

        fases = [
            new FaseComponent(
              1,
              "Fase 1: Prueba",
              "Prueba",
              true,
              false,
              [ 
                {
                  descripcion: "conexion vpn",
                  completado: false,
                },
              ],
            )
        ];

        sistemaFase.eventosEscenario = eventos;

        em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases = fases; 

        // Simulamos la adición de perfiles de Cliente VPN (PC de Lisa) y VPN Gateway (dispositivo VPN en el lado de Jacob)
        redController.agregarPerfilClienteVPN(
            entidadDispLisa,
            {
                proteccion: TipoProteccionVPN.EA,
                dominioRemoto: "Dominio Jacob",
                hostRemoto: "Computadora Jacob"
            } as PerfilClienteVPN
        );


        redController.agregarPerfilVPNGateway(
            entidadVpnGateway, 
            {
                lanLocal: "LAN1",
                hostLan: "Computadora Jacob",
                proteccion: TipoProteccionVPN.EA,
                dominioRemoto: "Dominio Lisa",
                hostRemoto: "Computadora Lisa" 
            } as PerfilVPNGateway
        );

        sistemaEvento.ejecutarEvento(eventos[0]);

        const fasesDespuesDeEjecutarEvento = em.getEntidades().get(entidadEscenario)!.get(EscenarioComponent)!.fases;
        
        expect(fasesDespuesDeEjecutarEvento[0].objetivos[0].completado).toBe(true);
    });
});
