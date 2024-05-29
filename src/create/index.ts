import path from 'node:path'
import { defineCommand } from 'citty'
import consola from 'consola'
import { repos } from '../constants'
import { checkExists } from '../utils'
import { createProject, inputTemplateRepo, selectFramework, selectTemplate } from './step'

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
    },
    custom: {
      type: 'boolean',
      description: 'Custom template (github repo)',
      alias: 'c',
      default: false
    }
  },

  async run({ args }) {
    const { projectName, custom } = args
    const isExisted = await checkExists(path.resolve(process.cwd(), projectName))
    if (isExisted) {
      consola.error(`Directory ${projectName} is already exists.`)
      return
    }

    if (custom) {
      const { templateRepo } = await inputTemplateRepo()
      await createProject(projectName, templateRepo)
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
