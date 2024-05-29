import fs from 'node:fs/promises'
import consola from 'consola'
import { execShell, getPkgJSON, patchUpdate } from '../../utils'

export async function configureLintStaged() {
  const { pkgJSON, pkgJsonPath } = await getPkgJSON(process.cwd())
  patchUpdate(pkgJSON, 'lint-staged', {
    'src/**/*.{vue,js,ts,jsx,tsx}': ['eslint --fix', 'prettier --write']
  })
  patchUpdate(pkgJSON, 'simple-git-hooks', { 'pre-commit': 'npx lint-staged' })
  await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJSON, null, 2))

  const prepare = await execShell('npx', ['simple-git-hooks'])
  if (!prepare) return consola.error('lint-staged configuration failed')
  consola.success('lint-staged configured successfully')
}
