import inquirer from 'inquirer'

export async function selectTypeScript() {
  return await inquirer.prompt<{ typescript: boolean }>({
    type: 'confirm',
    name: 'typescript',
    message: 'Do you want to use typescript?',
    default: true
  })
}
