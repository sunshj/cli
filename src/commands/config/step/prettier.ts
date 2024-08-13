import process from 'node:process'
import { getPkgJSON, patchUpdate } from '#utils'

export async function configurePrettier() {
  const { pkgJSON, savePkgJSON } = await getPkgJSON(process.cwd())
  pkgJSON.prettier = '@sunshj/prettier-config'
  patchUpdate(pkgJSON, 'scripts', { format: 'prettier --write .' })
  await savePkgJSON()
}
