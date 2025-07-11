import { homedir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { ensureReadFile, extractZodError } from '#utils'
import consola from 'consola'
import JSONC from 'jsonc-parser'
import { ofetch } from 'ofetch'
import { z } from 'zod'
import type { CreationContext } from '..'

const schema = z.object({
  templates: z
    .array(
      z.object({
        name: z.string().describe('模板名称'),
        url: z.string().describe('模板地址'),
        category: z.string().describe('模板分类'),
        description: z.string().describe('模板描述')
      })
    )
    .describe('模板列表')
})

async function loadRemoteConfig(ctx: CreationContext) {
  consola.info('读取远程配置', ctx.remoteConfigFile)
  const rawContent = await ofetch(ctx.remoteConfigFile, { responseType: 'text' })
  const json = JSONC.parse(rawContent)
  const { error, data } = z.lazy(() => schema).safeParse(json)
  if (error) {
    consola.error('远程配置格式不正确：', extractZodError(error))
    process.exit(1)
  }
  return data
}

async function loadLocalConfig(ctx: CreationContext) {
  const localFilePath = path.join(homedir(), ctx.localConfigFile)
  consola.info('读取本地配置', localFilePath)
  const rawContent = await ensureReadFile(localFilePath, '{}')
  const json = JSONC.parse(rawContent)
  const { error, data } = z.lazy(() => schema).safeParse(json)
  if (error) {
    consola.error('本地配置格式不正确：', extractZodError(error))
    process.exit(1)
  }
  return data
}

export async function loadConfig(ctx: CreationContext) {
  if (ctx.remoteConfigFile) return await loadRemoteConfig(ctx)
  return await loadLocalConfig(ctx)
}
