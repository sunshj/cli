import process from 'node:process'
import { describe, expect, it } from 'vitest'
import { getPkgJSON, patchUpdate } from '#utils'

const { pkgJSON } = await getPkgJSON(process.cwd())

describe('patch update', () => {
  it('should work with array', () => {
    patchUpdate(pkgJSON, 'lint-staged', {
      '*.{vue,js,ts,jsx,tsx,json,md,yaml}': ['eslint --fix']
    })

    patchUpdate(pkgJSON, 'lint-staged', {
      '*.{vue,js,ts,jsx,tsx,json,md,yaml}': ['prettier --write']
    })

    patchUpdate(pkgJSON, 'lint-staged', {
      '*.{vue,js,ts,jsx,tsx,json,md,yaml}': []
    })

    expect(pkgJSON['lint-staged']).toMatchInlineSnapshot(`
      {
        "*.{js,ts}": [
          "eslint --fix",
          "prettier --write",
        ],
        "*.{vue,js,ts,jsx,tsx,json,md,yaml}": [
          "eslint --fix",
          "prettier --write",
        ],
      }
    `)
  })

  it('should work when deepMerge is false', () => {
    patchUpdate(
      pkgJSON,
      'lint-staged',
      {
        '*.{vue,js,ts,jsx,tsx,json,md,yaml}': []
      },
      false
    )

    expect(pkgJSON['lint-staged']).toMatchInlineSnapshot(`
      {
        "*.{js,ts}": [
          "eslint --fix",
          "prettier --write",
        ],
        "*.{vue,js,ts,jsx,tsx,json,md,yaml}": [],
      }
    `)
  })
})
