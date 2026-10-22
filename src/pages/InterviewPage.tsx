import { useCallback, useEffect, useMemo, useState } from 'react'
import { COURSES } from '../data/schedule'
import { ALL_QA, conceptHref, courseHref } from '../lib/content'
import { Code, Inline, QAItem } from '../components/Bits'
import { Icon } from '../components/Icon'

const KNOWN_KEY = 'skala-notes:known'

function loadKnown(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KNOWN_KEY) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

function saveKnown(s: Set<string>) {
  try {
    localStorage.setItem(KNOWN_KEY, JSON.stringify([...s]))
  } catch {
    /* 저장이 막힌 환경에서는 이번 방문 동안만 기억한다 */
  }
}

type Mode = 'list' | 'cards'
type Level = 'all' | '3' | 'unknown'

export function InterviewPage({ initialCourse }: { initialCourse?: string }) {
  const [mode, setMode] = useState<Mode>('cards')
  const [course, setCourse] = useState(initialCourse ?? 'all')
  const [level, setLevel] = useState<Level>('all')
  const [known, setKnown] = useState(loadKnown)

  useEffect(() => setCourse(initialCourse ?? 'all'), [initialCourse])

  const coursesWithQA = COURSES.filter((c) => ALL_QA.some((x) => x.concept.course === c.id))
  const filtered = useMemo(
    () =>
      ALL_QA.filter(
        (x) =>
          (course === 'all' || x.concept.course === course) &&
          (level !== '3' || x.concept.importance === 3) &&
          (level !== 'unknown' || !known.has(x.key)),
      ),
    [course, level, known],
  )

  const toggleKnown = useCallback((key: string, value: boolean) => {
    setKnown((prev) => {
      const s = new Set(prev)
      if (value) s.add(key)
      else s.delete(key)
      saveKnown(s)
      return s
    })
  }, [])

  const knownInView = filtered.filter((x) => known.has(x.key)).length

  return (
    <>
      <h1 className="title">면접 질문</h1>
      <p className="lede num">
        수업 노트에서 뽑은 질문 {ALL_QA.length}개. 승차권 한 장에 질문 하나, 답을 먼저 소리 내어 말해 보고 확인하세요. 지금까지 안다고 표시한 질문은 {known.size}개예요.
      </p>

      <div className="toolbar">
        <div className="seg" role="group" aria-label="보기 방식">
          <button aria-pressed={mode === 'cards'} onClick={() => setMode('cards')}>
            카드
          </button>
          <button aria-pressed={mode === 'list'} onClick={() => setMode('list')}>
            목록
          </button>
        </div>
        <label>
          <span className="sr-only">과목</span>
          <select className="select" value={course} onChange={(e) => setCourse(e.target.value)}>
            <option value="all">모든 과목</option>
            {coursesWithQA.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <div className="seg" role="group" aria-label="질문 범위">
          <button aria-pressed={level === 'all'} onClick={() => setLevel('all')}>
            전체
          </button>
          <button aria-pressed={level === '3'} onClick={() => setLevel('3')}>
            자주 나옴
          </button>
          <button aria-pressed={level === 'unknown'} onClick={() => setLevel('unknown')}>
            아직 모름
          </button>
        </div>
        <span className="toolbar__count num">
          {filtered.length}개 중 {knownInView}개 앎
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="empty" style={{ marginTop: 28 }}>
          {level === 'unknown' ? '이 범위의 질문은 모두 안다고 표시했어요.' : '이 조건에 맞는 질문이 없어요.'}
        </p>
      ) : mode === 'cards' ? (
        <div className="drill">
          <div>
            <Flashcards items={filtered} known={known} onKnown={toggleKnown} />
          </div>
          <aside aria-labelledby="prog-title">
            <h2 className="side-block__title" id="prog-title">
              역별로 안다고 한 질문
            </h2>
            <ol className="progress">
              {coursesWithQA.map((c) => {
                const all = ALL_QA.filter((x) => x.concept.course === c.id)
                const k = all.filter((x) => known.has(x.key)).length
                return (
                  <li key={c.id} aria-current={course === c.id}>
                    <Code course={c} />
                    <button onClick={() => setCourse(c.id)}>{c.title}</button>
                    <span className="num">
                      {k} / {all.length}
                    </span>
                    <span className="bar" aria-hidden="true">
                      <i style={{ transform: `scaleX(${all.length ? k / all.length : 0})` }} />
                    </span>
                  </li>
                )
              })}
            </ol>
          </aside>
        </div>
      ) : (
        <QAList items={filtered} known={known} />
      )}
    </>
  )
}

