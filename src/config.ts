export default {
  cliName: 'sun-cli',
  checkForUpdate: true,
  localConfigFile: '.sunrc',

  installPkgs: {
    eslint: ['eslint@9.10.0', '@sunshj/eslint-config@latest'],
    prettier: ['prettier', '@sunshj/prettier-config@latest'],
    stylelint: ['stylelint@16', '@sunshj/stylelint-config@latest'],
    lintStaged: ['lint-staged@15', 'simple-git-hooks'],
    commitlint: ['commitlint@18', '@commitlint/config-conventional@18']
  },

  gitAttributes: '* text=auto eol=lf',
  eslint: {
    configCode: `import { defineConfig } from '@sunshj/eslint-config'

export default defineConfig({})
`,
    languages: [
      'javascript',
      'javascriptreact',
      'typescript',
      'typescriptreact',
      'vue',
      'html',
      'markdown',
      'json',
      'jsonc',
      'yaml'
    ],
    scripts: {
      lint: 'eslint . --cache',
      'lint:fix': 'eslint . --fix --cache'
    }
  },

  prettier: {
    extendConfig: '@sunshj/prettier-config',
    languages: [
      'html',
      'css',
      'javascript',
      'typescript',
      'json',
      'jsonc',
      'vue',
      'javascriptreact',
      'typescriptreact'
    ],
    scripts: {
      format: 'prettier . --write'
    }
  },

  stylelint: {
    extendConfig: '@sunshj/stylelint-config',
    scripts: {
      stylelint: 'stylelint --fix "src/**/*.{vue,css,scss}" --cache'
    }
  },

  lintStaged: {
    eslintTask: { '*.{vue,js,ts,jsx,tsx,json,md,yaml}': ['eslint --fix'] },
    prettierTask: { '*.{vue,js,ts,jsx,tsx,json,md,yaml}': ['prettier --write'] },
    stylelintTask: { '*.{vue,css,scss}': ['stylelint --fix'] },
    gitHooks: {
      'pre-commit': 'npx lint-staged'
    }
  },

  commitlint: {
    configCode: `%export% {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-leading-space': [2, 'always'],
    'subject-full-stop': [0, 'never']
  },
  plugins: [
    {
      rules: {
        'subject-leading-space': ({ header }) => {
          return [header.includes(': '), 'The subject prefix must contain spaces, such as "feat: "']
        }
      }
    }
  ]
}
`,
    gitHooks: {
      'commit-msg': 'npx --no-install commitlint --config commitlint.config.js --edit $1'
    }
  }
}
