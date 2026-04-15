import { AccionesRealizables, ObjetosManejables } from "../../types/AccionesEnums";
import {
  EstadoAtaqueDispositivo,
  Mueble,
  NivelConcienciaSeguridad,
  TipoActivo,
  TipoDispositivo,
  TipoEvento,
  TipoProteccionVPN,
} from "../../types/DeviceEnums";
import { ColoresRed } from "../colores";

/**
 * Escenario 2 — Criptografía: Firma Digital y Comunicación Segura
 * Capítulo 2 del sílabo: Fundamentos básicos de criptografía.
 *
 * Objetivo didáctico:
 *   - Comprender firmas digitales y verificación con clave pública (PKI).
 *   - Detectar documentos alterados (integridad comprometida).
 *   - Configurar comunicación cifrada mediante VPN (encriptación simétrica/asimétrica en práctica).
 *
 * Dificultad: ★★☆☆☆ (Fácil-Medio)
 *
 * Layout:
 * ╔══════════════════════════════╗   ╔═══════════════════════╗
 * ║  Zona 1 — Bufete Legal      ║   ║  Zona 2 — Cliente     ║
 * ║  ┌────────────────────────┐  ║   ║  ┌─────────────────┐  ║
 * ║  │ PC Abogado (docs+keys)│  ║   ║  │ PC Cliente       │  ║
 * ║  │ PC Asistente           │  ║   ║  │ Router Cliente   │  ║
 * ║  │ Router Bufete          │  ║   ║  └─────────────────┘  ║
 * ║  │ VPN Gateway Bufete     │  ║   ╚═══════════════════════╝
 * ║  └────────────────────────┘  ║
 * ╚══════════════════════════════╝
 */
