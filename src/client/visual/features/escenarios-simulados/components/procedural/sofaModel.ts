import { Group, Mesh, MeshStandardMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Sofá procedural de 3 plazas: base, respaldo, apoyabrazos y cojines. Para salas
 * de estar / casa. Low-poly con bordes redondeados; materiales compartidos.
 * Origen centrado en XZ, base en y=0. El frente (asiento) mira hacia +Z.
 */

const ANCHO = 1.9; // X
const FONDO = 0.85; // Z

const matTela = new MeshStandardMaterial({ color: "#7d8a99", roughness: 0.92, metalness: 0 });
const matCojin = new MeshStandardMaterial({ color: "#8c98a6", roughness: 0.95, metalness: 0 });
const matPata = new MeshStandardMaterial({ color: "#3a2c22", roughness: 0.6, metalness: 0.2 });

export const buildSofaModel = (): Group => {
  const g = new Group();

  // Base/asiento estructural.
  const base = new Mesh(new RoundedBoxGeometry(ANCHO, 0.28, FONDO, 3, 0.06), matTela);
  base.position.set(0, 0.26, 0);
  g.add(base);

  // Respaldo (hacia -Z).
  const respaldo = new Mesh(new RoundedBoxGeometry(ANCHO, 0.5, 0.18, 3, 0.05), matTela);
  respaldo.position.set(0, 0.5, -FONDO / 2 + 0.09);
  g.add(respaldo);

  // Apoyabrazos.
  for (const s of [-1, 1]) {
    const brazo = new Mesh(new RoundedBoxGeometry(0.2, 0.34, FONDO, 3, 0.05), matTela);
    brazo.position.set(s * (ANCHO / 2 - 0.1), 0.42, 0);
    g.add(brazo);
  }

  // Cojines de asiento (3).
  for (let i = 0; i < 3; i++) {
    const x = -ANCHO / 2 + 0.32 + i * ((ANCHO - 0.64) / 2);
    const cojin = new Mesh(new RoundedBoxGeometry(0.52, 0.12, FONDO - 0.18, 3, 0.05), matCojin);
    cojin.position.set(x, 0.46, 0.04);
    g.add(cojin);
  }

  // Patas.
  for (const dx of [-ANCHO / 2 + 0.12, ANCHO / 2 - 0.12]) for (const dz of [-FONDO / 2 + 0.12, FONDO / 2 - 0.12]) {
    const pata = new Mesh(new RoundedBoxGeometry(0.07, 0.16, 0.07, 2, 0.02), matPata);
    pata.position.set(dx, 0.08, dz);
    g.add(pata);
  }

  return g;
};
