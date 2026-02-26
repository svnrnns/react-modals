import { createElement } from "react";

interface OverlayProps {
  exiting: boolean;
}

export function Overlay({ exiting }: OverlayProps) {
  return createElement("div", {
    "aria-hidden": true,
    className: `modals-overlay ${exiting ? "modals-overlay-exit" : ""}`.trim(),
  });
}
