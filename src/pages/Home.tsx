import { useMemo, useState } from 'react'
import { COURSES, TRACKS, type Course } from '../data/schedule'
import { ALL_CONCEPTS, ALL_QA, conceptHref, conceptsOf, courseHref, hasNotes } from '../lib/content'
import {
  CLASS_DAYS,
  classDaysUntil,
  classOn,
  courseStatus,
  dayNumberIn,
  dayOff,
  longDate,
  md,
  nextClass,
  parse,
  programWeekdays,
  todayISO,
} from '../lib/dates'
import { Importance, Inline } from '../components/Bits'
import { Icon } from '../components/Icon'

function greeting(today: string): string {
  const cls = classOn(today)
  if (cls) {
    const n = dayNumberIn(cls.course, today)
    return cls.course.days.length > 1 ? `오늘은 ${cls.course.title} ${n}일차` : `오늘은 ${cls.course.title}`
  }
  const off = dayOff(today)
  if (off) return `오늘은 ${off.name}, 쉬는 날`
  const next = nextClass(today)
  if (!next) return '지금까지 배운 것들'
  if (today < CLASS_DAYS[0].date) return '곧 SKALA 4기 입과'
  const wd = parse(today).getDay()
  if (wd === 0 || wd === 6) return `주말, 다음 수업은 ${next.course.title}`
  return `다음 수업은 ${next.course.title}`
}

const MAP_COLUMNS: { label: string; months: number[] }[] = [
  { label: '7월', months: [7] },
  { label: '8월', months: [8] },
  { label: '9월', months: [9] },
  { label: '10월 – 11월', months: [10, 11] },
]

function MapItem({ c, today }: { c: Course; today: string }) {
  const ready = hasNotes(c.id)
  const status = courseStatus(c, today)
  const n = conceptsOf(c.id).length
  const first = md(c.days[0])
  const range = c.days.length > 1 ? `${first} 외 ${c.days.length - 1}일` : first
  return (
    <a className="map-item" href={courseHref(c.id)} data-track={c.track} data-empty={!ready} data-status={status}>
      <span className="map-item__bar" />
      <span>
        <span className="map-item__title">{c.title}</span>
        <span className="map-item__meta num">
          <span>{range}</span>
          {status === 'today' ? <b>오늘 {dayNumberIn(c, today)}일차</b> : ready ? <span>개념 {n}</span> : <span>자료 대기</span>}
        </span>
      </span>
    </a>
  )
}

function ProgramStrip({ today }: { today: string }) {
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
    <figure className="strip" aria-label="전체 수업일 띠">
      <div className="strip__months" style={cols} aria-hidden="true">
        {months.map((m) => (
          <span key={m.m} style={{ gridColumn: `${m.start} / span ${m.span}` }}>
            {m.span >= 3 ? `${m.m}월` : ''}
          </span>
        ))}
      </div>
      <div className="strip__cells" style={cols}>
        {days.map((d) => {
          const cls = classOn(d)
          const off = dayOff(d)
          if (!cls) {
            return (
              <span
                key={d}
                className="strip__cell"
                data-off="true"
                data-today={d === today}
                title={`${md(d)} ${off?.name ?? '수업 없음'}`}
              />
            )
          }
          return (
            <a
              key={d}
              className="strip__cell"
              href={courseHref(cls.course.id)}
              data-track={cls.course.track}
              data-future={d > today}
              data-today={d === today}
              title={`${md(d)} ${cls.course.title}`}
              aria-label={`${md(d)} ${cls.course.title}`}
            />
          )
        })}
      </div>
      <figcaption className="strip__legend">
        {TRACKS.map((t) => (
          <span key={t.id} data-track={t.id}>
            <i />
            {t.name}
          </span>
        ))}
        <span>
          <i data-kind="future" />
          아직 안 한 수업
        </span>
        <span>
          <i data-kind="off" />
          휴일
        </span>
      </figcaption>
    </figure>
  )
}

