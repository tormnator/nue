import { mkdir, rmdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

import { build } from '../../src/cmd/build'
import { createSite } from '../../src/site'

const testDir = './test_dir_cloudflare_pages'

const CONF = {
  root: testDir,
  is_prod: true,
  dist: join(testDir, '.dist'),
  ignore: ['node_modules', '@shared/server'],
  platform: 'cloudflare-pages',
}

async function importWorker() {
  const source = await Bun.file(join(testDir, '.dist', '_worker.js')).text()
  const match = source.match(/export\{([^}]+) as default\};?\s*$/)
  if (!match) throw new Error('Unable to evaluate worker default export')

  const factory = new Function(source.replace(match[0], `return ${match[1]}`))
  const globals = ['get', 'post', 'del', 'use']
  const previous = Object.fromEntries(globals.map(key => [key, globalThis[key]]))
  const hadPrevious = Object.fromEntries(globals.map(key => [key, Object.hasOwn(globalThis, key)]))

  try {
    return { default: factory() }
  } finally {
    for (const key of globals) {
      if (hadPrevious[key]) globalThis[key] = previous[key]
      else delete globalThis[key]
    }
  }
}

function createAssets(responses={}) {
  const calls = []

  return {
    calls,
    async fetch(request) {
      const pathname = new URL(request.url).pathname
      calls.push(pathname)
      return responses[pathname] || new Response('Not found', { status: 404 })
    }
  }
}

async function writeAll(items) {
  for (const [path, content] of items) {
    const fullpath = join(testDir, path)
    await mkdir(dirname(fullpath), { recursive: true })
    await writeFile(fullpath, content)
  }
}

async function removeAll() {
  await rmdir(testDir, { recursive: true, force: true })
}

describe('cloudflare-pages platform', async () => {
  afterEach(async () => await removeAll())

  test('static build emits root 404 but no worker in auto mode', async () => {
    await writeAll([
      ['index.md', '# Hello'],
    ])

    const site = await createSite(CONF)
    await build(site, { silent: true })

    expect(await Bun.file(join(testDir, '.dist', 'index.html')).exists()).toBeTrue()
    expect(await Bun.file(join(testDir, '.dist', '404.html')).exists()).toBeTrue()
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
    expect(worker).toInclude('index.html')
    expect(worker).not.toInclude('assetPaths')
    expect(worker).not.toInclude('nue-cloudflare-pages')
  })

  test('existing root 404 page is preserved', async () => {
    await writeAll([
      ['404.html', '<h1>Custom 404</h1>'],
      ['index.md', '# Hello'],
    ])

    const site = await createSite(CONF)
    await build(site, { silent: true })

    const file = await Bun.file(join(testDir, '.dist', '404.html')).text()
    expect(file).toInclude('Custom 404')
  })

  test('default server routes emit bundled worker', async () => {
    await writeAll([
      ['site.yaml', 'platform: cloudflare-pages'],
      ['index.md', '# Hello'],
      ['@shared/server/index.js', `
        get('/api/hello', c => c.json({ hello: true }))

        get('/api/env', c => c.json({
          hasAssets: !!c.env.platform.ASSETS,
          name: c.env.config.get('PUBLIC_NAME'),
          secret: c.env.config.require('SECRET_NAME'),
          publicConfig: c.env.config.public(),
          runtime: c.env.runtime
        }))
      `],
    ])

    const site = await createSite(CONF)
    await build(site, { silent: true })

    const worker = await Bun.file(join(testDir, '.dist', '_worker.js')).text()
    expect(worker).toInclude('/api/hello')
    expect(worker).toInclude('ASSETS.fetch')
    expect(worker).not.toInclude('.cloudflare-pages')
    expect(worker).not.toInclude('packages/nueserver')

    const { default: loaded } = await importWorker()
    const assets = createAssets()
    const res = await loaded.fetch(new Request('https://example.com/api/hello'), { ASSETS: assets })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ hello: true })
    expect(assets.calls).toEqual([])

    const envRes = await loaded.fetch(new Request('https://example.com/api/env'), {
      ASSETS: assets,
      PUBLIC_NAME: 'Nue',
      SECRET_NAME: 'hidden'
    })

    expect(envRes.status).toBe(200)
    expect(await envRes.json()).toEqual({
      hasAssets: true,
      name: 'Nue',
      secret: 'hidden',
      publicConfig: { PUBLIC_NAME: 'Nue' },
      runtime: {
        platform: 'cloudflare-pages',
        mode: 'production'
      }
    })
  })

  test('worker falls through to static assets', async () => {
    await writeAll([
      ['index.html', '<!doctype dhtml> <body><main/></body>'],
    ])

    const site = await createSite(CONF)
    await build(site, { silent: true })

    const { default: worker } = await importWorker()
    const assets = createAssets({ '/css/base.css': new Response('body{}') })
    const res = await worker.fetch(new Request('https://example.com/css/base.css'), { ASSETS: assets })

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('body{}')
    expect(assets.calls).toEqual(['/css/base.css'])
  })

  test('worker applies most specific SPA fallback', async () => {
    await writeAll([
      ['index.html', '<!doctype dhtml> <body><main/></body>'],
      ['admin/index.html', '<!doctype dhtml> <body><main/></body>'],
    ])

    const site = await createSite(CONF)
    await build(site, { silent: true })

    const { default: worker } = await importWorker()
    const assets = createAssets({ '/admin/': new Response('admin shell') })
    const res = await worker.fetch(new Request('https://example.com/admin/123'), { ASSETS: assets })

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('admin shell')
    expect(assets.calls).toEqual(['/admin/123', '/admin/'])
  })

  test('worker returns asset 404 for missing file paths', async () => {
    await writeAll([
      ['admin/index.html', '<!doctype dhtml> <body><main/></body>'],
    ])

    const site = await createSite(CONF)
    await build(site, { silent: true })

    const { default: worker } = await importWorker()
    const assets = createAssets()
    const res = await worker.fetch(new Request('https://example.com/missing.txt'), { ASSETS: assets })

    expect(res.status).toBe(404)
    expect(assets.calls).toEqual(['/missing.txt'])
  })

  test('worker serves known file paths', async () => {
    await writeAll([
      ['index.html', '<!doctype dhtml> <body><main/></body>'],
      ['hello.txt', 'hello'],
    ])

    const site = await createSite(CONF)
    await build(site, { silent: true })

    const { default: worker } = await importWorker()
    const assets = createAssets({ '/hello.txt': new Response('hello', {
      headers: { 'content-type': 'text/plain' }
    }) })
    const res = await worker.fetch(new Request('https://example.com/hello.txt'), { ASSETS: assets })

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('hello')
    expect(assets.calls).toEqual(['/hello.txt'])
  })
})