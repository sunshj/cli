import fs from 'node:fs/promises'
import { spawn } from 'node:child_process'
import inquirer from 'inquirer'
import { getPkgJSON, getVSCodeSettings, spinner } from '../utils'

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
      choices: ['npm', 'pnpm']
    }
  ])
}

export function transformConfigurePkgs(pkgs: Record<string, boolean>) {
  return Object.entries(pkgs).reduce<string[]>((acc, [k, v]) => {
    if (v) acc.push(k)
    return acc
  }, [])
}

export function handleConfigurePackage(configPkg: string, management: string) {
  spinner.start(`Installing ${configPkg}...`)
  const install = spawn(management, ['install', configPkg, `@sunshj/${configPkg}-config`, '-D'], {
    stdio: 'inherit',
    shell: true
  })

  install.on('close', code => {
    if (code === 0) {
      spinner.succeed(`${configPkg} installed successfully`)
      if (configPkg === 'eslint') {
        configureESLint()
      }
      if (configPkg === 'prettier') {
        configurePrettier()
      }
      if (configPkg === 'stylelint') {
        configureStyleLint()
      }
    } else {
      spinner.fail(`${configPkg} installation failed`)
    }
  })
}

async function configureESLint() {
  const { vscodeSettings } = await getVSCodeSettings(process.cwd())
  console.log('vscodeSettings:', vscodeSettings)
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

  pkgJSON.scripts.lint = 'eslint .'
  await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJSON, null, 2))
}

async function configurePrettier() {
  const { pkgJSON, pkgJsonPath } = await getPkgJSON(process.cwd())
  pkgJSON.prettier = '@sunshj/prettier-config'
  pkgJSON.scripts.format = 'prettier --write .'
  await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJSON, null, 2))
}

async function configureStyleLint() {
  const { pkgJSON, pkgJsonPath } = await getPkgJSON(process.cwd())
  const { vscodeSettings, vscodeSettingsPath } = await getVSCodeSettings(process.cwd())
  vscodeSettings['stylelint.validate'] = ['css', 'postcss', 'scss', 'vue']

  pkgJSON.stylelint = {
    extends: '@sunshj/stylelint-config'
  }
  pkgJSON.scripts.stylelint =
    'stylelint --cache --fix "src/**/*.{vue,css,scss}" --cache --cache-location node_modules/.cache/stylelint/'

  await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJSON, null, 2))
  await fs.writeFile(vscodeSettingsPath, JSON.stringify(vscodeSettings, null, 2))
}
