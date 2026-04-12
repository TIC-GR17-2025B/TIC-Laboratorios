import {
  AccionesRealizables,
  ObjetosManejables,
} from "../../types/AccionesEnums";
import {
  EstadoAtaqueDispositivo,
  Mueble,
  NivelConcienciaSeguridad,
  TipoActivo,
  TipoDispositivo,
  TipoEvento,
  TipoAtaque
} from "../../types/DeviceEnums";
import { AccionFirewall, DireccionTrafico } from "../../types/FirewallTypes";
import { TipoProtocolo } from "../../types/TrafficEnums";
import { ColoresRed } from "../colores";

export const escenarioPrueba: unknown = {
  id: 777,
  slug: "Prueba",
  titulo: "Prueba",
  categoria: "Prueba",
  imagenPreview: "/redFirewallVPN.webp",
  descripcion:
    "Un escenario en el que se aplica técnicas de ingeniería social para hackear un dipositivo y obtener información.",
  presupuestoInicial: 1000,
  ataques: [ 
    {
      nombreAtaque: "ataque 1",
      tiempoNotificacion: 5,
      tipoAtaque: TipoAtaque.INFECCION_TROYANO,
      dispositivoAAtacar: "Router Principal",
      descripcion:
        "Un router está por ser infectado con un troyano. Revisa la activación del antivirus para evitarlo.",
      fase: 1,
      condicionMitigacion: {
        accion: AccionesRealizables.CLICK,
        objeto: ObjetosManejables.CONFIG_FIREWALL,
        val: [
          {
            nombreRed: "LAN1",
            accion: AccionFirewall.DENEGAR,
            direccion: DireccionTrafico.HACIA,
            protocolo: TipoProtocolo.SSH,
          },
          {
            nombreRed: "LAN1",
            accion: AccionFirewall.DENEGAR,
            direccion: DireccionTrafico.HACIA,
            protocolo: TipoProtocolo.FTP,
          },
        ],
      },
    },
    {
      nombreAtaque: "ataque 2",
      tiempoNotificacion: 20,
      tipoAtaque: TipoAtaque.INFECCION_TROYANO,
      dispositivoAAtacar: "Computadora Jacob",
      descripcion:
        "Un dispositivo está por ser infectado con un troyano. Revisa la activación del antivirus para evitarlo.",
      fase: 1,
      condicionMitigacion: {
        accion: AccionesRealizables.CLICK,
        objeto: ObjetosManejables.CONFIG_WORKSTATION,
        val: [
           {
             nombreConfig: "Actualizaciones automáticas de antivirus",
             activado: true,
           },
           {
             nombreConfig: "Antivirus gestionado",
             activado: true,
           }
        ],
      },
    },
  ],
  eventos: [  
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 35,
      descripcion: "¡Felicidades, has completado el escenario de este nivel!",
      fase: 1,
    },
  ],
  accionesEsperadas: [
    {
      accion: AccionesRealizables.CLICK,
      objeto: ObjetosManejables.CONFIG_FIREWALL,
      inicioTiempoEsperado: 5,
      finTiempoEsperado: 15,
      val: {
            nombreRouter: "Router Principal",
            nombreRed: "LAN1",
            accion: AccionFirewall.DENEGAR,
            direccion: DireccionTrafico.HACIA,
            protocolo: TipoProtocolo.SSH,
          }
    },
    {
      accion: AccionesRealizables.CLICK,
      objeto: ObjetosManejables.CONFIG_FIREWALL,
      inicioTiempoEsperado: 5,
      finTiempoEsperado: 15,
      val: {
            nombreRouter: "Router Principal",
            nombreRed: "LAN1",
            accion: AccionFirewall.DENEGAR,
            direccion: DireccionTrafico.HACIA,
            protocolo: TipoProtocolo.FTP,
          }
    },
    {
      accion: AccionesRealizables.CLICK,
      objeto: ObjetosManejables.CONFIG_WORKSTATION,
      inicioTiempoEsperado: 20,
      finTiempoEsperado: 30,
      val:{
          nombreConfig: "Actualizaciones automáticas de antivirus",
          dispositivoAAtacar: "Computadora Jacob",
          activado: true,
        },
    },
    {
      accion: AccionesRealizables.CLICK,
      objeto: ObjetosManejables.CONFIG_WORKSTATION,
      inicioTiempoEsperado: 20,
      finTiempoEsperado: 30,
      val:{
          nombreConfig: "Antivirus gestionado",
          dispositivoAAtacar: "Computadora Jacob",
          activado: true,
        }
    },
  ],
  fases: [
    {
      id: 1,
      nombre: "Fase 1: Prueba",
      descripcion:
        "Prueba",
      faseActual: true,
      completada: false,
      objetivos: [
        {
          descripcion: "ataque 1",
          completado: false,
        },
        {
          descripcion: "ataque 2",
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
      personas: [
        {
          nombre: "Carlos Mendoza",
          correo: "carlos.mendoza@corp.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA,
        },
        {
          nombre: "Jacob García",
          correo: "jacob.garcia@corp.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.BAJA,
        },
        {
          nombre: "Ana Torres",
          correo: "ana.torres@corp.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.MEDIA,
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
                  personaEncargada: "Carlos Mendoza",
                  nombreEquipo: "PcAdmin",
                  usuario: "admin",
                  contrasenia: "a123",
                  activos: [
                    {
                      nombre: "Documento Jacob",
                      contenido: "La contraseña secreta es 12344",
                      tipo: TipoActivo.DOCUMENTO,
                      firma: "Firma Documento Jacob",
                    },
                    {
                      nombre: "Firma Documento Jacob",
                      contenido: "La contraseña secreta es 123",
                      tipo: TipoActivo.FIRMA_DIGITAL,
                      propietario: "Jacob",
                    },
                    {
                      nombre: "Clave_Publica_Jacob",
                      tipo: TipoActivo.CLAVE_PUBLICA,
                      propietario: "Jacob",
                    },
                    {
                      nombre: "Activo genérico",
                      contenido: "a",
                      tipo: TipoActivo.GENERICO,
                    },
                    {
                      nombre: "Activo genérico 2",
                      contenido: "abcdefg",
                      tipo: TipoActivo.DOCUMENTO,
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
                  personaEncargada: "Jacob García",
                  nombreEquipo: "PcJacob",
                  usuario: "jgarcia",
                  contrasenia: "j123",
                  activos: [
                    {
                      nombre: "credenciales",
                      contenido: "usuario: jgarcia\ncontraseña: j123",
                      tipo: TipoActivo.DOCUMENTO,
                    },
                    {
                      nombre: "secret_keys",
                      contenido:
                        "# Credenciales de base de datos principal (NO COMPARTIR NI MODIFICAR!!)\nDB_HOST=prod-db.internal.corporacion\nDB_USER=admin_prod\nDB_PASSWORD=Sup3rS3cr3t_DB_P@ss!!\n",
                      tipo: TipoActivo.DOCUMENTO,
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
                  personaEncargada: "Ana Torres",
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
                  personaEncargada: "Lisa Rodriguez",
                  nombreEquipo: "PcLisa",
                  usuario: "lisa",
                  contrasenia: "l123",
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
