import fs from 'node:fs/promises'
import process from 'node:process'
import { createCodegenContext, getPkgJSON, getVSCodeSettings, patchUpdate } from '#utils'

function generateESLintConfigCode() {
  const ctx = createCodegenContext()
  ctx.push("import { defineConfig } from '@sunshj/eslint-config'")
  ctx.newline()
  ctx.newline()
  ctx.push('export default defineConfig({})')
  ctx.newline()
  return ctx.code
}

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

  await fs.writeFile(configFileName, generateESLintConfigCode(), 'utf-8')

  patchUpdate(pkgJSON, 'scripts', {
    lint: 'eslint . --cache',
    'lint:fix': 'eslint . --fix --cache'
  })
  await savePkgJSON()
}
