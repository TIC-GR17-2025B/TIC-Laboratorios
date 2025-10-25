import type { TipoDispositivo } from "./DeviceEnums";
import { LogCategory } from "./LogCategory";

declare global {
  type Log = {
    time: string;
    content: string;
    category: LogCategory;
  };

  // Estas entidades son para el 3D
  interface BaseEntity {
    id: Entidad;
    position: [number, number, number];
    rotation: number;
  }
  interface EspacioEntity extends BaseEntity {
    type: "espacio";
    espacio: Espacio;
  }
  interface DispositivoEntity extends BaseEntity {
    type: "dispositivo";
    dispositivo: Dispositivo;
  }
  type ECSSceneEntity = EspacioEntity | DispositivoEntity;
}

export {};
