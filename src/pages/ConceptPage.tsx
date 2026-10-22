import { useEffect, useRef } from 'react'
import { conceptHref, conceptsOf, courseById, courseHref, findConcept, noteOf, resolveRelated } from '../lib/content'
import { materialHref } from './MaterialViewer'
import { dot, LINE_NAME, stationCode } from '../lib/stations'
import { Code, Importance, Inline, Markdown, QAItem } from '../components/Bits'
import { NotFound } from './NotFound'

export function ConceptPage({ course: courseId, slug, focus }: { course: string; slug: string; focus?: string }) {
  const course = courseById(courseId)
  const concept = findConcept(courseId, slug)
  const qaRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (focus === 'qa') qaRef.current?.scrollIntoView({ block: 'start' })
  }, [focus, slug])

  if (!course || !concept) return <NotFound />
  const siblings = conceptsOf(courseId)
  const i = siblings.indexOf(concept)
  const prev = siblings[i - 1]
  const next = siblings[i + 1]
  const related = resolveRelated(concept)
  const impLabel = ['', '참고', '알아두기', '자주 나옴'][concept.importance]
  const first = course.days[0]
  const last = course.days[course.days.length - 1]

  return (
    <article>
      <nav className="crumbs" aria-label="위치">
        <Code course={course} />
        <a href={courseHref(course.id)}>{course.title}</a>
        <span className="sep">/</span>
        <span className="num">
          개념 {String(i + 1).padStart(2, '0')} / {siblings.length}
        </span>
      </nav>

      <header>
        <h1 className="title">{concept.title}</h1>
        {concept.en && concept.en !== concept.title && <p className="concept-head__en">{concept.en}</p>}
        <p className="meta num">
          <span>
            면접 빈출 <Importance level={concept.importance} /> <b>{impLabel}</b>
          </span>
          <span>
            {LINE_NAME[course.track]} · <b>{dot(first)}</b>
            {first !== last && <> – <b>{dot(last)}</b></>} 수업
          </span>
        </p>
      </header>

      <div className="def">
        <span className="def__label">정의</span>
        <p className="def__text">
          <Inline text={concept.summary} />
        </p>
      </div>

      {concept.keypoints.length > 0 && (
        <section aria-label="핵심 3줄">
          <ol className="three">
            {concept.keypoints.map((k, n) => (
              <li key={k}>
                <span className="fig" aria-hidden="true">
                  {n + 1}
                </span>
                <span>
                  <Inline text={k} />
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {concept.body && (
        <section style={{ marginTop: 44 }}>
          <Markdown source={concept.body} />
        </section>
      )}

      {concept.qa.length > 0 && (
        <section className="sec" ref={qaRef} aria-labelledby="qa-title">
          <div className="sec__head" style={{ borderTop: 0, paddingTop: 0, marginBottom: 0 }}>
            <h2 className="sec__title" id="qa-title">
              면접 질문
            </h2>
            <span className="sec__note">답을 소리 내어 말해 본 다음 열어 보세요</span>
          </div>
          <div>
            {concept.qa.map((qa, n) => (
              <QAItem key={qa.q} qa={qa} index={n} defaultOpen={focus === 'qa' && n === 0} />
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="sec" aria-labelledby="rel-title">
          <div className="sec__head">
            <h2 className="sec__title" id="rel-title">
              갈아탈 개념
            </h2>
            <span className="sec__note">같이 물어보기 쉬운 개념</span>
          </div>
          <div className="tags">
            {related.map((r) => {
              const rc = courseById(r.course)!
              return (
                <a key={r.course + r.slug} className="tag" href={conceptHref(r)}>
                  {r.course !== concept.course && (
                    <span className="fig" style={{ fontWeight: 700 }}>
                      {stationCode(rc.id)}
                    </span>
                  )}
                  {r.title}
                </a>
              )
            })}
          </div>
        </section>
      )}

      {concept.source && (
        <p className="source">
          출처 · <SourceLinks source={concept.source} course={course.id} />
        </p>
      )}

      <nav className="pager" aria-label="이전 다음 개념">
        {prev && (
          <a href={conceptHref(prev)} data-dir="prev">
            <small>← 이전 개념</small>
            <span>{prev.title}</span>
          </a>
        )}
        {next ? (
          <a href={conceptHref(next)} data-dir="next">
            <small>다음 개념 →</small>
            <span>{next.title}</span>
          </a>
        ) : (
          <a href={courseHref(course.id)} data-dir="next">
            <small>역 안내로 →</small>
            <span>{course.title}</span>
          </a>
        )}
      </nav>
    </article>
  )
}

/** "Day2 슬라이드 p.18–23" 의 쪽 번호를 그 날 슬라이드 뷰어로 연결한다 */
function SourceLinks({ source, course }: { source: string; course: string }) {
  const slides = (noteOf(course)?.materials ?? []).filter((m) => m.type === 'slides' && m.file.endsWith('.pdf'))
  if (!slides.length) return <>{source}</>
  const deckFor = (day: number) =>
    slides.find((m) => m.file.includes(`day${day}`)) ?? slides[Math.min(day, slides.length) - 1] ?? slides[0]

  const out: React.ReactNode[] = []
  const re = /p\.(\d+)(?:\s*[–-]\s*(\d+))?/g
  let last = 0
  for (let m = re.exec(source); m; m = re.exec(source)) {
    const before = source.slice(0, m.index)
    const day = Number([...before.matchAll(/Day\s*(\d)/g)].pop()?.[1] ?? 1)
    out.push(source.slice(last, m.index))
    out.push(
      <a key={m.index} className="source__link" href={materialHref(deckFor(day), Number(m[1]))}>
        {m[0]}
      </a>,
    )
    last = m.index + m[0].length
  }
  out.push(source.slice(last))
  return <>{out}</>
}
