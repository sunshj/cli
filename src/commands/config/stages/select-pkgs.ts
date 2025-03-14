import process from 'node:process'
import { multiselect } from '@clack/prompts'
import config from '#config'

function getDescription(pkg: keyof typeof config.installPkgs) {
  const pkgInfo = config.installPkgs[pkg]
  return `will install ${pkgInfo.join(', ')}`
}

export async function selectPkgs() {
  const pkgs = await multiselect({
    message: 'Select packages to install',
    options: [
      {
        value: 'eslint',
        label: 'ESLint',
        hint: getDescription('eslint')
      },
      {
        value: 'prettier',
        label: 'Prettier',
        hint: getDescription('prettier')
      },
      { value: 'stylelint', label: 'Stylelint', hint: getDescription('stylelint') },
      {
        value: 'lintStaged',
        label: 'Lint Staged',
        hint: getDescription('lintStaged')
      },
      { value: 'commitlint', label: 'Commitlint', hint: getDescription('commitlint') }
    ],
    initialValues: ['eslint', 'prettier']
  }).catch(() => {
    process.exit(1)
  })

  return pkgs as string[]
}
