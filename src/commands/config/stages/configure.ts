import type { ConfigureContext } from '..'
import { configureCommitlint } from './commitlint'
import { configureESLint } from './eslint'
import { configureLintStaged } from './lint-staged'
import { configurePrettier } from './prettier'
import { configureStylelint } from './stylelint'

export async function configurePkg(pkg: string, ctx: ConfigureContext) {
  switch (pkg) {
    case 'eslint':
      return await configureESLint(ctx)

    case 'prettier':
      return await configurePrettier(ctx)

    case 'stylelint':
      return await configureStylelint(ctx)

    case 'lintStaged':
      return await configureLintStaged(ctx)

    case 'commitlint':
      return await configureCommitlint(ctx)
    default:
      break
  }
}
