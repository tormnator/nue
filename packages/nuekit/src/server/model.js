
import { readdir, mkdir, readFile, writeFile } from 'node:fs/promises'
import { isAbsolute, join } from 'node:path'

const SESSIONS_PATH = join(process.cwd(), '.nue', 'sessions.json')
const NOW = Date.now()
const DAY = 86400000


function createModel(items) {

  items.forEach((el, i) => {
    el.created = NOW - DAY * i
    el.id = i + 1
  })

  async function create(obj) {
    const id = items.length + 1
    const created = Date.now()
    const item = { id, created, ...obj }
    items.unshift(item)
    return item
  }

  // implemented with true event sourcing later
  async function getAll() {
    return items
  }

  async function size() {
    return items.length
  }

  async function get(id) {
    const item = items.find(el => el.id == id)
    return {
      ...item,

      async update(data) {
        Object.assign(item, data)
        return item
      },

      async remove() {
        const i = items.indexOf(item)
        items.splice(i, 1)
      }
    }
  }

  return { getAll, size, create, get }
}


async function saveSessions(sessions) {
  await mkdir(join(process.cwd(), '.nue'), { recursive: true })
  await writeFile(SESSIONS_PATH, JSON.stringify([...sessions], null, 2))
}

async function readSessions() {
  try {
    const data = await readFile(SESSIONS_PATH, 'utf-8')
    return new Set(JSON.parse(data))
  } catch {
    return new Set()
  }
}



// specialized models
async function createUserModel(items) {
  const users = createModel(items)
  const sessions = await readSessions()

  async function login(email, password) {
    const user = (await users.getAll()).find(el => el.email == email)

    // mock: plaintext passwords. production uses hashed
    if (user?.password == password) {
      const sessionId = crypto.randomUUID()
      sessions.add(sessionId)
      await saveSessions(sessions)
      return { sessionId, user }
    }
  }

  async function authenticate(sessionId) {
    return sessions.has(sessionId)
  }

  async function logout(sessionId) {
    sessions.delete(sessionId)
    await saveSessions(sessions)
  }

  return { ...users, login, logout, authenticate }
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
  const model = name === 'users' ? await createUserModel(items) : createModel(items)
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