import React, { useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface CameraControlsProps {
    enableZoom?: boolean;
    enablePan?: boolean;
    enableRotate?: boolean;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    minDistance?: number;
    maxDistance?: number;
    minPolarAngle?: number;
    maxPolarAngle?: number;
}

/**
 * Componente para controles de cámara orbital
 */

const CameraControls: React.FC<CameraControlsProps> = ({
    enableZoom = true,
    enablePan = true,
    enableRotate = true,
    autoRotate = false,
    autoRotateSpeed = 2,
    minDistance = 2,
    maxDistance = 10,
    minPolarAngle = 0,
    maxPolarAngle = Math.PI / 2,
}) => {
    const controlsRef = useRef<OrbitControlsImpl>(null);

    return (
        <OrbitControls
            ref={controlsRef}
            enableZoom={enableZoom}
            enablePan={enablePan}
            enableRotate={enableRotate}
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed}
            minDistance={minDistance}
            maxDistance={maxDistance}
            minPolarAngle={minPolarAngle}
            maxPolarAngle={maxPolarAngle}
            makeDefault
        />
    );
};

export default CameraControls;
