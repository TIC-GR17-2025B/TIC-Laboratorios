import styles from "../styles/VistaOficina.module.css"
import Escena3D from "../components/Escena3D"
import TarjetaEntidadSeleccionada from "../components/TarjetaEntidadSeleccionada";
import { useEscenario } from "../../../common/contexts";
import { useScreenTransition } from "../../../common/contexts/ScreenTransitionContext";
import MonitorDesktopOverlay from "../../../common/components/MonitorDesktopOverlay";
import { useECSSceneContext } from "../context/ECSSceneContext";

import { useEffect, useRef } from "react";
function VistaOficina() {
  const { dispositivoSeleccionado, setDispositivoSeleccionado } = useEscenario();
  const { desktopMode, pendingZoom, consumePendingZoom, startZoom, exitDesktopMode } = useScreenTransition();
  const { zonaActual } = useECSSceneContext();
  const zonaAnteriorRef = useRef(zonaActual);

  useEffect(() => {
    setDispositivoSeleccionado(null);
  }, []);

  useEffect(() => {
    if (zonaAnteriorRef.current !== zonaActual && desktopMode) {
      exitDesktopMode();
    }
    zonaAnteriorRef.current = zonaActual;
  }, [zonaActual, desktopMode, exitDesktopMode]);

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
      <MonitorDesktopOverlay />
    </div>
  )
}

export default VistaOficina;
