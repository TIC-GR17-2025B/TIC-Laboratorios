import { AccionesRealizables, ObjetosManejables } from "../../types/AccionesEnums";
import {
  EstadoAtaqueDispositivo,
  Mueble,
  TipoActivo,
  TipoDispositivo,
  TipoEvento,
} from "../../types/DeviceEnums";
import { ColoresRed } from "../colores";
import { PlantillasCorreoPhishing } from "../plantillas/Plantillas";

export const escenarioHackingEtico: unknown = {
  id: 3,
  titulo: "Hacking Ético",
  imagenPreview: "/redFirewallVPN.webp",
  descripcion:
    "Un escenario con 1 reto: 1) Verificar la veracidad de una firma digital de un documento.",
  presupuestoInicial: 1000,
  ataques: [],
  apps: [
    {
      nombre: "Net-Scan Viz",
      descripcion: "Aplicación de escaneo de dispositivos en un dominio.",
      precio: "0",
    },
    {
      nombre: "Company Social-Searcher",
      descripcion: "Aplicación OSINT para obtener información de empleados de una empresa.",
      precio: "0",
    },
    {
      nombre: "Phish-Matic",
      descripcion: "Aplicación para enviar correos tipo phishing.",
      precio: "0",
    },
  ],
  eventos: [
    {
      nombreEvento: "Escaneo de dispositivos",
      tipoEvento: TipoEvento.VERIFICACION_ACCION_JUGADOR,
      tiempoNotificacion: 5,
      descripcion: "Para empezar con la fase de Reconocimiento y Escaneo, escanea los dispositivos disponibles en el dominio 'Corporación' utilizando Net-Scan Viz",
      fase: 1,
      infoAdicional: {
        accion: AccionesRealizables.EJECUTAR,
        objeto: ObjetosManejables.APLICACION,
        tiempo: 0,
        val: {
          nombreAplicacion: "Net-Scan Viz",
        },
      },
    },
    {
      nombreEvento: "Búsqueda de personas",
      tipoEvento: TipoEvento.VERIFICACION_ACCION_JUGADOR,
      tiempoNotificacion: 20,
      descripcion: "Ahora se necesita obtener información de los empleados de la empresa. Utiliza Company Social-Searcher para lograrlo.",
      fase: 1,
      infoAdicional: {
        accion: AccionesRealizables.EJECUTAR,
        objeto: ObjetosManejables.APLICACION,
        tiempo: 0,
        val: {
          nombreAplicacion: "Company Social-Searcher",
        },
      },
    },
    {
      nombreEvento: "Completación Fase 1",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 35, // Este es un caso especial. Aquí se ejecutará directamente en el tiempo de notificación
      descripcion:
        "¡Has completado la fase de Reconocimiento y Escaneo! Ahora puedes continuar con la fase de Explotación.",
      fase: 1,
    },
    {
      nombreEvento: "Creación de correo phishing",
      tipoEvento: TipoEvento.ENVIO_CORREO,
      tiempoNotificacion: 40,
      descripcion: "Una vez identificados los dispositivos y empleados de la empresa, es posible obtener credenciales de acceso mediante ingeniería social. Utiliza Phish-Matic para crear un correo tipo phishing e intentar obtener credenciales a través de él.",
      fase: 2,
      infoAdicional: {
        dispositivoEmisor: "Computadora Lisa",
        destinatario: "jacob.garcia@corp.com",
        asunto: PlantillasCorreoPhishing[0].asunto
      },
    },
    {
      nombreEvento: "Recepción de credenciales",
      tipoEvento: TipoEvento.ENVIO_ACTIVO,
      tiempoNotificacion: 55,
      descripcion: "El engaño con el correo fue exitoso. El empleado acaba de enviar sus credenciales, revisa tu explorador de archivos para encontrarlas.",
      fase: 2,
      infoAdicional: {
        nombreActivo: "credenciales",
        dispositivoEmisor: "Computadora Jacob",
        dispositivoReceptor: "Computadora Lisa",
      },
      ejecutarAlInstante: true,
    }, 
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 20,
      descripcion: "¡Felicidades, has completado el escenario de este nivel!",
      fase: 1,
    },
  ],
  fases: [
    {
      id: 1,
      nombre: "Fase 1: Fase de Reconocimiento y Escaneo",
      descripcion:
        "Recopilar información de la empresa y sus empleados antes de realizar el ataque.",
      faseActual: true,
      completada: false,
      objetivos: [
        {
          descripcion: "Escaneo de dispositivos",
          completado: false,
        },
        {
          descripcion: "Búsqueda de personas",
          completado: false,
        },
      ],
    },
    {
      id: 2,
      nombre: "Fase 2: Fase de Explotación",
      descripcion:
        "Con la información recopilada, se intenta obtener acceso no autorizado mediante técnicas de ingeniería social.",
      faseActual: false,
      completada: false,
      objetivos: [
        {
          descripcion: "Creación de correo phishing",
          completado: false,
        },
        {
          descripcion: "Recepción de credenciales",
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
                  activos: [
                    {
                      nombre: "credenciales",
                      contenido: "usuario: jgarcia\ncontraseña: j123",
                      tipo: TipoActivo.DOCUMENTO
                    },
                  ],
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
    // --- ---
    {
      id: 3,
      nombre: "Casa Atacante",
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

