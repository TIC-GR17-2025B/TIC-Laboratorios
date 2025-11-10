import type { TipoProtocolo } from "./TrafficEnums";


export type AccionFirewall = 'PERMITIR' | 'DENEGAR';


export type DireccionTrafico = 'SALIENTE' | 'ENTRANTE' | 'AMBAS';


export interface ReglaGlobal {
    accion: AccionFirewall;
    direccion: DireccionTrafico;
}


export interface ReglaDispositivo {
    nombreDispositivo: string;
    accion: AccionFirewall;
    direccion: DireccionTrafico;
}


export interface ConfiguracionFirewall {
    habilitado: boolean;
    politicaPorDefecto: AccionFirewall;
    politicaPorDefectoSaliente?: AccionFirewall; 
    politicaPorDefectoEntrante?: AccionFirewall; 
    reglasGlobales: Map<TipoProtocolo, ReglaGlobal[]>; 
    excepciones: Map<TipoProtocolo, ReglaDispositivo[]>;
}

export interface LogFirewall {
    timestamp: number;
    mensaje: string;
    tipo: 'PERMITIDO' | 'BLOQUEADO' | 'REGLA_AGREGADA';
}
