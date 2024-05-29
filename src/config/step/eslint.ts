import fs from 'node:fs/promises'
import { getPkgJSON, getVSCodeSettings, patchUpdate } from '../../utils'

export async function configureESLint() {
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
