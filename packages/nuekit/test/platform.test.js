import { createPlatformContext, detectRuntimeRequirements, listSPAFallbacks, registerPlatform, runPlatformBuild, unregisterPlatform } from '../src/platform'

function asset(path, ast) {
  return {
    base: path.split('/').pop(),
    is_html: path.endsWith('.html'),
    path,
    url: path === 'index.html' ? '/' : '/' + path.replace(/index\.html$/, ''),
    async parse() { return ast },
  }
}

test('runtime detection', () => {
  expect(detectRuntimeRequirements({}, {}).required).toBeFalse()

  expect(detectRuntimeRequirements({ server: {} }, {}).reasons).toEqual(['server-routes'])
  expect(detectRuntimeRequirements({ server: { url: 'http://localhost:5000' } }, {}).reasons).toEqual(['server-proxy'])

  const runtime = detectRuntimeRequirements({ platform: { name: 'test', runtime: 'always' } }, {})
  expect(runtime.required).toBeTrue()
  expect(runtime.detected).toBeFalse()
})

test('SPA fallback manifest', async () => {
  const fallbacks = await listSPAFallbacks([
    asset('index.html', { is_dhtml: true, root: { tag: 'body' } }),
    asset('admin/index.html', { is_dhtml: true, root: { tag: 'body' } }),
    asset('login/index.html', { is_dhtml: true, root: { tag: 'main' } }),
    asset('docs/index.html', { is_dhtml: false, root: { tag: 'body' } }),
  ])

  expect(fallbacks).toEqual([
    { path: 'index.html', url: '/' },
    { path: 'admin/index.html', url: '/admin/' },
  ])
})

test('platform context', async () => {
  const site = {
    assets: [asset('index.html', { is_dhtml: true, root: { tag: 'body' } })],
    conf: { dist: '.dist', platform: 'test', root: '.' },
  }

  const context = await createPlatformContext(site)
  expect(context.runtime.required).toBeTrue()
  expect(context.runtime.reasons).toEqual(['spa-fallback'])
  expect(context.manifests.spa_fallbacks[0].path).toBe('index.html')
})

test('registered adapter build hook', async () => {
  let received
  registerPlatform({ name: 'test', build(context) { received = context } })

  try {
    const site = {
      assets: [],
      conf: { dist: '.dist', platform: 'test', root: '.' },
    }

    await runPlatformBuild(site)
    expect(received.platform).toBe('test')
    expect(received.runtime.required).toBeFalse()

  } finally {
    unregisterPlatform('test')
  }
})
