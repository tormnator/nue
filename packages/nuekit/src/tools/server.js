
export function createServer({ port=4000, handler }, callback) {
  const devToolsProbe = '/.well-known/appspecific/com.chrome.devtools.json'

  async function fetch(req) {
    const { pathname, searchParams } = new URL(req.url)

    // custom handler (proxy or worker)
    const result = handler && await handler(req)
    if (result) return result

    // WebSocket connection for HMR
    if (req.headers.get('upgrade') == 'websocket') {
      return server.upgrade(req) ? undefined : new Response('Upgrade failed', { status: 500 })
    }

    // regular file serving
    try {
      const res = await callback(pathname, Object.fromEntries(searchParams))

      // res = Bun.file
      if (res?.stream) return new Response(res, { status: 200 })

      // res = { content, type, status } || HTML <string>
      if (res) {
        return new Response(res.content || res, {
          headers: { 'Content-Type': res.type || 'text/html; charset=utf-8' },
          status: res.status || 200
        })

      } else {
        if (pathname !== devToolsProbe) console.error('Not found', pathname)
        return new Response('404 Not Found', { status: 404 })
      }

    } catch (e) {
      console.error(e)
      return new Response('500 Server Error', { status: 500 })
    }
  }

  const server = Bun.serve({ idleTimeout: 0, port, fetch, websocket })
  return server
}


const sessions = new Map()

const websocket = {
  open(ws) {
    sessions.set(ws, { pathname: null })
    // console.log(`HMR connected, total: ${sessions.size}`)
  },
  message(ws, raw) {
    try {
      const { type, pathname } = JSON.parse(raw)
      if (type === 'pathname') sessions.get(ws).pathname = pathname
    } catch {}
  },
  close(ws) {
    sessions.delete(ws)
  }
}

export function broadcast(data) {
  for (const [ws] of sessions) {
    try { ws.send(JSON.stringify(data)) } catch(e) {}
  }
}

export function broadcastTo(data, pathname) {
  for (const [ws, session] of sessions) {
    if (session.pathname === pathname) {
      try { ws.send(JSON.stringify(data)) } catch(e) {}
    }
  }
}

