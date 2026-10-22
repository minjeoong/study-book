import { COURSES } from '../data/schedule'
import { conceptHref, conceptsOf, courseHref, hasNotes } from '../lib/content'
import { courseStatus, parse, todayISO } from '../lib/dates'
import { stationCode } from '../lib/stations'
import type { Route } from '../lib/router'
import { markOf } from './Bits'

const MONTHS = [7, 8, 9, 10, 11]

/** 노선도: 모든 과목을 수업 순서대로 한 줄에 꿴 내비게이션 */
export function RouteRail({ route, onNavigate }: { route: Route; onNavigate?: () => void }) {
  const today = todayISO()
  const current = route.name === 'course' || route.name === 'concept' || route.name === 'material' ? route.course : null
  const currentSlug = route.name === 'concept' ? route.slug : null

  return (
    <nav className="rail" aria-label="과목 노선도" onClick={(e) => (e.target as HTMLElement).closest('a') && onNavigate?.()}>
      <p className="rail__title">노선도 · 수업 순서</p>
      {MONTHS.map((m) => {
        const courses = COURSES.filter((c) => parse(c.days[0]).getMonth() + 1 === m)
        if (!courses.length) return null
        return (
          <div key={m}>
            <p className="rail__month">{m}월</p>
            <ol className="route">
              {courses.map((c) => {
                const ready = hasNotes(c.id)
                const s = markOf(courseStatus(c, today))
                const isCurrent = current === c.id
                const concepts = isCurrent ? conceptsOf(c.id) : []
                return (
                  <li key={c.id} className="stop" data-empty={!ready} aria-current={isCurrent ? 'true' : undefined}>
                    <a href={courseHref(c.id)} title={c.title}>
                      <i className="mark" data-s={s} aria-hidden="true" />
                      <span className="fig" style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey)' }}>
                        {stationCode(c.id)}
                      </span>
                      <span className="stop__name">{c.title}</span>
                      <span className="stop__n num">{ready ? conceptsOf(c.id).length : ''}</span>
                    </a>
                    {concepts.length > 0 && (
                      <ol className="stop__sub">
                        {concepts.map((k) => (
                          <li key={k.slug}>
                            <a href={conceptHref(k)} aria-current={currentSlug === k.slug ? 'page' : undefined}>
                              {k.title}
                            </a>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                )
              })}
            </ol>
          </div>
        )
      })}
    </nav>
  )
}
