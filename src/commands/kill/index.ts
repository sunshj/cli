import process from 'node:process'
import { select, spinner } from '@clack/prompts'
import { defineCommand } from 'citty'
import consola from 'consola'
import { x } from 'tinyexec'

interface ProcessInfo {
  pid: string
  name: string
  port: string
}

async function findProcessesByPort(port: string): Promise<ProcessInfo[]> {
  const isWindows = process.platform === 'win32'
  const processes: ProcessInfo[] = []

  if (isWindows) {
    const { stdout } = await x('netstat', ['-ano'])
    const lines = stdout.split('\n').filter(line => line.includes(`:${port}`))

    const pids = new Set<string>()
    for (const line of lines) {
      const parts = line.trim().split(/\s+/)
      const pid = parts.at(-1)
      if (pid && /^\d+$/.test(pid) && pid !== '0') {
        pids.add(pid)
      }
    }

    for (const pid of pids) {
      try {
        const { stdout: taskInfo } = await x('tasklist', [
          '/FI',
          `PID eq ${pid}`,
          '/FO',
          'CSV',
          '/NH'
        ])
        const match = taskInfo.match(/"([^"]+)"/)
        const name = match ? match[1] : 'Unknown'
        processes.push({ pid, name, port })
      } catch {
        processes.push({ pid, name: 'Unknown', port })
      }
    }
  } else {
    try {
      const { stdout } = await x('lsof', ['-i', `:${port}`, '-P', '-n'])
      const lines = stdout.split('\n').slice(1).filter(Boolean)

      const seen = new Set<string>()
      for (const line of lines) {
        const parts = line.trim().split(/\s+/)
        const name = parts[0]
        const pid = parts[1]
        if (pid && !seen.has(pid)) {
          seen.add(pid)
          processes.push({ pid, name, port })
        }
      }
    } catch {
      // lsof not found or no processes
    }
  }

  return processes
}

async function killProcess(pid: string): Promise<boolean> {
  const isWindows = process.platform === 'win32'

  try {
    if (isWindows) {
      await x('taskkill', ['/F', '/PID', pid])
    } else {
      await x('kill', ['-9', pid])
    }
    return true
  } catch {
    return false
  }
}

export const killProcessCommand = defineCommand({
  meta: {
    name: 'kill',
    description: 'Kill a process by port number'
  },
  args: {
    port: {
      type: 'positional',
      required: true,
      description: 'Port number to search for'
    }
  },
  async setup({ args }) {
    const port = args.port as string

    if (!/^\d+$/.test(port)) {
      consola.error('Invalid port number')
      return
    }

    const searchSpinner = spinner()
    searchSpinner.start(`Searching for processes on port ${port}...`)

    const processes = await findProcessesByPort(port)

    if (processes.length === 0) {
      searchSpinner.stop(`No processes found on port ${port}`)
      return
    }

    searchSpinner.stop(`Found ${processes.length} process(es) on port ${port}`)

    const selected = await select({
      message: 'Select a process to kill',
      options: processes.map(p => ({
        value: p.pid,
        label: `${p.name} (PID: ${p.pid})`
      }))
    })

    if (typeof selected === 'symbol') {
      consola.info('Cancelled')
      return
    }

    const killSpinner = spinner()
    killSpinner.start(`Killing process ${selected}...`)

    const success = await killProcess(selected as string)

    if (success) {
      killSpinner.stop(`Process ${selected} has been killed`)
    } else {
      killSpinner.stop(`Failed to kill process ${selected}`)
      consola.error('You may need administrator/root privileges')
    }
  }
})
