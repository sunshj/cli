import process from 'node:process'
import { createCodegenContext, getPkgJSON, patchUpdate } from '#utils'
import { describe, expect, it } from 'vitest'

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
        "*.{js,ts,json,md,yaml}": [
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
        "*.{js,ts,json,md,yaml}": [
          "eslint --fix",
          "prettier --write",
        ],
        "*.{vue,js,ts,jsx,tsx,json,md,yaml}": [],
      }
    `)
  })
})

describe('codegen helper', () => {
  it('should work', () => {
    const ctx = createCodegenContext()

    ctx.push('function sum(...numbers: number[]) {')
    ctx.indent()
    ctx.push('return numbers.reduce((acc, prev) => {')
    ctx.indent()
    ctx.push('acc += prev')
    ctx.newline()
    ctx.push('return acc')
    ctx.deindent()
    ctx.push('}, 0)')
    ctx.deindent()
    ctx.push('}')
    ctx.newline()

    expect(ctx.code).toMatchInlineSnapshot(`
      "function sum(...numbers: number[]) {
        return numbers.reduce((acc, prev) => {
          acc += prev
          return acc
        }, 0)
      }
      "
    `)
  })
})
