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

/**
 * Escenario complejo: Banco Nacional bajo ataque APT.
 *
 * Layout realista con pasillos entre filas de escritorios.
 * ROOM_PADDING = 1.0
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║            ZONA 1 — Sede Central del Banco (4×2 grid)       ║
 * ║                                                              ║
 * ║  ┌───────────┬───────────┬───────────┬───────────┐           ║
 * ║  │ Centro de │   SOC /   │ Oficinas  │ Sala de   │ z:[5,9]  ║
 * ║  │   Datos   │Cibersegur.│Ejecutivas │Reuniones  │           ║
 * ║  ├───────────┼───────────┼───────────┼───────────┤ z=5      ║
 * ║  │  Cuarto   │Operaciones│   Banca   │ Atención  │ z:[0,4.5]║
 * ║  │  Comunic. │ Bancarias │  Digital  │al Cliente │           ║
 * ║  └───────────┴───────────┴───────────┴───────────┘           ║
 * ║  x:[0,4]     x:[4,8]    x:[8,12]   x:[12,16]               ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * ╔══════════════════════════════════╗
 * ║  ZONA 2 — Sucursal Bancaria     ║
 * ║  ┌───────────┬───────────┐      ║
 * ║  │  Área de  │   Back    │      ║
 * ║  │  Cajeros  │  Office   │      ║
 * ║  └───────────┴───────────┘      ║
 * ║  x:[0,5]     x:[5,9]           ║
 * ╚══════════════════════════════════╝
 *
 * ╔══════════════════════════════════════════╗
 * ║  ZONA 3 — Centro de Desarrollo          ║
 * ║  ┌──────────┬──────────┬──────────┐     ║
 * ║  │  Open    │  QA Lab  │  DevOps  │     ║
 * ║  │  Office  │          │          │     ║
 * ║  └──────────┴──────────┴──────────┘     ║
 * ║  x:[0,5]    x:[5,9]   x:[9,13]         ║
 * ╚══════════════════════════════════════════╝
 */
