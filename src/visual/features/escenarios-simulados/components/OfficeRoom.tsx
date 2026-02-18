import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

export const ROOM_PADDING = 1.0;
const OFFICE_FLOOR_Y = 0.015;

export interface OfficeBounds {
    oficinaId: number;
    nombre: string;
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
}

const FLOOR_COLORS = ['#d8d2ca', '#d0d4cc', '#d4ced2', '#ccd4d0'];

interface OfficeRoomProps {
    bounds: OfficeBounds;
    index: number;
}

/**
 * Renderiza solo el piso diferenciado y la etiqueta de una oficina.
 * Las paredes son manejadas por OfficeWalls (edificio unificado).
 */
const OfficeRoom: React.FC<OfficeRoomProps> = React.memo(({ bounds, index }) => {
    const x1 = bounds.minX - ROOM_PADDING;
    const x2 = bounds.maxX + ROOM_PADDING;
    const z1 = bounds.minZ - ROOM_PADDING;
    const z2 = bounds.maxZ + ROOM_PADDING;

    const width = x2 - x1;
    const depth = z2 - z1;
    const centerX = (x1 + x2) / 2;
    const centerZ = (z1 + z2) / 2;

    const colorIndex = index % FLOOR_COLORS.length;
    const floorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: FLOOR_COLORS[colorIndex],
        roughness: 0.85,
        metalness: 0.0,
    }), [colorIndex]);

    return (
        <group name={`office-floor-${bounds.oficinaId}`}>
            {/* Piso de la oficina - ligeramente elevado sobre el piso del edificio */}
            <mesh
                position={[centerX, OFFICE_FLOOR_Y, centerZ]}
                rotation={[-Math.PI / 2, 0, 0]}
                receiveShadow
                material={floorMaterial}
            >
                <planeGeometry args={[width - 0.04, depth - 0.04]} />
            </mesh>

            {/* Etiqueta en la pared trasera, mirando hacia el interior */}
            <Text
                position={[centerX, 1.8, z2 - 0.08]}
                rotation={[0, Math.PI, 0]}
                fontSize={0.2}
                color="#5a4e42"
                anchorX="center"
                anchorY="middle"
                maxWidth={width - 0.5}
            >
                {bounds.nombre}
            </Text>
        </group>
    );
});

OfficeRoom.displayName = 'OfficeRoom';

export default OfficeRoom;
