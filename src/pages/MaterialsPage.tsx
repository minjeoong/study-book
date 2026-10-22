import { COURSES } from '../data/schedule'
import { ALL_MATERIALS, courseHref, hasNotes } from '../lib/content'
import { md } from '../lib/dates'
import { MAT_LABEL } from '../components/Bits'

export function MaterialsPage() {
  const groups = COURSES.map((c) => ({ course: c, items: ALL_MATERIALS.filter((m) => m.course === c.id) })).filter(
    (g) => g.items.length,
  )
  const waiting = COURSES.filter((c) => !hasNotes(c.id) && c.kind !== 'special')

  return (
    <div className="page">
      <h1 className="page-title">자료실</h1>
      <p className="page-sub num">
        수업에서 받은 원본 자료 <b>{ALL_MATERIALS.length}개</b>를 과목과 수업일 기준으로 분류했어요. 슬라이드와 노트북은 이 안에서 바로 열려요.
      </p>

      {groups.map((g) => (
        <section key={g.course.id} className="section" aria-labelledby={`m-${g.course.id}`}>
          <div className="qa-group__head">
            <a id={`m-${g.course.id}`} href={courseHref(g.course.id)}>
              {g.course.title}
            </a>
            <span className="num">{g.items.length}개</span>
          </div>
          <table className="mat-table">
            <thead>
              <tr>
                <th scope="col">자료</th>
                <th scope="col">수업일</th>
                <th scope="col">종류</th>
                <th scope="col" className="course">
                  파일
                </th>
              </tr>
            </thead>
            <tbody>
              {g.items.map((m) => (
                <tr key={m.file}>
                  <td>
                    <a className="file" href={`#/m/${m.course}/${encodeURIComponent(m.file)}`}>
                      {m.title}
                    </a>
                  </td>
                  <td className="when num">{m.date ? md(m.date) : '—'}</td>
                  <td className="type">
                    <span className="chip">{MAT_LABEL[m.type] ?? '자료'}</span>
                  </td>
                  <td className="course" style={{ color: 'var(--muted)', fontSize: 13 }}>
                    {m.file}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <section className="section" aria-labelledby="waiting-title">
        <h2 className="section__title" id="waiting-title">
          자료를 기다리는 과목 <span className="panel__count num">{waiting.length}개</span>
        </h2>
        <div className="chips">
          {waiting.map((c) => (
            <a key={c.id} className="chip chip--track pressable" data-track={c.track} href={courseHref(c.id)}>
              {md(c.days[0], false)} {c.title}
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
