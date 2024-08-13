import inquirer from 'inquirer'
import { repos } from '#constants'

export async function selectTemplate(framework: string) {
  return await inquirer.prompt<{ template: string }>([
    {
      name: 'template',
      message: `Which ${framework} template do you want to use?`,
      type: 'list',
      choices: repos
        .filter(({ name }) => name.includes(framework.slice(0, framework.lastIndexOf('.'))))
        .map(({ name }) => ({ name }))
    }
  ])
}
