import fs from 'node:fs/promises'
import { getPkgJSON, patchUpdate } from '../../utils'

export async function configurePrettier() {
  const { pkgJSON, pkgJsonPath } = await getPkgJSON(process.cwd())
  pkgJSON.prettier = '@sunshj/prettier-config'
  patchUpdate(pkgJSON, 'scripts', { format: 'prettier --write .' })
  await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJSON, null, 2))
}
