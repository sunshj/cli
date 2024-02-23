import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import ora from 'ora'
import download from 'download-git-repo'
import chalk from 'chalk'
import { Command } from '@commander-js/extra-typings'
import { repos } from './constants'

export const downloadGitRepo = promisify(download)

export async function checkDirectoryExists(directoryPath: string) {
  try {
    await fs.access(directoryPath, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

export async function updatePkgName(projName: string) {
  try {
    const pkgJsonPath = path.resolve(process.cwd(), projName, 'package.json')
    const pkgJsonStr = await fs.readFile(pkgJsonPath, 'utf-8')
    const pkgJson = JSON.parse(pkgJsonStr)
    pkgJson.name = projName
    await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 2))
  } catch (error: any) {
    throw new Error(`Failed to update 'name' field in package.json: ${error.message}`)
  }
}

export async function getProjectName(
  fn: (program: Command, cb: (err: any, data: string) => void) => void
) {
  const program = new Command()
  return await new Promise<string>(resolve => {
    fn(program, (err: any, data: string) => {
      if (err) throw err
      resolve(data)
    })
  })
}

export async function createProject(projName: string, templateName: string) {
  const repoPath = repos.find(repo => repo.name === templateName)!.repo
  await fs.mkdir(path.join(process.cwd(), projName), { recursive: true })
  const spinner = ora(`Cloning ${templateName}...`).start()

  await downloadGitRepo(repoPath, projName, {})
    .then(() => {
      spinner.succeed('Repository downloaded successfully!')
      return projName
    })
    .then(updatePkgName)
    .then(() => {
      console.log(
        chalk.yellow(`Now run the following commands:
  cd ${projName} 
  npm install`)
      )
    })
    .catch(error => {
      spinner.fail(`Failed to clone ${templateName} repository: ${error.message}`)
      fs.rmdir(projName)
    })
    .finally(() => {
      spinner.stop()
    })
}

export function filterRepoByFramework(framework: string) {
  return repos
    .filter(({ name }) => name.includes(framework.slice(0, framework.lastIndexOf('.'))))
    .map(({ name }) => ({ name }))
}
