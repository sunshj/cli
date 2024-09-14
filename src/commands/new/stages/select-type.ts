import inquirer from 'inquirer'
import type { ModuleType } from '#utils/types'

export async function selectModuleType() {
  return await inquirer.prompt<{ type: ModuleType }>({
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
