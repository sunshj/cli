import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import consola from 'consola'
import { downloadGithubRepo, getPkgJSON, spinner } from '#utils'

export { selectFramework } from './select-framework'
export { selectTemplate } from './select-template'
export { inputTemplateRepo } from './input-template'

async function updatePkgName(projName: string) {
  try {
    const { pkgJSON, savePkgJSON } = await getPkgJSON(path.resolve(process.cwd(), projName))
    pkgJSON.name = projName
    await savePkgJSON()
  } catch (error: any) {
    consola.error(`Failed to update 'name' field in package.json: ${error.message}`)
  }
}

async function deleteGitFolder(projName: string) {
  const gitFolderPath = path.resolve(process.cwd(), projName, '.git')
  try {
    await fs.rm(gitFolderPath, { recursive: true })
  } catch (error: any) {
    consola.error(`Failed to delete .git folder: ${error.message}`)
  }
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
