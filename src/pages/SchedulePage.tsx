import { TRACKS, type Course } from '../data/schedule'
import { conceptsOf, courseHref, hasNotes } from '../lib/content'
import { classOn, dayOff, md, parse, programWeeks, todayISO } from '../lib/dates'

type Cell =
  | { kind: 'class'; course: Course; start: number; span: number; days: string[] }
  | { kind: 'off'; name: string; start: number; span: number; days: string[] }
  | { kind: 'blank'; start: number; span: number; days: string[] }

/** 한 주(월~금)를 같은 과목끼리 이어진 막대로 묶는다 */
function weekCells(days: string[]): Cell[] {
  const cells: Cell[] = []
  days.forEach((d, i) => {
    const cls = classOn(d)
    const off = dayOff(d)
    const last = cells[cells.length - 1]
    if (cls) {
      if (last?.kind === 'class' && last.course.id === cls.course.id) {
        last.span++
        last.days.push(d)
      } else cells.push({ kind: 'class', course: cls.course, start: i + 1, span: 1, days: [d] })
    } else if (off) {
      if (last?.kind === 'off' && last.name === off.name) {
        last.span++
        last.days.push(d)
      } else cells.push({ kind: 'off', name: off.name, start: i + 1, span: 1, days: [d] })
    } else {
      cells.push({ kind: 'blank', start: i + 1, span: 1, days: [d] })
    }
  })
  return cells
}

export function SchedulePage() {
  const today = todayISO()
  const weeks = programWeeks()

  return (
    <div className="page">
      <h1 className="page-title">교육 일정</h1>
      <p className="page-sub">
        SKALA 4기 교육 달력 그대로, 한 줄이 한 주예요. 색은 분야이고, 진한 글씨는 노트가 정리된 과목이에요. 모든 수업은 09:00~18:00 (표시된 날 제외).
      </p>
      <div className="strip__legend" style={{ marginTop: 18 }}>
        {TRACKS.map((t) => (
          <span key={t.id} data-track={t.id}>
            <i />
            {t.name}
          </span>
        ))}
        <span>
          <i data-kind="off" />
          휴일 · 휴강
        </span>
      </div>

      <div className="week-grid" role="table" aria-label="주간 교육 일정">
        <div className="week-grid__head" role="row">
          <span role="columnheader">주</span>
          {['월', '화', '수', '목', '금'].map((d) => (
            <span key={d} role="columnheader">
              {d}
            </span>
          ))}
        </div>
        {weeks.map((w, wi) => {
          const mon = parse(w.monday)
          const fri = w.days[4]
          return (
            <div key={w.monday} className="week-row" role="row">
              <div className="week-row__label num" role="rowheader">
                <b>{wi + 1}주차</b>
                {md(w.monday, false)} – {md(fri, false)}
                <span className="sr-only">{mon.getFullYear()}</span>
              </div>
              <div className="week-row__days">
                {weekCells(w.days).map((cell) => {
                  const style = { gridColumn: `${cell.start} / span ${cell.span}` }
                  const isToday = cell.days.includes(today)
                  if (cell.kind === 'blank') return <span key={cell.start} className="wk-bar" data-blank="true" style={style} />
                  if (cell.kind === 'off')
                    return (
                      <span key={cell.start} className="wk-bar" data-off="true" data-today={isToday} style={style}>
                        <span className="wk-bar__title">{cell.name}</span>
                        <span className="wk-bar__meta num">{cell.days.map((d) => md(d, false)).join(', ')}</span>
                      </span>
                    )
                  const c = cell.course
                  const ready = hasNotes(c.id)
                  return (
                    <a
                      key={cell.start}
                      className="wk-bar"
                      href={courseHref(c.id)}
                      data-track={c.track}
                      data-today={isToday}
                      style={{ ...style, opacity: ready ? 1 : 0.78 }}
                    >
                      <span className="wk-bar__title">{c.title}</span>
                      <span className="wk-bar__meta num">
                        {cell.days.length > 1 ? `${md(cell.days[0], false)}–${md(cell.days[cell.days.length - 1], false)}` : md(cell.days[0])}
                        {c.hours ? ` · ${c.hours}` : ''}
                        {isToday ? ' · 오늘' : ''}
                        {ready ? ` · 개념 ${conceptsOf(c.id).length}` : ''}
                      </span>
                    </a>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <p className="source">달력에 공개된 일정은 11/4(수)까지예요. 팀프로젝트 이후 일정은 달력이 열리면 추가할게요.</p>
    </div>
  )
}
