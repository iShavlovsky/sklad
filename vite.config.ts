/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import { currentReleaseNotes } from './src/shared/config/release-notes';

const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, './package.json'), 'utf-8')
) as {
  version: string;
};

if (currentReleaseNotes.version !== packageJson.version) {
  throw new Error(
    `Release notes version ${currentReleaseNotes.version} does not match package version ${packageJson.version}`
  );
}

function releaseNotesAssetPlugin(): Plugin {
  return {
    generateBundle() {
      this.emitFile({
        fileName: 'release-notes.json',
        source: `${JSON.stringify(currentReleaseNotes, null, 2)}\n`,
        type: 'asset',
      });
    },
    name: 'sklad-release-notes-asset',
  };
}

function resolveManualChunk(id: string): string | undefined {
  if (!id.includes('node_modules')) {
    return undefined;
  }

  if (
    id.includes('/react/') ||
    id.includes('/react-dom/') ||
    id.includes('/scheduler/') ||
    id.includes('/react-router-dom/')
  ) {
    return 'react-vendor';
  }

  if (id.includes('/@mantine/')) {
    return 'mantine-vendor';
  }

  if (
    id.includes('/react-hook-form/') ||
    id.includes('/@hookform/resolvers/') ||
    id.includes('/zod/') ||
    id.includes('/dayjs/')
  ) {
    return 'forms-vendor';
  }

  if (
    id.includes('/dexie/') ||
    id.includes('/dexie-react-hooks/') ||
    id.includes('/zustand/')
  ) {
    return 'data-vendor';
  }

  if (
    id.includes('/@zxing/') ||
    id.includes('/react-easy-crop/') ||
    id.includes('/nanoid/')
  ) {
    return 'scanner-media-vendor';
  }

  if (
    id.includes('/@tabler/icons-react/') ||
    id.includes('/react-icons/')
  ) {
    return 'icons-vendor';
  }

  return undefined;
}

export default defineConfig(({ mode }) => {
  const basePath = mode === 'gh-pages' ? '/sklad/' : './';

  return {
    base: basePath,
    server: {
      allowedHosts: true,
    },
    preview: {
      allowedHosts: true,
    },
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
      __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: resolveManualChunk,
        },
      },
    },
    plugins: [
      releaseNotesAssetPlugin(),
      react(),
      VitePWA({
        injectRegister: 'auto',
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'favicon.ico', 'icons.svg', 'favicon-180x180.png'],
        manifest: {
          background_color: '#0F766E',
          categories: ['productivity', 'utilities'],
          description: 'Личный складской учет с офлайн-first сценариями.',
          dir: 'ltr',
          display: 'standalone',
          icons: [
            {
              purpose: 'any maskable',
              sizes: '72x72',
              src: 'favicon-72x72.png',
              type: 'image/png',
            },
            {
              purpose: 'any maskable',
              sizes: '96x96',
              src: 'favicon-96x96.png',
              type: 'image/png',
            },
            {
              purpose: 'any maskable',
              sizes: '128x128',
              src: 'favicon-128x128.png',
              type: 'image/png',
            },
            {
              purpose: 'any maskable',
              sizes: '144x144',
              src: 'favicon-144x144.png',
              type: 'image/png',
            },
            {
              purpose: 'any maskable',
              sizes: '152x152',
              src: 'favicon-152x152.png',
              type: 'image/png',
            },
            {
              purpose: 'any maskable',
              sizes: '192x192',
              src: 'favicon-192x192.png',
              type: 'image/png',
            },
            {
              purpose: 'any maskable',
              sizes: '384x384',
              src: 'favicon-384x384.png',
              type: 'image/png',
            },
            {
              purpose: 'any maskable',
              sizes: '512x512',
              src: 'favicon-512x512.png',
              type: 'image/png',
            },
          ],
          id: basePath,
          lang: 'ru',
          name: 'Sklad Next',
          orientation: 'portrait-primary',
          scope: basePath,
          short_name: 'Sklad',
          start_url: `${basePath}#/`,
          theme_color: '#0f766e',
        },
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
          navigateFallback: `${basePath}index.html`,
          skipWaiting: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    test: {
      environment: 'node',
      include: ['tests/unit/**/*.test.ts'],
    },
  };
});
