import { Mueble, TipoDispositivo } from "../../types/DeviceEnums";

export const escenarioDeTest: unknown = {
  id: 1,
  titulo: "Escenario Introductorio",
  presupuestoInicial: 1000,
  zonas: [
    {
      id: 1,
      nombre: "Zona Principal",
      oficinas: [
        {
          id: 1,
          nombre: "Oficina 101",
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 101,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "PC-Jacob",
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 5, y: 0, z: -5, rotacionY: 0 },
              dispositivos: [
                {
                  id: 102,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "PC-Maria",
                },
              ],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 5, y: 0, z: 5, rotacionY: 0 },
              dispositivos: [],
            },
          ],
        },
      ],
    },
  ],
};
