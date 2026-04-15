import {
  EstadoAtaqueDispositivo,
  Mueble,
  NivelConcienciaSeguridad,
  TipoActivo,
  TipoAtaque,
  TipoDispositivo,
  TipoEvento,
  TipoProteccionVPN,
} from "../../types/DeviceEnums";
import { TipoProtocolo } from "../../types/TrafficEnums";
import {
  AccionesRealizables,
  ObjetosManejables,
} from "../../types/AccionesEnums";
import { ColoresRed } from "../colores";

/**
 * Escenario 3 — Autenticación y Control de Acceso
 * Capítulo 3 del sílabo: Autenticación y autorización.
 *
 * Objetivo didáctico:
 *   - Comprender factores de autenticación y políticas de contraseñas.
 *   - Aplicar hardening de dispositivos como control de acceso.
 *   - Defender contra ataques que explotan debilidades de autenticación.
 *   - Configurar acceso remoto autenticado y cifrado (VPN).
 *
 * Dificultad: ★★★☆☆ (Medio)
 *
 * Layout:
 * ╔══════════════════════════════╗   ╔═══════════════════════╗
 * ║  Zona 1 — DataCorp          ║   ║  Zona 2 — Empleado    ║
 * ║  ┌────────────────────────┐  ║   ║     Remoto            ║
 * ║  │ Servidor de Datos      │  ║   ║  ┌─────────────────┐  ║
 * ║  │ PC Analista            │  ║   ║  │ PC Remoto       │  ║
 * ║  │ Router Principal       │  ║   ║  │ Router Remoto   │  ║
 * ║  │ VPN Gateway            │  ║   ║  └─────────────────┘  ║
 * ║  └────────────────────────┘  ║   ╚═══════════════════════╝
 * ║  ┌────────────────────────┐  ║
 * ║  │ PC Recepción (vuln.)   │  ║
 * ║  └────────────────────────┘  ║
 * ╚══════════════════════════════╝
 */
