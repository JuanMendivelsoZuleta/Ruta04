import { execSync } from 'node:child_process'

export default function globalTeardown(): void {
  execSync('npm --prefix server run e2e:cleanup', { stdio: 'inherit' })
}
