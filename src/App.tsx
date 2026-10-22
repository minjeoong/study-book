import { useCallback, useEffect, useState } from 'react'
import { RouteRail } from './components/RouteRail'
import { SearchDialog } from './components/SearchDialog'
import { Icon } from './components/Icon'
import { Code } from './components/Bits'
import { ALL_MATERIALS, ALL_QA, courseById, courseHref, findConcept } from './lib/content'
import { CLASS_DAYS, classOn, dayNumberIn, dayOff, nextClass, todayISO, weekday } from './lib/dates'
import { dot } from './lib/stations'
import { PROGRAM } from './data/schedule'
import { useRoute, type Route } from './lib/router'
import { Home } from './pages/Home'
import { CoursePage } from './pages/CoursePage'
import { ConceptPage } from './pages/ConceptPage'
import { InterviewPage } from './pages/InterviewPage'
import { MaterialsPage } from './pages/MaterialsPage'
import { SchedulePage } from './pages/SchedulePage'
import { NotFound } from './pages/NotFound'
import { MaterialViewer } from './pages/MaterialViewer'

type Theme = 'light' | 'dark' | null
const THEME_KEY = 'skala-notes:theme'

function readTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY)
    return t === 'light' || t === 'dark' ? t : null
  } catch {
    return null
  }
}

function titleOf(route: Route): string {
  switch (route.name) {
    case 'schedule':
      return '주간 일정'
    case 'interview':
      return '면접 질문'
    case 'materials':
      return '자료실'
    case 'course':
      return courseById(route.course)?.title ?? '과목'
    case 'concept':
      return findConcept(route.course, route.slug)?.title ?? '개념'
    case 'material':
      return '수업 자료'
    default:
      return ''
  }
}

const NAV: { name: Route['name']; href: string; label: string; count?: number }[] = [
  { name: 'home', href: '#/', label: '운행표' },
  { name: 'schedule', href: '#/schedule', label: '주간 일정' },
  { name: 'interview', href: '#/interview', label: '면접 질문', count: ALL_QA.length },
  { name: 'materials', href: '#/materials', label: '자료실', count: ALL_MATERIALS.length },
]

