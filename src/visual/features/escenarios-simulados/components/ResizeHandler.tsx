import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera } from 'three';

/**
 * Componente que maneja el resize de la ventana y actualiza la cámara correctamente
 * Previene problemas de aspect ratio y perspectiva distorsionada
 */
const ResizeHandler = () => {
    const { camera, gl, size } = useThree();

    useEffect(() => {
        const handleResize = () => {
            const container = gl.domElement.parentElement;
            if (!container) return;

            const width = container.clientWidth;
            const height = container.clientHeight;

            if (width === 0 || height === 0) return;

            // Actualizar el aspect ratio de la cámara
            if (camera instanceof PerspectiveCamera) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }

            gl.setSize(width, height, false);
        };

        handleResize();

        let resizeTimeout: number;
        const debouncedResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = window.setTimeout(handleResize, 50);
        };

        window.addEventListener('resize', debouncedResize);

        return () => {
            window.removeEventListener('resize', debouncedResize);
            clearTimeout(resizeTimeout);
        };
    }, [camera, gl, size]);

    return null;
};

export default ResizeHandler;
