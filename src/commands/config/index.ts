import { defineCommand } from 'citty'
import consola from 'consola'
import { colors } from 'consola/utils'
import { configureProject, transformConfigurePkgs } from './stages/config-project'
import { configureGitAttributes } from './stages/git-attributes'
import { selectTools } from './stages/select-tools'

export const configureProjectCommand = defineCommand({
  meta: {
    name: 'config',
    description: 'Configure the project, add eslint/prettier/stylelint/lint-staged/commitlint etc.'
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
    },
    lintStaged: {
      type: 'boolean',
      description: 'add simple-git-hooks, lint-staged, pre-commit hook',
      default: false
    },
    commitlint: {
      type: 'boolean',
      description: 'add commitlint, commitizen, cz-git, commit-msg hook',
      default: false
    },
    workspace: {
      type: 'boolean',
      alias: 'w',
      description: 'is pnpm workspace project',
      default: false
    }
  },

  async run(ctx) {
    const { _, workspace, ...args } = ctx.args
    const configurePkgs = []
    const configurePkgsFromArgs = transformConfigurePkgs(args as Record<string, boolean>)

    if (configurePkgsFromArgs.length > 0) {
      configurePkgs.push(...configurePkgsFromArgs)
    } else {
      const { tools } = await selectTools()
      configurePkgs.push(...tools)
      if (configurePkgs.length === 0) {
        consola.error('No packages selected. Exiting...')
        return
      }
    }

    consola.success('Selected tools:', colors.blueBright(configurePkgs.join(', ')))
    consola.info('Using workspace:', colors.blueBright(workspace.toString()))

    await configureGitAttributes()

    for (const pkg of configurePkgs) {
      await configureProject(pkg, configurePkgs, workspace)
    }
  }
})
