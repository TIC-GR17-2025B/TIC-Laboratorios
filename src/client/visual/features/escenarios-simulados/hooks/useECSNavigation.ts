import { useState, useCallback } from "react";

export function useECSNavigation() {
  const [zoomCommand, setZoomCommand] = useState<"in" | "out" | null>(null);
  const [dispositivoIndex, setDispositivoIndex] = useState(0);
  const [focusTarget, setFocusTarget] = useState<
    [number, number, number] | null
  >(null);

  const zoomIn = useCallback(() => setZoomCommand("in"), []);
  const zoomOut = useCallback(() => setZoomCommand("out"), []);
  const clearZoomCommand = useCallback(() => setZoomCommand(null), []);
  const clearFocusTarget = useCallback(() => setFocusTarget(null), []);

  return {
    zoomCommand,
    dispositivoIndex,
    setDispositivoIndex,
    focusTarget,
    setFocusTarget,
    zoomIn,
    zoomOut,
    clearZoomCommand,
    clearFocusTarget,
  };
}
