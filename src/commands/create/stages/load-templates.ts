import { homedir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { ensureReadFile } from '#utils.js'
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
  consola.info('读取远程模版配置', ctx.remoteFile)
  const rawContent = await ofetch(ctx.remoteFile, { responseType: 'text' })
  const json = JSONC.parse(rawContent)
  const { error, data } = z.lazy(() => schema).safeParse(json)
  if (error) {
    consola.error('远程模版配置格式不正确')
    process.exit(1)
  }
  return data
}

async function loadLocalTemplates(ctx: CreationContext) {
  const localFilePath = path.join(homedir(), ctx.localFile)
  consola.info('读取本地模版配置', localFilePath)
  const rawContent = await ensureReadFile(localFilePath, '{}')
  const json = JSONC.parse(rawContent)
  const { error, data } = z.lazy(() => schema).safeParse(json)
  if (error) {
    consola.error('本地模版配置格式不正确')
    process.exit(1)
  }
  return data
}

export async function loadTemplates(ctx: CreationContext) {
  if (ctx.remoteFile) return await loadRemoteTemplates(ctx)
  return await loadLocalTemplates(ctx)
}
