import { createContext, type ReactNode, useContext, useState, useCallback, useEffect } from 'react';
import { EventosFirewall } from '../../../../types/EventosEnums';
import type { ECSManager } from '../../../../ecs/core';

interface FirewallLog {
    timestamp: number;
    mensaje: string;
    tipo: 'PERMITIDO' | 'BLOQUEADO' | 'REGLA_AGREGADA' | 'HABILITADO' | 'DESHABILITADO' | 'POLITICA_CAMBIADA';
    routerNombre?: string;
}

interface FirewallLogsContextType {
    logs: FirewallLog[];
    agregarLog: (log: FirewallLog) => void;
    limpiarLogs: () => void;
    obtenerLogsPorRouter: (routerNombre: string) => FirewallLog[];
}

const FirewallLogsContext = createContext<FirewallLogsContextType | null>(null);

interface FirewallLogsProviderProps {
    children: ReactNode;
    ecsManager: ECSManager | null;
}

export const FirewallLogsProvider: React.FC<FirewallLogsProviderProps> = ({ children, ecsManager }) => {
    const [logs, setLogs] = useState<FirewallLog[]>([]);

    const agregarLog = useCallback((log: FirewallLog) => {
        setLogs(prev => [...prev, { ...log, timestamp: log.timestamp || Date.now() }]);
    }, []);

    const limpiarLogs = useCallback(() => {
        setLogs([]);
    }, []);

    const obtenerLogsPorRouter = useCallback((routerNombre: string) => {
        return logs.filter(log => log.routerNombre === routerNombre);
    }, [logs]);

    // Suscribirse a eventos del firewall
    useEffect(() => {
        if (!ecsManager) return;

        const unsubscribePermitido = ecsManager.on(EventosFirewall.TRAFICO_PERMITIDO, (data: unknown) => {
            const d = data as { origen: string; destino: string; mensaje: string; router?: string };
            agregarLog({
                timestamp: Date.now(),
                mensaje: d.mensaje,
                tipo: 'PERMITIDO',
                routerNombre: d.router
            });
        });

        const unsubscribeBloqueado = ecsManager.on(EventosFirewall.TRAFICO_BLOQUEADO, (data: unknown) => {
            const d = data as { origen: string; destino: string; mensaje: string; router?: string };
            agregarLog({
                timestamp: Date.now(),
                mensaje: d.mensaje,
                tipo: 'BLOQUEADO',
                routerNombre: d.router
            });
        });

        const unsubscribeHabilitado = ecsManager.on(EventosFirewall.HABILITADO, (data: unknown) => {
            const d = data as { router: string; mensaje: string };
            agregarLog({
                timestamp: Date.now(),
                mensaje: d.mensaje,
                tipo: 'HABILITADO',
                routerNombre: d.router
            });
        });

        const unsubscribeDeshabilitado = ecsManager.on(EventosFirewall.DESHABILITADO, (data: unknown) => {
            const d = data as { router: string; mensaje: string };
            agregarLog({
                timestamp: Date.now(),
                mensaje: d.mensaje,
                tipo: 'DESHABILITADO',
                routerNombre: d.router
            });
        });

        const unsubscribeReglaAgregada = ecsManager.on(EventosFirewall.REGLA_AGREGADA, (data: unknown) => {
            const d = data as { router: string; mensaje: string };
            agregarLog({
                timestamp: Date.now(),
                mensaje: d.mensaje,
                tipo: 'REGLA_AGREGADA',
                routerNombre: d.router
            });
        });

        const unsubscribePoliticaCambiada = ecsManager.on(EventosFirewall.POLITICA_CAMBIADA, (data: unknown) => {
            const d = data as { router: string; mensaje: string };
            agregarLog({
                timestamp: Date.now(),
                mensaje: d.mensaje,
                tipo: 'POLITICA_CAMBIADA',
                routerNombre: d.router
            });
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

    return (
        <FirewallLogsContext.Provider value={{ logs, agregarLog, limpiarLogs, obtenerLogsPorRouter }}>
            {children}
        </FirewallLogsContext.Provider>
    );
};

export const useFirewallLogs = () => {
    const context = useContext(FirewallLogsContext);
    if (!context) {
        throw new Error('useFirewallLogs debe usarse dentro de FirewallLogsProvider');
    }
    return context;
};
