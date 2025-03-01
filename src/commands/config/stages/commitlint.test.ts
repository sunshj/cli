import { describe, expect, it } from 'vitest'
import { generateCommitlintConfigCode } from './commitlint'

describe('commitlint', () => {
  it('should generate commitlint config code', () => {
    const config = generateCommitlintConfigCode('module')
    expect(config).toMatchInlineSnapshot(`
      "/** @type {import('cz-git').UserConfig} */
      export default {
        extends: ["@commitlint/config-conventional"],
      rules: {
        'subject-leading-space': [2, 'always'],
        'subject-full-stop': [0, 'never'],
      },
      plugins: [
        {
          rules: {
            'subject-leading-space': (args) => {
              return [args.header.includes(': '), 'The subject prefix must contain spaces, such as "feat: "']
            },
          },
        },
      ],
      }"
    `)
  })
})
