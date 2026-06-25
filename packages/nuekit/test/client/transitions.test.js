import { test, expect, mock } from 'bun:test'

delete globalThis.window

const { setupTransitions } = await import('../../client/transitions.js')

function setupBrowser() {
  const documentListeners = {}
  const windowListeners = {}

  globalThis.document = {
    addEventListener: mock((event, handler) => documentListeners[event] = handler),
    querySelector: mock(() => null),
    querySelectorAll: mock(() => []),
  }

  globalThis.history = {
    pushState: mock(),
    replaceState: mock(),
  }

  globalThis.location = { pathname: '/docs/', href: 'http://localhost/docs/' }
  globalThis.scrollTo = mock()
  globalThis.window = { scrollY: 0 }
  globalThis.addEventListener = mock((event, handler) => windowListeners[event] = handler)

  return { documentListeners, windowListeners }
}

test('setupTransitions replaces initial history state', () => {
  const { documentListeners, windowListeners } = setupBrowser()

  setupTransitions()

  expect(history.replaceState).toHaveBeenCalledWith({ path: '/docs/' }, 0)
  expect(history.pushState).not.toHaveBeenCalled()
  expect(documentListeners.click).toBeFunction()
  expect(windowListeners.popstate).toBeFunction()
})