import { describe, test, expect, beforeEach } from 'vitest';
import { ECSManager } from '../src/ecs/core';
import { SistemaRed } from '../src/ecs/systems';
import { TipoProtocolo } from '../src/types/TrafficEnums';
import { FirewallBuilder } from '../src/ecs/utils/FirewallBuilder';
import { 
  DispositivoComponent, 
  RouterComponent,
  RedComponent
} from '../src/ecs/components';
import { EstadoAtaqueDispositivo, TipoDispositivo } from '../src/types/DeviceEnums';
import type { Entidad } from '../src/ecs/core/Componente';

describe("SistemaFirewall - Casos Completos", () => {
  let em: ECSManager;
  let sistema: SistemaRed;

  beforeEach(() => {
    em = new ECSManager();
    sistema = new SistemaRed();
    em.agregarSistema(sistema);
  });

  // Helper para crear entidades de red
  function crearRed(nombre: string, color: string, dispositivos: string[], zona: string = ""): Entidad {
    const entidadRed = em.agregarEntidad();
    em.agregarComponente(entidadRed, new RedComponent(nombre, color, dispositivos, zona));
    return entidadRed;
  }


  test("Caso 3: No permitir tráfico con filtro activado (protocolo específico denegado)", () => {
    const pcInterno = em.agregarEntidad();
    em.agregarComponente(pcInterno, 
      new DispositivoComponent("pc-interno", "Windows", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL)
    );

    const servidorExterno = em.agregarEntidad();
    em.agregarComponente(servidorExterno,
      new DispositivoComponent("servidor-externo", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL)
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL)
    );
    
    // Configurar redes del router
    const red1 = crearRed("LAN", "#00FF00", ["pc-interno"]);
    
    // Firewall: Permite todo excepto SSH en AMBAS direcciones
    const firewallConfig = new FirewallBuilder()
      .setPoliticaPorDefecto('PERMITIR')
      .agregarReglaGlobal(TipoProtocolo.SSH, 'DENEGAR', 'AMBAS')
      .build();
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig, [red1]));

    // SSH: BLOQUEADO (regla global)
    const resultadoSSH = sistema.enviarTrafico("pc-interno", "servidor-externo", TipoProtocolo.SSH, null);
    expect(resultadoSSH).toBe(false);

    // HTTP: PERMITIDO (política por defecto)
    const resultadoHTTP = sistema.enviarTrafico("pc-interno", "servidor-externo", TipoProtocolo.WEB_SERVER, null);
    expect(resultadoHTTP).toBe(true);
  });

  test("Caso 4: Con excepción donde PERMITE el tráfico (lista blanca)", () => {
    const admin = em.agregarEntidad();
    em.agregarComponente(admin, 
      new DispositivoComponent("admin1", "Linux", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL)
    );

    const user = em.agregarEntidad();
    em.agregarComponente(user,
      new DispositivoComponent("user1", "Windows", "x86",
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL)
    );

    const servidorExterno = em.agregarEntidad();
    em.agregarComponente(servidorExterno,
      new DispositivoComponent("servidor-externo", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL)
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL)
    );
    
    // Configurar redes del router
    const red1 = crearRed("LAN", "#00FF00", ["admin1", "user1"]);
    
    // Firewall: Bloquea SSH excepto para admin1 (SALIENTE)
    const firewallConfig = new FirewallBuilder()
      .setPoliticaPorDefecto('PERMITIR')
      .agregarReglaGlobal(TipoProtocolo.SSH, 'DENEGAR', 'AMBAS')
      .agregarExcepcion(TipoProtocolo.SSH, 'admin1', 'PERMITIR', 'SALIENTE')
      .build();
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig, [red1]));

    // admin1 → externo: PERMITIDO (excepción)
    const resultadoAdmin = sistema.enviarTrafico("admin1", "servidor-externo", TipoProtocolo.SSH, null);
    expect(resultadoAdmin).toBe(true);

    // user1 → externo: BLOQUEADO (regla global)
    const resultadoUser = sistema.enviarTrafico("user1", "servidor-externo", TipoProtocolo.SSH, null);
    expect(resultadoUser).toBe(false);
  });

  test("Caso 5: Con excepción donde NO PERMITE el tráfico (lista negra)", () => {
    const pcSeguro = em.agregarEntidad();
    em.agregarComponente(pcSeguro, 
      new DispositivoComponent("pc-seguro", "Windows", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL)
    );

    const malwarePc = em.agregarEntidad();
    em.agregarComponente(malwarePc,
      new DispositivoComponent("malware-pc", "Windows", "x86",
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.COMPROMETIDO)
    );

    const servidorExterno = em.agregarEntidad();
    em.agregarComponente(servidorExterno,
      new DispositivoComponent("servidor-externo", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL)
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL)
    );
    
    // Configurar redes del router
    const red1 = crearRed("LAN", "#00FF00", ["pc-seguro", "malware-pc"]);
    
    // Firewall: Permite HTTPS excepto para malware-pc (SALIENTE)
    const firewallConfig = new FirewallBuilder()
      .setPoliticaPorDefecto('PERMITIR')
      .agregarExcepcion(TipoProtocolo.WEB_SERVER_SSL, 'malware-pc', 'DENEGAR', 'SALIENTE')
      .build();
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig, [red1]));

    // pc-seguro → externo: PERMITIDO (política por defecto)
    const resultadoPcSeguro = sistema.enviarTrafico("pc-seguro", "servidor-externo", TipoProtocolo.WEB_SERVER_SSL, null);
    expect(resultadoPcSeguro).toBe(true);

    // malware-pc → externo: BLOQUEADO (excepción)
    const resultadoMalware = sistema.enviarTrafico("malware-pc", "servidor-externo", TipoProtocolo.WEB_SERVER_SSL, null);
    expect(resultadoMalware).toBe(false);
  });

  test("Caso 6: Permitir tráfico interno pero NO externo", () => {
    // Dispositivos internos
    const pc1 = em.agregarEntidad();
    em.agregarComponente(pc1, 
      new DispositivoComponent("pc1", "Windows", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL)
    );

    const server1 = em.agregarEntidad();
    em.agregarComponente(server1,
      new DispositivoComponent("server1", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL)
    );

    // Dispositivo externo
    const servidorExterno = em.agregarEntidad();
    em.agregarComponente(servidorExterno,
      new DispositivoComponent("servidor-externo", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL)
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL)
    );
    
    // Configurar redes del router
    const red1 = crearRed("LAN", "#00FF00", ["pc1", "server1"]);
    
    // Firewall: Bloquea tráfico saliente
    const firewallConfig = new FirewallBuilder()
      .setPoliticaPorDefecto('DENEGAR')
      .setPoliticaSaliente('DENEGAR')
      .build();
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig, [red1]));

    // pc1 → server1: INTERNO → PERMITIDO (no pasa por firewall)
    const resultadoInterno = sistema.enviarTrafico("pc1", "server1", TipoProtocolo.SSH, null);
    expect(resultadoInterno).toBe(true);

    // pc1 → externo: SALIENTE → BLOQUEADO (política saliente)
    const resultadoExterno = sistema.enviarTrafico("pc1", "servidor-externo", TipoProtocolo.SSH, null);
    expect(resultadoExterno).toBe(false);
  });

  test("Direction TO (ENTRANTE): Bloquea tráfico desde Internet hacia red interna", () => {
    const pcInterno = em.agregarEntidad();
    em.agregarComponente(pcInterno, 
      new DispositivoComponent("pc-interno", "Windows", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL)
    );

    const atacanteExterno = em.agregarEntidad();
    em.agregarComponente(atacanteExterno,
      new DispositivoComponent("atacante-externo", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL)
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL)
    );
    
    // Configurar redes del router
    const red1 = crearRed("LAN", "#00FF00", ["pc-interno"]);
    
    // Firewall: Bloquea SSH entrante (Direction: TO)
    const firewallConfig = new FirewallBuilder()
      .setPoliticaPorDefecto('PERMITIR')
      .agregarReglaGlobal(TipoProtocolo.SSH, 'DENEGAR', 'ENTRANTE')
      .build();
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig, [red1]));

    // Externo → interno: BLOQUEADO (regla ENTRANTE)
    const resultadoEntrante = sistema.enviarTrafico("atacante-externo", "pc-interno", TipoProtocolo.SSH, null);
    expect(resultadoEntrante).toBe(false);

    // Interno → externo: PERMITIDO (regla solo aplica a ENTRANTE)
    const resultadoSaliente = sistema.enviarTrafico("pc-interno", "atacante-externo", TipoProtocolo.SSH, null);
    expect(resultadoSaliente).toBe(true);
  });

  test("Múltiples protocolos denegados (múltiples checkboxes marcados)", () => {
    const pcInterno = em.agregarEntidad();
    em.agregarComponente(pcInterno, 
      new DispositivoComponent("pc-interno", "Windows", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL)
    );

    const servidorExterno = em.agregarEntidad();
    em.agregarComponente(servidorExterno,
      new DispositivoComponent("servidor-externo", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL)
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL)
    );
    
    // Configurar redes del router
    const red1 = crearRed("LAN", "#00FF00", ["pc-interno"]);
    
    // Firewall: Usuario marca SSH, FTP y TELNET como denegados
    const firewallConfig = new FirewallBuilder()
      .setPoliticaPorDefecto('PERMITIR')
      .agregarReglasGlobales(
        [TipoProtocolo.SSH, TipoProtocolo.FTP, TipoProtocolo.TELNET],
        'DENEGAR',
        'AMBAS'
      )
      .build();
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig, [red1]));

    // Los 3 protocolos deben estar bloqueados
    expect(sistema.enviarTrafico("pc-interno", "servidor-externo", TipoProtocolo.SSH, null)).toBe(false);
    expect(sistema.enviarTrafico("pc-interno", "servidor-externo", TipoProtocolo.FTP, null)).toBe(false);
    expect(sistema.enviarTrafico("pc-interno", "servidor-externo", TipoProtocolo.TELNET, null)).toBe(false);

    // HTTP sin marcar: PERMITIDO
    expect(sistema.enviarTrafico("pc-interno", "servidor-externo", TipoProtocolo.WEB_SERVER, null)).toBe(true);
  });

  test("Botón DENY ALL: Marca todos los checkboxes como denegados (ambas direcciones)", () => {
    const pcInterno = em.agregarEntidad();
    em.agregarComponente(pcInterno, 
      new DispositivoComponent("pc-interno", "Windows", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL)
    );

    const servidorExterno = em.agregarEntidad();
    em.agregarComponente(servidorExterno,
      new DispositivoComponent("servidor-externo", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL)
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL)
    );
    
    // Configurar redes del router
    const red1 = crearRed("LAN", "#00FF00", ["pc-interno"]);
    
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
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig, [red1]));

    expect(sistema.enviarTrafico("pc-interno", "servidor-externo", TipoProtocolo.SSH, null)).toBe(false);
    expect(sistema.enviarTrafico("pc-interno", "servidor-externo", TipoProtocolo.WEB_SERVER, null)).toBe(false);
    expect(sistema.enviarTrafico("servidor-externo", "pc-interno", TipoProtocolo.FTP, null)).toBe(false);
  });

  test("Botón PERMIT ALL: Permite todo el tráfico por defecto", () => {
    const pcInterno = em.agregarEntidad();
    em.agregarComponente(pcInterno, 
      new DispositivoComponent("pc-interno", "Windows", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL)
    );

    const servidorExterno = em.agregarEntidad();
    em.agregarComponente(servidorExterno,
      new DispositivoComponent("servidor-externo", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL)
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL)
    );
    
    // Configurar redes del router
    const red1 = crearRed("LAN", "#00FF00", ["pc-interno"]);
    
    // Firewall: Usuario hace click en "Permit All" (configuración de fábrica)
    const firewallConfig = new FirewallBuilder()
      .setPoliticaPorDefecto('PERMITIR')
      .build();
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig, [red1]));

    // TODO debe estar permitido
    expect(sistema.enviarTrafico("pc-interno", "servidor-externo", TipoProtocolo.SSH, null)).toBe(true);
    expect(sistema.enviarTrafico("pc-interno", "servidor-externo", TipoProtocolo.WEB_SERVER, null)).toBe(true);
    expect(sistema.enviarTrafico("servidor-externo", "pc-interno", TipoProtocolo.FTP, null)).toBe(true);
  });

  test("Regla con dirección específica: SALIENTE permite, ENTRANTE deniega el mismo protocolo", () => {
    const serverDmz = em.agregarEntidad();
    em.agregarComponente(serverDmz, 
      new DispositivoComponent("server-dmz", "Linux", "x86", 
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL)
    );

    const clienteExterno = em.agregarEntidad();
    em.agregarComponente(clienteExterno,
      new DispositivoComponent("cliente-externo", "Windows", "x86",
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL)
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL)
    );
    
    // Configurar redes del router
    const red1 = crearRed("LAN", "#00FF00", ["server-dmz"]);
    
    // Firewall: HTTP saliente permitido, HTTP entrante denegado
    const firewallConfig = new FirewallBuilder()
      .setPoliticaPorDefecto('DENEGAR')
      .agregarReglaGlobal(TipoProtocolo.WEB_SERVER, 'PERMITIR', 'SALIENTE')
      .agregarReglaGlobal(TipoProtocolo.WEB_SERVER, 'DENEGAR', 'ENTRANTE')
      .build();
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig, [red1]));

    // server-dmz → externo: PERMITIDO (regla SALIENTE)
    const resultadoSaliente = sistema.enviarTrafico("server-dmz", "cliente-externo", TipoProtocolo.WEB_SERVER, null);
    expect(resultadoSaliente).toBe(true);

    // externo → server-dmz: BLOQUEADO (regla ENTRANTE)
    const resultadoEntrante = sistema.enviarTrafico("cliente-externo", "server-dmz", TipoProtocolo.WEB_SERVER, null);
    expect(resultadoEntrante).toBe(false);
  });

  test("Firewall deshabilitado: permite todo incluso con reglas de DENEGAR", () => {
    const pcInterno = em.agregarEntidad();
    em.agregarComponente(pcInterno, 
      new DispositivoComponent("pc-interno", "Windows", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL)
    );

    const servidorExterno = em.agregarEntidad();
    em.agregarComponente(servidorExterno,
      new DispositivoComponent("servidor-externo", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL)
    );

    const router = em.agregarEntidad();
    em.agregarComponente(router, 
      new DispositivoComponent("router1", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL)
    );
    
    // Configurar redes del router
    const red1 = crearRed("LAN", "#00FF00", ["pc-interno"]);
    
    // Firewall DESHABILITADO con reglas que normalmente bloquearían
    const firewallConfig = new FirewallBuilder()
      .setHabilitado(false)
      .setPoliticaPorDefecto('DENEGAR')
      .agregarReglaGlobal(TipoProtocolo.SSH, 'DENEGAR', 'AMBAS')
      .build();
    
    em.agregarComponente(router, new RouterComponent(true, firewallConfig, [red1]));

    // TODO debe pasar porque el firewall está deshabilitado
    expect(sistema.enviarTrafico("pc-interno", "servidor-externo", TipoProtocolo.SSH, null)).toBe(true);
    expect(sistema.enviarTrafico("pc-interno", "servidor-externo", TipoProtocolo.FTP, null)).toBe(true);
  });

  test("DOS ZONAS comunicándose a través de Internet: Zona A → Internet → Zona B", () => {
    // ZONA A: Edificio en Madrid
    const pcZonaA = em.agregarEntidad();
    em.agregarComponente(pcZonaA, 
      new DispositivoComponent("pc-madrid", "Windows", "x86", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL)
    );

    const routerZonaA = em.agregarEntidad();
    em.agregarComponente(routerZonaA, 
      new DispositivoComponent("router-madrid", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL)
    );
    
    // Configurar redes del router Madrid
    const redMadrid = crearRed("LAN-Madrid", "#FF0000", ["pc-madrid"], "Zona A");
    
    // Router Madrid: conectado a internet, firewall ACTIVADO
    const firewallMadrid = new FirewallBuilder()
      .setHabilitado(true)
      .setPoliticaPorDefecto('PERMITIR')
      .agregarReglaGlobal(TipoProtocolo.SSH, 'DENEGAR', 'SALIENTE') // Bloquea SSH saliente
      .build();
    
    em.agregarComponente(routerZonaA, new RouterComponent(true, firewallMadrid, [redMadrid]));

    // ZONA B: Edificio en Barcelona
    const serverZonaB = em.agregarEntidad();
    em.agregarComponente(serverZonaB,
      new DispositivoComponent("server-barcelona", "Linux", "x86",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL)
    );

    const routerZonaB = em.agregarEntidad();
    em.agregarComponente(routerZonaB, 
      new DispositivoComponent("router-barcelona", "Cisco", "hw", 
        TipoDispositivo.ROUTER, EstadoAtaqueDispositivo.NORMAL)
    );
    
    // Configurar redes del router Barcelona
    const redBarcelona = crearRed("LAN-Barcelona", "#0000FF", ["server-barcelona"], "Zona B");
    
    // Router Barcelona: conectado a internet, firewall ACTIVADO
    const firewallBarcelona = new FirewallBuilder()
      .setHabilitado(true)
      .setPoliticaPorDefecto('PERMITIR')
      .agregarReglaGlobal(TipoProtocolo.TELNET, 'DENEGAR', 'ENTRANTE') // Bloquea TELNET entrante
      .build();
    
    em.agregarComponente(routerZonaB, new RouterComponent(true, firewallBarcelona, [redBarcelona]));

    // CASO 1: PC Madrid → Server Barcelona con WEB_SERVER
    // - Pasa por router-madrid (saliente): PERMITIDO (no hay regla para WEB)
    // - Viaja por Internet
    // - Pasa por router-barcelona (entrante): PERMITIDO (no hay regla para WEB)
    const resultadoWEB = sistema.enviarTrafico("pc-madrid", "server-barcelona", TipoProtocolo.WEB_SERVER, null);
    expect(resultadoWEB).toBe(true);

    // CASO 2: PC Madrid → Server Barcelona con SSH
    // - Pasa por router-madrid (saliente): BLOQUEADO (regla SSH SALIENTE DENEGAR)
    const resultadoSSH = sistema.enviarTrafico("pc-madrid", "server-barcelona", TipoProtocolo.SSH, null);
    expect(resultadoSSH).toBe(false);

    // CASO 3: Server Barcelona → PC Madrid con TELNET
    // - Pasa por router-barcelona (saliente): PERMITIDO (regla solo aplica a ENTRANTE)
    // - Viaja por Internet
    // - Pasa por router-madrid (entrante): PERMITIDO (no hay regla para TELNET)
    const resultadoTELNET = sistema.enviarTrafico("server-barcelona", "pc-madrid", TipoProtocolo.TELNET, null);
    expect(resultadoTELNET).toBe(true);

    // CASO 4: PC Madrid → Server Barcelona con TELNET
    // - Pasa por router-madrid (saliente): PERMITIDO
    // - Viaja por Internet
    // - Pasa por router-barcelona (entrante): BLOQUEADO (regla TELNET ENTRANTE DENEGAR)
    const resultadoTELNETEntrante = sistema.enviarTrafico("pc-madrid", "server-barcelona", TipoProtocolo.TELNET, null);
    expect(resultadoTELNETEntrante).toBe(false);
  });

  
});


