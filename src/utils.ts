import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import consola from 'consola'
import ora from 'ora'

export const spinner = ora('[Downloading template]: ')

export async function checkDirectoryExists(directoryPath: string) {
  try {
    await fs.access(directoryPath, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

export async function getPkgJSON(dir: string) {
  const pkgJsonPath = path.resolve(dir, 'package.json')
  const pkgJsonStr = await fs.readFile(pkgJsonPath, 'utf-8')
  const pkgJSON = JSON.parse(pkgJsonStr)
  return { pkgJSON, pkgJsonPath }
}

export async function getVSCodeSettings(dir: string) {
  const vscodeSettingsPath = path.resolve(dir, '.vscode/settings.json')
  const vscodeSettingExist = await checkDirectoryExists(vscodeSettingsPath)
  if (!vscodeSettingExist) {
    await fs.mkdir(path.dirname(vscodeSettingsPath), { recursive: true })
    await fs.writeFile(vscodeSettingsPath, JSON.stringify({}, null, 2))
  }
  const vscodeSettingsStr = await fs.readFile(vscodeSettingsPath, 'utf-8')
  const vscodeSettings = JSON.parse(vscodeSettingsStr)
  return { vscodeSettings, vscodeSettingsPath }
}

export async function updatePkgName(projName: string) {
  try {
    const { pkgJSON, pkgJsonPath } = await getPkgJSON(path.resolve(process.cwd(), projName))
    pkgJSON.name = projName
    await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJSON, null, 2))
  } catch (error: any) {
    consola.error(`Failed to update 'name' field in package.json: ${error.message}`)
  }
}

export function downloadGithubRepo(repoName: string, dir: string) {
  const gitClone = spawn('git', ['clone', `https://github.com/${repoName}.git`, dir], {
    stdio: 'inherit'
  })

  return new Promise((resolve, reject) => {
    gitClone.on('close', code => {
      if (code === 0) {
        resolve(true)
      }
    })

    gitClone.on('error', err => {
      reject(new Error(`Oops: ${err.message}`))
    })

    gitClone.on('exit', code => {
      if (code !== 0) {
        reject(new Error(`git clone exited with code ${code}`))
      }
    })

    process.on('SIGINT', () => {
      gitClone.kill()
      reject(new Error('Interrupted'))
    })

    process.on('SIGTERM', () => {
      reject(new Error('Terminated'))
    })

    process.on('exit', () => {
      gitClone.kill()
      spinner.stop()
      reject(new Error('Exited'))
    })
  })
}