function DailyQuestion() {
  const pool = ALL_QA
  const [i, setI] = useState(() => Math.floor(Math.random() * Math.max(pool.length, 1)))
  const [shown, setShown] = useState(false)
  if (!pool.length) {
    return <p className="empty">면접 질문이 있는 노트가 아직 없어요.</p>
  }
  const item = pool[i % pool.length]
  const course = COURSES.find((c) => c.id === item.concept.course)!
  const next = () => {
    let n = i
    while (pool.length > 1 && n === i) n = Math.floor(Math.random() * pool.length)
    setI(n)
    setShown(false)
  }
  const sameCourse = pool.filter((x) => x.concept.course === course.id).length
  return (
    <>
      <div className="quiz">
        <p className="quiz__q">
          <Inline text={item.qa.q} />
        </p>
        <p className="quiz__a" data-hidden={!shown} aria-hidden={!shown}>
          <Inline text={item.qa.a} />
        </p>
        <div className="quiz__actions">
          {!shown ? (
            <button className="btn btn--primary" onClick={() => setShown(true)}>
              답 확인하기
            </button>
          ) : (
            <button className="btn btn--primary" onClick={next}>
              <Icon name="shuffle" />
              다른 질문
            </button>
          )}
          {!shown && (
            <button className="btn btn--ghost" onClick={next}>
              건너뛰기
            </button>
          )}
        </div>
      </div>
      <div className="quiz__side">
        <a className="row-card" href={conceptHref(item.concept)}>
          <span className="row-card__title">{item.concept.title}</span>
          <span className="row-card__sub">
            {course.title} · {md(course.days[0])}
          </span>
          <span className="row-card__side">
            <Importance level={item.concept.importance} />
          </span>
        </a>
        <p className="quiz__hint">
          답은 30초 안에, <b>정의 → 이유 → 예시</b> 순서로 말해 보세요. 이 과목에는 질문이 <b className="num">{sameCourse}개</b> 더 있어요.{' '}
          <a href={`#/interview?course=${course.id}`} style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
            이어서 풀기
          </a>
        </p>
      </div>
    </>
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

export function Home({ onSearch }: { onSearch: () => void }) {
  const today = todayISO()
  const readyCourses = COURSES.filter((c) => hasNotes(c.id))
  const passed = classDaysUntil(today)
  const total = CLASS_DAYS.length
  const next = nextClass(today)
  const latest = readyCourses[readyCourses.length - 1]
  const frequent = ALL_CONCEPTS.filter((c) => c.importance === 3)
  const picks = rotatePicks(frequent, 6, passed)

  return (
    <div className="page">
      <header className="home-hero">
        <h1 className="greeting">{greeting(today)}</h1>
        <p className="home-hero__line num">
          {longDate(today)} · 수업 <b>{passed}일째</b> (달력에 나온 {total}일 중) · 정리한 과목 <b>{readyCourses.length}개</b>
        </p>
        <button className="big-search" onClick={onSearch}>
          <Icon name="search" />
          <span>무엇을 다시 볼까요? 개념·질문·과목 찾기</span>
          <span className="kbd">Ctrl K</span>
        </button>
      </header>

      <section className="grid12 tiles" aria-label="정리 현황">
        <div className="tile span-3">
          <p className="tile__label">정리한 과목</p>
          <p className="tile__value num">
            {readyCourses.length}
            <small>/ {COURSES.length}</small>
          </p>
          <p className="tile__caption">{latest ? `최근: ${latest.title}` : '자료를 올리면 채워져요'}</p>
        </div>
        <div className="tile span-3">
          <p className="tile__label">개념 노트</p>
          <p className="tile__value num">{ALL_CONCEPTS.length}</p>
          <p className="tile__caption">면접에 자주 나오는 개념 {frequent.length}개</p>
        </div>
        <div className="tile span-3">
          <p className="tile__label">면접 질문</p>
          <p className="tile__value num">{ALL_QA.length}</p>
          <p className="tile__caption">
            <a href="#/interview">카드로 복습하기</a>
          </p>
        </div>
        <div className="tile span-3">
          <p className="tile__label">수업 진행</p>
          <p className="tile__value num">
            {passed}
            <small>/ {total}일</small>
          </p>
          <p className="tile__caption">{next ? `다음: ${md(next.date)} ${next.course.title}` : '달력의 마지막 수업까지 왔어요'}</p>
        </div>
      </section>

      <section className="section panel" aria-labelledby="map-title" style={{ marginTop: 16 }}>
        <div className="panel__head">
          <h2 className="panel__title" id="map-title">
            커리큘럼 지도
          </h2>
          <span className="panel__count">교육 달력 순서, 칸 하나가 수업 하루</span>
          <a className="panel__link" href="#/schedule">
            주간 일정으로 보기
          </a>
        </div>
        <ProgramStrip today={today} />
        <div className="grid12" style={{ marginTop: 24 }}>
          {MAP_COLUMNS.map((col) => {
            const courses = COURSES.filter((c) => col.months.includes(parse(c.days[0]).getMonth() + 1))
            const ready = courses.filter((c) => hasNotes(c.id)).length
            return (
              <div key={col.label} className="span-3 map-col">
                <div className="map-col__head">
                  <h3 className="map-col__month">{col.label}</h3>
                  <span className="map-col__count num">
                    정리 {ready} / {courses.length}
                  </span>
                </div>
                <div className="map-list">
                  {courses.map((c) => (
                    <MapItem key={c.id} c={c} today={today} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="panel quiz-panel" style={{ marginTop: 16 }} aria-labelledby="quiz-title">
        <div className="panel__head">
          <h2 className="panel__title" id="quiz-title">
            지금 바로 한 문제
          </h2>
          <span className="panel__count">답을 떠올린 뒤 확인하세요</span>
          <a className="panel__link" href="#/interview">
            카드로 계속 풀기
          </a>
        </div>
        <DailyQuestion />
      </section>

      <section className="panel" style={{ marginTop: 16 }} aria-labelledby="freq-title">
        <div className="panel__head">
          <h2 className="panel__title" id="freq-title">
            면접 단골 개념
          </h2>
          <span className="panel__count num">빈출도가 높은 {frequent.length}개 중 오늘의 6개</span>
          <a className="panel__link" href="#/interview">
            전체 질문 보기
          </a>
        </div>
        <div className="freq-grid">
          {picks.map((c) => {
            const course = COURSES.find((x) => x.id === c.course)!
            return (
              <a key={c.course + c.slug} className="row-card" href={conceptHref(c)}>
                <span className="row-card__title">{c.title}</span>
                <span className="row-card__sub">
                  <Inline text={c.summary} />
                </span>
                <span className="row-card__side num">{md(course.days[0], false)}</span>
              </a>
            )
          })}
          {!picks.length && <p className="empty">아직 정리된 개념이 없어요.</p>}
        </div>
      </section>
    </div>
  )
}
