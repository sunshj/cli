import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { confirm } from '@clack/prompts'
import config from '#config.js'
import { loadPackageJson, patchUpdate } from '#utils.js'
import consola from 'consola'
import { x } from 'tinyexec'
import type { ConfigureContext } from '..'

export async function configureCommitlint(ctx: ConfigureContext) {
  if (!ctx.selectedPkgs.includes('commitlint')) return

  // add config  to package.json
  const [pkgJSON, savePkgJSON] = await loadPackageJson(ctx.cwd)
  patchUpdate(pkgJSON, 'simple-git-hooks', config.commitlint.gitHooks)
  await savePkgJSON()

  // add commitlint config file
  const configFile = 'commitlint.config.js'
  const configFilePath = path.join(ctx.cwd, configFile)

  if (
    !existsSync(configFilePath) ||
    (await confirm({ message: `${configFile} exists. Overwrite?`, initialValue: false }))
  ) {
    const code = config.commitlint.configCode.replace(
      /^%export%/,
      ctx.moduleType === 'module' ? 'export default' : 'module.exports ='
    )

    await writeFile(configFilePath, code, 'utf-8')
    consola.success(`Created ${configFile}`)
  }

  await x('npx', ['simple-git-hooks'])
  consola.success('commitlint installed')
}
