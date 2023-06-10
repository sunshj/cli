const { Command } = require('commander')
const Inquirer = require('inquirer')
const chalk = require('chalk')
const path = require('path')
const fs = require('fs-extra')
const ora = require('ora')
const { checkDirectoryNotExist, downloadGithubRepo, getVersion } = require('./lib')

const repos = new Map([
  ['typescript', 'sunshj/vue3-ts-starter'],
  ['javascript', 'sunshj/vue3-starter'],
])

/**
 *  获取项目名
 * @returns {any}
 */
function getProjectName() {
  return new Promise(resolve => {
    const program = new Command()
    program.name('vue3').description('CLI to create vue project').version(getVersion())
    program
      .command('create')
      .description('create a new vue3-starter project')
      .argument('<project-name>', 'project name')
      .action((projectName, cmd) => {
        resolve(projectName)
      })

    program.parse()
  })
}

/**
 *  获取模板名
 * @returns {any}
 */
function getTemplateName() {
  return new Inquirer.prompt([
    {
      name: 'template',
      message: 'select your vue3 starter template',
      type: 'list',
      choices: [
        {
          name: 'typescript',
        },
        {
          name: 'javascript',
        },
      ],
    },
  ]).then(({ template }) => template)
}

/**
 * 创建目录，下载模板至目录
 * @param {any} projName 项目名
 * @param {any} templateName 模板名
 * @returns {any}
 */
async function create(projName, templateName) {
  try {
    const repoPath = repos.get(templateName)
    await fs.mkdirp(path.join(process.cwd(), projName))
    const spinner = ora('Downloading repository...').start()

    downloadGithubRepo(repoPath, projName)
      .then(() => {
        spinner.succeed('Repository downloaded successfully!')
        console.log(
          chalk.yellow(`Now run the following commands:
    cd ${projName} 
    npm install
    npm run dev`)
        )
      })
      .catch(err => spinner.fail('Failed to download repository: ' + err.message.trim()))
      .finally(() => spinner.stop())
  } catch (err) {
    throw err
  }
}

async function main() {
  try {
    const projName = await getProjectName()
    // 判断目录是否已经存在，如果是则抛出异常
    await checkDirectoryNotExist(projName)
    const templateName = await getTemplateName()
    create(projName, templateName)
  } catch (err) {
    console.error(chalk.red(err.message))
  }
}

main()
