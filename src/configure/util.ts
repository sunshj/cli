import fs from 'node:fs/promises'
import { spawn } from 'node:child_process'
import inquirer from 'inquirer'
import consola from 'consola'
import { getPackageManagement, getPkgJSON, getVSCodeSettings, spinner } from '../utils'
import { ALLOW_ARGS, ALLOW_CONFIGS } from '../constants'

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

export function handleConfigurePackage(
  configPkg: string,
  management: string,
  isWorkspace: boolean
) {
  return new Promise((resolve, reject) => {
    spinner.start(`Installing ${configPkg}...`)
    const install = spawn(
      management,
      ['install', configPkg, `@sunshj/${configPkg}-config`, '-D', isWorkspace ? '-w' : ''],
      {
        stdio: 'inherit',
        shell: true
      }
    )

    install.on('close', async code => {
      if (code === 0) {
        spinner.succeed(`${configPkg} installed successfully`)
        if (configPkg === 'eslint') await configureESLint()
        if (configPkg === 'prettier') await configurePrettier()
        if (configPkg === 'stylelint') await configureStyleLint()
        resolve(true)
      } else {
        spinner.fail(`${configPkg} installation failed`)
        reject(new Error(`${configPkg} installation failed with code ${code}`))
      }
    })
  })
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
