import { createElement, useRef, useEffect, useCallback, type MouseEvent } from "react";
import type { ModalItem } from "../types.js";
import { createCloseModal } from "../api.js";
import { useFocusTrap } from "../useFocusTrap.js";
import { updateItemPhase } from "../store.js";

const ANIMATION_DURATION = 200;

interface ModalFrameProps {
  item: ModalItem;
  isTop: boolean;
}

export function ModalFrame({ item, isTop }: ModalFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const closeModal = useCallback(createCloseModal(item.id), [item.id]);

  useFocusTrap(frameRef, isTop, item.disableAutoFocus === true);

  useEffect(() => {
    if (item.phase === "entering") {
      const id = setTimeout(() => {
        updateItemPhase(item.id, "entered");
      }, ANIMATION_DURATION);
      return () => clearTimeout(id);
    }
  }, [item.id, item.phase]);

  useEffect(() => {
    if (!isTop || item.disableEsc) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeModal();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTop, item.disableEsc, closeModal]);

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (isTop && !item.disableClickOutside) {
      closeModal();
    }
  };

  const Content = item.component;
  const mergedProps = {
    ...(typeof item.props === "object" && item.props !== null ? item.props : {}),
    closeModal,
  } as typeof item.props & { closeModal: () => void };

  const widthStyle =
    item.width != null
      ? { width: typeof item.width === "number" ? `${item.width}px` : item.width }
      : undefined;
  const heightStyle =
    item.height != null
      ? {
          height:
            typeof item.height === "number" ? `${item.height}px` : item.height,
        }
      : undefined;
  const sizeStyle = { ...widthStyle, ...heightStyle };

  return createElement(
    "div",
    {
      className: "modals-layer",
      onClick: handleBackdropClick,
      role: "presentation",
    },
      createElement(
        "div",
        {
          ref: frameRef,
          tabIndex: -1,
          role: "dialog",
          "aria-modal": true,
          "aria-labelledby": item.title && !item.hideHeader ? `modal-title-${item.id}` : undefined,
          className: `modals-frame ${item.phase === "exiting" ? "modals-frame-exit" : ""} ${!isTop ? "modals-frame-dim" : ""} ${item.footer ? "modals-frame-has-footer" : ""} ${item.className ?? ""}`.trim(),
          style: sizeStyle,
          onClick: (e: MouseEvent<HTMLDivElement>) => e.stopPropagation(),
        },
        createElement(
          "div",
          { className: "modals-body" },
          !item.hideHeader &&
            createElement(
              "button",
              {
                type: "button",
                "aria-label": "Close",
                className: "modals-close",
                onClick: closeModal,
              },
              createElement(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  width: 20,
                  height: 20,
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: 2,
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  "aria-hidden": true,
                },
                createElement("path", { d: "M18 6 6 18" }),
                createElement("path", { d: "m6 6 12 12" })
              )
            ),
          !item.hideHeader && item.title != null &&
            createElement(
              "div",
              { className: "modals-header" },
              createElement("h2", { className: "modals-title", id: `modal-title-${item.id}` }, item.title)
            ),
          createElement(
            "div",
            { className: "modals-content" },
            createElement(Content, mergedProps)
          )
        ),
        item.footer &&
          createElement(
            "div",
            { className: `modals-footer ${item.footer.className ?? ""}`.trim() },
            createElement(item.footer.component, {
              ...(typeof item.footer.props === "object" && item.footer.props !== null ? item.footer.props : {}),
              closeModal,
            })
          )
      )
  );
}
