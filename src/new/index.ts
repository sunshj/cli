import path from 'node:path'
import fs from 'node:fs/promises'
import { defineCommand } from 'citty'
import consola from 'consola'
import { checkExists } from '../utils'
import { configureProject, selectModuleAlias, selectModuleType } from './util'

export const newProjectCommand = defineCommand({
  meta: {
    name: 'new',
    description: 'Create a new node.js project'
  },
  args: {
    projectName: {
      type: 'positional',
      description: 'Project name',
      required: true,
      default: 'my-app'
    }
  },
  async run({ args }) {
    const { projectName } = args
    const isExisted = await checkExists(path.resolve(process.cwd(), projectName))
    if (isExisted) {
      consola.error(`Directory ${projectName} is already exists.`)
      return
    }
    const { type } = await selectModuleType()
    const { alias } = await selectModuleAlias()

    await fs.mkdir(path.join(process.cwd(), projectName), { recursive: true })

    await fs.cp(path.join(process.cwd(), 'templates/basic'), projectName, {
      recursive: true
    })

    await configureProject(projectName, type, alias)
    consola.success(`
Created a new node.js project at ${projectName}

To get started:

  $ cd ${projectName}
  $ npm install
  $ npm run dev
    `)
  }
})
