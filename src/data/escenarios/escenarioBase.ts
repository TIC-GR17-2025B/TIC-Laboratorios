import { EstadoAtaqueDispositivo, Mueble, TipoAtaque, TipoDispositivo } from "../../types/DeviceEnums";

export const escenarioBase: any = {
  id: 2,
  titulo: "Infraestructura Corporativa Completa",
  descripcion:
    "Un escenario empresarial con múltiples zonas, oficinas y dispositivos diversos",
  presupuestoInicial: 1000,
  ataques: [
    {
      nombreAtaque: "ataque 1",
      tiempoNotificacion: 10,
      tipoAtaque: TipoAtaque.INFECCION_TROYANO,
      dispositivoAAtacar: "Computadora Jacob",
      descripcion: "Un dispositivo está por ser infectado con un troyano. Revisa la activación del antivirus para evitarlo.",
      fase: 1,
      condicionMitigacion: {
        accion: "Click",
        objeto: "Configuracion Workstation",
        tiempo: undefined,
        val: {
          nombreConfig: "Actualizaciones automáticas de antivirus",
          activado: true
        }
      }
    }
  ],
  fases: [
    {
      id: 1,
      nombre: "Fase 1",
      descripcion: "Mitigar el ataque de un troyano",
      faseActual: true
    }
  ],
  zonas: [
    {
      id: 1,
      nombre: "Edificio Principal - Piso 1",
      oficinas: [
        {
          id: 101,
          nombre: "Sala de Servidores",
          posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 1001,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Computadora Administrativa",
                  sistemaOperativo: "Ubuntu Server 22.04",
                  hardware: "Dell PowerEdge R750",
                  software: "Apache, MySQL, PHP",
                  posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 3, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 1003,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Computadora Jacob",
                  sistemaOperativo: "pfSense",
                  hardware: "Fortinet FortiGate 200F",
                  software: "IDS/IPS, VPN",
                  posicion: { x: 3, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL
                },
              ],
            },
          ],
        },
        {
          id: 102,
          nombre: "Departamento de IT",
          posicion: { x: 10, y: 0, z: 0, rotacionY: 90 },
          espacios: [
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 10, y: 0, z: 0, rotacionY: 90 },
              dispositivos: [
                {
                  id: 1005,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Workstation Admin 1",
                  sistemaOperativo: "Windows 11 Pro",
                  hardware: "Dell Precision 5820",
                  software: "Active Directory Tools, Monitoring",
                  posicion: { x: 10, y: 0, z: 0, rotacionY: 90 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL
                },
              ],
            },
            {
              id: 4,
              mueble: Mueble.MESA,
              posicion: { x: 12, y: 0, z: 0, rotacionY: 90 },
              dispositivos: [
                {
                  id: 1007,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Workstation Admin 2",
                  sistemaOperativo: "Ubuntu 22.04",
                  hardware: "HP Z4 G4",
                  software: "Docker, Kubernetes, Ansible",
                  posicion: { x: 12, y: 0, z: 0, rotacionY: 90 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      nombre: "Edificio Principal - Piso 2",
      oficinas: [
        {
          id: 201,
          nombre: "Departamento de Desarrollo",
          posicion: { x: 0, y: 5, z: 0, rotacionY: 0 },
          espacios: [
            {
              id: 5,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 5, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 2001,
                  tipo: TipoDispositivo.PORTATIL,
                  nombre: "Dev - Frontend Lead",
                  sistemaOperativo: "macOS Sonoma",
                  hardware: "MacBook Pro M3",
                  software: "VS Code, Node.js, React",
                  posicion: { x: 0, y: 5, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL
                },
                {
                  id: 2002,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Dev - Backend Senior",
                  sistemaOperativo: "Ubuntu 22.04",
                  hardware: "Custom Build i9-13900K",
                  software: "IntelliJ IDEA, Java 17, Spring Boot",
                  posicion: { x: 0, y: 5, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL
                },
              ],
            },
            {
              id: 6,
              mueble: Mueble.MESA,
              posicion: { x: 3, y: 5, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 2003,
                  tipo: TipoDispositivo.PORTATIL,
                  nombre: "Dev - Full Stack 1",
                  sistemaOperativo: "Windows 11 Pro",
                  hardware: "Dell XPS 15",
                  software: "VS Code, Docker, Git",
                  posicion: { x: 3, y: 5, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL
                },
                {
                  id: 2004,
                  tipo: TipoDispositivo.PORTATIL,
                  nombre: "Dev - Full Stack 2",
                  sistemaOperativo: "Ubuntu 22.04",
                  hardware: "Lenovo ThinkPad X1 Carbon",
                  software: "VS Code, Python, Django",
                  posicion: { x: 3, y: 5, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL
                },
              ],
            },
            {
              id: 7,
              mueble: Mueble.MESA,
              posicion: { x: 6, y: 5, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 2005,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Dev - DevOps Engineer",
                  sistemaOperativo: "Ubuntu 22.04",
                  hardware: "System76 Thelio",
                  software: "Terraform, Jenkins, GitLab CI/CD",
                  posicion: { x: 6, y: 5, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL
                },
              ],
            },
          ],
        },
        {
          id: 202,
          nombre: "Departamento de Seguridad",
          posicion: { x: 10, y: 5, z: 0, rotacionY: 90 },
          espacios: [
            {
              id: 8,
              mueble: Mueble.MESA,
              posicion: { x: 10, y: 5, z: 0, rotacionY: 90 },
              dispositivos: [
                {
                  id: 2006,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Security Analyst 1",
                  sistemaOperativo: "Kali Linux",
                  hardware: "Custom Build AMD Ryzen 9",
                  software: "Metasploit, Wireshark, Nmap",
                  posicion: { x: 10, y: 5, z: 0, rotacionY: 90 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL
                },
                {
                  id: 2007,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Security Analyst 2",
                  sistemaOperativo: "Windows 11 Pro",
                  hardware: "Dell Precision 7920",
                  software: "Splunk, QRadar, Nessus",
                  posicion: { x: 10, y: 5, z: 0, rotacionY: 90 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 3,
      nombre: "Edificio Anexo",
      oficinas: [
        {
          id: 301,
          nombre: "Oficina Administrativa",
          posicion: { x: 20, y: 0, z: 0, rotacionY: 180 },
          espacios: [
            {
              id: 9,
              mueble: Mueble.MESA,
              posicion: { x: 20, y: 0, z: 0, rotacionY: 180 },
              dispositivos: [
                {
                  id: 3002,
                  tipo: TipoDispositivo.PORTATIL,
                  nombre: "Admin - Gerente",
                  sistemaOperativo: "Windows 11 Pro",
                  hardware: "Microsoft Surface Laptop 5",
                  software: "Office 365, Teams, Power BI",
                  posicion: { x: 20, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL
                },
              ],
            },
            {
              id: 10,
              mueble: Mueble.MESA,
              posicion: { x: 22, y: 0, z: 0, rotacionY: 180 },
              dispositivos: [
                {
                  id: 3003,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "Admin - Contabilidad",
                  sistemaOperativo: "Windows 11 Pro",
                  hardware: "Dell OptiPlex 7090",
                  software: "QuickBooks, Excel, Sage",
                  posicion: { x: 22, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL
                },
              ],
            },
          ],
        },
        {
          id: 302,
          nombre: "Centro de Respaldo",
          posicion: { x: 25, y: 0, z: 0, rotacionY: 180 },
          espacios: [
            {
              id: 11,
              mueble: Mueble.RACK,
              posicion: { x: 25, y: 0, z: 0, rotacionY: 180 },
              dispositivos: [
                {
                  id: 3005,
                  tipo: TipoDispositivo.NAS,
                  nombre: "NAS Principal",
                  sistemaOperativo: "TrueNAS",
                  hardware: "Synology DS1821+",
                  software: "ZFS, Snapshots",
                  posicion: { x: 25, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
