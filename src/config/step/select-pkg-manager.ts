import process from 'node:process'
import inquirer from 'inquirer'
import { getPackageManager } from '../../utils'

export async function selectPackageManager() {
  return await inquirer.prompt<{ packageManager: string }>([
    {
      name: 'packageManager',
      message: 'Which package manager do you want to use?',
      type: 'list',
      default: await getPackageManager(process.cwd()),
      choices: ['npm', 'pnpm']
    }
  ])
}
