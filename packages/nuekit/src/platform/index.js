import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

const DEFAULT_SERVER_DIR = '@shared/server'

export const RUNTIME_REASONS = {
  server_routes: 'server-routes',
  server_proxy: 'server-proxy',
  spa_fallback: 'spa-fallback',
}

const adapters = new Map()

/**
 * Register a platform adapter by target-neutral name.
 * Adapters own all target-specific artifact generation and terminology.
 */
export function registerPlatform(adapter) {
  if (!adapter?.name) throw new Error('Platform adapter must define a name')
  adapters.set(adapter.name, adapter)
  return adapter
}

export function unregisterPlatform(name) {
  adapters.delete(name)
}

export function getPlatformName(platform) {
  return typeof platform === 'string' ? platform : platform?.name
}

export function getRuntimePolicy(platform) {
  return platform && typeof platform === 'object' && platform.runtime || 'auto'
}

export async function runPlatformBuild(site, args={}, subset=site.assets) {
  const name = getPlatformName(site.conf.platform)
  if (!name) return

  const adapter = await getPlatform(name)
  if (!adapter) throw new Error(`Unknown platform: ${name}`)

  const context = await createPlatformContext(site, args, subset)
  return await adapter.build?.(context)
}

async function getPlatform(name) {
  let adapter = adapters.get(name)
  if (adapter) return adapter

  if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error(`Invalid platform: ${name}`)

  try {
    const mod = await import(`./${name}.js`)
    adapter = mod.default && registerPlatform(mod.default)
    return adapter
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND' || error.message?.includes(`/${name}.js`)) return null
    throw error
  }
}

/**
 * Create the platform-neutral build context passed to adapters.
 * The context must not expose deployment-target concepts such as worker files or bindings.
 */
export async function createPlatformContext(site, args={}, subset=site.assets) {
  const { conf, assets } = site
  const spa_fallbacks = await listSPAFallbacks(assets)
  const server_entry = getServerEntry(conf, conf.root)
  const manifests = { server_entry, spa_fallbacks }
  const runtime = detectRuntimeRequirements(conf, manifests)

  return {
    args,
    assets,
    conf,
    dist: conf.dist,
    manifests,
    platform: conf.platform,
    root: conf.root,
    runtime,
    subset,
  }
}

export function detectRuntimeRequirements(conf={}, manifests={}) {
  const reasons = []
  const { server } = conf

  if (server?.url) reasons.push(RUNTIME_REASONS.server_proxy)
  else if (server || manifests.server_entry) reasons.push(RUNTIME_REASONS.server_routes)
  if (manifests.spa_fallbacks?.length) reasons.push(RUNTIME_REASONS.spa_fallback)

  const policy = getRuntimePolicy(conf.platform)
  const detected = !!reasons.length
  const required = policy === 'always' || policy === 'auto' && detected

  return { detected, policy, reasons, required }
}

function getServerEntry(conf={}, root='.') {
  if (conf.server?.url) return null

  const dir = conf.server?.dir || DEFAULT_SERVER_DIR
  const path = join(root, dir, 'index.js')
  return existsSync(path) ? { dir, path } : null
}

export async function listSPAFallbacks(assets=[]) {
  const fallbacks = []

  for (const asset of assets) {
    if (!asset.is_html || asset.base !== 'index.html') continue
    const { is_dhtml=false, root={} } = await asset.parse()
    if (is_dhtml && root.tag === 'body') {
      fallbacks.push({ path: asset.path, url: normalizeFallbackURL(asset.url || getFallbackURL(asset.path)) })
    }
  }

  return fallbacks.sort((a, b) => b.url.length - a.url.length)
}

function getFallbackURL(path) {
  const dir = dirname(path).replace(/\\/g, '/')
  return dir === '.' ? '/' : `/${dir}/`
}

function normalizeFallbackURL(url) {
  return url.endsWith('/') ? url : `${url}/`
}