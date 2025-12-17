import {
  EstadoAtaqueDispositivo,
  Mueble,
  TipoActivo,
  TipoDispositivo,
  TipoEvento,
  TipoProteccionVPN,
} from "../../types/DeviceEnums";
import { TipoProtocolo } from "../../types/TrafficEnums";
import { ColoresRed } from "../colores";

export const escenarioBase: unknown = {
  id: 6,
  titulo: "Demo: Asignar Red, Firewall y VPN",
  imagenPreview: "/redFirewallVPN.webp",
  descripcion:
    "Un escenario con 3 retos: 1) Asignar una red existente, 2) Configurar un firewall, 3) Configurar una VPN.",
  presupuestoInicial: 1000,
  ataques: [],
  apps: [
    {
      nombre: "App 1",
      descripcion: "Desc 1",
      precio: "20",
    },
    {
      nombre: "App 2",
      descripcion: "Desc 2",
      precio: "15",
    },
    {
      nombre: "App 3",
      descripcion: "Desc 3",
      precio: "30",
    },
  ],
  eventos: [
    {
      nombreEvento: "Verificación de firma",
      tipoEvento: TipoEvento.VERIFICACION_FIRMA,
      tiempoNotificacion: 5,
      descripción: "Jacob ha enviado un documento firmado a Computadora Administrativa. Asegúrate de verificar la firma del documento junto con la clave pública de Jacob para evitar posibles archivos maliciosos.",
      fase: 1,
      infoAdicional: {
        nombreDocumento: "Documento Jacob",
        nombreFirma: "Firma Documento Jacob",
        nombreClave: "Clave_Publica_Jacob",
        veredicto: true,
      },
    },
    {
      nombreEvento: "Falla de Conectividad IDS",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 10, // Es el primer reto
      descripcion:
        "La 'Computadora Jacob' (en LAN2) no puede contactar el servicio 'MANAGEMENT' de la 'Computadora Administrativa' (en LAN1). Asigna 'Computadora Administrativa' a la 'LAN1' para permitir la comunicación.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "Computadora Jacob",
        dispositivoDestino: "Computadora Administrativa",
        protocolo: TipoProtocolo.MANAGEMENT,
        esObjetivo: true,
        debeSerBloqueado: false,
      },
    },
    {
      nombreEvento: "Asegurar LAN1 (Firewall)",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 25, // Segundo reto
      descripcion:
        "Se intentará una conexión SSH no autorizada desde la red externa (WWW) a la LAN1. Configura el firewall del 'Router Principal' para bloquear todo el tráfico SSH entrante a LAN1.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "Servidor Web Externo",
        dispositivoDestino: "Computadora Administrativa",
        protocolo: TipoProtocolo.SSH,
        esObjetivo: true,
        debeSerBloqueado: true,
      },
    },
    {
      nombreEvento: "Completación Fase 1",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 40, // Este es un caso especial. Aquí se ejecutará directamente en el tiempo de notificación
      descripcion:
        "¡Has completado todos los objetivos de la Fase 1! Asegúrate de revisar la pestaña de Partida para conocer los objetivos de la siguiente fase.",
      fase: 1,
    },
    {
      nombreEvento: "Conexión VPN (Teletrabajo)",
      tipoEvento: TipoEvento.CONEXION_VPN,
      tiempoNotificacion: 45, // Tercer reto
      descripcion:
        "Lisa intentará conectarse a la 'Computadora Jacob' vía VPN. Configura el 'VPN Gateway' y el cliente de Lisa para permitirlo. Se requiere que la conexión sea Encriptada y Autenticada (EA)",
      fase: 2,
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
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 60, // Este es un caso especial. Aquí se ejecutará directamente en el tiempo de notificación
      descripcion: "¡Felicidades, has completado el escenario de este nivel!",
      fase: 2,
    },
  ],
  fases: [
    {
      id: 1,
      nombre: "Fase 1: Retos de Configuración de Red",
      descripcion:
        "Completar los 4 retos de asignación de red y firewall.",
      faseActual: true,
      completada: false,
      objetivos: [
        // Cada uno de estos objetivos deben corresponderse (los nombres deben ser los mismos)
        // con los eventos/ataques que el jugador debe manejar, y que se hayan definido en
        // sus arrays corrspondientes de eventos o ataques en este json. Importante: Deben
        // definirse en el mismo orden en el que se supone que el jugador debe completarlos.
        {
          descripcion: "Verificación de firma",
          completado: false,
        },
        {
          descripcion: "Falla de Conectividad IDS",
          completado: false,
        },
        {
          descripcion: "Asegurar LAN1 (Firewall)",
          completado: false,
        },
      ],
    },
    {
      id: 2,
      nombre: "Fase 2: Conexión remota de trabajador.",
      descripcion:
        "Permitir una conexión segura para que un empleado pueda trabajar desde su casa.",
      faseActual: false,
      completada: false,
      objetivos: [
        {
          descripcion:
            "Permitir que Lisa se pueda conectar vía VPN a la red corporativa.",
          completado: false,
        },
      ],
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
                      nombre: "Documento Jacob",
                      contenido: "La contraseña secreta es 123",
                      tipo: TipoActivo.DOCUMENTO,
                      firma: "Firma Documento Jacob"
                    },
                    {
                      nombre: "Firma Documento Jacob",
                      contenido: "La contraseña secreta es 123",
                      tipo: TipoActivo.FIRMA_DIGITAL,
                      propietario: "Jacob"
                    },
                    {
                      nombre: "Clave_Publica_Jacob",
                      tipo: TipoActivo.CLAVE_PUBLICA,
                      propietario: "Jacob"
                    },
                    {
                      nombre: "Activo genérico",
                      contenido: "a",
                      tipo: TipoActivo.GENERICO
                    },
                    {
                      nombre: "Activo genérico 2",
                      contenido: "abcdefg",
                      tipo: TipoActivo.DOCUMENTO
                    },
                    {
                      nombre: "Activo2",
                      contenido: "Bienvenido",
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
