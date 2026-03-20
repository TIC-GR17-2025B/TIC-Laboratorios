import { useState, useEffect, useCallback, useRef } from "react";
import Joyride, {
  type CallBackProps,
  type Step,
  STATUS,
  ACTIONS,
} from "react-joyride";
import { useECSSceneContext } from "../context/ECSSceneContext";


const STORAGE_KEY = "tutorial_tour_completado";

const steps: Step[] = [
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Bienvenido al Simulador de Seguridad",
    content:
      "Este es tu primer escenario como administrador de seguridad informática. " +
      "Te guiaremos paso a paso por la interfaz antes de empezar. " +
      "Puedes cerrar este tour en cualquier momento.",
  },
  {
    target: '[data-tour="escena-3d"]',
    placement: "center",
    title: "Oficina 3D",
    content:
      "Esta es la vista 3D de la oficina. Aquí verás los dispositivos de la empresa. " +
      "Haz clic izquierdo en un dispositivo para seleccionarlo y ver su información. " +
      "Haz clic derecho para abrir el menú de configuración.",
  },
  {
    target: '[data-tour="dock"]',
    placement: "top",
    title: "Barra de Navegación",
    content:
      "Esta barra te permite moverte entre las diferentes vistas del simulador. " +
      "Cada botón te lleva a una función diferente.",
  },
  {
    target: '[data-tour="dock-dispositivos"]',
    placement: "top",
    title: "Vista de Dispositivos",
    content:
      "Aquí puedes interactuar con los dispositivos: abrir archivos, ejecutar comandos, " +
      "instalar aplicaciones y modificar configuraciones de seguridad.",
  },
  {
    target: '[data-tour="dock-redes"]',
    placement: "top",
    title: "Vista de Redes",
    content:
      "Muestra la topología de red. Aquí puedes ASIGNAR dispositivos a redes " +
      "y ver cómo están conectados. Esto será importante para tu primer objetivo.",
  },
  {
    target: '[data-tour="dock-partida"]',
    placement: "top",
    title: "Objetivos de la Partida",
    content:
      "Aquí verás las FASES del escenario y los objetivos que debes completar. " +
      "Revisa esta sección cuando no sepas qué hacer a continuación.",
  },
  {
    target: '[data-tour="dock-tiempo"]',
    placement: "top",
    title: "Cronómetro",
    content:
      "El tiempo avanza durante la simulación. Los eventos y retos aparecerán " +
      "en momentos específicos. ¡No te preocupes, el tiempo se pausa cuando hay un evento importante!",
  },
  {
    target: '[data-tour="dock-pausa"]',
    placement: "top",
    title: "Pausar / Reanudar",
    content:
      "Puedes pausar la simulación en cualquier momento para pensar tu estrategia. " +
      "El tiempo se detendrá hasta que decidas continuar.",
  },
  {
    target: '[data-tour="logs-panel"]',
    placement: "left",
    title: "Panel de Eventos",
    content:
      "Los eventos del escenario aparecerán aquí. Cada evento te dará instrucciones " +
      "sobre qué debes hacer. Lee cada evento con atención.",
  },
  {
    target: "body",
    placement: "center",
    title: "¡Listo para empezar!",
    content:
      "Recuerda los tres pilares de la seguridad informática:\n" +
      "• Confidencialidad — Solo los autorizados acceden\n" +
      "• Integridad — La información no se altera\n" +
      "• Disponibilidad — Los sistemas están accesibles\n\n" +
      "Tu primer reto aparecerá en unos segundos. ¡Buena suerte!",
  },
];

const joyrideStyles = {
  options: {
    primaryColor: "#2563eb",
    textColor: "#1a1a1a",
    backgroundColor: "#ffffff",
    arrowColor: "#ffffff",
    overlayColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 100000,
  },
  tooltip: {
    borderRadius: "12px",
    padding: "20px",
    fontSize: "14px",
    maxWidth: 420,
  },
  tooltipTitle: {
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "8px",
  },
  tooltipContent: {
    whiteSpace: "pre-line" as const,
    lineHeight: "1.6",
  },
  buttonNext: {
    borderRadius: "8px",
    padding: "8px 20px",
    fontSize: "14px",
    fontWeight: 500,
  },
  buttonBack: {
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "14px",
    color: "#6b7280",
  },
  buttonSkip: {
    color: "#9ca3af",
    fontSize: "13px",
  },
  spotlight: {
    borderRadius: "10px",
  },
};

const locale = {
  back: "Anterior",
  close: "Cerrar",
  last: "¡Empezar!",
  next: "Siguiente",
  open: "Abrir",
  skip: "Saltar tour",
};

export default function TutorialTour() {
  const [run, setRun] = useState(false);
  const { pause, resume, isPaused } = useECSSceneContext();
  const wasPausedBeforeTour = useRef(false);

  useEffect(() => {
    const slugEscenario = localStorage.getItem("slug_escenario_actual");
    if (slugEscenario !== "tutorial") return;

    const completado = localStorage.getItem(STORAGE_KEY);
    if (completado === "true") return;

    // Small delay to let the 3D scene load
    const timer = setTimeout(() => {
      wasPausedBeforeTour.current = isPaused;
      if (!isPaused) pause();
      setRun(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCallback = useCallback(
    (data: CallBackProps) => {
      const { status, action } = data;
      const finished =
        status === STATUS.FINISHED || status === STATUS.SKIPPED;

      if (finished || action === ACTIONS.CLOSE) {
        setRun(false);
        localStorage.setItem(STORAGE_KEY, "true");
        // Solo reanudar si el juego no estaba pausado antes del tour
        if (!wasPausedBeforeTour.current) {
          resume();
        }
      }
    },
    [resume]
  );

  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      disableOverlayClose
      callback={handleCallback}
      styles={joyrideStyles}
      locale={locale}
      floaterProps={{ disableAnimation: true }}
    />
  );
}
