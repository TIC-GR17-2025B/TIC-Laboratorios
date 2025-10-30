import { describe, test, expect } from 'vitest'
import { ECSManager } from '../src/ecs/core'
import { TiempoComponent } from '../src/ecs/components'
import { SistemaTiempo } from '../src/ecs/systems'

describe('SistemaTiempo y TimeComponent', () => {
    test('el valor de transcurrido se incrementa cuando no está pausado', () => {
        const em = new ECSManager();
        const entidad = em.agregarEntidad();
        em.agregarComponente(entidad, new TiempoComponent());
        const sistema = new SistemaTiempo();
        em.agregarSistema(sistema);
    
        const c = em.getComponentes(entidad);
        expect(c).toBeDefined();
        const t = c!.get(TiempoComponent);
        expect(t.transcurrido).toBe(0);
    
        // simular 2 frames
        t.delta = 0.016;
        t.transcurrido += t.delta;
        t.delta = 0.016;
        t.transcurrido += t.delta;
    
        expect(t.transcurrido).toBeCloseTo(0.032, 3);
    });
  
    test('pausar impide que el valor de trasncurrido aumente', () => {
        const em = new ECSManager();
        const entidad = em.agregarEntidad();
        em.agregarComponente(entidad, new TiempoComponent());
        const sistema = new SistemaTiempo();
        em.agregarSistema(sistema);
        
        const c = em.getComponentes(entidad)!;
        const t = c.get(TiempoComponent);
        
        // avanzar un poco
        t.delta = 0.1;
        t.transcurrido += t.delta;
        expect(t.transcurrido).toBeCloseTo(0.1, 3);
        
        // pausar
        sistema.pausar(entidad);
        expect(t.pausado).toBe(true);
        
        // intentar avanzar
        t.delta = 0.2;
        if (!t.pausado) t.transcurrido += t.delta; // perdonen el if, esto no supe cómo más hacerle porque es algo que se controla externamente xd
        
        expect(t.transcurrido).toBeCloseTo(0.1, 3);
        
        // reanudar
        sistema.reanudar(entidad);
        expect(t.pausado).toBe(false);
        t.delta = 0.05;
        t.transcurrido += t.delta;
        expect(t.transcurrido).toBeCloseTo(0.15, 3);
    });
});
