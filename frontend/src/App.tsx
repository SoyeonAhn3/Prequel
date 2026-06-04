import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AuthGuard from './components/auth/AuthGuard'
import Layout from './components/common/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import MyProjectsPage from './pages/MyProjectsPage'
import InterviewPage from './pages/InterviewPage'
import DesignPage from './pages/DesignPage'
import FinalizePage from './pages/FinalizePage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Protected */}
          <Route element={<AuthGuard />}>
            <Route element={<Layout />}>
              <Route path="/projects" element={<MyProjectsPage />} />
            </Route>
            <Route path="/projects/:projectId/interview" element={<InterviewPage />} />
            <Route path="/projects/:projectId/design" element={<DesignPage />} />
            <Route path="/projects/:projectId/finalize" element={<FinalizePage />} />
          </Route>

          {/* Default */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
