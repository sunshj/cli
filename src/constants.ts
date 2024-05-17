export const CLI_NAME = 'sun'

export enum Frameworks {
  VueJS = 'vue.js',
  ExpressJS = 'express.js',
  NestJS = 'nest.js'
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
  }
]

export const ALLOW_CONFIGS = ['eslint', 'prettier', 'stylelint', 'lintStaged', 'commitlint']
export const ALLOW_ARGS = [...ALLOW_CONFIGS, 'workspace', 'w']

export const CONFIG_INSTALL_MAP = new Map(
  Object.entries({
    eslint: ['eslint@8', '@sunshj/eslint-config'],
    prettier: ['prettier', '@sunshj/prettier-config'],
    stylelint: ['stylelint@16', '@sunshj/stylelint-config'],
    lintStaged: ['lint-staged@15', 'husky@8'],
    commitlint: ['commitlint@18', 'cz-git', 'commitizen', '@sunshj/commitlint-config']
  })
)
