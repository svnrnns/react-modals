import { createElement, type CSSProperties } from "react";

interface OverlayProps {
  exiting: boolean;
  style?: CSSProperties;
  /** When true, same background as global overlay but no blur (for non-top modals in stack) */
  dimOnly?: boolean;
  /** When true, overlay fills its parent (position: absolute) instead of viewport; for dim overlays per modal */
  inner?: boolean;
}

export function Overlay({ exiting, style, dimOnly = false, inner = false }: OverlayProps) {
  const className = [
    "modals-overlay",
    dimOnly ? "modals-overlay-dim" : "",
    inner ? "modals-overlay-inner" : "",
    exiting ? "modals-overlay-exit" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return createElement("div", {
    "aria-hidden": true,
    className,
    style,
  });
}
