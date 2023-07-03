const fs = require('fs-extra')
const path = require('path')
const ora = require('ora')
const chalk = require('chalk')
const { Command } = require('commander')
const inquirer = require('inquirer')
const { promisify } = require('util')
const download = promisify(require('download-git-repo'))
const { repos } = require('./constant')

/**
 * 判断目录是否已经存在
 * @param {string} dirName
 */
function checkDirectoryNotExist(dirName) {
  return new Promise((resolve, reject) => {
    fs.access(dirName, err => {
      if (err && err.code === 'ENOENT') {
        resolve()
      } else {
        reject(new Error(`Directory '${dirName}' already exists!`))
      }
    })
  })
}

/**
 * 下载github仓库模板
 * @param {string} repoPath 仓库地址（user/repo）
 * @param {string} dirName 存放目录名
 */
async function downloadGithubRepo(repoPath, dirName) {
  await download(repoPath, dirName)
  await updatePackageName(dirName)
}

/**
 * 修改package.json中的name字段
 * @param {string} projName 项目名
 */
async function updatePackageName(projName) {
  try {
    const packageJsonPath = path.resolve(process.cwd(), projName, 'package.json')
    const packageJsonString = await fs.readFile(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(packageJsonString)
    packageJson.name = projName
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
  } catch (err) {
    throw new Error(`Failed to update 'name' field in package.json`)
  }
}

/**
 * 获取项目名
 * @param {(program: Command, callback:(err:any,data:any)=>void) => Promise<string>} fn
 * @returns {Promise<string>}
 */
function getProjectName(fn) {
  const program = new Command()
  return new Promise(resolve => {
    fn(program, (err, data) => {
      if (err) throw err
      resolve(data)
    })
  })
}

/**
 * 获取输入结果
 * @param {inquirer.QuestionCollection<inquirer.Answers>} prompt
 * @returns {Promise<any>}
 */
function getPromptResult(prompt) {
  return inquirer.prompt(prompt)
}

/**
 * 创建目录，下载模板至目录
 * @param {string} projName 项目名
 * @param {string} templateName 模板名
 */
async function create(projName, templateName) {
  const repoPath = new Map(repos).get(templateName)
  await fs.mkdirp(path.join(process.cwd(), projName))
  const spinner = ora('Downloading repository...').start()

  downloadGithubRepo(repoPath, projName)
    .then(() => {
      spinner.succeed('Repository downloaded successfully!')
      console.log(
        chalk.yellow(`Now run the following commands:
    cd ${projName} 
    npm install`)
      )
    })
    .catch(err => spinner.fail('Failed to download repository: ' + err.message.trim()))
    .finally(() => spinner.stop())
}

function filterRepoByFramework(framework) {
  return repos
    .filter(([key]) => key.includes(framework.slice(0, framework.lastIndexOf('.'))))
    .map(([key]) => ({ name: key }))
}

module.exports = { checkDirectoryNotExist, getProjectName, getPromptResult, create, filterRepoByFramework }
