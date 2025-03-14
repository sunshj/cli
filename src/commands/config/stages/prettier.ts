import config from '#config.js'
import { getPkgJSON, patchUpdate } from '#utils.js'
import type { ConfigureContext } from '..'

export async function configurePrettier(ctx: ConfigureContext) {
  if (!ctx.selectedPkgs.includes('prettier')) return
  // add config and scripts to package.json
  const { pkgJSON, savePkgJSON } = await getPkgJSON(ctx.cwd)

  pkgJSON.prettier = config.prettier.extendConfig
  patchUpdate(pkgJSON, 'scripts', config.prettier.scripts)
  await savePkgJSON()
}
