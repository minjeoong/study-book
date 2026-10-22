// claude.ai Artifact 용 변환: node scripts/artifact.mjs
// Artifact 는 게시할 때 <!doctype>/<html>/<head>/<body> 껍데기를 직접 씌우므로
// dist/index.html 에서 그 태그만 걷어내 dist-artifact/index.html 로 쓴다.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

const html = readFileSync('dist/index.html', 'utf8')
const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? ''
const body = html.match(/<body>([\s\S]*?)<\/body>/i)?.[1] ?? ''

// 제목을 맨 앞(첫 8KB 안)에 두고, 기본 charset/viewport 메타는 껍데기가 넣으므로 뺀다
const title = head.match(/<title>[\s\S]*?<\/title>/i)?.[0] ?? '<title>SKALA 개념 노트</title>'
const rest = head
  .replace(/<title>[\s\S]*?<\/title>/i, '')
  .replace(/<meta charset[^>]*>/i, '')
  .replace(/<meta name="viewport"[^>]*>/i, '')

rmSync('dist-artifact', { recursive: true, force: true })
mkdirSync('dist-artifact')
writeFileSync('dist-artifact/index.html', `${title}\n${rest.trim()}\n${body.trim()}\n`)
cpSync('dist/materials', 'dist-artifact/materials', { recursive: true })
console.log('dist-artifact/index.html 작성 완료')
