import { useEffect, useRef } from 'react'
import { conceptHref, conceptsOf, courseById, courseHref, findConcept, resolveRelated } from '../lib/content'
import { dayRanges } from '../lib/dates'
import { Importance, Inline, Markdown, QAItem, TrackChip } from '../components/Bits'
import { Icon } from '../components/Icon'
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

  return (
    <div className="page">
      <div className="grid12" style={{ alignItems: 'start' }}>
        <article className="span-8">
          <nav className="crumbs" aria-label="위치">
            <a href={courseHref(course.id)}>{course.title}</a>
            <Icon name="chevron" />
            <span className="num">
              개념 {i + 1} / {siblings.length}
            </span>
          </nav>

          <header>
            <h1 className="page-title">{concept.title}</h1>
            {concept.en && concept.en !== concept.title && <p className="concept-head__en">{concept.en}</p>}
            <div className="concept-head__meta">
              <span>
                면접 빈출 <Importance level={concept.importance} /> {impLabel}
              </span>
              <span className="num">{dayRanges(course.days)} 수업</span>
              <TrackChip course={course} />
            </div>
          </header>

          <p className="definition">
            <Inline text={concept.summary} />
          </p>

          {concept.keypoints.length > 0 && (
            <section aria-label="핵심 요약">
              <h2 className="sr-only">핵심 3줄</h2>
              <ol className="keypoints">
                {concept.keypoints.map((k) => (
                  <li key={k}>
                    <Inline text={k} />
                  </li>
                ))}
              </ol>
            </section>
          )}

          {concept.body && (
            <section className="section" style={{ marginTop: 40 }}>
              <Markdown source={concept.body} />
            </section>
          )}

          {concept.qa.length > 0 && (
            <section className="section" ref={qaRef} aria-labelledby="qa-title">
              <h2 className="section__title" id="qa-title">
                면접 질문 <span className="panel__count">답을 떠올린 다음 열어 보세요</span>
              </h2>
              <div className="qa-list">
                {concept.qa.map((qa, n) => (
                  <QAItem key={qa.q} qa={qa} index={n} defaultOpen={focus === 'qa' && n === 0} />
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section className="section" aria-labelledby="rel-title">
              <h2 className="section__title" id="rel-title">
                같이 보면 좋은 개념
              </h2>
              <div className="related">
                {related.map((r) => (
                  <a key={r.course + r.slug} className="chip pressable" href={conceptHref(r)}>
                    {r.title}
                    {r.course !== concept.course && <span style={{ color: 'var(--muted)' }}>· {courseById(r.course)?.title.slice(0, 10)}</span>}
                  </a>
                ))}
              </div>
            </section>
          )}

          {concept.source && <p className="source">출처: {concept.source}</p>}

          <nav className="pager" aria-label="이전 다음 개념">
            {prev && (
              <a href={conceptHref(prev)} data-dir="prev">
                <small>이전 개념</small>
                <span>{prev.title}</span>
              </a>
            )}
            {next ? (
              <a href={conceptHref(next)} data-dir="next">
                <small>다음 개념</small>
                <span>{next.title}</span>
              </a>
            ) : (
              <a href={courseHref(course.id)} data-dir="next">
                <small>과목 개요로</small>
                <span>{course.title}</span>
              </a>
            )}
          </nav>
        </article>

        <aside className="span-4 rail" aria-label="이 과목의 개념">
          <section className="panel">
            <div className="panel__head">
              <h2 className="panel__title">이 과목의 개념</h2>
              <span className="panel__count num">{siblings.length}개</span>
            </div>
            <nav className="toc">
              {siblings.map((s) => (
                <a key={s.slug} href={conceptHref(s)} aria-current={s === concept ? 'page' : undefined}>
                  {s.title}
                </a>
              ))}
            </nav>
          </section>
        </aside>
      </div>
    </div>
  )
}
