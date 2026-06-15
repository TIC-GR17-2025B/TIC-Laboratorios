import { useMemo } from 'react';
import { useECSSceneContext } from '../context/ECSSceneContext';
import { Transform } from '../../../../ecs/components/Transform';
import { OficinaComponent } from '../../../../ecs/components/OficinaComponent';
import { DispositivoComponent } from '../../../../ecs/components/DispositivoComponent';

// ─── Constantes de geometría del edificio ───
// Compartidas por paredes, decorado, shells de contexto e iluminación.
export const WALL_HEIGHT = 3.0;
export const WALL_THICKNESS = 0.16;
export const CEILING_Y = WALL_HEIGHT;
export const HALLWAY_DEPTH = 2.2;
export const DOOR_WIDTH = 1.0;
export const DOOR_HEIGHT = 2.25;
export const PARTITION_SOLID_H = 1.0;
export const ROOM_PADDING = 1.2;

// Tolerancia para detectar bordes coincidentes (perímetro / frente de oficina).
const TOLERANCE = 0.35;

/**
 * Tema/ambiente inferido de cada sala. No vive en el dato del escenario: se
 * deduce del nombre de la oficina/zona y de los dispositivos presentes, de modo
 * que el decorado y la paleta cuenten la narrativa sin tocar el schema.
 */
export type RoomTheme =
    | 'office'
    | 'datacenter'
    | 'classroom'
    | 'home'
    | 'hacker'
    | 'legal';

export interface OfficeBounds {
    oficinaId: number;
    nombre: string;
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
}

export interface PaddedBounds {
    x1: number; x2: number;
    z1: number; z2: number;
}

export interface RoomInfo {
    oficinaId: number;
    nombre: string;
    bounds: OfficeBounds;
    padded: PaddedBounds;
    centerX: number;
    centerZ: number;
    width: number;
    depth: number;
    tipo: RoomTheme;
    deviceTypes: string[];
}

export interface WallSegment {
    position: [number, number, number];
    size: [number, number, number];
}

export interface DoorLeaf {
    hinge: [number, number, number];
    width: number;
    height: number;
    openRad: number;
}

export interface CorridorWallResult {
    solidWalls: WallSegment[];
    glassWalls: WallSegment[];
    glassMullions: WallSegment[];
    doorFrames: WallSegment[];
    doorLeaves: DoorLeaf[];
}

export interface BuildingBounds {
    x1: number; x2: number;
    z1: number; z2: number;
}

export interface BuildingLayout {
    rooms: RoomInfo[];
    bldg: BuildingBounds | null;
    officeBldg: BuildingBounds | null;
    officeFrontZ: number;
    corridorWall: CorridorWallResult | null;
    internalWalls: WallSegment[];
    theme: RoomTheme;
}

// ═══════════════════════════════════════════════════════════
// ═══ INFERENCIA DE TEMA ═══
// ═══════════════════════════════════════════════════════════

function inferRoomTheme(
    nombre: string,
    zonaNombre: string,
    deviceTypes: string[],
): RoomTheme {
    const texto = `${nombre} ${zonaNombre}`.toLowerCase();

    if (/lisa|atacant|hacker|estudio/.test(texto)) return 'hacker';
    if (/bufete|legal|abogad|mendoza/.test(texto)) return 'legal';
    if (/aula|clase|classroom|computaci/.test(texto)) return 'classroom';
    if (/datacenter|servidor|server|sala de servidores|www|nube/.test(texto)) return 'datacenter';
    if (/casa|home|hogar|remot/.test(texto)) return 'home';

    // Inferencia por composición de dispositivos: solo equipo de red → datacenter.
    const deRed = deviceTypes.filter(t => t === 'router' || t === 'vpn' || t === 'switch').length;
    const workstations = deviceTypes.filter(t => t === 'workstation').length;
    if (deRed >= 2 && workstations === 0) return 'datacenter';

    return 'office';
}

