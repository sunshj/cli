import { defineCommand, runMain } from 'citty'
import { CLI_NAME, repos } from './constants'
import { version as pkgVersion } from '../package.json'
import {
  checkDirectoryExists,
  downloadGithubRepo,
  selectFramework,
  selectTemplate,
  spinner,
  updatePkgName
} from './utils'
import consola from 'consola'
import fs from 'fs/promises'
import path from 'path'

const createProjectCommand = defineCommand({
  meta: {
    name: 'create',
    description: 'Create a new project'
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
    const isExisted = await checkDirectoryExists(path.resolve(process.cwd(), projectName))
    if (isExisted) {
      consola.error(`Directory ${projectName} is already exists.`)
      return
    }

    const { framework } = await selectFramework()
    const { template } = await selectTemplate(framework)

    const repoName = repos.find(repo => repo.name === template)?.repo!
    await fs.mkdir(path.join(process.cwd(), projectName), { recursive: true })

    spinner.start()

    const isDownloaded = await downloadGithubRepo(repoName, path.join(process.cwd(), projectName))
      .catch(error => {
        spinner.fail(`Failed to clone ${template} repository: ${error.message}`)
        fs.rmdir(projectName)
      })
      .finally(() => {
        spinner.stop()
      })

    if (isDownloaded) {
      spinner.succeed('Download template successfully.')
      await updatePkgName(projectName)
      consola.success(`Now run the following commands:
    cd ${projectName} 
    npm install`)
    }
  }
})

const main = defineCommand({
  meta: {
    name: CLI_NAME,
    description: 'CLI to create some starter project',
    version: pkgVersion
  },

  subCommands: { create: createProjectCommand }
})

runMain(main)
