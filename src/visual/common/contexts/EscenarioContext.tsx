import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Dispositivo, Escenario } from '../../../types/EscenarioTypes';
import { escenarioBase } from '../../../data/escenarios/escenarioBase';

interface EscenarioContextType {
    escenario: Escenario;
    setEscenario: (escenario: Escenario) => void;
    dispositivoSeleccionado: Dispositivo | null;
    setDispositivoSeleccionado: (dispositivo: Dispositivo | null) => void;
}

/**
 * Context para gestionar globalmente al escenario actual en toda la aplicación
*/
const EscenarioContext = createContext<EscenarioContextType | undefined>(undefined);

interface EscenarioProviderProps {
    children: ReactNode;
    initialEscenario?: Escenario;
}

/**
 * Envuelve la aplicación y proporciona el estado del escenario
 */
export function EscenarioProvider({ children, initialEscenario = escenarioBase }: EscenarioProviderProps) {
    const [escenario, setEscenario] = useState<Escenario>(initialEscenario);
    const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState<Dispositivo | null>(null);
    return (
        <EscenarioContext.Provider value={{ escenario, setEscenario, dispositivoSeleccionado, setDispositivoSeleccionado }}>
            {children}
        </EscenarioContext.Provider>
    );
}

/**
 * Hook personalizado para usar el contexto de escenario
 * Lanza error si se usa fuera del Provider
 * 
 * @returns El contexto del escenario con el escenario actual y función para actualizarlo
 * @throws Error si se usa fuera del EscenarioProvider
 * 
 * @example
 * const { escenario, setEscenario } = useEscenario();
 */

export function useEscenario(): EscenarioContextType {
    const context = useContext(EscenarioContext);

    if (context === undefined) {
        throw new Error('useEscenario debe ser usado dentro de un EscenarioProvider');
    }

    return context;
}

/**
 * Hook para obtener solo el escenario actual (sin función de actualización)
 * 
 * @returns El escenario actual
 * 
 * @example
 * const escenario = useEscenarioActual();
 */

export function useEscenarioActual(): Escenario {
    const { escenario } = useEscenario();
    return escenario;
}
