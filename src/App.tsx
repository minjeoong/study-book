import { useCallback, useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { SearchDialog } from './components/SearchDialog'
import { Icon } from './components/Icon'
import { courseById, findConcept } from './lib/content'
import { useRoute, type Route } from './lib/router'
import { Home } from './pages/Home'
import { CoursePage } from './pages/CoursePage'
import { ConceptPage } from './pages/ConceptPage'
import { InterviewPage } from './pages/InterviewPage'
import { MaterialsPage } from './pages/MaterialsPage'
import { SchedulePage } from './pages/SchedulePage'
import { NotFound } from './pages/NotFound'

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
    case 'home':
      return 'SKALA 개념 노트'
    case 'schedule':
      return '교육 일정'
    case 'interview':
      return '면접 질문'
    case 'materials':
      return '자료실'
    case 'course':
      return courseById(route.course)?.title ?? '과목'
    case 'concept':
      return findConcept(route.course, route.slug)?.title ?? '개념'
    default:
      return 'SKALA 개념 노트'
  }
}

export default function App() {
  const route = useRoute()
  const [searchOpen, setSearchOpen] = useState(false)
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

  const openSearch = useCallback(() => setSearchOpen(true), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      } else if (e.key === '/' && !searchOpen) {
        const tag = (e.target as HTMLElement).tagName
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          e.preventDefault()
          setSearchOpen(true)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen])

  useEffect(() => {
    document.title = route.name === 'home' ? 'SKALA 개념 노트' : `${titleOf(route)} · SKALA 개념 노트`
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
    default:
      page = <NotFound />
  }

  return (
    <div className="shell">
      <Sidebar route={route} />

      <div className="main-col">
        <header className="topbar">
          <div className="topbar__left">
            <button className="icon-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label="메뉴 열기">
              <Icon name="menu" />
            </button>
            <span className="topbar__title">{titleOf(route)}</span>
          </div>
          <button className="search-trigger" onClick={openSearch}>
            <Icon name="search" />
            <span>개념, 질문, 과목 검색</span>
            <span className="kbd">Ctrl K</span>
          </button>
          <div className="topbar__right">
            <button className="icon-btn search-icon-btn" onClick={openSearch} aria-label="검색">
              <Icon name="search" />
            </button>
            <button className="icon-btn" onClick={toggleTheme} aria-label={isDark ? '밝은 화면으로' : '어두운 화면으로'}>
              <Icon name={isDark ? 'sun' : 'moon'} />
            </button>
          </div>
        </header>

        <main className="sheet" id="main">
          {page}
        </main>
      </div>

      {menuOpen && <div className="drawer-backdrop" onClick={() => setMenuOpen(false)} />}
      <div className="drawer" data-open={menuOpen} aria-hidden={!menuOpen} {...(menuOpen ? {} : { inert: '' })}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 8px 0' }}>
          <button className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기">
            <Icon name="close" />
          </button>
        </div>
        <Sidebar route={route} onNavigate={() => setMenuOpen(false)} />
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
