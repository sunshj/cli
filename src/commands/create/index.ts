import path from 'node:path'
import process from 'node:process'
import config from '#config.js'
import { defineCommand } from 'citty'
import { detectPackageManager } from 'nypm'
import { cloneRepo } from './stages/clone-repo'
import { enterProjectName } from './stages/enter-name'
import { postClone } from './stages/post-clone'
import { selectTemplates } from './stages/select-template'

export interface CreationContext {
  projectName: string
  projectPath: string
  cwd: string
  pm: string
  localConfigFile: string
  remoteConfigFile: string
}

export const createProjectCommand = defineCommand({
  meta: {
    name: 'create',
    description: 'Create a new project'
  },
  args: {
    projectName: {
      type: 'positional',
      required: false
    },
    remote: {
      type: 'string',
      description: 'use Remote config',
      required: false,
      alias: 'r'
    }
  },
  async setup({ args }) {
    const projectName = await enterProjectName(args.projectName)
    const cwd = process.cwd()
    const pm = await detectPackageManager(cwd)

    const ctx: CreationContext = {
      projectName,
      cwd,
      pm: pm?.name || 'npm',
      projectPath: path.join(cwd, projectName),
      localConfigFile: config.localConfigFile,
      remoteConfigFile: args.remote
    }

    const templateRepoUrl = await selectTemplates(ctx)
    if (!templateRepoUrl) return
    await cloneRepo(ctx, templateRepoUrl)
    await postClone(ctx)
  }
})
