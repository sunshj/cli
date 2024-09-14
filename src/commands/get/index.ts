import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { defineCommand } from 'citty'
import consola from 'consola'
import { createProject } from '../create/stages/create-project'

export const getRepoCommand = defineCommand({
  meta: {
    name: 'get',
    description: 'Get a repository'
  },
  args: {
    repoName: {
      type: 'positional',
      description: 'The repository to get (e.g. "user/repo")'
    },
    projectName: {
      type: 'positional',
      required: false,
      description: 'The project name'
    }
  },
  setup({ args }) {
    if (!args.projectName) {
      const [repoName] = args.repoName.split('#')
      args.projectName = repoName.split('/').at(-1)!
    }
  },
  async run({ args }) {
    const { projectName, repoName } = args

    if (existsSync(path.resolve(process.cwd(), projectName))) {
      consola.error(`Directory '${projectName}' already exists`)
      return
    }

    await createProject(projectName, repoName)
  }
})
