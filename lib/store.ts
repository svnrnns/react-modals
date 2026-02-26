import type { ModalItem, Listener } from "./types.js";

const stack: ModalItem[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function getStack(): ModalItem[] {
  return stack;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function pushItem(item: ModalItem): void {
  stack.push(item);
  notify();
}

export function removeItem(id: string): void {
  const index = stack.findIndex((m) => m.id === id);
  if (index !== -1) {
    stack.splice(index, 1);
    notify();
  }
}

export function updateItemPhase(id: string, phase: ModalItem["phase"]): void {
  const item = stack.find((m) => m.id === id);
  if (item) {
    item.phase = phase;
    notify();
  }
}

export function getTopId(): string | null {
  return stack.length > 0 ? stack[stack.length - 1].id : null;
}

export function popItem(): ModalItem | undefined {
  const removed = stack.pop();
  notify();
  return removed;
}

export function clearStack(): ModalItem[] {
  const copy = [...stack];
  stack.length = 0;
  notify();
  return copy;
}

/** Remove item by id (for closeModalById); returns the removed item */
export function removeItemById(id: string): ModalItem | undefined {
  const index = stack.findIndex((m) => m.id === id);
  if (index === -1) return undefined;
  const [removed] = stack.splice(index, 1);
  notify();
  return removed;
}
