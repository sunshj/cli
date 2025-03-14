import config from '#config.js'
import { getPkgJSON, getVSCodeSettings, patchUpdate } from '#utils.js'
import type { ConfigureContext } from '..'

export async function configureStylelint(ctx: ConfigureContext) {
  if (!ctx.selectedPkgs.includes('stylelint')) return
  // add stylelint to vscode settings
  const { vscodeSettings, saveVscodeSettings } = await getVSCodeSettings(ctx.cwd)
  vscodeSettings['stylelint.validate'] = ['css', 'postcss', 'scss', 'vue']
  await saveVscodeSettings()

  // add config and scripts to package.json
  const { pkgJSON, savePkgJSON } = await getPkgJSON(ctx.cwd)
  pkgJSON.stylelint = {
    extends: config.stylelint.extendConfig
  }
  patchUpdate(pkgJSON, 'scripts', config.stylelint.scripts)

  await savePkgJSON()
}
