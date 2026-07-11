import { test, expect } from 'bun:test'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import {
  createDeduplicator,
  isEditorBackup,
  fswatch,
} from '../src/tools/fswatch.js'
import { createSiteConf } from '../src/conf.js'

// Helper function to wait for expected array length
async function waitForEvents(array, expectedCount, maxWait = 1000) {
  const start = Date.now()
  while (new Set(array).size < expectedCount && Date.now() - start < maxWait) {
    await new Promise(resolve => setTimeout(resolve, 5))
  }
}

async function waitForPath(array, path, maxWait = 1000) {
  const start = Date.now()
  while (!array.includes(path) && Date.now() - start < maxWait) {
    await new Promise(resolve => setTimeout(resolve, 5))
  }
  await new Promise(resolve => setTimeout(resolve, 50))
}

test('identify backup files', () => {
  expect(isEditorBackup('file.txt~')).toBe(true)
  expect(isEditorBackup('script.js~')).toBe(true)
  expect(isEditorBackup('file.txt_123456.bck')).toBe(true)
  expect(isEditorBackup('regular.css')).toBe(false)
})

test.skip('deduplicator blocks rapid events', async () => {
  const shouldProcess = createDeduplicator()

  expect(shouldProcess()).toBe(true)
  expect(shouldProcess()).toBe(false)

  // Wait longer than debounce period
  await new Promise(resolve => setTimeout(resolve, 60))
  expect(shouldProcess()).toBe(true)
})

test('watches single file changes', async () => {
  const tmpDir = await fs.mkdtemp(join(tmpdir(), 'fswatch-test-'))
  const testFile = join(tmpDir, 'test.txt')

  const changes = []
  const watcher = fswatch(tmpDir)
  watcher.onupdate = async path => changes.push(path)

  // Create a file
  await fs.writeFile(testFile, 'hello')

  // Wait for event
  await waitForEvents(changes, 1)

  expect(changes).toContain('test.txt')

  watcher.close()
  await fs.rm(tmpDir, { recursive: true })
})

test('watches directory creation and processes files', async () => {
  const tmpDir = await fs.mkdtemp(join(tmpdir(), 'fswatch-test-'))
  const newDir = join(tmpDir, 'newdir')

  const changes = []
  const watcher = fswatch(tmpDir)
  watcher.onupdate = async path => changes.push(path)

  // Create directory with files
  await fs.mkdir(newDir)
  await fs.writeFile(join(newDir, 'file1.txt'), 'content1')
  await fs.writeFile(join(newDir, 'file2.js'), 'content2')

  // Wait for events
  await waitForEvents(changes, 2)

  const uniqueChanges = [...new Set(changes)]
  expect(uniqueChanges).toContain('newdir/file1.txt')
  expect(uniqueChanges).toContain('newdir/file2.js')

  watcher.close()
  await fs.rm(tmpDir, { recursive: true })
})

test('does not report dotted directories as files', async () => {
  const tmpDir = await fs.mkdtemp(join(tmpdir(), 'fswatch-test-'))
  const stagedRoot = await fs.mkdtemp(join(tmpdir(), 'fswatch-staged-'))
  const stagedDir = join(stagedRoot, '2.0-beta')
  await fs.mkdir(join(tmpDir, 'docs'))
  await fs.mkdir(stagedDir)
  await fs.writeFile(join(stagedDir, 'index.md'), '# Docs')

  const changes = []
  const watcher = fswatch(tmpDir)
  watcher.onupdate = async path => changes.push(path)

  await fs.rename(stagedDir, join(tmpDir, 'docs', '2.0-beta'))
  await fs.writeFile(join(tmpDir, 'control.txt'), 'content')
  await waitForPath(changes, 'control.txt')

  expect(changes).toContain('docs/2.0-beta/index.md')
  expect(changes).not.toContain('docs/2.0-beta')

  watcher.close()
  await fs.rm(tmpDir, { recursive: true })
  await fs.rm(stagedRoot, { recursive: true })
})

