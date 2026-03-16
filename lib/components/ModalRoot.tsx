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

  const scrollLockRef = useRef<number | null>(null);

  useEffect(() => {
    if (!disableBodyScroll || typeof document === "undefined") return;
    const { documentElement: html, body } = document;
    if (stack.length > 0) {
      const scrollY = window.scrollY ?? window.pageYOffset;
      scrollLockRef.current = scrollY;

      const prevHtmlOverflow = html.style.overflow;
      const prevHtmlPosition = html.style.position;
      const prevHtmlTop = html.style.top;
      const prevHtmlWidth = html.style.width;
      const prevBodyOverflow = body.style.overflow;
      const prevBodyPosition = body.style.position;
      const prevBodyTop = body.style.top;
      const prevBodyLeft = body.style.left;
      const prevBodyWidth = body.style.width;

      html.style.overflow = "hidden";
      html.style.position = "fixed";
      html.style.top = `-${scrollY}px`;
      html.style.width = "100%";
      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.width = "100%";

      return () => {
        html.style.overflow = prevHtmlOverflow;
        html.style.position = prevHtmlPosition;
        html.style.top = prevHtmlTop;
        html.style.width = prevHtmlWidth;
        body.style.overflow = prevBodyOverflow;
        body.style.position = prevBodyPosition;
        body.style.top = prevBodyTop;
        body.style.left = prevBodyLeft;
        body.style.width = prevBodyWidth;
        const y = scrollLockRef.current ?? 0;
        scrollLockRef.current = null;
        window.scrollTo(0, y);
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
