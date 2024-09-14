import process from 'node:process'
import { getPkgJSON, objectPatchUpdate } from '#utils'

export async function configurePrettier() {
  const { pkgJSON, savePkgJSON } = await getPkgJSON(process.cwd())
  pkgJSON.prettier = '@sunshj/prettier-config'
  objectPatchUpdate(pkgJSON, 'scripts', { format: 'prettier --write .' })
  await savePkgJSON()
}
