import type { VitePWAOptions } from 'vite-plugin-pwa'

// Web app manifest and service worker settings that make todooren installable (ADR 0004).
export const pwaOptions: Partial<VitePWAOptions> = {
  // The new service worker takes over on the next launch; no forced reload that would
  // reset a running Pomodoro.
  registerType: 'autoUpdate',
  injectRegister: 'script-defer',
  includeAssets: ['favicon.ico', 'icon.svg', 'apple-touch-icon.png'],
  manifest: {
    name: 'Todooren',
    short_name: 'Todooren',
    description: 'A todo board with a built-in Pomodoro timer.',
    start_url: './',
    scope: './',
    display: 'standalone',
    theme_color: '#e11d48',
    background_color: '#f1f5f9',
    icons: [
      { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
  },
}
