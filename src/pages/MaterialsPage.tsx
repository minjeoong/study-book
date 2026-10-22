import { COURSES } from '../data/schedule'
import { ALL_MATERIALS, courseHref, hasNotes } from '../lib/content'
import { weekday } from '../lib/dates'
import { dot } from '../lib/stations'
import { Code, MAT_LABEL } from '../components/Bits'
import { materialHref } from './MaterialViewer'

export function MaterialsPage() {
  const groups = COURSES.map((c) => ({ course: c, items: ALL_MATERIALS.filter((m) => m.course === c.id) })).filter(
    (g) => g.items.length,
  )
  const waiting = COURSES.filter((c) => !hasNotes(c.id) && c.kind !== 'special')

  return (
    <>
      <h1 className="title">자료실</h1>
      <p className="lede num">
        수업에서 받은 원본 자료 {ALL_MATERIALS.length}개를 역(과목)과 수업일 기준으로 정리했어요. 슬라이드와 노트북은 사이트 안에서 바로 열려요.
      </p>

      {groups.map((g) => (
        <section key={g.course.id} className="sec" aria-labelledby={`m-${g.course.id}`}>
          <div className="sec__head">
            <Code course={g.course} />
            <h2 className="sec__title" id={`m-${g.course.id}`}>
              {g.course.title}
            </h2>
            <span className="sec__note num">{g.items.length}개</span>
            <a className="sec__link" href={courseHref(g.course.id)}>
              역 안내
            </a>
          </div>
          <table className="mat-table">
            <thead>
              <tr>
                <th scope="col">자료</th>
                <th scope="col">수업일</th>
                <th scope="col">종류</th>
                <th scope="col" className="fname">
                  파일
                </th>
              </tr>
            </thead>
            <tbody>
              {g.items.map((m) => (
                <tr key={m.file}>
                  <td>
                    <a className="file" href={materialHref(m)}>
                      {m.title}
                    </a>
                  </td>
                  <td className="when num">
                    {m.date ? (
                      <>
                        <span className="fig">{dot(m.date)}</span> {weekday(m.date)}
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="type">
                    <span className="tag">{MAT_LABEL[m.type] ?? '자료'}</span>
                  </td>
                  <td className="fname">{m.file}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <section className="sec" aria-labelledby="waiting-title">
        <div className="sec__head">
          <h2 className="sec__title" id="waiting-title">
            자료를 기다리는 역
          </h2>
          <span className="sec__note num">{waiting.length}개</span>
        </div>
        <div className="tags">
          {waiting.map((c) => (
            <a key={c.id} className="tag" href={courseHref(c.id)}>
              <Code course={c} />
              {c.title}
            </a>
          ))}
        </div>
      </section>
    </>
  )
}
