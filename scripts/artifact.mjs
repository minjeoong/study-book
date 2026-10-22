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

// 숫자·코드 서체(Archivo, 약 210KB)는 단일 파일 안에 data URI 로 넣어 어떤 환경에서도 바로 보이게 한다.
// 본문 서체(Pretendard, 3MB)는 함께 게시하는 파일에서 읽는다.
const archivoCss = readFileSync('dist/fonts/archivo/archivo.css', 'utf8').replace(
  /url\(\.\/(archivo-[a-z-]+\.woff2)\)/g,
  (_, f) => `url(data:font/woff2;base64,${readFileSync(`dist/fonts/archivo/${f}`).toString('base64')})`,
)
const headInlined = rest.replace(/<link rel="stylesheet" href="\.\/fonts\/archivo\/archivo\.css" \/>/, `<style>${archivoCss}</style>`)

rmSync('dist-artifact', { recursive: true, force: true })
mkdirSync('dist-artifact')
writeFileSync('dist-artifact/index.html', `${title}\n${headInlined.trim()}\n${body.trim()}\n`)
cpSync('dist/materials', 'dist-artifact/materials', { recursive: true })
cpSync('dist/fonts', 'dist-artifact/fonts', { recursive: true })
console.log('dist-artifact/index.html 작성 완료')
