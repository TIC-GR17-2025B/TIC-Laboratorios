import {
    EstadoAtaqueDispositivo,
    TipoDispositivo,
    TipoEvento,
} from '../../../../../shared/types/DeviceEnums';

type RawData = Record<string, unknown>;

export function findInObj(obj: unknown, key: string): unknown[] | null {
    if (!obj || typeof obj !== 'object') return null;
    const record = obj as Record<string, unknown>;
    if (Array.isArray(record[key]) && (record[key] as unknown[]).length > 0) return record[key] as unknown[];
    for (const k of Object.keys(record)) {
        const res = findInObj(record[k], key);
        if (res) return res;
    }
    return null;
}

export function normalizarZonas(zonas: unknown[]): RawData[] {
    return JSON.parse(JSON.stringify(zonas)).map((z: RawData) => ({
        ...z,
        oficinas: (z.oficinas ?? []) as RawData[],
        espacios: (((z.oficinas ?? []) as RawData[]).flatMap((of: RawData) =>
            (of.espacios ?? []).map((es: RawData) => ({
                ...es,
                dispositivos: ((es.dispositivos ?? []) as RawData[]).map((d: RawData) => ({
                    ...d,
                    estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                })),
            }))
        )) as unknown[][],
    }));
}

export function inyectarRouterSiFalta(zonas: RawData[]): void {
    zonas.forEach((zona) => {
        let tieneRouter = false;
        const oficinas = (zona.oficinas ?? []) as RawData[];
        const primerEspacio = oficinas[0]?.espacios?.[0] as RawData | undefined;

        oficinas.forEach((ofi: RawData) => {
            const espacios = (ofi.espacios ?? []) as RawData[];
            espacios.forEach((esp: RawData) => {
                const dispositivos = (esp.dispositivos ?? []) as RawData[];
                dispositivos.forEach((disp: RawData) => {
                    const t = String(disp.tipo ?? '').toLowerCase();
                    if (t.includes('router') || t.includes('vpn')) tieneRouter = true;
                });
            });
        });

        const redes = (zona.redes ?? []) as (string | { nombre: string })[];
        const necesitaInternet = redes.some(
            (r) => (typeof r === 'string' && r === 'Internet') || r?.nombre === 'Internet'
        );

        if (necesitaInternet && !tieneRouter && primerEspacio) {
            console.warn(`Zona ${zona.nombre} sin router detectada. Inyectando Gateway.`);
            primerEspacio.dispositivos = (primerEspacio.dispositivos ?? []) as RawData[];
            (primerEspacio.dispositivos as RawData[]).push({
                id: 9990 + zona.id,
                nombre: `GW-${String(zona.nombre).substring(0, 3).toUpperCase()}`,
                tipo: TipoDispositivo.ROUTER,
                estadoAtaque: EstadoAtaqueDispositivo.NORMAL,
                redes: ['Internet', 'LAN-Interna'],
                posicion: { x: 0, y: 0, z: 0 },
            });
        }
    });
}

export function reconstruirFasesSiFaltan(
    fasesOriginales: unknown[],
    eventos: unknown[],
    ataques: unknown[],
    scenario: RawData
): RawData[] {
    if (fasesOriginales.length > 0) return fasesOriginales as RawData[];

    const idsDetectados = new Set<number>();
    [...eventos, ...ataques].forEach((item: unknown) => {
        const a = item as RawData;
        if (a.fase) idsDetectados.add(Number(a.fase));
    });

    if (idsDetectados.size > 0) {
        console.warn(`Reconstruyendo ${idsDetectados.size} fases desde eventos.`);
        return Array.from(idsDetectados).sort((a, b) => a - b).map((id) => ({
            id,
            nombre: id === 1 ? (scenario.titulo_desafio ?? scenario.nombre_desafio ?? 'Fase 1') : `Fase ${id}`,
            descripcion: id === 1 ? (scenario.descripcion_desafio ?? 'Análisis inicial') : `Misión ${id}`,
            objetivos: [],
        }));
    }

    if (scenario.titulo_desafio) {
        return [{
            id: 1,
            nombre: scenario.titulo_desafio,
            descripcion: scenario.descripcion_desafio ?? 'Desafío detectado',
            objetivos: [],
        }];
    }

    return [];
}

