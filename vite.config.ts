import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));

export default defineConfig({
  base: '/pomo/',
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline', // Reduce registration delay for cold start
      devOptions: {
        enabled: true,
      },
      includeAssets: ['robots.txt', 'favicon.svg'],
      workbox: {
        // Precache all build assets (default behavior made explicit)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],

        // Increase file size limit to allow precaching alarm.mp3 (3.31 MB)
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB

        // Enable navigation fallback for offline SPA support
        navigateFallback: '/pomo/index.html',

        // Restrict fallback to /pomo paths (with or without trailing slash)
        navigateFallbackAllowlist: [/^\/pomo($|\/)/],

        // Enable navigation preload to mitigate activation race
        navigationPreload: true,

        // Runtime caching strategies
        runtimeCaching: [
          {
            // Cache JS/CSS with CacheFirst strategy
            urlPattern: /^https?:.*\.(js|css)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            // Cache images with CacheFirst strategy
            urlPattern: /^https?:.*\.(png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            // Cache audio files with CacheFirst strategy
            urlPattern: /^https?:.*\.(mp3|wav|ogg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],

        // Clean up outdated caches
        cleanupOutdatedCaches: true,

        // Skip waiting and activate immediately
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: 'Pomo',
        short_name: 'Pomo',
        description: 'Pomodoro style productivity timer',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/pomo/',
        start_url: '/pomo/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/maskable-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/maskable-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
});
