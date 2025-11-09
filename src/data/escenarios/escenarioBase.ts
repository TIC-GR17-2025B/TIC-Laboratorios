import { color } from "framer-motion";
import { AccionesRealizables, ObjetosManejables } from "../../types/AccionesEnums";
import {
  EstadoAtaqueDispositivo,
  Mueble,
  TipoAtaque,
  TipoDispositivo,
  TipoEvento,
} from "../../types/DeviceEnums";
import { TipoProtocolo } from "../../types/TrafficEnums";
export const escenarioBase: unknown = {
  id: 2,
  titulo: "Infraestructura Corporativa Completa",
  descripcion:
    "Un escenario empresarial con múltiples zonas, oficinas y dispositivos diversos",
  presupuestoInicial: 1000,
  ataques: [
    {
      nombreAtaque: "ataque 1",
      tiempoNotificacion: 10,
      tipoAtaque: TipoAtaque.INFECCION_TROYANO,
      dispositivoAAtacar: "Computadora Jacob",
      descripcion:
        "Un dispositivo está por ser infectado con un troyano. Revisa la activación del antivirus para evitarlo.",
      fase: 1,
      condicionMitigacion: {
        accion: AccionesRealizables.CLICK,
        objeto: ObjetosManejables.CONFIG_WORKSTATION,
        tiempo: -1,
        val: {
          nombreConfig: "Actualizaciones automáticas de antivirus",
          dispositivoAAtacar: "Computadora Jacob",
          activado: true,
        },
      },
    },
  ],
  eventos: [
    {
      nombreEvento: "Prueba de tráfico SSH",
      tipoEvento: TipoEvento.TRAFICO_RED,
      tiempoNotificacion: 15,
      descripcion: "Se probará conexión SSH entre zonas (WWW → LAN1).",
      fase: 1,
      infoAdicional: {
        dispositivoOrigen: "Servidor Web Externo",
        dispositivoDestino: "Computadora Administrativa",
        protocolo: TipoProtocolo.SSH,
      },
    },
    {
      nombreEvento: "Envío de archivo/activo",
      tipoEvento: TipoEvento.ENVIO_ACTIVO,
      tiempoNotificacion: 25,
      descripcion: "Se enviará un archivo entre dispositivos.",
      fase: 1,
      infoAdicional: { // Como es de un activo, se indica el nombre del activo a enviar, y los dispositivos involucrados
        nombreActivo: "Activo1",
        dispositivoEmisor: "Computadora Administrativa",
        dispositivoReceptor: "Computadora Jacob",
      },
    },
    
  ],
  fases: [
    {
      id: 1,
      nombre: "Fase 1",
      descripcion: "Mitigar el ataque de un troyano",
      faseActual: true,
    },
  ],
  zonas: [
    {
      id: 1,
      nombre: "Edificio Principal - Piso 1",
      redes: [
        {
          nombre: "LAN1",
          color: "#00ff00",
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
                  redes: ["LAN1"],
                },
              ],
            },
            {
              id: 4,
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
                  redes: [],
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
                  // Configuración de router
                  conectadoAInternet: true,
                  redes: ["LAN1"],
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
      redes: [
        {
          nombre: "RedWWW",
          color: "#ff6600",
        }
      ],
      oficinas: [
        {
          id: 201,
          nombre: "Datacenter Externo",
          posicion: { x: 10, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 2001,
                  tipo: TipoDispositivo.SERVER,
                  nombre: "Servidor Web Externo",
                  sistemaOperativo: "Ubuntu Server 22.04",
                  hardware: "Dell PowerEdge R740",
                  software: "Apache, MySQL, DNS",
                  posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
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
                  // Configuración de router
                  conectadoAInternet: true,
                  redes: ["RedWWW"],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

};
