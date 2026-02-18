import {
  EstadoAtaqueDispositivo,
  Mueble,
  NivelConcienciaSeguridad,
  TipoActivo,
  TipoDispositivo,
  TipoEvento,
  TipoProteccionVPN,
} from "../../types/DeviceEnums";
import { TipoProtocolo } from "../../types/TrafficEnums";
import { ColoresRed } from "../colores";

export const escenarioSegmentacion: unknown = {
  id: 5,
  titulo: "Segmentación de Red: Empresa Retail",
  imagenPreview: "/redFirewallVPN.webp",
  descripcion:
    "Una cadena de retail necesita segmentar su red para proteger los datos de pago. Configura firewalls y asigna redes correctamente.",
  presupuestoInicial: 2000,
  ataques: [],
  eventos: [
    {
      nombreEvento: "Segmentar red de pagos",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 10,
      descripcion:
        "El 'Terminal de Pagos' debe estar aislado en la red 'PCI-DSS'. Asígnalo a la red 'PCI-DSS' para cumplir con la normativa de seguridad de datos de pago.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "Terminal de Pagos",
        dispositivoDestino: "Servidor de Pagos",
        protocolo: TipoProtocolo.MANAGEMENT,
        esObjetivo: true,
        debeSerBloqueado: false,
      },
    },
    {
      nombreEvento: "Bloquear acceso externo a PCI-DSS",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 25,
      descripcion:
        "Se detectó un intento de conexión SSH desde la red externa a la red PCI-DSS. Configura el firewall del 'Router Tienda' para bloquear todo el tráfico SSH entrante a PCI-DSS.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "Servidor Proveedor",
        dispositivoDestino: "Servidor de Pagos",
        protocolo: TipoProtocolo.SSH,
        esObjetivo: true,
        debeSerBloqueado: true,
      },
    },
    {
      nombreEvento: "Completación Fase 1",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 40,
      descripcion:
        "¡Excelente! Has segmentado la red correctamente. Ahora asegura la conexión con la bodega remota.",
      fase: 1,
    },
    {
      nombreEvento: "Conexión VPN con bodega",
      tipoEvento: TipoEvento.CONEXION_VPN,
      tiempoNotificacion: 45,
      descripcion:
        "La bodega necesita consultar inventario de forma segura. Configura el 'VPN Gateway Tienda' y el cliente en la 'PC Bodega' para permitir una conexión Encriptada y Autenticada (EA).",
      fase: 2,
      infoAdicional: {
        gateway: {
          lanLocal: "LAN-Inventario",
          hostLan: "Servidor de Inventario",
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Bodega",
          hostRemoto: "PC Bodega",
        },
        cliente: {
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Tienda-Central",
          hostRemoto: "Servidor de Inventario",
        },
      },
    },
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 60,
      descripcion: "¡Felicidades, has completado el escenario de segmentación de red!",
      fase: 2,
    },
  ],
  fases: [
    {
      id: 1,
      nombre: "Fase 1: Segmentación y Firewall",
      descripcion:
        "Segmentar la red de pagos y protegerla con reglas de firewall.",
      faseActual: true,
      completada: false,
      objetivos: [
        {
          descripcion: "Segmentar red de pagos",
          completado: false,
        },
        {
          descripcion: "Bloquear acceso externo a PCI-DSS",
          completado: false,
        },
      ],
    },
    {
      id: 2,
      nombre: "Fase 2: Conexión segura con bodega",
      descripcion:
        "Establecer una conexión VPN segura entre la tienda y la bodega remota.",
      faseActual: false,
      completada: false,
      objetivos: [
        {
          descripcion: "Establecer VPN con bodega para consulta de inventario.",
          completado: false,
        },
      ],
    },
  ],
  zonas: [
    {
      id: 1,
      nombre: "Tienda Central",
      dominio: "Tienda-Central",
      redes: [
        { nombre: "PCI-DSS", color: ColoresRed.ROJO },
        { nombre: "LAN-Inventario", color: ColoresRed.VERDE },
        { nombre: "LAN-Oficina", color: ColoresRed.CIAN },
        { nombre: "Internet", color: ColoresRed.NARANJA },
      ],
      personas: [
        {
          nombre: "Roberto Sánchez",
          correo: "roberto.sanchez@retail.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA,
        },
        {
          nombre: "Marta Ruiz",
          correo: "marta.ruiz@retail.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.MEDIA,
        },
      ],
      oficinas: [
        {
          id: 501,
          nombre: "Área de Cajas",
          posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 5001,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Terminal de Pagos",
                  sistemaOperativo: "Windows 10 IoT",
                  hardware: "HP RP9 Retail System",
                  software: "POS Software, Payment Gateway",
                  posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Roberto Sánchez",
                  activos: [
                    {
                      nombre: "transacciones_dia.log",
                      contenido: "Registro de transacciones del día",
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
                  id: 5002,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Servidor de Pagos",
                  sistemaOperativo: "Ubuntu Server 22.04",
                  hardware: "Dell PowerEdge R750",
                  software: "Payment Processor, TLS Gateway",
                  posicion: { x: -3, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Roberto Sánchez",
                  activos: [],
                  redes: ["PCI-DSS"],
                },
              ],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [
                {
                  id: 5003,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Tienda",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ISR 4331",
                  software: "Routing, Firewall, VLAN",
                  posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["PCI-DSS", "LAN-Inventario", "Internet"],
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
                  id: 5004,
                  tipo: TipoDispositivo.VPN,
                  nombre: "VPN Gateway Tienda",
                  sistemaOperativo: "FortiOS",
                  hardware: "Fortinet FortiGate 100F",
                  software: "VPN, IDS",
                  posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["LAN-Inventario", "Internet"],
                  conectadoAInternet: true,
                },
              ],
            },
          ],
        },
        {
          id: 502,
          nombre: "Oficina Administrativa",
          posicion: { x: 6, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 5,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 5005,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Servidor de Inventario",
                  sistemaOperativo: "Ubuntu Server 22.04",
                  hardware: "Dell PowerEdge R660",
                  software: "ERP, Inventory Management",
                  posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Marta Ruiz",
                  activos: [
                    {
                      nombre: "inventario_actual.csv",
                      contenido: "Listado de inventario actualizado",
                      tipo: TipoActivo.DOCUMENTO,
                    },
                  ],
                  redes: ["LAN-Inventario"],
                },
              ],
            },
            {
              id: 6,
              mueble: Mueble.MESA,
              posicion: { x: -3, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 5006,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "PC Gerente",
                  sistemaOperativo: "Windows 11 Pro",
                  hardware: "Lenovo ThinkCentre M90q",
                  software: "Office 365, SAP, Teams",
                  posicion: { x: -3, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Marta Ruiz",
                  activos: [],
                  redes: ["LAN-Oficina"],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      nombre: "Proveedor Externo",
      dominio: "Proveedor",
      redes: [
        { nombre: "Red-Proveedor", color: ColoresRed.MORADO },
        { nombre: "Internet", color: ColoresRed.NARANJA },
      ],
      oficinas: [
        {
          id: 503,
          nombre: "Datacenter Proveedor",
          posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 1, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 5007,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Servidor Proveedor",
                  sistemaOperativo: "Ubuntu Server 22.04",
                  hardware: "Dell PowerEdge R740",
                  software: "API Gateway, EDI",
                  posicion: { x: 1, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["Red-Proveedor"],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 1, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [
                {
                  id: 5008,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Proveedor",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ASR 1001-X",
                  software: "Routing, Firewall, NAT",
                  posicion: { x: 1, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["Red-Proveedor", "Internet"],
                  conectadoAInternet: true,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 3,
      nombre: "Bodega Remota",
      dominio: "Bodega",
      redes: [
        { nombre: "Red-Bodega", color: ColoresRed.LIMA },
        { nombre: "Internet", color: ColoresRed.NARANJA },
      ],
      oficinas: [
        {
          id: 504,
          nombre: "Oficina de Bodega",
          posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 5009,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "PC Bodega",
                  sistemaOperativo: "Windows 10 Pro",
                  hardware: "HP ProDesk 400 G7",
                  software: "WMS, Office 365",
                  posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["Red-Bodega"],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 5010,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Bodega",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ISR 1100",
                  software: "Routing, Firewall",
                  posicion: { x: 2, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["Red-Bodega", "Internet"],
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
