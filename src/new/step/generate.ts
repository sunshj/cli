import fs from 'node:fs/promises'
import path from 'node:path'

export async function generateCode(projectName: string, type: string, alias: boolean) {
  const srcDir = path.join(process.cwd(), projectName, 'src')
  const entryFile =
    type === 'module'
      ? `import { unique } from '${alias ? '#' : './'}utils'
import { array } from '${alias ? '#' : './'}utils/array'

console.log(unique(array))
`
      : `const { unique } = require('${alias ? '#' : './'}utils')
const { array } = require('${alias ? '#' : './'}utils/array')

console.log(unique(array))
`

  const utilsAppendFile =
    type === 'module' ? `\nexport { unique }\n` : `\nmodule.exports = { unique }\n`

  const utilsArrayAppendFile =
    type === 'module' ? `\nexport { array }\n` : `\nmodule.exports = { array }\n`

  await fs.appendFile(path.join(srcDir, 'utils', 'array.js'), utilsArrayAppendFile)
  await fs.appendFile(path.join(srcDir, 'utils', 'index.js'), utilsAppendFile)
  await fs.writeFile(path.join(srcDir, 'index.js'), entryFile)
}
