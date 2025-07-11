import process from 'node:process'
import { loadPackageJson } from '#utils'
import { defineCommand } from 'citty'
import { detectPackageManager } from 'nypm'
import { configureGitFiles } from './stages/git-files'
import { installPkgs } from './stages/install-pkgs'
import { selectPkgs } from './stages/select-pkgs'

export interface ConfigureContext {
  selectedPkgs: string[]
  workspace: boolean
  cwd: string
  pm: string
  moduleType: 'module' | 'commonjs'
}

export const configureProjectCommand = defineCommand({
  meta: {
    name: 'config',
    description:
      'set up project configuration, add eslint, prettier, stylelint, lint-staged, commitlint'
  },
  args: {
    workspace: {
      type: 'boolean',
      alias: 'w',
      description: 'is this a pnpm workspace project?',
      default: false
    }
  },
  async run({ args }) {
    const { workspace } = args
    const selectedPkgs = await selectPkgs()
    const cwd = process.cwd()
    const pm = await detectPackageManager(cwd)
    const [pkgJSON] = await loadPackageJson(cwd)

    const ctx: ConfigureContext = {
      selectedPkgs,
      workspace,
      cwd,
      pm: pm?.name ?? 'npm',
      moduleType: pkgJSON.type || 'commonjs'
    }

    await configureGitFiles(ctx)
    await installPkgs(ctx)
  }
})
