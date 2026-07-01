import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AuthGuard from './components/auth/AuthGuard'
import Layout from './components/common/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import MyProjectsPage from './pages/MyProjectsPage'
import NoticesPage from './pages/NoticesPage'
import GuidePage from './pages/GuidePage'
import AdminPage from './pages/AdminPage'
import InterviewPage from './pages/InterviewPage'
import DesignPage from './pages/DesignPage'
import FinalizePage from './pages/FinalizePage'
import DocumentPreviewPage from './pages/DocumentPreviewPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Protected */}
          <Route element={<AuthGuard />}>
            <Route element={<Layout />}>
              <Route path="/projects" element={<MyProjectsPage />} />
              <Route path="/notices" element={<NoticesPage />} />
              <Route path="/guide" element={<GuidePage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
            <Route path="/projects/:projectId/interview" element={<InterviewPage />} />
            <Route path="/projects/:projectId/design" element={<DesignPage />} />
            <Route path="/projects/:projectId/finalize" element={<FinalizePage />} />
            <Route path="/projects/:projectId/document" element={<DocumentPreviewPage />} />
          </Route>

          {/* Default */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
