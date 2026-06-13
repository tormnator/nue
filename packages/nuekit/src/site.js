
import { parse } from 'node:path'
import { fswalk } from './tools/fswalk'
import { createAsset } from './asset'
import { createFile } from './file'

export async function createSite(conf) {
  const { root, ignore } = conf

  // assets
  const paths = sortAssets(await fswalk(root, { ignore }))
  const files = await Promise.all(paths.map(path => createFile(root, path)))

  // createAsset options
  const site_opts = { files, conf }

  const assets = files.map(file => createAsset(file, site_opts))

  function get(path) {
    return assets.find(el => el.path == path)
  }

  function remove(path) {
    function splice(arr) {
      const i = arr.findIndex(el => el.path == path)
      if (i >= 0) arr.splice(i, 1)
    }
    splice(files)
    splice(assets)
  }

  async function update(path) {
    let asset = get(path)

    // update existing
    if (asset) { asset.flush(); return asset }

    // add new one
    const file = await createFile(root, path)

    if (file) {
      files.push(file)
      asset = createAsset(file, site_opts)
      assets.push(asset)

      sortAssets(files)
      sortAssets(assets)
      return asset
    }
  }

  return { assets, conf, get, remove, update }

}

export function sortAssets(items) {

  function prio(path) {
    const { dir } = parse(path)
    if (dir.startsWith('@shared')) return 0
    if (!dir) return 2
    return 1
  }

  return items.sort((a, b) => {
    if (a.path) { a = a.path; b = b.path }
    const prioA = prio(a)
    const prioB = prio(b)
    return prioA == prioB ? a.localeCompare(b) : prioA - prioB
  })

}


function getSharedDataAssets(assets) {
  return assets.filter(asset => asset.dir?.startsWith('@shared/data'))
}


export async function parseSharedData(assets) {
  // Static shared data is the broad base layer for template data.
  const statics = getSharedDataAssets(assets).filter(file => file.is_json || file.is_yaml)
  return Promise.all(statics.map(file => file.parse()))
}


export async function applySharedDataModifiers(assets, data={}) {
  // Shared data scripts run after the merged data object exists so they can enrich it.
  const mods = getSharedDataAssets(assets).filter(file => (file.is_js || file.is_ts) && !file.name?.endsWith('.test'))

  for (const mod of mods) {
    const fns = await mod.parse()
    await fns.default?.(data)
  }

  return data
}


export async function mergeSharedData(assets, data={}) {
  const dataset = await parseSharedData(assets)

  dataset.forEach(more => Object.assign(data, more))
  return applySharedDataModifiers(assets, data)
}


