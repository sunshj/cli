import { defineCommand } from 'citty'
import consola from 'consola'
import { colors } from 'consola/utils'
import {
  handleConfigurePackage,
  selectESLint,
  selectPackageManagement,
  selectPrettier,
  selectStyleLint,
  transformConfigurePkgs
} from './util'

export const configureProjectCommand = defineCommand({
  meta: {
    name: 'config',
    description: 'Configure the project, add eslint/prettier/stylelint'
  },
  args: {
    eslint: {
      type: 'boolean',
      description: 'add eslint, @sunshj/eslint-config',
      default: false
    },
    prettier: {
      type: 'boolean',
      description: 'add prettier, @sunshj/prettier-config',
      default: false
    },
    stylelint: {
      type: 'boolean',
      description: 'add stylelint, @sunshj/stylelint-config, works with vue3',
      default: false
    }
  },

  async run(ctx) {
    const { _, ...args } = ctx.args
    const configurePkgs = []
    const configurePkgsFromArgs = transformConfigurePkgs(args as Record<string, boolean>)

    if (configurePkgsFromArgs.length > 0) {
      configurePkgs.push(...configurePkgsFromArgs)
    } else {
      const { eslint } = await selectESLint()
      const { prettier } = await selectPrettier()
      const { stylelint } = await selectStyleLint()

      configurePkgs.push(...transformConfigurePkgs({ eslint, prettier, stylelint }))
      if (configurePkgs.length === 0) {
        consola.error('No packages selected. Exiting...')
        return
      }
    }

    consola.success('Selected configs:', colors.blueBright(configurePkgs.join(', ')))
    const { packageManagement } = await selectPackageManagement()

    for (const pkg of configurePkgs) {
      await handleConfigurePackage(pkg, packageManagement)
    }
  }
})
