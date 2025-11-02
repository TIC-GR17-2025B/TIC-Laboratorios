/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Dispositivo, Escenario } from '../../../types/EscenarioTypes';
import { EstadoAtaqueDispositivo, TipoDispositivo } from '../../../types/DeviceEnums';
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
    setDispositivoSeleccionado: (dispositivo: Dispositivo | null | unknown) => void;
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
export function EscenarioProvider({ children, initialEscenario = escenarioBase as unknown as Escenario }: EscenarioProviderProps) {
    const [escenario, setEscenario] = useState<Escenario>(initialEscenario);
    // Estado real
    const [dispositivoSeleccionado, setDispositivoSeleccionadoState] = useState<Dispositivo | null>(null);

    // Helper: normaliza distintos shapes que pueden venir al seleccionar una entidad 3D
    const mapEntityToDispositivo = (input: unknown): Dispositivo | null => {
        if (!input) return null;

        const raw = input as Record<string, unknown>;

        // Si ya tiene forma de Dispositivo
        if (typeof raw.id !== 'undefined' && typeof raw.tipo !== 'undefined') {
            return raw as unknown as Dispositivo;
        }

        // Forma que usa ECSSceneRenderer: { objetoConTipo, entidadId, entidadCompleta, position }
        if (raw.entidadCompleta) {
            try {
                const container = raw.entidadCompleta as unknown;

                type LocalContainer = { tiene?: (c: unknown) => boolean; get?: (c: unknown) => unknown };
                const cont = container as LocalContainer;

                // Extraer DispositivoComponent si existe
                let dispComp: unknown = null;
                if (typeof cont.tiene === 'function' && cont.tiene!(DispositivoComponent)) {
                    dispComp = cont.get!(DispositivoComponent);
                }

                // Extraer Transform para posicion
                let transform: unknown = null;
                if (typeof cont.tiene === 'function' && cont.tiene!(Transform)) {
                    transform = cont.get!(Transform);
                }

                if (!dispComp) {
                    // fallback: intentar leer objetoConTipo
                    if (raw.objetoConTipo) {
                        const oc = raw.objetoConTipo as Record<string, unknown>;
                        return {
                            id: (raw.entidadId as number) ?? 0,
                            tipo: oc.tipo as unknown as TipoDispositivo,
                            nombre: oc.nombre as string | undefined,
                            sistemaOperativo: oc.sistemaOperativo as string | undefined,
                            hardware: (oc.hardware as string) ?? "",
                            software: oc.software as string | undefined,
                            posicion: (raw.position as unknown) as { x: number; y: number; z: number } | undefined,
                            estadoAtaque: oc.estadoAtaque as unknown as EstadoAtaqueDispositivo,
                        } as Dispositivo;
                    }
                    return null;
                }

                const t = transform as Record<string, unknown> | undefined;
                const posicion = t
                    ? { x: t.x as number, y: t.y as number, z: t.z as number, rotacionY: t.rotacionY as number }
                    : (raw.position as unknown) as { x: number; y: number; z: number } | undefined;

                const dc = dispComp as Record<string, unknown>;
                const dispositivo: Dispositivo = {
                    id: (raw.entidadId as number) ?? 0,
                    entidadId: (raw.entidadId as number) ?? 0,
                    tipo: dc.tipo as unknown as TipoDispositivo,
                    nombre: dc.nombre as string | undefined,
                    sistemaOperativo: dc.sistemaOperativo as string | undefined,
                    hardware: (dc.hardware as string) ?? "",
                    software: dc.software as string | undefined,
                    posicion,
                    estadoAtaque: dc.estadoAtaque as unknown as EstadoAtaqueDispositivo,
                };

                // Añadir configuraciones desde WorkstationComponent si existe
                if (typeof cont.tiene === 'function' && cont.tiene!(WorkstationComponent)) {
                    try {
                        const ws = cont.get!(WorkstationComponent) as unknown;
                        const wsObj = ws as { configuraciones?: unknown };
                        if (wsObj && typeof wsObj.configuraciones !== 'undefined') {
                            dispositivo.configuraciones = wsObj.configuraciones;
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
        if (raw.objetoConTipo) {
            const oc = raw.objetoConTipo as Record<string, unknown>;
            return {
                id: (raw.entidadId as number) ?? 0,
                entidadId: (raw.entidadId as number) ?? 0,
                tipo: oc.tipo as unknown as TipoDispositivo,
                nombre: oc.nombre as string | undefined,
                sistemaOperativo: oc.sistemaOperativo as string | undefined,
                hardware: (oc.hardware as string) ?? "",
                software: oc.software as string | undefined,
                posicion: (raw.position as unknown) as { x: number; y: number; z: number } | undefined,
                estadoAtaque: oc.estadoAtaque as unknown as EstadoAtaqueDispositivo,
            } as Dispositivo;
        }

        return null;
    };

    // Setter expuesto: acepta un Dispositivo o una entidad/objeto y mapea a Dispositivo
    const setDispositivoSeleccionado = (dispositivo: Dispositivo | null | unknown) => {
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
