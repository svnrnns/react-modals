import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useFocusTrap } from "../../lib/useFocusTrap.js";
import { useRef } from "react";

function TestComponent({
  enabled,
  disableAutoFocus,
}: {
  enabled: boolean;
  disableAutoFocus?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, enabled, disableAutoFocus ?? false);
  return (
    <div ref={ref} data-testid="trap-container">
      <button type="button">First</button>
      <a href="#link">Link</a>
      <input type="text" aria-label="Input" />
    </div>
  );
}

describe("useFocusTrap", () => {
  it("moves focus to first focusable element when enabled and disableAutoFocus false", () => {
    render(<TestComponent enabled={true} />);
    const first = screen.getByRole("button", { name: "First" });
    expect(document.activeElement).toBe(first);
  });

  it("does not move focus when disableAutoFocus is true", () => {
    const previousFocus = document.activeElement;
    render(<TestComponent enabled={true} disableAutoFocus={true} />);
    expect(document.activeElement).toBe(previousFocus);
  });

  it("focuses container when no focusable elements and disableAutoFocus false", () => {
    function NoFocusable({ enabled }: { enabled: boolean }) {
      const ref = useRef<HTMLDivElement>(null);
      useFocusTrap(ref, enabled, false);
      return (
        <div ref={ref} data-testid="no-focusable">
          <span>Just text</span>
        </div>
      );
    }
    render(<NoFocusable enabled={true} />);
    const container = screen.getByTestId("no-focusable");
    expect(document.activeElement).toBe(container);
  });

  it("skips close button when choosing first focusable", () => {
    function WithCloseButton({ enabled }: { enabled: boolean }) {
      const ref = useRef<HTMLDivElement>(null);
      useFocusTrap(ref, enabled, false);
      return (
        <div ref={ref} data-testid="with-close">
          <button type="button" className="modals-close" aria-label="Close">
            ×
          </button>
          <input type="text" aria-label="First focusable" />
        </div>
      );
    }
    render(<WithCloseButton enabled={true} />);
    const input = screen.getByRole("textbox", { name: "First focusable" });
    expect(document.activeElement).toBe(input);
  });
});
