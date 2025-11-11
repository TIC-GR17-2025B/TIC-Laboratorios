import { useCallback, useState, useEffect, useMemo } from "react";
import type { ECSManager } from "../../../../ecs/core";
import type { Entidad } from "../../../../ecs/core/Componente";
import { RedController } from "../../../../ecs/controllers/RedController";
import { EventosFirewall } from "../../../../types/EventosEnums";
import { TipoProtocolo } from "../../../../types/TrafficEnums";
import type { DireccionTrafico, ConfiguracionFirewall } from "../../../../types/FirewallTypes";
import { DispositivoComponent } from "../../../../ecs/components";

// Mapeo de servicios del frontend con protocolos del backend
const SERVICIO_TO_PROTOCOLO: Record<string, TipoProtocolo> = {
  'http': TipoProtocolo.WEB_SERVER,
  'https': TipoProtocolo.WEB_SERVER_SSL,
  'ftp': TipoProtocolo.FTP,
  'ssh': TipoProtocolo.SSH,
  'email': TipoProtocolo.EMAIL_SERVER,
  'web_server': TipoProtocolo.WEB_SERVER,
};

interface ReglaFirewall {
  red: string;
  direccion: 'inbound' | 'outbound';
  servicios: string[];
}

// Mapeo inverso: protocolo a servicio
const PROTOCOLO_TO_SERVICIO: Record<TipoProtocolo, string> = {
  [TipoProtocolo.WEB_SERVER]: 'http',
  [TipoProtocolo.WEB_SERVER_SSL]: 'https',
  [TipoProtocolo.FTP]: 'ftp',
  [TipoProtocolo.SSH]: 'ssh',
  [TipoProtocolo.EMAIL_SERVER]: 'email',
  // Mapeos adicionales para otros protocolos
  [TipoProtocolo.EMAIL_SERVER_SSL]: 'email',
  [TipoProtocolo.TELNET]: 'ssh', // Agrupado con SSH por simplicidad
  [TipoProtocolo.DATABASE]: 'web_server', // Agrupado por simplicidad
  [TipoProtocolo.LDAP]: 'web_server',
  [TipoProtocolo.LDAP_SSL]: 'web_server',
  [TipoProtocolo.DEFENSE_RAT]: 'web_server',
  [TipoProtocolo.DEFENSE_4T]: 'web_server',
  [TipoProtocolo.VPN_GATEWAY]: 'web_server',
  [TipoProtocolo.REPORTING]: 'web_server',
  [TipoProtocolo.MANAGEMENT]: 'web_server',
  [TipoProtocolo.NETWORK_FILE_SERVICE]: 'ftp',
  [TipoProtocolo.MESSAGING]: 'email'
};

// Función para convertir la configuración del backend a reglas del frontend
function convertirConfiguracionAReglas(configuracion: ConfiguracionFirewall): ReglaFirewall[] {
  const reglas: ReglaFirewall[] = [];
  
  // Para cada red (LAN1 e Internet)
  ['lan1', 'internet'].forEach(red => {
    // Para cada dirección (inbound/outbound)
    ['inbound', 'outbound'].forEach(direccionFront => {
      const direccionBack = direccionFront === 'inbound' ? 'ENTRANTE' : 'SALIENTE';
      const serviciosBloqueados: string[] = [];
      
      // Revisar reglas globales
      configuracion.reglasGlobales.forEach((reglasProtocolo, protocolo) => {
        const servicioFrontend = PROTOCOLO_TO_SERVICIO[protocolo];
        if (servicioFrontend) {
          // Si hay reglas para este protocolo y dirección que DENIEGAN
          const hayReglaBloqueo = reglasProtocolo.some(regla => 
            regla.direccion === direccionBack && regla.accion === 'DENEGAR'
          );
          
          if (hayReglaBloqueo) {
            serviciosBloqueados.push(servicioFrontend);
          }
        }
      });

      // Solo crear regla si hay servicios bloqueados
      if (serviciosBloqueados.length > 0) {
        reglas.push({
          red,
          direccion: direccionFront as 'inbound' | 'outbound',
          servicios: [...new Set(serviciosBloqueados)] // Eliminar duplicados
        });
      }
    });
  });

  return reglas;
}

