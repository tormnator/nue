
import { readSiteConf, mergeData, mergeValue } from '../src/conf'
import { testDir, writeAll, removeAll } from './test-utils'
import { createAsset } from '../src/asset'
import { getFileInfo } from '../src/file'
import { trim } from '../src/render/page'


test('site overrides', async () => {
  const CONF = trim(`
    site:
      skip: [functions]

    server:
      dir: epic-server

    meta:
      title: Bad

    production:
      title: Good
  `)

  await writeAll([['site.yaml', CONF]])
  const conf = await readSiteConf({ root: testDir, is_prod: true, port: 666 })

  expect(conf).toMatchObject({
    server: { dir: "epic-server" },
    meta: { title: "Good" },
    port: 666,
    is_prod: true,
  })

  expect(conf.ignore).toContain('functions')
  expect(conf.ignore).toContain('epic-server')
  expect(conf.ignore.length).toBeGreaterThan(10)

  await removeAll()
})

test('site overrides', () => {
  const conf = { port: 4000, rss: { enabled: true } }
  mergeValue(conf, 'port', 8080)
  mergeValue(conf, 'site', { other: true })
  expect(conf.port).toBe(4000)
  expect(conf.rss.enabled).toBe(true)
})


test('meta/content merge', () => {
  const conf = { meta: { title: 'Site', author: 'John' } }
  mergeValue(conf, 'meta', { title: 'App' })
  expect(conf.meta.title).toBe('App')
  expect(conf.meta.author).toBe('John')
})

test('simple override', () => {
  const conf = { exclude: ['old'] }
  mergeValue(conf, 'exclude', ['new'])
  expect(conf.exclude).toEqual(['new'])
})

test('mergeData', () => {
  const data = mergeData([
    { sitename: 'Acme', port: 4000, meta: { title: 'Old', desc: 'Old' } },
    { meta: { title: 'New' }, team: [], desc: 'New' }
  ])

  expect(data).toEqual({
    sitename: "Acme",
    title: "New",
    desc: "New",
    team: [],
  })
})


test('asset data/config', async () => {

  const files = [
    { path: 'site.yaml', text: 'dont: doit' },
    { path: 'team.yaml', text: 'team: [ jane, john ]' },
    { path: 'blog/app.yaml', text: 'port: 3000\ninclude: [ syntax ]\nmeta:\n title: Acme' },
    { path: 'blog/entry/data.yaml', text: 'size: 1000' },
    { path: 'docs/app.yaml', text: 'should_not: be' },

  ].map(file => {
    const { text } = file
    return { ...getFileInfo(file.path), text: async function() { return text } }
  })

  const conf = { is_prod: true, port: 5000 }

  const asset = createAsset({ path: 'blog/entry/index.md' }, { files, conf })

  expect(await asset.data()).toEqual({
    is_prod: true,
    team: [ "jane", "john" ],
    title: "Acme",
    size: 1000,
  })

  expect(await asset.config()).toEqual({
    is_prod: true,
    include: [ "syntax" ],
    meta: { title: "Acme" },
    port: 5000
  })

})


test('shared data acts as a base layer', async () => {

  const files = [
    { path: '@shared/data/theme.yaml', text: 'color: blue\nshared_only: base' },
    { path: 'team.yaml', text: 'color: green\nroot_only: root' },
    { path: 'blog/entry/data.yaml', text: 'color: red\npage_only: page' },
  ].map(file => {
    const { text } = file
    return { ...getFileInfo(file.path), text: async function() { return text } }
  })

  const asset = createAsset({ path: 'blog/entry/index.md' }, { files, conf: {} })

  expect(await asset.data()).toEqual({
    color: 'red',
    shared_only: 'base',
    root_only: 'root',
    page_only: 'page',
  })
})


test('nested app.yaml files cascade by specificity', async () => {

  const files = [
    { path: 'blog/app.yaml', text: 'include: [ syntax ]\nmeta:\n title: Blog\n desc: From blog' },
    { path: 'blog/entry/app.yaml', text: 'include: [ chart ]\nmeta:\n title: Entry' },
  ].map(file => {
    const { text } = file
    return { ...getFileInfo(file.path), text: async function() { return text } }
  })

  const asset = createAsset({ path: 'blog/entry/index.md' }, { files, conf: { is_prod: true, port: 5000 } })

  expect(await asset.config()).toEqual({
    is_prod: true,
    include: ['chart'],
    meta: {
      title: 'Entry',
      desc: 'From blog',
    },
    port: 5000,
  })
})


test('JSON data participates in the same hierarchy as YAML', async () => {

  const files = [
    { path: '@shared/data/team.json', text: '{ "name": "shared", "shared_only": true }' },
    { path: 'team.json', text: '{ "name": "root", "root_only": true }' },
    { path: 'blog/entry/data.json', text: '{ "name": "page", "page_only": true }' },
  ].map(file => {
    const { text } = file
    return { ...getFileInfo(file.path), text: async function() { return text } }
  })

  const asset = createAsset({ path: 'blog/entry/index.md' }, { files, conf: {} })

  expect(await asset.data()).toEqual({
    name: 'page',
    shared_only: true,
    root_only: true,
    page_only: true,
  })
})

