import { COURSES } from '../data/schedule'
import { conceptHref, conceptsOf, courseById, courseHref, hasNotes, noteOf } from '../lib/content'
import { courseStatus, dayRanges, md, STATUS_LABEL, todayISO } from '../lib/dates'
import { Importance, Inline, Markdown, MaterialLink, TrackChip } from '../components/Bits'
import { Icon } from '../components/Icon'
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
  const sameTrack = COURSES.filter((c) => c.track === course.track && c.id !== id && hasNotes(c.id)).slice(0, 4)

  return (
    <div className="page">
      <nav className="crumbs" aria-label="위치">
        <a href="#/schedule">교육 일정</a>
        <Icon name="chevron" />
        <span className="num">
          {idx + 1}번째 과목 / {COURSES.length}
        </span>
      </nav>

      <header className="course-head">
        <h1 className="page-title">{course.title}</h1>
        <p className="page-sub num">
          <b>{dayRanges(course.days)}</b> · {course.days.length}일
          {course.hours ? ` (${course.hours})` : ''}
          {course.instructors.length ? ` · ${course.instructors.join(' / ')}` : ''} · {STATUS_LABEL[status]}
        </p>
        {note?.summary && (
          <p className="course-summary">
            <Inline text={note.summary} />
          </p>
        )}
        <div className="chips">
          <TrackChip course={course} />
          {note?.keywords.map((k) => (
            <span key={k} className="chip">
              {k}
            </span>
          ))}
        </div>
      </header>

      {!note && !concepts.length ? (
        <div className="grid12" style={{ marginTop: 32, alignItems: 'start' }}>
          <div className="span-8">
            <section className="pending" style={{ marginTop: 0 }}>
              <h2>아직 정리 전인 과목이에요</h2>
              <p>
                {status === 'upcoming'
                  ? `${md(course.days[0])}에 시작하는 수업이에요. 수업이 끝나고 슬라이드와 실습 노트북을 올리면 이 자리에 개념 노트가 채워져요.`
                  : '이 수업의 슬라이드나 실습 노트북을 올리면 개념 노트와 면접 질문으로 정리해서 이 자리에 채워요.'}
              </p>
            </section>
            {sameTrack.length > 0 && (
              <section className="section" style={{ marginTop: 32 }} aria-labelledby="same-title">
                <h2 className="section__title" id="same-title">
                  같은 분야에서 먼저 정리한 과목
                </h2>
                <div className="recent-list">
                  {sameTrack.map((c) => (
                    <a key={c.id} className="row-card" href={courseHref(c.id)}>
                      <span className="row-card__title">{c.title}</span>
                      <span className="row-card__sub">
                        <Inline text={noteOf(c.id)?.summary ?? ''} />
                      </span>
                      <span className="row-card__side num">
                        {md(c.days[0])}
                        <br />
                        개념 {conceptsOf(c.id).length}
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
          <aside className="span-4 rail" aria-label="과목 정보">
            <section className="panel">
              <div className="panel__head">
                <h2 className="panel__title">수업일</h2>
                <span className="panel__count num">{course.days.length}일</span>
              </div>
              <ol className="day-list">
                {course.days.map((d, i) => (
                  <li key={d} className="num">
                    <span className="day-n">Day {i + 1}</span>
                    <time dateTime={d}>{md(d)}</time>
                    {d === today && <span className="day-today">오늘</span>}
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>
      ) : (
        <div className="grid12" style={{ marginTop: 40, alignItems: 'start' }}>
          <div className="span-8">
            <section aria-labelledby="concepts-title">
              <h2 className="section__title" id="concepts-title">
                개념 {concepts.length}개 <span className="panel__count">수업 순서대로</span>
              </h2>
              <ol className="concept-list">
                {concepts.map((c) => (
                  <li key={c.slug}>
                    <a className="concept-row" href={conceptHref(c)}>
                      <span className="concept-row__title">
                        {c.title}
                        {c.en && c.en !== c.title && <small>{c.en}</small>}
                      </span>
                      <span className="concept-row__sum">
                        <Inline text={c.summary} />
                      </span>
                      <span className="concept-row__side">
                        <Importance level={c.importance} />
                        <span className="num">질문 {c.qa.length}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </section>

            {note?.body && (
              <section className="section">
                <Markdown source={note.body} />
              </section>
            )}
          </div>

          <aside className="span-4 rail" aria-label="과목 정보">
            <section className="panel">
              <div className="panel__head">
                <h2 className="panel__title">수업일</h2>
                <span className="panel__count num">{course.days.length}일</span>
              </div>
              <ol className="day-list">
                {course.days.map((d, i) => (
                  <li key={d} className="num">
                    <span className="day-n">Day {i + 1}</span>
                    <time dateTime={d}>{md(d)}</time>
                    {d === today && <span className="day-today">오늘</span>}
                  </li>
                ))}
              </ol>
            </section>

            <section className="panel">
              <div className="panel__head">
                <h2 className="panel__title">수업 자료</h2>
                <span className="panel__count num">{note?.materials.length ?? 0}개</span>
              </div>
              {note?.materials.length ? (
                <div className="mat-list">
                  {note.materials.map((m) => (
                    <MaterialLink key={m.file} m={m} />
                  ))}
                </div>
              ) : (
                <p className="empty">올라온 자료가 없어요.</p>
              )}
            </section>

            {qaCount > 0 && (
              <a className="btn btn--primary" href={`#/interview?course=${id}`} style={{ alignSelf: 'flex-start' }}>
                이 과목 면접 질문 {qaCount}개 풀기
              </a>
            )}
          </aside>
        </div>
      )}

      <nav className="pager" aria-label="이전 다음 과목">
        {prev && (
          <a href={courseHref(prev.id)} data-dir="prev">
            <small>이전 과목 · {md(prev.days[0])}</small>
            <span>{prev.title}</span>
          </a>
        )}
        {next && (
          <a href={courseHref(next.id)} data-dir="next">
            <small>다음 과목 · {md(next.days[0])}</small>
            <span>{next.title}</span>
          </a>
        )}
      </nav>
    </div>
  )
}
