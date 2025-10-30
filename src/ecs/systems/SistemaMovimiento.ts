import { Sistema, type Entidad } from '../core'
import { Transform, Velocidad } from '../components';

export class SistemaMovimiento extends Sistema {
    public componentesRequeridos = new Set([Transform, Velocidad]);
    public actualizacionesRealizadas = 0; // Solo para tests

    public actualizar(entidades: Set<Entidad>): void {
        this.actualizacionesRealizadas++;
        
        for (const entidad of entidades) {
            const componentes = this.ecsManager.getComponentes(entidad);
            if (!componentes) continue;

            const pos = componentes.get(Transform);
            const vel = componentes.get(Velocidad);

            pos.x += vel.vx;
            pos.z += vel.vz;
        }
      }
}
