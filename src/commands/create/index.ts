import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { defineCommand } from 'citty'
import consola from 'consola'
import { repos } from '#constants'
import { createProject } from './stages/create-project'
import { selectFramework } from './stages/select-framework'
import { selectTemplate } from './stages/select-template'

export const createProjectCommand = defineCommand({
  meta: {
    name: 'create',
    description: 'Create a new project with github template'
  },

  args: {
    projectName: {
      type: 'positional',
      description: 'The name of the project to create',
      required: true,
      default: 'my-project'
    }
  },

  async run({ args }) {
    const { projectName } = args
    const isExisted = existsSync(path.resolve(process.cwd(), projectName))
    if (isExisted) {
      consola.error(`Directory ${projectName} is already exists.`)
      return
    }

    const { framework } = await selectFramework()
    const { template } = await selectTemplate(framework)

    const repoName = repos.find(repo => repo.name === template)?.repo
    if (!repoName) {
      consola.error(`Template ${template} not found.`)
      return
    }

    await createProject(projectName, repoName)
  }
})
