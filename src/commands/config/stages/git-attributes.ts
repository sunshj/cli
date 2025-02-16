import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { ensureReadFile } from '#utils'
import consola from 'consola'

export async function configureGitAttributes() {
  const GIT_ATTRS = '* text=auto eol=lf'
  const filePath = path.resolve(process.cwd(), '.gitattributes')
  const fileContent = await ensureReadFile(filePath, GIT_ATTRS)
  if (!fileContent.includes(GIT_ATTRS)) await fs.appendFile(filePath, `\n${GIT_ATTRS}`)
  consola.success('git attributes configured successfully')
}
