import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'

const VALUE_PROPS = [
  '7가지 프로젝트 유형 자동 감지',
  '구조화된 인터뷰 (10~15 질문)',
  '킥오프 문서 + 아키텍처 다이어그램',
  '한국어·영어 지원',
]

export default function LoginPage() {
  const { session } = useAuthContext()
  const navigate = useNavigate()

  useEffect(() => {
    if (session) navigate('/projects', { replace: true })
  }, [session, navigate])

  const redirectTo = `${window.location.origin}/auth/callback`

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
  }

  async function loginWithGithub() {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo },
    })
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left brand panel */}
      <div className="w-full md:w-[420px] md:shrink-0 md:bg-surface-alt md:border-r border-border flex flex-col px-6 pt-8 md:px-12 md:py-14">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <span className="text-[15px] font-semibold text-text tracking-tight">Prequel</span>
        </div>

        {/* Center content */}
        <div className="md:flex-1 flex flex-col md:justify-center mt-6 md:mt-0">
          <div className="text-[13px] text-accent font-semibold font-mono mb-2 md:mb-3.5">
            STEP 1 / 4
          </div>
          <h2 className="text-[22px] md:text-[28px] leading-[1.25] tracking-tight font-bold text-text m-0">
            로그인하고 킥오프를 시작하세요.
          </h2>
          <p className="text-[13.5px] md:text-[14px] text-text-muted leading-relaxed mt-2 md:mt-[18px]">
            계정당 무료 킥오프 2회를 제공합니다. 결제 정보 없이 바로 시작할 수 있어요.
          </p>

          <ul className="hidden md:flex mt-8 flex-col gap-3 list-none p-0 m-0">
            {VALUE_PROPS.map((text) => (
              <li key={text} className="flex items-center gap-2.5 text-[13.5px] text-text">
                <span className="w-[18px] h-[18px] rounded-full bg-green-soft text-green flex items-center justify-center shrink-0">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12 5 5 9-11" />
                  </svg>
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer (desktop only — mobile has the same links in the terms notice below) */}
        <div className="hidden md:block text-[12px] text-text-subtle">
          &copy; 2026 Prequel &middot;{' '}
          <Link to="/terms" className="underline hover:text-text transition-colors">이용약관</Link> &middot;{' '}
          <Link to="/privacy" className="underline hover:text-text transition-colors">개인정보처리방침</Link>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col items-center md:flex-1 md:justify-center p-6 pt-10 pb-10 md:p-12">
        <div className="w-full max-w-[380px]">
          <div className="text-[12px] text-text-subtle font-mono mb-2.5">WELCOME</div>
          <h3 className="text-[24px] font-bold tracking-tight m-0 text-text">계정에 로그인</h3>
          <p className="text-[13.5px] text-text-muted mt-1.5 mb-7">
            소셜 계정으로 간편하게 시작할 수 있습니다.
          </p>

          {/* Google */}
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center gap-3 px-4 py-[13px] border border-border-strong rounded-[10px] bg-surface text-[14px] font-medium text-text hover:bg-surface-alt transition-colors cursor-pointer mb-2.5"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.32z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z" />
            </svg>
            Google로 계속하기
          </button>

          {/* GitHub */}
          <button
            onClick={loginWithGithub}
            className="w-full flex items-center gap-3 px-4 py-[13px] border border-border-strong rounded-[10px] bg-surface text-[14px] font-medium text-text hover:bg-surface-alt transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1c1f26">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55v-1.93c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.24 2.75.12 3.04.74.81 1.18 1.84 1.18 3.1 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.15v3.18c0 .3.21.66.8.55C20.22 21.38 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5z" />
            </svg>
            GitHub로 계속하기
          </button>

          {/* Terms notice */}
          <div className="mt-8 px-4 py-3.5 bg-surface-alt rounded-[10px] text-[12.5px] text-text-muted leading-relaxed">
            계속하면 <Link to="/terms" className="text-text underline hover:text-accent-deep transition-colors">이용약관</Link> 및{' '}
            <Link to="/privacy" className="text-text underline hover:text-accent-deep transition-colors">개인정보처리방침</Link>에
            동의하는 것으로 간주됩니다.
          </div>

          {/* Support */}
          <div className="mt-7 text-[12.5px] text-text-subtle text-center">
            문제가 있나요?{' '}
            <span className="text-accent font-medium">support@prequel.io</span>
          </div>
        </div>
      </div>
    </div>
  )
}
