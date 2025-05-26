/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
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
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.config.ts',
        '**/types.ts',
      ],
      reportsDirectory: './coverage'
    },
  },
  esbuild: {
    target: 'esnext'
  }
}) 