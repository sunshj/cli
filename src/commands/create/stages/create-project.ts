import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { deleteGitFolder, downloadGithubRepo, spinner, updatePkgName } from '#utils'
import consola from 'consola'

export async function createProject(projectName: string, rawRepoName: string) {
  const [repoName, branch] = rawRepoName.split('#')
  const projectPath = path.join(process.cwd(), projectName)
  await fs.mkdir(projectPath)

  spinner.start()

  await downloadGithubRepo(repoName, branch, projectPath)
    .catch(error => {
      spinner.fail(`Failed to clone repository: ${error.message}`)
      fs.rmdir(projectPath, { maxRetries: 3 })
      process.exit(1)
    })
    .finally(() => {
      spinner.stop()
    })

  spinner.succeed('Download template successfully.')
  await updatePkgName(projectName)
  await deleteGitFolder(projectName)

  consola.info(`Now run the following commands:
      cd ${projectName} 
      npm install`)
}
