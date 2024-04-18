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

export const allowConfigs = ['eslint', 'prettier', 'stylelint']
