import { useAgentMalvado } from '../context/AgentMalvadoContext';
import { Bot, Sparkles, Play, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useScenarioBuilder } from '../hooks/useScenarioBuilder';
import styles from './AgentMalvadoUI.module.css';

export default function AgentMalvadoUI() {
    const { isGenerating, generatedScenario, error, generateDynamicLevel, clearScenario } = useAgentMalvado();
    const { buildAndPlay } = useScenarioBuilder();

    const handleGenerate = () => generateDynamicLevel();
    const handlePlay = () => buildAndPlay();

    const scenario = generatedScenario as Record<string, string> | null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.container}
        >
            {!isGenerating && !generatedScenario && !error && (
                <button onClick={handleGenerate} className={styles.buttonPrimary}>
                    <Sparkles size={14} /> Generar Nivel IA
                </button>
            )}

            {isGenerating && (
                <div id="gen-loading" className={styles.loadingContainer}>
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className={styles.loadingIcon}
                    >
                        <Bot size={28} className={styles.botIcon} />
                    </motion.div>
                    <p className={styles.loadingText}>Creando nivel...</p>
                </div>
            )}

            {error && (
                <div id="gen-error" className={styles.errorContainer}>
                    <div className={styles.errorMessage}>
                        <AlertTriangle size={14} className={styles.errorIcon} />
                        <span>{String(error)}</span>
                    </div>
                    <button onClick={handleGenerate} className={styles.buttonSmall}>
                        Reintentar
                    </button>
                </div>
            )}

            {scenario && !isGenerating && (
                <div id="gen-success" className={styles.successContainer}>
                    <div className={styles.scenarioCard}>
                        <h3 className={styles.scenarioTitle}>¡Nivel Listo!</h3>
                        <div className={styles.scenarioName}>
                            {scenario.titulo ?? 'Operación Clasificada'}
                        </div>
                        <div className={styles.scenarioMeta}>
                            <span>{scenario.categoria ?? ''}</span>
                            {' | '}
                            <span>Dificultad: {scenario.dificultad ?? ''}</span>
                        </div>
                    </div>

                    <div className={styles.actionsRow}>
                        <button onClick={handlePlay} className={styles.buttonSuccess}>
                            <Play size={14} className={styles.playIcon} /> Jugar
                        </button>
                        <button onClick={clearScenario} className={styles.buttonSecondary}>
                            Descartar
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
