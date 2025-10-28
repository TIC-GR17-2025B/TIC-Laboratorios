import {
  EstadoAtaqueDispositivo,
  Mueble,
  TipoAtaque,
  TipoDispositivo,
} from "../../types/DeviceEnums";

export const escenarioBase: any = {
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
        accion: "Click",
        objeto: "Configuracion Workstation",
        tiempo: -1,
        val: {
          nombreConfig: "Actualizaciones automáticas de antivirus",
          activado: true,
        },
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
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 3, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 1003,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Computadora Jacob",
                  sistemaOperativo: "pfSense",
                  hardware: "Fortinet FortiGate 200F",
                  software: "IDS/IPS, VPN",
                  posicion: { x: 3, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
