import { existsSync } from 'node:fs'
import { mkdir, writeFile, unlink } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'

const WORKER = '_worker.js'

export default {
  name: 'cloudflare-pages',
  build: buildCloudflarePages,
}

export async function buildCloudflarePages(context) {
  if (!context.runtime.required) return

  const code = await bundleWorker(context)

  await mkdir(context.dist, { recursive: true })
  await writeFile(join(context.dist, WORKER), code)
}

async function createWorkerSource(context, source_path) {
  const { conf, manifests, root } = context
  const proxy = getProxyConfig(conf)
  const server_entry = proxy ? null : getServerEntry(conf, root)
  const imports = []

  if (server_entry) {
    imports.push(`import { fetch as dispatch, matches } from 'nue-edgeserver'`)
    imports.push(`import ${JSON.stringify(toImportPath(source_path, server_entry))}`)
  }

  return `
${imports.join('\n')}

const proxy = ${JSON.stringify(proxy)}
const spaFallbacks = ${JSON.stringify(manifests.spa_fallbacks)}

function canFallback(request, url) {
  return ['GET', 'HEAD'].includes(request.method) && !/\\/[^/]+\\.[^/]+$/.test(url.pathname)
}

function getSPAFallback(pathname) {
  for (const { url } of spaFallbacks) {
    if (url === '/') return url
    const base = url.endsWith('/') ? url : url + '/'
    if (pathname === base.slice(0, -1) || pathname.startsWith(base)) return url
  }
}

function shouldProxy(pathname) {
  return proxy?.routes?.some(route => pathname.startsWith(route))
}

async function proxyRequest(request, url) {
  const target = new URL(proxy.url)
  const fullUrl = target.origin + url.pathname + url.search
  const body = ['GET', 'HEAD'].includes(request.method) ? null : request.body
  return fetch(fullUrl, { body, headers: request.headers, method: request.method })
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    ${server_entry ? `if (matches(request.method, url.pathname)) return dispatch(request, env)` : ''}
    if (proxy && shouldProxy(url.pathname)) return proxyRequest(request, url)

    const asset = await env.ASSETS.fetch(request)
    if (asset.status !== 404) return asset

    if (canFallback(request, url)) {
      const fallback = getSPAFallback(url.pathname)
      if (fallback) return env.ASSETS.fetch(new Request(new URL(fallback, request.url), request))
    }

    return asset
  }
}
`
}

async function bundleWorker(context) {
  const path = join(import.meta.dir, `.cloudflare-pages-${crypto.randomUUID()}.js`)
  const source = await createWorkerSource(context, path)
  await writeFile(path, source)

  try {
    const result = await Bun.build({
      entrypoints: [path],
      format: 'esm',
      minify: true,
      target: 'browser',
    })

    if (!result.success) throw new Error(result.logs?.join('\n') || 'Failed to bundle Cloudflare Pages worker')
    return await result.outputs[0].text()

  } finally {
    await unlink(path)
  }
}

function getProxyConfig(conf) {
  const { url, routes=[] } = conf.server || {}
  return url ? { routes, url } : null
}

function getServerEntry(conf, root) {
  if (!conf.server) return null

  const dir = conf.server.dir || '@shared/server'
  const path = join(root, dir, 'index.js')
  if (existsSync(path)) return path

  throw new Error(`Server entry not found: ${path}`)
}

function toImportPath(from, to) {
  let path = relative(dirname(from), to).replace(/\\/g, '/')
  if (!path.startsWith('.')) path = './' + path
  return path
}