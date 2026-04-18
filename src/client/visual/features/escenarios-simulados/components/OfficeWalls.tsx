import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useECSSceneContext } from '../context/ECSSceneContext';
import { Transform } from '../../../../ecs/components/Transform';
import { OficinaComponent } from '../../../../ecs/components/OficinaComponent';
import OfficeRoom, { type OfficeBounds, ROOM_PADDING } from './OfficeRoom';

// ─── Constantes de geometría ───
const WALL_HEIGHT = 2.5;
const WALL_THICKNESS = 0.1;
const BUILDING_FLOOR_Y = 0.005;
const HALLWAY_DEPTH = 1.5;
const HALLWAY_FLOOR_Y = 0.008;
const DOOR_WIDTH = 0.9;
const DOOR_HEIGHT = 2.2;
const PARTITION_SOLID_H = 1.0;
const BASEBOARD_H = 0.08;
const CORNICE_H = 0.04;
const TOLERANCE = 0.3;

// ─── Tipos ───
interface PaddedBounds {
    x1: number; x2: number;
    z1: number; z2: number;
}

interface WallSegment {
    position: [number, number, number];
    size: [number, number, number];
}

interface CorridorWallResult {
    solidWalls: WallSegment[];
    glassWalls: WallSegment[];
    doorFrames: WallSegment[];
}

// ═══════════════════════════════════════════════════════════
// ═══ HELPERS ═══
// ═══════════════════════════════════════════════════════════

/**
 * Genera la pared corredor-oficina con puertas y paneles de vidrio.
 * Corre a lo largo del eje X en z = officeFrontZ.
 * Cada oficina que toca el corredor recibe una puerta.
 *
 * Estructura vertical por sección:
 *   0 → PARTITION_SOLID_H : muro sólido
 *   PARTITION_SOLID_H → WALL_HEIGHT : panel de vidrio
 *   Apertura de puerta: 0 → DOOR_HEIGHT (corta sólido y vidrio)
 *   Travesaño vidrio sobre puerta: DOOR_HEIGHT → WALL_HEIGHT
 */
function generateCorridorWall(
    paddedOffices: PaddedBounds[],
    bldgX1: number,
    bldgX2: number,
    officeFrontZ: number,
): CorridorWallResult {
    const solidWalls: WallSegment[] = [];
    const glassWalls: WallSegment[] = [];
    const doorFrames: WallSegment[] = [];

    const frontOffices = paddedOffices
        .filter(o => Math.abs(o.z1 - officeFrontZ) < TOLERANCE)
        .sort((a, b) => a.x1 - b.x1);

    if (frontOffices.length === 0) {
        solidWalls.push({
            position: [(bldgX1 + bldgX2) / 2, WALL_HEIGHT / 2, officeFrontZ],
            size: [bldgX2 - bldgX1 + WALL_THICKNESS, WALL_HEIGHT, WALL_THICKNESS],
        });
        return { solidWalls, glassWalls, doorFrames };
    }

    const glassH = WALL_HEIGHT - PARTITION_SOLID_H;
    const fW = 0.04;
    const fD = WALL_THICKNESS + 0.03;

    const addSolidGlassSection = (start: number, end: number) => {
        const len = end - start;
        if (len < 0.02) return;
        const cx = (start + end) / 2;
        solidWalls.push({
            position: [cx, PARTITION_SOLID_H / 2, officeFrontZ],
            size: [len, PARTITION_SOLID_H, WALL_THICKNESS],
        });
        glassWalls.push({
            position: [cx, PARTITION_SOLID_H + glassH / 2, officeFrontZ],
            size: [len, glassH, WALL_THICKNESS - 0.02],
        });
    };

    let currentX = bldgX1;

    for (const office of frontOffices) {
        const officeCenterX = (office.x1 + office.x2) / 2;
        const doorL = officeCenterX - DOOR_WIDTH / 2;
        const doorR = officeCenterX + DOOR_WIDTH / 2;

        // Segmento entre oficinas (gap antes de esta oficina)
        if (office.x1 > currentX + 0.05) {
            addSolidGlassSection(currentX, office.x1);
        }

        // Segmento izquierdo de esta oficina
        addSolidGlassSection(office.x1, doorL);

        // Segmento derecho de esta oficina
        addSolidGlassSection(doorR, office.x2);

        // Travesaño de vidrio sobre la puerta
        const transomH = WALL_HEIGHT - DOOR_HEIGHT;
        if (transomH > 0.02) {
            glassWalls.push({
                position: [officeCenterX, DOOR_HEIGHT + transomH / 2, officeFrontZ],
                size: [DOOR_WIDTH, transomH, WALL_THICKNESS - 0.02],
            });
        }

        // Marco de puerta
        doorFrames.push(
            { position: [doorL, DOOR_HEIGHT / 2, officeFrontZ], size: [fW, DOOR_HEIGHT, fD] },
            { position: [doorR, DOOR_HEIGHT / 2, officeFrontZ], size: [fW, DOOR_HEIGHT, fD] },
            { position: [officeCenterX, DOOR_HEIGHT, officeFrontZ], size: [DOOR_WIDTH + fW * 2, fW, fD] },
        );

        currentX = office.x2;
    }

    // Segmento final (después de la última oficina)
    if (bldgX2 > currentX + 0.05) {
        addSolidGlassSection(currentX, bldgX2);
    }

    return { solidWalls, glassWalls, doorFrames };
}

