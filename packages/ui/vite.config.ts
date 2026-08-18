import { Features } from 'lightningcss'
import { defineConfig } from 'vite'

import { foldkit } from '@foldkit/vite-plugin'
import stylex from '@stylexjs/unplugin'

export default defineConfig({
  plugins: [
    stylex.vite({
      lightningcssOptions: {
        exclude: Features.LightDark,
      },
    }),
    foldkit({
      devToolsMcpPort: process.env.VITEST === 'true' ? undefined : 9992,
    }),
  ],
  optimizeDeps: {
    exclude: [
      'foldkit',
      '@foldkit/ui',
      '@foldkit/devtools',
      'effect',
      '@effect/platform-browser',
      '@foldstryx/styles',
      '@foldstryx/foldkit',
      '@foldstryx/tokens',
    ],
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
})
