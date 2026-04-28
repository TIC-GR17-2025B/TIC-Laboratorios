import { useState, useEffect, useCallback, useRef, type CSSProperties } from "react";
import { useNavigate, useLocation } from "react-router";
import { useECSSceneContext } from "../context/ECSSceneContext";
import { useChatContext } from "../../chat/context/ChatContext";
import s from "../styles/TutorialTour.module.css";

interface TourStep {
  target: string;
  placement: "center" | "top" | "bottom" | "left" | "right";
  title: string;
  content: string;
  route?: string;
  onEnter?: () => void;
  onLeave?: () => void;
}

const GAP = 12;

function getTooltipPosition(
  rect: DOMRect | null,
  placement: TourStep["placement"]
): CSSProperties {
  if (!rect || placement === "center") return {};
  const pos: CSSProperties = {};
  switch (placement) {
    case "top":
      pos.left = rect.left + rect.width / 2;
      pos.bottom = window.innerHeight - rect.top + GAP;
      pos.transform = "translateX(-50%)";
      break;
    case "bottom":
      pos.left = rect.left + rect.width / 2;
      pos.top = rect.bottom + GAP;
      pos.transform = "translateX(-50%)";
      break;
    case "left":
      pos.right = window.innerWidth - rect.left + GAP;
      pos.top = rect.top + rect.height / 2;
      pos.transform = "translateY(-50%)";
      break;
    case "right":
      pos.left = rect.right + GAP;
      pos.top = rect.top + rect.height / 2;
      pos.transform = "translateY(-50%)";
      break;
  }
  return pos;
}

