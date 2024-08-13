import { defineCommand } from 'citty'
import consola from 'consola'
import { colors } from 'consola/utils'
import { version as pkgVersion } from '../package.json'
import { CLI_NAME } from './constants'
import { configureProjectCommand } from './commands/config'
import { createProjectCommand } from './commands/create'
import { newProjectCommand } from './commands/new'

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
    consola.box(
      colors.bgBlue(`${CLI_NAME}-cli v${pkgVersion}`),
      `\nCLI tool for simplifying project creation and configuration`
    )
    consola.info(colors.cyan('Please use one of the available subcommands: create, config, new'))
  }
})
