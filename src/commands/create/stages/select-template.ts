import { repos } from '#constants'
import inquirer from 'inquirer'

export async function selectTemplate(framework: string) {
  return await inquirer.prompt<{ template: string }>([
    {
      name: 'template',
      message: `Which ${framework} template do you want to use?`,
      type: 'list',
      choices: repos.filter(v => v.cate === framework).map(({ name }) => ({ name }))
    }
  ])
}
