import { useState, useEffect, useMemo, useCallback } from "react";
import type { ECSManager } from "../../../../ecs/core";
import type { Entidad } from "../../../../ecs/core/Componente";
import { RedController } from "../../../../ecs/controllers/RedController";
import { EventosFirewall } from "../../../../types/EventosEnums";
import type { TipoProtocolo } from "../../../../types/TrafficEnums";
import type { DireccionTrafico } from "../../../../types/FirewallTypes";
import { DispositivoComponent, RouterComponent, RedComponent } from "../../../../ecs/components";
import { useFirewallLogs } from "../context/FirewallLogsContext";

interface RedInfo {
  nombre: string;
  color: string;
  entidadId: Entidad;
}

export function useFirewall(entidadRouter: Entidad | null, ecsManager: ECSManager) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { agregarLog } = useFirewallLogs();

  const redController = useMemo(() => {
    if (!ecsManager) return null;
    return RedController.getInstance(ecsManager);
  }, [ecsManager]);

  useEffect(() => {
    if (!ecsManager) return;

    const unsubscribePermitido = ecsManager.on(EventosFirewall.TRAFICO_PERMITIDO, (data: unknown) => {
      const d = data as { mensaje: string; router?: string };
      agregarLog({
        timestamp: Date.now(),
        mensaje: d.mensaje,
        tipo: 'PERMITIDO',
        routerNombre: d.router
      });
      setRefreshKey(prev => prev + 1);
    });

    const unsubscribeBloqueado = ecsManager.on(EventosFirewall.TRAFICO_BLOQUEADO, (data: unknown) => {
      const d = data as { mensaje: string; router?: string };
      agregarLog({
        timestamp: Date.now(),
        mensaje: d.mensaje,
        tipo: 'BLOQUEADO',
        routerNombre: d.router
      });
      setRefreshKey(prev => prev + 1);
    });

    const unsubscribeHabilitado = ecsManager.on(EventosFirewall.HABILITADO, (data: unknown) => {
      const d = data as { router: string; mensaje: string };
      agregarLog({
        timestamp: Date.now(),
        mensaje: d.mensaje,
        tipo: 'HABILITADO',
        routerNombre: d.router
      });
      setRefreshKey(prev => prev + 1);
    });

    const unsubscribeDeshabilitado = ecsManager.on(EventosFirewall.DESHABILITADO, (data: unknown) => {
      const d = data as { router: string; mensaje: string };
      agregarLog({
        timestamp: Date.now(),
        mensaje: d.mensaje,
        tipo: 'DESHABILITADO',
        routerNombre: d.router
      });
      setRefreshKey(prev => prev + 1);
    });

    const unsubscribeReglaAgregada = ecsManager.on(EventosFirewall.REGLA_AGREGADA, (data: unknown) => {
      const d = data as { router: string; mensaje: string };
      agregarLog({
        timestamp: Date.now(),
        mensaje: d.mensaje,
        tipo: 'REGLA_AGREGADA',
        routerNombre: d.router
      });
      setRefreshKey(prev => prev + 1);
    });

    const unsubscribePoliticaCambiada = ecsManager.on(EventosFirewall.POLITICA_CAMBIADA, (data: unknown) => {
      const d = data as { router: string; mensaje: string };
      agregarLog({
        timestamp: Date.now(),
        mensaje: d.mensaje,
        tipo: 'POLITICA_CAMBIADA',
        routerNombre: d.router
      });
      setRefreshKey(prev => prev + 1);
    });

    return () => {
      unsubscribePermitido();
      unsubscribeBloqueado();
      unsubscribeHabilitado();
      unsubscribeDeshabilitado();
      unsubscribeReglaAgregada();
      unsubscribePoliticaCambiada();
    };
  }, [ecsManager, agregarLog]);

  const redesRouter = useMemo((): RedInfo[] => {
    if (!entidadRouter || !redController) return [];

    const redesEntidades = redController.obtenerRedesDeRouter(entidadRouter);
    
    return redesEntidades.map(entidadRed => {
      const container = ecsManager.getComponentes(entidadRed);
      const redComp = container?.get(RedComponent);
      
      return {
        nombre: redComp?.nombre || `Red ${entidadRed}`,
        color: redComp?.color || '#808080',
        entidadId: entidadRed
      };
    });
  }, [entidadRouter, redController, ecsManager, refreshKey]);

  const routerInfo = useMemo(() => {
    if (!entidadRouter) return null;

    const container = ecsManager.getComponentes(entidadRouter);
    const dispComp = container?.get(DispositivoComponent);
    const routerComp = container?.get(RouterComponent);

    return {
      nombre: dispComp?.nombre || 'Router',
      conectadoAInternet: routerComp?.conectadoAInternet || false,
      firewallHabilitado: routerComp?.firewall?.habilitado || false
    };
  }, [entidadRouter, ecsManager, refreshKey]);

  const configuracionFirewall = useMemo(() => {
    if (!entidadRouter || !redController) return null;
    return redController.obtenerConfiguracionFirewall(entidadRouter);
  }, [entidadRouter, redController, refreshKey]);


  const estaProtocoloBloqueado = useCallback((protocolo: TipoProtocolo, direccion: DireccionTrafico): boolean => {
    if (!configuracionFirewall) return false;

    const reglasProtocolo = configuracionFirewall.reglasGlobales.get(protocolo);
    
    if (reglasProtocolo && reglasProtocolo.length > 0) {
      const regla = reglasProtocolo.find(r => r.direccion === direccion || r.direccion === 'AMBAS');
      if (regla) {
        return regla.accion === 'DENEGAR';
      }
    }

    const politica = direccion === 'ENTRANTE' 
      ? configuracionFirewall.politicaPorDefectoEntrante 
      : configuracionFirewall.politicaPorDefectoSaliente;
    
    return politica === 'DENEGAR';
  }, [configuracionFirewall]);

  const toggleProtocolo = useCallback((protocolo: TipoProtocolo, direccion: DireccionTrafico) => {
    if (!entidadRouter || !redController) return;

    const estaBloqueado = estaProtocoloBloqueado(protocolo, direccion);
    const accion = estaBloqueado ? 'PERMITIR' : 'DENEGAR';
    
    redController.agregarReglaFirewall(entidadRouter, protocolo, accion, direccion);
  }, [entidadRouter, redController, estaProtocoloBloqueado]);

  return {
    router: routerInfo,
    redesRouter,
    configuracionFirewall,
    estaProtocoloBloqueado,
    toggleProtocolo
  };
}
