import { existsSync } from 'node:fs'
import path from 'node:path'
import { confirm } from '@clack/prompts'
import { getPkgJSON } from '#utils.js'
import consola from 'consola'
import { installDependencies } from 'nypm'
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
    await x('git', ['init', ctx.projectPath])
    consola.success('Initialized git repository')
  }

  const install = await confirm({
    message: 'Do you want to install dependencies?',
    initialValue: true
  })

  if (install === true) {
    await installDependencies({ cwd: ctx.projectPath })
    consola.info(`Now run the following commands:
      cd ${ctx.projectName}`)
  } else {
    consola.info(`Now run the following commands:
      cd ${ctx.projectName} 
      ${ctx.pm} install
    `)
  }
}
