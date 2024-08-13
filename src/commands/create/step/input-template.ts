import inquirer from 'inquirer'

export async function inputTemplateRepo() {
  return await inquirer.prompt<{ templateRepo: string }>([
    {
      name: 'templateRepo',
      message: 'Enter the template repo name (eg. sunshj/cli):',
      type: 'input'
    }
  ])
}
