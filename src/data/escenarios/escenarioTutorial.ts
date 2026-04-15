import { AccionesRealizables, ObjetosManejables } from "../../types/AccionesEnums";
import {
  EstadoAtaqueDispositivo,
  Mueble,
  NivelConcienciaSeguridad,
  TipoActivo,
  TipoDispositivo,
  TipoEvento,
} from "../../types/DeviceEnums";
import { AccionFirewall, DireccionTrafico } from "../../types/FirewallTypes";
import { TipoProtocolo } from "../../types/TrafficEnums";
import { ColoresRed } from "../colores";

/**
 * Escenario 1 — Tutorial: Introducción a la Seguridad Informática
 * Capítulo 1 del sílabo: Conceptos básicos de seguridad.
 *
 * Objetivo didáctico:
 *   - Familiarizar al jugador con la interfaz del juego.
 *   - Introducir los conceptos de Confidencialidad, Integridad y Disponibilidad (CIA).
 *   - Enseñar las mecánicas básicas: asignar redes y configurar firewall.
 *
 * Dificultad: ★☆☆☆☆ (Muy fácil — guiado)
 *
 * Layout:
 * ╔═══════════════════════════╗   ╔═══════════════════════╗
 * ║  Zona 1 — Oficina        ║   ║  Zona 2 — Internet    ║
 * ║  ┌─────────────────────┐  ║   ║  ┌─────────────────┐  ║
 * ║  │ PC Empleado         │  ║   ║  │ Servidor Externo│  ║
 * ║  │ Servidor Interno    │  ║   ║  │ Router Externo  │  ║
 * ║  │ Router Principal    │  ║   ║  └─────────────────┘  ║
 * ║  └─────────────────────┘  ║   ╚═══════════════════════╝
 * ╚═══════════════════════════╝
 */
