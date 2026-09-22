import { spawn } from 'node:child_process'

const url = process.env.JENKINS_URL
const user = process.env.JENKINS_USER
const token = process.env.JENKINS_TOKEN

if (!url || !user || !token) {
  console.error(
    'jenkins MCP: JENKINS_URL, JENKINS_USER, and JENKINS_TOKEN must be set',
  )
  process.exit(1)
}

const mcpUrl = `${url.replace(/\/$/, '')}/mcp-server/mcp`
const auth = Buffer.from(`${user}:${token}`, 'utf8').toString('base64')

// mcp-remote refuses plain http for non-localhost hosts unless opted in.
const allowHttp = mcpUrl.startsWith('http://') ? ['--allow-http'] : []

const child = spawn(
  'npx',
  [
    '-y',
    'mcp-remote',
    mcpUrl,
    ...allowHttp,
    '--header',
    `Authorization: Basic ${auth}`,
  ],
  { stdio: 'inherit', env: process.env },
)

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 1)
})
