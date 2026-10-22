import { COURSES } from '../data/schedule'
import { ALL_MATERIALS, ALL_QA, conceptsOf, courseHref, hasNotes } from '../lib/content'
import { courseStatus, dayNumberIn, parse, todayISO } from '../lib/dates'
import type { Route } from '../lib/router'
import { BrandMark, Icon } from './Icon'

const MONTHS = [7, 8, 9, 10, 11]

export function Sidebar({ route, onNavigate }: { route: Route; onNavigate?: () => void }) {
  const today = todayISO()
  const current = route.name === 'course' || route.name === 'concept' ? route.course : null
  const nav = (name: Route['name']) => (route.name === name ? 'page' : undefined)

  return (
    <nav className="sidebar" aria-label="사이트 탐색" onClick={(e) => (e.target as HTMLElement).closest('a') && onNavigate?.()}>
      <a className="brand" href="#/">
        <BrandMark />
        <span>
          <span className="brand__name">SKALA 개념 노트</span>
          <br />
          <span className="brand__scope">4기 · 2026.07 – 11</span>
        </span>
      </a>

      <a className="nav-item" href="#/" aria-current={nav('home')}>
        <Icon name="home" />홈
      </a>
      <a className="nav-item" href="#/schedule" aria-current={nav('schedule')}>
        <Icon name="calendar" />교육 일정
      </a>
      <a className="nav-item" href="#/interview" aria-current={nav('interview')}>
        <Icon name="question" />면접 질문
        <span className="nav-item__count num">{ALL_QA.length}</span>
      </a>
      <a className="nav-item" href="#/materials" aria-current={nav('materials')}>
        <Icon name="folder" />자료실
        <span className="nav-item__count num">{ALL_MATERIALS.length}</span>
      </a>

      <p className="nav-group">과목 (수업 순서)</p>
      {MONTHS.map((m) => {
        const courses = COURSES.filter((c) => parse(c.days[0]).getMonth() + 1 === m)
        if (!courses.length) return null
        return (
          <div key={m}>
            <p className="course-nav__month">{m}월</p>
            {courses.map((c) => {
              const ready = hasNotes(c.id)
              const status = courseStatus(c, today)
              const n = conceptsOf(c.id).length
              return (
                <a
                  key={c.id}
                  className="course-nav__item"
                  href={courseHref(c.id)}
                  data-track={c.track}
                  data-empty={!ready}
                  aria-current={current === c.id ? 'page' : undefined}
                  title={c.title}
                >
                  <span className="course-nav__dot" />
                  <span className="course-nav__title">{c.title}</span>
                  {status === 'today' ? (
                    <span className="course-nav__meta course-nav__meta--today">오늘 {dayNumberIn(c, today)}일차</span>
                  ) : (
                    <span className="course-nav__meta num">{ready ? n : ''}</span>
                  )}
                </a>
              )
            })}
          </div>
        )
      })}
    </nav>
  )
}
