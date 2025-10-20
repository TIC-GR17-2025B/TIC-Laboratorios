import styles from "../styles/VistaOficina.module.css"
import Escena3D from "../components/Escena3D"
import EventLogsPanel from "../components/EventLogsPanel"

function VistaOficina() {
  return (
    <div className={styles.contenedor}>
      <Escena3D />
      <EventLogsPanel />
    </div>
  )
}

export default VistaOficina;
