import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getStack, subscribe } from "../store.js";
import { Overlay } from "./Overlay.js";
import { ModalFrame } from "./ModalFrame.js";
import "../styles/modal.css";

/**
 * Renders the modal stack and overlay. Must be mounted once in your app (e.g. root layout)
 * for {@link pushModal}, {@link popModal}, and {@link closeModalById} to work.
 * Renders modals via a portal into `document.body`.
 */
export function ModalRoot() {
  const [stack, setStack] = useState(getStack);

  useEffect(() => {
    return subscribe(() => setStack([...getStack()]));
  }, []);

  if (stack.length === 0) return null;

  const topId = stack[stack.length - 1]?.id ?? null;
  const topExiting =
    stack.length > 0 && stack[stack.length - 1]?.phase === "exiting";
  const overlayExiting = topExiting && stack.length === 1;

  return createPortal(
    [
      <Overlay key="overlay" exiting={overlayExiting} />,
      ...stack.map((item) => (
        <ModalFrame
          key={item.id}
          item={item}
          isTop={item.id === topId}
        />
      )),
    ],
    document.body
  );
}
