export const CLI_NAME = 'sun'

export enum Frameworks {
  VueJS = 'vue.js',
  ExpressJS = 'express.js',
  NestJS = 'nest.js',
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
    name: 'vue3 + ts + uni-app',
    repo: 'sunshj/uniapp-ts-starter'
  },
  {
    cate: Frameworks.ExpressJS,
    name: 'express + prisma',
    repo: 'sunshj/express-starter'
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
  commitlint: ['commitlint@18', 'cz-git', 'commitizen', '@sunshj/commitlint-config@latest']
}