export const escenarioBanco: unknown = {
  id: 7,
  titulo: "Banco Nacional: Operación Firewall — Defensa APT",
  imagenPreview: "/redFirewallVPN.webp",
  descripcion:
    "El Banco Nacional ha detectado indicadores de compromiso asociados a un grupo APT. " +
    "Como analista de ciberseguridad, debes contener la amenaza, investigar el movimiento " +
    "lateral, y fortalecer la infraestructura antes de que los atacantes exfiltren datos financieros.",
  presupuestoInicial: 8000,
  ataques: [],
  eventos: [
    // ── FASE 1: Detección y Contención ──
    {
      nombreEvento: "Aislar estación comprometida",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 10,
      descripcion:
        "El SIEM ha detectado tráfico C2 (Command & Control) saliente desde 'PC Operador 1' " +
        "en Operaciones Bancarias. Aísla el equipo removiéndolo de la red 'LAN-Operaciones' " +
        "y asígnalo únicamente a la red 'Cuarentena'.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "PC Operador 1",
        dispositivoDestino: "Servidor Principal DB",
        protocolo: TipoProtocolo.DATABASE,
        esObjetivo: true,
        debeSerBloqueado: false,
      },
    },
    {
      nombreEvento: "Bloquear movimiento lateral",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 25,
      descripcion:
        "Se detectaron intentos de conexión SSH desde la red 'LAN-Operaciones' hacia " +
        "el 'Servidor Principal DB' en el Centro de Datos. Configura el firewall del " +
        "'Firewall Principal' para bloquear tráfico SSH entre estas redes.",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "PC Operador 2",
        dispositivoDestino: "Servidor Principal DB",
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
        "¡Amenaza contenida! El equipo comprometido fue aislado y el movimiento lateral " +
        "bloqueado. Ahora procede a investigar el alcance del compromiso.",
      fase: 1,
    },
    // ── FASE 2: Investigación y Comunicación Segura ──
    {
      nombreEvento: "Proteger acceso al servidor de correo",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 50,
      descripcion:
        "Los atacantes podrían intentar acceder al 'Servidor de Correo' para exfiltrar " +
        "comunicaciones internas. Bloquea todo tráfico SMTP no autorizado configurando " +
        "el firewall del 'Firewall Principal'.",
      fase: 2,
      infoAdicional: {
        dispositivoOrigen: "PC Operador 1",
        dispositivoDestino: "Servidor de Correo",
        protocolo: TipoProtocolo.EMAIL_SERVER,
        esObjetivo: true,
        debeSerBloqueado: true,
      },
    },
    {
      nombreEvento: "VPN forense con equipo CSIRT",
      tipoEvento: TipoEvento.CONEXION_VPN,
      tiempoNotificacion: 65,
      descripcion:
        "El equipo de respuesta a incidentes necesita acceso remoto seguro desde el Centro " +
        "de Desarrollo para realizar análisis forense. Configura el 'VPN Gateway Banco' y " +
        "el 'VPN Dev Center' con protección Encriptada y Autenticada (EA).",
      fase: 2,
      infoAdicional: {
        gateway: {
          lanLocal: "LAN-Servidores",
          hostLan: "Servidor Principal DB",
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Dev-Center",
          hostRemoto: "Servidor CI/CD",
        },
        cliente: {
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Banco-HQ",
          hostRemoto: "Servidor Principal DB",
        },
      },
    },
    {
      nombreEvento: "Completación Fase 2",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 85,
      descripcion:
        "¡Investigación completada! El correo fue asegurado y el equipo forense tiene " +
        "acceso seguro. Ahora fortalece la infraestructura.",
      fase: 2,
    },
    // ── FASE 3: Fortalecimiento ──
    {
      nombreEvento: "Segmentar red de banca digital",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 95,
      descripcion:
        "La red de banca digital debe estar completamente aislada de las redes internas. " +
        "Configura el 'Firewall Principal' para permitir solo tráfico HTTPS desde " +
        "'Servidor Web Banking' hacia Internet, bloqueando todo acceso interno directo.",
      fase: 3,
      infoAdicional: {
        dispositivoOrigen: "Servidor Web Banking",
        dispositivoDestino: "Router Core Banco",
        protocolo: TipoProtocolo.WEB_SERVER_SSL,
        esObjetivo: true,
        debeSerBloqueado: false,
      },
    },
    {
      nombreEvento: "VPN segura con sucursal",
      tipoEvento: TipoEvento.CONEXION_VPN,
      tiempoNotificacion: 110,
      descripcion:
        "Establece una conexión VPN segura entre la sede central y la sucursal bancaria. " +
        "Configura el 'VPN Gateway Banco' y 'VPN Sucursal' con protección EA.",
      fase: 3,
      infoAdicional: {
        gateway: {
          lanLocal: "LAN-Servidores",
          hostLan: "Servidor Principal DB",
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Sucursal",
          hostRemoto: "Servidor Local Sucursal",
        },
        cliente: {
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Banco-HQ",
          hostRemoto: "Servidor Principal DB",
        },
      },
    },
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 130,
      descripcion:
        "¡Felicidades! Has defendido exitosamente al Banco Nacional contra el ataque APT. " +
        "Los sistemas fueron aislados, investigados y fortalecidos.",
      fase: 3,
    },
  ],
  fases: [
    {
      id: 1,
      nombre: "Fase 1: Detección y Contención",
      descripcion:
        "Detectar la intrusión y contener el movimiento lateral del atacante antes de que comprometa más sistemas.",
      faseActual: true,
      completada: false,
      objetivos: [
        { descripcion: "Aislar estación comprometida", completado: false },
        { descripcion: "Bloquear movimiento lateral", completado: false },
      ],
    },
    {
      id: 2,
      nombre: "Fase 2: Investigación y Comunicación Segura",
      descripcion:
        "Proteger canales de comunicación y establecer acceso seguro para el equipo de respuesta a incidentes.",
      faseActual: false,
      completada: false,
      objetivos: [
        { descripcion: "Proteger acceso al servidor de correo", completado: false },
        { descripcion: "VPN forense con equipo CSIRT", completado: false },
      ],
    },
    {
      id: 3,
      nombre: "Fase 3: Fortalecimiento de Infraestructura",
      descripcion:
        "Segmentar redes críticas y establecer comunicaciones seguras entre sedes para prevenir futuros ataques.",
      faseActual: false,
      completada: false,
      objetivos: [
        { descripcion: "Segmentar red de banca digital", completado: false },
        { descripcion: "VPN segura con sucursal", completado: false },
      ],
    },
  ],
  zonas: [
    // ════════════════════════════════════════════════════════════
    // ZONA 1: Sede Central del Banco — grid 4×2
    //
    // Fila superior  z:[5, 9]     (4 oficinas)
    //   ── pasillo ──             z ≈ 4.5–5
    // Fila inferior  z:[0, 4.5]   (4 oficinas)
    //
    // Columnas: x:[0,4] | x:[4,8] | x:[8,12] | x:[12,16]
    // ════════════════════════════════════════════════════════════
    {
      id: 1,
      nombre: "Sede Central del Banco",
      dominio: "Banco-HQ",
      redes: [
        { nombre: "LAN-Servidores", color: ColoresRed.CIAN },
        { nombre: "LAN-SOC", color: ColoresRed.MORADO },
        { nombre: "LAN-Corporativa", color: ColoresRed.VERDE },
        { nombre: "LAN-Operaciones", color: ColoresRed.AMARILLO },
        { nombre: "LAN-BancaDigital", color: ColoresRed.NARANJA },
        { nombre: "LAN-Clientes", color: ColoresRed.ROSA },
        { nombre: "Cuarentena", color: ColoresRed.GRIS },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      personas: [
        {
          nombre: "Alejandro Ríos",
          correo: "a.rios@banconacional.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA,
        },
        {
          nombre: "Camila Torres",
          correo: "c.torres@banconacional.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA,
        },
        {
          nombre: "Diego Morales",
          correo: "d.morales@banconacional.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.MEDIA,
        },
        {
          nombre: "Lucía Fernández",
          correo: "l.fernandez@banconacional.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.MEDIA,
        },
        {
          nombre: "Roberto Castillo",
          correo: "r.castillo@banconacional.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.BAJA,
        },
        {
          nombre: "Valentina Herrera",
          correo: "v.herrera@banconacional.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.MEDIA,
        },
      ],
      oficinas: [
        // ══════════════════════════════════════════
        //  FILA SUPERIOR — z:[5, 9]
        // ══════════════════════════════════════════

        // ── Centro de Datos (col 1, top) ──
        // x:[0, 4], z:[5, 9]
        // Layout: 2 filas de racks con pasillo central
        //   Rack1(x:1,z:6)   Rack2(x:3,z:6)
        //        ─── pasillo ───
        //   Rack3(x:1,z:8)   Rack4(x:3,z:8)
        {
          id: 701,
          nombre: "Centro de Datos",
          espacios: [
            {
              id: 1,
              mueble: Mueble.RACK,
              posicion: { x: 1, y: 0, z: 6, rotacionY: 0 },
              dispositivos: [{
                id: 7001, tipo: TipoDispositivo.SERVER,
                nombre: "Servidor Principal DB",
                sistemaOperativo: "Red Hat Enterprise Linux 9",
                hardware: "Dell PowerEdge R760",
                software: "Oracle Database 19c, Data Guard",
                posicion: { x: 1, y: 0, z: 6, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Alejandro Ríos",
                activos: [
                  { nombre: "cuentas_clientes.db", contenido: "Base de datos de cuentas bancarias", tipo: TipoActivo.DOCUMENTO },
                  { nombre: "transacciones_2026.log", contenido: "Log de transacciones del año", tipo: TipoActivo.DOCUMENTO },
                ],
                redes: ["LAN-Servidores"],
              }],
            },
            {
              id: 2,
              mueble: Mueble.RACK,
              posicion: { x: 3, y: 0, z: 6, rotacionY: 180 },
              dispositivos: [{
                id: 7002, tipo: TipoDispositivo.SERVER,
                nombre: "Servidor de Aplicaciones",
                sistemaOperativo: "Ubuntu Server 24.04",
                hardware: "HPE ProLiant DL380 Gen11",
                software: "Apache Tomcat 10, Spring Boot, Redis",
                posicion: { x: 3, y: 0, z: 6, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Alejandro Ríos",
                activos: [],
                redes: ["LAN-Servidores"],
              }],
            },
            {
              id: 3,
              mueble: Mueble.RACK,
              posicion: { x: 1, y: 0, z: 8, rotacionY: 0 },
              dispositivos: [{
                id: 7003, tipo: TipoDispositivo.SERVER,
                nombre: "Servidor Backup / DR",
                sistemaOperativo: "Red Hat Enterprise Linux 9",
                hardware: "Dell PowerEdge R660",
                software: "Veeam Backup, rsync, DRBD",
                posicion: { x: 1, y: 0, z: 8, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [
                  { nombre: "backup_diario.tar.gz", contenido: "Respaldo diario cifrado", tipo: TipoActivo.GENERICO },
                ],
                redes: ["LAN-Servidores"],
              }],
            },
            {
              id: 4,
              mueble: Mueble.RACK,
              posicion: { x: 3, y: 0, z: 8, rotacionY: 180 },
              dispositivos: [{
                id: 7004, tipo: TipoDispositivo.SERVER,
                nombre: "Servidor de Correo",
                sistemaOperativo: "Ubuntu Server 24.04",
                hardware: "HPE ProLiant DL360 Gen11",
                software: "Microsoft Exchange 2019, SpamAssassin",
                posicion: { x: 3, y: 0, z: 8, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Servidores", "Internet"],
                conectadoAInternet: true,
              }],
            },
          ],
        },

        // ── SOC / Centro de Ciberseguridad (col 2, top) ──
        // x:[4, 8], z:[5, 9]
        // Layout: Estaciones de monitoreo en U
        //   Analista1(x:5,z:6)   Analista2(x:7,z:6)
        //          ─── pasillo ───
        //   JefeSOC(x:5,z:8)     SIEM(x:7,z:8)
        {
          id: 702,
          nombre: "SOC — Centro de Ciberseguridad",
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 5, y: 0, z: 6, rotacionY: 0 },
              dispositivos: [{
                id: 7005, tipo: TipoDispositivo.WORKSTATION,
                nombre: "Estación Analista SOC 1",
                sistemaOperativo: "Ubuntu 24.04",
                hardware: "HP Z4 G5 Workstation",
                software: "Splunk, Wireshark, YARA, Suricata",
                posicion: { x: 5, y: 0, z: 6, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Camila Torres",
                activos: [
                  { nombre: "reglas_deteccion.yaml", contenido: "Reglas YARA para detección APT", tipo: TipoActivo.DOCUMENTO },
                ],
                redes: ["LAN-SOC", "LAN-Servidores"],
              }],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 7, y: 0, z: 6, rotacionY: 180 },
              dispositivos: [{
                id: 7006, tipo: TipoDispositivo.WORKSTATION,
                nombre: "Estación Analista SOC 2",
                sistemaOperativo: "Kali Linux 2024.4",
                hardware: "Dell Precision 5570",
                software: "Volatility, Autopsy, NetworkMiner",
                posicion: { x: 7, y: 0, z: 6, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Camila Torres",
                activos: [],
                redes: ["LAN-SOC", "LAN-Servidores"],
              }],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 5, y: 0, z: 8, rotacionY: 0 },
              dispositivos: [{
                id: 7007, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Jefe de Seguridad",
                sistemaOperativo: "Windows 11 Pro",
                hardware: "Lenovo ThinkStation P360",
                software: "ServiceNow, CrowdStrike Falcon, Teams",
                posicion: { x: 5, y: 0, z: 8, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Alejandro Ríos",
                activos: [
                  { nombre: "plan_respuesta_incidentes.pdf", contenido: "Playbook de IR del banco", tipo: TipoActivo.DOCUMENTO },
                ],
                redes: ["LAN-SOC"],
              }],
            },
            {
              id: 4,
              mueble: Mueble.RACK,
              posicion: { x: 7, y: 0, z: 8, rotacionY: 180 },
              dispositivos: [{
                id: 7008, tipo: TipoDispositivo.SERVER,
                nombre: "Servidor SIEM",
                sistemaOperativo: "CentOS Stream 9",
                hardware: "Dell PowerEdge R750",
                software: "Splunk Enterprise, SOAR, Threat Intel",
                posicion: { x: 7, y: 0, z: 8, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-SOC", "LAN-Servidores"],
              }],
            },
          ],
        },

        // ── Oficinas Ejecutivas (col 3, top) ──
        // x:[8, 12], z:[5, 9]
        // Layout: Oficinas privadas con espacio
        //   DirTI(x:9,z:6)       GteFin(x:11,z:6)
        //          ─── pasillo ───
        //   CEO(x:10,z:8.5)
        {
          id: 703,
          nombre: "Oficinas Ejecutivas",
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 9, y: 0, z: 6, rotacionY: 0 },
              dispositivos: [{
                id: 7009, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Director de TI",
                sistemaOperativo: "macOS Sequoia",
                hardware: "MacBook Pro M4 Max",
                software: "Jira, Confluence, Slack, SAP",
                posicion: { x: 9, y: 0, z: 6, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Diego Morales",
                activos: [
                  { nombre: "presupuesto_TI_2026.xlsx", contenido: "Plan de inversión tecnológica", tipo: TipoActivo.DOCUMENTO },
                ],
                redes: ["LAN-Corporativa"],
              }],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 11, y: 0, z: 6, rotacionY: 180 },
              dispositivos: [{
                id: 7010, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Gerente Financiero",
                sistemaOperativo: "Windows 11 Pro",
                hardware: "Dell XPS 15 9530",
                software: "SAP FICO, Bloomberg Terminal, Excel",
                posicion: { x: 11, y: 0, z: 6, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Lucía Fernández",
                activos: [
                  { nombre: "reporte_financiero_Q1.pdf", contenido: "Estado financiero trimestral", tipo: TipoActivo.DOCUMENTO },
                ],
                redes: ["LAN-Corporativa"],
              }],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 10, y: 0, z: 8.5, rotacionY: 0 },
              dispositivos: [{
                id: 7011, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Gerente General",
                sistemaOperativo: "macOS Sequoia",
                hardware: "MacBook Pro M4 Max",
                software: "Office 365, Power BI, Teams",
                posicion: { x: 10, y: 0, z: 8.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Corporativa"],
              }],
            },
          ],
        },

        // ── Sala de Reuniones (col 4, top) ──
        // x:[12, 16], z:[5, 9]
        // Layout: Mesa central con equipos en esquinas
        //   Presentación(x:13,z:6)  VideoConf(x:15,z:6)
        //           ─── mesa central ───
        //   APWifi(x:14,z:8.5)
        {
          id: 704,
          nombre: "Sala de Reuniones Principal",
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 13, y: 0, z: 6, rotacionY: 0 },
              dispositivos: [{
                id: 7012, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Presentaciones",
                sistemaOperativo: "Windows 11",
                hardware: "Microsoft Surface Studio 2+",
                software: "Office 365, Teams, Zoom, Webex",
                posicion: { x: 13, y: 0, z: 6, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Corporativa"],
              }],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 15, y: 0, z: 6, rotacionY: 180 },
              dispositivos: [{
                id: 7013, tipo: TipoDispositivo.WORKSTATION,
                nombre: "Sistema Videoconferencia",
                sistemaOperativo: "Android 14 (Poly)",
                hardware: "Poly Studio X70",
                software: "Zoom Rooms, Teams Rooms",
                posicion: { x: 15, y: 0, z: 6, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Corporativa", "Internet"],
                conectadoAInternet: true,
              }],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 14, y: 0, z: 8.5, rotacionY: 0 },
              dispositivos: [{
                id: 7014, tipo: TipoDispositivo.ROUTER,
                nombre: "AP WiFi Reuniones",
                sistemaOperativo: "Cisco IOS",
                hardware: "Cisco Catalyst 9136 AP",
                software: "WiFi 6E, WPA3, 802.1X",
                posicion: { x: 14, y: 0, z: 8.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Corporativa", "Internet"],
                conectadoAInternet: true,
              }],
            },
          ],
        },

        // ══════════════════════════════════════════
        //  FILA INFERIOR — z:[0, 4.5]
        //  (separada de la fila superior por un pasillo)
        // ══════════════════════════════════════════

        // ── Cuarto de Comunicaciones (col 1, bottom) ──
        // x:[0, 4], z:[0, 4.5]
        // Layout: Equipos de red en rack con pasillo de servicio
        //   RouterCore(x:1,z:1)   Firewall(x:3,z:1)
        //           ─── pasillo servicio ───
        //   SwitchCore(x:1,z:3.5) VPNGw(x:3,z:3.5)
        {
          id: 705,
          nombre: "Cuarto de Comunicaciones",
          espacios: [
            {
              id: 1,
              mueble: Mueble.RACK,
              posicion: { x: 1, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 7015, tipo: TipoDispositivo.ROUTER,
                nombre: "Router Core Banco",
                sistemaOperativo: "Cisco IOS XE 17",
                hardware: "Cisco Catalyst 9500",
                software: "OSPF, BGP, MPLS, QoS",
                posicion: { x: 1, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Servidores", "LAN-Corporativa", "LAN-Operaciones", "Internet"],
                conectadoAInternet: true,
              }],
            },
            {
              id: 2,
              mueble: Mueble.RACK,
              posicion: { x: 3, y: 0, z: 1, rotacionY: 180 },
              dispositivos: [{
                id: 7016, tipo: TipoDispositivo.ROUTER,
                nombre: "Firewall Principal",
                sistemaOperativo: "Palo Alto PAN-OS 11",
                hardware: "Palo Alto PA-5260",
                software: "NGFW, IDS/IPS, URL Filtering, Threat Prevention",
                posicion: { x: 3, y: 0, z: 1, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Servidores", "LAN-Operaciones", "LAN-BancaDigital", "Internet"],
                conectadoAInternet: true,
              }],
            },
            {
              id: 3,
              mueble: Mueble.RACK,
              posicion: { x: 1, y: 0, z: 3.5, rotacionY: 0 },
              dispositivos: [{
                id: 7017, tipo: TipoDispositivo.SWITCH,
                nombre: "Switch Core Banco",
                sistemaOperativo: "Cisco NX-OS 10",
                hardware: "Cisco Nexus 9336C-FX2",
                software: "VLAN, STP, LACP, 802.1X",
                posicion: { x: 1, y: 0, z: 3.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Servidores", "LAN-SOC", "LAN-Corporativa", "LAN-Operaciones", "LAN-BancaDigital", "LAN-Clientes"],
              }],
            },
            {
              id: 4,
              mueble: Mueble.RACK,
              posicion: { x: 3, y: 0, z: 3.5, rotacionY: 180 },
              dispositivos: [{
                id: 7018, tipo: TipoDispositivo.VPN,
                nombre: "VPN Gateway Banco",
                sistemaOperativo: "FortiOS 7.4",
                hardware: "Fortinet FortiGate 600F",
                software: "IPSec VPN, SSL VPN, SD-WAN",
                posicion: { x: 3, y: 0, z: 3.5, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Servidores", "Internet"],
                conectadoAInternet: true,
              }],
            },
          ],
        },

        // ── Operaciones Bancarias (col 2, bottom) ──
        // x:[4, 8], z:[0, 4.5]
        // Layout: Escritorios en filas con pasillo central
        //   Op1(x:5,z:1)     Op2(x:7,z:1)
        //        ─── pasillo ───
        //   Op3(x:5,z:3.5)   Supervisor(x:7,z:3.5)
        {
          id: 706,
          nombre: "Operaciones Bancarias",
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 5, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 7019, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Operador 1",
                sistemaOperativo: "Windows 10 Pro",
                hardware: "Dell OptiPlex 7090",
                software: "SAP Banking, Core Banking System",
                posicion: { x: 5, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.COMPROMETIDO,
                personaEncargada: "Roberto Castillo",
                activos: [
                  { nombre: "malware_c2.exe", contenido: "Backdoor RAT detectado por SIEM", tipo: TipoActivo.GENERICO },
                ],
                redes: ["LAN-Operaciones"],
              }],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 7, y: 0, z: 1, rotacionY: 180 },
              dispositivos: [{
                id: 7020, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Operador 2",
                sistemaOperativo: "Windows 10 Pro",
                hardware: "Dell OptiPlex 7090",
                software: "SAP Banking, Core Banking System",
                posicion: { x: 7, y: 0, z: 1, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Valentina Herrera",
                activos: [],
                redes: ["LAN-Operaciones"],
              }],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 5, y: 0, z: 3.5, rotacionY: 0 },
              dispositivos: [{
                id: 7021, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Operador 3",
                sistemaOperativo: "Windows 10 Pro",
                hardware: "HP ProDesk 400 G7",
                software: "SAP Banking, Reporting Tools",
                posicion: { x: 5, y: 0, z: 3.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Operaciones"],
              }],
            },
            {
              id: 4,
              mueble: Mueble.MESA,
              posicion: { x: 7, y: 0, z: 3.5, rotacionY: 180 },
              dispositivos: [{
                id: 7022, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Supervisor Operaciones",
                sistemaOperativo: "Windows 11 Pro",
                hardware: "Lenovo ThinkStation P360",
                software: "SAP Banking, Tableau, ServiceNow",
                posicion: { x: 7, y: 0, z: 3.5, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Lucía Fernández",
                activos: [
                  { nombre: "reporte_operaciones.pdf", contenido: "Reporte de transacciones diarias", tipo: TipoActivo.DOCUMENTO },
                ],
                redes: ["LAN-Operaciones"],
              }],
            },
          ],
        },

        // ── Banca Digital (col 3, bottom) ──
        // x:[8, 12], z:[0, 4.5]
        // Layout: Servidores web en fila trasera, devs adelante
        //   WebBanking(x:9,z:1)  API(x:11,z:1)
        //         ─── pasillo ───
        //   Dev(x:9,z:3.5)       Testing(x:11,z:3.5)
        {
          id: 707,
          nombre: "Banca Digital",
          espacios: [
            {
              id: 1,
              mueble: Mueble.RACK,
              posicion: { x: 9, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 7023, tipo: TipoDispositivo.SERVER,
                nombre: "Servidor Web Banking",
                sistemaOperativo: "Ubuntu Server 24.04",
                hardware: "Dell PowerEdge R760",
                software: "Nginx, Node.js, React, WAF",
                posicion: { x: 9, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-BancaDigital", "Internet"],
                conectadoAInternet: true,
              }],
            },
            {
              id: 2,
              mueble: Mueble.RACK,
              posicion: { x: 11, y: 0, z: 1, rotacionY: 180 },
              dispositivos: [{
                id: 7024, tipo: TipoDispositivo.SERVER,
                nombre: "Servidor API Gateway",
                sistemaOperativo: "Ubuntu Server 24.04",
                hardware: "HPE ProLiant DL380 Gen11",
                software: "Kong API Gateway, OAuth 2.0, JWT",
                posicion: { x: 11, y: 0, z: 1, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-BancaDigital", "LAN-Servidores"],
              }],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 9, y: 0, z: 3.5, rotacionY: 0 },
              dispositivos: [{
                id: 7025, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Desarrollador Web",
                sistemaOperativo: "macOS Sequoia",
                hardware: "MacBook Pro M4",
                software: "VS Code, Docker, Postman",
                posicion: { x: 9, y: 0, z: 3.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-BancaDigital"],
              }],
            },
            {
              id: 4,
              mueble: Mueble.RACK,
              posicion: { x: 11, y: 0, z: 3.5, rotacionY: 180 },
              dispositivos: [{
                id: 7026, tipo: TipoDispositivo.SERVER,
                nombre: "Servidor de Pruebas",
                sistemaOperativo: "Ubuntu Server 24.04",
                hardware: "Dell PowerEdge T550",
                software: "Selenium, JMeter, SonarQube",
                posicion: { x: 11, y: 0, z: 3.5, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-BancaDigital"],
              }],
            },
          ],
        },

        // ── Atención al Cliente (col 4, bottom) ──
        // x:[12, 16], z:[0, 4.5]
        // Layout: Estaciones de atención en L
        //   Atención1(x:13,z:1)  Atención2(x:15,z:1)
        //         ─── pasillo ───
        //   Atención3(x:13,z:3.5) Kiosco(x:15,z:3.5)
        {
          id: 708,
          nombre: "Atención al Cliente",
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 13, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 7027, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Atención 1",
                sistemaOperativo: "Windows 10 Pro",
                hardware: "Dell OptiPlex 5090",
                software: "CRM Bancario, Office 365",
                posicion: { x: 13, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Clientes"],
              }],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 15, y: 0, z: 1, rotacionY: 180 },
              dispositivos: [{
                id: 7028, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Atención 2",
                sistemaOperativo: "Windows 10 Pro",
                hardware: "Dell OptiPlex 5090",
                software: "CRM Bancario, Office 365",
                posicion: { x: 15, y: 0, z: 1, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Clientes"],
              }],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 13, y: 0, z: 3.5, rotacionY: 0 },
              dispositivos: [{
                id: 7029, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Atención 3",
                sistemaOperativo: "Windows 10 Pro",
                hardware: "HP ProDesk 400 G7",
                software: "CRM Bancario, Office 365",
                posicion: { x: 13, y: 0, z: 3.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Clientes"],
              }],
            },
            {
              id: 4,
              mueble: Mueble.MESA,
              posicion: { x: 15, y: 0, z: 3.5, rotacionY: 180 },
              dispositivos: [{
                id: 7030, tipo: TipoDispositivo.WORKSTATION,
                nombre: "Kiosco Autoservicio",
                sistemaOperativo: "Windows 10 IoT",
                hardware: "Elo Touch 2402L",
                software: "App Autoservicio Bancario",
                posicion: { x: 15, y: 0, z: 3.5, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Clientes", "Internet"],
                conectadoAInternet: true,
              }],
            },
          ],
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // ZONA 2: Sucursal Bancaria — 2 oficinas lado a lado
    //
    //  ┌───────────┬───────────┐
    //  │  Área de  │   Back    │  z:[0, 4.5]
    //  │  Cajeros  │  Office   │
    //  └───────────┴───────────┘
    //  x:[0, 5]    x:[5, 9]
    // ════════════════════════════════════════════════════════════
    {
      id: 2,
      nombre: "Sucursal Bancaria — Centro",
      dominio: "Sucursal",
      redes: [
        { nombre: "LAN-Sucursal", color: ColoresRed.INDIGO },
        { nombre: "LAN-Cajeros", color: ColoresRed.LIMA },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      personas: [
        {
          nombre: "Andrea Guzmán",
          correo: "a.guzman@banconacional.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.MEDIA,
        },
        {
          nombre: "Marco Delgado",
          correo: "m.delgado@banconacional.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.BAJA,
        },
      ],
      oficinas: [
        // ── Área de Cajeros (left) ──
        // x:[0, 5], z:[0, 4.5]
        // Layout: 3 ventanillas en fila + router atrás
        //   Cajero1(x:1,z:1)  Cajero2(x:2.5,z:1)  Cajero3(x:4,z:1)
        //           ─── pasillo de servicio ───
        //   Router(x:2,z:3.5)
        {
          id: 711,
          nombre: "Área de Cajeros",
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 1, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 7101, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Cajero 1",
                sistemaOperativo: "Windows 10 Pro",
                hardware: "Dell OptiPlex 3090",
                software: "Core Banking, Contadora de billetes",
                posicion: { x: 1, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Marco Delgado",
                activos: [],
                redes: ["LAN-Cajeros"],
              }],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 2.5, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 7102, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Cajero 2",
                sistemaOperativo: "Windows 10 Pro",
                hardware: "Dell OptiPlex 3090",
                software: "Core Banking, Contadora de billetes",
                posicion: { x: 2.5, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Cajeros"],
              }],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 4, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 7103, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Cajero 3",
                sistemaOperativo: "Windows 10 Pro",
                hardware: "Dell OptiPlex 3090",
                software: "Core Banking, Contadora de billetes",
                posicion: { x: 4, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Cajeros"],
              }],
            },
            {
              id: 4,
              mueble: Mueble.RACK,
              posicion: { x: 2.5, y: 0, z: 3.5, rotacionY: 0 },
              dispositivos: [{
                id: 7104, tipo: TipoDispositivo.ROUTER,
                nombre: "Router Sucursal",
                sistemaOperativo: "Cisco IOS",
                hardware: "Cisco ISR 4321",
                software: "Routing, Firewall, NAT, QoS",
                posicion: { x: 2.5, y: 0, z: 3.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Sucursal", "LAN-Cajeros", "Internet"],
                conectadoAInternet: true,
              }],
            },
          ],
        },

        // ── Back Office Sucursal (right) ──
        // x:[5, 9], z:[0, 4.5]
        // Layout: Gerente y servidor con VPN
        //   Gerente(x:6,z:1)     ServidorLocal(x:8,z:1)
        //           ─── pasillo ───
        //   VPN(x:7,z:3.5)
        {
          id: 712,
          nombre: "Back Office Sucursal",
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 6, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 7105, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Gerente Sucursal",
                sistemaOperativo: "Windows 11 Pro",
                hardware: "Dell OptiPlex 7090",
                software: "SAP Banking, Office 365, Teams",
                posicion: { x: 6, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Andrea Guzmán",
                activos: [
                  { nombre: "metas_sucursal_Q1.xlsx", contenido: "Metas de la sucursal", tipo: TipoActivo.DOCUMENTO },
                ],
                redes: ["LAN-Sucursal"],
              }],
            },
            {
              id: 2,
              mueble: Mueble.RACK,
              posicion: { x: 8, y: 0, z: 1, rotacionY: 180 },
              dispositivos: [{
                id: 7106, tipo: TipoDispositivo.SERVER,
                nombre: "Servidor Local Sucursal",
                sistemaOperativo: "Windows Server 2022",
                hardware: "Dell PowerEdge T350",
                software: "Active Directory, File Server, Print Server",
                posicion: { x: 8, y: 0, z: 1, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Sucursal"],
              }],
            },
            {
              id: 3,
              mueble: Mueble.RACK,
              posicion: { x: 7, y: 0, z: 3.5, rotacionY: 0 },
              dispositivos: [{
                id: 7107, tipo: TipoDispositivo.VPN,
                nombre: "VPN Sucursal",
                sistemaOperativo: "FortiOS 7.4",
                hardware: "Fortinet FortiGate 80F",
                software: "Site-to-Site VPN, SD-WAN",
                posicion: { x: 7, y: 0, z: 3.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Sucursal", "Internet"],
                conectadoAInternet: true,
              }],
            },
          ],
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // ZONA 3: Centro de Desarrollo — 3 oficinas en fila
    //
    //  ┌──────────┬──────────┬──────────┐
    //  │  Open    │  QA Lab  │  DevOps  │  z:[0, 5]
    //  │  Office  │          │          │
    //  └──────────┴──────────┴──────────┘
    //  x:[0, 5]   x:[5, 9]  x:[9, 13]
    // ════════════════════════════════════════════════════════════
    {
      id: 3,
      nombre: "Centro de Desarrollo",
      dominio: "Dev-Center",
      redes: [
        { nombre: "LAN-Dev", color: ColoresRed.TURQUESA },
        { nombre: "LAN-QA", color: ColoresRed.CORAL },
        { nombre: "LAN-DevOps", color: ColoresRed.AZUL },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      personas: [
        {
          nombre: "Sofía Ramírez",
          correo: "s.ramirez@banconacional.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA,
        },
        {
          nombre: "Mateo Jiménez",
          correo: "m.jimenez@banconacional.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA,
        },
      ],
      oficinas: [
        // ── Open Office de Desarrollo (left) ──
        // x:[0, 5], z:[0, 5]
        // Layout: 2×2 grid de devs con pasillo central
        //   Dev1(x:1,z:1)    Dev2(x:3.5,z:1)
        //        ─── pasillo ───
        //   Dev3(x:1,z:3.5)  DevLead(x:3.5,z:3.5)
        {
          id: 721,
          nombre: "Open Office — Desarrollo",
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 1, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 7201, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Dev Frontend",
                sistemaOperativo: "macOS Sequoia",
                hardware: "MacBook Pro M4",
                software: "VS Code, Chrome DevTools, Figma",
                posicion: { x: 1, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Dev"],
              }],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 3.5, y: 0, z: 1, rotacionY: 180 },
              dispositivos: [{
                id: 7202, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Dev Backend",
                sistemaOperativo: "Ubuntu 24.04",
                hardware: "Lenovo ThinkPad X1 Carbon",
                software: "IntelliJ IDEA, Docker, pgAdmin",
                posicion: { x: 3.5, y: 0, z: 1, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Dev"],
              }],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 1, y: 0, z: 3.5, rotacionY: 0 },
              dispositivos: [{
                id: 7203, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Dev Mobile",
                sistemaOperativo: "macOS Sequoia",
                hardware: "MacBook Pro M4",
                software: "Xcode, Android Studio, Flutter",
                posicion: { x: 1, y: 0, z: 3.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Dev"],
              }],
            },
            {
              id: 4,
              mueble: Mueble.MESA,
              posicion: { x: 3.5, y: 0, z: 3.5, rotacionY: 180 },
              dispositivos: [{
                id: 7204, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC Dev Lead",
                sistemaOperativo: "Ubuntu 24.04",
                hardware: "System76 Thelio Mega",
                software: "VS Code, GitLab, Jira, Slack",
                posicion: { x: 3.5, y: 0, z: 3.5, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Sofía Ramírez",
                activos: [
                  { nombre: "arquitectura_microservicios.pdf", contenido: "Diagrama de arquitectura", tipo: TipoActivo.DOCUMENTO },
                ],
                redes: ["LAN-Dev"],
              }],
            },
          ],
        },

        // ── QA Lab (center) ──
        // x:[5, 9], z:[0, 5]
        // Layout: Estaciones de testing + servidor QA
        //   QA1(x:6,z:1)       QA2(x:8,z:1)
        //        ─── pasillo ───
        //   ServidorQA(x:7,z:3.5)
        {
          id: 722,
          nombre: "Laboratorio QA",
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 6, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 7205, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC QA Analista 1",
                sistemaOperativo: "Windows 11 Pro",
                hardware: "Dell OptiPlex 7090",
                software: "Selenium, Cypress, Postman, Burp Suite",
                posicion: { x: 6, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-QA"],
              }],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 8, y: 0, z: 1, rotacionY: 180 },
              dispositivos: [{
                id: 7206, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC QA Analista 2",
                sistemaOperativo: "macOS Sequoia",
                hardware: "MacBook Pro M4",
                software: "Selenium, Appium, Charles Proxy",
                posicion: { x: 8, y: 0, z: 1, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-QA"],
              }],
            },
            {
              id: 3,
              mueble: Mueble.RACK,
              posicion: { x: 7, y: 0, z: 3.5, rotacionY: 0 },
              dispositivos: [{
                id: 7207, tipo: TipoDispositivo.SERVER,
                nombre: "Servidor QA",
                sistemaOperativo: "Ubuntu Server 24.04",
                hardware: "Dell PowerEdge T550",
                software: "Jenkins, SonarQube, Selenium Grid",
                posicion: { x: 7, y: 0, z: 3.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-QA", "LAN-Dev"],
              }],
            },
          ],
        },

        // ── DevOps / Infraestructura (right) ──
        // x:[9, 13], z:[0, 5]
        // Layout: Estaciones + servidores de CI/CD
        //   DevOps1(x:10,z:1)    DevOps2(x:12,z:1)
        //         ─── pasillo ───
        //   CICD(x:10,z:3.5)     Registry(x:12,z:3.5)
        {
          id: 723,
          nombre: "DevOps / Infraestructura",
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
              dispositivos: [{
                id: 7208, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC DevOps Engineer 1",
                sistemaOperativo: "Ubuntu 24.04",
                hardware: "System76 Pangolin",
                software: "Terraform, Ansible, kubectl, Helm",
                posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                personaEncargada: "Mateo Jiménez",
                activos: [],
                redes: ["LAN-DevOps"],
              }],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 12, y: 0, z: 1, rotacionY: 180 },
              dispositivos: [{
                id: 7209, tipo: TipoDispositivo.WORKSTATION,
                nombre: "PC DevOps Engineer 2",
                sistemaOperativo: "Ubuntu 24.04",
                hardware: "Lenovo ThinkPad X1 Carbon",
                software: "ArgoCD, Prometheus, Grafana",
                posicion: { x: 12, y: 0, z: 1, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-DevOps"],
              }],
            },
            {
              id: 3,
              mueble: Mueble.RACK,
              posicion: { x: 10, y: 0, z: 3.5, rotacionY: 0 },
              dispositivos: [{
                id: 7210, tipo: TipoDispositivo.SERVER,
                nombre: "Servidor CI/CD",
                sistemaOperativo: "Ubuntu Server 24.04",
                hardware: "Dell PowerEdge R760",
                software: "GitLab CI, Jenkins, Harbor Registry",
                posicion: { x: 10, y: 0, z: 3.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-DevOps", "LAN-Dev", "LAN-QA"],
              }],
            },
            {
              id: 4,
              mueble: Mueble.RACK,
              posicion: { x: 12, y: 0, z: 3.5, rotacionY: 180 },
              dispositivos: [{
                id: 7211, tipo: TipoDispositivo.SERVER,
                nombre: "Servidor Container Registry",
                sistemaOperativo: "Ubuntu Server 24.04",
                hardware: "Dell PowerEdge R660",
                software: "Harbor, Trivy, Clair (scan vulnerabilidades)",
                posicion: { x: 12, y: 0, z: 3.5, rotacionY: 180 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-DevOps"],
              }],
            },
            {
              id: 5,
              mueble: Mueble.RACK,
              posicion: { x: 11, y: 0, z: 4.5, rotacionY: 0 },
              dispositivos: [{
                id: 7212, tipo: TipoDispositivo.VPN,
                nombre: "VPN Dev Center",
                sistemaOperativo: "FortiOS 7.4",
                hardware: "Fortinet FortiGate 100F",
                software: "Site-to-Site VPN, Remote Access",
                posicion: { x: 11, y: 0, z: 4.5, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-DevOps", "Internet"],
                conectadoAInternet: true,
              }],
            },
            {
              id: 6,
              mueble: Mueble.RACK,
              posicion: { x: 11, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [{
                id: 7213, tipo: TipoDispositivo.ROUTER,
                nombre: "Router Dev Center",
                sistemaOperativo: "Cisco IOS XE",
                hardware: "Cisco ISR 4431",
                software: "OSPF, Firewall, NAT, QoS",
                posicion: { x: 11, y: 0, z: 0, rotacionY: 0 },
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                activos: [],
                redes: ["LAN-Dev", "LAN-QA", "LAN-DevOps", "Internet"],
                conectadoAInternet: true,
              }],
            },
          ],
        },
      ],
    },
  ],
};
