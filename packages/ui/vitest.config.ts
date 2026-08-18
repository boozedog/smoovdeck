import stylex from '@stylexjs/unplugin'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [stylex.vite()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/vitest-setup.ts'],
    server: {
      deps: {
        inline: [
          'foldkit',
          '@foldkit/ui',
          '@foldkit/devtools',
          /@foldstryx/,
        ],
      },
    },
  },
})
