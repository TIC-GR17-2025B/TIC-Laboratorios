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
  id: 6,
  titulo: "Demo: Asignar Red, Firewall y VPN",
  descripcion:
    "Un escenario con 3 retos: 1) Asignar una red existente, 2) Configurar un firewall, 3) Configurar una VPN.",
  presupuestoInicial: 1000,
  ataques: [],
  eventos: [
    {
      nombreEvento: "Reto 1: Falla de Conectividad IDS",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 5, // Es el primer reto
      descripcion:
        "La 'Computadora Jacob' (en LAN2) no puede contactar el servicio 'MANAGEMENT' de la 'Computadora Administrativa' (en LAN1). Asigna 'Computadora Jacob' a la 'LAN1' para permitir la comunicación.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "Computadora Jacob",
        dispositivoDestino: "Computadora Administrativa",
        protocolo: TipoProtocolo.MANAGEMENT,
      },
    },
    {
      nombreEvento: "Reto 2: Asegurar LAN1 (Firewall)",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 20, // Segundo reto
      descripcion:
        "Se intentará una conexión SSH no autorizada desde la red externa (WWW) a la LAN1. Configura el firewall del 'Router Principal' para bloquear todo el tráfico SSH entrante a LAN1.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "Servidor Web Externo",
        dispositivoDestino: "Computadora Administrativa",
        protocolo: TipoProtocolo.SSH,
      },
    },
    {
      nombreEvento: "Reto 3: Conexión VPN (Teletrabajo)",
      tipoEvento: TipoEvento.CONEXION_VPN,
      tiempoNotificacion: 35, // Tercer reto
      descripcion:
        "Lisa (Off-site) intentará conectarse a la 'Computadora Jacob' (LAN2) vía VPN. Configura el 'VPN Gateway' y el cliente de Lisa para permitirlo.",
      fase: 1,
      infoAdicional: {
        gateway: {
          lanLocal: "LAN2",
          hostLan: "Computadora Jacob",
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Off-site",
          hostRemoto: "Computadora Lisa",
        },
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
      // Redes disponibles para asignar en esta zona
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
          nombre: "Internet",
          color: ColoresRed.ROJO,
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
                  software: "Apache, MySQL, PHP, Management Service",
                  posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [
                    {
                      nombre: "Activo1",
                      contenido: "La contraseña secreta es 123",
                    },
                  ],
                  // --- ESTADO INICIAL: ninguna ---
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
                  id: 1007,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Computadora Jacob",
                  sistemaOperativo: "pfSense",
                  hardware: "Fortinet FortiGate 200F",
                  software: "IDS/IPS, VPN",
                  posicion: { x: -3, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  // --- ESTADO INICIAL: Solo en LAN2 ---
                  // --- RETO 1: El PO debe añadir "LAN1" aquí ---
                  redes: ["LAN2"],
                },
              ],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [
                {
                  id: 1004,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Principal",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ISR 4331",
                  software: "Routing, Firewall",
                  posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  // --- RETO 2: El PO debe configurar Firewall aquí ---
                  redes: ["LAN1", "Internet"], // Controla LAN1
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
                  id: 1008,
                  tipo: TipoDispositivo.VPN,
                  nombre: "VPN Gateway",
                  sistemaOperativo: "VPN OS",
                  hardware: "Cisco VPN",
                  software: "VPN",
                  posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  // --- RETO 3: El PO debe configurar esto ---
                  redes: ["LAN2", "Internet"], // Controla LAN2
                  conectadoAInternet: true,
                },
              ],
            },
          ],
        },
      ],
    },
    // --- ZONA WWW (Ordenada) ---
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
              posicion: { x: 1, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 2001,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Servidor Web Externo",
                  sistemaOperativo: "Ubuntu Server 22.04",
                  hardware: "Dell PowerEdge R740",
                  software: "Apache, MySQL, DNS",
                  posicion: { x: 1, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  // Origen de los Retos 1 (indirecto) y 2 (directo)
                  redes: ["RedWWW"],
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
                  nombre: "Router WWW",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ASR 1001-X",
                  software: "Routing, Firewall, NAT",
                  posicion: { x: 1, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["RedWWW", "Internet"],
                  conectadoAInternet: true,
                },
              ],
            },
          ],
        },
      ],
    },
    // --- ZONA CASA EMPLEADO (Ordenada) ---
    {
      id: 3,
      nombre: "Casa Empleado",
      dominio: "Off-site",
      redes: [
        {
          nombre: "Red-Lisa",
          color: ColoresRed.INDIGO,
        },
        { nombre: "Internet", color: ColoresRed.ROJO },
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
              posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 3001,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Computadora Lisa",
                  sistemaOperativo: "Windows 11",
                  hardware: "Dell PowerEdge R740",
                  software: "IDS/IPS, VPN",
                  posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  // Origen del Reto 3 (VPN)
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
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["Red-Lisa", "Internet"],
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
