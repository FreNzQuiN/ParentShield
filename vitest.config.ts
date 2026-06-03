import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./resources/js/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      include: [
        'resources/js/app/**/*.{ts,tsx}',
        'resources/js/pages/**/*.{ts,tsx}',
      ],
      exclude: [
        'resources/js/app/types/**',
        'resources/js/app/constants/**',
        'resources/js/test/**',
        'resources/js/app/index.ts',
        'resources/js/app/components/features/index.ts',
        'resources/js/app/components/shared/index.ts',
        'resources/js/app/routes/guards/index.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './resources/js/app'),
    },
  },
});
