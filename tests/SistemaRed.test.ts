import { describe, test, expect } from 'vitest'
import { ECSManager } from '../src/ecs/core';
import { SistemaRed } from '../src/ecs/systems';
import { EstadoAtaqueDispositivo, TipoDispositivo } from '../src/types/DeviceEnums';
import { ActivoComponent, DispositivoComponent } from '../src/ecs/components';

describe("SistemaRed", () => {
    test("se pueden enviar activos entre dispositivos de la misma red", () => {
        const em = new ECSManager();
        const sistema = new SistemaRed();
        em.agregarSistema(sistema);

        // Se crean los dispositivos
        const entidadDisp1 = em.agregarEntidad();
        em.agregarComponente(entidadDisp1, new DispositivoComponent("dispo", "so", "hw", TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, ["red1"]));
        const activoComponente = new ActivoComponent();
        activoComponente.activos.push({nombre: "Activo1", contenido: "Infor importante"})
        em.agregarComponente(entidadDisp1, activoComponente);

        const entidadDisp2 = em.agregarEntidad();
        em.agregarComponente(entidadDisp2, new DispositivoComponent("dispo2", "so", "hw", TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, ["red1"]));
        const activoComponente2 = new ActivoComponent(); // El segundo dispositivo no tiene activos
        em.agregarComponente(entidadDisp2, activoComponente2);

        // Se envía el activo
        sistema.enviarActivo(entidadDisp1, entidadDisp2, activoComponente.activos[0]);

        expect(activoComponente2.activos.includes(activoComponente.activos[0])).toBe(true);
    });
});
