const loaded = new Map<string, Promise<void>>()

/** cdnjs 의 UMD 스크립트를 한 번만 불러온다 (Artifact CSP 가 허용하는 호스트) */
export function loadScript(src: string): Promise<void> {
  const hit = loaded.get(src)
  if (hit) return hit
  const p = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      loaded.delete(src)
      reject(new Error(`스크립트를 불러오지 못했어요: ${src}`))
    }
    document.head.appendChild(s)
  })
  loaded.set(src, p)
  return p
}