export function normalizarFases(fases: unknown[]): RawData[] {
    return fases.map((item: unknown, i: number) => {
        const f = item as RawData;
        return {
            id: f.id ?? i + 1,
            nombre: f.nombre ?? f.titulo_desafio ?? `Fase ${i + 1}`,
            descripcion: f.descripcion ?? f.descripcion_desafio ?? 'Análisis de seguridad',
            completada: false,
            faseActual: i === 0,
            objetivos: [] as unknown[],
        };
    });
}

export function validarTipoEvento(valor: string): TipoEvento | null {
    const valoresValidos = Object.values(TipoEvento);
    return valoresValidos.find(v => v.toLowerCase() === valor.toLowerCase().trim()) ?? null;
}

export function normalizarEvento(accion: RawData, faseId: number): void {
    accion.fase = Number(faseId);

    if (accion.nombreEvento) accion.nombreEvento = String(accion.nombreEvento).trim();
    if (accion.nombreAtaque) accion.nombreAtaque = String(accion.nombreAtaque).trim();

    if (!accion.descripcion || String(accion.descripcion).trim() === '') {
        accion.descripcion = accion.nombreEvento ?? accion.nombreAtaque ?? 'Incidente de seguridad.';
    }

    const info = accion.infoAdicional as RawData | undefined;
    if (info?.objeto === 'configuración workstation' && info.accion === 'ejecutar') {
        info.accion = 'click';
    }

    const cm = accion.condicionMitigacion as RawData | undefined;
    if (cm?.objeto === 'configuración workstation' && cm.accion === 'ejecutar') {
        cm.accion = 'click';
    }
    if (cm && cm.val && !Array.isArray(cm.val)) cm.val = [cm.val];

    if (info?.gateway) {
        const gateway = info.gateway as RawData;
        if (gateway.proteccion) {
            const p = String(gateway.proteccion).toUpperCase();
            gateway.proteccion = p.includes('ENCRIPTAR') || p.includes('EA') ? 'EA' : 'SOLO_A';
        }
    }
}

export function generarFirmaDuplicado(ev: RawData): string {
    const nombre = ev.nombreEvento ?? ev.nombreAtaque ?? '';
    const fase = ev.fase ?? 0;
    const tipo = ev.tipoEvento ?? 'ataque';
    return `${fase}-${tipo}-${nombre}`;
}

export function deduplicarEventos(eventos: RawData[]): RawData[] {
    const logLimpio: RawData[] = [];
    const textosVistos = new Set<string>();

    eventos.forEach((ev) => {
        const signature = generarFirmaDuplicado(ev);
        if (!textosVistos.has(signature)) {
            logLimpio.push(ev);
            textosVistos.add(signature);
        }
    });

    return logLimpio;
}

export function construirObjetivosVisuales(flujoFase: RawData[], faseObjetivos?: unknown[]): RawData[] {
    const objetivosVisuales: RawData[] = [];

    flujoFase.forEach((item) => {
        const esAtaque = item.nombreAtaque !== undefined && item.tipoEvento === undefined;
        const infoAdicional = item.infoAdicional as RawData | undefined;
        const esEventoObjetivo = item.tipoEvento !== undefined && infoAdicional?.esObjetivo === true;

        if (esAtaque || esEventoObjetivo) {
            objetivosVisuales.push({
                descripcion: String(item.nombreAtaque ?? item.nombreEvento).trim(),
                completado: false,
                esOpcional: false,
            });
        }
    });

    if (objetivosVisuales.length === 0 && faseObjetivos) {
        faseObjetivos.forEach((obj: RawData) => objetivosVisuales.push(obj));
    }

    return objetivosVisuales;
}
