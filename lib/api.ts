import type { PushModalOptions, ModalItem } from "./types.js";
import {
  pushItem,
  removeItemById,
  updateItemPhase,
  popItem,
  clearStack,
  getTopId,
  getStack,
} from "./store.js";

const ANIMATION_DURATION = 200;

function generateId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `modal-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Opens a new modal and pushes it onto the stack.
 * @param options - Configuration for the modal (component, props, title, etc.)
 * @returns The generated modal id. Use this id with {@link closeModalById} to close this modal later.
 * @example
 * const id = pushModal({ component: MyForm, props: { name: "Edit" }, title: "Edit profile" });
 * // later: closeModalById(id);
 */
export function pushModal<T = object, F = object>(options: PushModalOptions<T, F>): string {
  const id = generateId();
  const item: ModalItem = {
    id,
    component: options.component as ModalItem["component"],
    props: (options.props ?? {}) as object,
    width: options.width,
    height: options.height,
    className: options.className,
    title: options.title,
    hideHeader: options.hideHeader ?? false,
    footer: options.footer,
    onClose: options.onClose,
    disableClickOutside: options.disableClickOutside ?? false,
    disableEsc: options.disableEsc ?? false,
    disableAutoFocus: options.disableAutoFocus ?? false,
    phase: "entering",
  };
  pushItem(item);
  return id;
}

/**
 * Closes the topmost modal (the one currently on top of the stack).
 * Plays the exit animation and calls its `onClose` callback.
 */
export function popModal(): void {
  const top = getTopId();
  if (!top) return;
  updateItemPhase(top, "exiting");
  setTimeout(() => {
    const removed = popItem();
    removed?.onClose?.();
  }, ANIMATION_DURATION);
}

/**
 * Closes the modal with the given id.
 * @param id - Modal id (e.g. the one returned by {@link pushModal})
 */
export function closeModalById(id: string): void {
  const stack = getStack();
  const item = stack.find((m) => m.id === id);
  if (!item) return;
  updateItemPhase(id, "exiting");
  setTimeout(() => {
    const removed = removeItemById(id);
    removed?.onClose?.();
  }, ANIMATION_DURATION);
}

/**
 * Closes all open modals at once. Each modal's `onClose` callback is invoked.
 */
export function closeAllModals(): void {
  const items = clearStack();
  items.forEach((item) => item.onClose?.());
}

/** Create a closeModal callback bound to a modal id (used internally by ModalFrame) */
export function createCloseModal(id: string): () => void {
  return () => closeModalById(id);
}
