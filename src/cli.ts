import { defineCommand } from 'citty'
import consola from 'consola'
import { colors } from 'consola/utils'
import { getLatestVersion } from 'fast-npm-meta'
import { compareVersions } from '#utils'
import { name as pkgName, version as pkgVersion } from '../package.json'
import { configureProjectCommand } from './commands/config'
import { createProjectCommand } from './commands/create'
import { getRepoCommand } from './commands/get'
import { newProjectCommand } from './commands/new'
import { CLI_NAME } from './constants'

async function checkForUpdate() {
  const { version } = await getLatestVersion(`${pkgName}@latest`, { force: true })
  const comparison = compareVersions(version!, pkgVersion)
  if (comparison === -1) {
    consola.warn(colors.yellow(`New version is available: v${version}`))
  }
}

export const main = defineCommand({
  meta: {
    name: CLI_NAME,
    description: 'CLI tool for simplifying project creation and configuration',
    version: pkgVersion
  },

  subCommands: {
    create: createProjectCommand,
    config: configureProjectCommand,
    new: newProjectCommand,
    get: getRepoCommand
  },

  run() {
    checkForUpdate()
    consola.box(
      colors.bgBlue(`${CLI_NAME}-cli v${pkgVersion}`),
      `\nCLI tool for simplifying project creation and configuration`
    )
  }
})
