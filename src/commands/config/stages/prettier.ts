import config from '#config.js'
import { loadPackageJson, loadVSCodeSettings, patchUpdate } from '#utils.js'
import type { ConfigureContext } from '..'

export async function configurePrettier(ctx: ConfigureContext) {
  if (!ctx.selectedPkgs.includes('prettier')) return

  // add config to vscode settings
  const [vscodeSettings, saveVscodeSettings] = await loadVSCodeSettings(ctx.cwd)
  patchUpdate(vscodeSettings, 'editor.defaultFormatter', 'esbenp.prettier-vscode')
  await saveVscodeSettings()

  // add config and scripts to package.json
  const [pkgJSON, savePkgJSON] = await loadPackageJson(ctx.cwd)

  pkgJSON.prettier = config.prettier.extendConfig
  patchUpdate(pkgJSON, 'scripts', config.prettier.scripts)
  await savePkgJSON()
}
