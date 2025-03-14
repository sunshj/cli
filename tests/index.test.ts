import { patchUpdate } from '#utils.js'
import { describe, expect, it } from 'vitest'

describe('patchUpdate', () => {
  it('should merge two objects', () => {
    const json = {
      'lint-staged': {
        '*.{vue,js}': ['prettier --write']
      }
    }

    patchUpdate(json, 'lint-staged', { '*.{vue,js}': ['eslint --fix'] })
    expect(json).toMatchInlineSnapshot(`
      {
        "lint-staged": {
          "*.{vue,js}": [
            "eslint --fix",
            "prettier --write",
          ],
        },
      }
    `)
  })
})
