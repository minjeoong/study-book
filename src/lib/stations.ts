import { COURSES, type TrackId } from '../data/schedule'

// 운행표 세계: 분야 = 노선, 과목 = 역. 노선은 색이 아니라 문자로 구분한다.
export const LINE_LETTER: Record<TrackId, string> = { ai: 'A', data: 'D', dev: 'W', infra: 'I', etc: 'P' }
export const LINE_NAME: Record<TrackId, string> = {
  ai: 'AI·LLM선',
  data: '데이터선',
  dev: '웹·백엔드선',
  infra: '인프라·DevOps선',
  etc: '프로젝트·특강',
}

const codes = new Map<string, string>()
const counters: Partial<Record<TrackId, number>> = {}
for (const c of COURSES) {
  const n = (counters[c.track] ?? 0) + 1
  counters[c.track] = n
  codes.set(c.id, `${LINE_LETTER[c.track]}${String(n).padStart(2, '0')}`)
}

/** 일정 순서대로 노선마다 매긴 역 번호: A01, D01, W01 … */
export function stationCode(courseId: string): string {
  return codes.get(courseId) ?? '—'
}

/** 07.15 */
export function dot(date: string): string {
  return `${date.slice(5, 7)}.${date.slice(8, 10)}`
}
