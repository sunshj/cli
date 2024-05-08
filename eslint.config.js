import { defineConfig } from '@sunshj/eslint-config'

export default defineConfig({
  files: ['templates/**/*.js'],
  rules: {
    'unused-imports/no-unused-vars': 'off'
  }
})
