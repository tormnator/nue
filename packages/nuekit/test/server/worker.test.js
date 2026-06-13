
import { mkdir, rmdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { importWorker, createWorker } from '../../src/server/worker'
import { routes, fetch, matches } from 'nue-edgeserver'

const testDir = './test_dir_worker'

async function write(path, content) {
  await mkdir(testDir, { recursive: true })

  const index = path.lastIndexOf('/')
  if (index > 0) await mkdir(join(testDir, path.slice(0, index)), { recursive: true })

  await writeFile(join(testDir, path), content)
}

async function removeAll() {
  await rmdir(testDir, { recursive: true, force: true })
}

// create server
beforeAll(async () => {
  await write('index.ts', `
    get('/api/users', (c) => {
      return c.json(['jane'])
    })

    get('/api/model-user', async (c) => {
      const [user] = await c.env.models.users.getAll()
      return c.json({
        name: user.name,
        platform: c.env.runtime.platform
      })
    })
  `)
})

afterAll(async () => await removeAll())


test('importWorker', async () => {

  await importWorker({ dir: testDir })

  // routes
  expect(routes.length).toBe(2)

  // match function
  expect(matches('GET', '/api/users')).toBeTrue()

  // GET
  let resp = await fetch(new Request('http://localhost/api/users'))
  expect(await resp.json()).toEqual(['jane'])

  // 404
  resp = await fetch(new Request('http://localhost/static/file.css'))
  expect(resp.status).toBe(404)
})


test('createWorker', async () => {
  await write('models/users.json', '[{ "name": "Jane" }]')

  const worker = await createWorker({
    dir: testDir,
    reload: true,
    resources: {
      models: {
        users: { kind: 'collection', local: `${testDir}/models/users.json` }
      }
    }
  })

  let resp = await worker(new Request('http://localhost/api/users'))
  expect(await resp.json()).toEqual(['jane'])

  resp = await worker(new Request('http://localhost/api/model-user'))
  expect(await resp.json()).toEqual({ name: 'Jane', platform: 'local' })
})
