import { useState, useEffect } from 'react';
import styles from '../styles/ModalGrupo.module.css';

interface ModalGrupoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nombre: string) => Promise<boolean>;
  grupoActual?: { id_curso: number; nombre: string } | null;
}

export default function ModalGrupo({ isOpen, onClose, onSave, grupoActual }: ModalGrupoProps) {
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNombre(grupoActual?.nombre || '');
      setError(null);
    }
  }, [isOpen, grupoActual]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      setError('El nombre del grupo es requerido');
      return;
    }

    setLoading(true);
    setError(null);

    const success = await onSave(nombre);
    setLoading(false);

    if (success) {
      onClose();
    } else {
      setError('Error al guardar el grupo');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{grupoActual ? 'Editar Grupo' : 'Crear Nuevo Grupo'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="nombre">Nombre del Grupo</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Grupo 1A - Redes"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? 'Guardando...' : grupoActual ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
