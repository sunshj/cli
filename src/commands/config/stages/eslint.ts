import fs from 'node:fs/promises'
import process from 'node:process'
import { getPkgJSON, getVSCodeSettings, patchUpdate } from '#utils'

export async function configureESLint() {
  const { vscodeSettings, saveVscodeSettings } = await getVSCodeSettings(process.cwd())
  patchUpdate(vscodeSettings, 'eslint.validate', [
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
  ])

  await saveVscodeSettings()

  const { pkgJSON, savePkgJSON } = await getPkgJSON(process.cwd())
  const configFileName = pkgJSON.type === 'module' ? 'eslint.config.js' : 'eslint.config.mjs'

  const configCode = `import { defineConfig } from '@sunshj/eslint-config'

export default defineConfig({})
`

  await fs.writeFile(configFileName, configCode, 'utf-8')

  patchUpdate(pkgJSON, 'scripts', {
    lint: 'eslint . --cache',
    'lint:fix': 'eslint . --fix --cache'
  })
  await savePkgJSON()
}
