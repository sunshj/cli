import { appendFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import config from '#config'
import { ensureReadFile } from '#utils'
import consola from 'consola'
import type { ConfigureContext } from '..'

async function editGitAttributes() {
  const filePath = path.resolve(process.cwd(), '.gitattributes')
  const fileContent = await ensureReadFile(filePath)
  if (!fileContent.includes(config.gitAttributes)) {
    await appendFile(filePath, config.gitAttributes)
    consola.success('Added .gitattributes')
  }
}

async function editGitIgnore(ctx: ConfigureContext) {
  if (!ctx.selectedPkgs.includes('eslint')) return
  const filePath = path.resolve(process.cwd(), '.gitignore')
  const fileContent = await ensureReadFile(filePath)
  if (!fileContent.includes('.eslintcache')) {
    await appendFile(filePath, '\n.eslintcache\n')
    consola.success('Added .eslintcache to .gitignore')
  }
}

export async function configureGitFiles(ctx: ConfigureContext) {
  await editGitAttributes()
  await editGitIgnore(ctx)
}
