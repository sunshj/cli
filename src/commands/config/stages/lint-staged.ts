import process from 'node:process'
import consola from 'consola'
import { execShell, getPkgJSON, objectPatchUpdate } from '#utils'

export async function configureLintStaged() {
  const { pkgJSON, savePkgJSON } = await getPkgJSON(process.cwd())
  objectPatchUpdate(pkgJSON, 'lint-staged', {
    'src/**/*.{vue,js,ts,jsx,tsx}': ['eslint --fix', 'prettier --write']
  })
  objectPatchUpdate(pkgJSON, 'simple-git-hooks', { 'pre-commit': 'npx lint-staged' })
  await savePkgJSON()

  const prepare = await execShell('npx', ['simple-git-hooks'])
  if (!prepare) return consola.error('lint-staged configuration failed')
  consola.success('lint-staged configured successfully')
}
