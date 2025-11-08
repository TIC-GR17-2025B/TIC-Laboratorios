import { describe, test, expect, beforeEach } from 'vitest'
import { ECSManager } from '../src/ecs/core';
import { SistemaRed } from '../src/ecs/systems';
import { TipoProtocolo } from '../src/types/TrafficEnums';
import { 
  DispositivoComponent, 
  RouterComponent,
  RedComponent
} from '../src/ecs/components';
import { EstadoAtaqueDispositivo, TipoDispositivo } from '../src/types/DeviceEnums';
import { FirewallBuilder } from '../src/ecs/utils/FirewallBuilder';

describe("SistemaTrafico", () => {
  let em: ECSManager;
  let sistema: SistemaRed;

  beforeEach(() => {
    em = new ECSManager();
    sistema = new SistemaRed();
    em.agregarSistema(sistema);
  });

  test("permite tráfico entre dispositivos de la misma red", () => {
    // Crear dos dispositivos
    const dispositivo1 = em.agregarEntidad();
    em.agregarComponente(dispositivo1, 
      new DispositivoComponent("disp1", "Linux", "hw", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL)
    );

    const dispositivo2 = em.agregarEntidad();
    em.agregarComponente(dispositivo2,
      new DispositivoComponent("disp2", "Windows", "hw",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL)
    );

    // Crear router con red que conecta ambos dispositivos
    const router = em.agregarEntidad();
    em.agregarComponente(router,
      new DispositivoComponent("router1", "Cisco", "hw",
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL)
    );
    
    const red1 = em.agregarEntidad();
    em.agregarComponente(red1, new RedComponent("LAN", "#00FF00", ["disp1", "disp2"], ""));
    
    const firewallConfig = new FirewallBuilder().build();
    em.agregarComponente(router, new RouterComponent(true, firewallConfig, [red1]));

    // Intentar tráfico (cualquier protocolo funciona)
    const resultado = sistema.enviarTrafico("disp1", "disp2", TipoProtocolo.SSH, null);

    expect(resultado).toBe(true);
  });

  test("bloquea tráfico entre dispositivos con diferentes routers", () => {
    // Crear dos dispositivos
    const dispositivo1 = em.agregarEntidad();
    em.agregarComponente(dispositivo1,
      new DispositivoComponent("disp1", "Linux", "hw",
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL)
    );

    const dispositivo2 = em.agregarEntidad();
    em.agregarComponente(dispositivo2,
      new DispositivoComponent("disp2", "Windows", "hw",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL)
    );

    // Crear dos routers con redes DIFERENTES
    const router1 = em.agregarEntidad();
    em.agregarComponente(router1,
      new DispositivoComponent("router1", "Cisco", "hw",
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL)
    );
    
    const red1 = em.agregarEntidad();
    em.agregarComponente(red1, new RedComponent("LAN1", "#00FF00", ["disp1"], ""));
    const firewallConfig1 = new FirewallBuilder()
      .setPoliticaSaliente('DENEGAR')
      .build();
    
    em.agregarComponente(router1, new RouterComponent(true, firewallConfig1, [red1])); 

    const router2 = em.agregarEntidad();
    em.agregarComponente(router2,
      new DispositivoComponent("router2", "Cisco", "hw",
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL)
    );
    
    const red2 = em.agregarEntidad();
    em.agregarComponente(red2, new RedComponent("LAN2", "#FF0000", ["disp2"], ""));
    
    const firewallConfig2 = new FirewallBuilder().build();
    em.agregarComponente(router2, new RouterComponent(true, firewallConfig2, [red2])); 

    // Intentar tráfico entre redes diferentes
    const resultado = sistema.enviarTrafico("disp1", "disp2", TipoProtocolo.SSH, null);

    expect(resultado).toBe(false);
  });
});
