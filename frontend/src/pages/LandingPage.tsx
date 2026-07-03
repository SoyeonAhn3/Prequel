import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="h-16 border-b border-border bg-surface">
        <div className="max-w-[1280px] mx-auto px-14 h-full flex items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <span className="text-[15px] font-semibold text-text tracking-tight">Prequel</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-6">
          <Link to="/guide" className="text-[13.5px] text-text-muted hover:text-text transition-colors">가이드</Link>
          <Link to="/notices" className="text-[13.5px] text-text-muted hover:text-text transition-colors">공지사항</Link>
          <Link to="/login" className="text-[13.5px] text-text-muted hover:text-text transition-colors">로그인</Link>
          <Link
            to="/login"
            className="px-4 py-2 bg-accent text-white text-[13.5px] font-medium rounded-lg hover:bg-accent-deep transition-colors"
          >
            시작하기
          </Link>
        </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-[1280px] mx-auto px-14 pt-[88px] flex gap-14">
        {/* Left content */}
        <div className="flex-1 max-w-[540px] flex flex-col justify-center pb-[10%]" style={{ minHeight: 'calc(100vh - 64px - 88px - 65px)' }}>
          {/* Beta badge */}
          <div className="inline-flex items-center gap-1.5 py-[4px] pr-[9px] pl-[7px] bg-accent-soft rounded-full mb-[22px] w-fit">
            <span className="w-[6px] h-[6px] rounded-full bg-accent shrink-0" />
            <span className="text-[13px] text-accent-deep font-semibold whitespace-nowrap">BETA · 무료 2회 제공</span>
          </div>

          <h1 className="text-[52px] leading-[1.12] tracking-tight font-bold m-0 text-text">
            모든 좋은 프로젝트엔<br />
            <span className="text-accent">프리퀄</span>이 있다.
          </h1>

          <p className="text-[17px] leading-relaxed text-text-muted mt-[22px] mb-8 max-w-[480px]">
            AI가 먼저 질문하며 기획의 빈틈을 찾아냅니다.<br />
            구조화된 인터뷰로 킥오프 문서와 아키텍처를 완성하세요.
          </p>

          <div className="flex gap-2.5">
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-3 bg-accent text-white text-[15px] font-medium rounded-lg hover:bg-accent-deep transition-colors"
            >
              무료로 시작하기
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <button
              disabled
              title="준비 중입니다 (MVP-2)"
              className="px-6 py-3 bg-surface border border-border text-text-subtle text-[15px] font-medium rounded-lg opacity-60 cursor-not-allowed"
            >
              샘플 결과 보기
            </button>
          </div>

        </div>

        {/* Right preview card */}
        <div className="flex-1 relative">
          <div
            className="bg-surface border border-border rounded-[14px] p-[22px] relative mt-3"
            style={{ boxShadow: '0 1px 0 rgba(0,0,0,.02), 0 24px 48px -20px rgba(40,30,20,.18)' }}
          >
            {/* Card header */}
            <div className="flex items-center gap-2 mb-3.5">
              <div className="w-7 h-7 rounded-[7px] bg-accent-soft text-accent flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61z" />
                </svg>
              </div>
              <div className="text-[12.5px] text-text-muted font-medium">Prequel · 인터뷰 진행 중</div>
              <div className="flex-1" />
              <div className="font-mono text-[11px] text-text-subtle">3 / 10</div>
            </div>

            {/* Progress bar */}
            <div className="h-[3px] bg-surface-alt rounded-full overflow-hidden mb-5">
              <div className="w-[30%] h-full bg-accent" />
            </div>

            {/* Chat bubbles */}
            <div className="bg-surface-alt rounded-[10px] px-4 py-3.5 text-[13.5px] leading-relaxed text-text mb-2.5">
              주요 사용자는 누구이고, 어떤 상황에서 이 도구를 쓰게 될까요?
            </div>
            <div className="bg-accent text-white rounded-[10px] px-4 py-3.5 text-[13.5px] leading-relaxed ml-[60px] mb-2.5">
              사내 기획자들이 새 프로젝트를 시작할 때, 빠뜨린 부분이 없는지 확인하려고요.
            </div>
            <div className="bg-surface-alt rounded-[10px] px-4 py-3.5 text-[13.5px] leading-relaxed text-text">
              "사내"라면 사용 빈도와 동시 사용자 수도 중요하겠네요. 대략 몇 명 정도 예상하시나요?
            </div>

            {/* Tags */}
            <div className="flex gap-2 mt-4">
              <span className="px-2.5 py-1 text-[11.5px] font-medium rounded-md bg-accent-soft text-accent">Web App</span>
              <span className="px-2.5 py-1 text-[11.5px] font-medium rounded-md bg-surface-alt text-text-muted">기획 단계</span>
            </div>
          </div>

          {/* Floating architecture card */}
          <div
            className="ml-auto mt-2.5 w-[230px] bg-white border border-border rounded-xl p-3.5"
            style={{
              boxShadow: '0 16px 32px -12px rgba(40,30,20,.2)',
              transform: 'rotate(2deg)',
            }}
          >
            <div className="text-[11px] text-text-subtle font-mono mb-2">아키텍처 자동 생성</div>
            <svg viewBox="0 0 200 100" width="100%" height="80">
              <rect x="10" y="10" width="60" height="22" rx="4" fill="#e6edf3" stroke="#4a6b8a" />
              <rect x="130" y="10" width="60" height="22" rx="4" fill="#eff1f5" stroke="#c8cdd6" />
              <rect x="70" y="55" width="60" height="22" rx="4" fill="#f1e4cd" stroke="#c08a3e" />
              <path d="M40 32 L100 55" stroke="#c8cdd6" fill="none" />
              <path d="M160 32 L100 55" stroke="#c8cdd6" fill="none" />
              <text x="40" y="25" fontSize="9" textAnchor="middle" fill="#4a6b8a" fontWeight="600">React</text>
              <text x="160" y="25" fontSize="9" textAnchor="middle" fill="#1c1f26">FastAPI</text>
              <text x="100" y="69" fontSize="9" textAnchor="middle" fill="#7e5a23" fontWeight="600">Claude</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-[1280px] mx-auto px-14 h-16 flex items-center gap-5 text-[12.5px] text-text-subtle">
          <span>&copy; 2026 Prequel</span>
          <Link to="/terms" className="hover:text-text transition-colors">이용약관</Link>
          <Link to="/privacy" className="hover:text-text transition-colors">개인정보처리방침</Link>
          <Link to="/guide" className="hover:text-text transition-colors">가이드</Link>
        </div>
      </footer>
    </div>
  )
}
