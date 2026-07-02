/**
 * 下载 78 张 Rider-Waite 塔罗牌图片到 public/card-images/
 * 用法: npm run download:cards
 */
import { mkdir, writeFile, access } from 'node:fs/promises'
import { join } from 'node:path'
import { getAllImagePaths } from '@cometpisces/tarot-kit-images'

const CDN_BASE = 'https://cdn.jsdelivr.net/npm/@cometpisces/tarot-kit-images@0.2.0/images'
const OUT_DIR = join(process.cwd(), 'public', 'card-images')

async function fileExists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function downloadFile(filename) {
  const url = `${CDN_BASE}/${filename}`
  const outPath = join(OUT_DIR, filename)

  if (await fileExists(outPath)) {
    console.log(`跳过（已存在）: ${filename}`)
    return
  }

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`下载失败 ${filename}: ${res.status}`)
  }

  const buffer = Buffer.from(await res.arrayBuffer())
  await writeFile(outPath, buffer)
  console.log(`已下载: ${filename}`)
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const files = getAllImagePaths()
  console.log(`开始下载 ${files.length} 张牌图到 ${OUT_DIR}\n`)

  let ok = 0
  let fail = 0

  for (const file of files) {
    try {
      await downloadFile(file)
      ok++
    } catch (err) {
      fail++
      console.error(err instanceof Error ? err.message : err)
    }
  }

  console.log(`\n完成: 成功 ${ok}，失败 ${fail}`)
  if (fail > 0) process.exit(1)
}

main()
