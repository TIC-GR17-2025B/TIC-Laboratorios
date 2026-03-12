import { forwardRef, type InputHTMLAttributes } from 'react';
import styles from '../styles/TextInput.module.css';

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ value, onChange, label, className, id, ...rest }, ref) => (
    <div className={styles.field}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${styles.input} ${className ?? ''}`}
        {...rest}
      />
    </div>
  ),
);

TextInput.displayName = 'TextInput';

export default TextInput;
