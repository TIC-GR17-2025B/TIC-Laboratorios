/* eslint-disable react-refresh/only-export-components */
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { Group, Box3, Vector3 } from 'three';

interface Model3DProps {
    modelPath: string;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number | [number, number, number];
    showHoverButton?: boolean;
    onClick?: () => void;
    hoverPadding?: number;
}

/**
 * Componente reutilizable para cargar y renderizar modelos GLTF
 * Permite configurar posición, rotación y escala del modelo
 * Incluye funcionalidad de hover con botón interactivo y área de detección ajustable
 */
const Model3D: React.FC<Model3DProps> = ({
    modelPath,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1,
    //showHoverButton = true,
    onClick,
    hoverPadding = 1
}) => {
    const groupRef = useRef<Group>(null);
    const { scene } = useGLTF(modelPath);
    const [boundingBoxSize, setBoundingBoxSize] = useState<[number, number, number]>([2, 2, 2]);

    const clonedScene = useMemo(() => scene.clone(), [scene]);

    useEffect(() => {
        if (clonedScene) {
            const box = new Box3().setFromObject(clonedScene);
            const size = new Vector3();
            box.getSize(size);

            // padding al tamaño del bounding box
            setBoundingBoxSize([
                Math.max(size.x * hoverPadding, 0.5),
                Math.max(size.y * hoverPadding, 0.5),
                Math.max(size.z * hoverPadding, 0.5)
            ]);
        }
    }, [clonedScene, hoverPadding]);

    // const handleButtonClick = (e: React.MouseEvent) => {
    //     e.stopPropagation();
    //     if (onClick) {
    //         onClick();
    //     }
    // };

    // const handleSelect = () => {
    //     console.log("Modelo seleccionado:", modelPath);
    //     setHovered(!hovered);
    // };

    return (
        <group
            ref={groupRef}
            position={position}
            rotation={rotation}
            scale={scale}
        >
            {/* Necesito este mesh invisible para detectar un hover con padding */}
            <mesh
                onClick={onClick}
            >
                <boxGeometry args={boundingBoxSize} />
                <meshBasicMaterial visible={false} />
            </mesh>

            <primitive object={clonedScene} />

            {/* {showHoverButton && hovered && (
                <Html
                    position={[0, boundingBoxSize[1] / 2, 0]}
                    center
                    distanceFactor={10}
                    occlude={false}
                    pointerEvents="none"
                    style={{
                        transition: 'all 0.2s',
                        opacity: hovered ? 1 : 0,
                        pointerEvents: 'handleButtonClickauto'
                    }}
                >
                    <button
                        onClick={}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'var(--border-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'auto'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--border-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--border-primary)';
                        }}
                    >
                        Configurar
                    </button>
                </Html>
            )} */}
        </group>
    );
};

// Precargar el modelo para mejorar el rendimiento
export const preloadModel = (path: string) => {
    useGLTF.preload(path);
};

export default Model3D;