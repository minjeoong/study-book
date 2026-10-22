import { useEffect, useMemo, useRef, useState } from 'react'
import { COURSES } from '../data/schedule'
import { go } from '../lib/router'
import { search, type HitKind } from '../lib/search'
import { Code } from './Bits'
import { Icon } from './Icon'

const GROUP: Record<HitKind, string> = { concept: '개념', course: '역 (과목)', question: '면접 질문' }
const SUGGEST = ['어텐션', '표준편차', 'Few-shot', '이벤트 위임', 'p-value', 'RLHF']

function highlight(text: string, q: string) {
  const t = q.trim()
  if (!t) return text
  const i = text.toLowerCase().indexOf(t.toLowerCase())
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + t.length)}</mark>
      {text.slice(i + t.length)}
    </>
  )
}

// 키보드로 하루에도 수십 번 여는 창이라 열고 닫을 때 애니메이션을 넣지 않는다
export function SearchDialog({ open, initial = '', onClose }: { open: boolean; initial?: string; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const hits = useMemo(() => search(q, 24), [q])

  useEffect(() => {
    if (open) {
      setQ(initial)
      setSel(0)
      requestAnimationFrame(() => input.current?.select())
    }
  }, [open, initial])

  useEffect(() => setSel(0), [q])

  useEffect(() => {
    body.current?.querySelector(`[data-i="${sel}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [sel])

  if (!open) return null

  const choose = (href: string) => {
    onClose()
    go(href)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSel((s) => Math.min(s + 1, hits.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSel((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter' && hits[sel]) {
      choose(hits[sel].item.href)
    }
  }

  let lastKind: HitKind | null = null

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label="역·개념·질문 찾기" onKeyDown={onKey}>
        <label className="dialog__input">
          <Icon name="search" />
          <span className="sr-only">개념, 과목, 면접 질문 검색</span>
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="개념·과목·질문 (초성도 돼요: ㅇㅌㅅ)"
            autoComplete="off"
            spellCheck={false}
            role="combobox"
            aria-expanded={hits.length > 0}
            aria-controls="search-results"
            aria-activedescendant={hits[sel] ? `hit-${sel}` : undefined}
          />
          <button className="mast__icon" onClick={onClose} aria-label="닫기">
            <Icon name="close" />
          </button>
        </label>
        <div className="dialog__body" ref={body} id="search-results" role="listbox">
          {!q.trim() && (
            <div className="dialog__empty">
              <p>찾고 싶은 개념을 입력하세요. 과목 이름, 영어 표기, 초성으로도 찾을 수 있어요.</p>
              <div className="tags" style={{ marginTop: 14 }}>
                {SUGGEST.map((s) => (
                  <button key={s} className="tag" onClick={() => setQ(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {q.trim() && hits.length === 0 && (
            <div className="dialog__empty">
              <p>‘{q}’에 맞는 노트가 없어요. 아직 자료가 올라오지 않은 과목일 수 있어요.</p>
            </div>
          )}
          {hits.map((h, i) => {
            const course = COURSES.find((c) => c.id === h.item.courseId)
            const header = h.item.kind !== lastKind ? GROUP[h.item.kind] : null
            lastKind = h.item.kind
            return (
              <div key={h.item.href + i}>
                {header && <p className="dialog__group">{header}</p>}
                <a
                  id={`hit-${i}`}
                  data-i={i}
                  className="hit"
                  role="option"
                  aria-selected={i === sel}
                  href={h.item.href}
                  onMouseMove={() => setSel(i)}
                  onClick={(e) => {
                    e.preventDefault()
                    choose(h.item.href)
                  }}
                >
                  {course && <Code course={course} />}
                  <span className="hit__title">{highlight(h.item.title, q)}</span>
                  <span className="hit__sub">{h.item.kind === 'course' ? h.item.sub : `${course?.title} · ${h.item.sub}`}</span>
                </a>
              </div>
            )
          })}
        </div>
        <div className="dialog__foot">
          <span>↑↓ 이동</span>
          <span>Enter 열기</span>
          <span>Esc 닫기</span>
        </div>
      </div>
    </div>
  )
}