test('preserves ignore patterns while processing new directories', async () => {
  const tmpDir = await fs.mkdtemp(join(tmpdir(), 'fswatch-test-'))
  const stagedRoot = await fs.mkdtemp(join(tmpdir(), 'fswatch-staged-'))
  const stagedDir = join(stagedRoot, 'bundle')
  await fs.mkdir(stagedDir)
  await fs.writeFile(join(stagedDir, 'app.js'), 'export default true')
  await fs.writeFile(join(stagedDir, 'ignored.log'), 'ignore me')

  const changes = []
  const watcher = fswatch(tmpDir, { ignore: ['ignored.log'] })
  watcher.onupdate = async path => changes.push(path)

  await fs.rename(stagedDir, join(tmpDir, 'bundle'))
  await fs.writeFile(join(tmpDir, 'control.txt'), 'content')
  await waitForPath(changes, 'control.txt')

  expect(changes).toContain('bundle/app.js')
  expect(changes).not.toContain('bundle/ignored.log')

  watcher.close()
  await fs.rm(tmpDir, { recursive: true })
  await fs.rm(stagedRoot, { recursive: true })
})

test('ignores .dist using default site configuration', async () => {
  const tmpDir = await fs.mkdtemp(join(tmpdir(), 'fswatch-test-'))
  const stagedRoot = await fs.mkdtemp(join(tmpdir(), 'fswatch-staged-'))
  const stagedDir = join(stagedRoot, '.dist')
  await fs.mkdir(stagedDir)
  await fs.writeFile(join(stagedDir, 'generated.css'), 'body {}')

  const changes = []
  const { ignore } = createSiteConf({}, { root: tmpDir })
  const watcher = fswatch(tmpDir, { ignore })
  watcher.onupdate = async path => changes.push(path)

  await fs.rename(stagedDir, join(tmpDir, '.dist'))
  await fs.writeFile(join(tmpDir, 'control.txt'), 'content')
  await waitForPath(changes, 'control.txt')

  expect(changes).toContain('control.txt')
  expect(changes.some(path => path.includes('.dist'))).toBe(false)

  watcher.close()
  await fs.rm(tmpDir, { recursive: true })
  await fs.rm(stagedRoot, { recursive: true })
})

test('ignores files matching patterns', async () => {
  const tmpDir = await fs.mkdtemp(join(tmpdir(), 'fswatch-test-'))

  const changes = []
  const watcher = fswatch(tmpDir, { ignore: ['*.log', '.hidden*'] })
  watcher.onupdate = async path => changes.push(path)

  // Create files
  await fs.writeFile(join(tmpDir, 'good.txt'), 'content')
  await fs.writeFile(join(tmpDir, 'debug.log'), 'logs')
  await fs.writeFile(join(tmpDir, '.hidden'), 'secret')

  // Wait for the one file we expect
  await waitForEvents(changes, 1)

  expect(changes).toContain("good.txt")
  expect(changes).not.toContain('.hidden')

  watcher.close()
  await fs.rm(tmpDir, { recursive: true })
})

test('handles file removal', async () => {
  const tmpDir = await fs.mkdtemp(join(tmpdir(), 'fswatch-test-'))
  const testFile = join(tmpDir, 'test.txt')

  const removed = []
  const watcher = fswatch(tmpDir)
  watcher.onremove = async path => removed.push(path)

  // Create then remove file
  await fs.writeFile(testFile, 'content')
  await new Promise(resolve => setTimeout(resolve, 50)) // Let creation settle
  await fs.unlink(testFile)

  // Wait for removal event
  await waitForEvents(removed, 1)

  expect(removed).toContain('test.txt')

  watcher.close()
  await fs.rm(tmpDir, { recursive: true })
})

test('ignores files without extensions', async () => {
  const tmpDir = await fs.mkdtemp(join(tmpdir(), 'fswatch-test-'))

  const changes = []
  const watcher = fswatch(tmpDir)
  watcher.onupdate = async path => changes.push(path)

  // Create files with and without extensions
  await fs.writeFile(join(tmpDir, 'withext.txt'), 'content')
  await fs.writeFile(join(tmpDir, 'noext'), 'content')

  // Wait for the one file we expect
  await waitForEvents(changes, 1)

  expect(changes).toContain('withext.txt')
  expect(changes).not.toContain('noext')

  watcher.close()
  await fs.rm(tmpDir, { recursive: true })
})