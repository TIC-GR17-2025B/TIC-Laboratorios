import React, { useRef, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useECSSceneContext } from '../context/ECSSceneContext';

interface CameraControlsProps {
    enabled?: boolean;
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

const CameraControls: React.FC<CameraControlsProps> = ({
    enabled = true,
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
    const { camera } = useThree();
    const { zoomCommand, clearZoomCommand, focusTarget, clearFocusTarget } = useECSSceneContext();

    useEffect(() => {
        if (!zoomCommand || !controlsRef.current) return;
        const controls = controlsRef.current;
        const direction = new Vector3().subVectors(camera.position, controls.target).normalize();
        const step = zoomCommand === 'in' ? -1.5 : 1.5;
        const newPos = camera.position.clone().addScaledVector(direction, step);
        const dist = newPos.distanceTo(controls.target);
        if (dist >= minDistance && dist <= maxDistance) {
            camera.position.copy(newPos);
            controls.update();
        }
        clearZoomCommand();
    }, [zoomCommand, clearZoomCommand, camera, minDistance, maxDistance]);

    useEffect(() => {
        if (!focusTarget || !controlsRef.current) return;
        const controls = controlsRef.current;
        const target = new Vector3(focusTarget[0], focusTarget[1], focusTarget[2]);
        const offset = camera.position.clone().sub(controls.target);
        controls.target.copy(target);
        camera.position.copy(target).add(offset);
        controls.update();
        clearFocusTarget();
    }, [focusTarget, clearFocusTarget, camera]);

    return (
        <OrbitControls
            ref={controlsRef}
            enabled={enabled}
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
