import { COURSES, DAYS_OFF, PROGRAM, type Course } from '../data/schedule'

const WD = ['일', '월', '화', '수', '목', '금', '토']

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function iso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parse(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** ?today=2026-10-22 로 날짜를 고정해 볼 수 있다 (스크린샷 확인용) */
export function todayISO(): string {
  const m = location.search.match(/today=(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : iso(new Date())
}

export function weekday(s: string): string {
  return WD[parse(s).getDay()]
}

/** 7/15(수) */
export function md(s: string, withDay = true): string {
  const d = parse(s)
  return `${d.getMonth() + 1}/${d.getDate()}${withDay ? `(${WD[d.getDay()]})` : ''}`
}

/** 2026년 10월 22일 목요일 */
export function longDate(s: string): string {
  const d = parse(s)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${WD[d.getDay()]}요일`
}

export function addDays(s: string, n: number): string {
  const d = parse(s)
  d.setDate(d.getDate() + n)
  return iso(d)
}

/** 날짜 목록을 연속 구간 문자열로: 7/27(월)–7/30(목), 8/3(월) */
export function dayRanges(days: string[]): string {
  const parts: string[] = []
  let start = days[0]
  let prev = days[0]
  const flush = () => parts.push(start === prev ? md(start) : `${md(start)}–${md(prev)}`)
  for (const d of days.slice(1)) {
    // 다음 평일이면 이어 붙인다 (금→월 포함)
    let next = addDays(prev, 1)
    while ([0, 6].includes(parse(next).getDay())) next = addDays(next, 1)
    if (d === next) {
      prev = d
      continue
    }
    flush()
    start = d
    prev = d
  }
  flush()
  return parts.join(', ')
}

export type CourseStatus = 'done' | 'today' | 'ongoing' | 'upcoming'

export function courseStatus(c: Course, today = todayISO()): CourseStatus {
  if (c.days.includes(today)) return 'today'
  const last = c.days[c.days.length - 1]
  if (last < today) return 'done'
  if (c.days[0] < today) return 'ongoing'
  return 'upcoming'
}

export const STATUS_LABEL: Record<CourseStatus, string> = {
  done: '수강 완료',
  today: '오늘 수업',
  ongoing: '진행 중',
  upcoming: '예정',
}

export interface ClassDay {
  date: string
  course: Course
}

export const CLASS_DAYS: ClassDay[] = COURSES.flatMap((course) => course.days.map((date) => ({ date, course }))).sort(
  (a, b) => a.date.localeCompare(b.date),
)

export function classOn(date: string): ClassDay | undefined {
  return CLASS_DAYS.find((d) => d.date === date)
}

export function dayOff(date: string) {
  return DAYS_OFF.find((d) => d.date === date)
}

/** 오늘까지 지난 수업일 수 (오늘 포함) */
export function classDaysUntil(today = todayISO()): number {
  return CLASS_DAYS.filter((d) => d.date <= today).length
}

export function nextClass(today = todayISO()): ClassDay | undefined {
  return CLASS_DAYS.find((d) => d.date > today)
}

/** 과목 안에서 오늘이 몇 번째 날인지 */
export function dayNumberIn(c: Course, date: string): number {
  return c.days.indexOf(date) + 1
}

export interface Week {
  monday: string
  days: string[] // 월~금
}

/** 프로그램 시작 주부터 마지막으로 알려진 날까지 주 단위 */
export function programWeeks(): Week[] {
  const start = parse(PROGRAM.start)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  const weeks: Week[] = []
  let monday = iso(start)
  while (monday <= PROGRAM.lastKnown) {
    weeks.push({ monday, days: [0, 1, 2, 3, 4].map((i) => addDays(monday, i)) })
    monday = addDays(monday, 7)
  }
  return weeks
}

/** 프로그램의 모든 평일 (수업일 + 휴일) */
export function programWeekdays(): string[] {
  return programWeeks()
    .flatMap((w) => w.days)
    .filter((d) => d >= PROGRAM.start && d <= PROGRAM.lastKnown)
}