/** Tema dominante de la zona (para cielo, suelo y shells de contexto). */
function dominantTheme(rooms: RoomInfo[]): RoomTheme {
    if (rooms.length === 0) return 'office';
    const priority: RoomTheme[] = ['hacker', 'datacenter', 'legal', 'classroom', 'home', 'office'];
    for (const tema of priority) {
        if (rooms.some(r => r.tipo === tema)) return tema;
    }
    return rooms[0].tipo;
}

// ═══════════════════════════════════════════════════════════
// ═══ HELPERS DE GEOMETRÍA ═══
// ═══════════════════════════════════════════════════════════

/**
 * Genera la pared corredor-oficina con puertas, hojas de puerta y paneles de
 * vidrio enmarcados. Corre a lo largo del eje X en z = officeFrontZ.
 */
function generateCorridorWall(
    paddedOffices: PaddedBounds[],
    bldgX1: number,
    bldgX2: number,
    officeFrontZ: number,
): CorridorWallResult {
    const solidWalls: WallSegment[] = [];
    const glassWalls: WallSegment[] = [];
    const glassMullions: WallSegment[] = [];
    const doorFrames: WallSegment[] = [];
    const doorLeaves: DoorLeaf[] = [];

    const frontOffices = paddedOffices
        .filter(o => Math.abs(o.z1 - officeFrontZ) < TOLERANCE)
        .sort((a, b) => a.x1 - b.x1);

    const glassH = WALL_HEIGHT - PARTITION_SOLID_H;
    const fW = 0.05;
    const fD = WALL_THICKNESS + 0.04;
    const mullionT = 0.04;

    if (frontOffices.length === 0) {
        solidWalls.push({
            position: [(bldgX1 + bldgX2) / 2, WALL_HEIGHT / 2, officeFrontZ],
            size: [bldgX2 - bldgX1 + WALL_THICKNESS, WALL_HEIGHT, WALL_THICKNESS],
        });
        return { solidWalls, glassWalls, glassMullions, doorFrames, doorLeaves };
    }

    const addSolidGlassSection = (start: number, end: number) => {
        const len = end - start;
        if (len < 0.02) return;
        const cx = (start + end) / 2;
        // Antepecho sólido bajo.
        solidWalls.push({
            position: [cx, PARTITION_SOLID_H / 2, officeFrontZ],
            size: [len, PARTITION_SOLID_H, WALL_THICKNESS],
        });
        // Panel de vidrio.
        glassWalls.push({
            position: [cx, PARTITION_SOLID_H + glassH / 2, officeFrontZ],
            size: [len, glassH, 0.02],
        });
        // Travesaño horizontal sobre el antepecho (separa sólido/vidrio).
        glassMullions.push({
            position: [cx, PARTITION_SOLID_H, officeFrontZ],
            size: [len, mullionT, fD],
        });
        // Montante vertical en cada extremo del panel.
        glassMullions.push(
            { position: [start, PARTITION_SOLID_H + glassH / 2, officeFrontZ], size: [mullionT, glassH, fD] },
            { position: [end, PARTITION_SOLID_H + glassH / 2, officeFrontZ], size: [mullionT, glassH, fD] },
        );
    };

    let currentX = bldgX1;

    for (const office of frontOffices) {
        const officeCenterX = (office.x1 + office.x2) / 2;
        const doorL = officeCenterX - DOOR_WIDTH / 2;
        const doorR = officeCenterX + DOOR_WIDTH / 2;

        if (office.x1 > currentX + 0.05) addSolidGlassSection(currentX, office.x1);
        addSolidGlassSection(office.x1, doorL);
        addSolidGlassSection(doorR, office.x2);

        // Travesaño de vidrio sobre la puerta.
        const transomH = WALL_HEIGHT - DOOR_HEIGHT;
        if (transomH > 0.02) {
            glassWalls.push({
                position: [officeCenterX, DOOR_HEIGHT + transomH / 2, officeFrontZ],
                size: [DOOR_WIDTH, transomH, 0.02],
            });
        }

        // Marco de puerta (jambas + dintel).
        doorFrames.push(
            { position: [doorL, DOOR_HEIGHT / 2, officeFrontZ], size: [fW, DOOR_HEIGHT, fD] },
            { position: [doorR, DOOR_HEIGHT / 2, officeFrontZ], size: [fW, DOOR_HEIGHT, fD] },
            { position: [officeCenterX, DOOR_HEIGHT, officeFrontZ], size: [DOOR_WIDTH + fW * 2, fW, fD] },
        );

        // Hoja de puerta entreabierta hacia el interior (bisagra en jamba izquierda).
        doorLeaves.push({
            hinge: [doorL + fW / 2, 0, officeFrontZ],
            width: DOOR_WIDTH,
            height: DOOR_HEIGHT - 0.04,
            openRad: 0.62,
        });

        currentX = office.x2;
    }

    if (bldgX2 > currentX + 0.05) addSolidGlassSection(currentX, bldgX2);

    return { solidWalls, glassWalls, glassMullions, doorFrames, doorLeaves };
}

