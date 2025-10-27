import { describe, expect, test } from "vitest";
import { ECSManager } from "../src/ecs/core";
import { SistemaPresupuesto } from "../src/ecs/systems";
import { PresupuestoComponent, WorkstationComponent } from "../src/ecs/components";
import { ConfiguracionWorkstation } from "../src/data/configuraciones/configWorkstation";

describe('PresupuestoComponent y SistemaPresupuesto', () => {
    test('el monto del presupuesto aumenta y disminuye al activar y desactivar configuraciones', () => {
        const em = new ECSManager();
        const entidadPresupuesto = em.agregarEntidad();
        const presupuestoInicial = 1000;
        em.agregarComponente(entidadPresupuesto, new PresupuestoComponent(presupuestoInicial));
        const sistema = new SistemaPresupuesto();
        em.agregarSistema(sistema);

        const c = em.getComponentes(entidadPresupuesto);
        expect(c).toBeDefined();
        const presupuesto = c!.get(PresupuestoComponent);
        expect(presupuesto.monto).toBe(presupuestoInicial);

        const configuración = ConfiguracionWorkstation.ANTIVIRUS_GESTIONADO

        // Simular activación de una configuración
        const entidadWorkstation = em.agregarEntidad();
        em.agregarComponente(entidadWorkstation, new WorkstationComponent());
        sistema.toggleConfiguracionWorkstation(entidadPresupuesto, entidadWorkstation, configuración)
        expect(presupuesto.monto).toBeLessThan(presupuestoInicial);
        console.log("Se activó la configuración:", configuración)
        console.log("Presupuesto actual:", presupuesto.monto)

        const montoDespuesDeActivacion = presupuesto.monto

        // Simular desactivación de una configuración
        sistema.toggleConfiguracionWorkstation(entidadPresupuesto, entidadWorkstation, configuración)
        expect(presupuesto.monto).toBeLessThan(montoDespuesDeActivacion);
        console.log("Se desactivó la configuración: ", configuración)
        console.log("Presupuesto actual:", presupuesto.monto)
    });
});
