import React from 'react';

interface EnvironmentProps {
    showGrid?: boolean;
    showAxes?: boolean;
    gridSize?: number;
    gridDivisions?: number;
}

/**
 * Componente útil para depuración. Utiliza grids
 * y ejes para ayudar en la colocación de objetos
 */

const Environment: React.FC<EnvironmentProps> = ({
    showGrid = false,
    showAxes = false,
    gridSize = 10,
    gridDivisions = 10,
}) => {
    return (
        <>
            {showGrid && (
                <gridHelper
                    args={[gridSize, gridDivisions, '#888888', '#444444']}
                />
            )}

            {showAxes && (
                <axesHelper args={[5]} />
            )}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.01, 0]}
                receiveShadow
            >
                <planeGeometry args={[100, 100]} />
                <shadowMaterial opacity={0.3} />
            </mesh>
        </>
    );
};

export default Environment;
