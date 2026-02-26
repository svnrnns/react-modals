# @svnrnns/react-modals

Modal stack manager for React and Next.js. Open modals imperatively with `pushModal()`; they stack on screen with an overlay, animations, and focus trap.

## Install

```bash
npm install @svnrnns/react-modals
```

## Setup

1. Mount `ModalRoot` once in your app (e.g. in your root layout).

```tsx
import { ModalRoot } from "@svnrnns/react-modals";
import "@svnrnns/react-modals/styles.css";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ModalRoot />
        {children}
      </body>
    </html>
  );
}
```

2. Import and use `pushModal`, `popModal`, `closeModalById`, and `closeAllModals` anywhere (no context needed).

## Usage

### Basic modal

```tsx
import { pushModal } from "@svnrnns/react-modals";

function MyContent({
  name,
  closeModal,
}: {
  name: string;
  closeModal: () => void;
}) {
  return (
    <div>
      <p>Hello, {name}</p>
      <button onClick={closeModal}>Close</button>
    </div>
  );
}

function App() {
  return (
    <button
      onClick={() =>
        pushModal({
          component: MyContent,
          props: { name: "World" },
          title: "Greeting",
        })
      }
    >
      Open modal
    </button>
  );
}
```

TypeScript infers `props` from your component, so `props: { name: "World" }` is type-checked.

### Options

- **component** – React component to render (receives `props` + `closeModal`).
- **props** – Props for the component (inferred from `component`).
- **title** – Optional title in the modal header.
- **hideHeader** – If `true`, the header (title + close button) is hidden; close via Escape, click outside, or a button in the content.
- **width** / **height** – Optional modal size (e.g. `"400px"`, `400`).
- **className** – Optional class for the modal wrapper.
- **footer** – Optional `{ component, props?, className? }` for a footer component.
- **onClose** – Callback when the modal is closed.
- **disableClickOutside** – If `true`, clicking the backdrop does not close.
- **disableEsc** – If `true`, Escape does not close.
- **disableAutoFocus** – If `true`, no element is focused when the modal opens (focus trap for Tab still works).

### API

- **pushModal(options)** – Pushes a modal onto the stack. Returns the modal **id** (string). Store it to close that modal later with `closeModalById(id)`.
- **popModal()** – Closes the topmost modal.
- **closeModalById(id)** – Closes the modal with the given id (the one returned by `pushModal`).
- **closeAllModals()** – Closes all modals.

Each modal content component receives **closeModal** (no arguments): call it to close that modal (works even if it is not the top one).

### Focus trap

When a modal is on top, focus is trapped inside it: Tab / Shift+Tab wrap within the modal, and when the modal closes, focus returns to the previously focused element.

## CSS variables

Override these in your app to style modals:

| Variable                      | Default                               | Description                                              |
| ----------------------------- | ------------------------------------- | -------------------------------------------------------- |
| `--modal-bg`                  | `#fff`                                | Modal background                                         |
| `--modal-bg-border`           | `transparent`                         | Modal border (e.g. `1px solid #e2e8f0` to show a border) |
| `--modal-padding`             | `1rem`                                | Inner padding                                            |
| `--modal-gap`                 | `1rem`                                | Gap between header, content, footer                      |
| `--modal-title-color`         | `#0f172a`                             | Title text color                                         |
| `--modal-title-font-size`     | `1.25rem`                             | Title font size                                          |
| `--modal-title-line-height`   | `1`                                   | Title line height                                        |
| `--modal-border-radius`       | `0.5rem`                              | Modal corners                                            |
| `--modal-shadow`              | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | Box shadow                                               |
| `--modal-overlay-bg`          | `rgba(0, 0, 0, 0.3)`                  | Backdrop color                                           |
| `--modal-overlay-blur-filter` | `blur(4px)`                           | Backdrop blur (full filter value)                        |
| `--modal-dim-filter`          | `brightness(0.85)`                    | Filter for modals behind the top one                     |
| `--modal-duration`            | `150ms`                               | Animation duration                                       |
| `--modal-close-size`          | `2rem`                                | Close button width and height                            |
| `--modal-close-padding`       | `0.25rem`                             | Close button padding                                     |
| `--modal-close-border-radius` | `0.25rem`                             | Close button border radius                               |
| `--modal-close-bg`            | `transparent`                         | Close button background                                  |
| `--modal-close-hover-bg`      | `rgba(0, 0, 0, 0.05)`                 | Close button hover background                            |
| `--modal-close-color`         | `currentColor`                        | Close icon color                                         |
| `--modal-close-hover-color`   | `currentColor`                        | Close icon hover color                                   |

Example:

```css
:root {
  --modal-border-radius: 0.75rem;
  --modal-overlay-blur-filter: blur(8px);
}
```

## Requirements

- React 18 or 19

### React Frameworks

Modals are rendered with `createPortal` into `document.body`, so they work with Next.js App Router and SSR. This also applies to other React frameworks.
