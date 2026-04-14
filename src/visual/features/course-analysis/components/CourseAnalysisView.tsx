import type { CourseAnalysisResponse } from '../types/courseAnalysis.types';
import { CourseAnalysisButton } from './CourseAnalysisButton';
import styles from '../styles/CourseAnalysisModal.module.css';

interface CourseAnalysisViewProps {
  analysis: CourseAnalysisResponse;
  cursoNombre: string;
  onAnalysisGenerated: (analysis: CourseAnalysisResponse) => void;
  idCurso: number;
  idProfesor: number;
}

export function CourseAnalysisView({ 
  analysis, 
  cursoNombre,
  onAnalysisGenerated,
  idCurso,
  idProfesor
}: CourseAnalysisViewProps) {
  if (!analysis) return null;

  const { analisis, resumen, fecha_generacion } = analysis;

  const fecha = new Date(fecha_generacion).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div className={styles.modal} style={{ margin: 0, width: '100%', maxWidth: 'none', maxHeight: 'none', height: 'auto', display: 'block', overflowY: 'visible', pointerEvents: 'auto' }}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-1)' }}>Análisis del Curso</h2>
              <p className={styles.cursoName}>{cursoNombre}</p>
              <p className={styles.fecha}>{fecha}</p>
            </div>
          </div>
        </div>

        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <div className={styles.statValue}>{resumen.total_estudiantes}</div>
              <div className={styles.statLabel}>Estudiantes</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <div>
              <div className={styles.statValue}>{resumen.promedio_intentos.toFixed(1)}</div>
              <div className={styles.statLabel}>Promedio Intentos</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div>
              <div className={styles.statValue}>{resumen.estudiantes_necesitan_apoyo}</div>
              <div className={styles.statLabel}>Necesitan Apoyo</div>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <h3>{analisis.resumen_ejecutivo.titulo}</h3>
            </div>
            <p className={styles.text}>{analisis.resumen_ejecutivo.contenido}</p>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <h3>{analisis.patrones.titulo}</h3>
            </div>
            <p className={styles.text}>{analisis.patrones.contenido}</p>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <h3>{analisis.fortalezas.titulo}</h3>
            </div>
            <p className={styles.text}>{analisis.fortalezas.contenido}</p>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21h6M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
              </svg>
              <h3>{analisis.areas_mejora.titulo}</h3>
            </div>
            <p className={styles.text}>{analisis.areas_mejora.contenido}</p>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <h3>{analisis.recomendaciones.titulo}</h3>
            </div>
            <p className={styles.text}>{analisis.recomendaciones.contenido}</p>
          </div>
        </div>
        
        {/* Botón para analizar de nuevo abajo */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>¿Nuevos datos disponibles?</span>
            <CourseAnalysisButton 
                idCurso={idCurso}
                idProfesor={idProfesor}
                onAnalysisGenerated={onAnalysisGenerated}
            />
        </div>
      </div>
    </div>
  );
}
