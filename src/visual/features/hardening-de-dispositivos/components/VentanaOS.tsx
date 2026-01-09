import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import styles from "../styles/VentanaOS.module.css";

interface VentanaOSProps {
    titulo: string;
    children: ReactNode;
    onClose: () => void;
    onMinimize?: () => void;
    icono?: ReactNode;
    initialPosition?: { x: number; y: number };
    initialMaximized?: boolean;
}

export default function VentanaOS({
    titulo,
    children,
    onClose,
    onMinimize,
    icono,
    initialPosition,
    initialMaximized = true
}: VentanaOSProps) {
    const [position, setPosition] = useState(initialPosition ?? { x: 50, y: 30 });
    const [isMaximized, setIsMaximized] = useState(initialMaximized);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const ventanaRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMaximized) return;
        if ((e.target as HTMLElement).closest(`.${styles.botonesVentana}`)) return;

        setIsDragging(true);
        const rect = ventanaRef.current?.getBoundingClientRect();
        if (rect) {
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    const handleDoubleClick = () => {
        setIsMaximized(!isMaximized);
    };

    const toggleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !ventanaRef.current || isMaximized) return;

            const parent = ventanaRef.current.parentElement;
            if (!parent) return;

            const parentRect = parent.getBoundingClientRect();
            const newX = e.clientX - parentRect.left - dragOffset.x;
            const newY = e.clientY - parentRect.top - dragOffset.y;

            setPosition({
                x: Math.max(0, Math.min(newX, parentRect.width - 100)),
                y: Math.max(0, Math.min(newY, parentRect.height - 40))
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, dragOffset, isMaximized]);

    return (
        <div
            ref={ventanaRef}
            className={`${styles.ventana} ${isMaximized ? styles.ventanaMaximizada : ""}`}
            style={isMaximized ? undefined : {
                left: position.x,
                top: position.y,
            }}
        >
            <div
                className={styles.barraVentana}
                onMouseDown={handleMouseDown}
                onDoubleClick={handleDoubleClick}
            >
                <div className={styles.tituloVentana}>
                    {icono && <span className={styles.iconoVentana}>{icono}</span>}
                    <span>{titulo}</span>
                </div>
                <div className={styles.botonesVentana}>
                    {onMinimize && (
                        <button className={styles.botonVentana} onClick={onMinimize} title="Minimizar">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M1 5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    )}
                    <button className={styles.botonVentana} onClick={toggleMaximize} title={isMaximized ? "Restaurar" : "Maximizar"}>
                        {isMaximized ? (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <rect x="0.75" y="2.75" width="6.5" height="6.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                                <path d="M3 2.5V1.5C3 1.22386 3.22386 1 3.5 1H8.5C8.77614 1 9 1.22386 9 1.5V6.5C9 6.77614 8.77614 7 8.5 7H7.5" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        ) : (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <rect x="1" y="1" width="8" height="8" stroke="currentColor" strokeWidth="1.5" rx="1" />
                            </svg>
                        )}
                    </button>
                    <button className={`${styles.botonVentana} ${styles.botonCerrar}`} onClick={onClose} title="Cerrar">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className={styles.contenidoVentana}>
                {children}
            </div>
        </div>
    );
}
