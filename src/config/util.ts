import fs from 'node:fs/promises'
import path from 'node:path'
import inquirer from 'inquirer'
import consola from 'consola'
import {
  checkExists,
  execShell,
  getPackageManager,
  getPkgJSON,
  getVSCodeSettings,
  spinner
} from '../utils'
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

export async function selectPackageManager() {
  return await inquirer.prompt<{ packageManager: string }>([
    {
      name: 'packageManager',
      message: 'Which package manager do you want to use?',
      type: 'list',
      default: await getPackageManager(process.cwd()),
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
  }
}

async function configureESLint() {
  const { vscodeSettings, vscodeSettingsPath } = await getVSCodeSettings(process.cwd())
  vscodeSettings['eslint.experimental.useFlatConfig'] = true
  vscodeSettings['eslint.validate'] = [
    'javascript',
    'javascriptreact',
    'typescript',
    'typescriptreact',
    'vue',
    'html',
    'markdown',
    'json',
    'jsonc',
    'yaml'
  ]
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

  const management = await getPackageManager(process.cwd())
  const prepare = await execShell(management, ['run', 'prepare'])
  if (!prepare) return consola.error('lint-staged configuration failed')
  consola.success('lint-staged configured successfully')

  const husky = await execShell('npx', [
    'husky',
    'set',
    '.husky/pre-commit',
    `"npx lint-staged --verbose --no-stash"`
  ])
  if (!husky) return consola.error('pre-commit hook configuration failed')
  consola.success('pre-commit hook configured successfully')
}

export async function configureGitAttributes() {
  const GIT_ATTRS = '* text=auto eol=lf'
  const filePath = path.resolve(process.cwd(), '.gitattributes')
  const isExisted = await checkExists(filePath)
  if (!isExisted) await fs.writeFile(filePath, GIT_ATTRS)
  const fileContent = await fs.readFile(filePath, 'utf-8')
  if (!fileContent.includes(GIT_ATTRS)) await fs.appendFile(filePath, `\n${GIT_ATTRS}`)
  consola.success('git attributes configured successfully')
}