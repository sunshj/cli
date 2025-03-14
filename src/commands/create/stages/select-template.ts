import { select } from '@clack/prompts'
import { unique } from '#utils.js'
import type { CreationContext } from '..'
import { loadTemplates } from './load-templates'

export async function selectTemplate(ctx: CreationContext) {
  const templates = await loadTemplates(ctx)
  const categories = unique(templates.map(({ category }) => category))

  const category = await select({
    message: 'Select a category',
    options: categories.map(cate => ({ name: cate, value: cate }))
  })

  if (typeof category === 'symbol') return

  const filteredTemplates = templates.filter(t => t.category === category)

  const url = await select({
    message: 'Select a template',
    options: filteredTemplates.map(t => ({
      label: t.name,
      value: t.url
    }))
  })

  if (typeof url === 'symbol') return
  return url
}
