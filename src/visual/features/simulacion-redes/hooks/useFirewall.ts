import { useState, useMemo, useCallback } from "react";
import type { ECSManager } from "../../../../ecs/core";
import type { Entidad } from "../../../../ecs/core/Componente";
import { RedController } from "../../../../ecs/controllers/RedController";
import type { TipoProtocolo } from "../../../../types/TrafficEnums";
import type { DireccionTrafico } from "../../../../types/FirewallTypes";
import { DispositivoComponent, RouterComponent, RedComponent } from "../../../../ecs/components";

interface RedInfo {
  nombre: string;
  color: string;
  entidadId: Entidad;
}

export function useFirewall(entidadRouter: Entidad | null, ecsManager: ECSManager) {
  const [refreshKey, setRefreshKey] = useState(0);

  const redController = useMemo(() => {
    if (!ecsManager) return null;
    return RedController.getInstance(ecsManager);
  }, [ecsManager]);

  // Obtener logs directamente del RouterComponent
  const logsFirewall = useMemo(() => {
    if (!entidadRouter) return [];
    
    const routerComponent = ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
    console.log('RouterComponent:', routerComponent);
    console.log('logsFirewall:', routerComponent?.logsFirewall);
    return routerComponent?.logsFirewall || [];
  }, [entidadRouter, ecsManager, refreshKey]);

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
    setRefreshKey(prev => prev + 1); // Refrescar para mostrar el nuevo log
  }, [entidadRouter, redController, estaProtocoloBloqueado]);

  const refrescarLogs = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return {
    router: routerInfo,
    redesRouter,
    configuracionFirewall,
    estaProtocoloBloqueado,
    toggleProtocolo,
    logsFirewall,
    refrescarLogs
  };
}
