// Tipos de protocolo de red
export enum TipoProtocolo {
  // Web
  WEB_SERVER = "WEB_SERVER",              
  WEB_SERVER_SSL = "WEB_SERVER_SSL",      
  
  // Email
  EMAIL_SERVER = "EMAIL_SERVER",           
  EMAIL_SERVER_SSL = "EMAIL_SERVER_SSL",   
  
  // Administración remota
  TELNET = "TELNET",                       
  SSH = "SSH",                             
  
  // Transferencia de archivos
  FTP = "FTP",                             
  
  // Bases de datos
  DATABASE = "DATABASE",                   
  
  // Directorio
  LDAP = "LDAP",                          
  LDAP_SSL = "LDAP_SSL",                  
  
  // Defensa (específicos del juego)
  DEFENSE_RAT = "DEFENSE_RAT",
  DEFENSE_4T = "DEFENSE_4T",
  
  // VPN
  VPN_GATEWAY = "VPN_GATEWAY",            
  
  // Servicios corporativos
  REPORTING = "REPORTING",                 
  MANAGEMENT = "MANAGEMENT",               
  NETWORK_FILE_SERVICE = "NETWORK_FILE_SERVICE", 
  MESSAGING = "MESSAGING"                  
}

// Información básica de un protocolo
 
export interface ProtocoloInfo {
  tipo: TipoProtocolo;
  puerto: number;
}

// Registro de tráfico de red
export interface RegistroTrafico {
  origen: string;
  destino: string;
  protocolo: TipoProtocolo;
}

// Registro de tráfico bloqueado por firewall
export interface RegistroFirewallBloqueado {
  origen: string;
  destino: string;
  protocolo: TipoProtocolo;
  mensaje: string;
  tipo: 'BLOQUEADO';
  razon?: string;
  entidadRouter?: number; // Entidad del router que bloqueó
  router?: string; // Nombre del router (calculado para UI)
}

// Registro de tráfico permitido por firewall
export interface RegistroFirewallPermitido {
  origen: string;
  destino: string;
  protocolo: TipoProtocolo;
  mensaje: string;
  tipo: 'PERMITIDO';
  entidadRouter?: number; // Entidad del router que permitió
  router?: string; // Nombre del router (calculado para UI)
}

// Registro de configuración del firewall (habilitado/deshabilitado)
export interface RegistroFirewallEstado {
  router: string;
  mensaje: string;
  tipo: 'HABILITADO' | 'DESHABILITADO';
}

// Registro cuando se agrega una regla al firewall
export interface RegistroFirewallRegla {
  router: string;
  mensaje: string;
  tipo: 'REGLA_AGREGADA';
  protocolo: TipoProtocolo;
  accion: 'PERMITIR' | 'DENEGAR';
  direccion: 'SALIENTE' | 'ENTRANTE' | 'AMBAS';
}

// Registro cuando se cambia la política por defecto
export interface RegistroFirewallPolitica {
  router: string;
  mensaje: string;
  tipo: 'POLITICA_CAMBIADA';
  politicaAnterior: 'PERMITIR' | 'DENEGAR';
  politicaNueva: 'PERMITIR' | 'DENEGAR';
}

// Catálogo de protocolos con sus puertos

export const PROTOCOLOS: Record<TipoProtocolo, ProtocoloInfo> = {
  [TipoProtocolo.WEB_SERVER]: {
    tipo: TipoProtocolo.WEB_SERVER,
    puerto: 80
  },
  [TipoProtocolo.WEB_SERVER_SSL]: {
    tipo: TipoProtocolo.WEB_SERVER_SSL,
    puerto: 443
  },
  [TipoProtocolo.EMAIL_SERVER]: {
    tipo: TipoProtocolo.EMAIL_SERVER,
    puerto: 25
  },
  [TipoProtocolo.EMAIL_SERVER_SSL]: {
    tipo: TipoProtocolo.EMAIL_SERVER_SSL,
    puerto: 465
  },
  [TipoProtocolo.TELNET]: {
    tipo: TipoProtocolo.TELNET,
    puerto: 23
  },
  [TipoProtocolo.SSH]: {
    tipo: TipoProtocolo.SSH,
    puerto: 22
  },
  [TipoProtocolo.FTP]: {
    tipo: TipoProtocolo.FTP,
    puerto: 21
  },
  [TipoProtocolo.DATABASE]: {
    tipo: TipoProtocolo.DATABASE,
    puerto: 3306
  },
  [TipoProtocolo.LDAP]: {
    tipo: TipoProtocolo.LDAP,
    puerto: 389
  },
  [TipoProtocolo.LDAP_SSL]: {
    tipo: TipoProtocolo.LDAP_SSL,
    puerto: 636
  },
  [TipoProtocolo.DEFENSE_RAT]: {
    tipo: TipoProtocolo.DEFENSE_RAT,
    puerto: 9000
  },
  [TipoProtocolo.DEFENSE_4T]: {
    tipo: TipoProtocolo.DEFENSE_4T,
    puerto: 9001
  },
  [TipoProtocolo.VPN_GATEWAY]: {
    tipo: TipoProtocolo.VPN_GATEWAY,
    puerto: 1194
  },
  [TipoProtocolo.REPORTING]: {
    tipo: TipoProtocolo.REPORTING,
    puerto: 514
  },
  [TipoProtocolo.MANAGEMENT]: {
    tipo: TipoProtocolo.MANAGEMENT,
    puerto: 161
  },
  [TipoProtocolo.NETWORK_FILE_SERVICE]: {
    tipo: TipoProtocolo.NETWORK_FILE_SERVICE,
    puerto: 445
  },
  [TipoProtocolo.MESSAGING]: {
    tipo: TipoProtocolo.MESSAGING,
    puerto: 5222
  }
};
