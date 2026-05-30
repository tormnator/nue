
import {
  createCollectionResource,
  createConfigResource,
  createResourceEnv
} from '../../src/server/resources'

test('collection resource decorates provider records with item methods', async () => {
  const items = [{ id: 1, created: 1, name: 'Jane' }]
  const sameId = (a, b) => String(a) === String(b)
  const provider = {
    async list() {
      return items
    },

    async count() {
      return items.length
    },

    async create(data) {
      const item = { id: 2, created: 2, ...data }
      items.unshift(item)
      return item
    },

    async get(id) {
      return items.find(item => sameId(item.id, id)) || null
    },

    async update(id, data) {
      const item = items.find(item => sameId(item.id, id))
      if (item) Object.assign(item, data)
      return item
    },

    async remove(id) {
      const index = items.findIndex(item => sameId(item.id, id))
      if (index >= 0) items.splice(index, 1)
    }
  }

  const collection = createCollectionResource(provider)

  expect(await collection.size()).toBe(1)
  expect(await collection.getAll()).toMatchObject([{ id: 1, name: 'Jane' }])
  expect(await collection.get(999)).toBeNull()

  const created = await collection.create({ name: 'John' })
  expect(created).toMatchObject({ id: 2, name: 'John' })

  const updated = await created.update({ email: 'john@example.com' })
  expect(updated).toBe(created)
  expect(await collection.get(2)).toMatchObject({ id: 2, name: 'John', email: 'john@example.com' })

  await created.remove()
  expect(await collection.size()).toBe(1)
})

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