export const escenarioTutorial: unknown = {
  id: 1,
  slug: "tutorial",
  titulo: "Tutorial: Introducción a la Seguridad",
  categoria: "Cap. 1 — Introducción",
  imagenPreview: "/redFirewallVPN.webp",
  descripcion:
    "Bienvenido a tu primer día como administrador de seguridad en TechStart. " +
    "Aprenderás los conceptos fundamentales: Disponibilidad (que los sistemas estén accesibles), " +
    "Confidencialidad (que solo los autorizados accedan) e Integridad (que la información no sea alterada). " +
    "Este escenario te guiará paso a paso.",
  presupuestoInicial: 500,
  ataques: [],
  eventos: [
    // ── FASE 1: Disponibilidad ──
    {
      nombreEvento: "Restaurar conectividad interna",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 5,
      tiempoEnOcurrir: 10,
      descripcion:
        "¡Bienvenido! Tu primera tarea como administrador de seguridad es garantizar la DISPONIBILIDAD de los sistemas. " +
        "El 'PC Empleado' no puede comunicarse con el 'Servidor Interno' porque no está conectado a ninguna red. " +
        "Dirírgete a la vista de Redes y asígnalo a la red 'LAN-Oficina'.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "PC Empleado",
        dispositivoDestino: "Servidor Interno",
        protocolo: TipoProtocolo.MANAGEMENT,
        esObjetivo: true,
        debeSerBloqueado: false,
      },
    },
    {
      nombreEvento: "Completación Fase 1",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 15,
      descripcion:
        "¡Excelente! Has restaurado la disponibilidad del sistema. " +
        "Ahora pasemos a proteger la CONFIDENCIALIDAD de los datos.",
      fase: 1,
    },
    // ── FASE 2: Confidencialidad ──
    {
      nombreEvento: "Bloquear acceso SSH externo",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 20,
      tiempoEnOcurrir: 25,
      descripcion:
        "Se ha detectado un intento de conexión SSH desde Internet hacia tu red interna. " +
        "Esto es una AMENAZA a la CONFIDENCIALIDAD: un atacante externo intenta acceder a tus sistemas. " +
        "Para proteger la red, configura el firewall del 'Router Principal': " +
        "bloquea todo el tráfico SSH entrante hacia la red 'LAN-Oficina'.",
      fase: 2,
      infoAdicional: {
        dispositivoOrigen: "Servidor Externo",
        dispositivoDestino: "PC Empleado",
        protocolo: TipoProtocolo.SSH,
        esObjetivo: true,
        debeSerBloqueado: true,
      },
    },
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 30,
      descripcion:
        "¡Felicidades! Has completado el tutorial. Aprendiste sobre Disponibilidad (conectar sistemas) " +
        "y Confidencialidad (bloquear accesos no autorizados). " +
        "En los siguientes escenarios explorarás la Integridad, la criptografía, la autenticación y más.",
      fase: 2,
    },
  ],
  accionesEsperadas: [
    {
      accion: AccionesRealizables.AGREGAR,
      objeto: ObjetosManejables.RED,
      inicioTiempoEsperado: 5,
      finTiempoEsperado: 10,
      val: {
        nombreDispositivo: "PC Empleado",
        nombreRed: "LAN-Oficina"
      }
    },
    {
      accion: AccionesRealizables.CLICK,
      objeto: ObjetosManejables.CONFIG_FIREWALL,
      inicioTiempoEsperado: 20,
      finTiempoEsperado: 25,
      val: {
        nombreRouter: "Router Principal",
        nombreRed: "LAN-Oficina",
        accion: AccionFirewall.DENEGAR,
        direccion: DireccionTrafico.HACIA,
        protocolo: TipoProtocolo.SSH,
      },
    },
  ],
  fases: [
    {
      id: 1,
      nombre: "Fase 1: Disponibilidad — Conectar sistemas",
      descripcion:
        "La DISPONIBILIDAD es uno de los tres pilares de la seguridad (CIA). Significa que los sistemas y datos " +
        "deben estar accesibles cuando se necesiten. Asigna la red correcta al PC del empleado.",
      faseActual: true,
      completada: false,
      objetivos: [
        {
          descripcion: "Restaurar conectividad interna",
          completado: false,
        },
      ],
    },
    {
      id: 2,
      nombre: "Fase 2: Confidencialidad — Bloquear intrusos",
      descripcion:
        "La CONFIDENCIALIDAD protege la información contra accesos no autorizados. " +
        "Configura el firewall para bloquear conexiones SSH desde Internet.",
      faseActual: false,
      completada: false,
      objetivos: [
        {
          descripcion: "Bloquear acceso SSH externo",
          completado: false,
        },
      ],
    },
  ],
  zonas: [
    // ── ZONA 1: Oficina TechStart ──
    {
      id: 1,
      nombre: "Oficina TechStart",
      dominio: "TechStart",
      redes: [
        { nombre: "LAN-Oficina", color: ColoresRed.CIAN },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      personas: [
        {
          nombre: "María López",
          correo: "maria.lopez@techstart.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.MEDIA,
        },
        {
          nombre: "Pedro Ramírez",
          correo: "pedro.ramirez@techstart.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA,
        },
      ],
      oficinas: [
        {
          id: 101,
          nombre: "Oficina Principal",
          posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 1001,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "PC Empleado",
                  sistemaOperativo: "Windows 11 Pro",
                  hardware: "Dell OptiPlex 7090",
                  software: "Office 365, Navegador Web",
                  posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "María López",
                  activos: [
                    {
                      nombre: "reporte_mensual.docx",
                      contenido: "Reporte de actividades del mes",
                      tipo: TipoActivo.DOCUMENTO,
                    },
                  ],
                  redes: [],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: -3, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 1002,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Servidor Interno",
                  sistemaOperativo: "Ubuntu Server 22.04",
                  hardware: "Dell PowerEdge R750",
                  software: "Apache, MySQL, Management Service",
                  posicion: { x: -3, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Pedro Ramírez",
                  activos: [
                    {
                      nombre: "datos_clientes.db",
                      contenido: "Base de datos de clientes (confidencial)",
                      tipo: TipoActivo.DOCUMENTO,
                    },
                  ],
                  redes: ["LAN-Oficina"],
                },
              ],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [
                {
                  id: 1003,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Principal",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ISR 4331",
                  software: "Routing, Firewall",
                  posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["LAN-Oficina", "Internet"],
                  conectadoAInternet: true,
                },
              ],
            },
          ],
        },
      ],
    },
    // ── ZONA 2: Internet ──
    {
      id: 2,
      nombre: "Internet",
      dominio: "WWW",
      redes: [
        { nombre: "Red-Externa", color: ColoresRed.NARANJA },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      oficinas: [
        {
          id: 201,
          nombre: "Servidor Externo",
          posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 1, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 2001,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Servidor Externo",
                  sistemaOperativo: "Ubuntu Server 22.04",
                  hardware: "Dell PowerEdge R740",
                  software: "Apache, DNS",
                  posicion: { x: 1, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["Red-Externa"],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 1, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [
                {
                  id: 2002,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Externo",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ASR 1001-X",
                  software: "Routing, NAT",
                  posicion: { x: 1, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["Red-Externa", "Internet"],
                  conectadoAInternet: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
