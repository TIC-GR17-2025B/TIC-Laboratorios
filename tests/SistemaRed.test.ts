import { describe, test, expect } from "vitest";
import { ECSManager } from "../src/ecs/core";
import { SistemaRed } from "../src/ecs/systems";
import {
  EstadoAtaqueDispositivo,
  TipoDispositivo,
} from "../src/types/DeviceEnums";
import {
  ActivoComponent,
  DispositivoComponent,
  RouterComponent,
  RedComponent,
} from "../src/ecs/components";
import { TipoProtocolo } from "../src/types/TrafficEnums";
import { FirewallBuilder } from "../src/ecs/utils/FirewallBuilder";

describe("SistemaRed", () => {
  test("se pueden enviar activos entre dispositivos de la misma red", () => {
    const em = new ECSManager();
    const sistema = new SistemaRed();
    em.agregarSistema(sistema);

    const nombreDisp1 = "dispo1";
    const entidadDisp1 = em.agregarEntidad();
    em.agregarComponente(
      entidadDisp1,
      new DispositivoComponent(
        nombreDisp1,
        "so",
        "hw",
        TipoDispositivo.WORKSTATION,
        EstadoAtaqueDispositivo.NORMAL
      )
    );
    const activoComponente = new ActivoComponent();
    activoComponente.activos.push({
      nombre: "Activo1",
      contenido: "Infor importante",
    });
    em.agregarComponente(entidadDisp1, activoComponente);

    const nombreDisp2 = "dispo2";
    const entidadDisp2 = em.agregarEntidad();
    em.agregarComponente(
      entidadDisp2,
      new DispositivoComponent(
        nombreDisp2,
        "so",
        "hw",
        TipoDispositivo.WORKSTATION,
        EstadoAtaqueDispositivo.NORMAL
      )
    );
    const activoComponente2 = new ActivoComponent(); // El segundo dispositivo no tiene activos
    em.agregarComponente(entidadDisp2, activoComponente2);

    const router = em.agregarEntidad();
    em.agregarComponente(
      router,
      new DispositivoComponent(
        "router1",
        "Cisco",
        "hw",
        TipoDispositivo.ROUTER,
        EstadoAtaqueDispositivo.NORMAL
      )
    );

    const red1 = em.agregarEntidad();
    em.agregarComponente(red1, new RedComponent("LAN1", "#00DD00"));

    const firewallConfig = new FirewallBuilder().build();
    em.agregarComponente(router, new RouterComponent(firewallConfig));

    sistema.asignarRed(entidadDisp1, red1);
    sistema.asignarRed(entidadDisp2, red1);

    sistema.enviarTrafico(
      entidadDisp1,
      entidadDisp2,
      TipoProtocolo.FTP,
      activoComponente.activos[0].nombre
    );

    expect(
      activoComponente2.activos.includes(activoComponente.activos[0])
    ).toBe(true);
  });

  /*
    test("se pueden enviar activos entre dispositivos de distintas redes pero en la misma zona", () => {
        const em = new ECSManager();
        const sistema = new SistemaRed();
        em.agregarSistema(sistema); 
        
        const sistemaRelaciones = new SistemaRelaciones(ZonaComponent, RedComponent, "redes");
        em.agregarSistema(sistemaRelaciones);

        const red1 = em.agregarEntidad();
        em.agregarComponente(red1, new RedComponent("LAN1", "#00DD00"));
        const red2 = em.agregarEntidad();
        em.agregarComponente(red2, new RedComponent("LAN2", "#0000FF"));

        const zona1 = em.agregarEntidad();
        em.agregarComponente(zona1, new ZonaComponent(1, "Zona1", "",[], [red1, red2], "zona"));
        sistemaRelaciones.agregar(zona1, red1);
        sistemaRelaciones.agregar(zona1, red2);

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
            TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL, [red1, red2])
        );
        const firewallConfig = new FirewallBuilder().build();
        em.agregarComponente(router, new RouterComponent(true, firewallConfig));

        sistema.asignarRed(entidadDisp1, red1);
        sistema.asignarRed(entidadDisp2, red2);

        sistema.enviarTrafico(entidadDisp1, entidadDisp2, TipoProtocolo.FTP, activoComponente.activos[0].nombre);

        expect(activoComponente2.activos.includes(activoComponente.activos[0])).toBe(true);
    });
   */
});
