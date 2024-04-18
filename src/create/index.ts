import fs from 'node:fs/promises'
import path from 'node:path'
import { defineCommand } from 'citty'
import consola from 'consola'
import { repos } from '../constants'
import { checkExists, deleteGitFolder, downloadGithubRepo, spinner, updatePkgName } from '../utils'
import { selectFramework, selectTemplate } from './util'

export const createProjectCommand = defineCommand({
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
    const isExisted = await checkExists(path.resolve(process.cwd(), projectName))
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
      await deleteGitFolder(projectName)
      consola.success(`Now run the following commands:
      cd ${projectName} 
      npm install`)
    }
  }
})
