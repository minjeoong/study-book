import { useMemo, useState } from 'react'
import type { Course } from '../data/schedule'
import { renderInline, renderMarkdown } from '../lib/markdown'
import { hasNotes, type Material, type MaterialType, type QA } from '../lib/content'
import { courseStatus, md, todayISO, type CourseStatus } from '../lib/dates'
import { LINE_NAME, stationCode } from '../lib/stations'
import { Icon, type IconName } from './Icon'

export function Markdown({ source, className = 'prose' }: { source: string; className?: string }) {
  const html = useMemo(() => renderMarkdown(source), [source])
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

export function Inline({ text }: { text: string }) {
  const html = useMemo(() => renderInline(text), [text])
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

/** 상태 표식: ● 지남 · ◉ 운행 중 · ○ 예정 */
export type Mark = 'done' | 'today' | 'next'
export function markOf(s: CourseStatus): Mark {
  return s === 'today' ? 'today' : s === 'done' || s === 'ongoing' ? 'done' : 'next'
}
export const MARK_LABEL: Record<Mark, string> = { done: '지남', today: '운행 중', next: '예정' }

export function StatusMark({ s, label = false }: { s: Mark; label?: boolean }) {
  return (
    <>
      <i className="mark" data-s={s} aria-hidden={label ? true : undefined} title={MARK_LABEL[s]} />
      {label ? MARK_LABEL[s] : <span className="sr-only">{MARK_LABEL[s]}</span>}
    </>
  )
}

/** 역 코드 배지: 노선 문자 + 번호 (A02) */
export function Code({ course, size }: { course: Course; size?: 'lg' }) {
  const status = courseStatus(course, todayISO())
  return (
    <span
      className={size === 'lg' ? 'stn stn--lg' : 'stn'}
      data-state={status === 'today' ? 'today' : undefined}
      data-empty={!hasNotes(course.id) && status !== 'today' ? true : undefined}
      title={`${LINE_NAME[course.track]} ${stationCode(course.id)}`}
    >
      {stationCode(course.id)}
    </span>
  )
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
        <span className="qa__no">Q{index != null ? index + 1 : ''}</span>
        <span>
          <Inline text={qa.q} />
        </span>
        <span className="qa__toggle">{open ? '접기' : '답 보기'}</span>
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
    <a href={`#/m/${m.course}/${encodeURIComponent(m.file)}`}>
      <Icon name={MAT_ICON[m.type] ?? 'file'} />
      <span>
        <span className="mats__t">{m.title}</span>
        <span className="mats__m num">
          {MAT_LABEL[m.type] ?? '자료'} · {ext}
          {m.date ? ` · ${md(m.date)}` : ''}
        </span>
      </span>
    </a>
  )
}