export const escenarioAutenticacion: unknown = {
  id: 3,
  slug: "autenticacion",
  titulo: "Autenticación y Control de Acceso",
  categoria: "Cap. 3 — Autenticación",
  descripcion:
    "DataCorp detecta accesos no autorizados. Fortalece la autenticación, aplica firewall, " +
    "defiende contra un troyano y habilita VPN autenticada.",
  presupuestoInicial: 2000,
  ataques: [
    {
      nombreAtaque: "Infección de troyano vía email",
      tiempoNotificacion: 55,
      tipoAtaque: TipoAtaque.INFECCION_TROYANO,
      dispositivoAAtacar: "PC Recepción",
      descripcion:
        "¡ALERTA! Se ha detectado un correo con adjunto malicioso dirigido a 'PC Recepción'. " +
        "Si la configuración 'Cuidado con adjuntos de email' está activada, el ataque será mitigado automáticamente. " +
        "De lo contrario, el dispositivo será comprometido.",
      fase: 2,
      condicionMitigacion: {
        accion: AccionesRealizables.EJECUTAR,
        objeto: ObjetosManejables.CONFIG_WORKSTATION,
        val: {
          nombreConfig: "Cuidado con adjuntos de email",
          activado: true,
        },
      },
    },
  ],
  eventos: [
    // ── FASE 1: Hardening de autenticación ──
    {
      nombreEvento: "Bloquear acceso externo no autorizado",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 10,
      descripcion:
        "Se han detectado intentos de conexión SSH desde Internet hacia la red corporativa. " +
        "El CONTROL DE ACCESO implica definir quién puede acceder a qué recursos. " +
        "Configura el firewall del 'Router Principal' para BLOQUEAR todo tráfico SSH entrante a 'LAN-Corp', " +
        "implementando así una política de acceso restrictiva (deny by default).",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "Servidor Externo",
        dispositivoDestino: "Servidor de Datos",
        protocolo: TipoProtocolo.SSH,
        esObjetivo: true,
        debeSerBloqueado: true,
      },
    },
    {
      nombreEvento: "Completación Fase 1",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 30,
      descripcion:
        "¡Bien hecho! Has implementado control de acceso a nivel de red. " +
        "Ahora fortalece la autenticación a nivel de los dispositivos.",
      fase: 1,
    },
    // ── FASE 2: Defensa contra ataque ──
    {
      nombreEvento: "Activar protección contra adjuntos maliciosos",
      tipoEvento: TipoEvento.VERIFICACION_ACCION_JUGADOR,
      tiempoNotificacion: 35,
      descripcion:
        "La AUTENTICACIÓN verifica la identidad, pero también debemos proteger contra amenazas internas. " +
        "Un correo sospechoso podría contener un troyano. Activa la configuración 'Cuidado con adjuntos de email' " +
        "en el 'PC Recepción' para prevenir la ejecución de archivos maliciosos. " +
        "Ve a las configuraciones del workstation y activa esta protección antes de que llegue el ataque.",
      fase: 2,
      infoAdicional: {
        accion: AccionesRealizables.EJECUTAR,
        objeto: ObjetosManejables.CONFIG_WORKSTATION,
        tiempo: 0,
        val: {
          nombreConfig: "Cuidado con adjuntos de email",
          activado: true,
        },
      },
    },
    {
      nombreEvento: "Completación Fase 2",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 70,
      descripcion:
        "Has protegido los dispositivos contra el ataque. " +
        "Ahora establece un canal de acceso remoto seguro y autenticado.",
      fase: 2,
    },
    // ── FASE 3: Acceso remoto autenticado ──
    {
      nombreEvento: "Configurar acceso remoto autenticado",
      tipoEvento: TipoEvento.CONEXION_VPN,
      tiempoNotificacion: 75,
      descripcion:
        "Un analista necesita trabajar desde casa. Para garantizar que solo usuarios AUTENTICADOS " +
        "puedan acceder a la red corporativa, configura una VPN con modo 'Encriptar y Autenticar' (EA). " +
        "Esto implementa autenticación mutua: tanto el servidor como el cliente verifican su identidad. " +
        "Configura el 'VPN Gateway' y el 'PC Remoto' con protección EA.",
      fase: 3,
      infoAdicional: {
        gateway: {
          lanLocal: "LAN-Corp",
          hostLan: "Servidor de Datos",
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Empleado-Remoto",
          hostRemoto: "PC Remoto",
        },
        cliente: {
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "DataCorp",
          hostRemoto: "Servidor de Datos",
        },
      },
    },
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 95,
      descripcion:
        "¡Excelente! Has implementado un sistema de seguridad completo: " +
        "control de acceso con firewall (autorización), hardening de dispositivos (prevención), " +
        "y acceso remoto con VPN autenticada (autenticación mutua). " +
        "Estos son los fundamentos de la autenticación y el control de acceso.",
      fase: 3,
    },
  ],
  fases: [
    {
      id: 1,
      nombre: "Fase 1: Control de acceso con firewall",
      descripcion:
        "El CONTROL DE ACCESO define quién puede acceder a qué recursos. " +
        "Implementa una política restrictiva bloqueando accesos SSH no autorizados desde Internet.",
      faseActual: true,
      completada: false,
      objetivos: [
        {
          descripcion: "Bloquear acceso externo no autorizado",
          completado: false,
        },
      ],
    },
    {
      id: 2,
      nombre: "Fase 2: Defensa contra troyano",
      descripcion:
        "La seguridad de autenticación incluye proteger los endpoints. " +
        "Activa configuraciones de seguridad en los workstations antes de que ocurra el ataque.",
      faseActual: false,
      completada: false,
      objetivos: [
        {
          descripcion: "Activar protección contra adjuntos maliciosos",
          completado: false,
        },
      ],
    },
    {
      id: 3,
      nombre: "Fase 3: Acceso remoto autenticado (VPN)",
      descripcion:
        "La AUTENTICACIÓN MUTUA en VPN garantiza que ambas partes (cliente y servidor) " +
        "verifican su identidad antes de establecer la conexión.",
      faseActual: false,
      completada: false,
      objetivos: [
        {
          descripcion: "Configurar acceso remoto autenticado.",
          completado: false,
        },
      ],
    },
  ],
  zonas: [
    // ── ZONA 1: DataCorp ──
    {
      id: 1,
      nombre: "Oficinas DataCorp",
      dominio: "DataCorp",
      redes: [
        { nombre: "LAN-Corp", color: ColoresRed.CIAN },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      personas: [
        {
          nombre: "Ing. Ricardo Torres",
          correo: "ricardo.torres@datacorp.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA,
        },
        {
          nombre: "Laura Vega",
          correo: "laura.vega@datacorp.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.BAJA,
        },
      ],
      oficinas: [
        {
          id: 101,
          nombre: "Sala de Servidores",
          posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 3001,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Servidor de Datos",
                  sistemaOperativo: "Ubuntu Server 22.04",
                  hardware: "Dell PowerEdge R750",
                  software: "PostgreSQL, Apache, LDAP",
                  posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Ing. Ricardo Torres",
                  activos: [
                    {
                      nombre: "base_datos_clientes.db",
                      contenido: "Base de datos con información de clientes",
                      tipo: TipoActivo.DOCUMENTO,
                    },
                    {
                      nombre: "politica_acceso.pdf",
                      contenido: "Política de control de acceso corporativa",
                      tipo: TipoActivo.DOCUMENTO,
                    },
                  ],
                  redes: ["LAN-Corp"],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: -3, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 3002,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "PC Analista",
                  sistemaOperativo: "Windows 11 Pro",
                  hardware: "Lenovo ThinkStation P360",
                  software: "Wireshark, Nessus, Office 365",
                  posicion: { x: -3, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Ing. Ricardo Torres",
                  activos: [],
                  redes: ["LAN-Corp"],
                },
              ],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [
                {
                  id: 3003,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Principal",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ISR 4331",
                  software: "Routing, Firewall, ACL",
                  posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["LAN-Corp", "Internet"],
                  conectadoAInternet: true,
                },
              ],
            },
            {
              id: 4,
              mueble: Mueble.MESA,
              posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [
                {
                  id: 3004,
                  tipo: TipoDispositivo.VPN,
                  nombre: "VPN Gateway",
                  sistemaOperativo: "FortiOS",
                  hardware: "Fortinet FortiGate 200F",
                  software: "VPN, IDS/IPS",
                  posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["LAN-Corp", "Internet"],
                  conectadoAInternet: true,
                },
              ],
            },
          ],
        },
        {
          id: 102,
          nombre: "Recepción",
          posicion: { x: 6, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 5,
              mueble: Mueble.MESA,
              posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 3005,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "PC Recepción",
                  sistemaOperativo: "Windows 10 Pro",
                  hardware: "HP ProDesk 400 G7",
                  software: "Office 365, Outlook, Navegador Web",
                  posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Laura Vega",
                  activos: [
                    {
                      nombre: "agenda_visitantes.xlsx",
                      contenido: "Registro de visitantes del mes",
                      tipo: TipoActivo.DOCUMENTO,
                    },
                  ],
                  redes: ["LAN-Corp"],
                },
              ],
            },
            {
              id: 6,
              mueble: Mueble.MESA,
              posicion: { x: 4, y: 0, z: 2.5, rotacionY: 180 },
              dispositivos: [],
            },
          ],
        },
      ],
    },
    // ── ZONA 2: Servidor Externo (origen de amenaza) + Empleado Remoto ──
    {
      id: 2,
      nombre: "Empleado Remoto",
      dominio: "Empleado-Remoto",
      redes: [
        { nombre: "Red-Remota", color: ColoresRed.INDIGO },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      oficinas: [
        {
          id: 201,
          nombre: "Home Office",
          posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 3006,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "PC Remoto",
                  sistemaOperativo: "Windows 11 Pro",
                  hardware: "Dell Latitude 5540",
                  software: "VPN Client, Office 365",
                  posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Ing. Ricardo Torres",
                  activos: [],
                  redes: ["Red-Remota"],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 3007,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Remoto",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ISR 1100",
                  software: "Routing, Firewall, NAT",
                  posicion: { x: 2, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["Red-Remota", "Internet"],
                  conectadoAInternet: true,
                },
              ],
            },
          ],
        },
      ],
    },
    // ── ZONA 3: Internet (origen de ataque) ──
    {
      id: 3,
      nombre: "Internet",
      dominio: "WWW",
      redes: [
        { nombre: "Red-Externa", color: ColoresRed.NARANJA },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      oficinas: [
        {
          id: 301,
          nombre: "Servidor Externo",
          posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 1, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 3008,
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
                  id: 3009,
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
