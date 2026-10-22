import { useMemo, useState } from 'react'
import { COURSES, type Course } from '../data/schedule'
import { ALL_CONCEPTS, ALL_QA, conceptHref, conceptsOf, courseHref, hasNotes } from '../lib/content'
import {
  CLASS_DAYS,
  classDaysUntil,
  classOn,
  courseStatus,
  dayNumberIn,
  dayOff,
  md,
  nextClass,
  parse,
  programWeekdays,
  todayISO,
  weekday,
} from '../lib/dates'
import { dot } from '../lib/stations'
import { go } from '../lib/router'
import { Code, Importance, Inline, markOf, StatusMark } from '../components/Bits'
import { Icon } from '../components/Icon'

const TRY = ['어텐션', '표준편차', 'Few-shot', '이벤트 위임', 'ㅍㄹㅍㅌ']

/** 역 진행 ●───◉───○ */
function Run({ course, today }: { course: Course; today: string }) {
  return (
    <ol className="run" aria-label={`${course.title} 수업일`}>
      {course.days.map((d) => {
        const s = d === today ? 'today' : d < today ? 'done' : 'next'
        return (
          <li key={d} className="run__stop" data-s={s}>
            <i className="mark" data-s={s} aria-hidden="true" />
            <span className="run__label">
              <span className="fig">{dot(d)}</span> {weekday(d)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function NowBoard({ today, onSearch }: { today: string; onSearch: (q?: string) => void }) {
  const cls = classOn(today)
  const next = nextClass(today)
  const off = dayOff(today)
  const focus = cls?.course ?? next?.course
  const after = cls ? CLASS_DAYS.find((d) => d.date > today && d.course.id !== cls.course.id) : next

  return (
    <section className="now" aria-labelledby="now-title">
      <div>
        <p className="now__date">
          <span className="fig">{dot(today)}</span>
          <span>{weekday(today)}요일</span>
        </p>
        {focus && (
          <>
            <div className="now__station">
              <Code course={focus} size="lg" />
              <h1 className="title" id="now-title">
                {cls ? focus.title : off ? `오늘은 ${off.name}` : `다음 정차 ${focus.title}`}
              </h1>
            </div>
            <div className="now__run">
              <Run course={focus} today={today} />
              <p className="run__caption">
                {cls
                  ? focus.days.length > 1
                    ? `운행 중 · ${focus.days.length}일 중 ${dayNumberIn(focus, today)}일차`
                    : '운행 중 · 하루 수업'
                  : `${md(focus.days[0])} 출발 · ${focus.days.length}일`}
                {focus.instructors.length ? ` · ${focus.instructors.join(' / ')}` : ''}
              </p>
            </div>
            {cls && after && (
              <a className="now__next" href={courseHref(after.course.id)}>
                <small>다음 정차</small>
                <span className="fig">{dot(after.date)}</span>
                <span className="now__next-name">{after.course.title}</span>
                <small>{weekday(after.date)}요일</small>
              </a>
            )}
          </>
        )}
        {!focus && (
          <h1 className="title" id="now-title">
            종착역까지 왔어요
          </h1>
        )}
      </div>

      <aside className="finder" aria-label="찾기와 현황">
        <button className="finder__box" onClick={() => onSearch()}>
          <Icon name="search" />
          <span>어떤 개념을 다시 볼까요?</span>
          <span className="kbd">Ctrl K</span>
        </button>
        <p className="finder__try">
          이렇게 찾아요
          {TRY.map((t) => (
            <button key={t} className="tag" onClick={() => onSearch(t)}>
              {t}
            </button>
          ))}
        </p>
      </aside>
    </section>
  )
}

/** 전체 운행 구간: 평일 한 칸씩 */
function ProgramSpan({ today }: { today: string }) {
  const days = programWeekdays()
  const months = useMemo(() => {
    const out: { m: number; start: number; span: number }[] = []
    days.forEach((d, i) => {
      const m = parse(d).getMonth() + 1
      const last = out[out.length - 1]
      if (last && last.m === m) last.span++
      else out.push({ m, start: i + 1, span: 1 })
    })
    return out
  }, [days])
  const cols = { gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }

  return (
    <figure className="span" aria-label="전체 운행 구간">
      <div className="span__months" style={cols} aria-hidden="true">
        {months.map((m) => (
          <span key={m.m} style={{ gridColumn: `${m.start} / span ${m.span}` }}>
            {m.span >= 3 ? `${m.m}월` : ''}
          </span>
        ))}
      </div>
      <div className="span__cells" style={cols}>
        {days.map((d) => {
          const cls = classOn(d)
          if (!cls) {
            return <span key={d} className="span__cell" data-s="off" title={`${md(d)} ${dayOff(d)?.name ?? '수업 없음'}`} />
          }
          const s = d === today ? 'today' : d < today ? 'done' : 'next'
          return (
            <a
              key={d}
              className="span__cell"
              data-s={s}
              href={courseHref(cls.course.id)}
              title={`${md(d)} ${cls.course.title}`}
              aria-label={`${md(d)} ${cls.course.title}`}
            />
          )
        })}
      </div>
      <figcaption className="marks-key">
        <span>
          <i data-s="done" />
          지난 수업일
        </span>
        <span>
          <i data-s="today" />
          오늘
        </span>
        <span>
          <i />
          남은 수업일
        </span>
        <span>
          <i data-s="off" />
          운휴 (공휴일·휴강)
        </span>
      </figcaption>
    </figure>
  )
}

function Timetable({ today }: { today: string }) {
  const months = [7, 8, 9, 10, 11]
  return (
    <table className="tt">
      <thead>
        <tr>
          <th scope="col" className="route-col">
            <span className="sr-only">상태</span>
          </th>
          <th scope="col">역</th>
          <th scope="col">과목</th>
          <th scope="col">출발</th>
          <th scope="col">도착</th>
          <th scope="col" className="r">
            일수
          </th>
          <th scope="col" className="r">
            개념
          </th>
          <th scope="col" className="r">
            질문
          </th>
        </tr>
      </thead>
      <tbody>
        {months.map((m) => {
          const courses = COURSES.filter((c) => parse(c.days[0]).getMonth() + 1 === m)
          if (!courses.length) return null
          const ready = courses.filter((c) => hasNotes(c.id)).length
          return [
            <tr key={`m${m}`} className="tt__month">
              <td colSpan={8}>
                <span className="fig">{m}월</span>
                <small className="num">
                  {courses.length}개 역 · 정리 {ready}
                </small>
              </td>
            </tr>,
            ...courses.map((c, i) => {
              const ready = hasNotes(c.id)
              const concepts = conceptsOf(c.id)
              const q = concepts.reduce((n, k) => n + k.qa.length, 0)
              const status = courseStatus(c, today)
              const s = markOf(status)
              const first = c.days[0]
              const last = c.days[c.days.length - 1]
              return (
                <tr
                  key={c.id}
                  data-empty={!ready}
                  data-edge={i === 0 ? 'first' : i === courses.length - 1 ? 'last' : undefined}
                  onClick={() => go(courseHref(c.id))}
                >
                  <td className="route-col">
                    <StatusMark s={s} />
                  </td>
                  <td className="code-col">
                    <Code course={c} />
                  </td>
                  <td className="name-col">
                    <a className="tt__name" href={courseHref(c.id)} onClick={(e) => e.stopPropagation()}>
                      {c.title}
                    </a>
                    {status === 'today' ? (
                      <span className="tt__sub tt__now num">
                        운행 중 · {c.days.length}일 중 {dayNumberIn(c, today)}일차
                      </span>
                    ) : (
                      c.instructors.length > 0 && <span className="tt__sub">{c.instructors.join(' / ')}</span>
                    )}
                  </td>
                  <td className="dep-col num">
                    <span className="fig">{dot(first)}</span> {weekday(first)}
                  </td>
                  <td className="arr-col num">
                    {first !== last && (
                      <>
                        <span className="fig">{dot(last)}</span> {weekday(last)}
                      </>
                    )}
                  </td>
                  <td className="days-col r num">{c.days.length}</td>
                  <td className="n-col r num">{ready ? concepts.length : '—'}</td>
                  <td className="q-col r num">{ready ? q : ''}</td>
                </tr>
              )
            }),
          ]
        })}
      </tbody>
    </table>
  )
}

function DailyQuestion() {
  const pool = ALL_QA
  const [i, setI] = useState(() => Math.floor(Math.random() * Math.max(pool.length, 1)))
  const [shown, setShown] = useState(false)
  if (!pool.length) return <p className="empty">면접 질문이 있는 노트가 아직 없어요.</p>
  const item = pool[i % pool.length]
  const course = COURSES.find((c) => c.id === item.concept.course)!
  const next = () => {
    let n = i
    while (pool.length > 1 && n === i) n = Math.floor(Math.random() * pool.length)
    setI(n)
    setShown(false)
  }
  return (
    <article className="ticket">
      <div className="ticket__stub">
        <Code course={course} />
        <span className="fig">Q</span>
        <span>{md(course.days[0])}</span>
      </div>
      <div className="ticket__main">
        <p className="ticket__where">
          <a href={conceptHref(item.concept)}>{item.concept.title}</a> · {course.title}
        </p>
        <p className="ticket__q">
          <Inline text={item.qa.q} />
        </p>
        {shown ? (
          <p className="ticket__a">
            <Inline text={item.qa.a} />
          </p>
        ) : (
          <p className="ticket__hint">정의 → 이유 → 예시 순서로 30초 안에 말해 본 다음 확인하세요.</p>
        )}
        <div className="ticket__actions">
          {!shown ? (
            <button className="btn btn--go" onClick={() => setShown(true)}>
              답 확인
            </button>
          ) : (
            <button className="btn btn--go" onClick={next}>
              <Icon name="shuffle" />
              다른 질문
            </button>
          )}
          {!shown && (
            <button className="btn btn--line" onClick={next}>
              건너뛰기
            </button>
          )}
          <a className="spacer" href={`#/interview?course=${course.id}`}>
            이 과목 질문 이어서 풀기
          </a>
        </div>
      </div>
    </article>
  )
}

/** 과목을 돌아가며 하나씩, 날마다 다른 개념이 앞에 오도록 */
function rotatePicks<T extends { course: string }>(items: T[], n: number, seed: number): T[] {
  const byCourse = new Map<string, T[]>()
  for (const it of items) byCourse.set(it.course, [...(byCourse.get(it.course) ?? []), it])
  const lists = [...byCourse.values()]
  const out: T[] = []
  let round = 0
  while (out.length < n && lists.some((l) => l.length > round)) {
    for (const l of lists) {
      if (l.length > round && out.length < n) out.push(l[(round + seed) % l.length])
    }
    round++
  }
  return out
}

export function Home({ onSearch }: { onSearch: (q?: string) => void }) {
  const today = todayISO()
  const readyCourses = COURSES.filter((c) => hasNotes(c.id))
  const frequent = ALL_CONCEPTS.filter((c) => c.importance === 3)
  const picks = rotatePicks(frequent, 5, classDaysUntil(today))

  return (
    <>
      <NowBoard today={today} onSearch={onSearch} />

      <section className="sec" aria-labelledby="tt-title">
        <div className="sec__head">
          <h2 className="sec__title" id="tt-title">
            운행표
          </h2>
          <span className="sec__note num">
            정리 {readyCourses.length}/{COURSES.length}역 · 개념 {ALL_CONCEPTS.length} · 질문 {ALL_QA.length} · 운행 {classDaysUntil(today)}/
            {CLASS_DAYS.length}일
          </span>
          <a className="sec__link" href="#/schedule">
            주간 일정
          </a>
        </div>
        <ProgramSpan today={today} />
        <p className="marks-key tt-key">
          <span>
            <i className="mark" data-s="done" />
            지남
          </span>
          <span>
            <i className="mark" data-s="today" />
            운행 중
          </span>
          <span>
            <i className="mark" data-s="next" />
            예정
          </span>
          <span>— 자료 대기 (개념 정리 전)</span>
          <span>역을 누르면 개념으로 내려가요</span>
        </p>
        <div style={{ marginTop: 12 }}>
          <Timetable today={today} />
        </div>
      </section>

      <div className="duo sec">
        <section aria-labelledby="quiz-title">
          <div className="sec__head">
            <h2 className="sec__title" id="quiz-title">
              지금 한 문제
            </h2>
            <a className="sec__link" href="#/interview">
              카드로 계속
            </a>
          </div>
          <DailyQuestion />
        </section>
        <section aria-labelledby="freq-title">
          <div className="sec__head">
            <h2 className="sec__title" id="freq-title">
              면접 단골 개념
            </h2>
            <span className="sec__note num">빈출 {frequent.length}개 중 오늘의 5개</span>
          </div>
          <div className="list">
            {picks.map((c) => {
              const course = COURSES.find((x) => x.id === c.course)!
              return (
                <a key={c.course + c.slug} className="list__row" href={conceptHref(c)}>
                  <Code course={course} />
                  <span className="list__title">{c.title}</span>
                  <span className="list__sub">
                    <Inline text={c.summary} />
                  </span>
                  <span className="list__side">
                    <Importance level={c.importance} />
                  </span>
                </a>
              )
            })}
            {!picks.length && <p className="empty">아직 정리된 개념이 없어요.</p>}
          </div>
        </section>
      </div>
    </>
  )
}
