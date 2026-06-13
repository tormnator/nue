import {
  createModelResources,
  createD1CollectionResource
} from '../../src/platform/cloudflare-pages/resources'
import { createLoginSessionModel } from '../../../templates/full/@shared/server/login-sessions'

function createMockD1(rows=[]) {
  const items = rows.map(row => ({ ...row, data: JSON.stringify(row.data || {}) }))
  let lastId = items.reduce((max, item) => Math.max(max, item.id), 0)
  const sameId = (a, b) => String(a) === String(b)

  return {
    prepare(sql) {
      const params = []

      return {
        bind(...values) {
          params.push(...values)
          return this
        },

        async all() {
          if (sql.startsWith('SELECT id, created, data')) return { results: items.toSorted((a, b) => b.created - a.created) }
          throw new Error(`Unexpected D1 all query: ${sql}`)
        },

        async first() {
          if (sql.startsWith('SELECT COUNT(*) AS count')) return { count: items.length }
          if (sql.startsWith('SELECT id, created, data')) return items.find(item => sameId(item.id, params[0])) || null
          throw new Error(`Unexpected D1 first query: ${sql}`)
        },

        async run() {
          if (sql.startsWith('INSERT INTO')) {
            const [created, data] = params
            const id = ++lastId
            items.unshift({ id, created, data })
            return { meta: { last_row_id: id } }
          }

          if (sql.startsWith('UPDATE')) {
            const [data, id] = params
            const item = items.find(item => sameId(item.id, id))
            if (item) item.data = data
            return { meta: {} }
          }

          if (sql.startsWith('DELETE')) {
            const index = items.findIndex(item => sameId(item.id, params[0]))
            if (index >= 0) items.splice(index, 1)
            return { meta: {} }
          }

          throw new Error(`Unexpected D1 run query: ${sql}`)
        }
      }
    }
  }
}

function createMockD1Tables(seed={}) {
  const sameId = (a, b) => String(a) === String(b)
  const tables = Object.fromEntries(Object.entries(seed).map(([name, rows]) => [
    name,
    rows.map(row => ({ ...row, data: JSON.stringify(row.data || {}) }))
  ]))
  const lastIds = Object.fromEntries(Object.entries(tables).map(([name, rows]) => [
    name,
    rows.reduce((max, item) => Math.max(max, item.id), 0)
  ]))

  function tableName(sql) {
    return sql.match(/(?:FROM|INTO|UPDATE)\s+([A-Za-z_][A-Za-z0-9_]*)/)?.[1]
  }

  return {
    prepare(sql) {
      const params = []
      const name = tableName(sql)
      if (!tables[name]) tables[name] = []
      const items = tables[name]
      lastIds[name] ||= items.reduce((max, item) => Math.max(max, item.id), 0)

      return {
        bind(...values) {
          params.push(...values)
          return this
        },

        async all() {
          if (sql.startsWith('SELECT id, created, data')) return { results: items.toSorted((a, b) => b.created - a.created) }
          throw new Error(`Unexpected D1 all query: ${sql}`)
        },

        async first() {
          if (sql.startsWith('SELECT COUNT(*) AS count')) return { count: items.length }
          if (sql.startsWith('SELECT id, created, data')) return items.find(item => sameId(item.id, params[0])) || null
          throw new Error(`Unexpected D1 first query: ${sql}`)
        },

        async run() {
          if (sql.startsWith('INSERT INTO')) {
            const [created, data] = params
            const id = ++lastIds[name]
            items.unshift({ id, created, data })
            return { meta: { last_row_id: id } }
          }

          if (sql.startsWith('UPDATE')) {
            const [data, id] = params
            const item = items.find(item => sameId(item.id, id))
            if (item) item.data = data
            return { meta: {} }
          }

          if (sql.startsWith('DELETE')) {
            const index = items.findIndex(item => sameId(item.id, params[0]))
            if (index >= 0) items.splice(index, 1)
            return { meta: {} }
          }

          throw new Error(`Unexpected D1 run query: ${sql}`)
        }
      }
    }
  }
}

test('D1 collection resource exposes local model-style methods', async () => {
  const db = createMockD1([{ id: 1, created: 1, data: { name: 'Jane' } }])
  const leads = createD1CollectionResource(db, { table: 'leads' })

  expect(await leads.size()).toBe(1)
  expect(await leads.getAll()).toMatchObject([{ id: 1, name: 'Jane' }])

  const created = await leads.create({ name: 'John' })
  expect(created).toMatchObject({ id: 2, name: 'John' })
  expect(await leads.size()).toBe(2)

  const lead = await leads.get(2)
  expect(lead).toMatchObject({ id: 2, name: 'John' })

  const updated = await lead.update({ name: 'Joan' })
  expect(updated).toBe(lead)
  expect(lead).toMatchObject({ id: 2, name: 'Joan' })

  await lead.update({ email: 'joan@example.com' })
  expect(await leads.get(2)).toMatchObject({ id: 2, name: 'Joan', email: 'joan@example.com' })

  await lead.remove()
  expect(await leads.size()).toBe(1)
})

test('Cloudflare model resources map declarations to D1 bindings', async () => {
  const env = { DB: createMockD1([{ id: 1, created: 1, data: { name: 'Jane' } }]) }
  const models = createModelResources(env, {
    models: {
      leads: { kind: 'collection' }
    }
  }, {
    models: {
      leads: { binding: 'DB', table: 'leads' }
    }
  })

  expect(await models.leads.get(1)).toMatchObject({ id: 1, name: 'Jane' })
})

test('full template login sessions work with D1 model resources', async () => {
  const env = {
    DB: createMockD1Tables({
      users: [{ id: 1, created: 1, data: { email: 'hey@cc.com', password: 'test' } }],
      login_sessions: []
    })
  }
  const models = createModelResources(env, {
    models: {
      users: { kind: 'collection' },
      loginSessions: { kind: 'collection' }
    }
  }, {
    models: {
      users: { binding: 'DB', table: 'users' },
      loginSessions: { binding: 'DB', table: 'login_sessions' }
    }
  })
  const auth = createLoginSessionModel(models)

  const { sessionId, user } = await auth.login('hey@cc.com', 'test')
  expect(sessionId.length).toBe(36)
  expect(user).toMatchObject({ email: 'hey@cc.com' })
  expect(user.password).toBeUndefined()
  expect(await auth.authenticate(sessionId)).toBeTrue()
  expect(await models.loginSessions.size()).toBe(1)

  await auth.logout(sessionId)
  expect(await auth.authenticate(sessionId)).toBeFalse()
  expect(await models.loginSessions.size()).toBe(0)
})

test('Cloudflare model resources fail clearly for missing bindings', () => {
  expect(() => createModelResources({}, {
    models: {
      leads: { kind: 'collection' }
    }
  }, {
    models: {
      leads: { binding: 'DB', table: 'leads' }
    }
  })).toThrow('Missing Cloudflare binding for model "leads": DB')
})

test('Cloudflare model resources validate D1-compatible bindings', () => {
  expect(() => createModelResources({ DB: {} }, {
    models: {
      leads: { kind: 'collection' }
    }
  }, {
    models: {
      leads: { binding: 'DB', table: 'leads' }
    }
  })).toThrow('Cloudflare binding is not D1-compatible for model "leads"')
})