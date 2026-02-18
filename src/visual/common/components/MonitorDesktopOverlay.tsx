import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScreenTransition } from '../contexts/ScreenTransitionContext';
import Dispositivos from '../../features/hardening-de-dispositivos/pages/Dispositivos';
import styles from '../styles/MonitorDesktopOverlay.module.css';

/**
 * Renders the desktop content (Dispositivos) positioned exactly over the
 * 3D monitor screen area. Appears after camera zoom completes.
 * Press Escape or click the back button to exit desktop mode.
 */
const MonitorDesktopOverlay: React.FC = () => {
    const { desktopMode, monitorRect, exitDesktopMode } = useScreenTransition();

    // Escape key to exit desktop mode
    useEffect(() => {
        if (!desktopMode) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                exitDesktopMode();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [desktopMode, exitDesktopMode]);

    return (
        <AnimatePresence>
            {desktopMode && monitorRect && (
                <motion.div
                    key="monitor-desktop"
                    className={styles.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                    <button
                        className={styles.closeButton}
                        onClick={exitDesktopMode}
                        title="Volver a la oficina (Esc)"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                    <div className={styles.desktopContainer}>
                        <Dispositivos embedded />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MonitorDesktopOverlay;
