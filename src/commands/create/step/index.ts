import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import consola from 'consola'
import { deleteGitFolder, downloadGithubRepo, spinner, updatePkgName } from '#utils'

export { selectFramework } from './select-framework'
export { selectTemplate } from './select-template'

export async function createProject(projectName: string, rawRepoName: string) {
  const [repoName, branch] = rawRepoName.split('#')
  const projectPath = path.join(process.cwd(), projectName)
  await fs.mkdir(projectPath)

  spinner.start()

  const isDownloaded = await downloadGithubRepo(repoName, branch, projectPath)
    .catch(error => {
      spinner.fail(`Failed to clone repository: ${error.message}`)
      return false
    })
    .finally(() => {
      spinner.stop()
    })

  if (isDownloaded) {
    spinner.succeed('Download template successfully.')
    await updatePkgName(projectName)
    await deleteGitFolder(projectName)

    consola.info(`Now run the following commands:
      cd ${projectName} 
      npm install`)
  } else {
    await fs.rmdir(projectPath, { maxRetries: 3 })
  }
}
