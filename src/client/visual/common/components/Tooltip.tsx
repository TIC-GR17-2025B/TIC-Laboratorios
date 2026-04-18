import styles from '../styles/Tooltip.module.css';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom';
}

export default function Tooltip({ text, children, position = 'top' }: TooltipProps) {
    return (
        <div className={styles.wrapper}>
            {children}
            <span className={`${styles.tooltip} ${position === 'bottom' ? styles.bottom : ''}`}>
                {text}
            </span>
        </div>
    );
}
