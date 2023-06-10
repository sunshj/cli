const fs = require('fs-extra')
const path = require('path')
const { promisify } = require('util')
const download = promisify(require('download-git-repo'))

/**
 * 判断目录是否已经存在
 * @param {any} dirName
 * @returns {any}
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
  try {
    await download(repoPath, dirName)
    await updatePackageName(dirName)
  } catch (err) {
    throw err
  }
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
 * 获取package.json中的版本号
 */
function getVersion() {
  try {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    return packageJson.version
  } catch (err) {
    throw err
  }
}

module.exports = { checkDirectoryNotExist, downloadGithubRepo, getVersion }
