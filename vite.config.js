import { defineConfig } from 'vite';

const ORDS_HOST = 'https://dbylfn34rhv0ebz-falcodev.adb.us-ashburn-1.oraclecloudapps.com';
const ORDS_PATH = '/ords/salescoaching/services/prequalified-files/upload';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/proxy-upload': {
        target: ORDS_HOST,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/proxy-upload/, ORDS_PATH)
      }
    }
  }
});
