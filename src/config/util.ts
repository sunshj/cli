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
  patchUpdate,
  spinner
} from '../utils'
import { ALLOW_ARGS, ALLOW_CONFIGS, CONFIG_INSTALL_MAP } from '../constants'

export async function selectTools() {
  return await inquirer.prompt<{ tools: string[] }>([
    {
      name: 'tools',
      message: 'Which tools do you want to use?',
      type: 'checkbox',
      choices: [
        {
          checked: true,
          name: 'ESLint',
          value: 'eslint'
        },
        {
          checked: true,
          name: 'Prettier',
          value: 'prettier'
        },
        {
          name: 'StyleLint',
          value: 'stylelint'
        },
        {
          name: 'lint-staged',
          value: 'lintStaged'
        },
        {
          name: 'CommitLint',
          value: 'commitlint'
        }
      ],
      async validate(input) {
        if (input.includes('commitlint') && !input.includes('lintStaged')) {
          const { pkgJSON } = await getPkgJSON(process.cwd())
          const deps = { ...pkgJSON.devDependencies, ...pkgJSON.dependencies }
          if (!deps['simple-git-hooks']) return 'lintStaged is required when using commitlint'
        }
        return true
      }
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
    if (configPkg === 'commitlint') await configureCommitLint()
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
  patchUpdate(pkgJSON, 'scripts', { lint: 'eslint .' })
  await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJSON, null, 2))
}

async function configurePrettier() {
  const { pkgJSON, pkgJsonPath } = await getPkgJSON(process.cwd())
  pkgJSON.prettier = '@sunshj/prettier-config'
  patchUpdate(pkgJSON, 'scripts', { format: 'prettier --write .' })
  await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJSON, null, 2))
}

async function configureStyleLint() {
  const { vscodeSettings, vscodeSettingsPath } = await getVSCodeSettings(process.cwd())
  vscodeSettings['stylelint.validate'] = ['css', 'postcss', 'scss', 'vue']
  await fs.writeFile(vscodeSettingsPath, JSON.stringify(vscodeSettings, null, 2))

  const { pkgJSON, pkgJsonPath } = await getPkgJSON(process.cwd())
  pkgJSON.stylelint = { extends: '@sunshj/stylelint-config' }
  patchUpdate(pkgJSON, 'scripts', {
    stylelint:
      'stylelint --cache --fix "src/**/*.{vue,css,scss}" --cache --cache-location node_modules/.cache/stylelint/'
  })
  await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJSON, null, 2))
}

async function configureLintStaged() {
  const { pkgJSON, pkgJsonPath } = await getPkgJSON(process.cwd())
  patchUpdate(pkgJSON, 'lint-staged', {
    'src/**/*.{vue,js,ts,jsx,tsx}': ['eslint --fix', 'prettier --write']
  })
  patchUpdate(pkgJSON, 'simple-git-hooks', { 'pre-commit': 'npx lint-staged' })
  await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJSON, null, 2))

  const prepare = await execShell('npx', ['simple-git-hooks'])
  if (!prepare) return consola.error('lint-staged configuration failed')
  consola.success('lint-staged configured successfully')
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

async function configureCommitLint() {
  const { pkgJSON, pkgJsonPath } = await getPkgJSON(process.cwd())
  pkgJSON.config = {
    commitizen: {
      path: 'node_modules/cz-git'
    }
  }

  patchUpdate(pkgJSON, 'scripts', { commit: 'git-cz' })
  patchUpdate(pkgJSON, 'simple-git-hooks', {
    'commit-msg': 'npx --no-install commitlint --config commitlint.config.js --edit $1'
  })

  await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJSON, null, 2))

  const commitlintConfig = `/** @type {import('cz-git').UserConfig} */
${pkgJSON.type === 'module' ? 'export default' : 'module.exports'} {
  extends: ['@sunshj/commitlint-config']
}
`
  await fs.writeFile(path.resolve(process.cwd(), 'commitlint.config.js'), commitlintConfig)
  const prepare = await execShell('npx', ['simple-git-hooks'])
  if (!prepare) return consola.error('commitlint configuration failed')
  consola.success('commitlint configured successfully')
}
