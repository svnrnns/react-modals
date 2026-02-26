import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ModalRoot } from "../../lib/components/ModalRoot.js";
import { pushModal, closeModalById, popModal, closeAllModals } from "../../lib/api.js";

function SimpleContent({ name, closeModal }: { name: string; closeModal: () => void }) {
  return (
    <div>
      <p data-testid="greeting">Hello, {name}</p>
      <button type="button" onClick={closeModal}>
        Close
      </button>
    </div>
  );
}

describe("integration: modal flow", () => {
  beforeEach(() => {
    closeAllModals();
  });

  afterEach(() => {
    cleanup();
    closeAllModals();
    vi.useRealTimers();
  });

  it("open modal with pushModal, content receives props and closeModal", async () => {
    vi.useFakeTimers();
    render(<ModalRoot />);
    const id = pushModal({
      component: SimpleContent,
      props: { name: "World" },
      title: "Greeting",
    });
    expect(id).toBeTypeOf("string");
    await vi.advanceTimersByTimeAsync(0);
    expect(screen.getByTestId("greeting")).toHaveTextContent("Hello, World");
    expect(screen.getByRole("heading", { name: "Greeting" })).toBeInTheDocument();
    const contentClose = screen.getAllByRole("button", { name: "Close" }).find((el) => !el.classList.contains("modals-close"));
    contentClose!.click();
    await vi.advanceTimersByTimeAsync(250);
    expect(screen.queryAllByTestId("greeting")).toHaveLength(0);
  });

  it("closeModalById(id) closes the correct modal in a stack", async () => {
    vi.useFakeTimers();
    function A() {
      return <span data-testid="modal-a">A</span>;
    }
    function B() {
      return <span data-testid="modal-b">B</span>;
    }
    render(<ModalRoot />);
    const idA = pushModal({ component: A });
    pushModal({ component: B });
    await vi.advanceTimersByTimeAsync(0);
    expect(screen.getByTestId("modal-a")).toBeInTheDocument();
    expect(screen.getByTestId("modal-b")).toBeInTheDocument();
    closeModalById(idA);
    await vi.advanceTimersByTimeAsync(250);
    expect(screen.queryAllByTestId("modal-a")).toHaveLength(0);
    expect(screen.getByTestId("modal-b")).toBeInTheDocument();
  });

  it("popModal closes the top modal", async () => {
    vi.useFakeTimers();
    function A() {
      return <span data-testid="modal-a">A</span>;
    }
    function B() {
      return <span data-testid="modal-b">B</span>;
    }
    render(<ModalRoot />);
    pushModal({ component: A });
    pushModal({ component: B });
    await vi.advanceTimersByTimeAsync(0);
    expect(screen.getByTestId("modal-a")).toBeInTheDocument();
    expect(screen.getByTestId("modal-b")).toBeInTheDocument();
    popModal();
    await vi.advanceTimersByTimeAsync(250);
    expect(screen.getByTestId("modal-a")).toBeInTheDocument();
    expect(screen.queryAllByTestId("modal-b")).toHaveLength(0);
  });

  it("onClose is called when modal is closed", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<ModalRoot />);
    const id = pushModal({ component: SimpleContent, props: { name: "x" }, onClose });
    expect(onClose).not.toHaveBeenCalled();
    closeModalById(id);
    vi.advanceTimersByTime(250);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