export default function TutorialTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pause, resume, isPaused } = useECSSceneContext();
  const { openChat, closeChat } = useChatContext();

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const wasPausedBeforeTour = useRef(false);
  const prevStepRef = useRef(-1);

  const steps: TourStep[] = [
    // — Bienvenida (centered, en oficina)
    {
      target: "body",
      placement: "center",
      route: "/",
      title: "Bienvenido a TechStart",
      content:
        "Es tu primer día como administrador de seguridad informática. " +
        "Te daremos un recorrido rápido por las herramientas que tienes disponibles.",
    },
    // — Escena 3D
    {
      target: '[data-tour="escena-3d"]',
      placement: "center",
      route: "/",
      title: "Tu oficina",
      content:
        "Esta es la oficina de TechStart en 3D. Puedes hacer clic en los dispositivos " +
        "para ver su información, o clic derecho para configurarlos.",
    },
    // — Dock general
    {
      target: '[data-tour="dock"]',
      placement: "top",
      route: "/",
      title: "Barra de navegación",
      content:
        "Desde aquí accedes a todo: la oficina, los dispositivos, la red y los objetivos de la partida.",
    },
    // — Vista de Redes
    {
      target: "body",
      placement: "center",
      route: "/redes",
      title: "Vista de Redes",
      content:
        "Aquí ves cómo están conectados los dispositivos. Puedes asignar equipos a redes " +
        "y ver la topología completa. Tu primer objetivo va a ser exactamente esto.",
    },
    // — Vista de Fases/Partida
    {
      target: "body",
      placement: "center",
      route: "/fases-partida",
      title: "Objetivos de la partida",
      content:
        "Aquí puedes ver las fases del escenario y qué debes lograr en cada una. " +
        "Cuando no sepas qué hacer, revisa esta sección.",
    },
    // — Logs panel (volver a oficina)
    {
      target: '[data-tour="logs-panel"]',
      placement: "left",
      route: "/",
      title: "Panel de eventos",
      content:
        "Los eventos del escenario aparecen aquí. Cada uno te dará instrucciones " +
        "sobre qué está pasando y qué debes hacer. Léelos con atención.",
    },
    // — Tiempo y pausa
    {
      target: '[data-tour="dock-tiempo"]',
      placement: "top",
      route: "/",
      title: "El tiempo corre",
      content:
        "La simulación avanza en tiempo real. Los retos aparecen en momentos específicos. " +
        "Si necesitas pensar, puedes pausar con el botón de al lado.",
    },
    // — Chat
    {
      target: '[data-chat-toggle="true"]',
      placement: "top",
      route: "/",
      title: "Tu asistente IA",
      content:
        "Si te pierdes o no entiendes algo, puedes preguntarle al chatbot. " +
        "Está ahí para ayudarte durante todo el escenario.",
      onEnter: () => openChat(),
      onLeave: () => closeChat(),
    },
    // — Cierre
    {
      target: "body",
      placement: "center",
      route: "/",
      title: "¡Listo!",
      content:
        "Recuerda los tres pilares de la seguridad:\n" +
        "• Confidencialidad — Solo los autorizados acceden\n" +
        "• Integridad — La información no se altera\n" +
        "• Disponibilidad — Los sistemas están accesibles\n\n" +
        "Tu primer reto aparecerá en unos segundos. ¡Buena suerte!",
    },
  ];

  const step = steps[stepIndex];
  const isCentered = step.target === "body" || !targetRect;
  const isLast = stepIndex === steps.length - 1;

  const close = useCallback(() => {
    const currentStep = steps[prevStepRef.current];
    if (currentStep?.onLeave) currentStep.onLeave();
    setActive(false);
    if (location.pathname !== "/") navigate("/");
    if (!wasPausedBeforeTour.current) resume();
  }, [resume, navigate, location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Init
  useEffect(() => {
    const slug = localStorage.getItem("slug_escenario_actual");
    if (slug !== "tutorial") return;

    const timer = setTimeout(() => {
      wasPausedBeforeTour.current = isPaused;
      if (!isPaused) pause();
      setActive(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Navigate & run side effects when step changes
  useEffect(() => {
    if (!active) return;
    const prev = prevStepRef.current;

    if (prev >= 0 && prev < steps.length && steps[prev].onLeave) {
      steps[prev].onLeave!();
    }

    if (step.route && step.route !== location.pathname) {
      navigate(step.route);
    }

    if (step.onEnter) {
      const t = setTimeout(step.onEnter, 100);
      return () => clearTimeout(t);
    }

    prevStepRef.current = stepIndex;
  }, [stepIndex, active]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update target rect
  useEffect(() => {
    if (!active) return;

    const updateRect = () => {
      if (step.target === "body") {
        setTargetRect(null);
        return;
      }
      const el = document.querySelector(step.target);
      setTargetRect(el ? el.getBoundingClientRect() : null);
    };

    // Small delay so route transitions can render
    const timer = setTimeout(updateRect, 50);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [active, step.target, location.pathname]);

  if (!active) return null;

  const tooltipClass = isCentered
    ? `${s.tooltip} ${s.tooltipCentered}`
    : s.tooltip;

  return (
    <div className={s.overlay}>
      {isCentered ? (
        <div className={s.overlayBackground} />
      ) : (
        <div
          className={s.spotlight}
          style={{
            top: targetRect!.top - 4,
            left: targetRect!.left - 4,
            width: targetRect!.width + 8,
            height: targetRect!.height + 8,
          }}
        />
      )}

      <div className={tooltipClass} style={isCentered ? {} : getTooltipPosition(targetRect, step.placement)}>
        <div className={s.header}>
          <h3 className={s.title}>{step.title}</h3>
          <button className={s.closeButton} onClick={close} aria-label="Cerrar tour">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className={s.body}>{step.content}</div>

        <div className={s.footer}>
          <button className={s.skipButton} onClick={close}>
            Saltar tour
          </button>
          <div className={s.footerRight}>
            <span className={s.progress}>
              {stepIndex + 1} / {steps.length}
            </span>
            {stepIndex > 0 && (
              <button
                className={s.backButton}
                onClick={() => setStepIndex((i) => i - 1)}
              >
                Anterior
              </button>
            )}
            <button
              className={s.nextButton}
              onClick={() => (isLast ? close() : setStepIndex((i) => i + 1))}
            >
              {isLast ? "¡Empezar!" : "Siguiente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
