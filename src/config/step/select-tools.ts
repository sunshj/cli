import inquirer from 'inquirer'
import { getPkgJSON } from '../../utils'

export async function selectTools() {
  return await inquirer.prompt<{ tools: string[] }>([
    {
      name: 'tools',
      message: 'Which tools do you want to use?',
      type: 'checkbox',
      choices: [
        {
          checked: true,
          name: 'ESLint',
          value: 'eslint'
        },
        {
          checked: true,
          name: 'Prettier',
          value: 'prettier'
        },
        {
          name: 'StyleLint',
          value: 'stylelint'
        },
        {
          name: 'lint-staged',
          value: 'lintStaged'
        },
        {
          name: 'CommitLint',
          value: 'commitlint'
        }
      ],
      async validate(input) {
        if (input.includes('commitlint') && !input.includes('lintStaged')) {
          const { pkgJSON } = await getPkgJSON(process.cwd())
          const deps = { ...pkgJSON.devDependencies, ...pkgJSON.dependencies }
          if (!deps['simple-git-hooks']) return 'lintStaged is required when using commitlint'
        }
        return true
      }
    }
  ])
}
