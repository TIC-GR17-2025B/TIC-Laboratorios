import { describe, test, expect, beforeEach } from 'vitest';
import { ECSManager } from '../src/ecs/core';
import { SistemaRed, SistemaRelaciones } from '../src/ecs/systems';
import { TipoProtocolo } from '../src/types/TrafficEnums';
import { FirewallBuilder } from '../src/ecs/utils/FirewallBuilder';
import { 
  DispositivoComponent, 
  RouterComponent,
  RedComponent,
  ZonaComponent
} from '../src/ecs/components';
import { EstadoAtaqueDispositivo, TipoDispositivo } from '../src/types/DeviceEnums';
import type { Entidad } from '../src/ecs/core/Componente';

describe("SistemaFirewall - Casos Completos", () => {
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

  // Helper para crear entidades de red
  function crearRed(nombre: string, color: string): Entidad {
    const entidadRed = em.agregarEntidad();
    em.agregarComponente(entidadRed, new RedComponent(nombre, color));
    return entidadRed;
  }

  // Helper para crear zona con redes
  function crearZona(id: number, nombre: string, redes: Entidad[]): Entidad {
    const zona = em.agregarEntidad();
    em.agregarComponente(zona, new ZonaComponent(id, nombre, "",[], redes, "zona"));
    
    // Asociar redes a la zona vía SistemaRelaciones
    redes.forEach(red => {
      sistemaRelaciones.agregar(zona, red);
    });
    
    return zona;
  }


  test("Caso 3: No permitir tráfico con filtro activado (protocolo específico denegado)", () => {
    // Crear red y zona
    const red1 = crearRed("LAN", "#00FF00");
    crearZona(1, "Zona-Interna", [red1]);

    const pcInterno = em.agregarEntidad();
    em.agregarComponente(pcInterno, 
      new DispositivoComponent("pc-interno", "Windows", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, [red1])
    );

    const servidorExterno = em.agregarEntidad();
    em.agregarComponente(servidorExterno,
      new DispositivoComponent("servidor-externo", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL, [])
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL, [red1])
    );
    
    // Firewall: Permite todo excepto SSH en AMBAS direcciones
    const firewallConfig = new FirewallBuilder()
      .setPoliticaPorDefecto('PERMITIR')
      .agregarReglaGlobal(TipoProtocolo.SSH, 'DENEGAR', 'AMBAS')
      .build();
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig));

    // SSH: BLOQUEADO (regla global)
    const resultadoSSH = sistema.enviarTrafico(pcInterno, servidorExterno, TipoProtocolo.SSH, null);
    expect(resultadoSSH).toBe(false);

    // HTTP: PERMITIDO (política por defecto)
    const resultadoHTTP = sistema.enviarTrafico(pcInterno, servidorExterno, TipoProtocolo.WEB_SERVER, null);
    expect(resultadoHTTP).toBe(true);
  });

  test("Caso 4: Con excepción donde PERMITE el tráfico (lista blanca)", () => {
    // Crear red y zona
    const red1 = crearRed("LAN", "#00FF00");
    crearZona(1, "Zona-Interna", [red1]);

    const admin = em.agregarEntidad();
    em.agregarComponente(admin, 
      new DispositivoComponent("admin1", "Linux", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, [red1])
    );

    const user = em.agregarEntidad();
    em.agregarComponente(user,
      new DispositivoComponent("user1", "Windows", "x86",
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, [red1])
    );

    const servidorExterno = em.agregarEntidad();
    em.agregarComponente(servidorExterno,
      new DispositivoComponent("servidor-externo", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL, [])
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL, [red1])
    );
    
    // Firewall: Bloquea SSH excepto para admin1 (SALIENTE)
    const firewallConfig = new FirewallBuilder()
      .setPoliticaPorDefecto('PERMITIR')
      .agregarReglaGlobal(TipoProtocolo.SSH, 'DENEGAR', 'AMBAS')
      .agregarExcepcion(TipoProtocolo.SSH, 'admin1', 'PERMITIR', 'SALIENTE')
      .build();
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig));

    // admin1 → externo: PERMITIDO (excepción)
    const resultadoAdmin = sistema.enviarTrafico(admin, servidorExterno, TipoProtocolo.SSH, null);
    expect(resultadoAdmin).toBe(true);

    // user1 → externo: BLOQUEADO (regla global)
    const resultadoUser = sistema.enviarTrafico(user, servidorExterno, TipoProtocolo.SSH, null);
    expect(resultadoUser).toBe(false);
  });

  test("Caso 5: Con excepción donde NO PERMITE el tráfico (lista negra)", () => {
    // Crear red y zona
    const red1 = crearRed("LAN", "#00FF00");
    crearZona(1, "Zona-Interna", [red1]);

    const pcSeguro = em.agregarEntidad();
    em.agregarComponente(pcSeguro, 
      new DispositivoComponent("pc-seguro", "Windows", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, [red1])
    );

    const malwarePc = em.agregarEntidad();
    em.agregarComponente(malwarePc,
      new DispositivoComponent("malware-pc", "Windows", "x86",
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.COMPROMETIDO, [red1])
    );

    const servidorExterno = em.agregarEntidad();
    em.agregarComponente(servidorExterno,
      new DispositivoComponent("servidor-externo", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL, [])
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL, [red1])
    );
    
    // Firewall: Permite HTTPS excepto para malware-pc (SALIENTE)
    const firewallConfig = new FirewallBuilder()
      .setPoliticaPorDefecto('PERMITIR')
      .agregarExcepcion(TipoProtocolo.WEB_SERVER_SSL, 'malware-pc', 'DENEGAR', 'SALIENTE')
      .build();
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig));

    // pc-seguro → externo: PERMITIDO (política por defecto)
    const resultadoPcSeguro = sistema.enviarTrafico(pcSeguro, servidorExterno, TipoProtocolo.WEB_SERVER_SSL, null);
    expect(resultadoPcSeguro).toBe(true);

    // malware-pc → externo: BLOQUEADO (excepción)
    const resultadoMalware = sistema.enviarTrafico(malwarePc, servidorExterno, TipoProtocolo.WEB_SERVER_SSL, null);
    expect(resultadoMalware).toBe(false);
  });

  test("Caso 6: Permitir tráfico interno pero NO externo", () => {
    // Crear red y zona
    const red1 = crearRed("LAN", "#00FF00");
    crearZona(1, "Zona-Interna", [red1]);

    // Dispositivos internos
    const pc1 = em.agregarEntidad();
    em.agregarComponente(pc1, 
      new DispositivoComponent("pc1", "Windows", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, [red1])
    );

    const server1 = em.agregarEntidad();
    em.agregarComponente(server1,
      new DispositivoComponent("server1", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL, [red1])
    );

    // Dispositivo externo
    const servidorExterno = em.agregarEntidad();
    em.agregarComponente(servidorExterno,
      new DispositivoComponent("servidor-externo", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL, [])
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL, [red1])
    );
    
    // Firewall: Bloquea tráfico saliente
    const firewallConfig = new FirewallBuilder()
      .setPoliticaPorDefecto('DENEGAR')
      .setPoliticaSaliente('DENEGAR')
      .build();
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig));

    // pc1 → server1: INTERNO → PERMITIDO (no pasa por firewall)
    const resultadoInterno = sistema.enviarTrafico(pc1, server1, TipoProtocolo.SSH, null);
    expect(resultadoInterno).toBe(true);

    // pc1 → externo: SALIENTE → BLOQUEADO (política saliente)
    const resultadoExterno = sistema.enviarTrafico(pc1, servidorExterno, TipoProtocolo.SSH, null);
    expect(resultadoExterno).toBe(false);
  });

  test("Direction TO (ENTRANTE): Bloquea tráfico desde Internet hacia red interna", () => {
    // Crear red y zona
    const red1 = crearRed("LAN", "#00FF00");
    crearZona(1, "Zona-Interna", [red1]);

    const pcInterno = em.agregarEntidad();
    em.agregarComponente(pcInterno, 
      new DispositivoComponent("pc-interno", "Windows", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, [red1])
    );

    const atacanteExterno = em.agregarEntidad();
    em.agregarComponente(atacanteExterno,
      new DispositivoComponent("atacante-externo", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL, [])
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL, [red1])
    );
    
    // Firewall: Bloquea SSH entrante (Direction: TO)
    const firewallConfig = new FirewallBuilder()
      .setPoliticaPorDefecto('PERMITIR')
      .agregarReglaGlobal(TipoProtocolo.SSH, 'DENEGAR', 'ENTRANTE')
      .build();
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig));

    // Externo → interno: BLOQUEADO (regla ENTRANTE)
    const resultadoEntrante = sistema.enviarTrafico(atacanteExterno, pcInterno, TipoProtocolo.SSH, null);
    expect(resultadoEntrante).toBe(false);

    // Interno → externo: PERMITIDO (regla solo aplica a ENTRANTE)
    const resultadoSaliente = sistema.enviarTrafico(pcInterno, atacanteExterno, TipoProtocolo.SSH, null);
    expect(resultadoSaliente).toBe(true);
  });

  test("Múltiples protocolos denegados (múltiples checkboxes marcados)", () => {
    // Crear red y zona
    const red1 = crearRed("LAN", "#00FF00");
    crearZona(1, "Zona-Interna", [red1]);

    const pcInterno = em.agregarEntidad();
    em.agregarComponente(pcInterno, 
      new DispositivoComponent("pc-interno", "Windows", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, [red1])
    );

    const servidorExterno = em.agregarEntidad();
    em.agregarComponente(servidorExterno,
      new DispositivoComponent("servidor-externo", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL, [])
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL, [red1])
    );
    
    // Firewall: Usuario marca SSH, FTP y TELNET como denegados
    const firewallConfig = new FirewallBuilder()
      .setPoliticaPorDefecto('PERMITIR')
      .agregarReglasGlobales(
        [TipoProtocolo.SSH, TipoProtocolo.FTP, TipoProtocolo.TELNET],
        'DENEGAR',
        'AMBAS'
      )
      .build();
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig));

    // Los 3 protocolos deben estar bloqueados
    expect(sistema.enviarTrafico(pcInterno, servidorExterno, TipoProtocolo.SSH, null)).toBe(false);
    expect(sistema.enviarTrafico(pcInterno, servidorExterno, TipoProtocolo.FTP, null)).toBe(false);
    expect(sistema.enviarTrafico(pcInterno, servidorExterno, TipoProtocolo.TELNET, null)).toBe(false);

    // HTTP sin marcar: PERMITIDO
    expect(sistema.enviarTrafico(pcInterno, servidorExterno, TipoProtocolo.WEB_SERVER, null)).toBe(true);
  });

  test("Botón DENY ALL: Marca todos los checkboxes como denegados (ambas direcciones)", () => {
    // Crear red y zona
    const red1 = crearRed("LAN", "#00FF00");
    crearZona(1, "Zona-Interna", [red1]);

    const pcInterno = em.agregarEntidad();
    em.agregarComponente(pcInterno, 
      new DispositivoComponent("pc-interno", "Windows", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, [red1])
    );

    const servidorExterno = em.agregarEntidad();
    em.agregarComponente(servidorExterno,
      new DispositivoComponent("servidor-externo", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL, [])
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL, [red1])
    );
    
    // Firewall: Usuario hace click en "Deny All" 
    const firewallConfig = new FirewallBuilder()
      .setPoliticaPorDefecto('PERMITIR')
      .agregarReglasGlobales(
        [
          TipoProtocolo.SSH,
          TipoProtocolo.FTP,
          TipoProtocolo.TELNET,
          TipoProtocolo.WEB_SERVER,
          TipoProtocolo.WEB_SERVER_SSL,
        ],
        'DENEGAR',
        'AMBAS' // ← Bloquea en ambas direcciones
      )
      .build();
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig));

    expect(sistema.enviarTrafico(pcInterno, servidorExterno, TipoProtocolo.SSH, null)).toBe(false);
    expect(sistema.enviarTrafico(pcInterno, servidorExterno, TipoProtocolo.WEB_SERVER, null)).toBe(false);
    expect(sistema.enviarTrafico(servidorExterno, pcInterno, TipoProtocolo.FTP, null)).toBe(false);
  });

  test("Botón PERMIT ALL: Permite todo el tráfico por defecto", () => {
    // Crear red y zona
    const red1 = crearRed("LAN", "#00FF00");
    crearZona(1, "Zona-Interna", [red1]);

    const pcInterno = em.agregarEntidad();
    em.agregarComponente(pcInterno, 
      new DispositivoComponent("pc-interno", "Windows", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, [red1])
    );

    const servidorExterno = em.agregarEntidad();
    em.agregarComponente(servidorExterno,
      new DispositivoComponent("servidor-externo", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL, [])
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL, [red1])
    );
    
    // Firewall: Usuario hace click en "Permit All" (configuración de fábrica)
    const firewallConfig = new FirewallBuilder()
      .setPoliticaPorDefecto('PERMITIR')
      .build();
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig));

    // TODO debe estar permitido
    expect(sistema.enviarTrafico(pcInterno, servidorExterno, TipoProtocolo.SSH, null)).toBe(true);
    expect(sistema.enviarTrafico(pcInterno, servidorExterno, TipoProtocolo.WEB_SERVER, null)).toBe(true);
    expect(sistema.enviarTrafico(servidorExterno, pcInterno, TipoProtocolo.FTP, null)).toBe(true);
  });

  test("Regla con dirección específica: SALIENTE permite, ENTRANTE deniega el mismo protocolo", () => {
    // Crear red y zona
    const red1 = crearRed("LAN", "#00FF00");
    crearZona(1, "Zona-Interna", [red1]);

    const serverDmz = em.agregarEntidad();
    em.agregarComponente(serverDmz, 
      new DispositivoComponent("server-dmz", "Linux", "x86", 
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL, [red1])
    );

    const clienteExterno = em.agregarEntidad();
    em.agregarComponente(clienteExterno,
      new DispositivoComponent("cliente-externo", "Windows", "x86",
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, [])
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL, [red1])
    );
    
    // Firewall: HTTP saliente permitido, HTTP entrante denegado
    const firewallConfig = new FirewallBuilder()
      .setPoliticaPorDefecto('DENEGAR')
      .agregarReglaGlobal(TipoProtocolo.WEB_SERVER, 'PERMITIR', 'SALIENTE')
      .agregarReglaGlobal(TipoProtocolo.WEB_SERVER, 'DENEGAR', 'ENTRANTE')
      .build();
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig));

    // server-dmz → externo: PERMITIDO (regla SALIENTE)
    const resultadoSaliente = sistema.enviarTrafico(serverDmz, clienteExterno, TipoProtocolo.WEB_SERVER, null);
    expect(resultadoSaliente).toBe(true);

    // externo → server-dmz: BLOQUEADO (regla ENTRANTE)
    const resultadoEntrante = sistema.enviarTrafico(clienteExterno, serverDmz, TipoProtocolo.WEB_SERVER, null);
    expect(resultadoEntrante).toBe(false);
  });

  test("Firewall deshabilitado: permite todo incluso con reglas de DENEGAR", () => {
    // Crear red y zona
    const red1 = crearRed("LAN", "#00FF00");
    crearZona(1, "Zona-Interna", [red1]);

    const pcInterno = em.agregarEntidad();
    em.agregarComponente(pcInterno, 
      new DispositivoComponent("pc-interno", "Windows", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, [red1])
    );

    const servidorExterno = em.agregarEntidad();
    em.agregarComponente(servidorExterno,
      new DispositivoComponent("servidor-externo", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL, [])
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL, [red1])
    );
    
    // Firewall DESHABILITADO con reglas que normalmente bloquearían
    const firewallConfig = new FirewallBuilder()
      .setHabilitado(false)
      .setPoliticaPorDefecto('DENEGAR')
      .agregarReglaGlobal(TipoProtocolo.SSH, 'DENEGAR', 'AMBAS')
      .build();
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig));

    // TODO debe pasar porque el firewall está deshabilitado
    expect(sistema.enviarTrafico(pcInterno, servidorExterno, TipoProtocolo.SSH, null)).toBe(true);
    expect(sistema.enviarTrafico(pcInterno, servidorExterno, TipoProtocolo.FTP, null)).toBe(true);
  });

  test("DOS ZONAS comunicándose a través de Internet: Zona A → Internet → Zona B", () => {
    // Crear redes y zonas
    const redMadrid = crearRed("LAN-Madrid", "#FF0000");
    const zonaMadrid = crearZona(1, "Zona-Madrid", [redMadrid]);
    
    const redBarcelona = crearRed("LAN-Barcelona", "#0000FF");
    const zonaBarcelona = crearZona(2, "Zona-Barcelona", [redBarcelona]);

    // ZONA A: Edificio en Madrid
    const pcZonaA = em.agregarEntidad();
    em.agregarComponente(pcZonaA, 
      new DispositivoComponent("pc-madrid", "Windows", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL, [redMadrid])
    );

    const routerZonaA = em.agregarEntidad();
    em.agregarComponente(routerZonaA, 
      new DispositivoComponent("router-madrid", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL, [redMadrid])
    );
    
    // Router Madrid: conectado a internet, firewall ACTIVADO
    const firewallMadrid = new FirewallBuilder()
      .setHabilitado(true)
      .setPoliticaPorDefecto('PERMITIR')
      .agregarReglaGlobal(TipoProtocolo.SSH, 'DENEGAR', 'SALIENTE') // Bloquea SSH saliente
      .build();
    
    em.agregarComponente(routerZonaA, new RouterComponent(true, firewallMadrid));

    // ZONA B: Edificio en Barcelona
    const serverZonaB = em.agregarEntidad();
    em.agregarComponente(serverZonaB,
      new DispositivoComponent("server-barcelona", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL, [redBarcelona])
    );

    const routerZonaB = em.agregarEntidad();
    em.agregarComponente(routerZonaB, 
      new DispositivoComponent("router-barcelona", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL, [redBarcelona])
    );
    
    // Router Barcelona: conectado a internet, firewall ACTIVADO
    const firewallBarcelona = new FirewallBuilder()
      .setHabilitado(true)
      .setPoliticaPorDefecto('PERMITIR')
      .agregarReglaGlobal(TipoProtocolo.TELNET, 'DENEGAR', 'ENTRANTE') // Bloquea TELNET entrante
      .build();
    
    em.agregarComponente(routerZonaB, new RouterComponent(true, firewallBarcelona));

    // CASO 1: PC Madrid → Server Barcelona con WEB_SERVER
    // - Pasa por router-madrid (saliente): PERMITIDO (no hay regla para WEB)
    // - Viaja por Internet
    // - Pasa por router-barcelona (entrante): PERMITIDO (no hay regla para WEB)
    const resultadoWEB = sistema.enviarTrafico(pcZonaA, serverZonaB, TipoProtocolo.WEB_SERVER, null);
    expect(resultadoWEB).toBe(true);

    // CASO 2: PC Madrid → Server Barcelona con SSH
    // - Pasa por router-madrid (saliente): BLOQUEADO (regla SSH SALIENTE DENEGAR)
    const resultadoSSH = sistema.enviarTrafico(pcZonaA, serverZonaB, TipoProtocolo.SSH, null);
    expect(resultadoSSH).toBe(false);

    // CASO 3: Server Barcelona → PC Madrid con TELNET
    // - Pasa por router-barcelona (saliente): PERMITIDO (regla solo aplica a ENTRANTE)
    // - Viaja por Internet
    // - Pasa por router-madrid (entrante): PERMITIDO (no hay regla para TELNET)
    const resultadoTELNET = sistema.enviarTrafico(serverZonaB, pcZonaA, TipoProtocolo.TELNET, null);
    expect(resultadoTELNET).toBe(true);

    // CASO 4: PC Madrid → Server Barcelona con TELNET
    // - Pasa por router-madrid (saliente): PERMITIDO
    // - Viaja por Internet
    // - Pasa por router-barcelona (entrante): BLOQUEADO (regla TELNET ENTRANTE DENEGAR)
    const resultadoTELNETEntrante = sistema.enviarTrafico(pcZonaA, serverZonaB, TipoProtocolo.TELNET, null);
    expect(resultadoTELNETEntrante).toBe(false);
  });

  
});


