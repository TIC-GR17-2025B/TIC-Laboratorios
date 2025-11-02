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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (!disabled) {
            onChange?.(!checked);
        }
    };

    return (
        <div
            className={`${styles.item} ${className ?? ""}`}
            onClick={handleClick}
            data-context={label.toLowerCase()}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
        >
            <div className={styles.labelContainer}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={handleChange}
                    disabled={disabled}
                    className={styles.checkbox}
                />
                <div className={styles.label}>{label}</div>
            </div>
            <span className={styles.price}>{checked ? `$${(price / 2).toFixed(2)}` : `$${price.toFixed(2)}`}</span>
        </div>
    );
}

export default CheckableItem;
