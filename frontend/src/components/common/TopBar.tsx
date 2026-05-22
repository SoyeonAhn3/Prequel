import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'

export default function TopBar() {
  const { user, signOut } = useAuthContext()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
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

  const devBypass = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'
  const quotaLabel = devBypass
    ? 'dev mode'
    : user?.plan === 'free'
      ? `${user.free_used}/2 free`
      : user?.plan

  const initials = user?.display_name
    ? user.display_name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link to="/projects" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <span className="font-semibold text-text">Prequel</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-4">
            <Link to="/projects" className="text-sm text-text-muted hover:text-text transition-colors">
              프로젝트
            </Link>
          </nav>
        </div>

        {/* Right: Quota + Avatar */}
        <div className="flex items-center gap-3">
          {quotaLabel && (
            <span className="text-xs text-text-muted bg-bg px-2 py-1 rounded-md">
              {quotaLabel}
            </span>
          )}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full overflow-hidden border border-border cursor-pointer"
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-accent flex items-center justify-center">
                  <span className="text-white text-xs font-medium">{initials}</span>
                </div>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg py-1">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-text truncate">
                    {user?.display_name || user?.email}
                  </p>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-bg transition-colors cursor-pointer"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
