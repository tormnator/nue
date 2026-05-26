
/*
  users model auto-generated from users.json mockup
  later users is available on cloudflare as real, functional model
*/

get('/users', async (c) => {
  const { users } = c.env.models
  return c.json(await users.getAll())
})

get('/users/:id', async (c) => {
  const { users } = c.env.models
  const id = c.req.param('id')
  const user = await users.get(id)
  if (!user) return c.json({ error: 'User not found' }, 404)
  return c.json(user)
})
