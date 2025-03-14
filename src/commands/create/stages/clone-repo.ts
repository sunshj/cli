import { existsSync } from 'node:fs'
import { confirm, spinner } from '@clack/prompts'
import { downloadTemplate } from 'giget'
import type { CreationContext } from '..'

const dlSpinner = spinner({ indicator: 'timer' })

export async function cloneRepo(ctx: CreationContext, repoUrl: string) {
  let forceClean = false
  if (existsSync(ctx.projectPath)) {
    const result = await confirm({
      message: `${ctx.projectName} already exists. Overwrite?`,
      initialValue: false
    })
    if (result === true) forceClean = true
  }

  dlSpinner.start('Downloading template...')
  return await downloadTemplate(repoUrl, {
    cwd: ctx.cwd,
    dir: ctx.projectName,
    forceClean
  }).finally(() => {
    dlSpinner.stop('Downloaded template.')
  })
}
