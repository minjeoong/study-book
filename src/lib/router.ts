import { useEffect, useState } from 'react'

export type Route =
  | { name: 'home' }
  | { name: 'schedule' }
  | { name: 'interview'; course?: string }
  | { name: 'materials' }
  | { name: 'course'; course: string }
  | { name: 'concept'; course: string; slug: string; focus?: string }
  | { name: 'material'; course: string; file: string; page?: number }
  | { name: 'notfound' }

export function parseHash(hash: string): Route {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?')
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent)
  if (parts.length === 0) return { name: 'home' }
  if (parts[0] === 'schedule') return { name: 'schedule' }
  if (parts[0] === 'interview') return { name: 'interview', course: new URLSearchParams(query).get('course') ?? undefined }
  if (parts[0] === 'materials') return { name: 'materials' }
  if (parts[0] === 'm' && parts.length === 3) {
    const p = Number(new URLSearchParams(query).get('p'))
    return { name: 'material', course: parts[1], file: parts[2], page: p > 0 ? p : undefined }
  }
  if (parts[0] === 'c' && parts.length === 2) return { name: 'course', course: parts[1] }
  if (parts[0] === 'c' && parts.length === 3) return { name: 'concept', course: parts[1], slug: parts[2], focus: query || undefined }
  return { name: 'notfound' }
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(location.hash))
  useEffect(() => {
    const onChange = () => {
      const next = parseHash(location.hash)
      setRoute(next)
      if (!(next.name === 'concept' && next.focus) && !(next.name === 'material' && next.page)) window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function go(href: string) {
  location.hash = href.replace(/^#/, '')
}
