import path from 'node:path'
import fs from 'node:fs/promises'
import type { Trim } from './types'

async function checkExists(p: string) {
  try {
    await fs.access(p, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function ensureReadFile(file: string, defaultContent = '') {
  const exists = await checkExists(file)
  if (!exists) {
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, defaultContent)
  }
  return await fs.readFile(file, 'utf-8')
}

function capitalize<T extends string>(str: T) {
  return (str?.charAt(0).toUpperCase() + str?.slice(1)) as Capitalize<T>
}

async function getJSONFile<T extends string = ''>(filepath: string, namespace?: T) {
  const fileContent = await ensureReadFile(filepath, '{}')
  const json = JSON.parse(fileContent)

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

export { checkExists, ensureReadFile, getJSONFile }
