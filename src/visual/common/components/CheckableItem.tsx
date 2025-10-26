import styles from "../styles/CheckableItem.module.css";

type CheckableItemProps = {
    label: string;
    price: number;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
};

function CheckableItem({
    label,
    price,
    checked = false,
    onChange,
    disabled = false,
    className,
}: CheckableItemProps) {
    const handleClick = () => {
        if (!disabled) {
            onChange?.(!checked);
        }
    };

    return (
        <div
            className={`${styles.item} ${className ?? ""}`}
            onClick={handleClick}
            data-context={label.toLowerCase()}
            style={{ cursor: disabled ? 'default' : 'pointer' }}
        >
            <div className={styles.labelContainer}>
                <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    className={styles.checkbox}
                />
                <div className={styles.label}>{label}</div>
            </div>
            <span className={styles.price}>${price}</span>
        </div>
    );
}

export default CheckableItem;
