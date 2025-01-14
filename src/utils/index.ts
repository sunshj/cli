import { spawn } from 'node:child_process'
import process from 'node:process'
import { defu } from 'defu'
import ora from 'ora'

export * from './file'

export const spinner = ora('[Downloading]: ')

export function unique<T>(array: T[]) {
  return [...new Set(array)]
}

export function capitalize<T extends string>(str: T) {
  return (str?.charAt(0).toUpperCase() + str?.slice(1)) as Capitalize<T>
}

export function patchUpdate(obj: Record<string, any>, key: string, value: any, deepMerge = true) {
  const merge = (s: any, ...args: any[]) =>
    deepMerge ? defu(s, ...args) : Object.assign(s, ...args)

  if (Array.isArray(value)) {
    obj[key] = unique([...(obj[key] ?? []), ...value])
  } else if (typeof value === 'object' && value !== null) {
    obj[key] = merge(obj[key] ?? {}, value)
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

/**
 * DO NOT DESTRUCTURE RETURN VALUE
 */
export function createCodegenContext() {
  return {
    code: '',
    indentLevel: 0,
    push(code: string) {
      this.code += code
    },
    unshift(code: string) {
      this.code = code + this.code
    },
    newline(n?: number) {
      this.push(`\n${'  '.repeat(n ?? this.indentLevel)}`)
    },
    indent() {
      this.newline(++this.indentLevel)
    },
    deindent(withoutNewline = false) {
      if (withoutNewline) {
        --this.indentLevel
      } else {
        this.newline(--this.indentLevel)
      }
    }
  }
}
