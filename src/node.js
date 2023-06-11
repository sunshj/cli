const chalk = require('chalk')
const { checkDirectoryNotExist, getProjectName, getPromptResult, create } = require('./lib')
const { version } = require('../package.json')

async function main() {
  try {
    const projName = await getProjectName((program, callback) => {
      program.name('cnjs').description('CLI to create Node.js project').version(version, '-v, --version')
      program
        .command('create')
        .description('create a new nodejs-starter project')
        .argument('<project-name>', 'project name')
        .action(projectName => {
          callback(null, projectName)
        })

      program.parse()
    })
    // 判断目录是否已经存在，如果是则抛出异常
    await checkDirectoryNotExist(projName)
    const templateName = await getPromptResult([
      {
        name: 'template',
        message: 'select your Node.js starter template',
        type: 'list',
        choices: [
          {
            name: 'express',
          },
        ],
      },
    ]).then(({ template }) => template)
    create(projName, templateName)
  } catch (err) {
    console.error(chalk.red(err.message))
  }
}

main()
