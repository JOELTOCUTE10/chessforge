import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const base = process.env.GITHUB_ACTIONS === 'true' ? '/chessforge/' : '/';

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
