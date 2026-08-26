import { execSync } from 'node:child_process'

export function readGitSha6() {
  const env = process.env.LOCKWRIGHT_GIT_SHA
  if (typeof env === 'string' && env.trim()) {
    const hex = env.trim().toLowerCase().replace(/[^0-9a-f]/g, '')
    return hex.length >= 6 ? hex.slice(0, 6) : 'unknown'
  }

  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' })
      .trim()
      .slice(0, 6)
      .toLowerCase()
  } catch {
    return 'unknown'
  }
}
