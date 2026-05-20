import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { apiFetch } from '../lib/api'

export default function AuthCallbackPage() {
  const { session, user, refetchProfile } = useAuthContext()
  const navigate = useNavigate()
  const [agreeing, setAgreeing] = useState(false)

  useEffect(() => {
    if (!session) return

    if (user) {
      if (!user.agreed_terms_at && !agreeing) {
        agreeAndRedirect()
      } else if (user.agreed_terms_at) {
        navigate('/projects', { replace: true })
      }
    }
  }, [session, user])

  async function agreeAndRedirect() {
    setAgreeing(true)
    try {
      await apiFetch('/users/me/agree-terms', { method: 'POST' })
      await refetchProfile()
      navigate('/projects', { replace: true })
    } catch {
      navigate('/projects', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-muted text-sm">로그인 처리 중...</p>
      </div>
    </div>
  )
}
