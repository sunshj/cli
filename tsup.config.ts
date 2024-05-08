import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', '!src/*.d.ts'],
  format: 'esm',
  clean: true,
  minify: true
})
