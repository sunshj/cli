import process from 'node:process'
import { loadPackageJson, patchUpdate } from '#utils'
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

describe('loadPackageJson', () => {
  it('should work', async () => {
    const [pkgJson] = await loadPackageJson(process.cwd())
    expect(pkgJson.name).toMatchInlineSnapshot(`"sunshj"`)
    pkgJson.name = 'test-name'
    expect(pkgJson.name).toMatchInlineSnapshot(`"test-name"`)

    patchUpdate(pkgJson, 'author', 'test-author')
    expect(pkgJson.author).toMatchInlineSnapshot(`"test-author"`)
  })
})