export function useFirewall(entidadRouter: Entidad | null, ecsManager: ECSManager) {
  const [reglas, setReglas] = useState<ReglaFirewall[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const redController = useMemo(() => {
    if (!ecsManager) return null;
    return RedController.getInstance(ecsManager);
  }, [ecsManager]);

  // Cargar configuración inicial del firewall desde el backend
  useEffect(() => {
    if (!entidadRouter || !redController) return;

    const configuracion = redController.obtenerConfiguracionFirewall(entidadRouter);
    if (configuracion) {
      // Convertir la configuración del backend a reglas del frontend
      const reglasFromBackend = convertirConfiguracionAReglas(configuracion);
      setReglas(reglasFromBackend);
    }
  }, [entidadRouter, redController]);

  // Obtener información del dispositivo router
  const router = useMemo(() => {
    if (!entidadRouter) return null;
    const container = ecsManager.getComponentes(entidadRouter);
    return container?.get(DispositivoComponent);
  }, [entidadRouter, ecsManager, refreshKey]);

  // Suscripción a eventos del firewall para refrescar configuración
  useEffect(() => {
    if (!ecsManager) {
      console.warn('ECSManager no está disponible para suscribirse a eventos de firewall');
      return;
    }

    const unsubscribeHabilitado = ecsManager.on(EventosFirewall.HABILITADO, () => {
      setRefreshKey(prev => prev + 1);
    });

    const unsubscribeDeshabilitado = ecsManager.on(EventosFirewall.DESHABILITADO, () => {
      setRefreshKey(prev => prev + 1);
    });

    const unsubscribeReglaAgregada = ecsManager.on(EventosFirewall.REGLA_AGREGADA, () => {
      setRefreshKey(prev => prev + 1);
    });

    return () => {
      unsubscribeHabilitado();
      unsubscribeDeshabilitado();
      unsubscribeReglaAgregada();
    };
  }, [ecsManager]);

  // Obtener regla específica
  const obtenerRegla = useCallback((red: string, direccion: 'inbound' | 'outbound'): ReglaFirewall => {
    const reglaExistente = reglas.find(r => r.red === red && r.direccion === direccion);
    if (reglaExistente) return reglaExistente;
    return { red, direccion, servicios: [] };
  }, [reglas]);

  // Verificar si un servicio está bloqueado
  const estaServicioBloqueado = useCallback((red: string, direccion: 'inbound' | 'outbound', servicio: string): boolean => {
    const regla = obtenerRegla(red, direccion);
    return regla.servicios.includes(servicio);
  }, [obtenerRegla]);

  // Toggle de un servicio específico
  const toggleServicio = useCallback((red: string, direccion: 'inbound' | 'outbound', servicio: string) => {
    if (!entidadRouter || !redController) return;

    const reglaActual = obtenerRegla(red, direccion);
    const estaBloqueado = reglaActual.servicios.includes(servicio);

    let nuevosServicios: string[];
    if (estaBloqueado) {
      nuevosServicios = reglaActual.servicios.filter(s => s !== servicio);
    } else {
      nuevosServicios = [...reglaActual.servicios, servicio];
    }

    // Actualizar estado local
    const reglasActualizadas = reglas.filter(r => !(r.red === red && r.direccion === direccion));
    if (nuevosServicios.length > 0) {
      reglasActualizadas.push({ red, direccion, servicios: nuevosServicios });
    }
    setReglas(reglasActualizadas);

    // Comunicar con el backend
    const protocolo = SERVICIO_TO_PROTOCOLO[servicio];
    if (protocolo) {
      const direccionTrafico: DireccionTrafico = direccion === 'inbound' ? 'ENTRANTE' : 'SALIENTE';
      const accion = estaBloqueado ? 'PERMITIR' : 'DENEGAR';
      
      redController.agregarReglaFirewall(entidadRouter, protocolo, accion, direccionTrafico);
    }
  }, [entidadRouter, reglas, obtenerRegla, redController]);

  // Toggle todos los servicios
  const toggleTodos = useCallback((red: string, direccion: 'inbound' | 'outbound') => {
    if (!entidadRouter || !redController) return;

    const reglaActual = obtenerRegla(red, direccion);
    const serviciosDisponibles = ['http', 'https', 'ftp', 'ssh', 'email', 'web_server'];
    const todosBloqueados = reglaActual.servicios.length === serviciosDisponibles.length;

    const reglasActualizadas = reglas.filter(r => !(r.red === red && r.direccion === direccion));

    if (todosBloqueados) {
      // Permitir todos - quitar la regla
      setReglas(reglasActualizadas);
      
      // Comunicar con backend - establecer política permisiva
      if (direccion === 'inbound') {
        redController.setPoliticaFirewallEntrante(entidadRouter, 'PERMITIR');
      } else {
        redController.setPoliticaFirewallSaliente(entidadRouter, 'PERMITIR');
      }
    } else {
      // Bloquear todos - agregar todos los servicios
      reglasActualizadas.push({
        red,
        direccion,
        servicios: serviciosDisponibles
      });
      setReglas(reglasActualizadas);

      // Comunicar con backend - establecer política restrictiva
      if (direccion === 'inbound') {
        redController.setPoliticaFirewallEntrante(entidadRouter, 'DENEGAR');
      } else {
        redController.setPoliticaFirewallSaliente(entidadRouter, 'DENEGAR');
      }
    }
  }, [entidadRouter, reglas, obtenerRegla, redController]);

  return {
    reglas,
    router,
    obtenerRegla,
    estaServicioBloqueado,
    toggleServicio,
    toggleTodos
  };
}
