
import { test, expect } from 'bun:test'
import { listDependencies, parseDirs } from '../src/deps'

const paths = [

  // root (2)
  'site.yaml',
  'globals.js',
  'index.md',

  // shared (6)
  '@shared/design/base.css',
  '@shared/ui/global.css',
  '@shared/data/authors.yaml',
  '@shared/ui/page.html',
  '@shared/ui/button.html',
  '@shared/ui/keyboard.js',

  // libs
  '@shared/lib/calendar.js',

  // app (4)
  'app/index.html',
  'app/main.js',
  'app/ui/header.html',
  'app/ui/login.html',

  // blog (4)
  'blog/index.md',
  'blog/layout.html',
  'blog/entry/index.md',
  'blog/entry/content.html',

  // marketing (2)
  'marketing/table.html',
  'marketing/chart.js',

  // home directory
  'home/layout.css',
  'home/home.yaml',
]

test('parseDirs', () => {
  expect(parseDirs('blog')).toEqual(['blog'])
  expect(parseDirs('blog/entry')).toEqual(['blog', 'blog/entry'])
})

test('SPA app', () => {
  const deps = listDependencies('app/index.html', { paths })
  expect(deps.length).toBe(2 + 6 + 3) // root + shared + app (no self)
  expect(deps).toContain('site.yaml')
  expect(deps).toContain('globals.js')
})

test('root SPA', () => {
  const paths = [ 'ui/spa.css', 'ui/users.html', 'index.html' ]
  const deps = listDependencies('index.html', { paths, is_spa: true })
  expect(deps.length).toBe(2)
})

test('root index.html does not discover unrelated nested ui layouts', () => {
  const deps = listDependencies('index.html', {
    paths: [
      'index.html',
      '@shared/ui/layout.html',
      'layout.html',
      'shopping/ui/layout.html',
      'shopping/index.html',
    ]
  })

  expect(deps).toContain('@shared/ui/layout.html')
  expect(deps).toContain('layout.html')
  expect(deps).not.toContain('shopping/ui/layout.html')
})

test('MPA deps', () => {
  const deps = listDependencies('blog/entry/index.md', { paths })

  expect(deps.length).toBe(2 + 6 + 2) // root + shared + blog hierarchy
  expect(deps).toContain('site.yaml')
  expect(deps).toContain('blog/layout.html')
})

test('standalone html', () => {
  const deps = listDependencies('marketing/table.html', { paths })
  expect(deps.length).toBe(2 + 6 + 1) // root + shared + marketing
  expect(deps).toContain('site.yaml')
  expect(deps).toContain('marketing/chart.js')
  expect(deps).not.toContain('app/main.js')
})


test('local CSS', () => {
  const deps = listDependencies('app/index.html', { paths: [...paths, 'app/custom.css'] })
  expect(deps.length).toBe(2 + 6 + 4) // custom.css included
  expect(deps).toContain('app/custom.css')
})

test('exclusions', () => {
  const deps = listDependencies('app/index.html', {
    exclude: ['app/ui', '@shared', 'site.yaml'],
    paths,
  })

  expect(deps).toEqual(['globals.js', 'app/main.js'])
})

test('inclusions', () => {
  const deps = listDependencies('app/index.html', {
    exclude: ['@shared/', 'app/ui'],
    include: ['keyboard', 'calendar'],
    paths,
  })

  expect(deps.includes('@shared/ui/keyboard.js')).toBeTrue()
  expect(deps.includes('@shared/lib/calendar.js')).toBeTrue()
  expect(deps.length).toBe(5)
})


test('home auto-include', () => {
  const deps = listDependencies('index.md', { paths, exclude: [ '@' ] })
  expect(deps.includes('home/layout.css')).toBeTrue()
  expect(deps.length).toBe(4)
})


test('MPA discovery includes ancestor ui folders', () => {
  const deps = listDependencies('shopping/cart/index.md', {
    paths: [
      'site.yaml',
      '@shared/ui/layout.html',
      'layout.html',
      'shopping/layout.html',
      'shopping/ui/layout.html',
      'shopping/cart/layout.html',
      'shopping/cart/ui/layout.html',
      'shopping/cart/index.md',
    ]
  })

  expect(deps).toContain('@shared/ui/layout.html')
  expect(deps).toContain('layout.html')
  expect(deps).toContain('shopping/layout.html')
  expect(deps).toContain('shopping/ui/layout.html')
  expect(deps).toContain('shopping/cart/layout.html')
  expect(deps).toContain('shopping/cart/ui/layout.html')
})


test('MPA discovery does not auto-include non-ui custom folders', () => {
  const deps = listDependencies('shopping/cart/index.md', {
    paths: [
      'site.yaml',
      'shopping/layout.html',
      'shopping/ui/layout.html',
      'shopping/components/layout.html',
      'shopping/cart/layout.html',
      'shopping/cart/ui/layout.html',
      'shopping/cart/widgets/layout.html',
      'shopping/cart/index.md',
    ]
  })

  expect(deps).toContain('shopping/layout.html')
  expect(deps).toContain('shopping/ui/layout.html')
  expect(deps).toContain('shopping/cart/layout.html')
  expect(deps).toContain('shopping/cart/ui/layout.html')
  expect(deps).not.toContain('shopping/components/layout.html')
  expect(deps).not.toContain('shopping/cart/widgets/layout.html')
})



