/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' — относительные пути, чтобы сборка работала по адресу
// https://<user>.github.io/zachetka/app/ (GitHub Pages публикует папку docs/).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../docs/app',
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
