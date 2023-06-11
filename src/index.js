const chalk = require('chalk')
const { checkDirectoryNotExist, getProjectName, getPromptResult, create } = require('./lib')
const { version } = require('../package.json')

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
        choices: [
          {
            name: 'vue.js',
          },
          {
            name: 'express.js',
          },
        ],
      },
    ])

    const { template } = await getPromptResult([
      framework === 'express.js'
        ? {
            name: 'template',
            message: 'select your Express.js starter template',
            type: 'list',
            choices: [
              {
                name: 'express-starter',
              },
            ],
          }
        : {
            name: 'template',
            message: 'select your Vue.js starter template',
            type: 'list',
            choices: [
              {
                name: 'vue3-ts-starter',
              },
              {
                name: 'vue3-starter',
              },
            ],
          },
    ])

    create(projName, template)
  } catch (err) {
    console.error(chalk.red(err.message))
  }
}

main()
