import consola from 'consola'
import fs from 'fs/promises'
import path from 'path'
import { Frameworks, repos } from './constants'
import inquirer from 'inquirer'
import { spawn } from 'child_process'
import ora from 'ora'

export const spinner = ora('[Downloading template]: ')

export async function checkDirectoryExists(directoryPath: string) {
  try {
    await fs.access(directoryPath, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

export async function updatePkgName(projName: string) {
  try {
    const pkgJsonPath = path.resolve(process.cwd(), projName, 'package.json')
    const pkgJsonStr = await fs.readFile(pkgJsonPath, 'utf-8')
    const pkgJson = JSON.parse(pkgJsonStr)
    pkgJson.name = projName
    await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 2))
  } catch (error: any) {
    consola.error(`Failed to update 'name' field in package.json: ${error.message}`)
  }
}

export async function selectFramework() {
  return await inquirer.prompt<{ framework: string }>([
    {
      name: 'framework',
      message: 'Which framework do you want to use?',
      type: 'list',
      choices: Object.values(Frameworks).map(name => ({ name }))
    }
  ])
}

export async function selectTemplate(framework: string) {
  return await inquirer.prompt<{ template: string }>([
    {
      name: 'template',
      message: `Which ${framework} template do you want to use?`,
      type: 'list',
      choices: repos
        .filter(({ name }) => name.includes(framework.slice(0, framework.lastIndexOf('.'))))
        .map(({ name }) => ({ name }))
    }
  ])
}

export function downloadGithubRepo(repoName: string, dir: string) {
  const gitClone = spawn('git', ['clone', `https://github.com/${repoName}.git`, dir], {
    stdio: 'inherit'
  })

  return new Promise((resolve, reject) => {
    gitClone.on('close', code => {
      if (code === 0) {
        resolve(true)
      }
    })

    gitClone.on('error', err => {
      reject(new Error(`Oops: ${err.message}`))
    })

    gitClone.on('exit', code => {
      if (code !== 0) {
        reject(new Error(`git clone exited with code ${code}`))
      }
    })

    process.on('SIGINT', () => {
      gitClone.kill()
      reject(new Error('Interrupted'))
    })

    process.on('SIGTERM', () => {
      reject(new Error('Terminated'))
    })

    process.on('exit', () => {
      gitClone.kill()
      spinner.stop()
      reject(new Error('Exited'))
    })
  })
}
