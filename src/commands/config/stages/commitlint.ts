import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { createCodegenContext, execShell, getPkgJSON, patchUpdate } from '#utils'
import consola from 'consola'
import type { ModuleType } from '#utils/types'

function generateCommitlintConfigCode(type: ModuleType) {
  const ctx = createCodegenContext()

  ctx.push(`/** @type {import('cz-git').UserConfig} */`)
  ctx.newline()

  if (type === 'module') {
    ctx.push(`export default {`)
  } else {
    ctx.push(`module.exports = {`)
  }

  ctx.indent()
  ctx.push("extends: ['@sunshj/commitlint-config']")
  ctx.deindent()
  ctx.push('}')
  ctx.newline()

  return ctx.code
}

export async function configureCommitLint() {
  const { pkgJSON, savePkgJSON } = await getPkgJSON(process.cwd())
  pkgJSON.config = {
    commitizen: {
      path: 'node_modules/cz-git'
    }
  }

  patchUpdate(pkgJSON, 'scripts', { commit: 'git-cz' })
  patchUpdate(pkgJSON, 'simple-git-hooks', {
    'commit-msg': 'npx --no-install commitlint --config commitlint.config.js --edit $1'
  })

  await savePkgJSON()

  const commitlintConfig = generateCommitlintConfigCode(pkgJSON.type)

  await fs.writeFile(path.resolve(process.cwd(), 'commitlint.config.js'), commitlintConfig)
  const prepare = await execShell('npx', ['simple-git-hooks'])
  if (!prepare) return consola.error('commitlint configuration failed')
  consola.success('commitlint configured successfully')
}
