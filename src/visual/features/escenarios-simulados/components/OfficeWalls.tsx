import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useECSSceneContext } from '../context/ECSSceneContext';
import { Transform } from '../../../../ecs/components/Transform';
import { OficinaComponent } from '../../../../ecs/components/OficinaComponent';
import OfficeRoom, { type OfficeBounds, ROOM_PADDING } from './OfficeRoom';

const WALL_HEIGHT = 2.5;
const WALL_THICKNESS = 0.1;
const FRONT_WALL_HEIGHT = 0.8;
const BUILDING_FLOOR_Y = 0.005;
const BASEBOARD_H = 0.1;
const CORNICE_H = 0.05;
const TOLERANCE = 0.3;

interface PaddedBounds {
    x1: number; x2: number;
    z1: number; z2: number;
}

interface WallSegment {
    position: [number, number, number];
    size: [number, number, number];
}

/**
 * Calcula los segmentos de pared internos (particiones entre oficinas).
 * Detecta qué bordes de cada oficina NO están en el perímetro del edificio
 * y los renderiza como paredes divisorias, deduplicando segmentos compartidos.
 */
function computeInternalWalls(
    offices: PaddedBounds[],
    bldg: { x1: number; x2: number; z1: number; z2: number },
): WallSegment[] {
    const isPerimeter = (val: number, bMin: number, bMax: number) =>
        Math.abs(val - bMin) < TOLERANCE || Math.abs(val - bMax) < TOLERANCE;

    // Agrupar segmentos de pared por línea (deduplicar y extender)
    const verticals = new Map<string, { min: number; max: number }>();
    const horizontals = new Map<string, { min: number; max: number }>();

    for (const o of offices) {
        // Borde izquierdo
        if (!isPerimeter(o.x1, bldg.x1, bldg.x2)) {
            const key = o.x1.toFixed(1);
            const ex = verticals.get(key);
            if (ex) { ex.min = Math.min(ex.min, o.z1); ex.max = Math.max(ex.max, o.z2); }
            else verticals.set(key, { min: o.z1, max: o.z2 });
        }
        // Borde derecho
        if (!isPerimeter(o.x2, bldg.x1, bldg.x2)) {
            const key = o.x2.toFixed(1);
            const ex = verticals.get(key);
            if (ex) { ex.min = Math.min(ex.min, o.z1); ex.max = Math.max(ex.max, o.z2); }
            else verticals.set(key, { min: o.z1, max: o.z2 });
        }
        // Borde frontal
        if (!isPerimeter(o.z1, bldg.z1, bldg.z2)) {
            const key = o.z1.toFixed(1);
            const ex = horizontals.get(key);
            if (ex) { ex.min = Math.min(ex.min, o.x1); ex.max = Math.max(ex.max, o.x2); }
            else horizontals.set(key, { min: o.x1, max: o.x2 });
        }
        // Borde trasero
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

const OfficeWalls: React.FC = () => {
    const { builder, ecsManager, zonaActual } = useECSSceneContext();

    // 1. Calcular bounds crudos por oficina
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
                if (transform) {
                    positions.push({ x: transform.x, z: transform.z });
                }
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

    // 2. Bounds con padding por oficina
    const paddedOffices = useMemo((): PaddedBounds[] =>
        officeBounds.map(b => ({
            x1: b.minX - ROOM_PADDING,
            x2: b.maxX + ROOM_PADDING,
            z1: b.minZ - ROOM_PADDING,
            z2: b.maxZ + ROOM_PADDING,
        })),
        [officeBounds]
    );

    // 3. Bounding box del edificio completo
    const bldg = useMemo(() => {
        if (paddedOffices.length === 0) return null;
        return {
            x1: Math.min(...paddedOffices.map(o => o.x1)),
            x2: Math.max(...paddedOffices.map(o => o.x2)),
            z1: Math.min(...paddedOffices.map(o => o.z1)),
            z2: Math.max(...paddedOffices.map(o => o.z2)),
        };
    }, [paddedOffices]);

    // 4. Paredes internas (particiones entre oficinas)
    const internalWalls = useMemo((): WallSegment[] => {
        if (!bldg || paddedOffices.length <= 1) return [];
        return computeInternalWalls(paddedOffices, bldg);
    }, [paddedOffices, bldg]);

    // Materiales
    const wallMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#e8e2da',
        roughness: 0.92,
        metalness: 0.0,
    }), []);

    const buildingFloorMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#c4beb5',
        roughness: 0.9,
        metalness: 0.0,
    }), []);

    const baseboardMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#b8b0a6',
        roughness: 0.7,
        metalness: 0.05,
    }), []);

    const corniceMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#d0c9c0',
        roughness: 0.6,
        metalness: 0.05,
    }), []);

    if (!bldg) return null;

    const w = bldg.x2 - bldg.x1;
    const d = bldg.z2 - bldg.z1;
    const cx = (bldg.x1 + bldg.x2) / 2;
    const cz = (bldg.z1 + bldg.z2) / 2;
    const hh = WALL_HEIGHT / 2;

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

            {/* ═══ PAREDES EXTERIORES ═══ */}

            {/* Pared trasera (z2) */}
            <mesh position={[cx, hh, bldg.z2]} material={wallMat} castShadow receiveShadow>
                <boxGeometry args={[w + WALL_THICKNESS, WALL_HEIGHT, WALL_THICKNESS]} />
            </mesh>

            {/* Pared izquierda (x1) */}
            <mesh position={[bldg.x1, hh, cz]} material={wallMat} castShadow receiveShadow>
                <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, d + WALL_THICKNESS]} />
            </mesh>

            {/* Pared derecha (x2) */}
            <mesh position={[bldg.x2, hh, cz]} material={wallMat} castShadow receiveShadow>
                <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, d + WALL_THICKNESS]} />
            </mesh>

            {/* Pared frontal (z1) - media altura para visibilidad */}
            <mesh position={[cx, FRONT_WALL_HEIGHT / 2, bldg.z1]} material={wallMat} castShadow receiveShadow>
                <boxGeometry args={[w + WALL_THICKNESS, FRONT_WALL_HEIGHT, WALL_THICKNESS]} />
            </mesh>

            {/* ═══ CORNISA SUPERIOR ═══ */}
            <mesh position={[cx, WALL_HEIGHT, bldg.z2]} material={corniceMat}>
                <boxGeometry args={[w + WALL_THICKNESS * 3, CORNICE_H, WALL_THICKNESS + 0.06]} />
            </mesh>
            <mesh position={[bldg.x1, WALL_HEIGHT, cz]} material={corniceMat}>
                <boxGeometry args={[WALL_THICKNESS + 0.06, CORNICE_H, d + WALL_THICKNESS * 3]} />
            </mesh>
            <mesh position={[bldg.x2, WALL_HEIGHT, cz]} material={corniceMat}>
                <boxGeometry args={[WALL_THICKNESS + 0.06, CORNICE_H, d + WALL_THICKNESS * 3]} />
            </mesh>
            <mesh position={[cx, FRONT_WALL_HEIGHT, bldg.z1]} material={corniceMat}>
                <boxGeometry args={[w + WALL_THICKNESS * 3, CORNICE_H, WALL_THICKNESS + 0.06]} />
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

            {/* ═══ PAREDES INTERNAS (PARTICIONES) ═══ */}
            {internalWalls.map((wall, i) => (
                <mesh
                    key={`partition-${i}`}
                    position={wall.position}
                    material={wallMat}
                    castShadow
                    receiveShadow
                >
                    <boxGeometry args={wall.size} />
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
