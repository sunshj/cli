import fs from 'node:fs/promises'
import path from 'node:path'
import consola from 'consola'
import { checkExists } from '../../utils'

export async function configureGitAttributes() {
  const GIT_ATTRS = '* text=auto eol=lf'
  const filePath = path.resolve(process.cwd(), '.gitattributes')
  const isExisted = await checkExists(filePath)
  if (!isExisted) await fs.writeFile(filePath, GIT_ATTRS)
  const fileContent = await fs.readFile(filePath, 'utf-8')
  if (!fileContent.includes(GIT_ATTRS)) await fs.appendFile(filePath, `\n${GIT_ATTRS}`)
  consola.success('git attributes configured successfully')
}
