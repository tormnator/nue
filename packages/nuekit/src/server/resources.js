
function isPlainObject(value) {
  return value?.constructor === Object
}

function isConfigValue(value) {
  if (value == null) return true

  const type = typeof value
  if (type === 'string' || type === 'number' || type === 'boolean') return true
  if (Array.isArray(value)) return value.every(isConfigValue)
  if (isPlainObject(value)) return Object.values(value).every(isConfigValue)

  return false
}

function createConfigValues(source={}) {
  const values = {}

  for (const [name, value] of Object.entries(source)) {
    if (isConfigValue(value)) values[name] = value
  }

  return values
}

export function createConfigResource(source={}, opts={}) {
  const values = createConfigValues(source)
  const public_prefix = opts.public_prefix || 'PUBLIC_'

  function get(name) {
    return values[name]
  }

  function require(name) {
    const value = get(name)
    if (value == null) throw new Error(`Missing required config: ${name}`)
    return value
  }

  function publicConfig() {
    const public_values = {}

    for (const [name, value] of Object.entries(values)) {
      if (name.startsWith(public_prefix)) public_values[name] = value
    }

    return public_values
  }

  return { get, require, public: publicConfig }
}

export function createResourceEnv(opts={}) {
  const { platform='local', mode='development', raw, resources={} } = opts
  const { runtime={}, ...rest } = resources

  return {
    ...rest,
    config: rest.config || createConfigResource(),
    models: rest.models || {},
    platform: raw || rest.platform || {},
    runtime: {
      platform,
      mode,
      ...runtime
    }
  }
}