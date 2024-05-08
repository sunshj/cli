import path from 'node:path'
import fs from 'node:fs/promises'
import inquirer from 'inquirer'
import { getPkgJSON } from '../utils'

export async function selectModuleType() {
  return await inquirer.prompt<{ type: string }>({
    name: 'type',
    message: 'What type of module do you want to create?',
    type: 'list',
    choices: [
      {
        name: 'ES Modules',
        value: 'module'
      },
      {
        name: 'CommonJS',
        value: 'commonjs'
      }
    ]
  })
}

export async function selectModuleAlias() {
  return await inquirer.prompt<{ alias: boolean }>({
    type: 'confirm',
    name: 'alias',
    message: 'Do you want to use imports alias?',
    default: true
  })
}

export async function configureProject(projectName: string, type: string, alias: boolean) {
  const { pkgJSON, pkgJsonPath } = await getPkgJSON(path.join(process.cwd(), projectName))
  pkgJSON.name = projectName
  pkgJSON.type = type
  if (alias) {
    pkgJSON.imports = {
      '#*': './src/*'
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

async function generateCode(projectName: string, type: string, alias: boolean) {
  const srcDir = path.join(process.cwd(), projectName, 'src')
  const entryFile =
    type === 'module'
      ? `import { unique } from '${alias ? '#' : './'}utils'

console.log(unique([1, 1, 2, 3, 4, 4, 5]))
`
      : `const { unique } = require('${alias ? '#' : './'}utils')

console.log(unique([1, 1, 2, 3, 4, 4, 5]))
`

  const utilsAppendFile =
    type === 'module' ? `\nexport { unique }\n` : `\nmodule.exports = { unique }\n`

  await fs.appendFile(path.join(srcDir, 'utils', 'index.js'), utilsAppendFile)
  await fs.writeFile(path.join(srcDir, 'index.js'), entryFile)
}
