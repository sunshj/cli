import fs from 'node:fs/promises'
import process from 'node:process'
import { getPkgJSON, getVSCodeSettings, objectPatchUpdate } from '#utils'
import type { ModuleType } from '#utils/types'

export async function configureESLint() {
  const { vscodeSettings, saveVscodeSettings } = await getVSCodeSettings(process.cwd())
  objectPatchUpdate(vscodeSettings, 'eslint.validate', [
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
  const pkgType: ModuleType = pkgJSON.type ?? 'commonjs'
  const configFileName = pkgType === 'module' ? 'eslint.config.js' : 'eslint.config.mjs'

  await fs.writeFile(
    configFileName,
    `import { defineConfig } from '@sunshj/eslint-config'
    
  export default defineConfig({})
    `,
    'utf-8'
  )

  objectPatchUpdate(pkgJSON, 'scripts', { lint: 'eslint .', 'lint:fix': 'eslint . --fix' })
  await savePkgJSON()
}
