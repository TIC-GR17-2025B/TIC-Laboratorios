import { createContext, type ReactNode, useContext, useState, useCallback } from 'react';

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

export const FirewallLogsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
