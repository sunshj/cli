import { defineCommand, runMain } from 'citty'
import { version as pkgVersion } from '../package.json'
import { CLI_NAME } from './constants'
import { configureProjectCommand } from './config'
import { createProjectCommand } from './create'
import { newProjectCommand } from './new'

const main = defineCommand({
  meta: {
    name: CLI_NAME,
    description: 'CLI to create some starter project',
    version: pkgVersion
  },

  subCommands: {
    create: createProjectCommand,
    config: configureProjectCommand,
    new: newProjectCommand
  }
})

runMain(main)