/** 검정 운행 정보 띠: 지금 어느 역인지 모든 화면에서 보여 준다 */
function ServiceBand() {
  const today = todayISO()
  const cls = classOn(today)
  const off = dayOff(today)
  // 다음 정차 = 지금 과목이 끝난 뒤 처음 만나는 다른 과목
  const next = cls ? CLASS_DAYS.find((d) => d.date > today && d.course.id !== cls.course.id) : nextClass(today)
  return (
    <div className="service" role="status">
      <div className="service__in">
        {cls ? (
          <>
            <span className="service__live">
              <span className="live-dot" aria-hidden="true" />
              운행 중
            </span>
            <span className="fig" style={{ fontSize: 16, fontWeight: 700 }}>
              {dot(today)}
            </span>
            <a href={courseHref(cls.course.id)}>
              <Code course={cls.course} />
              <span className="service__name">{cls.course.title}</span>
              {cls.course.days.length > 1 && (
                <span className="service__muted num">
                  {dayNumberIn(cls.course, today)} / {cls.course.days.length}일차
                </span>
              )}
            </a>
          </>
        ) : (
          <span className="service__muted">{off ? `오늘은 ${off.name} · 운휴` : '오늘은 수업이 없어요'}</span>
        )}
        {next && (
          <a href={courseHref(next.course.id)} style={{ marginLeft: 'auto' }}>
            <span className="service__muted">다음 정차</span>
            <span className="fig" style={{ fontSize: 16, fontWeight: 700 }}>
              {dot(next.date)}
            </span>
            <span className="service__muted">{weekday(next.date)}</span>
            <span className="service__name">{next.course.title}</span>
          </a>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const route = useRoute()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchSeed, setSearchSeed] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>(readTheme)

  const systemDark = typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme ? theme === 'dark' : systemDark

  useEffect(() => {
    const root = document.documentElement
    if (theme) root.dataset.theme = theme
    else delete root.dataset.theme
  }, [theme])

  const toggleTheme = () => {
    const next: Theme = isDark ? 'light' : 'dark'
    setTheme(next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      /* 저장 불가 환경: 이번 방문 동안만 적용 */
    }
  }

  const openSearch = useCallback((q?: string) => {
    setSearchSeed(typeof q === 'string' ? q : '')
    setSearchOpen(true)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchSeed('')
        setSearchOpen((o) => !o)
      } else if (e.key === '/' && !searchOpen) {
        const tag = (e.target as HTMLElement).tagName
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          e.preventDefault()
          setSearchSeed('')
          setSearchOpen(true)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen])

  useEffect(() => {
    const t = titleOf(route)
    document.title = t ? `${t} · SKALA 개념 노트` : 'SKALA 개념 노트'
    setMenuOpen(false)
  }, [route])

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? 'hidden' : ''
  }, [menuOpen, searchOpen])

  let page: React.ReactNode
  switch (route.name) {
    case 'home':
      page = <Home onSearch={openSearch} />
      break
    case 'schedule':
      page = <SchedulePage />
      break
    case 'interview':
      page = <InterviewPage initialCourse={route.course} />
      break
    case 'materials':
      page = <MaterialsPage />
      break
    case 'course':
      page = <CoursePage id={route.course} />
      break
    case 'concept':
      page = <ConceptPage course={route.course} slug={route.slug} focus={route.focus} />
      break
    case 'material':
      page = <MaterialViewer course={route.course} file={route.file} page={route.page} />
      break
    default:
      page = <NotFound />
  }

  const withRail = route.name === 'course' || route.name === 'concept' || route.name === 'material'
  const navCurrent = (n: Route['name']) => (route.name === n ? 'page' : undefined)

  return (
    <>
      <header className="mast">
        <div className="mast__in">
          <button className="mast__icon mast__menu" onClick={() => setMenuOpen(true)} aria-label="노선도와 메뉴 열기">
            <Icon name="menu" />
          </button>
          <a className="brand" href="#/">
            <span className="brand__mark" aria-hidden="true">
              S
            </span>
            <span className="brand__name">SKALA 개념 운행표</span>
          </a>
          <nav className="mast__nav" aria-label="주요 화면">
            {NAV.map((n) => (
              <a key={n.name} href={n.href} aria-current={navCurrent(n.name)}>
                {n.label}
                {n.count != null && <span className="count num">{n.count}</span>}
              </a>
            ))}
          </nav>
          <div className="mast__tools">
            <button className="mast__search" onClick={() => openSearch()}>
              <Icon name="search" />
              <span>역·개념·질문 찾기</span>
              <span className="kbd">Ctrl K</span>
            </button>
            <button className="mast__icon mast__search-icon" onClick={() => openSearch()} aria-label="검색">
              <Icon name="search" />
            </button>
            <button className="mast__icon" onClick={toggleTheme} aria-label={isDark ? '밝은 화면으로' : '어두운 화면으로'}>
              <Icon name={isDark ? 'sun' : 'moon'} />
            </button>
          </div>
        </div>
      </header>

      {route.name !== 'home' && <ServiceBand />}

      <div className="body" data-rail={withRail}>
        {withRail && <RouteRail route={route} />}
        <main className="main" id="main">
          {page}
        </main>
      </div>

      <footer className="foot">
        <div className="foot__in num">
          <span>SKALA 4기 · {dot(PROGRAM.start)} → {dot(PROGRAM.lastKnown)} 교육 달력 기준</span>
          <span>● 지남 · ◉ 운행 중 · ○ 예정</span>
          <span>A AI·LLM · D 데이터 · W 웹·백엔드 · I 인프라 · P 프로젝트·특강</span>
        </div>
      </footer>

      {menuOpen && <div className="drawer-backdrop" onClick={() => setMenuOpen(false)} />}
      <div className="drawer" data-open={menuOpen} aria-hidden={!menuOpen} {...(menuOpen ? {} : { inert: '' })}>
        <div className="drawer__close">
          <button onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기">
            <Icon name="close" />
          </button>
        </div>
        <nav className="drawer__nav" aria-label="주요 화면" onClick={() => setMenuOpen(false)}>
          {NAV.map((n) => (
            <a key={n.name} href={n.href} aria-current={navCurrent(n.name)}>
              {n.label}
              {n.count != null && <span className="num" style={{ color: 'var(--grey)', fontWeight: 400 }}>{n.count}</span>}
            </a>
          ))}
        </nav>
        <RouteRail route={route} onNavigate={() => setMenuOpen(false)} />
      </div>

      <SearchDialog open={searchOpen} initial={searchSeed} onClose={() => setSearchOpen(false)} />
    </>
  )
}
