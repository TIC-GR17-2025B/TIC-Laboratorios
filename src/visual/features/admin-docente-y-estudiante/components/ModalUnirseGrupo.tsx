import { useState } from 'react';
import styles from '../styles/ModalUnirseGrupo.module.css';

interface ModalUnirseGrupoProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (codigo: string) => Promise<{ success: boolean; error?: string }>;
}

export default function ModalUnirseGrupo({ isOpen, onClose, onJoin }: ModalUnirseGrupoProps) {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigo.trim()) {
      setError('El código es requerido');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await onJoin(codigo.trim());
    setLoading(false);

    if (result.success) {
      setCodigo('');
      onClose();
    } else {
      setError(result.error || 'Error al unirse al grupo');
    }
  };

  const handleClose = () => {
    setCodigo('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Unirse a un Grupo</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="codigo">Código de Invitación</label>
            <input
              id="codigo"
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ej: ABC123XYZ"
              disabled={loading}
              autoFocus
              maxLength={20}
            />
            <p className={styles.hint}>Ingresa el código que te proporcionó tu docente</p>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? 'Uniéndose...' : 'Unirse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
