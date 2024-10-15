import { spawn } from 'node:child_process'
import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import consola from 'consola'
import ora from 'ora'
import { getJSONFile } from './internals'

export function unique<T>(array: T[]) {
  return [...new Set(array)]
}

export async function ensureReadFile(file: string, defaultContent = '') {
  const exists = existsSync(file)
  if (!exists) {
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, defaultContent)
  }
  const fileContent = await fs.readFile(file, 'utf-8')
  return fileContent.trim() || defaultContent
}

export const spinner = ora('[Downloading]: ')

export async function getPkgJSON(dir: string) {
  return await getJSONFile(path.resolve(dir, 'package.json'), 'pkgJSON')
}

export async function getVSCodeSettings(dir: string) {
  return await getJSONFile(path.resolve(dir, '.vscode/settings.json'), 'vscodeSettings')
}

export async function getJsconfig(dir: string) {
  return await getJSONFile(path.resolve(dir, 'jsconfig.json'), 'jsconfig')
}

export function objectPatchUpdate(obj: Record<string, any>, key: string, value: any) {
  if (Array.isArray(value)) {
    obj[key] = unique([...(obj[key] ?? []), ...value])
  } else if (typeof value === 'object' && value !== null) {
    obj[key] = { ...(obj[key] ?? {}), ...value }
  } else {
    obj[key] = value
  }
  return obj
}

export function downloadGithubRepo(repoName: string, branch: string, dir: string) {
  const branchArg = branch ? ['-b', branch] : []
  return execShell('git', ['clone', ...branchArg, `https://github.com/${repoName}.git`, dir])
}

export function execShell(command: string, args: string[]) {
  const cmd = spawn(command, args, { shell: true })

  return new Promise<boolean>((resolve, reject) => {
    cmd.on('close', code => {
      if (code === 0) {
        resolve(true)
      }
    })

    cmd.on('error', err => {
      reject(new Error(`Oops: ${err.message}`))
    })

    cmd.on('exit', code => {
      if (code !== 0) {
        reject(new Error(`${command} exited with code ${code}`))
      }
    })

    process.on('SIGINT', () => {
      cmd.kill()
      reject(new Error('Interrupted'))
    })

    process.on('SIGTERM', () => {
      cmd.kill()
      reject(new Error('Terminated'))
    })

    process.on('exit', () => {
      cmd.kill()
      reject(new Error('Exited'))
    })
  })
}

/**
 *
 * @param latest latest version
 * @param current current version
 */
export function compareVersions(latest: string, current: string) {
  return latest.localeCompare(current, 'en-US', { numeric: true })
}

export async function deleteGitFolder(projName: string) {
  const gitFolderPath = path.resolve(process.cwd(), projName, '.git')
  try {
    await fs.rm(gitFolderPath, { recursive: true, maxRetries: 3 })
    consola.success(`Successfully deleted .git folder`)
  } catch (error: any) {
    consola.error(`Failed to delete .git folder: ${error.message}`)
  }
}

export async function updatePkgName(projName: string) {
  try {
    const { pkgJSON, savePkgJSON } = await getPkgJSON(path.resolve(process.cwd(), projName))
    pkgJSON.name = projName
    await savePkgJSON()
    consola.success(`Successfully updated 'name' field in package.json to ${projName}`)
  } catch (error: any) {
    consola.error(`Failed to update 'name' field in package.json: ${error.message}`)
  }
}