type Item = (typeof ALL_QA)[number]

function Flashcards({ items, known, onKnown }: { items: Item[]; known: Set<string>; onKnown: (k: string, v: boolean) => void }) {
  const [order, setOrder] = useState(() => items.map((_, i) => i))
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    setOrder(items.map((_, i) => i))
    setPos(0)
    setFlipped(false)
  }, [items.length, items[0]?.key])

  const item = items[order[pos] ?? 0]
  const course = COURSES.find((c) => c.id === item?.concept.course)

  const move = useCallback(
    (d: number) => {
      setPos((p) => Math.min(Math.max(p + d, 0), items.length - 1))
      setFlipped(false)
    },
    [items.length],
  )

  const shuffle = () => {
    const o = items.map((_, i) => i)
    for (let i = o.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[o[i], o[j]] = [o[j], o[i]]
    }
    setOrder(o)
    setPos(0)
    setFlipped(false)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowRight') move(1)
      else if (e.key === 'ArrowLeft') move(-1)
      else if (e.key === ' ') {
        e.preventDefault()
        setFlipped((f) => !f)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move])

  if (!item) return null
  const isKnown = known.has(item.key)

  const answer = (value: boolean) => {
    onKnown(item.key, value)
    if (pos < items.length - 1) move(1)
  }

  return (
    <div>
      <div className="drill__bar" aria-hidden="true">
        <i style={{ transform: `scaleX(${(pos + 1) / items.length})` }} />
      </div>
      <article className="ticket">
        <div className="ticket__stub">
          {course && <Code course={course} />}
          <span className="fig num">{String(pos + 1).padStart(3, '0')}</span>
          {isKnown && <span className="known">안다고 표시함</span>}
        </div>
        <div className="ticket__main">
          <p className="ticket__where">
            <a href={conceptHref(item.concept)}>{item.concept.title}</a> · <a href={courseHref(item.concept.course)}>{course?.title}</a>
          </p>
          <p className="ticket__q">
            <Inline text={item.qa.q} />
          </p>
          {flipped ? (
            <p className="ticket__a">
              <Inline text={item.qa.a} />
            </p>
          ) : (
            <p className="ticket__hint">30초 동안 소리 내어 답해 본 다음 확인하세요. 스페이스 바로도 뒤집을 수 있어요.</p>
          )}
        </div>
      </article>
      <div className="drill__nav">
        {!flipped ? (
          <button className="btn btn--go" onClick={() => setFlipped(true)}>
            답 확인
          </button>
        ) : (
          <>
            <button className="btn btn--go" onClick={() => answer(true)}>
              알고 있었어요
            </button>
            <button className="btn btn--line" onClick={() => answer(false)}>
              다시 볼게요
            </button>
          </>
        )}
        <button className="icon-btn" onClick={() => move(-1)} disabled={pos === 0} aria-label="이전 질문">
          <Icon name="back" />
        </button>
        <button className="icon-btn" onClick={() => move(1)} disabled={pos === items.length - 1} aria-label="다음 질문">
          <Icon name="chevron" />
        </button>
        <button className="icon-btn" onClick={shuffle} aria-label="순서 섞기" title="순서 섞기">
          <Icon name="shuffle" />
        </button>
        <span className="drill__pos num">
          {pos + 1} / {items.length}
        </span>
      </div>
    </div>
  )
}

function QAList({ items, known }: { items: Item[]; known: Set<string> }) {
  const groups = COURSES.map((c) => ({ course: c, items: items.filter((x) => x.concept.course === c.id) })).filter(
    (g) => g.items.length,
  )
  return (
    <div>
      {groups.map((g) => (
        <section key={g.course.id} className="qa-group">
          <div className="qa-group__head">
            <Code course={g.course} />
            <a href={courseHref(g.course.id)}>{g.course.title}</a>
            <span className="num">{g.items.length}개</span>
          </div>
          <div>
            {g.items.map((x) => (
              <QAItem
                key={x.key}
                qa={x.qa}
                context={
                  <>
                    <a href={conceptHref(x.concept)}>{x.concept.title}</a>
                    {known.has(x.key) && <span className="known"> · 안다고 표시함</span>}
                  </>
                }
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
