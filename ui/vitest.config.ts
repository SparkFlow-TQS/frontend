/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    deps: {
      optimizer: {
        web: {
          include: ['react-icons']
        }
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['**/*.{ts,tsx}'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/*.config.js',
        'coverage/**',
        'vitest.setup.ts',
      ],
    },
  },
  esbuild: {
    target: 'esnext'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
}) 