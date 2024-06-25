import inquirer from 'inquirer'

export async function selectModuleAlias(typescript: boolean) {
  if (typescript) return { alias: false }
  return await inquirer.prompt<{ alias: boolean }>({
    type: 'confirm',
    name: 'alias',
    message: 'Do you want to use imports alias?',
    default: true
  })
}
