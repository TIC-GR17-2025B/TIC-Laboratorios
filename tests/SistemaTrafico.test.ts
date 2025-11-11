import { describe, test, expect, beforeEach } from 'vitest'
import { ECSManager } from '../src/ecs/core';
import { SistemaRed, SistemaRelaciones } from '../src/ecs/systems';
import { TipoProtocolo } from '../src/types/TrafficEnums';
import { 
  DispositivoComponent, 
  RouterComponent,
  RedComponent,
  ZonaComponent
} from '../src/ecs/components';
import { EstadoAtaqueDispositivo, TipoDispositivo } from '../src/types/DeviceEnums';
import { FirewallBuilder } from '../src/ecs/utils/FirewallBuilder';
import type { Entidad } from '../src/ecs/core/Componente';

describe("SistemaTrafico", () => {
  let em: ECSManager;
  let sistema: SistemaRed;
  let sistemaRelaciones: SistemaRelaciones;

  beforeEach(() => {
    em = new ECSManager();
    sistema = new SistemaRed();
    em.agregarSistema(sistema);
    
    // Crear sistema de relaciones para Zona->Red
    sistemaRelaciones = new SistemaRelaciones(ZonaComponent, RedComponent, "redes");
    em.agregarSistema(sistemaRelaciones);
  });

  test("permite tráfico entre dispositivos de la misma red", () => {
    // Crear red y zona
    const red1 = em.agregarEntidad();
    em.agregarComponente(red1, new RedComponent("LAN", "#00FF00"));
    
    const zona1 = em.agregarEntidad();
    em.agregarComponente(zona1, new ZonaComponent(1, "Zona1", "",[], [red1], "zona"));
    sistemaRelaciones.agregar(zona1, red1);

    // Crear dos dispositivos en la misma red
    const dispositivo1 = em.agregarEntidad();
    em.agregarComponente(dispositivo1, 
      new DispositivoComponent("disp1", "Linux", "hw", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, [red1])
    );

    const dispositivo2 = em.agregarEntidad();
    em.agregarComponente(dispositivo2,
      new DispositivoComponent("disp2", "Windows", "hw",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL, [red1])
    );

    // Crear router con la red
    const router = em.agregarEntidad();
    em.agregarComponente(router,
      new DispositivoComponent("router1", "Cisco", "hw",
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL, [red1])
    );
    
    const firewallConfig = new FirewallBuilder().build();
    em.agregarComponente(router, new RouterComponent(true, firewallConfig));

    // Intentar tráfico (cualquier protocolo funciona)
    const resultado = sistema.enviarTrafico(dispositivo1, dispositivo2, TipoProtocolo.SSH, null);

    expect(resultado).toBe(true);
  });

  test("bloquea tráfico entre dispositivos con diferentes routers", () => {
    // Crear dos redes y zonas diferentes
    const red1 = em.agregarEntidad();
    em.agregarComponente(red1, new RedComponent("LAN1", "#00FF00"));
    const zona1 = em.agregarEntidad();
    em.agregarComponente(zona1, new ZonaComponent(1, "Zona1", "",[], [red1], "zona"));
    sistemaRelaciones.agregar(zona1, red1);
    
    const red2 = em.agregarEntidad();
    em.agregarComponente(red2, new RedComponent("LAN2", "#FF0000"));
    const zona2 = em.agregarEntidad();
    em.agregarComponente(zona2, new ZonaComponent(2, "Zona2", "",[], [red2], "zona"));
    sistemaRelaciones.agregar(zona2, red2);

    // Crear dos dispositivos en redes diferentes
    const dispositivo1 = em.agregarEntidad();
    em.agregarComponente(dispositivo1,
      new DispositivoComponent("disp1", "Linux", "hw",
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, [red1])
    );

    const dispositivo2 = em.agregarEntidad();
    em.agregarComponente(dispositivo2,
      new DispositivoComponent("disp2", "Windows", "hw",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL, [red2])
    );

    // Crear dos routers con redes DIFERENTES
    const router1 = em.agregarEntidad();
    em.agregarComponente(router1,
      new DispositivoComponent("router1", "Cisco", "hw",
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL, [red1])
    );
    
    const firewallConfig1 = new FirewallBuilder()
      .setPoliticaSaliente('DENEGAR')
      .build();
    
    em.agregarComponente(router1, new RouterComponent(true, firewallConfig1)); 

    const router2 = em.agregarEntidad();
    em.agregarComponente(router2,
      new DispositivoComponent("router2", "Cisco", "hw",
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL, [red2])
    );
    
    const firewallConfig2 = new FirewallBuilder().build();
    em.agregarComponente(router2, new RouterComponent(true, firewallConfig2)); 

    // Intentar tráfico entre redes diferentes
    const resultado = sistema.enviarTrafico(dispositivo1, dispositivo2, TipoProtocolo.SSH, null);

    expect(resultado).toBe(false);
  });
});
