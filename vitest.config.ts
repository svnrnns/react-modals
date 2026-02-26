import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: [resolve(__dirname, "tests/setup.ts")],
    globals: false,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "lib"),
    },
  },
});
