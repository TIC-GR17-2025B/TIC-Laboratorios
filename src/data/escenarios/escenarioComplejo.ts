import {
  EstadoAtaqueDispositivo,
  Mueble,
  TipoActivo,
  TipoDispositivo,
  TipoEvento,
} from "../../types/DeviceEnums";
import { ColoresRed } from "../colores";

/**
 * Escenario complejo para pruebas visuales.
 *
 * Las posiciones de los espacios están diseñadas para que las oficinas
 * formen un plano de edificio tipo grid con ROOM_PADDING = 1.0.
 *
 * Zona 1 (2x2 grid):
 *   ┌──────────┬──────────┐
 *   │ Sala de  │ Cuarto   │  z:[4.5, 6.5]
 *   │ Reuniones│ Comunic. │
 *   ├──────────┼──────────┤  z=4.5
 *   │ Centro   │ Oficina  │  z:[0, 4.5]
 *   │ de Datos │ de TI    │
 *   └──────────┴──────────┘
 *   x:[0, 4.5] x:[4.5, 9]
 */
export const escenarioComplejo: unknown = {
  id: 3,
  titulo: "Empresa Multinacional: Auditoría de Seguridad",
  imagenPreview: "/redFirewallVPN.webp",
  descripcion:
    "Un escenario complejo con múltiples oficinas y zonas para evaluar la postura de seguridad de una empresa multinacional.",
  presupuestoInicial: 5000,
  ataques: [],
  eventos: [
    {
      nombreEvento: "Auditoría de red interna",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 10,
      descripcion: "Verifica la conectividad entre las oficinas del edificio corporativo.",
      fase: 1,
      infoAdicional: {},
    },
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 120,
      descripcion: "¡Felicidades, has completado la auditoría!",
      fase: 1,
    },
  ],
  fases: [
    {
      id: 1,
      nombre: "Fase 1: Reconocimiento y auditoría",
      descripcion: "Evaluar la infraestructura de red de todas las sedes.",
      faseActual: true,
      completada: false,
      objetivos: [
        { descripcion: "Auditoría de red interna", completado: false },
      ],
    },
  ],
  zonas: [
    // ════════════════════════════════════════
    // ZONA 1: Edificio Corporativo — grid 2x2
    // Edificio: x:[0, 9], z:[0, 6.5]
    // ════════════════════════════════════════
    {
      id: 1,
      nombre: "Edificio Corporativo - Planta Baja",
      dominio: "Corp-HQ",
      redes: [
        { nombre: "LAN-Servidores", color: ColoresRed.CIAN },
        { nombre: "LAN-Oficinas", color: ColoresRed.VERDE },
        { nombre: "LAN-Reuniones", color: ColoresRed.AMARILLO },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      oficinas: [
        // ── Centro de Datos (bottom-left) ──
        // Padded: x:[0, 4.5], z:[0, 4.5]
        {
          id: 101,
          nombre: "Centro de Datos",
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 1, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 1001, tipo: TipoDispositivo.WORKSTATION,
                nombre: "Servidor Principal",
                sistemaOperativo: "Ubuntu Server 24.04",
                hardware: "Dell PowerEdge R760",
                software: "Docker, Kubernetes, PostgreSQL",
                posicion: { x: 1, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [{ nombre: "backup_db.sql", contenido: "Database dump", tipo: TipoActivo.DOCUMENTO }],
                redes: ["LAN-Servidores"],
              }],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 3.5, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 1002, tipo: TipoDispositivo.WORKSTATION,
                nombre: "Servidor de Backup",
                sistemaOperativo: "Ubuntu Server 24.04",
                hardware: "Dell PowerEdge R660",
                software: "Bacula, rsync",
                posicion: { x: 3.5, y: 0, z: 1, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Servidores"],
              }],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 1, y: 0, z: 3.5, rotacionY: 0 },
              dispositivos: [{
                id: 1003, tipo: TipoDispositivo.ROUTER,
                nombre: "Router Core",
                sistemaOperativo: "Cisco IOS XE",
                hardware: "Cisco Catalyst 9300",
                software: "OSPF, BGP, Firewall",
                posicion: { x: 1, y: 0, z: 3.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Servidores", "LAN-Oficinas", "Internet"],
                conectadoAInternet: true,
              }],
            },
            {
              id: 4,
              mueble: Mueble.MESA,
              posicion: { x: 3.5, y: 0, z: 3.5, rotacionY: 0 },
              dispositivos: [{
                id: 1004, tipo: TipoDispositivo.VPN,
                nombre: "VPN Gateway Corp",
                sistemaOperativo: "FortiOS",
                hardware: "Fortinet FortiGate 400F",
                software: "VPN, IDS/IPS",
                posicion: { x: 3.5, y: 0, z: 3.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Servidores", "Internet"],
                conectadoAInternet: true,
              }],
            },
          ],
        },
        // ── Oficina de TI (bottom-right) ──
        // Padded: x:[4.5, 9], z:[0, 4.5]
        {
          id: 102,
          nombre: "Oficina de TI",
          espacios: [
            {
              id: 5,
              mueble: Mueble.MESA,
              posicion: { x: 5.5, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 1005, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Admin Red",
                sistemaOperativo: "Windows 11 Pro",
                hardware: "Lenovo ThinkStation P360",
                software: "RSAT, Wireshark, PuTTY",
                posicion: { x: 5.5, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [{ nombre: "network_map.pdf", contenido: "Diagrama de red", tipo: TipoActivo.DOCUMENTO }],
                redes: ["LAN-Oficinas"],
              }],
            },
            {
              id: 6,
              mueble: Mueble.MESA,
              posicion: { x: 8, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 1006, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Soporte Técnico",
                sistemaOperativo: "Windows 11 Pro",
                hardware: "HP Z2 Tower G9",
                software: "TeamViewer, SCCM",
                posicion: { x: 8, y: 0, z: 1, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Oficinas"],
              }],
            },
            {
              id: 7,
              mueble: Mueble.MESA,
              posicion: { x: 5.5, y: 0, z: 3.5, rotacionY: 0 },
              dispositivos: [{
                id: 1007, tipo: TipoDispositivo.WORKSTATION,
                nombre: "Servidor Monitoreo",
                sistemaOperativo: "CentOS 9",
                hardware: "Dell PowerEdge T550",
                software: "Zabbix, Grafana, Prometheus",
                posicion: { x: 5.5, y: 0, z: 3.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Oficinas", "LAN-Servidores"],
              }],
            },
          ],
        },
        // ── Sala de Reuniones (top-left) ──
        // Padded: x:[0, 4.5], z:[4.5, 6.5]
        {
          id: 103,
          nombre: "Sala de Reuniones",
          espacios: [
            {
              id: 8,
              mueble: Mueble.MESA,
              posicion: { x: 1, y: 0, z: 5.5, rotacionY: 0 },
              dispositivos: [{
                id: 1008, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Presentaciones",
                sistemaOperativo: "Windows 11",
                hardware: "Microsoft Surface Studio 2+",
                software: "Office 365, Teams, Zoom",
                posicion: { x: 1, y: 0, z: 5.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Reuniones"],
              }],
            },
            {
              id: 9,
              mueble: Mueble.MESA,
              posicion: { x: 3.5, y: 0, z: 5.5, rotacionY: 0 },
              dispositivos: [{
                id: 1009, tipo: TipoDispositivo.ROUTER,
                nombre: "AP Sala Reuniones",
                sistemaOperativo: "Cisco IOS",
                hardware: "Cisco Aironet 2800",
                software: "WiFi 6, RADIUS",
                posicion: { x: 3.5, y: 0, z: 5.5, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Reuniones", "Internet"],
                conectadoAInternet: true,
              }],
            },
          ],
        },
        // ── Cuarto de Comunicaciones (top-right) ──
        // Padded: x:[4.5, 9], z:[4.5, 6.5]
        {
          id: 104,
          nombre: "Cuarto de Comunicaciones",
          espacios: [
            {
              id: 10,
              mueble: Mueble.MESA,
              posicion: { x: 5.5, y: 0, z: 5.5, rotacionY: 0 },
              dispositivos: [{
                id: 1010, tipo: TipoDispositivo.ROUTER,
                nombre: "Switch Core",
                sistemaOperativo: "Cisco NX-OS",
                hardware: "Cisco Nexus 3048",
                software: "VLAN, STP, LACP",
                posicion: { x: 5.5, y: 0, z: 5.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Servidores", "LAN-Oficinas", "Internet"],
                conectadoAInternet: true,
              }],
            },
            {
              id: 11,
              mueble: Mueble.MESA,
              posicion: { x: 8, y: 0, z: 5.5, rotacionY: 0 },
              dispositivos: [{
                id: 1011, tipo: TipoDispositivo.WORKSTATION,
                nombre: "NAS Backup",
                sistemaOperativo: "TrueNAS",
                hardware: "Synology RS3621xs+",
                software: "RAID-6, Snapshots, Replicación",
                posicion: { x: 8, y: 0, z: 5.5, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Servidores"],
              }],
            },
          ],
        },
      ],
    },
    // ════════════════════════════════════════
    // ZONA 2: Sucursal Norte — 2 oficinas lado a lado
    // Edificio: x:[0, 8], z:[0, 4.5]
    // ════════════════════════════════════════
    {
      id: 2,
      nombre: "Sucursal Norte",
      dominio: "Branch-North",
      redes: [
        { nombre: "LAN-Norte", color: ColoresRed.MORADO },
        { nombre: "LAN-Ventas", color: ColoresRed.ROSA },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      oficinas: [
        // ── Piso de Ventas (left, bigger) ──
        // Padded: x:[0, 6], z:[0, 4.5]
        {
          id: 201,
          nombre: "Piso de Ventas",
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 1, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 2001, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Vendedor 1",
                sistemaOperativo: "Windows 11",
                hardware: "Dell OptiPlex 7090",
                software: "Salesforce, Office 365",
                posicion: { x: 1, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Ventas"],
              }],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 3, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 2002, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Vendedor 2",
                sistemaOperativo: "Windows 11",
                hardware: "Dell OptiPlex 7090",
                software: "Salesforce, Office 365",
                posicion: { x: 3, y: 0, z: 1, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Ventas"],
              }],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 5, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 2003, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Vendedor 3",
                sistemaOperativo: "Windows 11",
                hardware: "Dell OptiPlex 7090",
                software: "Salesforce, Office 365",
                posicion: { x: 5, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Ventas"],
              }],
            },
            {
              id: 4,
              mueble: Mueble.MESA,
              posicion: { x: 2, y: 0, z: 3.5, rotacionY: 0 },
              dispositivos: [{
                id: 2004, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Gerente de Ventas",
                sistemaOperativo: "macOS Sonoma",
                hardware: "MacBook Pro M3",
                software: "Salesforce, Slack, Tableau",
                posicion: { x: 2, y: 0, z: 3.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [{ nombre: "reporte_ventas_Q4.xlsx", contenido: "Reporte trimestral", tipo: TipoActivo.DOCUMENTO }],
                redes: ["LAN-Ventas"],
              }],
            },
            {
              id: 5,
              mueble: Mueble.MESA,
              posicion: { x: 4, y: 0, z: 3.5, rotacionY: 0 },
              dispositivos: [{
                id: 2005, tipo: TipoDispositivo.ROUTER,
                nombre: "Router Sucursal",
                sistemaOperativo: "Cisco IOS",
                hardware: "Cisco ISR 4321",
                software: "Routing, Firewall, NAT",
                posicion: { x: 4, y: 0, z: 3.5, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Ventas", "LAN-Norte", "Internet"],
                conectadoAInternet: true,
              }],
            },
          ],
        },
        // ── Cuarto de Comunicaciones (right, smaller) ──
        // Padded: x:[6, 8], z:[0, 4.5]
        {
          id: 202,
          nombre: "Cuarto de Comunicaciones",
          espacios: [
            {
              id: 6,
              mueble: Mueble.MESA,
              posicion: { x: 7, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 2006, tipo: TipoDispositivo.ROUTER,
                nombre: "Switch Core Norte",
                sistemaOperativo: "Cisco NX-OS",
                hardware: "Cisco Nexus 3048",
                software: "VLAN, STP, LACP",
                posicion: { x: 7, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Norte", "Internet"],
                conectadoAInternet: true,
              }],
            },
            {
              id: 7,
              mueble: Mueble.MESA,
              posicion: { x: 7, y: 0, z: 3.5, rotacionY: 0 },
              dispositivos: [{
                id: 2007, tipo: TipoDispositivo.VPN,
                nombre: "VPN Gateway Norte",
                sistemaOperativo: "FortiOS",
                hardware: "Fortinet FortiGate 100F",
                software: "Site-to-Site VPN",
                posicion: { x: 7, y: 0, z: 3.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Norte", "Internet"],
                conectadoAInternet: true,
              }],
            },
          ],
        },
      ],
    },
    // ════════════════════════════════════════
    // ZONA 3: Centro de Operaciones (NOC) — 1 sala grande
    // Edificio: x:[0, 7], z:[0, 7]
    // ════════════════════════════════════════
    {
      id: 3,
      nombre: "Centro de Operaciones (NOC)",
      dominio: "NOC-Remote",
      redes: [
        { nombre: "LAN-NOC", color: ColoresRed.TURQUESA },
        { nombre: "LAN-Monitoreo", color: ColoresRed.LIMA },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      oficinas: [
        {
          id: 301,
          nombre: "NOC - Sala Principal",
          espacios: [
            // Fila frontal
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 1, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 3001, tipo: TipoDispositivo.WORKSTATION,
                nombre: "Estación NOC 1",
                sistemaOperativo: "Ubuntu 24.04",
                hardware: "HP Z4 G5",
                software: "Nagios, Grafana",
                posicion: { x: 1, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-NOC", "LAN-Monitoreo"],
              }],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 3.5, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 3002, tipo: TipoDispositivo.WORKSTATION,
                nombre: "Estación NOC 2",
                sistemaOperativo: "Ubuntu 24.04",
                hardware: "HP Z4 G5",
                software: "Zabbix, Splunk",
                posicion: { x: 3.5, y: 0, z: 1, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-NOC", "LAN-Monitoreo"],
              }],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 6, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 3003, tipo: TipoDispositivo.WORKSTATION,
                nombre: "Estación NOC 3",
                sistemaOperativo: "Ubuntu 24.04",
                hardware: "HP Z4 G5",
                software: "PRTG, ELK Stack",
                posicion: { x: 6, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-NOC", "LAN-Monitoreo"],
              }],
            },
            // Fila media
            {
              id: 4,
              mueble: Mueble.MESA,
              posicion: { x: 2, y: 0, z: 3.5, rotacionY: 0 },
              dispositivos: [{
                id: 3004, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Supervisor NOC",
                sistemaOperativo: "Windows 11 Pro",
                hardware: "Lenovo ThinkStation P360",
                software: "ServiceNow, Teams, Dashboard",
                posicion: { x: 2, y: 0, z: 3.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [{ nombre: "incident_playbook.pdf", contenido: "Procedimientos", tipo: TipoActivo.DOCUMENTO }],
                redes: ["LAN-NOC"],
              }],
            },
            {
              id: 5,
              mueble: Mueble.MESA,
              posicion: { x: 4.5, y: 0, z: 3.5, rotacionY: 0 },
              dispositivos: [{
                id: 3005, tipo: TipoDispositivo.ROUTER,
                nombre: "Router NOC",
                sistemaOperativo: "Cisco IOS XE",
                hardware: "Cisco ISR 4451",
                software: "OSPF, Firewall, QoS",
                posicion: { x: 4.5, y: 0, z: 3.5, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-NOC", "LAN-Monitoreo", "Internet"],
                conectadoAInternet: true,
              }],
            },
            // Fila trasera
            {
              id: 6,
              mueble: Mueble.MESA,
              posicion: { x: 1, y: 0, z: 6, rotacionY: 0 },
              dispositivos: [{
                id: 3006, tipo: TipoDispositivo.WORKSTATION,
                nombre: "Servidor SIEM",
                sistemaOperativo: "CentOS 9",
                hardware: "Dell PowerEdge R750",
                software: "Splunk Enterprise, SOAR",
                posicion: { x: 1, y: 0, z: 6, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Monitoreo"],
              }],
            },
            {
              id: 7,
              mueble: Mueble.MESA,
              posicion: { x: 3.5, y: 0, z: 6, rotacionY: 0 },
              dispositivos: [{
                id: 3007, tipo: TipoDispositivo.VPN,
                nombre: "VPN Gateway NOC",
                sistemaOperativo: "FortiOS",
                hardware: "Fortinet FortiGate 200F",
                software: "Remote Access VPN",
                posicion: { x: 3.5, y: 0, z: 6, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-NOC", "Internet"],
                conectadoAInternet: true,
              }],
            },
            {
              id: 8,
              mueble: Mueble.MESA,
              posicion: { x: 6, y: 0, z: 6, rotacionY: 0 },
              dispositivos: [{
                id: 3008, tipo: TipoDispositivo.WORKSTATION,
                nombre: "Servidor de Logs",
                sistemaOperativo: "Ubuntu Server 24.04",
                hardware: "Dell PowerEdge R660",
                software: "Elasticsearch, Logstash, Kibana",
                posicion: { x: 6, y: 0, z: 6, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Monitoreo"],
              }],
            },
          ],
        },
      ],
    },
    // ════════════════════════════════════════
    // ZONA 4: Empleados Remotos — 2 casas separadas
    // ════════════════════════════════════════
    {
      id: 4,
      nombre: "Empleados Remotos",
      dominio: "Off-site",
      redes: [
        { nombre: "Red-Carlos", color: ColoresRed.INDIGO },
        { nombre: "Red-Maria", color: ColoresRed.CORAL },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      oficinas: [
        // ── Home Office Carlos ──
        // Padded: x:[0, 4.5], z:[0, 2]
        {
          id: 401,
          nombre: "Home Office - Carlos",
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 1, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 4001, tipo: TipoDispositivo.WORKSTATION,
                nombre: "Laptop Carlos",
                sistemaOperativo: "macOS Sequoia",
                hardware: "MacBook Pro M4",
                software: "VS Code, Docker, Slack",
                posicion: { x: 1, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [{ nombre: "codigo_fuente.zip", contenido: "Repositorio", tipo: TipoActivo.DOCUMENTO }],
                redes: ["Red-Carlos"],
              }],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 3.5, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 4002, tipo: TipoDispositivo.ROUTER,
                nombre: "Router Casa Carlos",
                sistemaOperativo: "OpenWrt",
                hardware: "TP-Link Archer AX73",
                software: "Routing, WiFi 6, Firewall",
                posicion: { x: 3.5, y: 0, z: 1, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["Red-Carlos", "Internet"],
                conectadoAInternet: true,
              }],
            },
          ],
        },
        // ── Home Office María ──
        // Padded: x:[7, 11.5], z:[0, 2]
        {
          id: 402,
          nombre: "Home Office - María",
          espacios: [
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 8, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 4003, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC María",
                sistemaOperativo: "Windows 11 Pro",
                hardware: "Dell XPS 15",
                software: "Office 365, Adobe CC, Teams",
                posicion: { x: 8, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["Red-Maria"],
              }],
            },
            {
              id: 4,
              mueble: Mueble.MESA,
              posicion: { x: 10.5, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 4004, tipo: TipoDispositivo.ROUTER,
                nombre: "Router Casa María",
                sistemaOperativo: "Stock Firmware",
                hardware: "Netgear Nighthawk RAX50",
                software: "Routing, WiFi 6",
                posicion: { x: 10.5, y: 0, z: 1, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["Red-Maria", "Internet"],
                conectadoAInternet: true,
              }],
            },
          ],
        },
      ],
    },
  ],
};
