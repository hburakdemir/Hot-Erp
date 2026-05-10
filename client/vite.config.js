import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * HMR / yenileme gecikmesi için:
 * - Windows’ta dosya izleyici bazen gecikir: proje kökünde `.env` içine
 *   `VITE_USE_POLLING=1` ekleyip `usePolling` açabilirsiniz (Defender / ağ sürücüsü).
 * - `optimizeDeps.holdUntilCrawlEnd: false` ilk sunucu açılışını hızlandırabilir.
 * - React StrictMode geliştirmede çift render yapar; algılanan “yavaşlık” bundan da olabilir.
 */
export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
    }),
  ],
  server: {
    port: 5173,
    watch: {
      usePolling: process.env.VITE_USE_POLLING === '1',
      interval: 200,
    },
  },
  optimizeDeps: {
    holdUntilCrawlEnd: false,
  },
})
