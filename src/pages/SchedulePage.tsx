import { type Course } from '../data/schedule'
import { conceptsOf, courseHref, hasNotes } from '../lib/content'
import { classOn, dayOff, programWeeks, todayISO } from '../lib/dates'
import { dot } from '../lib/stations'
import { Code } from '../components/Bits'

type Cell =
  | { kind: 'class'; course: Course; start: number; span: number; days: string[] }
  | { kind: 'off'; name: string; start: number; span: number; days: string[] }
  | { kind: 'blank'; start: number; span: number; days: string[] }

/** 한 주(월~금)를 같은 과목끼리 이어진 칸으로 묶는다 */
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

const range = (days: string[]) => (days.length > 1 ? `${dot(days[0])}–${dot(days[days.length - 1])}` : dot(days[0]))

export function SchedulePage() {
  const today = todayISO()
  const weeks = programWeeks()

  return (
    <>
      <h1 className="title">주간 일정</h1>
      <p className="lede">
        SKALA 교육 달력을 주 단위로 옮긴 운행표예요. 한 줄이 한 주이고, 역 코드의 글자가 노선(분야)이에요. 모든 수업은 09:00~18:00이고, 다른 시간은 칸에 따로 적었어요.
      </p>
      <p className="marks-key" style={{ marginTop: 16 }}>
        <span>A AI·LLM</span>
        <span>D 데이터</span>
        <span>W 웹·백엔드</span>
        <span>I 인프라·DevOps</span>
        <span>P 프로젝트·특강</span>
        <span>운휴 = 공휴일·휴강</span>
      </p>

      <div className="week-grid" role="table" aria-label="주간 교육 일정">
        <div className="week-grid__head" role="row">
          <span role="columnheader">주차</span>
          {['월', '화', '수', '목', '금'].map((d) => (
            <span key={d} role="columnheader">
              {d}
            </span>
          ))}
        </div>
        {weeks.map((w, wi) => (
          <div key={w.monday} className="week-row" role="row">
            <div className="week-row__label num" role="rowheader">
              <b>{wi + 1}주차</b>
              {dot(w.monday)} – {dot(w.days[4])}
            </div>
            <div className="week-row__days">
              {weekCells(w.days).map((cell) => {
                const style = { gridColumn: `${cell.start} / span ${cell.span}` }
                const isToday = cell.days.includes(today)
                if (cell.kind === 'blank') return <span key={cell.start} className="wk" data-blank="true" style={style} />
                if (cell.kind === 'off')
                  return (
                    <span key={cell.start} className="wk" data-off="true" data-today={isToday} style={style}>
                      <span className="wk__title">운휴 · {cell.name}</span>
                      <span className="wk__meta num">{range(cell.days)}</span>
                    </span>
                  )
                const c = cell.course
                const ready = hasNotes(c.id)
                return (
                  <a key={cell.start} className="wk" href={courseHref(c.id)} data-empty={!ready} data-today={isToday} style={style}>
                    <span className="wk__top">
                      <Code course={c} />
                      {isToday && <span className="tt__now">운행 중</span>}
                    </span>
                    <span className="wk__title">{c.title}</span>
                    <span className="wk__meta num">
                      {range(cell.days)}
                      {c.hours ? ` · ${c.hours}` : ''}
                      {ready ? ` · 개념 ${conceptsOf(c.id).length}` : ' · 자료 대기'}
                    </span>
                  </a>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="source">달력에 공개된 일정은 11.04(수)까지예요. 팀프로젝트 이후 일정은 달력이 열리면 추가할게요.</p>
    </>
  )
}
