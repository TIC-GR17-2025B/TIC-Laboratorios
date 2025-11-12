import {
  EstadoAtaqueDispositivo,
  Mueble,
  TipoDispositivo,
  TipoEvento,
  TipoProteccionVPN,
} from "../../types/DeviceEnums";
import { TipoProtocolo } from "../../types/TrafficEnums";
import { ColoresRed } from "../colores";

export const escenarioBase: unknown = {
  id: 4,
  titulo: "Demo Completa: Redes, Firewall y VPN",
  descripcion:
    "Un escenario con 3 retos: 1) Asignar una red a un dispositivo, 2) Configurar un firewall, 3) Configurar una VPN.",
  presupuestoInicial: 1000,
  ataques: [],
  eventos: [
    {
      nombreEvento: "Reto 1: Falla de Conectividad IDS",
      tipoEvento: TipoEvento.TRAFICO_RED, // Corregido: Usamos un evento de tráfico
      tiempoNotificacion: 5, // Es el primer reto
      descripcion:
        "La 'Computadora Jacob' (IDS) no puede contactar a la 'Computadora Administrativa'. Revisa la configuración de red de 'Computadora Jacob' para asegurar que tenga acceso a 'LAN1'.",
      fase: 1,
      infoAdicional: {
        // El simulador debe verificar que este tráfico (ping) es posible.
        // Fallará hasta que 'Computadora Jacob' (ID 1007) esté en 'LAN1'.
        dispositivoOrigen: "Computadora Jacob",
        dispositivoDestino: "Computadora Administrativa",
        // Asumo que tienes ICMP en tu enum TipoProtocolo, si no, puedes cambiarlo.
        protocolo: TipoProtocolo.TELNET,
      },
    },
    {
      nombreEvento: "Reto 2: Prueba de Firewall (SSH)",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 10, // Segundo reto
      descripcion:
        "Se intentará una conexión SSH desde la red externa (WWW) a la LAN1. Configura el firewall del Router Principal para bloquearla.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "Servidor Web Externo",
        dispositivoDestino: "Computadora Administrativa",
        protocolo: TipoProtocolo.SSH,
      },
    },
    {
      nombreEvento: "Reto 3: Prueba de Conexión VPN (Lisa)",
      tipoEvento: TipoEvento.CONEXION_VPN,
      tiempoNotificacion: 25, // Tercer reto
      descripcion:
        "Lisa (Off-site) intentará conectarse a la 'Computadora Jacob' (LAN2) vía VPN. Configura el Gateway y el Cliente VPN para permitirlo.",
      fase: 1,
      infoAdicional: {
        // Configuración requerida en el 'VPN Gateway' (ID 1008)
        gateway: {
          lanLocal: "LAN2",
          hostLan: "Computadora Jacob",
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Off-site",
          hostRemoto: "Computadora Lisa",
        },
        // Configuración requerida en el cliente VPN de 'Computadora Lisa' (ID 3001)
        cliente: {
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Corporación",
          hostRemoto: "Computadora Jacob",
        },
      },
    },
  ],
  fases: [
    {
      id: 1,
      nombre: "Fase 1: Retos de Configuración de Red",
      descripcion:
        "Completar los 3 retos de asignación de red, firewall y VPN.",
      faseActual: true,
    },
  ],
  zonas: [
    {
      id: 1,
      nombre: "Edificio Principal - Piso 1",
      dominio: "Corporación",
      redes: [
        {
          nombre: "LAN1",
          color: ColoresRed.CIAN,
        },
        {
          nombre: "LAN2",
          color: ColoresRed.VERDE,
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
                  id: 1001,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Computadora Administrativa",
                  sistemaOperativo: "Ubuntu Server 22.04",
                  hardware: "Dell PowerEdge R750",
                  software: "Apache, MySQL, PHP",
                  posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [
                    {
                      nombre: "Activo1",
                      contenido: "La contraseña secreta es 123",
                    },
                  ],
                  // Destino del Reto 1
                  redes: ["LAN1", "LAN2"],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: -2, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 1007,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Computadora Jacob",
                  sistemaOperativo: "pfSense",
                  hardware: "Fortinet FortiGate 200F",
                  software: "IDS/IPS, VPN", // Software clave para el Reto 1
                  posicion: { x: -2, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  // --- Reto 1: El PO debe añadir "LAN1" aquí ---
                  redes: ["LAN2"],
                },
              ],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 1.5, y: 0, z: 2, rotacionY: 0 },
              dispositivos: [
                {
                  id: 1004,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Principal",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ISR 4331",
                  software: "Routing, Firewall",
                  posicion: { x: 1.5, y: 0, z: 2, rotacionY: 180 },
                  // --- Reto 2: Objetivo de configuración de Firewall ---
                  conectadoAInternet: true,
                  redes: ["LAN1"],
                },
              ],
            },
            {
              id: 4,
              mueble: Mueble.MESA,
              posicion: { x: -4, y: 0, z: 3, rotacionY: 0 },
              dispositivos: [
                {
                  id: 1008,
                  tipo: TipoDispositivo.VPN,
                  nombre: "VPN Gateway",
                  sistemaOperativo: "VPN OS",
                  hardware: "Cisco VPN",
                  software: "VPN",
                  posicion: { x: -4, y: 0, z: 3, rotacionY: 180 },
                  // --- Reto 3: Objetivo de configuración de VPN Gateway ---
                  conectadoAInternet: true,
                  redes: ["LAN2"],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      nombre: "WWW - Red Externa",
      dominio: "WWW",
      redes: [
        {
          nombre: "RedWWW",
          color: ColoresRed.NARANJA,
        },
      ],
      oficinas: [
        {
          id: 201,
          nombre: "Datacenter Externo",
          posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: -2, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [
                {
                  id: 2001,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Servidor Web Externo",
                  sistemaOperativo: "Ubuntu Server 22.04",
                  hardware: "Dell PowerEdge R740",
                  software: "Apache, MySQL, DNS",
                  posicion: { x: -2, y: 0, z: 1, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  // --- Reto 2: Origen del tráfico SSH ---
                  redes: ["RedWWW"],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 2002,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router WWW",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ASR 1001-X",
                  software: "Routing, Firewall, NAT",
                  posicion: { x: 2, y: 0, z: 0, rotacionY: 180 },
                  conectadoAInternet: true,
                  redes: ["RedWWW"],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 3,
      nombre: "Casa Empleado",
      dominio: "Off-site",
      redes: [
        {
          nombre: "Red-Lisa",
          color: ColoresRed.INDIGO,
        },
      ],
      oficinas: [
        {
          id: 301,
          nombre: "Estudio de Lisa",
          posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: -2, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [
                {
                  id: 3001,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Computadora Lisa",
                  sistemaOperativo: "Windows 11",
                  hardware: "Dell PowerEdge R740",
                  software: "IDS/IPS, VPN",
                  posicion: { x: -2, y: 0, z: 1, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  // --- Reto 3: Objetivo de configuración de VPN Client ---
                  redes: ["Red-Lisa"],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 3002,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Lisa",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ASR 1001-X",
                  software: "Routing, Firewall, NAT",
                  posicion: { x: 2, y: 0, z: 0, rotacionY: 180 },
                  conectadoAInternet: true,
                  redes: ["Red-Lisa"],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
