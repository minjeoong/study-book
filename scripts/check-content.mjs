// 노트 형식 검사: node scripts/check-content.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import yaml from 'js-yaml'

const root = 'content'
let errors = 0
const fail = (file, msg) => {
  errors++
  console.error(`✗ ${file}: ${msg}`)
}
const slugs = new Set()
const notes = []

for (const course of readdirSync(root)) {
  for (const name of readdirSync(join(root, course))) {
    if (!name.endsWith('.md')) continue
    const file = join(root, course, name)
    const raw = readFileSync(file, 'utf8')
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!m) {
      fail(file, 'frontmatter 없음')
      continue
    }
    let data
    try {
      data = yaml.load(m[1])
    } catch (e) {
      fail(file, 'YAML 오류 ' + e.message.split('\n')[0])
      continue
    }
    const slug = name.replace(/\.md$/, '')
    if (slug === 'index') {
      for (const mat of data.materials ?? []) {
        if (!existsSync(join('public/materials', course, mat.file))) fail(file, `자료 파일 없음: ${mat.file}`)
      }
      continue
    }
    slugs.add(`${course}/${slug}`)
    notes.push({ file, course, data })
    if (!data.title) fail(file, 'title 없음')
    if (!data.summary) fail(file, 'summary 없음')
    if (!Array.isArray(data.keypoints) || data.keypoints.length !== 3) fail(file, 'keypoints 는 3개')
    if (!Array.isArray(data.qa) || data.qa.length < 1) fail(file, 'qa 1개 이상')
  }
}

for (const { file, course, data } of notes) {
  for (const ref of data.related ?? []) {
    const key = ref.includes('/') ? ref : `${course}/${ref}`
    if (!slugs.has(key)) console.warn(`△ ${file}: related '${ref}' 를 찾을 수 없음 (아직 없는 노트면 무시됨)`)
  }
}

console.log(`${notes.length}개 개념 노트 검사, 오류 ${errors}개`)
process.exit(errors ? 1 : 0)
