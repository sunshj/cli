import config from '#config.js'
import { loadPackageJson, patchUpdate } from '#utils.js'
import consola from 'consola'
import { x } from 'tinyexec'
import type { ConfigureContext } from '..'

export async function configureLintStaged(ctx: ConfigureContext) {
  if (!ctx.selectedPkgs.includes('lintStaged')) return
  // add config and scripts to package.json
  const [pkgJSON, savePkgJSON] = await loadPackageJson(ctx.cwd)

  if (ctx.selectedPkgs.includes('eslint')) {
    patchUpdate(pkgJSON, 'lint-staged', config.lintStaged.eslintTask)
  }

  if (ctx.selectedPkgs.includes('prettier')) {
    patchUpdate(pkgJSON, 'lint-staged', config.lintStaged.prettierTask)
  }

  if (ctx.selectedPkgs.includes('stylelint')) {
    patchUpdate(pkgJSON, 'lint-staged', config.lintStaged.stylelintTask)
  }

  patchUpdate(pkgJSON, 'simple-git-hooks', config.lintStaged.gitHooks)

  await savePkgJSON()

  await x('npx', ['simple-git-hooks'])
  consola.success('lint-staged installed')
}
