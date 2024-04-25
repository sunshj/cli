import fs from 'node:fs/promises'
import inquirer from 'inquirer'
import consola from 'consola'
import { execShell, getPackageManagement, getPkgJSON, getVSCodeSettings, spinner } from '../utils'
import { ALLOW_ARGS, ALLOW_CONFIGS, CONFIG_INSTALL_MAP } from '../constants'

export async function selectESLint() {
  return await inquirer.prompt<{ eslint: boolean }>([
    {
      name: 'eslint',
      message: 'Do you want to use eslint?',
      type: 'confirm',
      default: true
    }
  ])
}

export async function selectPrettier() {
  return await inquirer.prompt<{ prettier: boolean }>([
    {
      name: 'prettier',
      message: 'Do you want to use prettier?',
      type: 'confirm',
      default: true
    }
  ])
}

export async function selectStyleLint() {
  return await inquirer.prompt<{ stylelint: boolean }>([
    {
      name: 'stylelint',
      message: 'Do you want to use stylelint?',
      type: 'confirm',
      default: true
    }
  ])
}

export async function selectLintStaged() {
  return await inquirer.prompt<{ lintStaged: boolean }>([
    {
      name: 'lintStaged',
      message: 'Do you want to use lint-staged?',
      type: 'confirm',
      default: true
    }
  ])
}

export async function selectPackageManagement() {
  return await inquirer.prompt<{ packageManagement: string }>([
    {
      name: 'packageManagement',
      message: 'Which package management do you want to use?',
      type: 'list',
      default: await getPackageManagement(process.cwd()),
      choices: ['npm', 'pnpm']
    }
  ])
}

export function transformConfigurePkgs(pkgs: Record<string, boolean>) {
  const data = Object.keys(pkgs).filter(pkg => pkgs[pkg])

  const invalidArgs = data.filter(v => !ALLOW_ARGS.includes(v))
  if (invalidArgs.length > 0) consola.warn(`invalid args: ${invalidArgs.join(',')}`)

  return data.filter(v => ALLOW_CONFIGS.includes(v))
}

export async function handleConfigurePackage(
  configPkg: string,
  management: string,
  isWorkspace: boolean
) {
  spinner.start(`Installing ${configPkg}...\n`)
  const installPkgs = CONFIG_INSTALL_MAP.get(configPkg)!

  const install = await execShell(management, [
    'install',
    ...installPkgs,
    '-D',
    isWorkspace ? '-w' : ''
  ])

  if (!install) return spinner.fail(`${configPkg} installation failed`)
  spinner.succeed(`${configPkg} installed successfully`)
  if (configPkg === 'eslint') await configureESLint()
  if (configPkg === 'prettier') await configurePrettier()
  if (configPkg === 'stylelint') await configureStyleLint()
  if (configPkg === 'lintStaged') await configureLintStaged()
}

async function configureESLint() {
  const { vscodeSettings, vscodeSettingsPath } = await getVSCodeSettings(process.cwd())
  vscodeSettings['eslint.experimental.useFlatConfig'] = true
  await fs.writeFile(vscodeSettingsPath, JSON.stringify(vscodeSettings, null, 2))

  const { pkgJSON, pkgJsonPath } = await getPkgJSON(process.cwd())
  const pkgType = pkgJSON.type ?? 'commonjs'
  if (pkgType === 'module') {
    await fs.writeFile(
      'eslint.config.js',
      `import { defineConfig } from '@sunshj/eslint-config'
  
export default defineConfig({})
  `,
      'utf-8'
    )
  } else {
    await fs.writeFile(
      'eslint.config.js',
      `const { defineConfig } = require('@sunshj/eslint-config')
  
module.exports = defineConfig({})
  `,
      'utf-8'
    )
  }

  if (!pkgJSON.scripts) pkgJSON.scripts = {}
  pkgJSON.scripts.lint = 'eslint .'
  await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJSON, null, 2))
}

async function configurePrettier() {
  const { pkgJSON, pkgJsonPath } = await getPkgJSON(process.cwd())
  pkgJSON.prettier = '@sunshj/prettier-config'
  if (!pkgJSON.scripts) pkgJSON.scripts = {}
  pkgJSON.scripts.format = 'prettier --write .'
  await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJSON, null, 2))
}

async function configureStyleLint() {
  const { vscodeSettings, vscodeSettingsPath } = await getVSCodeSettings(process.cwd())
  vscodeSettings['stylelint.validate'] = ['css', 'postcss', 'scss', 'vue']
  await fs.writeFile(vscodeSettingsPath, JSON.stringify(vscodeSettings, null, 2))

  const { pkgJSON, pkgJsonPath } = await getPkgJSON(process.cwd())
  pkgJSON.stylelint = {
    extends: '@sunshj/stylelint-config'
  }
  if (!pkgJSON.scripts) pkgJSON.scripts = {}
  pkgJSON.scripts.stylelint =
    'stylelint --cache --fix "src/**/*.{vue,css,scss}" --cache --cache-location node_modules/.cache/stylelint/'

  await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJSON, null, 2))
}

async function configureLintStaged() {
  const { pkgJSON, pkgJsonPath } = await getPkgJSON(process.cwd())
  pkgJSON['lint-staged'] = {
    'src/**/*.{vue,js,ts,jsx,tsx}': ['eslint --fix', 'prettier --write']
  }
  if (!pkgJSON.scripts) pkgJSON.scripts = {}
  pkgJSON.scripts.prepare = 'husky install'
  await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJSON, null, 2))

  const management = await getPackageManagement(process.cwd())
  const prepare = await execShell(management, ['run', 'prepare'])
  if (!prepare) return consola.error('lint-staged configuration failed')
  consola.success('lint-staged configured successfully')

  const husky = await execShell('npx', ['husky', 'set', '.husky/pre-commit', `"npx lint-staged"`])
  if (!husky) return consola.error('pre-commit hook configuration failed')
  consola.success('pre-commit hook configured successfully')
}
