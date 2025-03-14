import { homedir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { select } from '@clack/prompts'
import { ensureReadFile, unique } from '#utils.js'
import consola from 'consola'
import JSONC from 'jsonc-parser'
import { ofetch } from 'ofetch'
import { z } from 'zod'
import type { CreationContext } from '..'

const schema = z.array(
  z.object({
    name: z.string().describe('模板名称'),
    url: z.string().describe('模板地址'),
    category: z.string().describe('模板分类'),
    description: z.string().describe('模板描述')
  })
)

async function loadRemoteTemplates(ctx: CreationContext) {
  const json = await ofetch(ctx.remoteFile)
  const { error, data } = z.lazy(() => schema).safeParse(json)
  if (error) {
    consola.error('远程模版配置格式不正确')
    consola.info(ctx.remoteFile)
    process.exit(1)
  }
  return data
}

async function loadLocalTemplates(ctx: CreationContext) {
  const rawContent = await ensureReadFile(path.join(homedir(), ctx.localFile), '{}')
  const json = JSONC.parse(rawContent)
  const { error, data } = z.lazy(() => schema).safeParse(json)
  if (error) {
    consola.error('本地模版配置格式不正确')
    consola.info(path.join(homedir(), ctx.localFile))
    process.exit(1)
  }
  return data
}

async function loadTemplates(ctx: CreationContext) {
  if (ctx.remoteFile) return await loadRemoteTemplates(ctx)
  return await loadLocalTemplates(ctx)
}

export async function selectTemplate(ctx: CreationContext) {
  const templates = await loadTemplates(ctx)
  const categories = unique(templates.map(({ category }) => category))

  const category = await select({
    message: 'Select a category',
    options: categories.map(cate => ({ name: cate, value: cate }))
  })

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
