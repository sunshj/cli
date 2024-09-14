import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { getJsconfig, getPkgJSON, objectPatchUpdate } from '#utils'
import type { ModuleType } from '#utils/types'

const IMPORT_STATEMENT_REGEX =
  /import(?:\s+\S.*(?:[\n\r\u2028\u2029]\s*|[\t\v\f \u00A0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF])|\s{2,})from\s["'](.*)["']/g
const REQUIRE_STATEMENT_REGEX = /require\s*\(\s*["'](.*)["']\s*\)/g

export async function configureProject(
  projectName: string,
  type: ModuleType,
  alias: boolean,
  typescript: boolean
) {
  const { pkgJSON, savePkgJSON } = await getPkgJSON(path.join(process.cwd(), projectName))
  pkgJSON.name = projectName
  pkgJSON.type = type
  if (typescript) {
    await savePkgJSON()
    return
  }

  const entryJsFilepath = path.join(process.cwd(), projectName, 'src/index.js')
  let entryJsFile = await fs.readFile(entryJsFilepath, 'utf-8')

  const aliasReplacer = (matched: string) => matched.replace('./', '#')

  if (alias) {
    if (type === 'module') {
      entryJsFile = entryJsFile.replaceAll(IMPORT_STATEMENT_REGEX, aliasReplacer)
      pkgJSON.imports = { '#*': './src/*' }
    } else {
      entryJsFile = entryJsFile.replaceAll(REQUIRE_STATEMENT_REGEX, aliasReplacer)
      pkgJSON.imports = { '#*': './src/*.js', '#utils': './src/utils/index.js' }
    }
  }

  await fs.writeFile(entryJsFilepath, entryJsFile, 'utf-8')

  await savePkgJSON()

  const { jsconfig, saveJsconfig } = await getJsconfig(path.join(process.cwd(), projectName))
  if (alias) {
    objectPatchUpdate(jsconfig, 'compilerOptions', {
      baseUrl: '.',
      paths: {
        '#*': ['./src/*']
      }
    })
  }

  await saveJsconfig()
}
