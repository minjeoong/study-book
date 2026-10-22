import { useMemo, useState } from 'react'
import type { Course } from '../data/schedule'
import { TRACKS } from '../data/schedule'
import { renderInline, renderMarkdown } from '../lib/markdown'
import type { Material, MaterialType, QA } from '../lib/content'
import { md } from '../lib/dates'
import { Icon, type IconName } from './Icon'

export function Markdown({ source, className = 'prose' }: { source: string; className?: string }) {
  const html = useMemo(() => renderMarkdown(source), [source])
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

export function Inline({ text }: { text: string }) {
  const html = useMemo(() => renderInline(text), [text])
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

export function Importance({ level }: { level: 1 | 2 | 3 }) {
  const label = ['', '참고', '알아두기', '자주 나옴'][level]
  return (
    <span className="imp" data-level={level} title={`면접 빈출도: ${label}`} aria-label={`면접 빈출도 ${label}`}>
      <i />
      <i />
      <i />
    </span>
  )
}

export function TrackChip({ course }: { course: Course }) {
  const t = TRACKS.find((x) => x.id === course.track)
  return (
    <span className="chip chip--track" data-track={course.track}>
      {t?.name}
    </span>
  )
}

export function QAItem({
  qa,
  index,
  context,
  defaultOpen = false,
}: {
  qa: QA
  index?: number
  context?: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="qa" data-open={open}>
      <button className="qa__q" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="qa__badge">Q{index != null ? index + 1 : ''}</span>
        <span>
          <Inline text={qa.q} />
        </span>
        <span className="qa__toggle">{open ? '답 접기' : '답 보기'}</span>
      </button>
      <div className="qa__a">
        <div>
          {context && <span className="qa__ctx">{context}</span>}
          <p>
            <Inline text={qa.a} />
          </p>
        </div>
      </div>
    </div>
  )
}

const MAT_ICON: Record<MaterialType, IconName> = { slides: 'slides', notebook: 'notebook', lab: 'lab', etc: 'file' }
export const MAT_LABEL: Record<MaterialType, string> = { slides: '슬라이드', notebook: '노트북', lab: '실습', etc: '자료' }

export function MaterialLink({ m }: { m: Material }) {
  const ext = m.file.split('.').pop()?.toUpperCase()
  return (
    <a className="mat" href={`#/m/${m.course}/${encodeURIComponent(m.file)}`}>
      <span className="mat__icon">
        <Icon name={MAT_ICON[m.type] ?? 'file'} />
      </span>
      <span>
        <span className="mat__title">{m.title}</span>
        <br />
        <span className="mat__meta num">
          {MAT_LABEL[m.type] ?? '자료'} · {ext}
          {m.date ? ` · ${md(m.date)}` : ''}
        </span>
      </span>
    </a>
  )
}
