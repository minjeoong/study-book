// 1.6px 외곽선 아이콘 한 벌 (24 그리드)
const PATHS: Record<string, string> = {
  home: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z',
  search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20.5 20.5 16 16',
  calendar: 'M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4',
  question: 'M4.5 5.5h15v10h-8l-4.5 4v-4h-2.5zM10 9a2 2 0 1 1 2.6 1.9c-.4.2-.6.5-.6.9V12M12 14.2v.1',
  folder: 'M3.5 7a1.5 1.5 0 0 1 1.5-1.5h4.2l2 2H19a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  chevron: 'm9 6 6 6-6 6',
  back: 'm15 6-6 6 6 6',
  sun: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4',
  moon: 'M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z',
  slides: 'M4 5h16v11H4zM12 16v4M8.5 20h7',
  notebook: 'M6 3.5h11.5a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6zM6 3.5v17M9 8h6.5M9 11.5h6.5',
  lab: 'M9.5 3.5h5M10.5 3.5v6L5 18.5a1.3 1.3 0 0 0 1.1 2h11.8a1.3 1.3 0 0 0 1.1-2l-5.5-9v-6M7.5 14.5h9',
  file: 'M6.5 3.5h7l4 4v13h-11zM13.5 3.5v4h4',
  shuffle: 'M4 7h3.5c2 0 3 1 4.2 3l1.6 3c1.1 2 2.2 3 4.2 3H20M17 13.5l3 2.5-3 2.5M4 17h3.5c1.3 0 2.2-.5 3-1.3M13.8 8.3c.8-.8 1.7-1.3 3-1.3H20M17 4.5 20 7l-3 2.5',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  download: 'M12 4v11M7 10.5l5 5 5-5M5 19.5h14',
}

export type IconName = keyof typeof PATHS

export function Icon({ name, title }: { name: IconName; title?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      <path d={PATHS[name]} />
    </svg>
  )
}

/** 제품 마크: 책갈피가 꽂힌 노트 */
export function BrandMark() {
  return (
    <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="3" y="3" width="26" height="26" rx="8" fill="currentColor" />
      <path d="M11 9.5h10a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H11z" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M17 9.5v6.5l-2-1.6-2 1.6V9.5" fill="#fff" />
    </svg>
  )
}
