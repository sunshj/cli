import { spawn } from 'node:child_process'
import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
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

export const spinner = ora('[Downloading template]: ')

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

export function downloadGithubRepo(repoName: string, dir: string) {
  return execShell('git', ['clone', `https://github.com/${repoName}.git`, dir])
}

export function getPackageManager(dir: string) {
  const hasPnpm = existsSync(path.resolve(dir, 'pnpm-lock.yaml'))

  if (hasPnpm) return 'pnpm'
  return 'npm'
}

export function execShell(command: string, args: string[]) {
  const cmd = spawn(command, args, { stdio: 'inherit', shell: true })

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
      reject(new Error('Terminated'))
    })

    process.on('exit', () => {
      cmd.kill()
      reject(new Error('Exited'))
    })
  })
}

export function compareVersions(a: string, b: string) {
  return a.localeCompare(b, 'en-US', { numeric: true })
}
