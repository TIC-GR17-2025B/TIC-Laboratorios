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
 * Escenario 10 — Control de Acceso y Protocolos Seguros
 * Capítulo 3 del sílabo: Control de acceso y protocolos seguros.
 *
 * Objetivo didáctico:
 *   - Aplicar múltiples configuraciones de hardening simultáneamente.
 *   - Defender contra un ataque que explota software no autorizado.
 *   - Segmentar red para separar zonas de confianza (control de acceso a nivel de red).
 *   - Configurar VPN con solo autenticación (modo A) para acceso interno.
 *
 * Dificultad: ★★★☆☆ (Medio)
 */
export const escenarioControlAcceso: unknown = {
  id: 10,
  slug: "control-acceso",
  titulo: "Control de Acceso y Protocolos Seguros",
  categoria: "Cap. 3 — Autenticación",
  imagenPreview: "/redFirewallVPN.webp",
  descripcion:
    "La universidad TechU necesita controlar el acceso a sus laboratorios de investigación. " +
    "Implementa políticas de hardening, segmenta la red para aislar los laboratorios, " +
    "defiende contra software no autorizado y configura acceso VPN autenticado para investigadores remotos.",
  presupuestoInicial: 2500,
  ataques: [
    {
      nombreAtaque: "Ejecución de software no autorizado",
      tiempoNotificacion: 55,
      tipoAtaque: TipoAtaque.INFECCION_TROYANO,
      dispositivoAAtacar: "PC Estudiante",
      descripcion:
        "¡ALERTA! Un estudiante descargó software no autorizado que contiene malware. " +
        "Si 'Sin software externo' está activado en 'PC Estudiante', el ataque será bloqueado.",
      fase: 2,
      condicionMitigacion: {
        accion: AccionesRealizables.EJECUTAR,
        objeto: ObjetosManejables.CONFIG_WORKSTATION,
        val: { nombreConfig: "Sin software externo", activado: true },
      },
    },
  ],
  eventos: [
    // ── FASE 1: Segmentación de red ──
    {
      nombreEvento: "Asignar laboratorio a red segura",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 10,
      descripcion:
        "El 'PC Investigador' necesita acceder al 'Servidor de Datos' en la red 'LAN-Lab'. " +
        "Asigna el 'PC Investigador' a 'LAN-Lab' para permitir la comunicación.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "PC Investigador",
        dispositivoDestino: "Servidor de Datos",
        protocolo: TipoProtocolo.MANAGEMENT,
        esObjetivo: true,
        debeSerBloqueado: false,
      },
    },
    {
      nombreEvento: "Bloquear acceso desde red estudiantil",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 25,
      descripcion:
        "Los estudiantes NO deben poder acceder al laboratorio vía SSH. " +
        "Configura el firewall del 'Router Universidad' para bloquear SSH entrante a 'LAN-Lab'.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "PC Estudiante",
        dispositivoDestino: "Servidor de Datos",
        protocolo: TipoProtocolo.SSH,
        esObjetivo: true,
        debeSerBloqueado: true,
      },
    },
    {
      nombreEvento: "Completación Fase 1",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 40,
      descripcion: "Red segmentada correctamente. Ahora protege los equipos.",
      fase: 1,
    },
    // ── FASE 2: Hardening + ataque ──
    {
      nombreEvento: "Bloquear software externo en aula",
      tipoEvento: TipoEvento.VERIFICACION_ACCION_JUGADOR,
      tiempoNotificacion: 45,
      descripcion:
        "Los equipos del aula son vulnerables a software malicioso descargado por estudiantes. " +
        "Activa 'Sin software externo' en 'PC Estudiante' para prevenir la instalación de programas no autorizados.",
      fase: 2,
      infoAdicional: {
        accion: AccionesRealizables.EJECUTAR,
        objeto: ObjetosManejables.CONFIG_WORKSTATION,
        tiempo: 0,
        val: { nombreConfig: "Sin software externo", activado: true },
      },
    },
    {
      nombreEvento: "Completación Fase 2",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 70,
      descripcion: "Equipos protegidos. Ahora configura acceso remoto para investigadores.",
      fase: 2,
    },
    // ── FASE 3: VPN autenticada ──
    {
      nombreEvento: "VPN para investigador remoto",
      tipoEvento: TipoEvento.CONEXION_VPN,
      tiempoNotificacion: 75,
      descripcion:
        "Un investigador necesita acceder al laboratorio desde casa. " +
        "Configura VPN con modo 'Encriptar y Autenticar' (EA) entre el 'VPN Gateway Universidad' " +
        "y el 'PC Remoto Investigador'.",
      fase: 3,
      infoAdicional: {
        gateway: {
          lanLocal: "LAN-Lab",
          hostLan: "Servidor de Datos",
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Investigador-Remoto",
          hostRemoto: "PC Remoto Investigador",
        },
        cliente: {
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "TechU",
          hostRemoto: "Servidor de Datos",
        },
      },
    },
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 95,
      descripcion:
        "¡Felicidades! Has implementado control de acceso multicapa: " +
        "segmentación de red, hardening de dispositivos y VPN autenticada.",
      fase: 3,
    },
  ],
  fases: [
    {
      id: 1, nombre: "Fase 1: Segmentación y control de acceso",
      descripcion: "Separa la red de laboratorio de la red estudiantil y bloquea accesos no autorizados.",
      faseActual: true, completada: false,
      objetivos: [
        { descripcion: "Asignar laboratorio a red segura", completado: false },
        { descripcion: "Bloquear acceso desde red estudiantil", completado: false },
      ],
    },
    {
      id: 2, nombre: "Fase 2: Hardening de equipos",
      descripcion: "Protege los equipos del aula contra software malicioso.",
      faseActual: false, completada: false,
      objetivos: [
        { descripcion: "Bloquear software externo en aula", completado: false },
      ],
    },
    {
      id: 3, nombre: "Fase 3: Acceso remoto autenticado",
      descripcion: "Configura VPN autenticada para investigadores remotos.",
      faseActual: false, completada: false,
      objetivos: [
        { descripcion: "Configurar VPN para investigador remoto.", completado: false },
      ],
    },
  ],
  zonas: [
    {
      id: 1, nombre: "Campus TechU", dominio: "TechU",
      redes: [
        { nombre: "LAN-Lab", color: ColoresRed.CIAN },
        { nombre: "LAN-Aula", color: ColoresRed.VERDE },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      personas: [
        { nombre: "Dr. Felipe Castillo", correo: "felipe.castillo@techu.edu", nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA },
        { nombre: "Estudiante Martín", correo: "martin@techu.edu", nivelConcienciaSeguridad: NivelConcienciaSeguridad.BAJA },
      ],
      oficinas: [
        {
          id: 1001, nombre: "Laboratorio de Investigación",
          posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 1, mueble: Mueble.MESA, posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [{
                id: 10001, tipo: TipoDispositivo.WORKSTATION, nombre: "PC Investigador",
                sistemaOperativo: "Ubuntu 24.04", hardware: "Dell Precision 5570",
                software: "MATLAB, Python, Jupyter",
                posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Dr. Felipe Castillo",
                activos: [{ nombre: "datos_investigacion.csv", contenido: "Datos de investigación confidenciales", tipo: TipoActivo.DOCUMENTO }],
                redes: [],
              }],
            },
            {
              id: 2, mueble: Mueble.MESA, posicion: { x: -3, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [{
                id: 10002, tipo: TipoDispositivo.WORKSTATION, nombre: "Servidor de Datos",
                sistemaOperativo: "Ubuntu Server 22.04", hardware: "Dell PowerEdge R750",
                software: "PostgreSQL, JupyterHub, NFS",
                posicion: { x: -3, y: 0, z: 0, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Dr. Felipe Castillo",
                activos: [], redes: ["LAN-Lab"],
              }],
            },
            {
              id: 3, mueble: Mueble.MESA, posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [{
                id: 10003, tipo: TipoDispositivo.ROUTER, nombre: "Router Universidad",
                sistemaOperativo: "Cisco IOS", hardware: "Cisco ISR 4331",
                software: "Routing, Firewall, VLAN",
                posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [],
                redes: ["LAN-Lab", "LAN-Aula", "Internet"], conectadoAInternet: true,
              }],
            },
            {
              id: 4, mueble: Mueble.MESA, posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [{
                id: 10004, tipo: TipoDispositivo.VPN, nombre: "VPN Gateway Universidad",
                sistemaOperativo: "FortiOS", hardware: "Fortinet FortiGate 200F", software: "VPN, IDS/IPS",
                posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [],
                redes: ["LAN-Lab", "Internet"], conectadoAInternet: true,
              }],
            },
          ],
        },
        {
          id: 1002, nombre: "Aula de Computación",
          posicion: { x: 6, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 5, mueble: Mueble.MESA, posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [{
                id: 10005, tipo: TipoDispositivo.WORKSTATION, nombre: "PC Estudiante",
                sistemaOperativo: "Windows 10 Pro", hardware: "HP ProDesk 400 G7",
                software: "Office 365, Navegador Web",
                posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Estudiante Martín",
                activos: [], redes: ["LAN-Aula"],
              }],
            },
            {
              id: 6, mueble: Mueble.MESA, posicion: { x: 4, y: 0, z: 2.5, rotacionY: 180 },
              dispositivos: [],
            },
          ],
        },
      ],
    },
    {
      id: 2, nombre: "Casa Investigador", dominio: "Investigador-Remoto",
      redes: [
        { nombre: "Red-Casa", color: ColoresRed.INDIGO },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      oficinas: [{
        id: 1003, nombre: "Home Office",
        posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
        espacios: [
          {
            id: 1, mueble: Mueble.MESA, posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
            dispositivos: [{
              id: 10006, tipo: TipoDispositivo.WORKSTATION, nombre: "PC Remoto Investigador",
              sistemaOperativo: "Ubuntu 24.04", hardware: "Dell Latitude 5540",
              software: "VPN Client, SSH, Jupyter",
              posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
              estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [], redes: ["Red-Casa"],
            }],
          },
          {
            id: 2, mueble: Mueble.MESA, posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
            dispositivos: [{
              id: 10007, tipo: TipoDispositivo.ROUTER, nombre: "Router Casa",
              sistemaOperativo: "Cisco IOS", hardware: "Cisco ISR 1100", software: "Routing, NAT",
              posicion: { x: 2, y: 0, z: 0, rotacionY: 180 },
              estadoAtaque: EstadoAtaqueDispositivo.NORMAL, activos: [],
              redes: ["Red-Casa", "Internet"], conectadoAInternet: true,
            }],
          },
        ],
      }],
    },
  ],
};
