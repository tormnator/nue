
import { create, unzip, getLocalZip, fetchZip, copyLocalTemplate, getTemplateZip, isRemoteSource, DEFAULT_BASEURL } from '../../src/cmd/create'
import { rm, readdir, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const testdir = import.meta.dirname

// suppress console messages
jest.spyOn(console, 'log').mockImplementation(() => {})

afterEach(async () => {
  await rm('minimal', { recursive: true, force: true })
  await rm('test_templates', { recursive: true, force: true })
})

test('getLocalZip', async () => {
  const zip = await getLocalZip('minimal', testdir)
  expect(await zip.exists()).toBeTrue()
})

test.skip('fetchZip', async () => {
  const zip = await fetchZip('minimal', 'https://nuejs.org')
  expect(zip.status).toBe(200)
})

test('default template URL points to fork main', () => {
  expect(DEFAULT_BASEURL).toBe('https://github.com/tormnator/nue/raw/main/packages/templates')
})

test('remote template source detection', () => {
  expect(isRemoteSource('https://example.com/templates')).toBeTrue()
  expect(isRemoteSource('http://example.com/templates')).toBeTrue()
  expect(isRemoteSource('./packages/templates')).toBeFalse()
})

test('getTemplateZip accepts remote source URLs', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async url => new Response('zip', { status: url === 'https://example.com/templates/minimal.zip' ? 200 : 404 })

  try {
    const zip = await getTemplateZip('minimal', 'https://example.com/templates')
    expect(await zip.text()).toBe('zip')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('copyLocalTemplate prefers live template folders', async () => {
  const root = 'test_templates'
  await mkdir(join(root, 'minimal'), { recursive: true })
  await mkdir(join(root, 'minimal', '.dist'), { recursive: true })
  await writeFile(join(root, 'minimal', 'index.html'), '<h1>Fresh</h1>')
  await writeFile(join(root, 'minimal', '.dist', 'index.html'), '<h1>Built</h1>')

  expect(await copyLocalTemplate('minimal', root)).toBeTrue()
  const files = await readdir('minimal')
  expect(files).toEqual(['index.html'])

  await rm(root, { recursive: true, force: true })
})

test('unzip', async () => {
  const dir = 'minimal'
  const zip = await getLocalZip(dir, testdir)
  await unzip(dir, zip)
  const files = await readdir(dir)
  expect(new Set(files)).toEqual(new Set(["index.html", "index.css"]))
})

test('create', async () => {
  expect(await create('minimal', { dir: testdir })).toBeTrue()
})
