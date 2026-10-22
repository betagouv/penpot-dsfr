/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the same build works on a custom domain root and on `https://<org>.github.io/<repo>/`
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@tutorial': import.meta.dirname,
    },
  },
  worker: {
    format: 'es',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