/**
 * Paredes internas (particiones entre oficinas). Detecta bordes de cada oficina
 * que NO están en el perímetro y los renderiza deduplicando segmentos compartidos.
 */
function computeInternalWalls(
    offices: PaddedBounds[],
    bldg: BuildingBounds,
): WallSegment[] {
    const isPerimeter = (val: number, bMin: number, bMax: number) =>
        Math.abs(val - bMin) < TOLERANCE || Math.abs(val - bMax) < TOLERANCE;

    const verticals = new Map<string, { min: number; max: number }>();
    const horizontals = new Map<string, { min: number; max: number }>();

    const addSpan = (
        map: Map<string, { min: number; max: number }>,
        key: string, a: number, b: number,
    ) => {
        const ex = map.get(key);
        if (ex) { ex.min = Math.min(ex.min, a); ex.max = Math.max(ex.max, b); }
        else map.set(key, { min: a, max: b });
    };

    for (const o of offices) {
        if (!isPerimeter(o.x1, bldg.x1, bldg.x2)) addSpan(verticals, o.x1.toFixed(2), o.z1, o.z2);
        if (!isPerimeter(o.x2, bldg.x1, bldg.x2)) addSpan(verticals, o.x2.toFixed(2), o.z1, o.z2);
        if (!isPerimeter(o.z1, bldg.z1, bldg.z2)) addSpan(horizontals, o.z1.toFixed(2), o.x1, o.x2);
        if (!isPerimeter(o.z2, bldg.z1, bldg.z2)) addSpan(horizontals, o.z2.toFixed(2), o.x1, o.x2);
    }

    const walls: WallSegment[] = [];
    for (const [xStr, span] of verticals) {
        const x = parseFloat(xStr);
        walls.push({
            position: [x, WALL_HEIGHT / 2, (span.min + span.max) / 2],
            size: [WALL_THICKNESS, WALL_HEIGHT, span.max - span.min],
        });
    }
    for (const [zStr, span] of horizontals) {
        const z = parseFloat(zStr);
        walls.push({
            position: [(span.min + span.max) / 2, WALL_HEIGHT / 2, z],
            size: [span.max - span.min, WALL_HEIGHT, WALL_THICKNESS],
        });
    }
    return walls;
}

// ═══════════════════════════════════════════════════════════
// ═══ HOOK ═══
// ═══════════════════════════════════════════════════════════

/**
 * Centraliza toda la geometría derivada del edificio (bounds por oficina, envolvente,
 * pared de corredor, particiones) más el tema inferido de cada sala. Es la fuente
 * única para OfficeWalls, SceneDressing y la iluminación, de modo que paredes,
 * decorado y luces queden siempre alineados.
 */
