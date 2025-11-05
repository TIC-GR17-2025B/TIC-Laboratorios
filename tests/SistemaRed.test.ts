import { describe, test, expect } from 'vitest'
import { ECSManager } from '../src/ecs/core';
import { SistemaRed } from '../src/ecs/systems';
import { EstadoAtaqueDispositivo, TipoDispositivo } from '../src/types/DeviceEnums';
import { ActivoComponent, DispositivoComponent, RedComponent } from '../src/ecs/components';

describe("SistemaRed", () => {
    test("se pueden enviar activos entre dispositivos de la misma red", () => {
        const em = new ECSManager();
        const sistema = new SistemaRed();
        em.agregarSistema(sistema);

        // Se crean los dispositivos
        const nombreDisp1 = "dispo1";
        const entidadDisp1 = em.agregarEntidad();
        em.agregarComponente(entidadDisp1, new DispositivoComponent(nombreDisp1, "so", "hw", TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL));
        const activoComponente = new ActivoComponent();
        activoComponente.activos.push({nombre: "Activo1", contenido: "Infor importante"})
        em.agregarComponente(entidadDisp1, activoComponente);

        const nombreDisp2 = "dispo2"
        const entidadDisp2 = em.agregarEntidad();
        em.agregarComponente(entidadDisp2, new DispositivoComponent(nombreDisp2, "so", "hw", TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL));
        const activoComponente2 = new ActivoComponent(); // El segundo dispositivo no tiene activos
        em.agregarComponente(entidadDisp2, activoComponente2);

        const entidadRed = em.agregarEntidad()
        const red = new RedComponent("LAN1", "#00DD00", [], "zona1");
        em.agregarComponente(entidadRed, red);

        // Se asignan los dispositivos en la red deseada
        sistema.asignarRed(nombreDisp1, red.nombre);
        sistema.asignarRed(nombreDisp2, red.nombre);

        // Se envía el activo
        sistema.enviarActivo(nombreDisp1, nombreDisp2, activoComponente.activos[0].nombre);

        expect(activoComponente2.activos.includes(activoComponente.activos[0])).toBe(true);
    });
});
