import { useState, useEffect } from "react";
import styles from "../styles/ModalVerificacionFirma.module.css";
import DocumentIcon from "../../../common/icons/DocumentIcon";
import KeyIcon from "../../../common/icons/KeyIcon";
import { useEscenario } from "../../../common/contexts";
import { useECSSceneContext } from "../../escenarios-simulados/context/ECSSceneContext";
import { EscenarioController } from "../../../../ecs/controllers/EscenarioController";
import { ActivoComponent } from "../../../../ecs/components";
import type { Activo } from "../../../../types/EscenarioTypes";
import { TipoActivo } from "../../../../types/DeviceEnums";

type Paso = 1 | 2 | 3 | 4;

interface ClavePublica {
    id: string;
    nombre: string;
    activo: Activo;
}

interface DocumentoDisponible {
    id: string;
    nombre: string;
    activo: Activo;
}

function ModalVerificacionFirma() {
    const { dispositivoSeleccionado, entidadSeleccionadaId } = useEscenario();
    const { redController } = useECSSceneContext();
    const [pasoActual, setPasoActual] = useState<Paso>(1);
    const [documentosDisponibles, setDocumentosDisponibles] = useState<DocumentoDisponible[]>([]);
    const [documentoSeleccionado, setDocumentoSeleccionado] = useState<DocumentoDisponible | null>(null);
    const [hashDocumento, setHashDocumento] = useState<string>("");
    const [firmaActivo, setFirmaActivo] = useState<Activo | null>(null);
    const [clavesPublicasDisponibles, setClavesPublicasDisponibles] = useState<ClavePublica[]>([]);
    const [claveSeleccionada, setClaveSeleccionada] = useState<ClavePublica | null>(null);
    const [hashFirma, setHashFirma] = useState<string>("");
    const [veredicto, setVeredicto] = useState<"valido" | "invalido" | null>(null);

    // Cargar firma cifrada y claves públicas del dispositivo seleccionado desde el ECS
    useEffect(() => {
        if (!entidadSeleccionadaId || !redController) {
            return;
        }

        // Obtener el ActivoComponent directamente del ECS
        const activoComponent = redController.ecsManager.getComponentes(entidadSeleccionadaId)?.get(ActivoComponent);

        if (!activoComponent?.activos || activoComponent.activos.length === 0) {
            setDocumentosDisponibles([]);
            setClavesPublicasDisponibles([]);
            setFirmaActivo(null);
            return;
        }

        const activos = activoComponent.activos;

        // Buscar todos los documentos con firma
        const documentos = activos
            .filter((activo) => activo.tipo === TipoActivo.DOCUMENTO && activo.firma)
            .map((activo, index) => ({
                id: index.toString(),
                nombre: activo.nombre || `Documento ${index + 1}`,
                activo: activo,
            }));
        setDocumentosDisponibles(documentos);

        // Buscar la firma cifrada
        const firma = activos.find(
            (activo) => activo.tipo === TipoActivo.FIRMA_DIGITAL
        );
        setFirmaActivo(firma || null);

        // Obtener todas las claves públicas
        const claves = activos
            .filter((activo) => activo.tipo === TipoActivo.CLAVE_PUBLICA)
            .map((activo, index) => ({
                id: index.toString(),
                nombre: activo.nombre || `Clave Pública ${index + 1}`,
                activo: activo,
            }));
        setClavesPublicasDisponibles(claves);
    }, [entidadSeleccionadaId, redController]);

    const generarHashDocumento = async () => {
        if (!documentoSeleccionado?.activo?.contenido) return;

        const escenarioController = EscenarioController.getInstance();
        const hash = await escenarioController.getHashDocumento(documentoSeleccionado.activo.contenido);
        if (hash) {
            setHashDocumento(hash);
        }
    };

    const descifrarFirma = async () => {
        if (!claveSeleccionada || !firmaActivo) return;

        const escenarioController = EscenarioController.getInstance();
        const hash = await escenarioController.getHashFirma(firmaActivo, claveSeleccionada.activo);
        if (hash) {
            setHashFirma(hash);
        }
    };

    const emitirVeredicto = (esValido: boolean) => {
        setVeredicto(esValido ? "valido" : "invalido");

        // Registrar el veredicto en el sistema
        if (documentoSeleccionado && firmaActivo && claveSeleccionada) {
            const escenarioController = EscenarioController.getInstance();
            escenarioController.registrarVeredictoFirma({
                nombreDocumento: documentoSeleccionado.activo.nombre || "Documento",
                nombreFirma: firmaActivo.nombre || "Firma",
                nombreClave: claveSeleccionada.activo.nombre || "Clave",
                veredicto: esValido,
            });
        }
    };

    const reiniciar = () => {
        setPasoActual(1);
        setDocumentoSeleccionado(null);
        setHashDocumento("");
        setClaveSeleccionada(null);
        setHashFirma("");
        setVeredicto(null);
    };

    return (
        <div className={styles.contenedor}>
            {/* Indicador de pasos */}
            <div className={styles.indicadorPasos}>
                <div className={`${styles.paso} ${pasoActual >= 1 ? styles.pasoActivo : ""}`}>
                    <div className={styles.numeroPaso}>1</div>
                    <span>Documento</span>
                </div>
                <div className={styles.lineaConexion}></div>
                <div className={`${styles.paso} ${pasoActual >= 2 ? styles.pasoActivo : ""}`}>
                    <div className={styles.numeroPaso}>2</div>
                    <span>Generar Hash</span>
                </div>
                <div className={styles.lineaConexion}></div>
                <div className={`${styles.paso} ${pasoActual >= 3 ? styles.pasoActivo : ""}`}>
                    <div className={styles.numeroPaso}>3</div>
                    <span>Descifrar Firma</span>
                </div>
                <div className={styles.lineaConexion}></div>
                <div className={`${styles.paso} ${pasoActual >= 4 ? styles.pasoActivo : ""}`}>
                    <div className={styles.numeroPaso}>4</div>
                    <span>Comparar</span>
                </div>
            </div>

            {/* Contenido de los pasos */}
            <div className={styles.contenidoPaso}>
                {pasoActual === 1 && (
                    <div className={styles.pasoContenido}>
                        <h2 className={styles.tituloPaso}>
                            <DocumentIcon size={24} />
                            Seleccionar Documento
                        </h2>
                        <div className={styles.formulario}>
                            <div className={styles.campo}>
                                <label>Selecciona un Documento a verificar:</label>
                                <div className={styles.listaClavesPublicas}>
                                    {documentosDisponibles.length > 0 ? (
                                        documentosDisponibles.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className={`${styles.itemClave} ${documentoSeleccionado?.id === doc.id ? styles.claveSeleccionada : ""}`}
                                                onClick={() => setDocumentoSeleccionado(doc)}
                                            >
                                                <DocumentIcon size={20} />
                                                <span>{doc.nombre}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.sinClaves}>
                                            No hay documentos firmados en "{dispositivoSeleccionado?.nombre || 'este dispositivo'}".
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                className={styles.botonSiguiente}
                                onClick={() => setPasoActual(2)}
                                disabled={!documentoSeleccionado}
                            >
                                Siguiente: Generar Hash →
                            </button>
                        </div>
                    </div>
                )}

                {pasoActual === 2 && (
                    <div className={styles.pasoContenido}>
                        <h2 className={styles.tituloPaso}>
                            <DocumentIcon size={24} />
                            Generador de Hash
                        </h2>
                        <div className={styles.visualizacion}>
                            <div className={styles.documentoIcono}>
                                <DocumentIcon size={64} />
                                <span>{documentoSeleccionado?.nombre || "Documento"}</span>
                            </div>
                            <div className={styles.flecha}>→</div>
                            <div className={styles.hashResultado}>
                                <div className={styles.etiquetaHash}>SHA-256</div>
                                <div className={styles.etiquetaHash}>HASH</div>
                            </div>
                        </div>
                        {!hashDocumento ? (
                            <button className={styles.botonPrincipal} onClick={generarHashDocumento}>
                                Calcular Hash del Documento
                            </button>
                        ) : (
                            <>
                                <div className={styles.resultadoHash}>
                                    <span className={styles.etiquetaResultado}>HASH CALCULADO DEL DOCUMENTO</span>
                                    <div className={styles.hashValor}>{hashDocumento}</div>
                                </div>
                                <button
                                    className={styles.botonSiguiente}
                                    onClick={() => setPasoActual(3)}
                                >
                                    Siguiente: Descifrar Firma →
                                </button>
                            </>
                        )}
                    </div>
                )}

                {pasoActual === 3 && (
                    <div className={styles.pasoContenido}>
                        <h2 className={styles.tituloPaso}>
                            <KeyIcon size={24} />
                            Descifrador de Firma
                        </h2>
                        <div className={styles.visualizacion}>
                            <div className={styles.inputVisual}>
                                <div className={styles.icono}>🔒</div>
                                <span>FIRMA<br />CIFRADA</span>
                            </div>
                            <div className={styles.operador}>+</div>
                            <div className={styles.inputVisual}>
                                <KeyIcon size={32} />
                                <span>CLAVE<br />PÚBLICA</span>
                            </div>
                            <div className={styles.flecha}>→</div>
                            <div className={styles.outputVisual}>
                                <div className={styles.icono}>🔓</div>
                                <span>HASH<br />EXTRAÍDO</span>
                            </div>
                        </div>

                        <div className={styles.formulario}>
                            <div className={styles.campo}>
                                <label>Selecciona una Clave Pública:</label>
                                <div className={styles.listaClavesPublicas}>
                                    {clavesPublicasDisponibles.length > 0 ? (
                                        clavesPublicasDisponibles.map((clave) => (
                                            <div
                                                key={clave.id}
                                                className={`${styles.itemClave} ${claveSeleccionada?.id === clave.id ? styles.claveSeleccionada : ""
                                                    }`}
                                                onClick={() => setClaveSeleccionada(clave)}
                                            >
                                                <KeyIcon size={20} />
                                                <span>{clave.nombre}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.sinClaves}>
                                            No hay claves públicas en "{dispositivoSeleccionado?.nombre || 'este dispositivo'}".
                                            <br />
                                            <small style={{ opacity: 0.6, marginTop: '4px', display: 'block' }}>
                                                Selecciona la "Computadora Administrativa" en la pestaña de Dispositivos.
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!hashFirma ? (
                                <button
                                    className={styles.botonPrincipal}
                                    onClick={descifrarFirma}
                                    disabled={!firmaActivo || !claveSeleccionada}
                                >
                                    Descifrar y Extraer Hash
                                </button>
                            ) : (
                                <>
                                    <div className={styles.resultadoHash}>
                                        <span className={styles.etiquetaResultado}>HASH EXTRAÍDO DE LA FIRMA</span>
                                        <div className={styles.hashValor}>{hashFirma}</div>
                                    </div>
                                    <button
                                        className={styles.botonSiguiente}
                                        onClick={() => setPasoActual(4)}
                                    >
                                        Siguiente: Comparar →
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {pasoActual === 4 && (
                    <div className={styles.pasoContenido}>
                        <h2 className={styles.tituloPaso}>
                            ⚖️ Comparador de Hashes
                        </h2>

                        <div className={styles.comparador}>
                            <div className={styles.hashComparacion}>
                                <span className={styles.etiquetaComparacion}>HASH DEL DOCUMENTO</span>
                                <div className={`${styles.hashValorComparar} ${styles.hashDocumento}`}>
                                    {hashDocumento}
                                </div>
                            </div>

                            <div className={styles.simboloComparacion}>=</div>

                            <div className={styles.hashComparacion}>
                                <span className={styles.etiquetaComparacion}>HASH DE LA FIRMA</span>
                                <div className={`${styles.hashValorComparar} ${styles.hashFirma}`}>
                                    {hashFirma}
                                </div>
                            </div>
                        </div>

                        {veredicto === null ? (
                            <div className={styles.botonesVeredicto}>
                                <button
                                    className={styles.botonComparar}
                                    onClick={() => emitirVeredicto(true)}
                                >
                                    ✓ Los hashes coinciden
                                </button>
                                <button
                                    className={`${styles.botonComparar} ${styles.botonInvalido}`}
                                    onClick={() => emitirVeredicto(false)}
                                >
                                    ✗ Los hashes no coinciden
                                </button>
                            </div>
                        ) : (
                            <div className={`${styles.veredictoFinal} ${veredicto === "valido" ? styles.veredictoValido : styles.veredictoInvalido}`}>
                                <div className={styles.iconoVeredicto}>
                                    {veredicto === "valido" ? "✓" : "✗"}
                                </div>
                                <div className={styles.textoVeredicto}>
                                    <h3>{veredicto === "valido" ? "Firma Válida" : "Firma Inválida"}</h3>
                                    <p>
                                        {veredicto === "valido"
                                            ? "El documento es auténtico y no ha sido modificado."
                                            : "El documento puede haber sido alterado o la firma no corresponde."}
                                    </p>
                                </div>
                                <button className={styles.botonReiniciar} onClick={reiniciar}>
                                    Verificar otra firma
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ModalVerificacionFirma;
