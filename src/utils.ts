import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import defu from 'defu'
import JSONC from 'jsonc-parser'
import type { ZodError } from 'zod'

export function unique<T>(array: T[]) {
  return [...new Set(array)]
}

/**
 *
 * @param latest latest version
 * @param current current version
 */
export function compareVersions(latest: string, current: string) {
  return latest.localeCompare(current, 'en-US', { numeric: true })
}

export function patchUpdate(obj: Record<string, any>, key: string, value: any) {
  if (Array.isArray(value)) {
    obj[key] = unique([...(obj[key] ?? []), ...value])
  } else if (typeof value === 'object' && value !== null) {
    obj[key] = defu(value, obj[key] ?? {})
  } else {
    obj[key] = value
  }
  return obj
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

type Whitespace = '\n' | ' '

export type Trim<T> = T extends `${Whitespace}${infer U}`
  ? Trim<U>
  : T extends `${infer U}${Whitespace}`
    ? Trim<U>
    : T

export type ModuleType = 'module' | 'commonjs'

export function capitalize<T extends string>(str: T) {
  return (str?.charAt(0).toUpperCase() + str?.slice(1)) as Capitalize<T>
}

async function loadJSONFile<T extends string = ''>(filepath: string, namespace?: T) {
  const fileContent = await ensureReadFile(filepath, '{}')
  const json: Record<string, any> = JSONC.parse(fileContent)

  const save = async (jsonObj?: Record<string, any>) => {
    await fs.writeFile(filepath, JSON.stringify(jsonObj ?? json, null, 2))
  }

  type ResJson = { [K in Trim<T> extends '' ? 'json' : Trim<T>]: typeof json }
  type ResSave = {
    [K in Trim<T> extends string ? `save${Capitalize<Trim<T>>}` : 'save']: typeof save
  }
  type Result = ResJson & ResSave

  const result = {
    [namespace?.trim() ? namespace.trim() : 'json']: json,
    [`save${capitalize(namespace?.trim() ?? '')}`]: save
  }

  return result as Result
}

export async function getPkgJSON(dir: string) {
  return await loadJSONFile(path.resolve(dir, 'package.json'), 'pkgJSON')
}

export async function getVSCodeSettings(dir: string) {
  return await loadJSONFile(path.resolve(dir, '.vscode/settings.json'), 'vscodeSettings')
}

export function extractZodError(error: ZodError) {
  return error.errors.map(err => err.message).join(', ')
}
