import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const distDir = join(root, 'dist')
const publishDir = join(root, '.gh-pages-publish')

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    encoding: 'utf8',
    ...options,
  })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

const authorName = spawnSync('git', ['log', '-1', '--format=%an'], {
  encoding: 'utf8',
}).stdout.trim()
const authorEmail = spawnSync('git', ['log', '-1', '--format=%ae'], {
  encoding: 'utf8',
}).stdout.trim()

rmSync(publishDir, { recursive: true, force: true })
mkdirSync(publishDir, { recursive: true })
cpSync(distDir, publishDir, { recursive: true })
writeFileSync(join(publishDir, '.nojekyll'), '')

run('git', ['init'], { cwd: publishDir })
run('git', ['checkout', '-b', 'gh-pages'], { cwd: publishDir })
run('git', ['add', '.'], { cwd: publishDir })
run(
  'git',
  [
    '-c',
    `user.name=${authorName}`,
    '-c',
    `user.email=${authorEmail}`,
    'commit',
    '-m',
    'Deploy site para GitHub Pages',
  ],
  { cwd: publishDir },
)
run('git', ['remote', 'add', 'origin', 'https://github.com/Sweet-Pillow/organiza-time.git'], {
  cwd: publishDir,
})
run('git', ['push', '-f', 'origin', 'gh-pages'], { cwd: publishDir })

rmSync(publishDir, { recursive: true, force: true })

console.log('Branch gh-pages publicada.')
console.log('Site: https://sweet-pillow.github.io/organiza-time/')
