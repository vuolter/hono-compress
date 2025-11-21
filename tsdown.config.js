import { defineConfig } from 'tsdown'

export default defineConfig({
  exports: true,
  format: ['esm', 'cjs'],
  minify: true,
  platform: 'neutral',
})
