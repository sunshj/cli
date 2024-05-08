import { defineConfig } from '@sunshj/eslint-config'

export default defineConfig({
  files: ['src/templates/**/*.js'],
  rules: {
    'unused-imports/no-unused-vars': 'off'
  }
})
