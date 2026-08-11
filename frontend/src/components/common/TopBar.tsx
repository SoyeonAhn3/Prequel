import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'
import DeleteAccountModal from './DeleteAccountModal'

// 템플릿 갤러리는 미구현 계획 항목이라 탭을 두지 않는다.
// `/templates` 라우트가 없어 catch-all이 랜딩으로 되돌리므로, 탭이 있으면
// 로그인 사용자가 앱 밖으로 튕겨 나간다. 갤러리 구현 시 라우트와 함께 추가할 것.
const NAV_TABS = [
  { label: '내 프로젝트', path: '/projects' },
  { label: '공지사항', path: '/notices' },
  { label: '가이드', path: '/guide' },
]

export default function TopBar() {
  const { user, signOut } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  /** 계정이 사라진 뒤에는 남은 세션으로 아무것도 할 수 없으므로 즉시 로그아웃한다. */
  async function handleAccountDeleted() {
    setDeleteOpen(false)
    await signOut()
    navigate('/', { replace: true })
  }

  const devBypass = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'
  const creditsUsed = user?.credits_used ?? 0
  const freeLimit = 2

  const initials = user?.display_name
    ? user.display_name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? '?'

  const activePath = location.pathname

  return (
    <header
      className="h-14 border-b border-border bg-surface flex items-center px-7 gap-7 shrink-0"
    >
      {/* Logo */}
      <Link to="/projects" className="flex items-center gap-[9px] no-underline">
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="5" fill="var(--color-accent)" />
          <path
            d="M8 9 L8 15.5 M8 9 C8 9, 11.5 9, 12.5 9 C14 9, 14.5 10.2, 14.5 11.2 C14.5 12.5, 13.5 13.2, 12 13.2 L8 13.2"
            stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"
          />
          <circle cx="16" cy="15" r="1.4" fill="#fff" />
        </svg>
        <span className="font-semibold text-base text-text" style={{ letterSpacing: -0.2 }}>Prequel</span>
      </Link>

      {/* Nav tabs */}
      <nav className="flex gap-1">
        {[...NAV_TABS, ...(user?.role === 'admin' ? [{ label: '관리자', path: '/admin' }] : [])].map((t) => {
          const isActive = activePath.startsWith(t.path)
          return (
            <Link
              key={t.label}
              to={t.path}
              className={`text-[13.5px] px-3 py-[7px] rounded-[7px] no-underline transition-colors ${
                isActive
                  ? 'text-text font-semibold bg-surface-alt'
                  : 'text-text-muted font-medium hover:text-text hover:bg-surface-alt/50'
              }`}
            >
              {t.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex-1" />

      {/* Right section */}
      {user && (
        <div className="flex items-center gap-3.5">
          {/* Credits pill */}
          {!devBypass && (
            <div
              className="flex items-center gap-[9px] py-[5px] pl-[11px] pr-[7px] bg-accent-soft rounded-full"
              style={{ border: '1px solid color-mix(in srgb, var(--color-accent) 15%, transparent)' }}
            >
              <span className="text-[11.5px] font-semibold text-accent-deep" style={{ letterSpacing: -0.1 }}>
                잔여
              </span>
              <span className="inline-flex items-baseline gap-0.5 px-[9px] py-[3px] bg-surface rounded-full font-mono">
                <span className="text-[13px] font-bold text-accent" style={{ letterSpacing: -0.3 }}>
                  {Math.max(0, freeLimit - creditsUsed)}
                </span>
                <span className="text-[10.5px] text-text-subtle">/{freeLimit}</span>
              </span>
            </div>
          )}
          {devBypass && (
            <span className="text-xs text-text-muted bg-surface-alt px-2 py-1 rounded-md font-mono">
              dev mode
            </span>
          )}

          {/* Language */}
          <span className="text-[13px] text-text-muted">KO</span>

          {/* Avatar */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[13px] font-semibold cursor-pointer border-none"
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                initials
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-text truncate m-0">
                    {user.display_name || user.email}
                  </p>
                  <p className="text-xs text-text-muted truncate m-0 mt-0.5">{user.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-text hover:bg-bg transition-colors cursor-pointer bg-transparent border-none"
                >
                  로그아웃
                </button>
                {/* 관리자 본인 삭제는 서버에서 막혀 있으므로 메뉴에도 노출하지 않는다. */}
                {user.role !== 'admin' && (
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      setDeleteOpen(true)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red hover:bg-bg transition-colors cursor-pointer bg-transparent border-none border-t border-border"
                  >
                    계정 삭제
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {deleteOpen && user && (
        <DeleteAccountModal
          email={user.email}
          onClose={() => setDeleteOpen(false)}
          onDeleted={handleAccountDeleted}
        />
      )}
    </header>
  )
}
