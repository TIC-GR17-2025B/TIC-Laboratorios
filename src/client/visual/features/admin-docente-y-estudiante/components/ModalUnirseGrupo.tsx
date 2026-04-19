import { useState } from 'react';
import FormModal from '../../../common/components/FormModal';
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

  const handleClose = () => {
    setCodigo('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
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

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Unirse a un Grupo"
      submitLabel="Unirse"
      submittingLabel="Uniéndose..."
      loading={loading}
      error={error}
    >
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
    </FormModal>
  );
}
