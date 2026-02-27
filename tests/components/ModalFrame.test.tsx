import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ModalFrame } from "../../lib/components/ModalFrame.js";
import type { ModalItem } from "../../lib/types.js";
import { closeAllModals } from "../../lib/api.js";

function Content({ label, closeModal }: { label: string; closeModal: () => void }) {
  return (
    <div>
      <span data-testid="content-label">{label}</span>
      <button type="button" onClick={closeModal}>
        Close from content
      </button>
    </div>
  );
}

function createItem(overrides: Partial<ModalItem> = {}): ModalItem {
  return {
    id: "test-id",
    component: Content,
    props: { label: "Test content" },
    phase: "entered",
    hideHeader: false,
    disableClickOutside: false,
    disableEsc: false,
    disableAutoFocus: false,
    ...overrides,
  };
}

describe("ModalFrame", () => {
  beforeEach(() => {
    closeAllModals();
  });

  it("renders the modal content component with props and closeModal", () => {
    const item = createItem();
    const { container } = render(<ModalFrame item={item} isTop={true} />);
    expect(within(container).getByTestId("content-label")).toHaveTextContent("Test content");
    expect(within(container).getByRole("button", { name: /close from content/i })).toBeInTheDocument();
  });

  it("renders dialog with role dialog and aria-modal", () => {
    const item = createItem();
    const { container } = render(<ModalFrame item={item} isTop={true} />);
    const dialog = within(container).getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("renders title in header when title is provided and hideHeader is false", () => {
    const item = createItem({ title: "My Modal Title" });
    const { container } = render(<ModalFrame item={item} isTop={true} />);
    expect(within(container).getByRole("heading", { name: "My Modal Title" })).toBeInTheDocument();
  });

  it("renders close button when hideHeader is false", () => {
    const item = createItem();
    const { container } = render(<ModalFrame item={item} isTop={true} />);
    expect(within(container).getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("does not render header (title and close button) when hideHeader is true", () => {
    const item = createItem({ title: "Hidden", hideHeader: true });
    const { container } = render(<ModalFrame item={item} isTop={true} />);
    expect(within(container).queryByRole("heading")).not.toBeInTheDocument();
    expect(within(container).queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("renders footer when footer option is provided", () => {
    function FooterComp({ text }: { text: string; closeModal: () => void }) {
      return <span data-testid="footer-text">{text}</span>;
    }
    const item = createItem({
      footer: { component: FooterComp, props: { text: "Footer content" } },
    });
    const { container } = render(<ModalFrame item={item} isTop={true} />);
    expect(within(container).getByTestId("footer-text")).toHaveTextContent("Footer content");
  });

  it("passes closeModal to footer component", () => {
    function FooterWithClose({ closeModal }: { closeModal: () => void }) {
      return (
        <button type="button" onClick={closeModal}>
          Close from footer
        </button>
      );
    }
    const item = createItem({
      footer: { component: FooterWithClose },
    });
    const { container } = render(<ModalFrame item={item} isTop={true} />);
    expect(within(container).getByRole("button", { name: /close from footer/i })).toBeInTheDocument();
  });

  it("applies modals-frame-dim when not top", () => {
    const item = createItem();
    const { container } = render(<ModalFrame item={item} isTop={false} />);
    const dialog = within(container).getByRole("dialog");
    expect(dialog).toHaveClass("modals-frame-dim");
  });

  it("does not apply modals-frame-dim when is top", () => {
    const item = createItem();
    const { container } = render(<ModalFrame item={item} isTop={true} />);
    const dialog = within(container).getByRole("dialog");
    expect(dialog).not.toHaveClass("modals-frame-dim");
  });

  it("applies custom className from item", () => {
    const item = createItem({ className: "my-custom-modal" });
    const { container } = render(<ModalFrame item={item} isTop={true} />);
    const dialog = within(container).getByRole("dialog");
    expect(dialog).toHaveClass("my-custom-modal");
  });

  it("has clickable close button", () => {
    const item = createItem();
    const { container } = render(<ModalFrame item={item} isTop={true} />);
    const closeBtn = within(container).getByRole("button", { name: "Close" });
    expect(closeBtn).toBeInTheDocument();
    closeBtn.click();
    expect(closeBtn).toBeInTheDocument();
  });
});
