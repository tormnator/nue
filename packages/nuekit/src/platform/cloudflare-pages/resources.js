function assertIdentifier(name, value) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) throw new Error(`Invalid ${name}: ${value}`)
}

function assertD1Binding(name, value) {
  if (!value || typeof value.prepare !== 'function') throw new Error(`Cloudflare binding is not D1-compatible for model "${name}"`)
}

function serializeData(item) {
  const { id, created, update, remove, ...data } = item
  return JSON.stringify(data)
}

function toItem(row, collection) {
  if (!row) return null

  return {
    id: row.id,
    created: row.created,
    ...JSON.parse(row.data || '{}'),

    async update(data) {
      const next = { ...this, ...data }
      await collection.update(next)
      Object.assign(this, data)
      return this
    },

    async remove() {
      await collection.remove(row.id)
    }
  }
}

export function createD1CollectionResource(db, opts={}) {
  const { table } = opts
  if (!db) throw new Error(`Missing D1 database for collection: ${table}`)
  assertIdentifier('D1 table name', table)

  async function getAll() {
    const { results=[] } = await db.prepare(`SELECT id, created, data FROM ${table} ORDER BY created DESC`).all()
    return results.map(row => toItem(row, collection))
  }

  async function size() {
    const row = await db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).first()
    return row?.count || 0
  }

  async function create(data) {
    const created = Date.now()
    const serialized = JSON.stringify(data)
    const result = await db.prepare(`INSERT INTO ${table} (created, data) VALUES (?, ?)`).bind(created, serialized).run()
    return toItem({ id: result.meta.last_row_id, created, data: serialized }, collection)
  }

  async function get(id) {
    const row = await db.prepare(`SELECT id, created, data FROM ${table} WHERE id = ?`).bind(id).first()
    return toItem(row, collection)
  }

  async function update(item) {
    await db.prepare(`UPDATE ${table} SET data = ? WHERE id = ?`).bind(serializeData(item), item.id).run()
  }

  async function remove(id) {
    await db.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run()
  }

  const collection = { getAll, size, create, get, update, remove }
  return collection
}

export function createModelResources(env={}, resources={}, platformResources={}) {
  const models = {}

  for (const [name, conf] of Object.entries(resources.models || {})) {
    if (conf.kind !== 'collection') throw new Error(`Unsupported Cloudflare model kind: ${name}.${conf.kind}`)

    const platformConf = platformResources.models?.[name] || {}
    const { binding, table=name } = platformConf
    if (!binding) throw new Error(`Missing Cloudflare binding declaration for model: ${name}`)

    const db = env[binding]
    if (!db) throw new Error(`Missing Cloudflare binding for model "${name}": ${binding}`)
    assertD1Binding(name, db)

    models[name] = createD1CollectionResource(db, { table })
  }

  return models
}