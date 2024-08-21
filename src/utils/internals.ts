import fs from 'node:fs/promises'
import type { Trim } from './types'
import { ensureReadFile } from '.'

function capitalize<T extends string>(str: T) {
  return (str?.charAt(0).toUpperCase() + str?.slice(1)) as Capitalize<T>
}

export async function getJSONFile<T extends string = ''>(filepath: string, namespace?: T) {
  const fileContent = await ensureReadFile(filepath, '{}')
  const REPLACE_COMMENT_REGEX = /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm
  REPLACE_COMMENT_REGEX.lastIndex = 0
  const json = JSON.parse(fileContent.replaceAll(REPLACE_COMMENT_REGEX, ''))

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
