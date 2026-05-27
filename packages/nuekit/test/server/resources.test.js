
import {
  createConfigResource,
  createResourceEnv
} from '../../src/server/resources'

test('config resource exposes safe config methods', () => {
  const config = createConfigResource({
    PUBLIC_SITE_NAME: 'Nue',
    SECRET_KEY: 'hidden',
    JSON_VALUE: { enabled: true },
    BINDING: { fetch() {} },
  })

  expect(config.get('PUBLIC_SITE_NAME')).toBe('Nue')
  expect(config.require('SECRET_KEY')).toBe('hidden')
  expect(config.get('BINDING')).toBeUndefined()
  expect(config.public()).toEqual({ PUBLIC_SITE_NAME: 'Nue' })
  expect(() => config.require('MISSING')).toThrow('Missing required config: MISSING')
})

test('resource env shapes platform resources', () => {
  const raw = { MY_BINDING: {} }
  const models = { leads: {} }
  const config = createConfigResource({ PUBLIC_MODE: 'test' })

  const env = createResourceEnv({
    platform: 'cloudflare-pages',
    mode: 'production',
    raw,
    resources: { config, models }
  })

  expect(env.config.get('PUBLIC_MODE')).toBe('test')
  expect(env.models).toBe(models)
  expect(env.platform).toBe(raw)
  expect(env.runtime).toEqual({
    platform: 'cloudflare-pages',
    mode: 'production'
  })
})
