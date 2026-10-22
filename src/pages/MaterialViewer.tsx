import { useEffect, useMemo, useRef, useState } from 'react'
import hljs from 'highlight.js/lib/core'
import { courseById, courseHref, noteOf, type Material } from '../lib/content'
import { loadScript } from '../lib/loadScript'
import { renderMarkdown } from '../lib/markdown'
import { md } from '../lib/dates'
import { Code, MAT_LABEL } from '../components/Bits'
import { NotFound } from './NotFound'

const REPO_BLOB = 'https://github.com/minjeoong/study-book/blob/HEAD/public/'
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/'
const JSZIP = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'

export function MaterialViewer({ course: courseId, file, page }: { course: string; file: string; page?: number }) {
  const course = courseById(courseId)
  const note = noteOf(courseId)
  const mat = note?.materials.find((m) => m.file === file)
  if (!course || !mat) return <NotFound />
  const ext = file.split('.').pop()?.toLowerCase()
  const others = note!.materials.filter((m) => m !== mat)

  return (
    <>
      <header className="viewer-head">
        <div>
          <h1 className="title title--md">{mat.title}</h1>
          <p className="meta num">
            <span>
              <b>{MAT_LABEL[mat.type] ?? '자료'}</b>
            </span>
            {mat.date && (
              <span>
                <b>{md(mat.date)}</b> 수업
              </span>
            )}
            <span>
              <Code course={course} /> <a className="station-times__link" href={courseHref(course.id)}>{course.title}</a>
            </span>
            <span>{file}</span>
          </p>
        </div>
        <a className="btn btn--line btn--sm" href={REPO_BLOB + mat.url} target="_blank" rel="noreferrer">
          GitHub에서 원본 보기
        </a>
      </header>

      {ext === 'ipynb' && <NotebookView m={mat} />}
      {ext === 'pdf' && <PdfView m={mat} startPage={page} />}
      {ext === 'zip' && <ZipView m={mat} />}

      {others.length > 0 && (
        <section className="sec" aria-labelledby="other-mats">
          <div className="sec__head">
            <h2 className="sec__title" id="other-mats">
              이 역의 다른 자료
            </h2>
          </div>
          <div className="tags">
            {others.map((o) => (
              <a key={o.file} className="tag" href={materialHref(o)}>
                {o.title}
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

export function materialHref(m: Material, page?: number) {
  return `#/m/${m.course}/${encodeURIComponent(m.file)}${page ? `?p=${page}` : ''}`
}

function useFetch<T>(url: string, as: 'json' | 'blob') {
  const [state, setState] = useState<{ data?: T; error?: string }>({})
  useEffect(() => {
    let alive = true
    setState({})
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`)
        return as === 'json' ? r.json() : r.arrayBuffer()
      })
      .then((data) => alive && setState({ data: data as T }))
      .catch((e) => alive && setState({ error: String(e.message ?? e) }))
    return () => {
      alive = false
    }
  }, [url, as])
  return state
}

function LoadError({ m, what }: { m: Material; what: string }) {
  return (
    <div className="notice" role="alert">
      <h2>{what}을 불러오지 못했어요</h2>
      <p>
        이 화면에서 파일을 읽지 못했어요. GitHub 저장소에 원본이 그대로 있으니{' '}
        <a className="source__link" href={REPO_BLOB + m.url} target="_blank" rel="noreferrer">
          GitHub에서 열어 보세요
        </a>
        .
      </p>
    </div>
  )
}

/* ---------- 노트북 ---------- */

interface NbCell {
  cell_type: 'markdown' | 'code' | 'raw'
  source: string | string[]
  execution_count?: number | null
  outputs?: NbOutput[]
}
interface NbOutput {
  output_type: string
  text?: string | string[]
  data?: Record<string, string | string[]>
  ename?: string
  evalue?: string
}

const join = (s: string | string[] | undefined) => (Array.isArray(s) ? s.join('') : (s ?? ''))

/** 노트북 출력의 HTML 표(pandas)만 남기고 스크립트·이벤트 속성은 걷어낸다 */
function safeTable(html: string): string | null {
  if (!/<table/i.test(html)) return null
  return html
    .replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
}

function Output({ o }: { o: NbOutput }) {
  if (o.output_type === 'stream') return <pre className="nb-out">{join(o.text)}</pre>
  if (o.output_type === 'error') return <pre className="nb-out nb-out--err">{`${o.ename}: ${o.evalue}`}</pre>
  const d = o.data ?? {}
  if (d['image/png']) return <img className="nb-img" alt="노트북 출력 그림" src={`data:image/png;base64,${join(d['image/png']).trim()}`} />
  if (d['image/jpeg']) return <img className="nb-img" alt="노트북 출력 그림" src={`data:image/jpeg;base64,${join(d['image/jpeg']).trim()}`} />
  const table = d['text/html'] ? safeTable(join(d['text/html'])) : null
  if (table) return <div className="nb-table" dangerouslySetInnerHTML={{ __html: table }} />
  if (d['text/plain']) return <pre className="nb-out">{join(d['text/plain'])}</pre>
  return null
}

function CodeCell({ cell }: { cell: NbCell }) {
  const src = join(cell.source)
  const html = useMemo(() => hljs.highlight(src, { language: 'python' }).value, [src])
  const outs = (cell.outputs ?? []).slice(0, 6)
  return (
    <div className="nb-cell nb-cell--code">
      <span className="nb-count num">[{cell.execution_count ?? ' '}]</span>
      <div className="nb-body">
        <div className="code">
          <pre>
            <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
          </pre>
        </div>
        {outs.map((o, i) => (
          <Output key={i} o={o} />
        ))}
      </div>
    </div>
  )
}

function MarkdownCell({ cell }: { cell: NbCell }) {
  const html = useMemo(() => renderMarkdown(join(cell.source)), [cell])
  return <div className="nb-cell prose nb-md" dangerouslySetInnerHTML={{ __html: html }} />
}

function NotebookView({ m }: { m: Material }) {
  const { data, error } = useFetch<{ cells: NbCell[] }>(m.url, 'json')
  const [hideOut, setHideOut] = useState(false)
  if (error) return <LoadError m={m} what="노트북" />
  if (!data) return <p className="viewer-loading">노트북을 여는 중…</p>
  const cells = data.cells.filter((c) => join(c.source).trim())
  const codeCount = cells.filter((c) => c.cell_type === 'code').length
  return (
    <div className="nb" data-hide-out={hideOut}>
      <div className="toolbar" style={{ marginTop: 0 }}>
        <span className="toolbar__count num" style={{ marginLeft: 0 }}>
          셀 {cells.length}개 · 코드 {codeCount}개
        </span>
        <div className="seg" role="group" aria-label="출력 보기">
          <button aria-pressed={!hideOut} onClick={() => setHideOut(false)}>
            출력 보기
          </button>
          <button aria-pressed={hideOut} onClick={() => setHideOut(true)}>
            코드만
          </button>
        </div>
      </div>
      {cells.map((c, i) => (c.cell_type === 'code' ? <CodeCell key={i} cell={c} /> : <MarkdownCell key={i} cell={c} />))}
    </div>
  )
}

/* ---------- PDF 슬라이드 ---------- */

// pdf.js 와 JSZip 은 cdnjs UMD 전역으로 쓴다 (타입 패키지 없이)
type Pdf = any // eslint-disable-line
declare global {
  interface Window {
    pdfjsLib?: Pdf
    JSZip?: Pdf
  }
}

function PdfView({ m, startPage }: { m: Material; startPage?: number }) {
  const [doc, setDoc] = useState<Pdf>(null)
  const [error, setError] = useState<string>()
  const [jump, setJump] = useState('')
  const list = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let alive = true
    let task: Pdf
    ;(async () => {
      // 워커를 메인 스레드에서 돌린다 (Artifact 는 다른 출처의 워커를 막는다)
      await loadScript(PDFJS + 'pdf.min.js')
      await loadScript(PDFJS + 'pdf.worker.min.js')
      const lib = window.pdfjsLib
      lib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'
      task = lib.getDocument({ url: m.url, isEvalSupported: false })
      const d = await task.promise
      if (alive) setDoc(d)
    })().catch((e) => alive && setError(String(e?.message ?? e)))
    return () => {
      alive = false
      task?.destroy?.()
    }
  }, [m.url])

  useEffect(() => {
    if (doc && startPage) {
      requestAnimationFrame(() => document.getElementById(`pdf-p${startPage}`)?.scrollIntoView({ block: 'start' }))
    }
  }, [doc, startPage])

  if (error) return <LoadError m={m} what="슬라이드" />
  if (!doc) return <p className="viewer-loading">슬라이드를 여는 중… (처음에는 몇 초 걸려요)</p>

  const go = (e: React.FormEvent) => {
    e.preventDefault()
    const n = Math.min(Math.max(parseInt(jump, 10) || 1, 1), doc.numPages)
    document.getElementById(`pdf-p${n}`)?.scrollIntoView({ block: 'start' })
  }

  return (
    <div className="pdf">
      <form className="toolbar" style={{ marginTop: 0 }} onSubmit={go}>
        <span className="toolbar__count num" style={{ marginLeft: 0 }}>
          총 {doc.numPages}쪽
        </span>
        <label className="pdf-jump">
          <span>쪽 이동</span>
          <input
            id="pdf-jump"
            type="number"
            inputMode="numeric"
            min={1}
            max={doc.numPages}
            value={jump}
            onChange={(e) => setJump(e.target.value)}
            placeholder={String(startPage ?? 1)}
          />
        </label>
        <button className="btn btn--ghost" type="submit">
          이동
        </button>
      </form>
      <div className="pdf-pages" ref={list}>
        {Array.from({ length: doc.numPages }, (_, i) => (
          <PdfPage key={i} doc={doc} n={i + 1} eager={startPage ? Math.abs(startPage - (i + 1)) < 3 : i < 3} />
        ))}
      </div>
    </div>
  )
}

function PdfPage({ doc, n, eager }: { doc: Pdf; n: number; eager: boolean }) {
 
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(eager)
  const [ratio, setRatio] = useState(540 / 780)

  useEffect(() => {
    if (visible || !wrap.current) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '800px 0px' },
    )
    io.observe(wrap.current)
    return () => io.disconnect()
  }, [visible])

  useEffect(() => {
    if (!visible) return
    let cancelled = false
    let task: Pdf
    doc.getPage(n).then((page: Pdf) => {
     
      if (cancelled || !canvas.current || !wrap.current) return
      const base = page.getViewport({ scale: 1 })
      setRatio(base.height / base.width)
      const width = wrap.current.clientWidth
      const scale = (width / base.width) * Math.min(window.devicePixelRatio || 1, 2)
      const vp = page.getViewport({ scale })
      const c = canvas.current
      c.width = vp.width
      c.height = vp.height
      task = page.render({ canvasContext: c.getContext('2d'), viewport: vp })
    })
    return () => {
      cancelled = true
      task?.cancel?.()
    }
  }, [visible, doc, n])

  return (
    <figure className="pdf-page" id={`pdf-p${n}`} ref={wrap}>
      <div className="pdf-page__sheet" style={{ aspectRatio: `1 / ${ratio}` }}>
        <canvas ref={canvas} aria-label={`${n}쪽`} />
      </div>
      <figcaption className="num">p.{n}</figcaption>
    </figure>
  )
}

/* ---------- 실습 zip ---------- */

const ZIP_LANG: Record<string, string> = { html: 'xml', vue: 'xml', js: 'javascript', ts: 'typescript', py: 'python', md: 'markdown' }
const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function ZipView({ m }: { m: Material }) {
  const [files, setFiles] = useState<{ name: string; text: string }[]>()
  const [error, setError] = useState<string>()
  useEffect(() => {
    let alive = true
    ;(async () => {
      const r = await fetch(m.url)
      if (!r.ok) throw new Error(String(r.status))
      const buf = await r.arrayBuffer()
      await loadScript(JSZIP)
      const zip = await window.JSZip.loadAsync(buf)
      const out: { name: string; text: string }[] = []
      for (const name of Object.keys(zip.files).sort()) {
        const f = zip.files[name]
        if (f.dir || /(^|\/)(__MACOSX|\.DS_Store)/.test(name)) continue
        if (!/\.(html|css|js|ts|json|md|txt|py|java|vue)$/i.test(name)) continue
        out.push({ name, text: await f.async('string') })
      }
      if (alive) setFiles(out)
    })().catch((e) => alive && setError(String(e?.message ?? e)))
    return () => {
      alive = false
    }
  }, [m.url])

  if (error) return <LoadError m={m} what="실습 파일" />
  if (!files) return <p className="viewer-loading">압축 파일을 여는 중…</p>
  return (
    <div className="zip">
      {files.map((f) => {
        const ext = f.name.split('.').pop()!.toLowerCase()
        const lang = ZIP_LANG[ext] ?? ext
        const html = hljs.getLanguage(lang) ? hljs.highlight(f.text, { language: lang }).value : escapeHtml(f.text)
        return (
          <section key={f.name} className="sec" style={{ marginTop: 36 }}>
            <div className="sec__head">
              <h2 className="sec__title">{f.name}</h2>
            </div>
            <div className="code">
              <pre>
                <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
              </pre>
            </div>
          </section>
        )
      })}
    </div>
  )
}