export function useBuildingLayout(): BuildingLayout {
    const { builder, ecsManager, zonaActual } = useECSSceneContext();

    const rooms = useMemo((): RoomInfo[] => {
        if (zonaActual === null || !builder) return [];

        const entidadZona = builder.obtenerEntidadZonaPorId(zonaActual);
        if (entidadZona === undefined) return [];

        const zonaNombre = builder.obtenerZonas?.()
            ?.find((z: { id: number; nombre: string }) => z.id === zonaActual)?.nombre ?? '';

        const jerarquia = builder.getSistemaJerarquia();
        const oficinas = jerarquia.obtenerOficinasDeZona(entidadZona);
        const results: RoomInfo[] = [];

        for (const oficinaId of oficinas) {
            const oficinaContainer = ecsManager.getComponentes(oficinaId);
            const oficinaComp = oficinaContainer?.get(OficinaComponent);
            const espacios = jerarquia.obtenerEspaciosDeOficina(oficinaId);
            if (espacios.length === 0) continue;

            const positions: { x: number; z: number }[] = [];
            const deviceTypes: string[] = [];

            for (const espacioId of espacios) {
                const container = ecsManager.getComponentes(espacioId);
                const transform = container?.get(Transform);
                if (transform) positions.push({ x: transform.x, z: transform.z });

                for (const dispId of jerarquia.obtenerDispositivosDeEspacio(espacioId)) {
                    const dispTipo = ecsManager.getComponentes(dispId)?.get(DispositivoComponent)?.tipo;
                    if (dispTipo) deviceTypes.push(String(dispTipo));
                }
            }
            if (positions.length === 0) continue;

            const nombre = oficinaComp?.nombre ?? `Oficina ${oficinaId}`;
            const bounds: OfficeBounds = {
                oficinaId,
                nombre,
                minX: Math.min(...positions.map(p => p.x)),
                maxX: Math.max(...positions.map(p => p.x)),
                minZ: Math.min(...positions.map(p => p.z)),
                maxZ: Math.max(...positions.map(p => p.z)),
            };
            const padded: PaddedBounds = {
                x1: bounds.minX - ROOM_PADDING,
                x2: bounds.maxX + ROOM_PADDING,
                z1: bounds.minZ - ROOM_PADDING,
                z2: bounds.maxZ + ROOM_PADDING,
            };

            results.push({
                oficinaId,
                nombre,
                bounds,
                padded,
                centerX: (padded.x1 + padded.x2) / 2,
                centerZ: (padded.z1 + padded.z2) / 2,
                width: padded.x2 - padded.x1,
                depth: padded.z2 - padded.z1,
                tipo: inferRoomTheme(nombre, zonaNombre, deviceTypes),
                deviceTypes,
            });
        }

        return results;
    }, [builder, ecsManager, zonaActual]);

    return useMemo((): BuildingLayout => {
        if (rooms.length === 0) {
            return {
                rooms, bldg: null, officeBldg: null, officeFrontZ: 0,
                corridorWall: null, internalWalls: [], theme: 'office',
            };
        }

        const padded = rooms.map(r => r.padded);
        const officeFrontZ = Math.min(...padded.map(o => o.z1));

        const x1 = Math.min(...padded.map(o => o.x1));
        const x2 = Math.max(...padded.map(o => o.x2));
        const z2 = Math.max(...padded.map(o => o.z2));

        const bldg: BuildingBounds = { x1, x2, z1: officeFrontZ - HALLWAY_DEPTH, z2 };
        const officeBldg: BuildingBounds = { x1, x2, z1: officeFrontZ, z2 };

        const corridorWall = generateCorridorWall(padded, x1, x2, officeFrontZ);
        const internalWalls = rooms.length > 1 ? computeInternalWalls(padded, officeBldg) : [];

        return {
            rooms,
            bldg,
            officeBldg,
            officeFrontZ,
            corridorWall,
            internalWalls,
            theme: dominantTheme(rooms),
        };
    }, [rooms]);
}
