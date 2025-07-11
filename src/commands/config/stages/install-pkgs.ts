import { tasks, type Task } from '@clack/prompts'
import config from '#config'
import { addDevDependency } from 'nypm'
import type { ConfigureContext } from '..'
import { configurePkg } from './configure'

const installPkgsConfig = new Map(Object.entries(config.installPkgs))

export async function installPkgs(ctx: ConfigureContext) {
  const _tasks: Task[] = []

  for (const selectedPkg of ctx.selectedPkgs) {
    const pkgs = installPkgsConfig.get(selectedPkg)!

    _tasks.push({
      title: `Installing ${selectedPkg} packages`,
      async task(message) {
        await addDevDependency(pkgs, {
          silent: true,
          workspace: ctx.workspace
        })
        message(`Installed ${pkgs.join(', ')}`)
        await configurePkg(selectedPkg, ctx)
      }
    })
  }

  await tasks(_tasks)
}
