import path from 'node:path'
import fs from 'node:fs/promises'
import inquirer from 'inquirer'
import consola from 'consola'
import { Frameworks, repos } from '../constants'
import { deleteGitFolder, downloadGithubRepo, spinner, updatePkgName } from '../utils'

export async function selectFramework() {
  return await inquirer.prompt<{ framework: string }>([
    {
      name: 'framework',
      message: 'Which framework do you want to use?',
      type: 'list',
      choices: Object.values(Frameworks).map(name => ({ name }))
    }
  ])
}

export async function selectTemplate(framework: string) {
  return await inquirer.prompt<{ template: string }>([
    {
      name: 'template',
      message: `Which ${framework} template do you want to use?`,
      type: 'list',
      choices: repos
        .filter(({ name }) => name.includes(framework.slice(0, framework.lastIndexOf('.'))))
        .map(({ name }) => ({ name }))
    }
  ])
}

export async function inputTemplateRepo() {
  return await inquirer.prompt<{ templateRepo: string }>([
    {
      name: 'templateRepo',
      message: 'Enter the template repo name (eg. sunshj/cli):',
      type: 'input'
    }
  ])
}

export async function createProject(projectName: string, repoName: string) {
  await fs.mkdir(path.join(process.cwd(), projectName), { recursive: true })

  spinner.start()

  const isDownloaded = await downloadGithubRepo(repoName, path.join(process.cwd(), projectName))
    .catch(error => {
      spinner.fail(`Failed to clone repository: ${error.message}`)
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
