import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // https://witcoskitech.com/pitchprice/
  base: process.env.VITE_BASE_PATH ?? '/pitchprice/',
});
