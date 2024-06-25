import type { ModuleType } from '.'

export function getTemplateName(type: ModuleType, typescript: boolean) {
  if (typescript) return 'basic-ts'
  if (type === 'module') return 'basic-esm'
  return 'basic-cjs'
}
