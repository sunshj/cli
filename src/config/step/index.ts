import consola from 'consola'
import { execShell, spinner } from '../../utils'
import { ALLOW_ARGS, ALLOW_CONFIGS, CONFIG_INSTALL_MAP } from '../../constants'
import { configureESLint } from './eslint'
import { configurePrettier } from './prettier'
import { configureStyleLint } from './stylelint'
import { configureLintStaged } from './lint-staged'
import { configureCommitLint } from './commitlint'

export { configureGitAttributes } from './git-attributes'
export { selectTools } from './select-tools'
export { selectPackageManager } from './select-pkg-manager'

export function transformConfigurePkgs(pkgs: Record<string, boolean>) {
  const data = Object.keys(pkgs).filter(pkg => pkgs[pkg])

  const invalidArgs = data.filter(v => !ALLOW_ARGS.includes(v))
  if (invalidArgs.length > 0) consola.warn(`invalid args: ${invalidArgs.join(',')}`)

  return data.filter(v => ALLOW_CONFIGS.includes(v))
}

export async function configureProject(
  configPkg: string,
  pkgManager: string,
  isWorkspace: boolean
) {
  spinner.start(`Installing ${configPkg}...\n`)
  const installPkgs = CONFIG_INSTALL_MAP.get(configPkg)!

  const installed = await execShell(pkgManager, [
    'install',
    ...installPkgs,
    '-D',
    isWorkspace ? '-w' : ''
  ]).catch((error: any) => {
    spinner.fail(`${configPkg} installation failed: ${error.message}`)
    process.exit(1)
  })

  if (installed) {
    spinner.succeed(`${configPkg} installed successfully`)
    if (configPkg === 'eslint') await configureESLint()
    if (configPkg === 'prettier') await configurePrettier()
    if (configPkg === 'stylelint') await configureStyleLint()
    if (configPkg === 'lintStaged') await configureLintStaged()
    if (configPkg === 'commitlint') await configureCommitLint()
  }
}
