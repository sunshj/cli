import process from 'node:process'
import { ALLOW_ARGS, ALLOW_CONFIGS, INSTALL_CONFIGS } from '#constants'
import { spinner } from '#utils'
import consola from 'consola'
import { addDevDependency } from 'nypm'
import { configureCommitLint } from './commitlint'
import { configureESLint } from './eslint'
import { configureLintStaged } from './lint-staged'
import { configurePrettier } from './prettier'
import { configureStyleLint } from './stylelint'

const installConfigMap = new Map(Object.entries(INSTALL_CONFIGS))

export function transformConfigurePkgs(pkgs: Record<string, boolean>) {
  const data = Object.keys(pkgs).filter(pkg => pkgs[pkg])

  const invalidArgs = data.filter(v => !ALLOW_ARGS.includes(v))
  if (invalidArgs.length > 0) consola.warn(`invalid args: ${invalidArgs.join(',')}`)

  return data.filter(v => ALLOW_CONFIGS.includes(v))
}

export async function configureProject(
  configPkg: string,
  configurePkgs: string[],
  isWorkspace: boolean
) {
  spinner.start(`Installing ${configPkg}...\n`)
  const installPkgs = installConfigMap.get(configPkg)!

  await addDevDependency(installPkgs, {
    silent: true,
    workspace: isWorkspace
  }).catch(error => {
    spinner.fail(`${configPkg} installation failed: ${error.message}`)
    process.exit(1)
  })

  spinner.succeed(`${configPkg} installed successfully`)

  if (configPkg === 'eslint') await configureESLint()
  if (configPkg === 'prettier') await configurePrettier()
  if (configPkg === 'stylelint') await configureStyleLint()
  if (configPkg === 'lintStaged') await configureLintStaged(configurePkgs)
  if (configPkg === 'commitlint') await configureCommitLint()
}
