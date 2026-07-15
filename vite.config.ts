import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Port 5176 is intentional — lets this site run alongside other local dev servers.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    strictPort: true,
  },
});
