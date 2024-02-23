import inquirer from 'inquirer'
import chalk from 'chalk'
import { version as pkgVersion } from '../package.json'
import { CLI_NAME, Frameworks } from './constants'
import { checkDirectoryExists, createProject, filterRepoByFramework, getProjectName } from './utils'

async function main() {
  try {
    const projectName = await getProjectName((program, callback) => {
      program
        .name(CLI_NAME)
        .description('CLI to create some starter project')
        .version(pkgVersion, '-v, --version')

      program
        .command('create')
        .description('create a new project')
        .argument('<project-name>', 'project name')
        .action(projName => {
          callback(null, projName)
        })

      program.parse()
    })

    const isExisted = await checkDirectoryExists(projectName)
    if (isExisted) throw new Error(`Directory ${projectName} is already exists.`)

    const { framework } = await inquirer.prompt<{ framework: string }>([
      {
        name: 'framework',
        message: 'Which framework do you want to use?',
        type: 'list',
        choices: Object.values(Frameworks).map(name => ({ name }))
      }
    ])

    const { template } = await inquirer.prompt<{ template: string }>([
      {
        name: 'template',
        message: `Which ${framework} template do you want to use?`,
        type: 'list',
        choices: filterRepoByFramework(framework)
      }
    ])

    createProject(projectName, template)
  } catch (error: any) {
    console.error(chalk.red(error.message))
  }
}

main()