export const escenarioCriptografia: unknown = {
  id: 2,
  slug: "criptografia",
  titulo: "Criptografía: Firma Digital y Comunicación Segura",
  categoria: "Cap. 2 — Criptografía",
  descripcion:
    "El bufete legal Mendoza & Asociados recibe contratos firmados digitalmente por sus clientes. " +
    "Deberás verificar la autenticidad de documentos mediante firmas digitales y claves públicas (PKI), " +
    "detectar un documento que ha sido alterado, y establecer un canal cifrado (VPN) para futuras comunicaciones.",
  presupuestoInicial: 1500,
  ataques: [],
  eventos: [
    // ── FASE 1: Verificar documento legítimo ──
    {
      nombreEvento: "Verificar contrato original",
      tipoEvento: TipoEvento.VERIFICACION_FIRMA,
      tiempoNotificacion: 5,
      descripcion:
        "El cliente ha enviado un contrato firmado digitalmente al 'PC Abogado'. " +
        "Una FIRMA DIGITAL garantiza la INTEGRIDAD del documento (no fue alterado) y la AUTENTICIDAD del remitente. " +
        "Abre el 'PC Abogado', ve al verificador de firmas y verifica el 'Contrato Comercial' " +
        "usando la clave pública del cliente. Debes emitir un veredicto sobre la autenticidad del documento " +
        "según los hashes resultantes.",
      fase: 1,
      infoAdicional: {
        nombreDocumento: "Contrato Comercial",
        nombreFirma: "Firma Contrato Comercial",
        nombreClave: "Clave_Publica_Cliente",
        veredicto: true,
      },
    },
    {
      nombreEvento: "Completación Fase 1",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 20,
      descripcion:
        "¡Correcto! La firma digital es válida: el hash del documento coincide con el hash descifrado de la firma " +
        "usando la clave pública del cliente. Esto confirma que el documento no fue modificado (Integridad) " +
        "y que fue firmado por el cliente legítimo (No Repudio).",
      fase: 1,
    },
    // ── FASE 2: Detectar documento alterado ──
    {
      nombreEvento: "Detectar factura alterada",
      tipoEvento: TipoEvento.VERIFICACION_FIRMA,
      tiempoNotificacion: 25,
      descripcion:
        "Se recibió una factura supuestamente firmada por un proveedor. Sin embargo, hay sospechas de que " +
        "el documento fue ALTERADO después de ser firmado (ataque a la Integridad). " +
        "Verifica la 'Factura Proveedor' con la clave pública del proveedor. " +
        "De igual forma, emite un veredicto según los los hashes resultantes.",
      fase: 2,
      infoAdicional: {
        nombreDocumento: "Factura Proveedor",
        nombreFirma: "Firma Factura Proveedor",
        nombreClave: "Clave_Publica_Proveedor",
        veredicto: false,
      },
    },
    {
      nombreEvento: "Completación Fase 2",
      tipoEvento: TipoEvento.COMPLETACION_FASE,
      tiempoNotificacion: 40,
      descripcion:
        "¡Bien detectado! Los hashes no coinciden: el documento fue alterado después de firmarse. " +
        "Esto demuestra la importancia de las funciones hash criptográficas: cualquier cambio, " +
        "por mínimo que sea, produce un hash completamente diferente. " +
        "Ahora establezcamos un canal seguro para futuras comunicaciones.",
      fase: 2,
    },
    // ── FASE 3: VPN cifrada ──
    {
      nombreEvento: "Establecer canal cifrado con cliente",
      tipoEvento: TipoEvento.CONEXION_VPN,
      tiempoNotificacion: 45,
      descripcion:
        "Para proteger las comunicaciones futuras, configura un túnel VPN cifrado entre el bufete y el cliente. " +
        "La VPN utiliza criptografía para crear un canal seguro: la opción 'Encriptar y Autenticar' (EA) " +
        "combina encriptación simétrica (para velocidad) con autenticación asimétrica (para verificar identidad). " +
        "Configura el 'VPN Gateway Bufete' y el 'PC Cliente' con protección EA para que el cliente pueda establecer "+
        "una conexión con la computadora del abogado.",
      fase: 3,
      infoAdicional: {
        gateway: {
          lanLocal: "LAN-Bufete",
          hostLan: "PC Abogado",
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Cliente-Externo",
          hostRemoto: "PC Cliente",
        },
        cliente: {
          proteccion: TipoProteccionVPN.EA,
          dominioRemoto: "Bufete-Mendoza",
          hostRemoto: "PC Abogado",
        },
      },
    },
    {
      nombreEvento: "Completación Escenario",
      tipoEvento: TipoEvento.COMPLETACION_ESCENARIO,
      tiempoNotificacion: 60,
      descripcion:
        "¡Felicidades! Has aplicado conceptos de criptografía: verificación de firmas digitales, " +
        "detección de documentos alterados mediante funciones hash, y comunicación cifrada con VPN. " +
        "Estos son los pilares de la seguridad criptográfica moderna.",
      fase: 3,
    },
  ],
  accionesEsperadas: [
    {
      accion: AccionesRealizables.AGREGAR,
      objeto: ObjetosManejables.APLICACION,
      inicioTiempoEsperado: 5,
      finTiempoEsperado: 15,
      val: {
        nombreDispositivo:"PC Abogado",
        aplicacionAgregada:"FirmaChecker"
      }
    },
    {
      accion: AccionesRealizables.AGREGAR,
      objeto: ObjetosManejables.VEREDICTO_FIRMA_DIGITAL,
      inicioTiempoEsperado: 5,
      finTiempoEsperado: 15,
      val: {
        nombreDocumento: "Contrato Comercial",
        nombreFirma: "Firma Contrato Comercial",
        nombreClave: "Clave_Publica_Cliente",
        veredicto: true
      }
    },
    {
      accion: AccionesRealizables.AGREGAR,
      objeto: ObjetosManejables.VEREDICTO_FIRMA_DIGITAL,
      inicioTiempoEsperado: 25,
      finTiempoEsperado: 35,
      val: {
        nombreDocumento: "Factura Proveedor",
        nombreFirma: "Firma Factura Proveedor",
        nombreClave: "Clave_Publica_Proveedor",
        veredicto: false
      }
    },
    {
      accion: AccionesRealizables.AGREGAR,
      objeto: ObjetosManejables.PERFIL_VPN_GATEWAY,
      inicioTiempoEsperado: 45,
      finTiempoEsperado: 55,
      val: {
        nombreVPNGateway: "VPN Gateway Bufete",
        lanLocal: "LAN-Bufete",
        hostLan: "PC Abogado",
        proteccion: TipoProteccionVPN.EA,
        dominioRemoto: "Cliente-Externo",
        hostRemoto: "PC Cliente"
      }
    },
    {
      accion: AccionesRealizables.AGREGAR,
      objeto: ObjetosManejables.PERFIL_CLIENTE_VPN,
      inicioTiempoEsperado: 45,
      finTiempoEsperado: 55,
      val: {
        nombreCliente: "PC Cliente",
        proteccion: TipoProteccionVPN.EA,
        dominioRemoto: "Bufete-Mendoza",
        hostRemoto: "PC Abogado"
      }
    },
  ],
  fases: [
    {
      id: 1,
      nombre: "Fase 1: Verificación de firma digital",
      descripcion:
        "Las FIRMAS DIGITALES usan criptografía asimétrica: el remitente firma con su clave privada " +
        "y el receptor verifica con la clave pública. Si los hashes coinciden, el documento es auténtico e íntegro.",
      faseActual: true,
      completada: false,
      objetivos: [
        {
          descripcion: "Verificar contrato original",
          completado: false,
        },
      ],
    },
    {
      id: 2,
      nombre: "Fase 2: Detección de alteración",
      descripcion:
        "Las FUNCIONES HASH son el corazón de las firmas digitales. Un cambio mínimo en el documento " +
        "produce un hash completamente diferente, permitiendo detectar cualquier alteración.",
      faseActual: false,
      completada: false,
      objetivos: [
        {
          descripcion: "Detectar factura alterada",
          completado: false,
        },
      ],
    },
    {
      id: 3,
      nombre: "Fase 3: Comunicación cifrada (VPN)",
      descripcion:
        "La encriptación protege los datos en tránsito. Una VPN con modo 'Encriptar y Autenticar' " +
        "combina cifrado simétrico (AES) para los datos con autenticación asimétrica (RSA/ECDSA) para la identidad.",
      faseActual: false,
      completada: false,
      objetivos: [
        {
          descripcion: "Establecer canal cifrado con cliente.",
          completado: false,
        },
      ],
    },
  ],
  zonas: [
    // ── ZONA 1: Bufete Legal ──
    {
      id: 1,
      nombre: "Bufete Legal Mendoza & Asociados",
      dominio: "Bufete-Mendoza",
      redes: [
        { nombre: "LAN-Bufete", color: ColoresRed.CIAN },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      personas: [
        {
          nombre: "Lic. Andrea Mendoza",
          correo: "andrea.mendoza@bufete.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.ALTA,
        },
        {
          nombre: "Sofía Herrera",
          correo: "sofia.herrera@bufete.com",
          nivelConcienciaSeguridad: NivelConcienciaSeguridad.MEDIA,
        },
      ],
      oficinas: [
        {
          id: 101,
          nombre: "Oficina de Abogados",
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
                  nombre: "PC Abogado",
                  sistemaOperativo: "Windows 11 Pro",
                  hardware: "Lenovo ThinkCentre M90q",
                  software: "Office 365, Adobe Acrobat, Verificador de Firmas",
                  posicion: { x: 0, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Lic. Andrea Mendoza",
                  activos: [
                    {
                      nombre: "Contrato Comercial",
                      contenido: "CONTRATO DE PRESTACIÓN DE SERVICIOS\nEntre las partes acuerdan los siguientes términos y condiciones para el proyecto de consultoría legal.",
                      tipo: TipoActivo.DOCUMENTO,
                      firma: "Firma Contrato Comercial",
                    },
                    {
                      nombre: "Firma Contrato Comercial",
                      contenido: "CONTRATO DE PRESTACIÓN DE SERVICIOS\nEntre las partes acuerdan los siguientes términos y condiciones para el proyecto de consultoría legal.",
                      tipo: TipoActivo.FIRMA_DIGITAL,
                      propietario: "Cliente-Ramos",
                    },
                    {
                      nombre: "Clave_Publica_Cliente",
                      tipo: TipoActivo.CLAVE_PUBLICA,
                      propietario: "Cliente-Ramos",
                    },
                    {
                      nombre: "Factura Proveedor",
                      contenido: "FACTURA #2024-0891\nMonto: $15,000.00\nConcepto: Servicios de asesoría ",
                      tipo: TipoActivo.DOCUMENTO,
                      firma: "Firma Factura Proveedor",
                    },
                    {
                      nombre: "Firma Factura Proveedor",
                      contenido: "FACTURA #2024-0891\nMonto: $5,000.00\nConcepto: Servicios de asesoría",
                      tipo: TipoActivo.FIRMA_DIGITAL,
                      propietario: "Proveedor-Tech",
                    },
                    {
                      nombre: "Clave_Publica_Proveedor",
                      tipo: TipoActivo.CLAVE_PUBLICA,
                      propietario: "Proveedor-Tech",
                    },
                  ],
                  redes: ["LAN-Bufete"],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: -3, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 1002,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "PC Asistente",
                  sistemaOperativo: "Windows 11 Pro",
                  hardware: "Dell OptiPlex 7090",
                  software: "Office 365, Sistema de Gestión Documental",
                  posicion: { x: -3, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Sofía Herrera",
                  activos: [],
                  redes: ["LAN-Bufete"],
                },
              ],
            },
            {
              id: 3,
              mueble: Mueble.MESA,
              posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [
                {
                  id: 1003,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Bufete",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ISR 4331",
                  software: "Routing, Firewall",
                  posicion: { x: 0, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["LAN-Bufete", "Internet"],
                  conectadoAInternet: true,
                },
              ],
            },
            {
              id: 4,
              mueble: Mueble.MESA,
              posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
              dispositivos: [
                {
                  id: 1004,
                  tipo: TipoDispositivo.VPN,
                  nombre: "VPN Gateway Bufete",
                  sistemaOperativo: "FortiOS",
                  hardware: "Fortinet FortiGate 100F",
                  software: "VPN, IDS",
                  posicion: { x: -3, y: 0, z: 2.5, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["LAN-Bufete", "Internet"],
                  conectadoAInternet: true,
                },
              ],
            },
          ],
        },
      ],
    },
    // ── ZONA 2: Oficina del Cliente ──
    {
      id: 2,
      nombre: "Oficina del Cliente",
      dominio: "Cliente-Externo",
      redes: [
        { nombre: "Red-Cliente", color: ColoresRed.VERDE },
        { nombre: "Internet", color: ColoresRed.ROJO },
      ],
      oficinas: [
        {
          id: 201,
          nombre: "Oficina Ramos Corp.",
          posicion: { x: 10, y: 0, z: 1, rotacionY: 0 },
          espacios: [
            {
              id: 1,
              mueble: Mueble.MESA,
              posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 2001,
                  tipo: TipoDispositivo.WORKSTATION,
                  nombre: "PC Cliente",
                  sistemaOperativo: "Windows 11 Pro",
                  hardware: "HP EliteDesk 800 G9",
                  software: "Office 365, VPN Client",
                  posicion: { x: -1, y: 0, z: 0, rotacionY: 0 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  personaEncargada: "Ing. Daniel Ramos",
                  activos: [],
                  redes: ["Red-Cliente"],
                },
              ],
            },
            {
              id: 2,
              mueble: Mueble.MESA,
              posicion: { x: 2, y: 0, z: 0, rotacionY: 0 },
              dispositivos: [
                {
                  id: 2002,
                  tipo: TipoDispositivo.ROUTER,
                  nombre: "Router Cliente",
                  sistemaOperativo: "Cisco IOS",
                  hardware: "Cisco ISR 1100",
                  software: "Routing, Firewall, NAT",
                  posicion: { x: 2, y: 0, z: 0, rotacionY: 180 },
                  estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                  activos: [],
                  redes: ["Red-Cliente", "Internet"],
                  conectadoAInternet: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
