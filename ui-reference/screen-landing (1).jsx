// Screen 1: Landing — service intro
function ScreenLanding() {
  return (
    <Frame withTopBar={false}>
      <div style={{ height: 64, borderBottom: `1px solid ${P.border}`, background: P.surface, display: 'flex', alignItems: 'center', padding: '0 56px' }}>
        <Logo size={24}/>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <span style={{ fontSize: 13.5, color: P.textMuted }}>가이드</span>
          <span style={{ fontSize: 13.5, color: P.textMuted }}>공지사항</span>
          <span style={{ fontSize: 13.5, color: P.textMuted }}>로그인</span>
          <Btn kind="primary" size="md">시작하기</Btn>
        </div>
      </div>

      <div style={{ padding: '88px 56px 0', display: 'flex', gap: 56 }}>
        <div style={{ flex: 1, maxWidth: 540 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 11px 5px 9px', background: P.amberSoft, borderRadius: 999, marginBottom: 22 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: P.amber }}/>
            <span style={{ fontSize: 12, color: '#7e5a23', fontWeight: 600 }}>BETA · 무료 2회 제공</span>
          </div>
          <h1 style={{ fontSize: 52, lineHeight: 1.12, letterSpacing: -1, fontWeight: 700, margin: 0, color: P.text }}>
            모든 좋은 프로젝트엔<br/>
            <span style={{ color: P.accent }}>프리퀄</span>이 있다.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: P.textMuted, marginTop: 22, marginBottom: 32, maxWidth: 480 }}>
            AI가 먼저 질문하며 기획의 빈틈을 찾아냅니다.<br/>
            구조화된 인터뷰로 30분 안에 킥오프 문서와 아키텍처를 완성하세요.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn kind="primary" size="lg" icon={I.arrow} style={{ flexDirection: 'row-reverse' }}>무료로 시작하기</Btn>
            <Btn kind="secondary" size="lg">샘플 결과 보기</Btn>
          </div>

          <div style={{ display: 'flex', gap: 28, marginTop: 56, paddingTop: 24, borderTop: `1px solid ${P.border}` }}>
            {[
              ['7가지', '프로젝트 유형'],
              ['~30분', '평균 소요 시간'],
              ['$0.5', '회당 비용'],
            ].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 22, fontWeight: 700, color: P.text, letterSpacing: -0.5 }}>{n}</div>
                <div style={{ fontSize: 12.5, color: P.textSubtle, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right preview card */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{
            background: P.surface, border: `1px solid ${P.border}`, borderRadius: 14,
            boxShadow: '0 1px 0 rgba(0,0,0,.02), 0 24px 48px -20px rgba(40,30,20,.18)',
            padding: 22, position: 'relative', marginTop: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: P.accentSoft, color: P.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{I.spark}</div>
              <div style={{ fontSize: 12.5, color: P.textMuted, fontWeight: 500 }}>Prequel · 인터뷰 진행 중</div>
              <div style={{ flex: 1 }}/>
              <div style={{ fontFamily: MONO, fontSize: 11, color: P.textSubtle }}>3 / 10</div>
            </div>
            <div style={{ height: 3, background: P.surfaceAlt, borderRadius: 3, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ width: '30%', height: '100%', background: P.accent }}/>
            </div>

            <div style={{ background: P.surfaceAlt, borderRadius: 10, padding: '14px 16px', fontSize: 13.5, lineHeight: 1.55, color: P.text, marginBottom: 10 }}>
              주요 사용자는 누구이고, 어떤 상황에서 이 도구를 쓰게 될까요?
            </div>
            <div style={{ background: P.accent, color: '#fff', borderRadius: 10, padding: '14px 16px', fontSize: 13.5, lineHeight: 1.55, marginLeft: 60, marginBottom: 10 }}>
              사내 기획자들이 새 프로젝트를 시작할 때, 빠뜨린 부분이 없는지 확인하려고요.
            </div>
            <div style={{ background: P.surfaceAlt, borderRadius: 10, padding: '14px 16px', fontSize: 13.5, lineHeight: 1.55, color: P.text }}>
              "사내"라면 사용 빈도와 동시 사용자 수도 중요하겠네요. 대략 몇 명 정도 예상하시나요?
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <Tag tone="accent">Web App</Tag>
              <Tag>기획 단계</Tag>
              <Tag tone="amber">3분 30초 경과</Tag>
            </div>
          </div>

          {/* Floating card */}
          <div style={{
            position: 'absolute', right: -10, bottom: -28, width: 230,
            background: '#fff', border: `1px solid ${P.border}`, borderRadius: 12,
            padding: 14, boxShadow: '0 16px 32px -12px rgba(40,30,20,.2)',
            transform: 'rotate(2deg)',
          }}>
            <div style={{ fontSize: 11, color: P.textSubtle, fontFamily: MONO, marginBottom: 8 }}>아키텍처 자동 생성</div>
            <svg viewBox="0 0 200 100" width="100%" height="80">
              <rect x="10" y="10" width="60" height="22" rx="4" fill={P.accentSoft} stroke={P.accent}/>
              <rect x="130" y="10" width="60" height="22" rx="4" fill={P.surfaceAlt} stroke={P.borderStrong}/>
              <rect x="70" y="55" width="60" height="22" rx="4" fill={P.amberSoft} stroke={P.amber}/>
              <path d="M40 32 L100 55" stroke={P.borderStrong} fill="none"/>
              <path d="M160 32 L100 55" stroke={P.borderStrong} fill="none"/>
              <text x="40" y="25" fontSize="9" textAnchor="middle" fill={P.accent} fontWeight="600">React</text>
              <text x="160" y="25" fontSize="9" textAnchor="middle" fill={P.text}>FastAPI</text>
              <text x="100" y="69" fontSize="9" textAnchor="middle" fill="#7e5a23" fontWeight="600">Claude</text>
            </svg>
          </div>
        </div>
      </div>
    </Frame>
  );
}

window.ScreenLanding = ScreenLanding;
