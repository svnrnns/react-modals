import "./styles/modal.css";

export { ModalRoot } from "./components/ModalRoot.js";
export { pushModal, popModal, closeAllModals, closeModalById, } from "./api.js";
export type {
  PushModalOptions,
  ModalFooterOptions,
  ModalFooterComponentProps,
  ModalItem,
  ModalComponentProps,
  ModalPhase,
  Listener,
} from "./types.js";
