import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { confirm } from '@clack/prompts'
import config from '#config.js'
import { loadPackageJson, loadVSCodeSettings, patchUpdate } from '#utils.js'
import consola from 'consola'
import type { ConfigureContext } from '..'

export async function configureESLint(ctx: ConfigureContext) {
  if (!ctx.selectedPkgs.includes('eslint')) return
  // add config to vscode settings
  const [vscodeSettings, saveVscodeSettings] = await loadVSCodeSettings(ctx.cwd)

  patchUpdate(vscodeSettings, 'eslint.validate', config.eslint.languages)

  await saveVscodeSettings()

  // add eslint config file
  const configFile = ctx.moduleType === 'module' ? 'eslint.config.js' : 'eslint.config.mjs'
  const configFilePath = path.join(ctx.cwd, configFile)

  if (
    !existsSync(configFilePath) ||
    (await confirm({ message: `${configFile} exists. Overwrite?`, initialValue: false }))
  ) {
    await writeFile(configFilePath, config.eslint.configCode, 'utf-8')
    consola.success(`Created ${configFile}`)
  }

  // add scripts to package.json
  const [pkgJSON, savePkgJSON] = await loadPackageJson(ctx.cwd)

  patchUpdate(pkgJSON, 'scripts', config.eslint.scripts)

  await savePkgJSON()
}
