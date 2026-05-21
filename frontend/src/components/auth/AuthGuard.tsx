import { Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'

const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

export default function AuthGuard() {
  const { session, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session && !DEV_BYPASS) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
