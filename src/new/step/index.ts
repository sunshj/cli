import path from 'node:path'
import fs from 'node:fs/promises'
import { getPkgJSON } from '../../utils'
import { generateCode } from './generate'

export type ModuleType = 'module' | 'commonjs'
export { selectModuleType } from './select-type'
export { selectModuleAlias } from './select-alias'

export async function configureProject(projectName: string, type: ModuleType, alias: boolean) {
  const { pkgJSON, pkgJsonPath } = await getPkgJSON(path.join(process.cwd(), projectName))
  pkgJSON.name = projectName
  pkgJSON.type = type
  if (type === 'module') {
    if (alias) {
      pkgJSON.imports = {
        '#*': './src/*'
      }
    }
  } else {
    if (alias) {
      pkgJSON.imports = {
        '#*': './src/*.js',
        '#utils': './src/utils/index.js'
      }
    }
    pkgJSON.scripts = {
      dev: 'node --no-warnings --watch src',
      start: 'node src'
    }
  }

  await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJSON, null, 2))

  const jsconfigPath = path.join(process.cwd(), projectName, 'jsconfig.json')
  const jsconfig = {
    compilerOptions: alias
      ? {
          baseUrl: '.',
          paths: {
            '#*': ['./src/*']
          }
        }
      : undefined,
    include: ['src/**/*.js']
  }
  await fs.writeFile(jsconfigPath, JSON.stringify(jsconfig, null, 2))
  await generateCode(projectName, type, alias)
}
