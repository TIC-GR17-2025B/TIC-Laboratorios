import { Mueble, TipoDispositivo } from "../../types/DeviceEnums";

export const escenarioBase: any = {
  id: 1,
  titulo: "Escenario Introductorio",
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
                  sistemaOperativo: "Windows 10",
                  hardware: "Intel",
                  software: "Office Suite",
                  nombre: "PC de Jacob",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
