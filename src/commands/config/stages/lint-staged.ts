import process from 'node:process'
import consola from 'consola'
import { execShell, getPkgJSON, objectPatchUpdate } from '#utils'

export async function configureLintStaged(configurePkgs: string[]) {
  const { pkgJSON, savePkgJSON } = await getPkgJSON(process.cwd())

  if (configurePkgs.includes('eslint')) {
    objectPatchUpdate(pkgJSON, 'lint-staged', {
      '*.{vue,js,ts,jsx,tsx,json,md,yaml': ['eslint --fix']
    })
  }

  if (configurePkgs.includes('prettier')) {
    objectPatchUpdate(pkgJSON, 'lint-staged', {
      '*.{vue,js,ts,jsx,tsx,json,md,yaml': ['prettier --write']
    })
  }

  if (configurePkgs.includes('stylelint')) {
    objectPatchUpdate(pkgJSON, 'lint-staged', {
      '*.{vue,css,scss}': ['stylelint --fix']
    })
  }

  objectPatchUpdate(pkgJSON, 'simple-git-hooks', { 'pre-commit': 'npx lint-staged' })
  await savePkgJSON()

  const prepare = await execShell('npx', ['simple-git-hooks'])
  if (!prepare) return consola.error('lint-staged configuration failed')
  consola.success('lint-staged configured successfully')
}