import path from 'node:path'
import fs from 'node:fs/promises'
import consola from 'consola'
import { deleteGitFolder, downloadGithubRepo, spinner, updatePkgName } from '../../utils'

export { selectFramework } from './select-framework'
export { selectTemplate } from './select-template'
export { inputTemplateRepo } from './input-template'

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
