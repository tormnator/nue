
import { dirname, join } from 'node:path'

import { parseNuemark } from 'nuemark'
import { parseYAML } from 'nueyaml'
import { parseNue } from 'nuedom'

import { renderMD, renderHTML } from './render/page'
import { getCollections } from './collections'
import { mergeConf, mergeData } from './conf'
import { listDependencies, parseDirs } from './deps'
import { mergeSharedData } from './site'
import { renderSVG } from './render/svg'
import { minifyCSS } from './tools/css'


function getAssetRank(pagePath, assetPath) {
  const assetDir = dirname(assetPath)
  const is_ui = assetDir.endsWith('/ui') || assetDir == 'ui'
  const scopeDir = is_ui ? assetDir.slice(0, -3) || '.' : assetDir

  if (assetDir.startsWith('@shared/ui')) return [0, 0, is_ui ? 1 : 0]
  if (scopeDir == '.') return [2, 0, is_ui ? 1 : 0]

  const pageDirs = parseDirs(dirname(pagePath)).filter(Boolean).filter(dir => dir != '.')
  const depth = pageDirs.lastIndexOf(scopeDir)

  if (depth >= 0) return [3, depth + 1, is_ui ? 1 : 0]
  if (scopeDir.startsWith(dirname(pagePath) + '/')) return [1, 0, is_ui ? 1 : 0]

  return [1, 0, is_ui ? 1 : 0]
}

function sortHTMLAssets(pagePath, assets) {
  return assets
    .map((asset, index) => ({ asset, index, rank: getAssetRank(pagePath, asset.path) }))
    .sort((left, right) => {
      const [groupA, depthA, uiA] = left.rank
      const [groupB, depthB, uiB] = right.rank

      if (groupA != groupB) return groupB - groupA
      if (depthA != depthB) return depthB - depthA
      if (uiA != uiB) return uiA - uiB
      return left.index - right.index
    })
    .map(entry => entry.asset)
}


export function createAsset(file, site={}) {
  const { files=[], conf={} } = site
  let cachedObj = null

  function flush() {
    cachedObj = null
    file.flush()
  }

  function toAssets(paths) {
    const arr = paths.map(path => files.find(file => file.path == path))
    return arr.map(file => createAsset(file, site))
  }

  async function getDeps(opts={}) {
    const { include, exclude } = opts
    const paths = files.map(f => f.path)
    const is_spa = await isSPAEntry()
    const deps = listDependencies(file.path, { paths, include, exclude, is_spa })
    return toAssets(deps)
  }

  async function isSPAEntry() {
    if (!file.is_html || file.base != 'index.html') return false
    const { is_dhtml=false, root={} } = await parse()
    return is_dhtml && root.tag == 'body'
  }

  async function config() {
    const asset = (await getDeps()).find(f => f.base == 'app.yaml')
    return asset ? mergeConf(conf, await asset.parse()) : conf
  }

  async function data() {
    const assets = await getDeps()
    const app_files = assets.filter(f => f.is_yaml && f.name != 'site' && f.basedir != '@shared')
    const app_data = await Promise.all(app_files.map(f => f.parse()))
    const ret = mergeData([conf, ...app_data])

    // content collections
    const colls = conf.collections

    if (colls) {
      const md_paths = files.filter(f => f.is_md).map(f => f.path)
      Object.assign(ret, await getCollections(toAssets(md_paths), colls))
    }

    // shared data, functions, and transformation
    await mergeSharedData(assets, ret)

    return ret
  }

  // list all dependencies (public method)
  async function assets() {
    return getDeps(await config())
  }

  async function parse() {
    if (!cachedObj) {
      const str = await file.text()

      cachedObj = file.is_js || file.is_ts ? await import(join(process.cwd(), file.path) + '?' + Math.random())
        : file.is_json ? JSON.parsek(str)
        : file.is_md ? parseNuemark(str)
        : file.is_yaml ? parseYAML(str)
        : parseNue(str)
    }
    return cachedObj
  }

  async function toExt() {
    if (file.is_html) {
      const { is_dhtml } = await parse()
      if (is_dhtml) return '.html.js'
    }
    return file.is_md ? '.html' : file.is_ts ? '.js' : file.ext
  }

  async function contentType() {
    const types = {
      '.html.js': 'application/javascript',
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript',
      '.svg': 'image/svg+xml',
      '.css': 'text/css',
    }

    return types[await toExt()]
  }

  async function components(force_html) {
    const { is_dhtml=false } = await parse()
    const ret = []
    const html_assets = sortHTMLAssets(file.path, (await assets()).filter(el => el.is_html))

    for (const asset of html_assets) {
      const ast = await asset.parse()
      const { doctype='' } = ast

      if (ast.is_lib) {
        const same_type = is_dhtml == ast.is_dhtml
        const isomorphic = doctype.startsWith('html+dhtml')
        const forced = force_html && !ast.is_dhtml
        if (isomorphic || same_type || forced) ret.push(...ast.lib)
      }
    }

    return ret
  }

  async function render(params) {
    const asset = createAsset(file, site)
    const { is_prod } = conf

    if (file.is_svg) {
      const { svg } = await config()
      if (svg?.process) return await renderSVG(asset, { fonts: svg.fonts, ...params })
    }

    return file.is_js && is_prod || file.is_ts ? compileJS(file.rootpath, is_prod)
      : file.is_css && is_prod ? minifyCSS(await file.text())
      : file.is_html ? await renderHTML(asset)
      : file.is_md ? await renderMD(asset)
      : null
  }

  return { ...file, flush, config, data, assets, parse, components, toExt, contentType, render }
}


export async function compileJS(path, minify, bundle) {
  const result = await Bun.build({
    external: bundle ? undefined : ['*'],
    entrypoints: [path],
    target: 'browser',
    minify
  })

  const [ js ] = result.outputs
  return await js.text()
}

