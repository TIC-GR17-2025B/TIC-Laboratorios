import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Dispositivo, Escenario } from '../../../types/EscenarioTypes';
import { escenarioBase } from '../../../data/escenarios/escenarioBase';
import {
    DispositivoComponent,
    WorkstationComponent,
    Transform,
} from '../../../ecs/components';

interface EscenarioContextType {
    escenario: Escenario;
    setEscenario: (escenario: Escenario) => void;
    dispositivoSeleccionado: Dispositivo | null;
    // Acepta un Dispositivo ya normalizado, null, o una entidad/objeto proveniente del ECS
    setDispositivoSeleccionado: (dispositivo: Dispositivo | null | any) => void;
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
    // Estado real
    const [dispositivoSeleccionado, setDispositivoSeleccionadoState] = useState<Dispositivo | null>(null);

    // Helper: normaliza distintos shapes que pueden venir al seleccionar una entidad 3D
    const mapEntityToDispositivo = (input: any): Dispositivo | null => {
        if (!input) return null;

        // Si ya tiene forma de Dispositivo
        if (typeof input.id !== 'undefined' && typeof input.tipo !== 'undefined') {
            return input as Dispositivo;
        }

        // Forma que usa ECSSceneRenderer: { objetoConTipo, entidadId, entidadCompleta, position }
        if (input.entidadCompleta) {
            try {
                const container = input.entidadCompleta;

                // Extraer DispositivoComponent si existe
                let dispComp: any = null;
                if (typeof container.tiene === 'function' && container.tiene(DispositivoComponent)) {
                    dispComp = container.get(DispositivoComponent);
                }

                // Extraer Transform para posicion
                let transform: any = null;
                if (typeof container.tiene === 'function' && container.tiene(Transform)) {
                    transform = container.get(Transform);
                }

                if (!dispComp) {
                    // fallback: intentar leer objetoConTipo
                    if (input.objetoConTipo) {
                        return {
                            id: input.entidadId ?? 0,
                            tipo: input.objetoConTipo.tipo,
                            nombre: input.objetoConTipo.nombre,
                            sistemaOperativo: input.objetoConTipo.sistemaOperativo,
                            hardware: input.objetoConTipo.hardware,
                            software: input.objetoConTipo.software,
                            posicion: input.position ?? undefined,
                            estadoAtaque: input.objetoConTipo.estadoAtaque,
                        } as Dispositivo;
                    }
                    return null;
                }

                const posicion = transform
                    ? { x: transform.x, y: transform.y, z: transform.z, rotacionY: transform.rotacionY }
                    : input.position ?? undefined;

                const dispositivo: Dispositivo = {
                    id: input.entidadId ?? 0,
                    entidadId: input.entidadId ?? 0,
                    tipo: dispComp.tipo,
                    nombre: dispComp.nombre,
                    sistemaOperativo: dispComp.sistemaOperativo,
                    hardware: dispComp.hardware,
                    software: dispComp.software,
                    posicion,
                    estadoAtaque: dispComp.estadoAtaque,
                };

                // Añadir configuraciones desde WorkstationComponent si existe
                if (typeof container.tiene === 'function' && container.tiene(WorkstationComponent)) {
                    try {
                        const ws = container.get(WorkstationComponent) as any;
                        if (ws && typeof ws.configuraciones !== 'undefined') {
                            dispositivo.configuraciones = ws.configuraciones;
                        }
                    } catch (e) {
                        console.warn('No se pudo leer WorkstationComponent:', e);
                    }
                }

                return dispositivo;
            } catch (e) {
                console.warn('Error mapeando entidad a dispositivo:', e);
                return null;
            }
        }

        // Forma alternativa: objeto con objetoConTipo y position
        if (input.objetoConTipo) {
            return {
                id: input.entidadId ?? 0,
                entidadId: input.entidadId ?? 0,
                tipo: input.objetoConTipo.tipo,
                nombre: input.objetoConTipo.nombre,
                sistemaOperativo: input.objetoConTipo.sistemaOperativo,
                hardware: input.objetoConTipo.hardware,
                software: input.objetoConTipo.software,
                posicion: input.position ?? undefined,
                estadoAtaque: input.objetoConTipo.estadoAtaque,
            } as Dispositivo;
        }

        return null;
    };

    // Setter expuesto: acepta un Dispositivo o una entidad/objeto y mapea a Dispositivo
    const setDispositivoSeleccionado = (dispositivo: Dispositivo | null | any) => {
        const mapped = mapEntityToDispositivo(dispositivo);
        setDispositivoSeleccionadoState(mapped);
    };

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
