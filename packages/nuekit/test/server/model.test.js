
import { testDir, writeAll, removeAll } from '../test-utils'
import { createEnv } from '../../src/server/model'
import { createLoginSessionModel } from '../../../templates/full/@shared/server/login-sessions'


afterAll(async () => await removeAll())


test('createEnv', async () => {
  await writeAll([
    ['users.json', '[{ "name": "John" }]'],
    ['leads.json', '[{ "name": "Jane" }]'],
  ])

  const { users, leads } = await createEnv(testDir)

  const [ john ] = await users.getAll()
  expect(john).toMatchObject({ id: 1, name: 'John' })

  expect((await leads.get(1))).toMatchObject({ id: 1, name: 'Jane' })
  expect(await leads.get(999)).toBeNull()

})

test('createEnv with declared local models', async () => {
  await writeAll([
    ['custom/users.json', '[{ "name": "John" }]'],
    ['other/leads.json', '[{ "name": "Jane" }]'],
  ])

  const models = await createEnv(testDir, {
    root: testDir,
    resources: {
      models: {
        users: { kind: 'collection', local: 'custom/users.json' },
        leads: { kind: 'collection', local: 'other/leads.json' },
      }
    }
  })

  expect((await models.users.get(1))).toMatchObject({ id: 1, name: 'John' })
  expect((await models.leads.get(1))).toMatchObject({ id: 1, name: 'Jane' })
  expect(models.users.login).toBeUndefined()
})

test('createEnv fails clearly for missing declared local model', async () => {
  await expect(createEnv(testDir, {
    root: testDir,
    resources: {
      models: {
        users: { kind: 'collection', local: 'missing/users.json' },
      }
    }
  })).rejects.toThrow('Local model file not found: users:')
})


test('local model item methods update and remove in memory', async () => {
  await writeAll([
    ['leads.json', '[{ "name": "Jane" }]'],
  ])

  const { leads } = await createEnv(testDir)
  const lead = await leads.get(1)

  await lead.update({ email: 'jane@example.com' })
  expect(await leads.get(1)).toMatchObject({ id: 1, name: 'Jane', email: 'jane@example.com' })

  await lead.remove()
  expect(await leads.size()).toBe(0)
})

test('template login session model uses collection resources', async () => {
  await writeAll([
    ['users.json', '[{ "email": "hey@cc.com", "password": "test" }]'],
    ['login-sessions.json', '[]'],
  ])

  const { users, loginSessions } = await createEnv(testDir, {
    root: testDir,
    resources: {
      models: {
        users: { kind: 'collection', local: 'users.json' },
        loginSessions: { kind: 'collection', local: 'login-sessions.json' },
      }
    }
  })
  const auth = createLoginSessionModel({ users, loginSessions })

  const { sessionId, user } = await auth.login('hey@cc.com', 'test')
  expect(sessionId.length).toBe(36)
  expect(user).toMatchObject({ email: 'hey@cc.com' })
  expect(user.password).toBeUndefined()

  expect(await auth.authenticate(sessionId)).toBeTrue()
  expect(await loginSessions.size()).toBe(1)

  await auth.logout(sessionId)
  expect(await auth.authenticate(sessionId)).toBeFalse()
  expect(await loginSessions.size()).toBe(0)

})

