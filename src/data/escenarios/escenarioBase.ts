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
  id: 3,
  titulo: "Demo de Funcionalidad de Redes (Firewall y VPN)",
  descripcion:
    "Un escenario enfocado para demostrar la configuración de redes, reglas de firewall y conexiones VPN.",
  presupuestoInicial: 1000,
  ataques: [], // Vaciado para enfocar la demo en las features de red
  eventos: [
    {
      nombreEvento: "Demo: Prueba de Firewall (SSH)",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 5, // Tiempo para que el PO configure el firewall
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
      nombreEvento: "Demo: Prueba de Conexión VPN (Lisa)",
      tipoEvento: TipoEvento.CONEXION_VPN,
      tiempoNotificacion: 17, // Tiempo para que el PO configure la VPN
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
      nombre: "Fase 1: Configuración de Red",
      descripcion:
        "Configurar correctamente el firewall y la VPN para la red corporativa.",
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
        {
          nombre: "LAN3",
          color: ColoresRed.AMARILLO,
        },
        {
          nombre: "LAN4",
          color: ColoresRed.GRIS_OSCURO,
        },
        {
          nombre: "Internet",
          color: ColoresRed.ROJO,
        }
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
                  // --- Feature 1: Dispositivo en múltiples redes ---
                  redes: ["LAN1", "LAN2"],
                },
              ],
            },
            {
              id: 2, // ID Corregido
              mueble: Mueble.MESA,
              posicion: { x: -2, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 1007,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Computadora Jacob",
                  sistemaOperativo: "pfSense",
                  hardware: "Fortinet FortiGate 200F",
                  software: "IDS/IPS, VPN",
                  posicion: { x: -2, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  // --- Feature 1: Dispositivo en una red ---
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
                  // --- Feature 2: Objetivo de configuración de Firewall ---
                  redes: ["LAN1","Internet"],
                },
              ],
            },
            {
              id: 4, // ID Corregido
              mueble: Mueble.MESA,
              posicion: { x: -4, y: 0, z: 3, rotacionY: 0 },
              dispositivos: [
                {
                  id: 1008, // ID Corregido (antes 1004)
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "VPN Gateway",
                  sistemaOperativo: "VPN OS",
                  hardware: "Cisco VPN",
                  software: "VPN",
                  posicion: { x: -4, y: 0, z: 3, rotacionY: 180 },
                  // --- Feature 3: Objetivo de configuración de VPN Gateway ---
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
        {
          nombre: "Internet",
          color: ColoresRed.ROJO,
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
                  // --- Feature 2: Origen del tráfico SSH ---
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
                  redes: ["RedWWW", "Internet"],
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
        {
          nombre: "Internet",
          color: ColoresRed.ROJO,
        },
      ],
      oficinas: [
        {
          id: 301, // ID Corregido (antes 201)
          nombre: "Estudio de Lisa",
          posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: -2, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [
                {
                  id: 3001, // ID Corregido (antes 2001)
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Computadora Lisa",
                  sistemaOperativo: "Windows 11",
                  hardware: "Dell PowerEdge R740",
                  software: "IDS/IPS, VPN",
                  posicion: { x: -2, y: 0, z: 1, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  // --- Feature 3: Objetivo de configuración de VPN Client ---
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
                  id: 3002, // ID Corregido (antes 2002)
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Lisa",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ASR 1001-X",
                  software: "Routing, Firewall, NAT",
                  posicion: { x: 2, y: 0, z: 0, rotacionY: 180 },
                  redes: ["Red-Lisa", "Internet"],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
