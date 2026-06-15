import { Group } from "three";
import { buildRouterModel } from "./routerModel";
import { buildSwitchModel } from "./switchModel";
import { buildRackModel } from "./rackModel";
import { buildMesaModel } from "./mesaModel";

/**
 * Registro de modelos 3D procedurales (construidos por código en lugar de
 * cargarse desde un archivo glTF).
 *
 * En modelConfig las rutas procedurales usan el prefijo `procedural:` (por
 * ejemplo `procedural:router`), de modo que Model3D pueda distinguirlas de
 * las rutas glTF normales sin cambiar el flujo de ECSSceneRenderer.
 */

export const PROCEDURAL_PREFIX = "procedural:";

/**
 * Offset de orientación (eje Y) por modelo. Los modelos se construyen con el
 * frente hacia +Z, pero el `rotacionY` de los escenarios se calibró para la
 * convención de los modelos antiguos; este offset alinea ambos. Si algún modelo
 * queda mirando al lado equivocado, ajusta su valor (Math.PI / 2, -Math.PI / 2,
 * Math.PI o 0).
 */
const OFFSET_FRENTE_Y: Record<string, number> = {
  router: Math.PI / 2,
  switch: Math.PI / 2,
  rack: Math.PI / 2,
  mesa: Math.PI / 2,
};

type ConstructorModelo = () => Group;

const builders: Record<string, ConstructorModelo> = {
  router: buildRouterModel,
  switch: buildSwitchModel,
  rack: buildRackModel,
  mesa: buildMesaModel,
};

// Caché del prototipo: cada modelo se construye una sola vez y luego Model3D
// lo clona por instancia (igual que hace con las escenas glTF).
const cache = new Map<string, Group>();

export const isProceduralPath = (path: string): boolean =>
  path.startsWith(PROCEDURAL_PREFIX);

/**
 * Devuelve el prototipo (Group) de un modelo procedural a partir de su ruta.
 */
export const getProceduralScene = (path: string): Group => {
  const key = path.slice(PROCEDURAL_PREFIX.length);

  let scene = cache.get(key);
  if (!scene) {
    const build = builders[key];
    if (!build) {
      throw new Error(`Modelo procedural desconocido: ${key}`);
    }
    scene = build();
    scene.rotation.y = OFFSET_FRENTE_Y[key] ?? 0;
    cache.set(key, scene);
  }
  return scene;
};
