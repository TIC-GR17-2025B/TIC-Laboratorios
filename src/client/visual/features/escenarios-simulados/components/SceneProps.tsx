import React, { useMemo } from 'react';
import { Group } from 'three';
import { useBuildingLayout } from '../hooks/useBuildingLayout';
import { buildRackModel } from './procedural/rackModel';
import { buildServerRackModel } from './procedural/serverRackModel';
import { buildSwitchModel } from './procedural/switchModel';
import { buildRouterModel } from './procedural/routerModel';
import { buildMesaModel } from './procedural/mesaModel';
import { buildMeetingTableModel } from './procedural/meetingTableModel';
import { buildSofaModel } from './procedural/sofaModel';
import { buildWhiteboardModel } from './procedural/whiteboardModel';
import Model3D from './Model3D';
import { getDispositivoModel } from '../config/modelConfig';
import { TipoDispositivo } from '../../../../shared/types/DeviceEnums';
import { mulberry32, seedFromId } from '../utils/seededRandom';
import { ambientProps, type PlacedProp, type PropModel } from '../config/roomProps';
import { getPrefab } from '../config/roomPrefabs';

/**
 * Capa de props decorativos: amuebla las salas sintéticas según su PREFAB (cada
 * uno acopla tamaño + tema + mobiliario) y reparte equipo de red de ambiente por
 * las salas reales. Es puramente visual y vive en el render —no crea entidades
 * ECS—, por lo que nunca aparece en topología, escaneo ni interacción. La
 * distribución es determinista: depende solo del id de cada oficina, así que es
 * idéntica entre renders y solo cambia si cambia el escenario.
 */

type ProceduralKind = Exclude<PropModel, 'workstation'>;

const PROCEDURAL_BUILDERS: Record<ProceduralKind, () => Group> = {
  rack: buildRackModel,
  serverrack: buildServerRackModel,
  switch: buildSwitchModel,
  router: buildRouterModel,
  mesa: buildMesaModel,
  meetingtable: buildMeetingTableModel,
  sofa: buildSofaModel,
  whiteboard: buildWhiteboardModel,
};

const WORKSTATION_PATH = getDispositivoModel(TipoDispositivo.WORKSTATION);

// Cada modelo procedural se construye una sola vez (prototipo); las instancias lo
// clonan, igual que Model3D hace con las escenas glTF. Geometrías y materiales
// quedan compartidos entre clones, así que no se liberan por instancia.
const protoCache = new Map<ProceduralKind, Group>();
function getPropPrototype(kind: ProceduralKind): Group {
  let proto = protoCache.get(kind);
  if (!proto) {
    proto = PROCEDURAL_BUILDERS[kind]();
    proto.traverse((o) => {
      o.castShadow = true;
      o.receiveShadow = true;
    });
    protoCache.set(kind, proto);
  }
  return proto;
}

const ProceduralProp: React.FC<{ prop: PlacedProp }> = ({ prop }) => {
  const objeto = useMemo(
    () => getPropPrototype(prop.kind as ProceduralKind).clone(),
    [prop.kind],
  );
  return (
    <primitive
      object={objeto}
      position={prop.position}
      rotation={[0, prop.rotationY, 0]}
      scale={prop.scale}
    />
  );
};

const PropInstance: React.FC<{ prop: PlacedProp }> = ({ prop }) => {
  // La workstation es un glTF: se renderiza con Model3D (sin hover ni click para
  // que sea inerte), reutilizando su carga y caché. El resto son procedurales.
  if (prop.kind === 'workstation') {
    return (
      <Model3D
        modelPath={WORKSTATION_PATH}
        position={prop.position}
        rotation={[0, prop.rotationY, 0]}
        scale={prop.scale}
        enableHover={false}
      />
    );
  }
  return <ProceduralProp prop={prop} />;
};

const SceneProps: React.FC = () => {
  const { rooms } = useBuildingLayout();

  const items = useMemo(
    () =>
      rooms.flatMap((room) => {
        const rng = mulberry32(seedFromId(room.oficinaId));
        return room.sintetico && room.prefabId
          ? getPrefab(room.prefabId).furnish(room, rng)
          : ambientProps(room, rng);
      }),
    [rooms],
  );

  if (items.length === 0) return null;

  return (
    <group name="scene-props">
      {items.map((prop) => (
        <PropInstance key={prop.id} prop={prop} />
      ))}
    </group>
  );
};

export default SceneProps;
