import { Link } from 'react-router-dom'
import Markdown from './Markdown'

interface LegalPageProps {
  title: string
  content: string
}

// 로그인 없이 접근하는 공용 법적 페이지 레이아웃 (약관·개인정보처리방침 공유).
export default function LegalPage({ title, content }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="h-16 border-b border-border bg-surface">
        <div className="max-w-[820px] mx-auto px-4 sm:px-8 h-full flex items-center">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="text-[15px] font-semibold text-text tracking-tight">Prequel</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[820px] mx-auto px-4 sm:px-8 py-8 sm:py-14">
        <h1 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-text mb-6 sm:mb-8">{title}</h1>
        <div className="bg-surface border border-border rounded-xl p-5 sm:p-8 text-[13px]">
          <Markdown>{content}</Markdown>
        </div>
        <div className="mt-8">
          <Link
            to="/"
            className="text-[13.5px] text-accent hover:text-accent-deep transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  )
}
