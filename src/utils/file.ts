import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import consola from 'consola'
import JSONC from 'jsonc-parser'
import type { Trim } from './types'
import { capitalize } from './index'

export async function ensureReadFile(file: string, defaultContent = '') {
  const exists = existsSync(file)
  if (!exists) {
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, defaultContent)
  }
  const fileContent = await fs.readFile(file, 'utf-8')
  return fileContent.trim() || defaultContent
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

export async function getJsconfig(dir: string) {
  return await loadJSONFile(path.resolve(dir, 'jsconfig.json'), 'jsconfig')
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