/**
 * Calcula paredes internas (particiones entre oficinas).
 * Detecta bordes de cada oficina que NO están en el perímetro del edificio
 * y los renderiza como paredes divisorias, deduplicando segmentos compartidos.
 */
function computeInternalWalls(
    offices: PaddedBounds[],
    bldg: { x1: number; x2: number; z1: number; z2: number },
): WallSegment[] {
    const isPerimeter = (val: number, bMin: number, bMax: number) =>
        Math.abs(val - bMin) < TOLERANCE || Math.abs(val - bMax) < TOLERANCE;

    const verticals = new Map<string, { min: number; max: number }>();
    const horizontals = new Map<string, { min: number; max: number }>();

    for (const o of offices) {
        if (!isPerimeter(o.x1, bldg.x1, bldg.x2)) {
            const key = o.x1.toFixed(1);
            const ex = verticals.get(key);
            if (ex) { ex.min = Math.min(ex.min, o.z1); ex.max = Math.max(ex.max, o.z2); }
            else verticals.set(key, { min: o.z1, max: o.z2 });
        }
        if (!isPerimeter(o.x2, bldg.x1, bldg.x2)) {
            const key = o.x2.toFixed(1);
            const ex = verticals.get(key);
            if (ex) { ex.min = Math.min(ex.min, o.z1); ex.max = Math.max(ex.max, o.z2); }
            else verticals.set(key, { min: o.z1, max: o.z2 });
        }
        if (!isPerimeter(o.z1, bldg.z1, bldg.z2)) {
            const key = o.z1.toFixed(1);
            const ex = horizontals.get(key);
            if (ex) { ex.min = Math.min(ex.min, o.x1); ex.max = Math.max(ex.max, o.x2); }
            else horizontals.set(key, { min: o.x1, max: o.x2 });
        }
        if (!isPerimeter(o.z2, bldg.z1, bldg.z2)) {
            const key = o.z2.toFixed(1);
            const ex = horizontals.get(key);
            if (ex) { ex.min = Math.min(ex.min, o.x1); ex.max = Math.max(ex.max, o.x2); }
            else horizontals.set(key, { min: o.x1, max: o.x2 });
        }
    }

    const walls: WallSegment[] = [];

    for (const [xStr, span] of verticals) {
        const x = parseFloat(xStr);
        const len = span.max - span.min;
        walls.push({
            position: [x, WALL_HEIGHT / 2, (span.min + span.max) / 2],
            size: [WALL_THICKNESS, WALL_HEIGHT, len],
        });
    }

    for (const [zStr, span] of horizontals) {
        const z = parseFloat(zStr);
        const len = span.max - span.min;
        walls.push({
            position: [(span.min + span.max) / 2, WALL_HEIGHT / 2, z],
            size: [len, WALL_HEIGHT, WALL_THICKNESS],
        });
    }

    return walls;
}

// ═══════════════════════════════════════════════════════════
// ═══ COMPONENTE PRINCIPAL ═══
// ═══════════════════════════════════════════════════════════

