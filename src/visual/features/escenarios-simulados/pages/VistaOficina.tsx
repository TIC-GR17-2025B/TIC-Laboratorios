import styles from "../styles/VistaOficina.module.css"
import Escena3D from "../components/Escena3D"
import TarjetaEntidadSeleccionada from "../components/TarjetaEntidadSeleccionada";
import { useEscenario } from "../../../common/contexts";
import EventLogsPanel from "../components/EventLogsPanel";

function VistaOficina() {
  const { dispositivoSeleccionado } = useEscenario();

  return (
    <div className={styles.contenedor}>
      <Escena3D />
      <TarjetaEntidadSeleccionada visible={!!dispositivoSeleccionado} />
      <EventLogsPanel />
    </div>
  )
}

export default VistaOficina;
