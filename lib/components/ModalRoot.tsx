import { useState, useEffect, useRef, createElement, Fragment } from "react";
import { createPortal } from "react-dom";
import { getStack, subscribe } from "../store.js";
import { Overlay } from "./Overlay.js";
import { ModalFrame } from "./ModalFrame.js";
import "../styles/modal.css";

const ANIMATION_DURATION = 200;

export interface ModalRootProps {
  /**
   * When `true`, applies `overflow: hidden` to `document.body` while any modal is open,
   * hiding the body scrollbar. Restored when the stack is empty. Default: `false`.
   */
  disableBodyScroll?: boolean;
}

/**
 * Renders the modal stack and overlay. Must be mounted once in your app (e.g. root layout)
 * for {@link pushModal}, {@link popModal}, and {@link closeModalById} to work.
 * Renders modals via a portal into `document.body`.
 */
export function ModalRoot({ disableBodyScroll = false }: ModalRootProps = {}) {
  const [stack, setStack] = useState(getStack);
  const [, setClearExitingDim] = useState(0);
  const prevStackLenRef = useRef(0);
  const exitingDimOverlayIdRef = useRef<string | null>(null);

  useEffect(() => {
    return subscribe(() => setStack([...getStack()]));
  }, []);

  useEffect(() => {
    if (!disableBodyScroll || typeof document === "undefined") return;
    const { body } = document;
    if (stack.length > 0) {
      const prev = body.style.overflow;
      body.style.overflow = "hidden";
      return () => {
        body.style.overflow = prev;
      };
    }
  }, [disableBodyScroll, stack.length]);

  const len = stack.length;
  const prevLen = prevStackLenRef.current;
  if (len === 1 && prevLen === 2) {
    exitingDimOverlayIdRef.current = stack[0]?.id ?? null;
  } else if (len !== 1) {
    exitingDimOverlayIdRef.current = null;
  }
  prevStackLenRef.current = len;

  const exitingDimOverlayId = exitingDimOverlayIdRef.current;

  useEffect(() => {
    if (len === 1 && exitingDimOverlayIdRef.current) {
      const t = setTimeout(() => {
        exitingDimOverlayIdRef.current = null;
        setClearExitingDim((c) => c + 1);
      }, ANIMATION_DURATION);
      return () => clearTimeout(t);
    }
  }, [len]);

  if (len === 0) return null;

  const topId = stack[stack.length - 1]?.id ?? null;
  const topExiting =
    stack.length > 0 && stack[stack.length - 1]?.phase === "exiting";

  const globalOverlayExiting = topExiting && stack.length === 1;

  const children: ReturnType<typeof createElement>[] = [
    createElement(Overlay, {
      key: "overlay-global",
      exiting: globalOverlayExiting,
      style: { zIndex: 9998 },
    }),
  ];

  stack.forEach((item, index) => {
    const isTop = item.id === topId;
    const zIndexFrame = 9999 + index * 2;
    const dimExitingBecauseSecond = index === stack.length - 2 && topExiting;
    const dimExitingBecauseJustBecameTop = item.id === exitingDimOverlayId;
    const dimOverlayExiting = dimExitingBecauseSecond || dimExitingBecauseJustBecameTop;
    children.push(
      createElement(ModalFrame, {
        key: item.id,
        item,
        isTop,
        style: { zIndex: zIndexFrame },
        dimOverlayExiting: (!isTop || dimExitingBecauseJustBecameTop) ? dimOverlayExiting : undefined,
      })
    );
  });

  return createPortal(
    createElement(Fragment, null, ...children),
    document.body
  );
}
