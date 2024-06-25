import process from 'node:process'
import { getPkgJSON, getVSCodeSettings, patchUpdate } from '../../utils'

export async function configureStyleLint() {
  const { vscodeSettings, saveVscodeSettings } = await getVSCodeSettings(process.cwd())
  vscodeSettings['stylelint.validate'] = ['css', 'postcss', 'scss', 'vue']
  await saveVscodeSettings()

  const { pkgJSON, savePkgJSON } = await getPkgJSON(process.cwd())
  pkgJSON.stylelint = { extends: '@sunshj/stylelint-config' }
  patchUpdate(pkgJSON, 'scripts', {
    stylelint:
      'stylelint --cache --fix "src/**/*.{vue,css,scss}" --cache --cache-location node_modules/.cache/stylelint/'
  })
  await savePkgJSON()
}
