import { join } from 'node:path'

import { build } from '../../src/cmd/build'
import { createSite } from '../../src/site'
import { testDir, writeAll, removeAll } from '../test-utils'

const CONF = {
  root: testDir,
  is_prod: true,
  dist: join(testDir, '.dist'),
  ignore: ['node_modules', '@shared/server'],
  platform: 'cloudflare-pages',
}

describe('cloudflare-pages platform', async () => {
  afterEach(async () => await removeAll())

  test('static build emits no worker in auto mode', async () => {
    await writeAll([
      ['index.md', '# Hello'],
    ])

    const site = await createSite(CONF)
    await build(site, { silent: true })

    expect(await Bun.file(join(testDir, '.dist', 'index.html')).exists()).toBeTrue()
    expect(await Bun.file(join(testDir, '.dist', '_worker.js')).exists()).toBeFalse()
  })

  test('SPA fallback emits worker', async () => {
    await writeAll([
      ['index.html', '<!doctype dhtml> <body><main/></body>'],
    ])

    const site = await createSite(CONF)
    await build(site, { silent: true })

    const worker = await Bun.file(join(testDir, '.dist', '_worker.js')).text()
    expect(worker).toInclude('ASSETS.fetch')
    expect(worker).toInclude('spaFallbacks')
    expect(worker).toInclude('index.html')
  })

  test('server routes emit bundled worker', async () => {
    await writeAll([
      ['site.yaml', 'platform: cloudflare-pages\nserver:\n  dir: server'],
      ['index.md', '# Hello'],
      ['server/index.js', "get('/api/hello', c => c.json({ hello: true }))"],
    ])

    const site = await createSite({ ...CONF, server: { dir: 'server' }, ignore: ['node_modules', 'server'] })
    await build(site, { silent: true })

    const worker = await Bun.file(join(testDir, '.dist', '_worker.js')).text()
    expect(worker).toInclude('/api/hello')
    expect(worker).toInclude('ASSETS.fetch')
  })
})