import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import Model3D from '../../escenarios-simulados/components/Model3D';
import { getDispositivoModel } from '../../escenarios-simulados/config/modelConfig';
import type { TipoDispositivo } from '../../../../types/DeviceEnums';

interface DispositivoViewer3DProps {
    tipoDispositivo: TipoDispositivo;
}

export default function DispositivoViewer3D({ tipoDispositivo }: DispositivoViewer3DProps) {
    const modelPath = getDispositivoModel(tipoDispositivo);

    if (!modelPath) {
        return null;
    }

    return (
        <Canvas
            style={{ width: '100%', height: '100%', background: '#313131' }}
            shadows
            dpr={[1, 2]}
        >
            <Suspense fallback={null}>
                <color attach="background" args={['#313131']} />
                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={0.8}
                    castShadow
                />
                <directionalLight
                    position={[-5, 3, -5]}
                    intensity={0.4}
                />

                <PerspectiveCamera
                    makeDefault
                    position={[-2.5, 0.5, 0]}
                    rotateOnAxis={[]}
                    fov={35}
                />
                <OrbitControls
                    enablePan={false}
                    enableZoom={false}
                    minDistance={1}
                    maxDistance={4}
                    target={[0, 0.3, 0]}
                />
                <Model3D
                    modelPath={modelPath}
                    position={[0, 0, 0]}
                    scale={1}
                    enableHover={false}
                />
            </Suspense>
        </Canvas>
    );
}
