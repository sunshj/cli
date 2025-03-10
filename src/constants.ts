export const CLI_NAME = 'sun'

export enum Frameworks {
  VueJS = 'Vue.js',
  NestJS = 'NestJS',
  Lib = 'lib'
}

export const repos = [
  {
    cate: Frameworks.VueJS,
    name: 'vue3 + ts',
    repo: 'sunshj/vue3-ts-starter'
  },
  {
    cate: Frameworks.VueJS,
    name: 'vue3 + ts + i18n',
    repo: 'sunshj/vue3-ts-starter#i18n'
  },
  {
    cate: Frameworks.NestJS,
    name: 'nest + prisma',
    repo: 'sunshj/nest-starter'
  },
  {
    cate: Frameworks.Lib,
    name: 'ts-lib',
    repo: 'sunshj/ts-starter'
  }
]

export const ALLOW_CONFIGS = ['eslint', 'prettier', 'stylelint', 'lintStaged', 'commitlint']
export const ALLOW_ARGS = [...ALLOW_CONFIGS, 'workspace', 'w']

export const INSTALL_CONFIGS = {
  eslint: ['eslint@9.10.0', '@sunshj/eslint-config@latest'],
  prettier: ['prettier', '@sunshj/prettier-config@latest'],
  stylelint: ['stylelint@16', '@sunshj/stylelint-config@latest'],
  lintStaged: ['lint-staged@15', 'simple-git-hooks'],
  commitlint: ['commitlint@18', 'cz-git', 'commitizen', '@commitlint/config-conventional@18']
}
