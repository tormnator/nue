#!/usr/bin/env bun

import { readdir, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join, relative } from 'node:path'

const TEMPLATES = 'blog full minimal spa'.split(' ')
const ROOT = fileURLToPath(new URL('../packages/templates/', import.meta.url))
const DOS_EPOCH = new Date('1980-01-01T00:00:00Z')
const UTF8_FLAG = 0x0800
const DOS_DIRECTORY_ATTRIBUTE = 0x10

const crcTable = new Uint32Array(256).map((_, index) => {
  let value = index
  for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
  return value >>> 0
})

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function dosDateTime(date=DOS_EPOCH) {
  const year = Math.max(date.getUTCFullYear(), 1980)
  const time = date.getUTCHours() << 11 | date.getUTCMinutes() << 5 | Math.floor(date.getUTCSeconds() / 2)
  const day = year - 1980 << 9 | (date.getUTCMonth() + 1) << 5 | date.getUTCDate()
  return { time, day }
}

function uint16(value) {
  const buffer = Buffer.alloc(2)
  buffer.writeUInt16LE(value)
  return buffer
}

function uint32(value) {
  const buffer = Buffer.alloc(4)
  buffer.writeUInt32LE(value >>> 0)
  return buffer
}

async function listFiles(dir, root=dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.name === '.dist' || entry.name === 'node_modules') continue

    if (entry.isDirectory()) {
      const children = await listFiles(path, root)
      if (!children.length) files.push(`${relative(root, path).replaceAll('\\', '/')}/`)
      files.push(...children)
    } else if (entry.isFile()) {
      files.push(relative(root, path).replaceAll('\\', '/'))
    }
  }

  return files.sort()
}

async function createZip(template) {
  const source = join(ROOT, template)
  const files = await listFiles(source)
  const { time, day } = dosDateTime()
  const chunks = []
  const central = []
  let offset = 0

  for (const file of files) {
    const name = `${template}/${file}`
    const nameBuffer = Buffer.from(name)
    const isDirectory = file.endsWith('/')
    const data = isDirectory ? Buffer.alloc(0) : Buffer.from(await Bun.file(join(source, file)).arrayBuffer())
    const crc = crc32(data)
    const externalAttributes = isDirectory ? DOS_DIRECTORY_ATTRIBUTE : 0

    const localHeader = Buffer.concat([
      uint32(0x04034b50), uint16(20), uint16(UTF8_FLAG), uint16(0), uint16(time), uint16(day),
      uint32(crc), uint32(data.length), uint32(data.length), uint16(nameBuffer.length), uint16(0), nameBuffer
    ])

    const centralHeader = Buffer.concat([
      uint32(0x02014b50), uint16(20), uint16(20), uint16(UTF8_FLAG), uint16(0), uint16(time), uint16(day),
      uint32(crc), uint32(data.length), uint32(data.length), uint16(nameBuffer.length), uint16(0), uint16(0),
      uint16(0), uint16(0), uint32(externalAttributes), uint32(offset), nameBuffer
    ])

    chunks.push(localHeader, data)
    central.push(centralHeader)
    offset += localHeader.length + data.length
  }

  const centralStart = offset
  const centralBuffer = Buffer.concat(central)
  const end = Buffer.concat([
    uint32(0x06054b50), uint16(0), uint16(0), uint16(files.length), uint16(files.length),
    uint32(centralBuffer.length), uint32(centralStart), uint16(0)
  ])

  await Bun.write(join(ROOT, `${template}.zip`), Buffer.concat([...chunks, centralBuffer, end]))
  console.log(`Created packages/templates/${template}.zip (${files.length} files)`)
}

for (const template of TEMPLATES) {
  if (!(await stat(join(ROOT, template))).isDirectory()) throw new Error(`Missing template directory: ${template}`)
  await createZip(template)
}