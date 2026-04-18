import React from 'react';

interface LightsProps {
    ambientIntensity?: number;
    directionalIntensity?: number;
    directionalPosition?: [number, number, number];
    enableShadows?: boolean;
}

/**
 * Componente para el sistema de iluminación de la escena
 * Configura luz ambiente y direccional con soporte para sombras
 */
const Lights: React.FC<LightsProps> = ({
    ambientIntensity = 0.5,
    directionalIntensity = 1,
    directionalPosition = [5, 5, 5],
    enableShadows = true,
}) => {
    return (
        <>
            <ambientLight intensity={ambientIntensity} />

            <directionalLight
                position={directionalPosition}
                intensity={directionalIntensity}
                castShadow={enableShadows}
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
            />

            <hemisphereLight
                args={['#ffffff', '#444444', 0.3]}
                position={[0, 1, 0]}
            />
        </>
    );
};

export default Lights;
