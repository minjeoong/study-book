import yaml from 'js-yaml'
import { COURSES, type Course } from '../data/schedule'

export interface QA {
  q: string
  a: string
}

export interface Concept {
  course: string
  slug: string
  title: string
  en?: string
  summary: string
  importance: 1 | 2 | 3
  order: number
  tags: string[]
  keypoints: string[]
  qa: QA[]
  related: string[]
  source?: string
  body: string
}

export type MaterialType = 'slides' | 'notebook' | 'lab' | 'etc'

export interface Material {
  course: string
  file: string
  title: string
  type: MaterialType
  date?: string
  url: string
}

export interface CourseNote {
  course: string
  summary: string
  keywords: string[]
  materials: Material[]
  body: string
}

const files = import.meta.glob('/content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function splitFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const m = raw.replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return { data: {}, body: raw }
  let data: Record<string, unknown> = {}
  try {
    data = (yaml.load(m[1]) as Record<string, unknown>) ?? {}
  } catch (err) {
    console.error('frontmatter parse error', err)
  }
  return { data, body: m[2].trim() }
}

const str = (v: unknown, fallback = ''): string => (v == null ? fallback : String(v))
const list = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => String(x)) : v ? [String(v)] : [])

const conceptsByCourse = new Map<string, Concept[]>()
const notesByCourse = new Map<string, CourseNote>()

for (const [path, raw] of Object.entries(files)) {
  const m = path.match(/^\/content\/([^/]+)\/([^/]+)\.md$/)
  if (!m) continue
  const [, course, name] = m
  const { data, body } = splitFrontmatter(raw)

  if (name === 'index') {
    const materials = (Array.isArray(data.materials) ? data.materials : []).map((x) => {
      const it = x as Record<string, unknown>
      const file = str(it.file)
      return {
        course,
        file,
        title: str(it.title, file),
        type: (str(it.type, 'etc') as MaterialType),
        date: it.date ? normalizeDate(it.date) : undefined,
        url: `materials/${course}/${file}`,
      }
    })
    notesByCourse.set(course, {
      course,
      summary: str(data.summary),
      keywords: list(data.keywords),
      materials,
      body,
    })
    continue
  }

  const imp = Number(data.importance)
  const concept: Concept = {
    course,
    slug: name,
    title: str(data.title, name),
    en: data.en ? str(data.en) : undefined,
    summary: str(data.summary),
    importance: (imp === 1 || imp === 2 || imp === 3 ? imp : 2) as 1 | 2 | 3,
    order: Number(data.order) || 99,
    tags: list(data.tags),
    keypoints: list(data.keypoints),
    qa: (Array.isArray(data.qa) ? data.qa : [])
      .map((x) => x as Record<string, unknown>)
      .filter((x) => x && x.q)
      .map((x) => ({ q: str(x.q), a: str(x.a) })),
    related: list(data.related),
    source: data.source ? str(data.source) : undefined,
    body,
  }
  const arr = conceptsByCourse.get(course) ?? []
  arr.push(concept)
  conceptsByCourse.set(course, arr)
}

for (const arr of conceptsByCourse.values()) {
  arr.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'ko'))
}

// js-yaml 은 2026-07-15 를 Date 로 읽는다
function normalizeDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return String(v)
}

export function conceptsOf(courseId: string): Concept[] {
  return conceptsByCourse.get(courseId) ?? []
}

export function noteOf(courseId: string): CourseNote | undefined {
  return notesByCourse.get(courseId)
}

export function hasNotes(courseId: string): boolean {
  return notesByCourse.has(courseId) || conceptsByCourse.has(courseId)
}

export function courseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id)
}

export function findConcept(courseId: string, slug: string): Concept | undefined {
  return conceptsOf(courseId).find((c) => c.slug === slug)
}

/** related 항목은 `slug` (같은 과목) 또는 `course-id/slug` */
export function resolveRelated(from: Concept): Concept[] {
  const out: Concept[] = []
  for (const ref of from.related) {
    const [a, b] = ref.includes('/') ? ref.split('/') : [from.course, ref]
    const hit = findConcept(a, b)
    if (hit && hit !== from) out.push(hit)
  }
  return out
}

/** 일정 순서대로 모든 개념 */
export const ALL_CONCEPTS: Concept[] = COURSES.flatMap((c) => conceptsOf(c.id))

export const ALL_MATERIALS: Material[] = COURSES.flatMap((c) => noteOf(c.id)?.materials ?? [])

export const ALL_QA: { concept: Concept; qa: QA; key: string }[] = ALL_CONCEPTS.flatMap((concept) =>
  concept.qa.map((qa, i) => ({ concept, qa, key: `${concept.course}/${concept.slug}#${i}` })),
)

export function conceptHref(c: Concept): string {
  return `#/c/${c.course}/${c.slug}`
}

export function courseHref(id: string): string {
  return `#/c/${id}`
}
