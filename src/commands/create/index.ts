import path from 'node:path'
import process from 'node:process'
import config from '#config.js'
import { defineCommand } from 'citty'
import { cloneRepo } from './stages/clone-repo'
import { enterProjectName } from './stages/enter-name'
import { postClone } from './stages/post-clone'
import { selectTemplate } from './stages/select-template'

export interface CreationContext {
  projectName: string
  projectPath: string
  cwd: string
  localFile: string
  remoteFile: string
}

export const createProjectCommand = defineCommand({
  meta: {
    name: 'create',
    description: 'Create a new project'
  },
  args: {
    remote: {
      description: 'use Remote templates json',
      type: 'string',
      alias: 'r'
    }
  },
  async setup({ args }) {
    const projectName = await enterProjectName()
    const ctx: CreationContext = {
      projectName,
      cwd: process.cwd(),
      projectPath: path.join(process.cwd(), projectName),
      localFile: config.localTemplatesFile,
      remoteFile: args.remote
    }

    const templateRepoUrl = await selectTemplate(ctx)
    if (!templateRepoUrl) return
    await cloneRepo(ctx, templateRepoUrl)
    await postClone(ctx)
  }
})
