import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { ModalRoot } from "../../lib/components/ModalRoot.js";
import { pushModal, closeAllModals, closeModalById, popModal } from "../../lib/api.js";

function DummyContent() {
  return <div data-testid="dummy-content">Content</div>;
}

describe("ModalRoot", () => {
  beforeEach(() => {
    closeAllModals();
  });

  afterEach(() => {
    cleanup();
    closeAllModals();
    vi.useRealTimers();
  });

  it("renders nothing when stack is empty", () => {
    const { container } = render(<ModalRoot />);
    expect(container.firstChild).toBeNull();
  });

  it("renders overlay and modal when pushModal was called", async () => {
    render(<ModalRoot />);
    pushModal({ component: DummyContent });
    const content = await screen.findByTestId("dummy-content");
    expect(content).toBeInTheDocument();
    expect(document.querySelector(".modals-overlay")).toBeInTheDocument();
    const dialogs = screen.getAllByRole("dialog");
    expect(dialogs.length).toBeGreaterThanOrEqual(1);
  });

  it("renders modal with title when title option is passed", async () => {
    render(<ModalRoot />);
    pushModal({ component: DummyContent, title: "Test Modal" });
    const headings = await screen.findAllByRole("heading", { name: "Test Modal" });
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("renders multiple modals when pushModal called multiple times", async () => {
    function First() {
      return <span data-testid="first">First</span>;
    }
    function Second() {
      return <span data-testid="second">Second</span>;
    }
    render(<ModalRoot />);
    pushModal({ component: First });
    pushModal({ component: Second });
    expect(await screen.findByTestId("first")).toBeInTheDocument();
    const seconds = screen.getAllByTestId("second");
    expect(seconds.length).toBeGreaterThanOrEqual(1);
    const dialogs = screen.getAllByRole("dialog");
    expect(dialogs.length).toBeGreaterThanOrEqual(2);
  });

  it("unmounts modal after closeModalById(id) and timer", async () => {
    vi.useFakeTimers();
    render(<ModalRoot />);
    const id = pushModal({ component: DummyContent });
    await vi.advanceTimersByTimeAsync(0);
    expect(screen.getByTestId("dummy-content")).toBeInTheDocument();
    closeModalById(id);
    await vi.advanceTimersByTimeAsync(250);
    expect(screen.queryAllByTestId("dummy-content")).toHaveLength(0);
  });

  it("unmounts all modals after closeAllModals", async () => {
    render(<ModalRoot />);
    pushModal({ component: DummyContent });
    expect(await screen.findByTestId("dummy-content")).toBeInTheDocument();
    closeAllModals();
    await waitFor(() => {
      expect(screen.queryAllByTestId("dummy-content")).toHaveLength(0);
    });
  });

  it("passes closeModal to content component and it closes the modal", async () => {
    vi.useFakeTimers();
    function ContentWithClose({ closeModal }: { closeModal: () => void }) {
      return (
        <div>
          <span data-testid="with-close">Content</span>
          <button type="button" onClick={closeModal}>
            Close
          </button>
        </div>
      );
    }
    render(<ModalRoot />);
    pushModal({ component: ContentWithClose });
    await vi.advanceTimersByTimeAsync(0);
    expect(screen.getByTestId("with-close")).toBeInTheDocument();
    const contentClose = screen.getAllByRole("button", { name: "Close" }).find((el) => !el.classList.contains("modals-close"));
    contentClose!.click();
    await vi.advanceTimersByTimeAsync(250);
    expect(screen.queryAllByTestId("with-close")).toHaveLength(0);
  });
});
