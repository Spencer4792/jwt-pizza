import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'json'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        'src/**/eslint.config.js',
        'src/**/postcss.config.js',
        'src/**/tailwind.config.js',
        'src/**/vite.config.js',
        '**/*.d.ts',
      ]
    }
  }
});