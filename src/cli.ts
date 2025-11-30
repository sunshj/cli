import { defineCommand } from 'citty'
import consola from 'consola'
import { colors } from 'consola/utils'
import { getLatestVersion } from 'fast-npm-meta'
import { name as pkgName, version as pkgVersion } from '../package.json'
import { cloneProjectCommand } from './commands/clone'
import { configureProjectCommand } from './commands/config'
import { createProjectCommand } from './commands/create'
import config from './config'
import { compareVersions } from './utils'

async function checkForUpdate() {
  const { version } = await getLatestVersion(`${pkgName}@latest`)
  const comparison = compareVersions(version!, pkgVersion)
  if (comparison === 1) {
    consola.warn(colors.yellow(`New version is available: v${version}`))
  }
}

export const main = defineCommand({
  meta: {
    name: 'sun',
    description: 'CLI tool for simplifying project creation and configuration',
    version: pkgVersion
  },

  subCommands: {
    create: createProjectCommand,
    config: configureProjectCommand,
    clone: cloneProjectCommand
  },

  run() {
    if (config.checkForUpdate) checkForUpdate()
    consola.box(
      colors.bgBlue(`${config.cliName} v${pkgVersion}`),
      `\nCLI tool for simplifying project creation and configuration`
    )
  }
})
