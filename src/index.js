const chalk = require('chalk')
const { checkDirectoryNotExist, getProjectName, getPromptResult, create, filterRepoByFramework } = require('./lib')
const { version } = require('../package.json')
const { Frameworks } = require('./lib/constant')

async function main() {
  try {
    const projName = await getProjectName((program, callback) => {
      program.name('sun').description('CLI to create some starter project').version(version, '-v, --version')
      program
        .command('create')
        .description('create a new project')
        .argument('<project-name>', 'project name')
        .action(projectName => {
          callback(null, projectName)
        })

      program.parse()
    })

    await checkDirectoryNotExist(projName)

    const { framework } = await getPromptResult([
      {
        name: 'framework',
        message: 'select your framework to created',
        type: 'list',
        choices: Object.values(Frameworks).map(name => ({ name })),
      },
    ])

    const { template } = await getPromptResult([
      {
        name: 'template',
        message: `select your ${framework} starter template`,
        type: 'list',
        choices: filterRepoByFramework(framework),
      },
    ])

    create(projName, template)
  } catch (err) {
    console.error(chalk.red(err.message))
  }
}

main()
