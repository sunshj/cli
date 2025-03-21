import { text } from '@clack/prompts'
export async function enterProjectName(name?: string) {
  return (await text({
    message: 'Enter project name',
    initialValue: name || 'my-project',
    validate: value => {
      if (!value.trim()) return new Error('Project name cannot be empty')
      if (value.includes(' ')) return new Error('Project name cannot contain spaces')
    }
  })) as string
}
