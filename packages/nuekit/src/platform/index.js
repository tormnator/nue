import { dirname } from 'node:path'

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

  const adapter = adapters.get(name)
  if (!adapter) throw new Error(`Unknown platform: ${name}`)

  const context = await createPlatformContext(site, args, subset)
  return await adapter.build?.(context)
}

/**
 * Create the platform-neutral build context passed to adapters.
 * The context must not expose deployment-target concepts such as worker files or bindings.
 */
export async function createPlatformContext(site, args={}, subset=site.assets) {
  const { conf, assets } = site
  const spa_fallbacks = await listSPAFallbacks(assets)
  const manifests = { spa_fallbacks }
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

  if (server) reasons.push(server.url ? RUNTIME_REASONS.server_proxy : RUNTIME_REASONS.server_routes)
  if (manifests.spa_fallbacks?.length) reasons.push(RUNTIME_REASONS.spa_fallback)

  const policy = getRuntimePolicy(conf.platform)
  const detected = !!reasons.length
  const required = policy === 'always' || policy === 'auto' && detected

  return { detected, policy, reasons, required }
}

export async function listSPAFallbacks(assets=[]) {
  const fallbacks = []

  for (const asset of assets) {
    if (!asset.is_html || asset.base !== 'index.html') continue
    const { is_dhtml=false, root={} } = await asset.parse()
    if (is_dhtml && root.tag === 'body') {
      fallbacks.push({ path: asset.path, url: asset.url || getFallbackURL(asset.path) })
    }
  }

  return fallbacks
}

function getFallbackURL(path) {
  const dir = dirname(path).replace(/\\/g, '/')
  return dir === '.' ? '/' : `/${dir}/`
}