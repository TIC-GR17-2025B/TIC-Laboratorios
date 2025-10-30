import { describe, it, expect, beforeEach } from "vitest";
import { ComponenteContainer } from '../src/ecs/core';
import { Transform, Velocidad } from '../src/ecs/components';

describe('ComponenteContainer', () => {
    let container: ComponenteContainer;

    beforeEach(() => {
        container = new ComponenteContainer();
    });

    describe('agregar', () => {
        it('debe agregar un componente al container', () => {
            const trns = new Transform(10, 20, 10, 0);
            container.agregar(trns);
          
            expect(container.tiene(Transform)).toBe(true);
        });

        it('debe sobrescribir un componente del mismo tipo', () => {
            const trns1 = new Transform(10, 20, 10, 0);
            const trns2 = new Transform(30, 40, 20, 45);
          
            container.agregar(trns1);
            container.agregar(trns2);
          
            const resultado = container.get(Transform);
            expect(resultado.x).toBe(30);
            expect(resultado.y).toBe(40);
            expect(resultado.z).toBe(20);
            expect(resultado.rotacionY).toBe(45);
        });

        it('debe permitir múltiples componentes de diferentes tipos', () => {
            container.agregar(new Transform(10, 20, 10, 0));
            container.agregar(new Velocidad(1, 2));
      
            expect(container.tiene(Transform)).toBe(true);
            expect(container.tiene(Velocidad)).toBe(true);
        });
    });

    describe('get', () => {
        it('debe retornar el componente correcto', () => {
            const trns = new Transform(15, 25, 20, 0);
            container.agregar(trns);
          
            const resultado = container.get(Transform);
            expect(resultado).toBe(trns);
            expect(resultado.x).toBe(15);
            expect(resultado.y).toBe(25);
            expect(resultado.z).toBe(20);
            expect(resultado.rotacionY).toBe(0);
        });

        it('debe retornar undefined para componente no existente', () => {
            const resultado = container.get(Transform);
            expect(resultado).toBeUndefined();
        });

        it('debe distinguir entre diferentes tipos de componentes', () => {
            container.agregar(new Transform(10, 20, 10, 0));
            container.agregar(new Velocidad(5, 10));
          
            const trns = container.get(Transform);
            const vel = container.get(Velocidad);
          
            expect(trns.x).toBe(10);
            expect(vel.vx).toBe(5);
        });
    });

    describe('tiene', () => {
        it('debe retornar true si el componente existe', () => {
            container.agregar(new Transform(0, 0, 0, 0));
            expect(container.tiene(Transform)).toBe(true);
        });

        it('debe retornar false si el componente no existe', () => {
            expect(container.tiene(Transform)).toBe(false);
        });

        it('debe retornar false después de eliminar un componente', () => {
            container.agregar(new Transform(0, 0, 0, 0));
            container.eliminar(Transform);
            expect(container.tiene(Transform)).toBe(false);
        });
    });

    describe('tieneTodos', () => {
        it('debe retornar true si tiene todos los componentes requeridos', () => {
            container.agregar(new Transform(0, 0, 0, 0));
            container.agregar(new Velocidad(0, 0));
          
            const resultado = container.tieneTodos([Transform, Velocidad]);
            expect(resultado).toBe(true);
        });

        it('debe retornar false si falta algún componente', () => {
            container.agregar(new Transform(0, 0, 0, 0));
          
            const resultado = container.tieneTodos([Transform, Velocidad]);
            expect(resultado).toBe(false);
        });

        it('debe retornar true con una lista vacía', () => {
            // Como no se ha añadido nada, si se le pasa una lista vacía debe ser true
            const resultado = container.tieneTodos([]);
            expect(resultado).toBe(true);
        });

        it('debe retornar true si tiene más componentes de los requeridos', () => {
            container.agregar(new Transform(0, 0, 0, 0));
            container.agregar(new Velocidad(0, 0));
          
            const resultado = container.tieneTodos([Transform]);
            expect(resultado).toBe(true);
        });
    });

    describe('eliminar', () => {
        it('debe eliminar un componente existente', () => {
            container.agregar(new Transform(0, 0, 0, 0));
            container.eliminar(Transform);
          
            expect(container.tiene(Transform)).toBe(false);
        });

        it('no debe causar error al eliminar componente inexistente', () => {
            expect(() => {
                container.eliminar(Transform);
            }).not.toThrow();
        });

        it('debe mantener otros componentes al eliminar uno', () => {
            container.agregar(new Transform(0, 0, 0, 0));
            container.agregar(new Velocidad(0, 0));
          
            container.eliminar(Transform);
          
            expect(container.tiene(Transform)).toBe(false);
            expect(container.tiene(Velocidad)).toBe(true);
        });
    });
});
