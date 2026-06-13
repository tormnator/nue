import { mkdir, rmdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

import { getFile } from '../../src/cmd/preview'

const testDir = './test_dir_preview'

async function write(path, content='') {
  const fullpath = join(testDir, path)
  await mkdir(dirname(fullpath), { recursive: true })
  await writeFile(fullpath, content)
}

const shell = '<!doctype html><body nue="default-app"></body>'

describe('preview', () => {
  afterEach(async () => await rmdir(testDir, { recursive: true, force: true }))

  test('serves built files', async () => {
    await write('index.html', 'home')
    const file = await getFile(testDir, '/')
    expect(await file.text()).toBe('home')
  })

  test('serves root SPA fallback for extensionless routes', async () => {
    await write('index.html', shell)
    const file = await getFile(testDir, '/dashboard')
    expect(await file.text()).toBe(shell)
  })

  test('serves nested SPA fallback before root fallback', async () => {
    await write('index.html', shell)
    await write('admin/index.html', '<!doctype html><body nue="admin-app"></body>')
    const file = await getFile(testDir, '/admin/users')
    expect(await file.text()).toInclude('admin-app')
  })

  test('does not use normal index.html as SPA fallback', async () => {
    await write('index.html', 'home')
    const file = await getFile(testDir, '/dashboard')
    expect(file).toBeUndefined()
  })

  test('does not use SPA fallback for file paths', async () => {
    await write('index.html', shell)
    const file = await getFile(testDir, '/missing.txt')
    expect(file).toBeUndefined()
  })
})