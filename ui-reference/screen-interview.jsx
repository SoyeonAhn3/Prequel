// Screen 4: Interview chat — the core experience
function ScreenInterview() {
  const messages = [
    { role: 'ai', text: '안녕하세요! 새 프로젝트 "사내 도서 추천 봇"의 킥오프를 시작할게요.\n먼저 이 도구를 사용할 주요 사용자는 누구일까요?', step: 1 },
    { role: 'user', text: '저희 회사 직원들이 사용할 거고요, 매주 한 권씩 책을 추천받고 싶어해요. Slack에서 쓰는 게 가장 편할 것 같아요.' },
    { role: 'ai', text: '좋습니다. Slack 채널 또는 DM 중 어느 쪽을 우선하시나요? 또 추천 기준에 사용자 본인의 독서 이력이 반영되어야 하는지 궁금합니다.', step: 2 },
    { role: 'user', text: '개인 DM 위주로요. 본인 독서 이력이 있으면 더 정확하겠지만, 처음엔 부서별 인기 도서 기준으로 시작해도 괜찮습니다.' },
    { role: 'ai', text: '명확하네요. 그럼 데이터 소스는 사내 도서 DB가 될 것 같은데, 책 정보는 어디서 가져오시나요? 그리고 추천 결과의 정확도는 어떻게 측정하실 계획인지요?', step: 3, latest: true },
  ];

  return (
    <Frame page="내 프로젝트">
      <div style={{ height: '100%', display: 'flex' }}>
        {/* Left rail: progress */}
        <div style={{ width: 280, borderRight: `1px solid ${P.border}`, background: P.surface, padding: '28px 22px', overflow: 'auto', flexShrink: 0 }}>
          <div style={{ fontSize: 11.5, color: P.textSubtle, fontFamily: MONO, marginBottom: 6 }}>PROJECT</div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2 }}>사내 도서 추천 봇</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <Tag tone="accent">AI/ML</Tag>
            <Tag>KO</Tag>
          </div>

          <div style={{ marginTop: 28, padding: '12px 14px', background: P.surfaceAlt, borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
              <span style={{ color: P.textMuted, fontWeight: 500 }}>진행률</span>
              <span style={{ color: P.text, fontWeight: 600, fontFamily: MONO }}>3 / 10</span>
            </div>
            <div style={{ height: 5, background: '#fff', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ width: '30%', height: '100%', background: P.accent, borderRadius: 5 }}/>
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 11.5, color: P.textSubtle, fontFamily: MONO, marginBottom: 10 }}>STEPS</div>
            {[
              ['프로젝트 유형 감지', 'done'],
              ['주요 사용자', 'done'],
              ['핵심 가치', 'done'],
              ['데이터 소스', 'active'],
              ['기술 스택', 'pending'],
              ['성공 지표', 'pending'],
              ['리스크', 'pending'],
              ['설계 인터뷰', 'pending'],
            ].map(([t, s], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 0', fontSize: 13 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: s === 'done' ? P.green : s === 'active' ? P.accent : P.surfaceAlt,
                  color: s === 'pending' ? P.textSubtle : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600, border: s === 'pending' ? `1px solid ${P.border}` : 'none',
                }}>
                  {s === 'done' ? '✓' : s === 'active' ? <span style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%' }}/> : i + 1}
                </div>
                <span style={{ color: s === 'pending' ? P.textSubtle : P.text, fontWeight: s === 'active' ? 600 : 500 }}>{t}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, padding: '11px 13px', background: P.amberSoft, borderRadius: 9, fontSize: 11.5, color: '#946420', lineHeight: 1.55 }}>
            <strong>자동 저장됨</strong> · 2초 전<br/>
            언제든 일시정지 후 이어할 수 있어요.
          </div>
        </div>

        {/* Center: chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ padding: '16px 32px', borderBottom: `1px solid ${P.border}`, background: P.surface, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: P.textSubtle, fontFamily: MONO }}>PHASE 1 · PLANNING</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>기획 인터뷰</div>
            </div>
            <div style={{ flex: 1 }}/>
            <Btn kind="ghost" size="sm" icon={I.pause}>일시정지</Btn>
            <Btn kind="secondary" size="sm">건너뛰기</Btn>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '32px 32px 24px', background: P.bg }}>
            <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                  {m.role === 'ai' ? (
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: P.accentSoft, color: P.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{I.spark}</div>
                  ) : (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: P.surfaceAlt, color: P.text, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 600 }}>서</div>
                  )}
                  <div style={{ maxWidth: 520 }}>
                    {m.step !== undefined && (
                      <div style={{ fontSize: 10.5, color: P.textSubtle, fontFamily: MONO, marginBottom: 6, letterSpacing: 0.5 }}>QUESTION {m.step}</div>
                    )}
                    <div style={{
                      background: m.role === 'user' ? P.accent : P.surface,
                      color: m.role === 'user' ? '#fff' : P.text,
                      border: m.role === 'user' ? 'none' : `1px solid ${P.border}`,
                      borderRadius: 12, padding: '13px 16px', fontSize: 14, lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      boxShadow: m.role === 'ai' ? '0 1px 0 rgba(0,0,0,.02)' : 'none',
                    }}>{m.text}</div>
                    {m.latest && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                        <div style={{ padding: '5px 11px', fontSize: 12, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 999, color: P.textMuted, cursor: 'pointer' }}>💡 추천해줘</div>
                        <div style={{ padding: '5px 11px', fontSize: 12, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 999, color: P.textMuted, cursor: 'pointer' }}>건너뛰기</div>
                        <div style={{ padding: '5px 11px', fontSize: 12, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 999, color: P.textMuted, cursor: 'pointer' }}>다시 질문</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '14px 32px 22px', background: P.bg }}>
            <div style={{ maxWidth: 720, margin: '0 auto', background: P.surface, border: `1px solid ${P.borderStrong}`, borderRadius: 14, padding: '14px 16px 12px', boxShadow: '0 2px 12px -4px rgba(40,30,20,.08)' }}>
              <div style={{ fontSize: 14, color: P.textSubtle, lineHeight: 1.55, minHeight: 48 }}>
                답변을 입력하세요. 잘 모르시면 "추천해줘"라고 말씀해주세요.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <span style={{ fontSize: 11.5, color: P.textSubtle, fontFamily: MONO }}>Shift+Enter 줄바꿈 · Enter 전송</span>
                <div style={{ flex: 1 }}/>
                <Btn kind="primary" size="md" icon={I.send}>전송</Btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

window.ScreenInterview = ScreenInterview;
