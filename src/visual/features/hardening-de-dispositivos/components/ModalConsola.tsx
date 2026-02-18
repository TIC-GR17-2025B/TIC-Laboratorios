import { useState, useRef, useEffect, useCallback } from "react";
import styles from "../styles/ModalConsola.module.css";
import { useEscenario } from "../../../common/contexts";
import { useECSSceneContext } from "../../escenarios-simulados/context/ECSSceneContext";
import { ActivoComponent, DispositivoComponent } from "../../../../ecs/components";

interface HistorialEntry {
    prompt: string;
    comando: string;
    salida: string;
}

export default function ModalConsola() {
    const { entidadSeleccionadaId } = useEscenario();
    const { escenarioController } = useECSSceneContext();

    const [historial, setHistorial] = useState<HistorialEntry[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [promptActual, setPromptActual] = useState("");
    const [esperandoPassword, setEsperandoPassword] = useState(false);
    const [comandoSSHPendiente, setComandoSSHPendiente] = useState("");
    const [passwordValue, setPasswordValue] = useState("");
    const [bannerTexto, setBannerTexto] = useState("");

    const terminalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const historialComandos = useRef<string[]>([]);
    const indicHistorial = useRef(-1);
    const entidadActualRef = useRef<number | null>(null);

    // Obtener el prompt a partir de una entidad
    const obtenerPrompt = useCallback((entidad: number) => {
        const comp = escenarioController.ecsManager.getComponentes(entidad)?.get(DispositivoComponent);
        if (comp) {
            const usuario = comp.usuario || "user";
            const equipo = (comp.nombreEquipo || comp.nombre || "pc").replace(/\s+/g, "-");
            return `${usuario}@${equipo}:~$ `;
        }
        return "user@pc:~$ ";
    }, [escenarioController]);

    // Inicializar el sistema de comandos al montar o cuando cambia el dispositivo
    useEffect(() => {
        if (entidadSeleccionadaId !== null) {
            escenarioController.iniciarSistemaComandos(entidadSeleccionadaId);
            entidadActualRef.current = entidadSeleccionadaId;
            const comp = escenarioController.ecsManager.getComponentes(entidadSeleccionadaId)?.get(DispositivoComponent);
            const prompt = obtenerPrompt(entidadSeleccionadaId);
            setPromptActual(prompt);
            setHistorial([]);
            setEsperandoPassword(false);
            setComandoSSHPendiente("");
            setInputValue("");
            setPasswordValue("");
            historialComandos.current = [];
            indicHistorial.current = -1;

            const nombrePC = (comp?.nombreEquipo || comp?.nombre || "pc").replace(/\s+/g, "-");
            setBannerTexto(
                `${nombrePC} [Version 1.0.0]\n(c) Seguridad Corporativa. Todos los derechos reservados.\n`
            );
        }
    }, [entidadSeleccionadaId, escenarioController, obtenerPrompt]);

    // Auto-scroll al final
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [historial, esperandoPassword]);

    // Focus en el input correspondiente
    useEffect(() => {
        if (esperandoPassword) {
            passwordRef.current?.focus();
        } else {
            inputRef.current?.focus();
        }
    }, [esperandoPassword, historial]);

    const ejecutarComando = (comando: string) => {
        const respuesta = escenarioController.ejecutarComando(comando);
        if (!respuesta) return;

        setHistorial(prev => [
            ...prev,
            {
                prompt: promptActual,
                comando,
                salida: respuesta.texto,
            }
        ]);

        // Actualizar prompt y entidad actual si cambió (por SSH)
        entidadActualRef.current = respuesta.entidadActual;
        const nuevoPrompt = obtenerPrompt(respuesta.entidadActual);
        setPromptActual(nuevoPrompt);
    };

    const obtenerNombresArchivos = useCallback((): string[] => {
        if (entidadActualRef.current === null) return [];
        const activos = escenarioController.ecsManager.getComponentes(entidadActualRef.current)?.get(ActivoComponent);
        return activos?.activos.map(a => a.nombre) ?? [];
    }, [escenarioController]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Tab autocomplete
        if (e.key === "Tab") {
            e.preventDefault();
            const partes = inputValue.split(/\s+/);

            if (partes.length === 1) {
                // Autocompletar nombre de comando
                const comandos = ["cat", "cls", "clear", "h", "ls", "ssh"];
                const coincidencias = comandos.filter(c => c.startsWith(partes[0].toLowerCase()));
                if (coincidencias.length === 1) {
                    setInputValue(coincidencias[0] + " ");
                }
            } else if (partes.length === 2 && partes[0].toLowerCase() === "cat") {
                // Autocompletar nombre de archivo
                const archivos = obtenerNombresArchivos();
                const prefijo = partes[1];
                const coincidencias = archivos.filter(a => a.toLowerCase().startsWith(prefijo.toLowerCase()));
                if (coincidencias.length === 1) {
                    setInputValue(`cat ${coincidencias[0]}`);
                }
            }
            return;
        }

        // Navegación en historial con flechas
        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (historialComandos.current.length === 0) return;
            const nuevoIndice = indicHistorial.current < historialComandos.current.length - 1
                ? indicHistorial.current + 1
                : indicHistorial.current;
            indicHistorial.current = nuevoIndice;
            setInputValue(historialComandos.current[historialComandos.current.length - 1 - nuevoIndice]);
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (indicHistorial.current <= 0) {
                indicHistorial.current = -1;
                setInputValue("");
                return;
            }
            indicHistorial.current -= 1;
            setInputValue(historialComandos.current[historialComandos.current.length - 1 - indicHistorial.current]);
            return;
        }

        if (e.key !== "Enter") return;

        const comando = inputValue.trim();
        if (!comando) return;

        // Guardar en historial de comandos
        historialComandos.current.push(comando);
        indicHistorial.current = -1;

        // Comando cls - limpiar pantalla
        if (comando.toLowerCase() === "cls" || comando.toLowerCase() === "clear") {
            setHistorial([]);
            setInputValue("");
            return;
        }

        // Detectar si es comando SSH
        if (comando.toLowerCase().startsWith("ssh ")) {
            setHistorial(prev => [
                ...prev,
                {
                    prompt: promptActual,
                    comando: comando,
                    salida: "",
                }
            ]);
            setComandoSSHPendiente(comando);
            setEsperandoPassword(true);
            setInputValue("");
            return;
        }

        ejecutarComando(comando);
        setInputValue("");
    };

    const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return;

        const password = passwordValue;
        const comandoCompleto = `${comandoSSHPendiente} ${password}`;

        setHistorial(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last) {
                const respuesta = escenarioController.ejecutarComando(comandoCompleto);
                if (respuesta) {
                    last.salida = respuesta.texto;
                    entidadActualRef.current = respuesta.entidadActual;
                    const nuevoPrompt = obtenerPrompt(respuesta.entidadActual);
                    setPromptActual(nuevoPrompt);
                }
            }
            return updated;
        });

        setEsperandoPassword(false);
        setComandoSSHPendiente("");
        setPasswordValue("");
    };

    const handleContainerClick = () => {
        if (esperandoPassword) {
            passwordRef.current?.focus();
        } else {
            inputRef.current?.focus();
        }
    };

    return (
        <div className={styles.container} onClick={handleContainerClick}>
            <div className={styles.terminal} ref={terminalRef}>
                {bannerTexto && (
                    <div className={styles.banner}>{bannerTexto}</div>
                )}

                {historial.map((entry, i) => (
                    <div key={i} className={styles.entry}>
                        <div className={styles.promptLine}>
                            <span className={styles.prompt}>{entry.prompt}</span>
                            <span className={styles.commandText}>{entry.comando}</span>
                        </div>
                        {entry.salida && (
                            <div className={styles.output}>{entry.salida}</div>
                        )}
                    </div>
                ))}

                {esperandoPassword && (
                    <div className={styles.entry}>
                        <div className={styles.promptLine}>
                            <span className={styles.passwordLabel}>Ingrese la contrasena: </span>
                            <input
                                ref={passwordRef}
                                type="password"
                                className={styles.passwordInput}
                                value={passwordValue}
                                onChange={(e) => setPasswordValue(e.target.value)}
                                onKeyDown={handlePasswordKeyDown}
                                spellCheck={false}
                                autoComplete="off"
                                autoFocus
                            />
                        </div>
                    </div>
                )}
            </div>

            {!esperandoPassword && (
                <div className={styles.inputLine}>
                    <span className={styles.inputPrompt}>{promptActual}</span>
                    <input
                        ref={inputRef}
                        type="text"
                        className={styles.input}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        spellCheck={false}
                        autoComplete="off"
                        autoFocus
                    />
                </div>
            )}
        </div>
    );
}
