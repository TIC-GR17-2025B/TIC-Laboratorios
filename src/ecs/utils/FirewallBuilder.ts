import type { ConfiguracionFirewall, AccionFirewall, ReglaDispositivo, DireccionTrafico, ReglaGlobal } from '../../types/FirewallTypes';
import type { TipoProtocolo } from '../../types/TrafficEnums';


export class FirewallBuilder {
  private config: ConfiguracionFirewall;


  constructor() {
    this.config = {
      habilitado: true,
      politicaPorDefecto: 'PERMITIR',
      reglasGlobales: new Map(),
      excepciones: new Map()
    };
  }

  //Habilita o deshabilita el firewall
  setHabilitado(habilitado: boolean): this {
    this.config.habilitado = habilitado;
    return this;
  }

  //Establece la política por defecto (aplicada cuando no hay reglas específicas) 
  setPoliticaPorDefecto(politica: AccionFirewall): this {
    this.config.politicaPorDefecto = politica;
    return this;
  }
  //Establece política cuando se deniega TODO tráfico saliente
  setPoliticaSaliente(politica: AccionFirewall): this {
    this.config.politicaPorDefectoSaliente = politica;
    return this;
  }

//Establece política cuando se deniega TODO tráfico entrante
  setPoliticaEntrante(politica: AccionFirewall): this {
    this.config.politicaPorDefectoEntrante = politica;
    return this;
  }


  agregarReglasGlobales(
    protocolos: TipoProtocolo[], 
    accion: AccionFirewall,
    direccion: DireccionTrafico
  ): this {
    protocolos.forEach(protocolo => {
      const reglasExistentes = this.config.reglasGlobales.get(protocolo) || [];
      const nuevaRegla: ReglaGlobal = { accion, direccion };
      this.config.reglasGlobales.set(protocolo, [...reglasExistentes, nuevaRegla]);
    });
    return this;
  }

  agregarReglaGlobal(
    protocolo: TipoProtocolo, 
    accion: AccionFirewall,
    direccion: DireccionTrafico
  ): this {
    const reglasExistentes = this.config.reglasGlobales.get(protocolo) || [];
    const nuevaRegla: ReglaGlobal = { accion, direccion };
    this.config.reglasGlobales.set(protocolo, [...reglasExistentes, nuevaRegla]);
    return this;
  }

  
  agregarExcepciones(
    protocolo: TipoProtocolo, 
    dispositivos: string[], 
    accion: AccionFirewall,
    direccion: DireccionTrafico
  ): this {
    const reglasExistentes = this.config.excepciones.get(protocolo) || [];
    const nuevasReglas: ReglaDispositivo[] = dispositivos.map(nombre => ({
      nombreDispositivo: nombre,
      accion,
      direccion
    }));
    
    this.config.excepciones.set(protocolo, [...reglasExistentes, ...nuevasReglas]);
    return this;
  }


  agregarExcepcion(
    protocolo: TipoProtocolo, 
    dispositivo: string, 
    accion: AccionFirewall,
    direccion: DireccionTrafico
  ): this {
    const reglasExistentes = this.config.excepciones.get(protocolo) || [];
    const nuevaRegla: ReglaDispositivo = {
      nombreDispositivo: dispositivo,
      accion,
      direccion
    };
    
    this.config.excepciones.set(protocolo, [...reglasExistentes, nuevaRegla]);
    return this;
  }
  build(): ConfiguracionFirewall {
    return this.config;
  }
}
