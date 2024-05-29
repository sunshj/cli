import fs from 'node:fs/promises'
import { getPkgJSON, getVSCodeSettings, patchUpdate } from '../../utils'

export async function configureStyleLint() {
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
