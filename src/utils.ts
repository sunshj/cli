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

async function loadJSON<T extends Record<string, any>>(filepath: string) {
  const fileContent = await ensureReadFile(filepath, '{}')
  const json: T = JSONC.parse(fileContent)

  const save = async (jsonObj?: Record<string, any>) => {
    await fs.writeFile(filepath, JSON.stringify(jsonObj ?? json, null, 2))
  }

  return [json, save] as const
}

export async function loadPackageJson(cwd: string) {
  return await loadJSON(path.resolve(cwd, 'package.json'))
}

export async function loadVSCodeSettings(cwd: string) {
  return await loadJSON(path.resolve(cwd, '.vscode/settings.json'))
}

export function extractZodError(error: ZodError) {
  return error.errors.map(err => err.message).join(', ')
}
