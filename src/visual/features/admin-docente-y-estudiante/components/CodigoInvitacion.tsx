import { useState } from 'react';
import styles from '../styles/CodigoInvitacion.module.css';

interface CodigoInvitacionProps {
  codigo: string | null;
  onGenerate: () => Promise<string | null>;
}

export default function CodigoInvitacion({ codigo, onGenerate }: CodigoInvitacionProps) {
  const [loading, setLoading] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    await onGenerate();
    setLoading(false);
  };

  const handleCopy = () => {
    if (codigo) {
      navigator.clipboard.writeText(codigo);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4>Código de Invitación</h4>
        <button
          className={styles.generateButton}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generando...' : codigo ? 'Regenerar' : 'Generar Código'}
        </button>
      </div>

      {codigo && (
        <div className={styles.codigoContainer}>
          <div className={styles.codigo}>{codigo}</div>
          <button
            className={styles.copyButton}
            onClick={handleCopy}
            title="Copiar código"
          >
            {showCopied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      )}

      {!codigo && !loading && (
        <p className={styles.noCode}>
          No hay código activo. Genera uno para que los estudiantes puedan unirse.
        </p>
      )}

      {showCopied && <span className={styles.copiedMessage}>¡Copiado!</span>}
    </div>
  );
}
