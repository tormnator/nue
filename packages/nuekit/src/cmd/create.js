
import { cp, stat } from 'node:fs/promises'
import { join } from 'node:path'

export const NAMES = 'blog full minimal spa'.split(' ')
export const DEFAULT_BASEURL = 'https://github.com/tormnator/nue/raw/main/packages/templates'

export async function create(name, { dir, baseurl }) {

  if (!name) return console.log('❌ USAGE: nue create <template-name> [template-source]')

  if (!NAMES.includes(name)) {
    return console.log('❌ Choose one: ' + NAMES.join(', '))
  }

  if (await Bun.file(name).exists()) {
    return console.log(`✨ ${name} directory already exists`)
  }

  try {
    if (dir && await copyLocalTemplate(name, dir)) {
      // copied live template folder
    } else {
      const source = dir || baseurl
      const zip = source ? await getTemplateZip(name, source) : await fetchZip(name)
      await unzip(name, zip)
    }

    // success message
    console.log(`\n🎉  "${name}" directory created. Your next steps:`)
    console.log(`   cd ${name}`)
    console.log(`   nue\n`)

    return true

  } catch (error) {
    console.error(`❌ ${error.message}`)
  }
}

export function isRemoteSource(source='') {
  return /^https?:\/\//.test(source)
}

export async function copyLocalTemplate(name, dir) {
  if (isRemoteSource(dir)) return false

  const path = join(dir, name)
  try {
    if (!(await stat(path)).isDirectory()) return false
  } catch {
    return false
  }

  console.log(`📁 Using local template folder: ${path}`)
  await cp(path, name, { recursive: true, filter: shouldCopyTemplateFile })
  return true
}

function shouldCopyTemplateFile(path) {
  const name = path.split(/[\\/]/).pop()
  return !['.dist', 'node_modules'].includes(name)
}

export async function getTemplateZip(name, source) {
  return isRemoteSource(source) ? await fetchZip(name, source) : await getLocalZip(name, source)
}


export async function getLocalZip(name, dir) {
  const path = join(dir, `${name}.zip`)
  if (!await Bun.file(path).exists()) throw new Error(`${path} not found`)
  console.log(`📦 Using local template: ${path}`)
  return Bun.file(path)
}

// download from github
//
export async function fetchZip(name, baseurl=DEFAULT_BASEURL) {
  const url = `${baseurl}/${name}.zip`
  const resp = await fetch(url)
  if (resp.status !== 200) throw new Error(`${url} not found`)
  console.log(`📦 Downloading ${name} template...`)
  return resp
}


// unzip.js
export async function unzip(dir, zip) {
  const filename = `${dir}.zip`

  try {
    // write zip file
    await Bun.write(filename, zip)

    // extract (expects "minimal" directory inside zip)
    const cmd = process.platform === 'win32' ? ['tar', '-xf', filename] : ['unzip', '-q', filename]
    const proc = Bun.spawn(cmd)
    const exitCode = await proc.exited

    if (exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text()
      throw new Error(`Unpacking archive failed with exit code ${exitCode}: ${stderr}`)
    }

  // clean up
  } finally {
    try {
      await Bun.file(filename).delete()
    } catch (e) {console.info(e)}
  }
}