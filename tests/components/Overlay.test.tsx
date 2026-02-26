import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Overlay } from "../../lib/components/Overlay.js";

describe("Overlay", () => {
  it("renders a div with modals-overlay class", () => {
    const { container } = render(<Overlay exiting={false} />);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveClass("modals-overlay");
  });

  it("adds modals-overlay-exit when exiting is true", () => {
    const { container } = render(<Overlay exiting={true} />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("modals-overlay-exit");
  });

  it("does not add modals-overlay-exit when exiting is false", () => {
    const { container } = render(<Overlay exiting={false} />);
    const el = container.firstChild as HTMLElement;
    expect(el).not.toHaveClass("modals-overlay-exit");
  });

  it("has aria-hidden true", () => {
    const { container } = render(<Overlay exiting={false} />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });
});
