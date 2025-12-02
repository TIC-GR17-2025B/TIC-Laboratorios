import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Escenario } from '../../../types/EscenarioTypes';

interface SelectedLevelContextType {
    selectedEscenario: Escenario | null;
    setSelectedEscenario: (escenario: Escenario) => void;
}

const SelectedLevelContext = createContext<SelectedLevelContextType | undefined>(undefined);

interface SelectedLevelProviderProps {
    children: ReactNode;
}

/**
 * Provider global que mantiene el escenario seleccionado
 * Se monta en el nivel más alto de la app, antes del routing
 */
export function SelectedLevelProvider({ children }: SelectedLevelProviderProps) {
    const [selectedEscenario, setSelectedEscenario] = useState<Escenario | null>(null);

    return (
        <SelectedLevelContext.Provider value={{ selectedEscenario, setSelectedEscenario }}>
            {children}
        </SelectedLevelContext.Provider>
    );
}

/**
 * Hook para acceder al escenario seleccionado
 * Puede usarse en cualquier parte de la app
 */
export function useSelectedLevel(): SelectedLevelContextType {
    const context = useContext(SelectedLevelContext);

    if (context === undefined) {
        throw new Error('useSelectedLevel debe ser usado dentro de un SelectedLevelProvider');
    }

    return context;
}
