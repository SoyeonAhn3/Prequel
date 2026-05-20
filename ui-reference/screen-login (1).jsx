// Screen 2: Login / OAuth
function ScreenLogin() {
  return (
    <Frame withTopBar={false}>
      <div style={{ height: '100%', display: 'flex' }}>
        {/* Left brand panel */}
        <div style={{ width: 420, background: P.surfaceAlt, padding: '56px 48px', borderRight: `1px solid ${P.border}`, display: 'flex', flexDirection: 'column' }}>
          <Logo size={26}/>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 13, color: P.accent, fontWeight: 600, marginBottom: 14, fontFamily: MONO }}>STEP 1 / 4</div>
            <h2 style={{ fontSize: 28, lineHeight: 1.25, letterSpacing: -0.5, margin: 0, fontWeight: 700 }}>
              로그인하고<br/>킥오프를 시작하세요.
            </h2>
            <p style={{ fontSize: 14, color: P.textMuted, lineHeight: 1.6, marginTop: 18 }}>
              계정당 무료 킥오프 2회를 제공합니다.<br/>
              결제 정보 없이 바로 시작할 수 있어요.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '32px 0 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['7가지 프로젝트 유형 자동 감지', '구조화된 인터뷰 (10~15 질문)', '킥오프 문서 + 아키텍처 다이어그램', '한국어·영어 지원'].map(t => (
                <li key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: P.text }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: P.greenSoft, color: P.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11"/></svg>
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ fontSize: 12, color: P.textSubtle }}>© 2026 Prequel · 이용약관 · 개인정보처리방침</div>
        </div>

        {/* Right form */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <div style={{ width: 380 }}>
            <div style={{ fontSize: 12, color: P.textSubtle, fontFamily: MONO, marginBottom: 10 }}>WELCOME</div>
            <h3 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.3, margin: 0 }}>계정에 로그인</h3>
            <p style={{ fontSize: 13.5, color: P.textMuted, marginTop: 6, marginBottom: 28 }}>
              소셜 계정으로 간편하게 시작할 수 있습니다.
            </p>

            {/* Google */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', border: `1px solid ${P.borderStrong}`, borderRadius: 10, background: P.surface, cursor: 'pointer', marginBottom: 10 }}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.32z"/>
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Google로 계속하기</span>
            </div>

            {/* GitHub */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', border: `1px solid ${P.borderStrong}`, borderRadius: 10, background: P.surface, cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1c1f26"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55v-1.93c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.24 2.75.12 3.04.74.81 1.18 1.84 1.18 3.1 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.15v3.18c0 .3.21.66.8.55C20.22 21.38 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg>
              <span style={{ fontSize: 14, fontWeight: 500 }}>GitHub로 계속하기</span>
            </div>

            <div style={{ marginTop: 32, padding: '14px 16px', background: P.surfaceAlt, borderRadius: 10, fontSize: 12.5, color: P.textMuted, lineHeight: 1.55 }}>
              계속하면 <span style={{ color: P.text, textDecoration: 'underline' }}>이용약관</span> 및 <span style={{ color: P.text, textDecoration: 'underline' }}>개인정보처리방침</span>에 동의하는 것으로 간주됩니다.
            </div>

            <div style={{ marginTop: 28, fontSize: 12.5, color: P.textSubtle, textAlign: 'center' }}>
              문제가 있나요? <span style={{ color: P.accent, fontWeight: 500 }}>support@prequel.io</span>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

window.ScreenLogin = ScreenLogin;
