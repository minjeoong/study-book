import { COURSES } from '../data/schedule'
import { ALL_CONCEPTS, conceptHref, courseHref, noteOf } from './content'

export type HitKind = 'concept' | 'course' | 'question'

export interface SearchItem {
  kind: HitKind
  title: string
  sub: string
  href: string
  courseId: string
  /** 정규화된 검색 대상: [가중치, 텍스트] */
  fields: [number, string][]
  chosung: string
}

const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'

export function toChosung(s: string): string {
  let out = ''
  for (const ch of s) {
    const code = ch.charCodeAt(0) - 0xac00
    if (code >= 0 && code < 11172) out += CHO[Math.floor(code / 588)]
    else if (/[a-z0-9ㄱ-ㅎ]/i.test(ch)) out += ch.toLowerCase()
  }
  return out
}

export const norm = (s: string) => s.toLowerCase().replace(/[\s·\-_/().,:'"`]+/g, '')

const isChosungQuery = (q: string) => /^[ㄱ-ㅎ]+$/.test(q)

const ITEMS: SearchItem[] = [
  ...ALL_CONCEPTS.map((c) => {
    const course = COURSES.find((x) => x.id === c.course)
    return {
      kind: 'concept' as const,
      title: c.title,
      sub: c.summary,
      href: conceptHref(c),
      courseId: c.course,
      fields: [
        [10, norm(c.title)],
        [8, norm(c.en ?? '')],
        [6, norm(c.tags.join(' '))],
        [4, norm(c.summary)],
        [2, norm(c.keypoints.join(' '))],
        [1, norm(c.qa.map((q) => q.q + q.a).join(' ') + c.body)],
        [1, norm(course?.title ?? '')],
      ] as [number, string][],
      chosung: toChosung(c.title),
    }
  }),
  ...COURSES.map((c) => {
    const note = noteOf(c.id)
    return {
      kind: 'course' as const,
      title: c.title,
      sub: note?.summary ?? '자료 대기',
      href: courseHref(c.id),
      courseId: c.id,
      fields: [
        [9, norm(c.title)],
        [5, norm(note?.keywords.join(' ') ?? '')],
        [3, norm(note?.summary ?? '')],
        [2, norm(c.instructors.join(' '))],
      ] as [number, string][],
      chosung: toChosung(c.title),
    }
  }),
  ...ALL_CONCEPTS.flatMap((c) =>
    c.qa.map((qa) => ({
      kind: 'question' as const,
      title: qa.q,
      sub: c.title,
      href: conceptHref(c) + '?qa',
      courseId: c.course,
      fields: [
        [5, norm(qa.q)],
        [1, norm(qa.a)],
      ] as [number, string][],
      chosung: toChosung(qa.q),
    })),
  ),
]

export interface Hit {
  item: SearchItem
  score: number
}

export function search(query: string, limit = 30): Hit[] {
  const q = norm(query)
  if (!q) return []
  const cho = isChosungQuery(q)
  const hits: Hit[] = []
  for (const item of ITEMS) {
    let score = 0
    if (cho) {
      const i = item.chosung.indexOf(q)
      if (i >= 0) score = 20 - Math.min(i, 10)
    } else {
      for (const [w, text] of item.fields) {
        if (!text) continue
        const i = text.indexOf(q)
        if (i < 0) continue
        let s = w * 10
        if (i === 0) s += w * 5
        if (text.length === q.length) s += w * 10
        score = Math.max(score, s)
      }
    }
    if (score > 0) {
      if (item.kind === 'concept') score += 3
      if (item.kind === 'question') score -= 2
      hits.push({ item, score })
    }
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit)
}
