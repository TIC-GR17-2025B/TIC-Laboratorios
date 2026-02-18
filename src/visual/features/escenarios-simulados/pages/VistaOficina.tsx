import styles from "../styles/VistaOficina.module.css"
import Escena3D from "../components/Escena3D"
import TarjetaEntidadSeleccionada from "../components/TarjetaEntidadSeleccionada";
import { useEscenario } from "../../../common/contexts";
import { useScreenTransition } from "../../../common/contexts/ScreenTransitionContext";
import MonitorDesktopOverlay from "../../../common/components/MonitorDesktopOverlay";
import EventLogsPanel from "../components/EventLogsPanel";
import { useEffect } from "react";
function VistaOficina() {
  const { dispositivoSeleccionado, setDispositivoSeleccionado } = useEscenario();
  const { desktopMode } = useScreenTransition();

  useEffect(() => {
    setDispositivoSeleccionado(null);
  }, []);

  return (
    <div className={styles.contenedor}>
      <Escena3D />
      {!desktopMode && <TarjetaEntidadSeleccionada visible={!!dispositivoSeleccionado} />}
      {!desktopMode && <EventLogsPanel />}
      <MonitorDesktopOverlay />
    </div>
  )
}

export default VistaOficina;
