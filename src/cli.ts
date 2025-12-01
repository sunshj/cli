import { defineCommand } from 'citty'
import consola from 'consola'
import { colors } from 'consola/utils'
import { getLatestVersion } from 'fast-npm-meta'
import { name as pkgName, version as pkgVersion } from '../package.json'
import { cloneProjectCommand } from './commands/clone'
import { configureProjectCommand } from './commands/config'
import { createProjectCommand } from './commands/create'
import { killProcessCommand } from './commands/kill'
import { compareVersions, loadLocalConfig } from './utils'

async function checkForUpdate() {
  const { version } = await getLatestVersion(`${pkgName}@latest`).catch(() => {
    consola.error('Failed to check for updates')
    return { version: null }
  })
  if (!version) return
  const comparison = compareVersions(version, pkgVersion)
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
    clone: cloneProjectCommand,
    kill: killProcessCommand
  },

  async run() {
    const config = await loadLocalConfig()
    if (config.checkForUpdate) checkForUpdate()
    consola.box(
      colors.bgBlue(`${config.cliName} v${pkgVersion}`),
      `\nCLI tool for simplifying project creation and configuration`
    )
  }
})
