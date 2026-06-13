
import { readdir, readFile } from 'node:fs/promises'
import { isAbsolute, join } from 'node:path'

import { createCollectionResource } from './resources.js'

const NOW = Date.now()
const DAY = 86400000

function sameId(a, b) {
  return String(a) === String(b)
}

function createModel(items) {

  items.forEach((el, i) => {
    el.created = NOW - DAY * i
    el.id = i + 1
  })

  async function create(data) {
    const id = items.length + 1
    const created = Date.now()
    const item = { id, created, ...data }
    items.unshift(item)
    return item
  }

  async function list() {
    return items
  }

  async function count() {
    return items.length
  }

  async function get(id) {
    return items.find(el => sameId(el.id, id)) || null
  }

  async function update(id, data) {
    const item = items.find(el => sameId(el.id, id))
    if (item) Object.assign(item, data)
    return item
  }

  async function remove(id) {
    const i = items.findIndex(el => sameId(el.id, id))
    if (i >= 0) items.splice(i, 1)
  }

  return createCollectionResource({ list, count, create, get, update, remove })
}



async function createModelFromFile(name, path) {
  let text

  try {
    text = await readFile(path, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error(`Local model file not found: ${name}: ${path}`)
    throw error
  }

  const items = JSON.parse(text)
  const model = createModel(items)
  console.log(`Model "${name}" loaded (${ await model.size() } records)`)
  return model
}

function resolveLocalPath(root, path) {
  return isAbsolute(path) ? path : join(root, path)
}

async function createDeclaredEnv(models, root) {
  const env = {}

  for (const [name, conf] of Object.entries(models)) {
    if (conf.kind !== 'collection') throw new Error(`Unsupported local model kind: ${name}.${conf.kind}`)
    if (!conf.local) throw new Error(`Missing local model path: ${name}`)
    env[name] = await createModelFromFile(name, resolveLocalPath(root, conf.local))
  }

  return env
}

export async function createEnv(dir, opts={}) {
  const { resources, root=process.cwd() } = opts
  if (resources?.models) return await createDeclaredEnv(resources.models, root)

  const files = await readdir(dir)
  const env = {}

  for (const file of files) {
    if (file.endsWith('.json')) {
      const type = file.replace('.json', '')
      const path = join(dir, file)
      env[type] = await createModelFromFile(type, path)
    }
  }

  return env
}