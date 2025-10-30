import styles from "../styles/VistaOficina.module.css"
import Escena3D from "../components/Escena3D"

function VistaOficina() {
  return (
    <div className={styles.contenedor}>
      <Escena3D />
    </div>
  )
}

export default VistaOficina;
