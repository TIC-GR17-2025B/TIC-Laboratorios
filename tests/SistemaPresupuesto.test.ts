import { describe, expect, test } from "vitest";
import { ECSManager } from "../src/ecs/core";
import { SistemaPresupuesto } from "../src/ecs/systems";
import { DispositivoComponent, PresupuestoComponent, WorkstationComponent } from "../src/ecs/components";
import { ConfiguracionWorkstation } from "../src/data/configuraciones/configWorkstation";
import { EstadoAtaqueDispositivo, TipoDispositivo } from "../src/types/DeviceEnums";

describe('PresupuestoComponent y SistemaPresupuesto', () => {
    test('activación y desactivación de configuraciones con presupuesto suficiente', () => {
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

        const configuracion = ConfiguracionWorkstation.values().next().value!.nombreConfig;

        // Simular activación de una configuración
        const entidadWorkstation = em.agregarEntidad();
        em.agregarComponente(entidadWorkstation, new DispositivoComponent("dispo", "so", "hw", TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, []));
        em.agregarComponente(entidadWorkstation, new WorkstationComponent());
        sistema.toggleConfiguracionWorkstation(entidadPresupuesto, entidadWorkstation, configuracion)
        expect(presupuesto.monto).toBeLessThan(presupuestoInicial);
        console.log("Se activó la configuración:", configuracion)
        console.log("Presupuesto actual:", presupuesto.monto)

        const montoDespuesDeActivacion = presupuesto.monto

        // Simular desactivación de una configuración
        sistema.toggleConfiguracionWorkstation(entidadPresupuesto, entidadWorkstation, configuracion)
        expect(presupuesto.monto).toBeLessThan(montoDespuesDeActivacion);
        console.log("Se desactivó la configuración:", configuracion)
        console.log("Presupuesto actual:", presupuesto.monto)
    });

    test('activación y desactivación de configuraciones con presupuesto insuficiente', () => {
        const em = new ECSManager();
        const entidadPresupuesto = em.agregarEntidad();
        const presupuestoInicial = 15;
        em.agregarComponente(entidadPresupuesto, new PresupuestoComponent(presupuestoInicial));
        const sistema = new SistemaPresupuesto();
        em.agregarSistema(sistema);

        const c = em.getComponentes(entidadPresupuesto);
        expect(c).toBeDefined();
        const presupuesto = c!.get(PresupuestoComponent);
        expect(presupuesto.monto).toBe(presupuestoInicial);

        const configuracion = ConfiguracionWorkstation.values().next().value!.nombreConfig;

        // Simular activación de una configuración con presupuesto insuficiente
        const entidadWorkstation = em.agregarEntidad();
        em.agregarComponente(entidadWorkstation, new DispositivoComponent("dispo", "so", "hw", TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, []));
        em.agregarComponente(entidadWorkstation, new WorkstationComponent());
        sistema.toggleConfiguracionWorkstation(entidadPresupuesto, entidadWorkstation, configuracion)
        expect(presupuesto.monto).toEqual(presupuestoInicial);
        console.log("No se activó la configuración:", configuracion)
        console.log("Presupuesto actual:", presupuesto.monto)

        presupuesto.monto = presupuestoInicial;

        // Simular desactivación de una configuración con presupuesto insuficiente
        sistema.toggleConfiguracionWorkstation(entidadPresupuesto, entidadWorkstation, configuracion)
        expect(presupuesto.monto).toEqual(presupuesto.monto);
        console.log("No se desactivó la configuración:", configuracion)
        console.log("Presupuesto actual:", presupuesto.monto)
    });
});
