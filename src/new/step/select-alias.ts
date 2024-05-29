import inquirer from 'inquirer'

export async function selectModuleAlias() {
  return await inquirer.prompt<{ alias: boolean }>({
    type: 'confirm',
    name: 'alias',
    message: 'Do you want to use imports alias?',
    default: true
  })
}
