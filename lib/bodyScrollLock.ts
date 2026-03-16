import type { RefObject } from "react";

let cleanup: (() => void) | null = null;

function isScrollable(el: Element): boolean {
  const style = getComputedStyle(el);
  const oy = style.overflowY;
  const o = style.overflow;
  return oy === "auto" || oy === "scroll" || o === "auto" || o === "scroll";
}

/**
 * Returns true if the event target is inside a scrollable element within the portal
 * (so we should allow the scroll and not preventDefault).
 */
function isInsideScrollable(portalRoot: HTMLElement, target: EventTarget | null): boolean {
  if (!target || !(target instanceof Node)) return false;
  if (!portalRoot.contains(target)) return false;
  let el: Node | null = target as Element;
  while (el && el !== portalRoot) {
    if (el instanceof Element && isScrollable(el)) return true;
    el = el.parentElement;
  }
  return false;
}

/**
 * Locks background scroll by adding document-level wheel and touchmove listeners
 * with { passive: false }. Does not modify body/html (no overflow or position).
 * preventDefault is only called when the event target is outside the portal or
 * inside the portal but not inside a scrollable container.
 */
export function lockBodyScroll(portalRootRef: RefObject<HTMLElement | null>): void {
  if (cleanup) return;
  const onWheel = (e: WheelEvent) => {
    const root = portalRootRef.current;
    if (!root) return;
    if (isInsideScrollable(root, e.target)) return;
    e.preventDefault();
  };
  const onTouchMove = (e: TouchEvent) => {
    const root = portalRootRef.current;
    if (!root) return;
    if (isInsideScrollable(root, e.target)) return;
    e.preventDefault();
  };
  document.addEventListener("wheel", onWheel, { passive: false });
  document.addEventListener("touchmove", onTouchMove, { passive: false });
  cleanup = () => {
    document.removeEventListener("wheel", onWheel);
    document.removeEventListener("touchmove", onTouchMove);
    cleanup = null;
  };
}

export function unlockBodyScroll(): void {
  if (cleanup) {
    cleanup();
  }
}
