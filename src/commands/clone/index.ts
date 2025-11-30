import process from 'node:process'
import { defineCommand } from 'citty'
import { downloadTemplate } from 'giget'

export const cloneProjectCommand = defineCommand({
  meta: {
    name: 'clone',
    description: 'clone a project from a github repository'
  },
  args: {
    repo: {
      type: 'positional',
      required: true
    },
    projectName: {
      type: 'positional',
      required: false
    }
  },
  setup({ args }) {
    downloadTemplate(args.repo, {
      cwd: process.cwd(),
      dir: args.projectName
    })
  }
})
