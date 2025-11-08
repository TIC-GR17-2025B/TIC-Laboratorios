import { describe, test, expect } from 'vitest'
import { ECSManager } from '../src/ecs/core';
import { SistemaRed } from '../src/ecs/systems';
import { EstadoAtaqueDispositivo, TipoDispositivo } from '../src/types/DeviceEnums';
import { ActivoComponent, DispositivoComponent, RouterComponent, RedComponent } from '../src/ecs/components';
import { TipoProtocolo } from '../src/types/TrafficEnums';
import { FirewallBuilder } from '../src/ecs/utils/FirewallBuilder';

describe("SistemaRed", () => {
    test("se pueden enviar activos entre dispositivos de la misma red", () => {
        const em = new ECSManager();
        const sistema = new SistemaRed();
        em.agregarSistema(sistema);

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


        const router = em.agregarEntidad();
        em.agregarComponente(router, 
          new DispositivoComponent("router1", "Cisco", "hw", 
            TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL)
        );
        
        const red1 = em.agregarEntidad();
        em.agregarComponente(red1, new RedComponent("LAN1", "#00DD00", [], ""));
        
        const firewallConfig = new FirewallBuilder().build();
        em.agregarComponente(router, new RouterComponent(true, firewallConfig, [red1]));

  
        sistema.asignarRed(nombreDisp1, "LAN1");
        sistema.asignarRed(nombreDisp2, "LAN1");

        sistema.enviarTrafico(nombreDisp1, nombreDisp2, TipoProtocolo.FTP, activoComponente.activos[0].nombre);

        expect(activoComponente2.activos.includes(activoComponente.activos[0])).toBe(true);
    });

    test("se pueden enviar activos entre dispositivos de distintas redes pero en la misma zona", () => {
        const em = new ECSManager();
        const sistema = new SistemaRed();
        em.agregarSistema(sistema);


        const nombreDisp1 = "dispo1";
        const entidadDisp1 = em.agregarEntidad();
        em.agregarComponente(entidadDisp1, new DispositivoComponent(nombreDisp1, "so", "hw", TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL));
        const activoComponente = new ActivoComponent();
        activoComponente.activos.push({nombre: "Activo1", contenido: "Infor importante"})
        em.agregarComponente(entidadDisp1, activoComponente);

        const nombreDisp2 = "dispo2"
        const entidadDisp2 = em.agregarEntidad();
        em.agregarComponente(entidadDisp2, new DispositivoComponent(nombreDisp2, "so", "hw", TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL));
        const activoComponente2 = new ActivoComponent(); 
        em.agregarComponente(entidadDisp2, activoComponente2);

        const router = em.agregarEntidad();
        em.agregarComponente(router, 
          new DispositivoComponent("router1", "Cisco", "hw", 
            TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL)
        );
        
        const red1 = em.agregarEntidad();
        em.agregarComponente(red1, new RedComponent("LAN1", "#00DD00", [], ""));
        const red2 = em.agregarEntidad();
        em.agregarComponente(red2, new RedComponent("LAN2", "#0000FF", [], ""));
        
        const firewallConfig = new FirewallBuilder().build();
        em.agregarComponente(router, new RouterComponent(true, firewallConfig, [red1, red2]));


        sistema.asignarRed(nombreDisp1, "LAN1");
        sistema.asignarRed(nombreDisp2, "LAN2");

        sistema.enviarTrafico(nombreDisp1, nombreDisp2, TipoProtocolo.FTP, activoComponente.activos[0].nombre);

        expect(activoComponente2.activos.includes(activoComponente.activos[0])).toBe(true);
    });
});
