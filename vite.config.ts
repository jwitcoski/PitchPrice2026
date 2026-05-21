import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Production: https://witcoskitech.com/pitchprice/
  // Local dev: npm run dev (uses /)
  base: process.env.VITE_BASE_PATH ?? '/',
});
