import { COURSES } from '../data/schedule'
import { conceptHref, conceptsOf, courseById, courseHref, hasNotes, noteOf } from '../lib/content'
import { courseStatus, md, todayISO, weekday } from '../lib/dates'
import { dot, LINE_NAME, stationCode } from '../lib/stations'
import { Code, Importance, Inline, Markdown, MaterialLink, markOf, StatusMark } from '../components/Bits'
import { NotFound } from './NotFound'

export function CoursePage({ id }: { id: string }) {
  const course = courseById(id)
  if (!course) return <NotFound />
  const note = noteOf(id)
  const concepts = conceptsOf(id)
  const today = todayISO()
  const status = courseStatus(course, today)
  const idx = COURSES.indexOf(course)
  const prev = COURSES[idx - 1]
  const next = COURSES[idx + 1]
  const qaCount = concepts.reduce((n, c) => n + c.qa.length, 0)
  const first = course.days[0]
  const last = course.days[course.days.length - 1]
  const sameLine = COURSES.filter((c) => c.track === course.track && c.id !== id && hasNotes(c.id)).slice(0, 4)

  const days = (
    <section aria-labelledby="days-title">
      <h2 className="side-block__title" id="days-title">
        수업일 <span className="num">{course.days.length}일</span>
      </h2>
      <ol className="days">
        {course.days.map((d, i) => (
          <li key={d} className="num">
            <small>Day {i + 1}</small>
            <span className="fig">{dot(d)}</span>
            {weekday(d)}
            {d === today && <span className="today">운행 중</span>}
          </li>
        ))}
      </ol>
    </section>
  )

  return (
    <>
      <header className="station-head">
        <h1 className="title title-line">
          <Code course={course} size="lg" />
          <span>{course.title}</span>
        </h1>
        {note?.summary && (
          <p className="lede">
            <Inline text={note.summary} />
          </p>
        )}
        <dl className="station-times">
          <div>
            <dt>출발</dt>
            <dd className="num">
              <span className="fig">{dot(first)}</span> {weekday(first)}
            </dd>
          </div>
          <div>
            <dt>도착</dt>
            <dd className="num">
              <span className="fig">{dot(last)}</span> {weekday(last)}
            </dd>
          </div>
          <div>
            <dt>수업</dt>
            <dd className="num">
              <span className="fig">{course.days.length}</span>일{course.hours ? ` · ${course.hours}` : ''}
            </dd>
          </div>
          {course.instructors.length > 0 && (
            <div>
              <dt>강사</dt>
              <dd>{course.instructors.join(' · ')}</dd>
            </div>
          )}
          <div>
            <dt>{LINE_NAME[course.track]}</dt>
            <dd className="num">
              <span className="fig">{String(idx + 1).padStart(2, '0')}</span> / {COURSES.length}번째 역
            </dd>
          </div>
          <div>
            <dt>상태</dt>
            <dd className="station-times__mark">
              <StatusMark s={markOf(status)} label />
            </dd>
          </div>
        </dl>
        {note?.keywords.length ? (
          <div className="tags kw">
            {note.keywords.map((k) => (
              <span key={k} className="tag">
                {k}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {!note && !concepts.length ? (
        <div className="split sec">
          <div>
            <section className="notice">
              <h2>
                <StatusMark s={markOf(status)} /> 아직 정리 전인 역이에요
              </h2>
              <p>
                {status === 'upcoming'
                  ? `${md(first)}에 출발하는 수업이에요. 수업이 끝나고 슬라이드와 실습 노트북을 올리면 이 자리에 개념 노트가 채워져요.`
                  : '이 수업의 슬라이드나 실습 노트북을 올리면 개념 노트와 면접 질문으로 정리해서 이 자리에 채워요.'}
              </p>
            </section>
            {sameLine.length > 0 && (
              <section className="sec" aria-labelledby="same-title">
                <div className="sec__head">
                  <h2 className="sec__title" id="same-title">
                    같은 노선에서 정리한 역
                  </h2>
                </div>
                <div className="list">
                  {sameLine.map((c) => (
                    <a key={c.id} className="list__row" href={courseHref(c.id)}>
                      <Code course={c} />
                      <span className="list__title">{c.title}</span>
                      <span className="list__sub">
                        <Inline text={noteOf(c.id)?.summary ?? ''} />
                      </span>
                      <span className="list__side num">개념 {conceptsOf(c.id).length}</span>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
          <aside className="split__side">{days}</aside>
        </div>
      ) : (
        <div className="split sec">
          <div>
            <section aria-labelledby="stops-title">
              <div className="sec__head" style={{ borderTop: 0, paddingTop: 0 }}>
                <h2 className="sec__title" id="stops-title">
                  정차 개념 <span className="num">{concepts.length}</span>
                </h2>
                <span className="sec__note">수업 순서대로</span>
              </div>
              <ol className="stops">
                {concepts.map((c, i) => (
                  <li key={c.slug}>
                    <a href={conceptHref(c)}>
                      <span className="stops__no">{String(i + 1).padStart(2, '0')}</span>
                      <span className="stops__title">
                        {c.title}
                        {c.en && c.en !== c.title && <small>{c.en}</small>}
                      </span>
                      <span className="stops__sum">
                        <Inline text={c.summary} />
                      </span>
                      <span className="stops__side">
                        <Importance level={c.importance} />
                        <span className="num">질문 {c.qa.length}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </section>

            {note?.body && (
              <section className="sec">
                <Markdown source={note.body} />
              </section>
            )}
          </div>

          <aside className="split__side" aria-label="역 정보">
            {qaCount > 0 && (
              <a className="btn btn--go" href={`#/interview?course=${id}`}>
                이 역의 면접 질문 {qaCount}개 풀기
              </a>
            )}
            {days}
            <section aria-labelledby="mats-title">
              <h2 className="side-block__title" id="mats-title">
                수업 자료 <span className="num">{note?.materials.length ?? 0}개</span>
              </h2>
              {note?.materials.length ? (
                <div className="mats">
                  {note.materials.map((m) => (
                    <MaterialLink key={m.file} m={m} />
                  ))}
                </div>
              ) : (
                <p className="empty" style={{ marginTop: 12 }}>
                  올라온 자료가 없어요.
                </p>
              )}
            </section>
          </aside>
        </div>
      )}

      <nav className="pager" aria-label="이전 다음 역">
        {prev && (
          <a href={courseHref(prev.id)} data-dir="prev">
            <small className="num">
              ← 이전 역 {stationCode(prev.id)} · {dot(prev.days[0])}
            </small>
            <span>{prev.title}</span>
          </a>
        )}
        {next && (
          <a href={courseHref(next.id)} data-dir="next">
            <small className="num">
              다음 역 {stationCode(next.id)} · {dot(next.days[0])} →
            </small>
            <span>{next.title}</span>
          </a>
        )}
      </nav>
    </>
  )
}
