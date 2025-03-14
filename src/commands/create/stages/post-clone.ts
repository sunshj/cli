import { existsSync } from 'node:fs'
import path from 'node:path'
import { confirm } from '@clack/prompts'
import { getPkgJSON } from '#utils.js'
import { x } from 'tinyexec'
import type { CreationContext } from '..'

export async function postClone(ctx: CreationContext) {
  // update package.json name field
  const { pkgJSON, savePkgJSON } = await getPkgJSON(ctx.projectPath)

  pkgJSON.name = ctx.projectName

  await savePkgJSON()

  // initial git commit
  if (!existsSync(path.join(ctx.projectPath, '.git'))) {
    await confirm({
      message: 'Do you want to initialize a git repository?',
      initialValue: true
    })
    await x('git', ['init'])
    await x('git', ['add', '.'])
    await x('git', ['commit', '-m', 'Initial commit'])
  }
}
