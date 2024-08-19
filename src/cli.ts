import { defineCommand } from 'citty'
import consola from 'consola'
import { colors } from 'consola/utils'
import { execShellSync } from '#utils'
import { name as pkgName, version as pkgVersion } from '../package.json'
import { configureProjectCommand } from './commands/config'
import { createProjectCommand } from './commands/create'
import { newProjectCommand } from './commands/new'
import { CLI_NAME } from './constants'

export const main = defineCommand({
  meta: {
    name: CLI_NAME,
    description: 'CLI tool for simplifying project creation and configuration',
    version: pkgVersion
  },

  subCommands: {
    create: createProjectCommand,
    config: configureProjectCommand,
    new: newProjectCommand
  },

  run() {
    const latestVersion = execShellSync(`npm show ${pkgName} version`)
    if (latestVersion !== pkgVersion) {
      consola.warn(colors.yellow(`New version is available: v${latestVersion}`))
    }
    consola.box(
      colors.bgBlue(`${CLI_NAME}-cli v${pkgVersion}`),
      `\nCLI tool for simplifying project creation and configuration`
    )
  }
})