const OfficeWalls: React.FC = () => {
    const { builder, ecsManager, zonaActual } = useECSSceneContext();

    // ── 1. Bounds crudos por oficina ──
    const officeBounds = useMemo((): OfficeBounds[] => {
        if (zonaActual === null || !builder) return [];

        const entidadZona = builder.obtenerEntidadZonaPorId(zonaActual);
        if (entidadZona === undefined) return [];

        const jerarquia = builder.getSistemaJerarquia();
        const oficinas = jerarquia.obtenerOficinasDeZona(entidadZona);
        const results: OfficeBounds[] = [];

        for (const oficinaId of oficinas) {
            const oficinaContainer = ecsManager.getComponentes(oficinaId);
            const oficinaComp = oficinaContainer?.get(OficinaComponent);
            const espacios = jerarquia.obtenerEspaciosDeOficina(oficinaId);
            if (espacios.length === 0) continue;

            const positions: { x: number; z: number }[] = [];
            for (const espacioId of espacios) {
                const container = ecsManager.getComponentes(espacioId);
                const transform = container?.get(Transform);
                if (transform) positions.push({ x: transform.x, z: transform.z });
            }
            if (positions.length === 0) continue;

            results.push({
                oficinaId,
                nombre: oficinaComp?.nombre ?? `Oficina ${oficinaId}`,
                minX: Math.min(...positions.map(p => p.x)),
                maxX: Math.max(...positions.map(p => p.x)),
                minZ: Math.min(...positions.map(p => p.z)),
                maxZ: Math.max(...positions.map(p => p.z)),
            });
        }

        return results;
    }, [builder, ecsManager, zonaActual]);

    // ── 2. Bounds con padding ──
    const paddedOffices = useMemo((): PaddedBounds[] =>
        officeBounds.map(b => ({
            x1: b.minX - ROOM_PADDING,
            x2: b.maxX + ROOM_PADDING,
            z1: b.minZ - ROOM_PADDING,
            z2: b.maxZ + ROOM_PADDING,
        })),
        [officeBounds]
    );

    // ── 3. Z frontal de oficinas (sin pasillo) ──
    const officeFrontZ = useMemo(() => {
        if (paddedOffices.length === 0) return 0;
        return Math.min(...paddedOffices.map(o => o.z1));
    }, [paddedOffices]);

    // ── 4. Bounds del edificio (CON pasillo) ──
    const bldg = useMemo(() => {
        if (paddedOffices.length === 0) return null;
        return {
            x1: Math.min(...paddedOffices.map(o => o.x1)),
            x2: Math.max(...paddedOffices.map(o => o.x2)),
            z1: officeFrontZ - HALLWAY_DEPTH,
            z2: Math.max(...paddedOffices.map(o => o.z2)),
        };
    }, [paddedOffices, officeFrontZ]);

    // ── 5. Bounds SIN pasillo (para internal walls) ──
    const officeBldg = useMemo(() => {
        if (paddedOffices.length === 0) return null;
        return {
            x1: Math.min(...paddedOffices.map(o => o.x1)),
            x2: Math.max(...paddedOffices.map(o => o.x2)),
            z1: officeFrontZ,
            z2: Math.max(...paddedOffices.map(o => o.z2)),
        };
    }, [paddedOffices, officeFrontZ]);

    // ── 6. Pared corredor-oficina (vidrio + puertas) ──
    const corridorWall = useMemo((): CorridorWallResult | null => {
        if (!bldg || paddedOffices.length === 0) return null;
        return generateCorridorWall(paddedOffices, bldg.x1, bldg.x2, officeFrontZ);
    }, [paddedOffices, bldg, officeFrontZ]);

    // ── 7. Paredes internas (sólidas, sin puertas — cada oficina abre al corredor) ──
    const internalWalls = useMemo((): WallSegment[] => {
        if (!officeBldg || paddedOffices.length <= 1) return [];
        return computeInternalWalls(paddedOffices, officeBldg);
    }, [paddedOffices, officeBldg]);

    // ═══ MATERIALES ═══
    const wallMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#eae6e1', roughness: 0.92, metalness: 0.0,
    }), []);

    const buildingFloorMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#c4beb5', roughness: 0.9, metalness: 0.0,
    }), []);

    const corridorFloorMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#d5d0cb', roughness: 0.4, metalness: 0.02,
    }), []);

    const doorFrameMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#5a5550', roughness: 0.3, metalness: 0.15,
    }), []);

    const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#d8e8f0',
        transparent: true,
        opacity: 0.18,
        roughness: 0.05,
        metalness: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false,
    }), []);

    const partitionMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#e4e0db', roughness: 0.9, metalness: 0.0,
    }), []);

    const baseboardMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#b8b0a6', roughness: 0.7, metalness: 0.05,
    }), []);

    const corniceMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#d0c9c0', roughness: 0.6, metalness: 0.05,
    }), []);

    if (!bldg) return null;

    const w = bldg.x2 - bldg.x1;
    const d = bldg.z2 - bldg.z1;
    const cx = (bldg.x1 + bldg.x2) / 2;
    const cz = (bldg.z1 + bldg.z2) / 2;
    const hh = WALL_HEIGHT / 2;

    // Dimensiones del pasillo
    const hallwayCX = cx;
    const hallwayCZ = (bldg.z1 + officeFrontZ) / 2;
    const hallwayD = officeFrontZ - bldg.z1;

    return (
        <group name="building">
            {/* ═══ PISO DEL EDIFICIO ═══ */}
            <mesh
                position={[cx, BUILDING_FLOOR_Y, cz]}
                rotation={[-Math.PI / 2, 0, 0]}
                receiveShadow
                material={buildingFloorMat}
            >
                <planeGeometry args={[w, d]} />
            </mesh>

            {/* ═══ PISO DEL PASILLO (material pulido diferente) ═══ */}
            <mesh
                position={[hallwayCX, HALLWAY_FLOOR_Y, hallwayCZ]}
                rotation={[-Math.PI / 2, 0, 0]}
                receiveShadow
                material={corridorFloorMat}
            >
                <planeGeometry args={[w - 0.02, hallwayD - 0.02]} />
            </mesh>

            {/* ═══ PAREDES EXTERIORES ═══ */}

            {/* Pared trasera (z2) — altura completa */}
            <mesh position={[cx, hh, bldg.z2]} material={wallMat} castShadow receiveShadow>
                <boxGeometry args={[w + WALL_THICKNESS, WALL_HEIGHT, WALL_THICKNESS]} />
            </mesh>

            {/* Pared izquierda (x1) — altura completa, incluye pasillo */}
            <mesh position={[bldg.x1, hh, cz]} material={wallMat} castShadow receiveShadow>
                <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, d + WALL_THICKNESS]} />
            </mesh>

            {/* Pared derecha (x2) — altura completa, incluye pasillo */}
            <mesh position={[bldg.x2, hh, cz]} material={wallMat} castShadow receiveShadow>
                <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, d + WALL_THICKNESS]} />
            </mesh>

            {/* SIN pared frontal — pasillo abierto para visibilidad de cámara */}

            {/* ═══ CORNISA SUPERIOR ═══ */}
            {/* Trasera */}
            <mesh position={[cx, WALL_HEIGHT, bldg.z2]} material={corniceMat}>
                <boxGeometry args={[w + WALL_THICKNESS * 3, CORNICE_H, WALL_THICKNESS + 0.06]} />
            </mesh>
            {/* Izquierda */}
            <mesh position={[bldg.x1, WALL_HEIGHT, cz]} material={corniceMat}>
                <boxGeometry args={[WALL_THICKNESS + 0.06, CORNICE_H, d + WALL_THICKNESS * 3]} />
            </mesh>
            {/* Derecha */}
            <mesh position={[bldg.x2, WALL_HEIGHT, cz]} material={corniceMat}>
                <boxGeometry args={[WALL_THICKNESS + 0.06, CORNICE_H, d + WALL_THICKNESS * 3]} />
            </mesh>

            {/* ═══ RODAPIÉ INTERIOR ═══ */}
            {/* Trasero */}
            <mesh position={[cx, BASEBOARD_H / 2, bldg.z2 - WALL_THICKNESS / 2 - 0.005]} material={baseboardMat}>
                <boxGeometry args={[w, BASEBOARD_H, 0.03]} />
            </mesh>
            {/* Izquierdo */}
            <mesh position={[bldg.x1 + WALL_THICKNESS / 2 + 0.005, BASEBOARD_H / 2, cz]} material={baseboardMat}>
                <boxGeometry args={[0.03, BASEBOARD_H, d]} />
            </mesh>
            {/* Derecho */}
            <mesh position={[bldg.x2 - WALL_THICKNESS / 2 - 0.005, BASEBOARD_H / 2, cz]} material={baseboardMat}>
                <boxGeometry args={[0.03, BASEBOARD_H, d]} />
            </mesh>

            {/* ═══ PARED CORREDOR-OFICINA (SÓLIDO + VIDRIO + PUERTAS) ═══ */}
            {corridorWall?.solidWalls.map((seg, i) => (
                <mesh key={`cw-s-${i}`} position={seg.position} material={wallMat} castShadow receiveShadow>
                    <boxGeometry args={seg.size} />
                </mesh>
            ))}
            {corridorWall?.glassWalls.map((seg, i) => (
                <mesh key={`cw-g-${i}`} position={seg.position} material={glassMat} renderOrder={1}>
                    <boxGeometry args={seg.size} />
                </mesh>
            ))}
            {corridorWall?.doorFrames.map((seg, i) => (
                <mesh key={`cw-f-${i}`} position={seg.position} material={doorFrameMat}>
                    <boxGeometry args={seg.size} />
                </mesh>
            ))}

            {/* ═══ PAREDES INTERNAS (SÓLIDAS) ═══ */}
            {internalWalls.map((seg, i) => (
                <mesh key={`iw-${i}`} position={seg.position} material={partitionMat} castShadow receiveShadow>
                    <boxGeometry args={seg.size} />
                </mesh>
            ))}

            {/* ═══ PISOS Y ETIQUETAS POR OFICINA ═══ */}
            {officeBounds.map((bounds, i) => (
                <OfficeRoom key={`office-${bounds.oficinaId}`} bounds={bounds} index={i} />
            ))}
        </group>
    );
};

export default OfficeWalls;
