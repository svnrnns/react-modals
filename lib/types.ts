import type { ComponentType } from "react";

/**
 * Animation phase of a modal in the stack.
 * - `entering`: modal just opened, playing enter animation
 * - `entered`: modal is fully visible
 * - `exiting`: modal is closing, playing exit animation
 */
export type ModalPhase = "entering" | "entered" | "exiting";

/**
 * Props passed to the footer component. Includes all custom props plus the injected `closeModal` function.
 * @template T - Custom props type of the footer component
 */
export type ModalFooterComponentProps<T = object> = T & { closeModal: () => void };

/**
 * Options for rendering a custom footer inside the modal.
 * The footer component receives props plus closeModal (same as the modal content).
 * @template P - Props type of the footer component (excluding closeModal)
 */
export interface ModalFooterOptions<P = object> {
  /** React component to render in the footer. Receives props plus `closeModal`. */
  component: ComponentType<ModalFooterComponentProps<P>>;
  /** Props passed to the footer component. Type is inferred from the component. */
  props?: P;
  /** Optional class name for the footer wrapper */
  className?: string;
}

/**
 * Internal representation of a modal in the stack.
 * @template P - Props type of the modal content component (excluding closeModal)
 */
export interface ModalItem<P = unknown> {
  /** Unique id for this modal instance */
  id: string;
  /** Component to render; receives props plus closeModal */
  component: ComponentType<P & { closeModal: () => void }>;
  /** Props for the component */
  props: P;
  width?: string | number;
  height?: string | number;
  className?: string;
  title?: string;
  hideHeader?: boolean;
  footer?: ModalFooterOptions<any>;
  onClose?: () => void;
  disableClickOutside?: boolean;
  disableEsc?: boolean;
  disableAutoFocus?: boolean;
  /** Current animation phase */
  phase: ModalPhase;
}

/**
 * Props passed to the modal content component. Includes all custom props plus the injected `closeModal` function.
 * @template T - Custom props type of the modal content component
 */
export type ModalComponentProps<T = object> = T & { closeModal: () => void };

/**
 * Options for {@link pushModal}. Props are inferred from the component when using generics.
 * @template T - Props type of the modal content component (excluding closeModal)
 * @template F - Props type of the footer component (excluding closeModal)
 */
export interface PushModalOptions<T = object, F = object> {
  /** React component to render as the modal body. Receives props plus `closeModal`. */
  component: ComponentType<ModalComponentProps<T>>;
  /** Props passed to the component. Type is inferred from the component. */
  props?: T;
  /** Optional modal width (e.g. `"400px"` or `400`) */
  width?: string | number;
  /** Optional modal height (e.g. `"300px"` or `300`) */
  height?: string | number;
  /** Optional class name for the modal wrapper */
  className?: string;
  /** Optional title shown in the header */
  title?: string;
  /** If true, header (title + close button) is hidden */
  hideHeader?: boolean;
  /** Optional footer configuration. Footer props are inferred from component/props. */
  footer?: ModalFooterOptions<F>;
  /** Callback when the modal is closed */
  onClose?: () => void;
  /** If true, clicking the backdrop does not close the modal */
  disableClickOutside?: boolean;
  /** If true, Escape key does not close the modal */
  disableEsc?: boolean;
  /** If true, no element is focused when the modal opens (focus trap still active for Tab) */
  disableAutoFocus?: boolean;
}

/** Callback subscribed to store changes (used internally by ModalRoot) */
export type Listener = () => void;
