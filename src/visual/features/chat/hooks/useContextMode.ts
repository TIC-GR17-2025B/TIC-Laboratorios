import { useState, useEffect, useCallback } from 'react';
import type { GameContext } from '../types/chat.types';


const CONTEXT_SELECTOR = '[data-context]' as const;

const CONTEXT_MODE_CLASS = 'context-mode-active' as const;

// Tipos de eventos a bloquear cuando el modo contexto está activo
const BLOCKED_EVENT_TYPES = [
  'mousedown',
  'mouseup', 
  'dblclick',
  'contextmenu',
  'submit'
] as const;

type OnContextSelectedCallback = (context: GameContext) => void;


export const useContextMode = (onContextSelected?: OnContextSelectedCallback) => {
  const [isContextMode, setIsContextMode] = useState(false);
  const [selectedContext, setSelectedContext] = useState<GameContext | null>(null);

  /**
   * Extrae el contexto de un elemento HTML.
   * Responsabilidad única: Transformar elemento DOM a GameContext.
   */
  const extractContextFromElement = useCallback((element: HTMLElement): GameContext => {
    const contextId = element.getAttribute('data-context') || '';
    const displayText = element.textContent?.trim() || contextId;
    const ariaLabel = element.getAttribute('aria-label') || undefined;
    const objectName = element.getAttribute('data-object-name') || element.tagName;
    const imageUrl = element instanceof HTMLImageElement ? element.src : undefined;

    return {
      objectName,
      contextId,
      displayText,
      ariaLabel,
      imageUrl,
    };
  }, []);

  /**
   * Verifica si un elemento es o está dentro de un elemento con data-context.
   * Responsabilidad única: Identificar elementos contextuales.
   */
  const isContextElement = useCallback((element: HTMLElement): boolean => {
    return element.closest(CONTEXT_SELECTOR) !== null;
  }, []);

  /**
   * Previene la propagación de eventos.
   * Responsabilidad única: Bloquear eventos.
   */
  const preventEventPropagation = useCallback((event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }, []);

  /**
   * Maneja clics en elementos contextuales.
   * Responsabilidad única: Capturar contexto cuando se hace clic.
   */
  const handleObjectClick = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    
    // Solo procesar si es un elemento contextual
    if (!isContextElement(target)) return;

    const elementWithContext = target.closest(CONTEXT_SELECTOR) as HTMLElement;
    preventEventPropagation(event);

    const context = extractContextFromElement(elementWithContext);
    
    // Desactivar modo contexto ANTES de notificar
    setIsContextMode(false);
    setSelectedContext(null);
    
    // Notificar al componente padre que se seleccionó un contexto
    onContextSelected?.(context);
  }, [isContextElement, extractContextFromElement, preventEventPropagation, onContextSelected]);

  /**
   * Bloquea acciones SOLO en elementos con data-context.
   * Responsabilidad única: Prevenir acciones no deseadas en elementos contextuales.
   */
  const blockElementActions = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    
    // SOLO bloquear si el elemento tiene data-context
    if (isContextElement(target)) {
      preventEventPropagation(event);
    }
  }, [isContextElement, preventEventPropagation]);


  /**
   * Agrega event listeners cuando el modo contexto está activo.
   * Responsabilidad única: Configurar escucha de eventos.
   */
  const addEventListeners = useCallback(() => {
    document.addEventListener('click', handleObjectClick, true);
     
    BLOCKED_EVENT_TYPES.forEach(eventType => {
      document.addEventListener(eventType, blockElementActions, true);
    });
    
    document.body.classList.add(CONTEXT_MODE_CLASS);
  }, [handleObjectClick, blockElementActions]);

  /**
   * Remueve event listeners cuando el modo contexto se desactiva.
   * Responsabilidad única: Limpiar escucha de eventos.
   */
  const removeEventListeners = useCallback(() => {
    document.removeEventListener('click', handleObjectClick, true);
    
    BLOCKED_EVENT_TYPES.forEach(eventType => {
      document.removeEventListener(eventType, blockElementActions, true);
    });
    
    document.body.classList.remove(CONTEXT_MODE_CLASS);
  }, [handleObjectClick, blockElementActions]);


  /**
   * Alterna el estado del modo contexto.
   * Responsabilidad única: Controlar activación/desactivación.
   */
  const toggleContextMode = useCallback(() => {
    setIsContextMode((prev) => {
      const newValue = !prev;
      
      if (!newValue) {
        setSelectedContext(null);
      }
      
      return newValue;
    });
  }, []);

  /**
   * Limpia el contexto seleccionado.
   * Responsabilidad única: Resetear estado de contexto.
   */
  const clearContext = useCallback(() => {
    setSelectedContext(null);
  }, []);

  /**
   * Desactiva el modo contexto manualmente.
   * Responsabilidad única: Desactivación explícita.
   */
  const deactivateContextMode = useCallback(() => {
    setIsContextMode(false);
    setSelectedContext(null);
  }, []);

  /**
   * Gestiona event listeners según el estado del modo contexto.
   * Responsabilidad única: Sincronizar listeners con estado.
   */
  useEffect(() => {
    if (isContextMode) {
      addEventListeners();
    } else {
      removeEventListeners();
    }

    return removeEventListeners;
  }, [isContextMode, addEventListeners, removeEventListeners]);

  return {
    isContextMode,
    selectedContext,
    toggleContextMode,
    clearContext,
    deactivateContextMode,
  };
};
