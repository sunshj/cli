import { defineConfig } from '@sunshj/eslint-config'

export default defineConfig([
  {
    rules: {
      'no-console': 'error'
    }
  },
  {
    ignores: ['templates/**/*.{js,ts}']
  }
])
