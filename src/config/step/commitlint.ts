import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import consola from 'consola'
import { execShell, getPkgJSON, patchUpdate } from '../../utils'

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

  const commitlintConfig = `/** @type {import('cz-git').UserConfig} */
${pkgJSON.type === 'module' ? 'export default' : 'module.exports ='} {
  extends: ['@sunshj/commitlint-config']
}
`
  await fs.writeFile(path.resolve(process.cwd(), 'commitlint.config.js'), commitlintConfig)
  const prepare = await execShell('npx', ['simple-git-hooks'])
  if (!prepare) return consola.error('commitlint configuration failed')
  consola.success('commitlint configured successfully')
}
