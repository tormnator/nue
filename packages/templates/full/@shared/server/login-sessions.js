function publicUser(user) {
  const { password, update, remove, ...data } = user
  return data
}

export function createLoginSessionModel({ users, loginSessions }) {
  async function findSession(sessionId) {
    if (!sessionId) return null
    return (await loginSessions.getAll()).find(session => session.sessionId === sessionId) || null
  }

  async function login(email, password) {
    const user = (await users.getAll()).find(item => item.email === email)

    if (user?.password === password) {
      const sessionId = crypto.randomUUID()
      await loginSessions.create({ sessionId })
      return { sessionId, user: publicUser(user) }
    }
  }

  async function authenticate(sessionId) {
    return !!await findSession(sessionId)
  }

  async function logout(sessionId) {
    const session = await findSession(sessionId)
    if (session) await session.remove()
  }

  return { login, logout, authenticate }
}
