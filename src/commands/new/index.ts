import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineCommand } from 'citty'
import consola from 'consola'
import { checkExists } from '#utils'
import {
  configureProject,
  getTemplateName,
  selectModuleAlias,
  selectModuleType,
  selectTypeScript
} from './step'

const __filename = fileURLToPath(import.meta.url)

export const newProjectCommand = defineCommand({
  meta: {
    name: 'new',
    description: 'Create a new Node.js project'
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
    const { typescript } = await selectTypeScript()
    const { alias } = await selectModuleAlias(typescript)

    await fs.mkdir(path.join(process.cwd(), projectName), { recursive: true })
    const templateName = getTemplateName(type, typescript)

    await fs.cp(path.resolve(__filename, '../..', 'templates', templateName), projectName, {
      recursive: true
    })

    await configureProject(projectName, type, alias, typescript)
    consola.success(`
Created a new node.js project at ${projectName}

To get started:

  $ cd ${projectName}
  $ npm install
  $ npm run dev
    `)
  }
})
