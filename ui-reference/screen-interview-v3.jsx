// Screen 4 v3 · Interview — refined details
// Built on v2's "focused" structure. Adds:
//   1. AI persona (gradient "P" mark + name) for clearer identity
//   2. Phase indicator (1 of 3) above step indicator
//   3. Topic tag inside current question card
//   4. Stepper: completed steps show answer summary (single-line, italic)
//   5. Collapsible "예시 답변 보기" hint in question card
//   6. Bottom stats bar (elapsed time · avg answer time)
//   7. Captured info: "방금 추가됨" pulse hint for newest item

function ScreenInterviewV3() {
  const steps = [
    { t: '프로젝트 유형 감지', s: 'done', summary: 'AI/ML · 도서 추천' },
    { t: '주요 사용자', s: 'done', summary: '사내 직원 ~150명' },
    { t: '핵심 가치', s: 'done', summary: '독서 습관화, 부서 맞춤' },
    { t: '데이터 소스', s: 'active', q: 3, total: 3 },
    { t: '기술 스택', s: 'pending' },
    { t: '성공 지표', s: 'pending' },
    { t: '리스크', s: 'pending' },
    { t: '설계 인터뷰', s: 'pending' },
  ];

  const history = [
    { role: 'ai', text: '좋습니다. Slack 채널 또는 DM 중 어느 쪽을 우선하시나요?', q: 2, time: '14:28' },
    { role: 'user', text: '개인 DM 위주로요. 처음엔 부서별 인기 도서 기준으로 시작해도 괜찮습니다.', time: '14:31' },
  ];

  const captured = [
    { label: '주요 사용자', value: '사내 직원 ~150명' },
    { label: '발송 채널', value: 'Slack DM' },
    { label: '추천 기준', value: '부서별 인기 도서', isNew: true },
    { label: '데이터 소스', value: '⋯ 답변 중', pending: true },
  ];

  // Gradient "P" mark for the AI persona — slate accent
  const AiMark = ({ size = 32 }) => (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: `linear-gradient(135deg, ${P.accent} 0%, ${P.accentDeep} 100%)`,
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, fontFamily: FONT, fontWeight: 700,
      letterSpacing: -0.5, fontSize: size * 0.5,
      boxShadow: `0 1px 0 ${P.accent}40, inset 0 1px 0 rgba(255,255,255,.15)`,
    }}>P</div>
  );

  return (
    <Frame page="내 프로젝트">
      <div style={{ height: '100%', display: 'flex' }}>

        {/* ============================================================ */}
        {/* LEFT RAIL                                                     */}
        {/* ============================================================ */}
        <div style={{ width: 268, borderRight: `1px solid ${P.border}`, background: P.surface, padding: '22px 18px', overflow: 'auto', flexShrink: 0 }}>
          {/* AI persona */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, borderBottom: `1px solid ${P.border}` }}>
            <AiMark size={36}/>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: P.text, letterSpacing: -0.2 }}>Prequel</div>
              <div style={{ fontSize: 11.5, color: P.textMuted, marginTop: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: P.green, boxShadow: `0 0 0 3px ${P.greenSoft}` }}/>
                인터뷰 진행 중
              </div>
            </div>
          </div>

          {/* Project meta */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 10.5, color: P.textSubtle, fontFamily: MONO, marginBottom: 6, letterSpacing: 0.4 }}>PROJECT</div>
            <div style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: -0.2, color: P.text }}>사내 도서 추천 봇</div>
            <div style={{ display: 'flex', gap: 5, marginTop: 7 }}>
              <Tag tone="accent">AI/ML</Tag>
              <Tag>KO</Tag>
            </div>
          </div>

          {/* Progress chip with phase indicator */}
          <div style={{ marginTop: 18, padding: '14px 14px 12px', background: P.accentSoft, borderRadius: 12, border: `1px solid ${P.accent}25` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontFamily: MONO, color: P.accentDeep, fontWeight: 700, letterSpacing: 0.5 }}>PHASE 1 of 3</span>
              <div style={{ flex: 1 }}/>
              <div style={{ display: 'flex', gap: 3 }}>
                <span style={{ width: 18, height: 3, background: P.accent, borderRadius: 2 }}/>
                <span style={{ width: 18, height: 3, background: P.accent, opacity: 0.3, borderRadius: 2 }}/>
                <span style={{ width: 18, height: 3, background: P.accent, opacity: 0.3, borderRadius: 2 }}/>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: P.accent, letterSpacing: -0.8, fontFamily: MONO, lineHeight: 1 }}>3</span>
              <span style={{ fontSize: 14, color: P.accentDeep, opacity: 0.6, fontFamily: MONO }}>/ 10</span>
              <div style={{ flex: 1 }}/>
              <span style={{ fontSize: 11, color: P.accentDeep, fontWeight: 600 }}>기획 인터뷰</span>
            </div>
            <div style={{ height: 5, background: P.surface, borderRadius: 5, overflow: 'hidden', marginTop: 9 }}>
              <div style={{ width: '30%', height: '100%', background: P.accent, borderRadius: 5 }}/>
            </div>
            <div style={{ marginTop: 9, fontSize: 11, color: P.accentDeep, display: 'flex', alignItems: 'center', gap: 5, opacity: 0.85 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              남은 시간 약 8분
            </div>
          </div>

          {/* Vertical stepper with answer summaries */}
          <div style={{ marginTop: 22, position: 'relative' }}>
            <div style={{ fontSize: 10.5, color: P.textSubtle, fontFamily: MONO, marginBottom: 12, letterSpacing: 0.4 }}>STEPS</div>
            <div style={{ position: 'absolute', left: 8.5, top: 32, bottom: 8, width: 1, background: P.border }}/>

            {steps.map((step, i) => {
              const isActive = step.s === 'active';
              const isDone = step.s === 'done';
              return (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: isDone ? P.green : isActive ? P.accent : P.surface,
                    color: isDone || isActive ? '#fff' : P.textSubtle,
                    border: !isDone && !isActive ? `1.5px solid ${P.borderStrong}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, position: 'relative', zIndex: 1,
                    boxShadow: isActive ? `0 0 0 4px ${P.accentSoft}` : 'none',
                  }}>
                    {isDone ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11"/></svg>
                    ) : isActive ? (
                      <span style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%' }}/>
                    ) : (
                      <span style={{ fontSize: 9.5, fontWeight: 700, fontFamily: MONO }}>{i + 1}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, paddingTop: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? P.text : isDone ? P.text : P.textSubtle,
                      lineHeight: 1.35,
                    }}>{step.t}</div>
                    {isActive && (
                      <div style={{ fontSize: 11, color: P.accent, fontWeight: 600, marginTop: 3, fontFamily: MONO }}>
                        질문 {step.q}/{step.total}
                      </div>
                    )}
                    {isDone && step.summary && (
                      <div style={{
                        fontSize: 11, color: P.textMuted, marginTop: 2,
                        fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{step.summary}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* CENTER                                                        */}
        {/* ============================================================ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: P.bg }}>
          {/* Top bar — breadcrumb + actions */}
          <div style={{ padding: '11px 28px', borderBottom: `1px solid ${P.border}`, background: P.surface, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: P.textSubtle, fontFamily: MONO, letterSpacing: 0.4 }}>STEP 04</span>
            <span style={{ fontSize: 12.5, color: P.text, fontWeight: 600 }}>데이터 소스</span>
            <span style={{ fontSize: 12, color: P.textSubtle }}>›</span>
            <span style={{ fontSize: 12, color: P.textMuted }}>3번째 질문</span>
            <div style={{ flex: 1 }}/>
            <button style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'transparent', color: P.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
            </button>
            <Btn kind="ghost" size="sm" icon={I.pause}>일시정지</Btn>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '22px 28px 0' }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>

              {/* HISTORY */}
              <div style={{ opacity: 0.55, marginBottom: 4 }}>
                <div style={{ fontSize: 10.5, color: P.textSubtle, fontFamily: MONO, marginBottom: 10, letterSpacing: 0.4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>이전 대화</span>
                  <span style={{ flex: 1, height: 1, background: P.border }}/>
                  <span style={{ color: P.accent, cursor: 'pointer', fontWeight: 600 }}>모두 보기 (4)</span>
                </div>
                {history.map((m, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                    marginBottom: 10,
                  }}>
                    {m.role === 'ai' ? <AiMark size={26}/> : (
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: P.surfaceAlt, color: P.text, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 600 }}>서</div>
                    )}
                    <div style={{ maxWidth: 480 }}>
                      <div style={{
                        background: m.role === 'user' ? P.accent : P.surface,
                        color: m.role === 'user' ? '#fff' : P.text,
                        border: m.role === 'user' ? 'none' : `1px solid ${P.border}`,
                        borderRadius: 10, padding: '10px 14px', fontSize: 13, lineHeight: 1.55,
                      }}>{m.text}</div>
                      <div style={{
                        fontSize: 10.5, color: P.textSubtle, marginTop: 3, fontFamily: MONO,
                        textAlign: m.role === 'user' ? 'right' : 'left', paddingLeft: m.role === 'user' ? 0 : 4,
                      }}>{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CURRENT QUESTION — refined */}
              <div style={{ marginTop: 14, marginBottom: 18 }}>
                <div style={{ fontSize: 10.5, color: P.accent, fontWeight: 700, fontFamily: MONO, marginBottom: 9, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: P.accent, boxShadow: `0 0 0 4px ${P.accentSoft}` }}/>
                  지금 답변할 질문 · QUESTION 03
                  <span style={{ flex: 1 }}/>
                  <span style={{ color: P.textSubtle, fontWeight: 500 }}>14:34</span>
                </div>

                <div style={{
                  background: P.surface,
                  border: `1.5px solid ${P.accent}`,
                  borderRadius: 14,
                  boxShadow: `0 1px 0 rgba(0,0,0,.02), 0 10px 28px -14px ${P.accent}40`,
                  overflow: 'hidden',
                }}>
                  {/* Header strip with topic tags */}
                  <div style={{ padding: '12px 24px', background: P.accentSoft, borderBottom: `1px solid ${P.accent}20`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10.5, fontFamily: MONO, color: P.accentDeep, fontWeight: 700, letterSpacing: 0.4 }}>주제</span>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', background: P.surface, borderRadius: 999, fontSize: 11.5, fontWeight: 600, color: P.accent }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>
                      데이터 출처
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', background: P.surface, borderRadius: 999, fontSize: 11.5, fontWeight: 600, color: P.accent }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      측정 지표
                    </div>
                    <div style={{ flex: 1 }}/>
                    <span style={{ fontSize: 11, color: P.accentDeep, opacity: 0.7 }}>중요도 높음</span>
                  </div>

                  {/* Question body */}
                  <div style={{ padding: '22px 24px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <AiMark size={36}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.55, color: P.text, letterSpacing: -0.15 }}>
                        명확하네요. 그럼 데이터 소스는 사내 도서 DB가 될 것 같은데, <strong style={{ color: P.accent }}>책 정보는 어디서 가져오시나요?</strong> 그리고 추천 결과의 정확도는 어떻게 측정하실 계획인지요?
                      </div>
                      {/* Inline hint — expandable */}
                      <div style={{ marginTop: 14, padding: '10px 12px', background: P.surfaceAlt, borderRadius: 9, border: `1px solid ${P.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 600, color: P.textMuted, cursor: 'pointer' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.66 9a4 4 0 1 1 4.68 4.68"/><path d="M12 17h.01"/><path d="M12 13v.01"/></svg>
                          예시 답변 보기
                          <div style={{ flex: 1 }}/>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${P.border}`, fontSize: 12, color: P.textMuted, lineHeight: 1.65 }}>
                          <div style={{ marginBottom: 5 }}>• <span style={{ color: P.text }}>책 정보</span>: 사내 도서관 시스템 API, 외부 도서 메타데이터(교보문고/예스24)</div>
                          <div style={{ marginBottom: 5 }}>• <span style={{ color: P.text }}>정확도</span>: 클릭률(CTR), 읽음 완료율, 사용자 만족도 설문</div>
                          <div>• <span style={{ color: P.text }}>측정 주기</span>: 주간 / 월간 대시보드</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, fontSize: 11, color: P.textSubtle }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          평균 1분
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          답변 → 2개 인사이트 추출
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick chips */}
                  <div style={{ display: 'flex', gap: 8, padding: '14px 24px 18px', borderTop: `1px solid ${P.border}` }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', fontSize: 13, fontWeight: 600,
                      background: P.accent, color: '#fff', borderRadius: 999, cursor: 'pointer',
                      boxShadow: `0 2px 8px -2px ${P.accent}50`,
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/><circle cx="12" cy="12" r="4"/></svg>
                      AI 추천받기
                    </div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', fontSize: 13, fontWeight: 500,
                      background: P.surface, color: P.text, border: `1px solid ${P.borderStrong}`,
                      borderRadius: 999, cursor: 'pointer',
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
                      건너뛰기
                    </div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', fontSize: 13, fontWeight: 500,
                      background: P.surface, color: P.text, border: `1px solid ${P.borderStrong}`,
                      borderRadius: 999, cursor: 'pointer',
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                      다시 질문해줘
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* INPUT + STATS BAR */}
          <div style={{ padding: '0 28px 18px', background: P.bg }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <div style={{
                background: P.surface,
                border: `1.5px solid ${P.accent}`,
                borderRadius: 14,
                padding: '14px 16px 10px',
                boxShadow: `0 0 0 4px ${P.accentSoft}, 0 2px 12px -4px rgba(28, 31, 38, .08)`,
              }}>
                <div style={{ fontSize: 14, color: P.text, lineHeight: 1.6, minHeight: 56, fontFamily: FONT }}>
                  사내 도서관 시스템에서 직접 가져올 예정이에요. 정확도는 처음에는 클릭률(CTR)로<span style={{ display: 'inline-block', width: 1.5, height: 16, background: P.accent, marginLeft: 2, verticalAlign: 'text-bottom', animation: 'blink 1s infinite' }}/>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, paddingTop: 8, borderTop: `1px solid ${P.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: P.textSubtle }}>
                    <kbd style={{ fontFamily: MONO, fontSize: 10, padding: '2px 6px', background: P.surfaceAlt, borderRadius: 4, border: `1px solid ${P.border}`, color: P.textMuted }}>Enter</kbd>
                    전송
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: P.textSubtle }}>
                    <kbd style={{ fontFamily: MONO, fontSize: 10, padding: '2px 6px', background: P.surfaceAlt, borderRadius: 4, border: `1px solid ${P.border}`, color: P.textMuted }}>Shift</kbd>
                    <span>+</span>
                    <kbd style={{ fontFamily: MONO, fontSize: 10, padding: '2px 6px', background: P.surfaceAlt, borderRadius: 4, border: `1px solid ${P.border}`, color: P.textMuted }}>Enter</kbd>
                    줄바꿈
                  </div>
                  <div style={{ flex: 1 }}/>
                  <span style={{ fontSize: 11, color: P.textSubtle, fontFamily: MONO }}>53 / 500</span>
                  <Btn kind="primary" size="sm" icon={I.send}>전송</Btn>
                </div>
              </div>

              {/* Stats bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 10, padding: '0 4px', fontSize: 11, color: P.textSubtle }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  진행 시간 <span style={{ color: P.text, fontWeight: 600, fontFamily: MONO }}>12:04</span>
                </span>
                <span style={{ width: 3, height: 3, background: P.borderStrong, borderRadius: '50%' }}/>
                <span>답변 <span style={{ color: P.text, fontWeight: 600, fontFamily: MONO }}>3개</span></span>
                <span style={{ width: 3, height: 3, background: P.borderStrong, borderRadius: '50%' }}/>
                <span>평균 답변 시간 <span style={{ color: P.text, fontWeight: 600, fontFamily: MONO }}>1분 8초</span></span>
                <div style={{ flex: 1 }}/>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: P.green }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: P.green }}/>
                  순조롭게 진행 중
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT — captured insights, refined                            */}
        {/* ============================================================ */}
        <div style={{ width: 284, borderLeft: `1px solid ${P.border}`, background: P.surface, padding: '22px 18px', overflow: 'auto', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={P.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: P.text, letterSpacing: -0.1 }}>수집된 정보</div>
            <div style={{ flex: 1 }}/>
            <Tag tone="accent">{captured.filter(c => !c.pending).length}/8</Tag>
          </div>
          <div style={{ fontSize: 11.5, color: P.textMuted, lineHeight: 1.55 }}>
            답변에 따라 자동으로 킥오프 문서가 작성됩니다
          </div>

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {captured.map((c, i) => {
              if (c.pending) {
                return (
                  <div key={i} style={{
                    padding: '11px 13px', borderRadius: 9,
                    border: `1px dashed ${P.accent}80`, background: P.accentSoft + '40',
                  }}>
                    <div style={{ fontSize: 10.5, fontFamily: MONO, color: P.accent, letterSpacing: 0.4, marginBottom: 4, fontWeight: 700 }}>
                      {c.label.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 12.5, color: P.accentDeep, lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ display: 'inline-flex', gap: 2 }}>
                        {[0, 1, 2].map(d => (
                          <span key={d} style={{
                            width: 4, height: 4, borderRadius: '50%', background: P.accent,
                            animation: `blink 1.2s infinite ${d * 0.15}s`,
                          }}/>
                        ))}
                      </span>
                      답변 중
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} style={{
                  padding: '11px 13px', background: c.isNew ? P.greenSoft : P.surfaceAlt,
                  borderRadius: 9, border: c.isNew ? `1px solid ${P.green}30` : `1px solid transparent`,
                  position: 'relative',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <div style={{ fontSize: 10.5, fontFamily: MONO, color: P.textSubtle, letterSpacing: 0.4, flex: 1 }}>
                      {c.label.toUpperCase()}
                    </div>
                    {c.isNew && (
                      <span style={{
                        fontSize: 9.5, fontFamily: MONO, fontWeight: 700,
                        padding: '2px 6px', borderRadius: 4, background: P.green, color: '#fff',
                        letterSpacing: 0.3,
                      }}>NEW</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: P.text, fontWeight: 500, lineHeight: 1.5 }}>{c.value}</div>
                </div>
              );
            })}
          </div>

          {/* Document preview CTA */}
          <button style={{
            width: '100%', marginTop: 16, padding: '10px 12px',
            background: P.surface, color: P.accent, fontWeight: 600,
            border: `1px solid ${P.accent}40`, borderRadius: 9, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            fontSize: 12.5, fontFamily: FONT,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            문서 미리보기
          </button>

          <div style={{ marginTop: 14, padding: '11px 13px', background: P.accentSoft, borderRadius: 10, fontSize: 11.5, color: P.accentDeep, lineHeight: 1.55, border: `1px solid ${P.accent}15` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 3 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              자동 저장됨 · 방금 전
            </div>
            <div style={{ opacity: 0.85 }}>브라우저를 닫아도 안전합니다</div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

window.ScreenInterviewV3 = ScreenInterviewV3;
