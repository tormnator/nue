

import { createLoginSessionModel } from './login-sessions.js'

function createLoginSession(c) {
  const { users, loginSessions } = c.env.models
  return createLoginSessionModel({ users, loginSessions })
}

// login
post('/api/login', async (c) => {
  const session = createLoginSession(c)
  const { email, password } = await c.req.json()

  const ret = await session.login(email, password)
  return ret ? c.json(ret) : c.json({ error: 'Invalid credentials' }, 401)
})

post('/api/logout', async (c) => {
  const session = createLoginSession(c)
  const sessionId = c.req.header('Authorization')?.replace('Bearer ', '')
  await session.logout(sessionId)
  return c.json({ success: true })
})

post('/api/leads', async (c) => {
  const { leads } = c.env.models
  const country = c.req.header('cf-ipcountry')
  const data = await c.req.json()
  const lead = await leads.create({ ...data, country })
  console.log('created', lead)
  return c.json(lead)
})

// authenticated requests
use('/api/admin/*', async (c, next) => {
  const session = createLoginSession(c)
  const sessionId = c.req.header('Authorization')?.replace('Bearer ', '')
  if (await session.authenticate(sessionId)) await next()
  else return c.json({ error: 'Invalid session' }, 401)
})

get('/api/admin/all', async (c) => {
  const { leads } = c.env.models
  return c.json({ leads: await leads.getAll() })
})

get('/api/admin/leads/:id', async (c) => {
  const { leads } = c.env.models
  const lead = await leads.get(c.req.param('id'))
  return lead ? c.json(lead) : c.json({ error: 'Lead not found' }, 404)
})

del('/api/admin/leads/:id', async (c) => {
  const { leads } = c.env.models
  const lead = await leads.get(c.req.param('id'))
  if (!lead) return c.json({ error: 'Not found' }, 404)
  await lead.remove()
  return c.json({ success: true })
})



