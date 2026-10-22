import { Marked, type Tokens } from 'marked'
import hljs from 'highlight.js/lib/core'
import python from 'highlight.js/lib/languages/python'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import java from 'highlight.js/lib/languages/java'
import bash from 'highlight.js/lib/languages/bash'
import yamlLang from 'highlight.js/lib/languages/yaml'
import sql from 'highlight.js/lib/languages/sql'
import json from 'highlight.js/lib/languages/json'
import dockerfile from 'highlight.js/lib/languages/dockerfile'

hljs.registerLanguage('python', python)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('java', java)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('yaml', yamlLang)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('json', json)
hljs.registerLanguage('dockerfile', dockerfile)

const LANG_ALIAS: Record<string, string> = {
  py: 'python',
  js: 'javascript',
  ts: 'typescript',
  html: 'xml',
  vue: 'xml',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** `a`코드`` 처럼 블록 안에서도 인라인 코드만 살린다 */
const inline = (s: string) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>')

function splitPair(line: string): [string, string] {
  const i = line.indexOf('::')
  if (i < 0) return [line.trim(), '']
  return [line.slice(0, i).trim(), line.slice(i + 2).trim()]
}

const lines = (text: string) =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

function renderFlow(text: string): string {
  const items = lines(text).map(splitPair)
  const lis = items
    .map(
      ([t, d]) =>
        `<li class="v-flow__step"><span class="v-flow__t">${inline(t)}</span>${d ? `<span class="v-flow__d">${inline(d)}</span>` : ''}</li>`,
    )
    .join('')
  // 5단계 이상은 좁은 칸에서 세로로 세운다
  const cls = items.length >= 5 ? 'v-block v-flow v-flow--long' : 'v-block v-flow'
  return `<figure class="${cls}"><ol>${lis}</ol></figure>`
}

function renderLayers(text: string): string {
  const items = lines(text).map(splitPair)
  const rows = items
    .map(
      ([t, d], i) =>
        `<div class="v-layers__row" style="--i:${i};--n:${items.length}"><span class="v-layers__t">${inline(t)}</span><span class="v-layers__d">${inline(d)}</span></div>`,
    )
    .join('')
  return `<figure class="v-block v-layers">${rows}</figure>`
}

function renderCompare(text: string): string {
  const [head, ...rows] = lines(text).map((l) => l.split('|').map((c) => c.trim()))
  if (!head) return ''
  const th = `<tr><td class="v-compare__corner"></td>${head.map((h) => `<th scope="col">${inline(h)}</th>`).join('')}</tr>`
  const trs = rows
    .map(
      ([label, ...vals]) =>
        `<tr><th scope="row">${inline(label ?? '')}</th>${vals.map((v, i) => `<td data-col="${esc(head[i] ?? '')}">${inline(v)}</td>`).join('')}</tr>`,
    )
    .join('')
  return `<figure class="v-block v-compare" style="--cols:${head.length}"><div class="v-compare__scroll"><table><thead>${th}</thead><tbody>${trs}</tbody></table></div></figure>`
}

function renderFormula(text: string): string {
  const rows = lines(text)
    .map(splitPair)
    .map(
      ([eq, m]) =>
        `<div class="v-formula__row"><div class="v-formula__eq">${esc(eq)}</div>${m ? `<div class="v-formula__m">${inline(m)}</div>` : ''}</div>`,
    )
    .join('')
  return `<figure class="v-block v-formula">${rows}</figure>`
}

const CALLOUT: Record<string, string> = { tip: '팁', warn: '주의', note: '메모', interview: '면접 포인트' }

const marked = new Marked({ gfm: true, breaks: false })

marked.use({
  renderer: {
    code({ text, lang }: Tokens.Code) {
      const l = (lang ?? '').trim().split(/\s+/)[0].toLowerCase()
      if (l === 'flow') return renderFlow(text)
      if (l === 'layers') return renderLayers(text)
      if (l === 'compare') return renderCompare(text)
      if (l === 'formula') return renderFormula(text)
      const name = LANG_ALIAS[l] ?? l
      const html = name && hljs.getLanguage(name) ? hljs.highlight(text, { language: name }).value : esc(text)
      const label = l ? `<span class="code__lang">${esc(l)}</span>` : ''
      return `<div class="code">${label}<pre><code class="hljs">${html}</code></pre></div>`
    },
    table(token: Tokens.Table) {
      const head = token.header.map((c) => `<th>${this.parser.parseInline(c.tokens)}</th>`).join('')
      const body = token.rows
        .map((r) => `<tr>${r.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`)
        .join('')
      return `<div class="table-scroll"><table class="md-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`
    },
    blockquote({ tokens }: Tokens.Blockquote) {
      const inner = this.parser.parse(tokens)
      const m = inner.match(/^<p>\[!(\w+)\]\s*([^\n<]*)/)
      if (m) {
        const kind = m[1].toLowerCase()
        const title = m[2].trim() || CALLOUT[kind] || kind
        const rest = inner.replace(/^<p>\[!\w+\][^\n<]*\n?/, '<p>').replace(/^<p><\/p>/, '')
        return `<aside class="callout callout--${esc(kind)}"><p class="callout__title">${esc(title)}</p>${rest}</aside>`
      }
      return `<blockquote>${inner}</blockquote>`
    },
    link({ href, title, tokens }: Tokens.Link) {
      const text = this.parser.parseInline(tokens)
      const external = /^https?:/.test(href)
      return `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ''}${external ? ' target="_blank" rel="noreferrer"' : ''}>${text}</a>`
    },
  },
})

export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string
}

export function renderInline(md: string): string {
  return marked.parseInline(md, { async: false }) as string
}
