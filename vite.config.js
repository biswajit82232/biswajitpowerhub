import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';

function googleSiteVerificationPlugin() {
  return {
    name: 'google-site-verification',
    transformIndexHtml(html) {
      const token = (
        process.env.VITE_GOOGLE_SITE_VERIFICATION ||
        process.env.VITE_GSC_VERIFICATION ||
        ''
      ).trim();
      if (token) {
        return html.replace(
          /content="%VITE_GOOGLE_SITE_VERIFICATION%"/g,
          `content="${token.replace(/"/g, '&quot;')}"`,
        );
      }
      return html.replace(
        /\s*<!-- Search Console:[\s\S]*?-->\s*<meta\s+name="google-site-verification"[^>]*>\s*/i,
        '\n',
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const useHttps = mode !== 'http';

  return {
    plugins: [react(), googleSiteVerificationPlugin(), ...(useHttps ? [basicSsl()] : [])],
    server: {
      host: true,
      open: true,
    },
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
      dedupe: ['react', 'react-dom'],
    },
    build: {
      target: 'es2018',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('node_modules/framer-motion')) return 'motion-vendor';
            if (id.includes('node_modules/@supabase')) return 'supabase-vendor';
            if (id.includes('node_modules/lucide-react')) return 'icons-vendor';
          },
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react'],
    },
  };
});
