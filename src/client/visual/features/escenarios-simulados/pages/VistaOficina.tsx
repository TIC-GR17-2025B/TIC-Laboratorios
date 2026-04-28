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
  const { desktopMode, pendingZoom, consumePendingZoom, startZoom } = useScreenTransition();

  useEffect(() => {
    setDispositivoSeleccionado(null);
  }, []);

  // Handle pending zoom from Sidebar navigation
  useEffect(() => {
    if (pendingZoom) {
      startZoom(pendingZoom.position, pendingZoom.rotationY);
      consumePendingZoom();
    }
  }, [pendingZoom, startZoom, consumePendingZoom]);

  return (
    <div className={styles.contenedor}>
      <Escena3D />
      {!desktopMode && <TarjetaEntidadSeleccionada visible={!!dispositivoSeleccionado} />}
      <EventLogsPanel />
      <MonitorDesktopOverlay />
    </div>
  )
}

export default VistaOficina;
