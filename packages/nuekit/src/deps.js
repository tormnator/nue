
import { dirname, extname, basename } from 'node:path'

// app, lib, server are @shared, but not auto-included
const AUTO_INCLUDED = ['data', 'design', 'ui'].map(dir => `@shared/${dir}`)

const ASSET_TYPES = ['.html', '.js', '.ts', '.yaml', '.json', '.css']


function getDependencyRank(path) {
  const dir = dirname(path)
  const depth = dir == '.' ? 0 : dir.split('/').filter(Boolean).length

  if (dir.startsWith('@shared')) return [0, depth]
  if (dir == '.') return [1, depth]
  return [2, depth]
}


function sortDependencies(paths) {
  return paths
    .map((path, index) => ({ path, index, rank: getDependencyRank(path) }))
    .sort((left, right) => {
      const [groupA, depthA] = left.rank
      const [groupB, depthB] = right.rank

      if (groupA != groupB) return groupA - groupB
      if (depthA != depthB) return depthA - depthB
      return left.index - right.index
    })
    .map(entry => entry.path)
}


export function listDependencies(basepath, { paths, exclude=[], include=[], is_spa=false }) {

  // folder dependency
  let deps = paths.filter(path => isDep(basepath, path, paths, is_spa))

  // extensions
  deps = deps.filter(path => ASSET_TYPES.includes(extname(path)))

  // exclusions
  exclude.forEach(pattern => {
    deps = deps.filter(path => !path.includes(pattern))
  })

  // Re-inclusions
  include.forEach(pattern => {
    paths.forEach(path => {
      if (path.includes(pattern)) deps.push(path)
    })
  })

  return sortDependencies([...new Set(deps)])
}


function isDep(page_path, asset_path, all_paths, is_spa) {
  // self
  if (page_path == asset_path) return false

  // root level assets (global)
  const dir = dirname(asset_path)
  if (dir == '.') return true

  // shared dir -> auto-included
  if (AUTO_INCLUDED.some(dir => asset_path.startsWith(dir + '/'))) return true

  // SPA entry points include their full subtree when explicitly marked as SPA.
  if (basename(page_path) == 'index.html' && is_spa) {
    const dir = dirname(page_path)
    return dir == '.' ? !all_paths.some(el => extname(el) == '.md') : asset_path.startsWith(dir + '/')
  }

  // index.md -> home dir
  const pagedir = dirname(page_path)
  if (pagedir == '.' && basename(page_path) == 'index.md') return dirname(asset_path) == 'home'

  // hierarchical inclusion (handles root ui and app ui)
  const page_dirs = parseDirs(dirname(page_path))
  const asset_dir = dirname(asset_path)

  // check if asset is in ui of any parent directory
  return page_dirs.some(pageDir => {
    const ui_dir = pageDir ? pageDir + '/ui' : 'ui'
    return asset_dir == ui_dir || asset_dir == pageDir
  })
}


// parseDirs('a/b/c') --> ['a', 'a/b', 'a/b/c']
export function parseDirs(dir) {
  const els = dir.split('/').filter(Boolean)
  return els.map((el, i) => els.slice(0, i + 1).join('/'))
}