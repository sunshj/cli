import { Frameworks } from '#constants'
import inquirer from 'inquirer'

export async function selectFramework() {
  return await inquirer.prompt<{ framework: string }>([
    {
      name: 'framework',
      message: 'Which framework do you want to use?',
      type: 'list',
      choices: Object.values(Frameworks).map(name => ({ name }))
    }
  ])
}
