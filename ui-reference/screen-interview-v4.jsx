// Screen 4 v4 · Interview — phase transition flow
// Shows three key states of the inter-phase handoff:
//   A. AI proposes next sub-step (정직한 평가 + 완료 조건) — user must accept
//   B. Phase 1 complete — modal asks about Phase 2 (Design)
//   C. User declined Phase 2 — Gap analysis + Checklist branch shown
//
// Built on V3 layout (left rail · center chat · right captured insights).

// ============================================================
// Shared layout primitives reused across the V4 states
// ============================================================

const V4_PALETTE_STEPS_BASE = [
  { t: '프로젝트 유형 감지', s: 'done', summary: 'AI/ML · 도서 추천' },
  { t: '주요 사용자', s: 'done', summary: '사내 직원 ~150명' },
  { t: '핵심 가치', s: 'done', summary: '독서 습관화, 부서 맞춤' },
  { t: '데이터 소스', s: 'done', summary: '사내 도서관 API + CTR 측정' },
];

const AiMarkV4 = ({ size = 32 }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.28,
    background: `linear-gradient(135deg, ${P.accent} 0%, ${P.accentDeep} 100%)`,
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, fontFamily: FONT, fontWeight: 700,
    letterSpacing: -0.5, fontSize: size * 0.5,
    boxShadow: `0 1px 0 ${P.accent}40, inset 0 1px 0 rgba(255,255,255,.15)`,
  }}>P</div>
);

// Left rail (configurable: which steps exist, which is active)
function V4LeftRail({ steps, progress, totalSteps, phaseLabel = '기획 인터뷰', phaseNum = 1 }) {
  return (
    <div style={{ width: 268, borderRight: `1px solid ${P.border}`, background: P.surface, padding: '22px 18px', overflow: 'auto', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, borderBottom: `1px solid ${P.border}` }}>
        <AiMarkV4 size={36}/>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: P.text, letterSpacing: -0.2 }}>Prequel</div>
          <div style={{ fontSize: 11.5, color: P.textMuted, marginTop: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: P.green, boxShadow: `0 0 0 3px ${P.greenSoft}` }}/>
            인터뷰 진행 중
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 10.5, color: P.textSubtle, fontFamily: MONO, marginBottom: 6, letterSpacing: 0.4 }}>PROJECT</div>
        <div style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: -0.2, color: P.text }}>사내 도서 추천 봇</div>
        <div style={{ display: 'flex', gap: 5, marginTop: 7 }}>
          <Tag tone="accent">AI/ML</Tag>
          <Tag>KO</Tag>
        </div>
      </div>

      <div style={{ marginTop: 18, padding: '14px 14px 12px', background: P.accentSoft, borderRadius: 12, border: `1px solid ${P.accent}25` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontFamily: MONO, color: P.accentDeep, fontWeight: 700, letterSpacing: 0.5 }}>PHASE {phaseNum} of 3</span>
          <div style={{ flex: 1 }}/>
          <div style={{ display: 'flex', gap: 3 }}>
            {[1, 2, 3].map(n => (
              <span key={n} style={{ width: 18, height: 3, background: P.accent, opacity: n <= phaseNum ? 1 : 0.3, borderRadius: 2 }}/>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: P.accent, letterSpacing: -0.8, fontFamily: MONO, lineHeight: 1 }}>{progress}</span>
          <span style={{ fontSize: 14, color: P.accentDeep, opacity: 0.6, fontFamily: MONO }}>/ {totalSteps}</span>
          <div style={{ flex: 1 }}/>
          <span style={{ fontSize: 11, color: P.accentDeep, fontWeight: 600 }}>{phaseLabel}</span>
        </div>
        <div style={{ height: 5, background: P.surface, borderRadius: 5, overflow: 'hidden', marginTop: 9 }}>
          <div style={{ width: `${(progress / totalSteps) * 100}%`, height: '100%', background: P.accent, borderRadius: 5 }}/>
        </div>
      </div>

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
                  fontSize: 13, fontWeight: isActive ? 600 : 500,
                  color: isActive ? P.text : isDone ? P.text : P.textSubtle, lineHeight: 1.35,
                }}>{step.t}</div>
                {isDone && step.summary && (
                  <div style={{
                    fontSize: 11, color: P.textMuted, marginTop: 2, fontStyle: 'italic',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{step.summary}</div>
                )}
                {isActive && step.note && (
                  <div style={{ fontSize: 11, color: P.accent, fontWeight: 600, marginTop: 3, fontFamily: MONO }}>{step.note}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function V4TopBar({ stepLabel, stepDetail }) {
  return (
    <div style={{ padding: '11px 28px', borderBottom: `1px solid ${P.border}`, background: P.surface, display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 11, color: P.textSubtle, fontFamily: MONO, letterSpacing: 0.4 }}>{stepLabel}</span>
      <span style={{ fontSize: 12, color: P.textSubtle }}>›</span>
      <span style={{ fontSize: 12, color: P.text, fontWeight: 600 }}>{stepDetail}</span>
      <div style={{ flex: 1 }}/>
      <Btn kind="ghost" size="sm" icon={I.pause}>일시정지</Btn>
    </div>
  );
}

// ============================================================
// State A · AI proposes next sub-step (evaluation + done-criteria)
// ============================================================
function ScreenInterviewV4Propose() {
  const steps = [
    ...V4_PALETTE_STEPS_BASE,
    { t: '기술 스택', s: 'done', summary: 'React + FastAPI + Supabase' },
    { t: '성공 지표', s: 'done', summary: 'WAU 60%, CTR 25%' },
    { t: '리스크', s: 'done', summary: '큐레이션 책임자 미정' },
    { t: '정직한 평가', s: 'next', note: '다음 단계' },
    { t: '완료 조건', s: 'next' },
  ];

  return (
    <Frame page="내 프로젝트">
      <div style={{ height: '100%', display: 'flex' }}>
        <V4LeftRail steps={steps.map(s => s.s === 'next' ? { ...s, s: 'pending' } : s)} progress={7} totalSteps={9}/>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: P.bg }}>
          <V4TopBar stepLabel="STEP 08" stepDetail="다음 단계 안내"/>

          <div style={{ flex: 1, overflow: 'auto', padding: '22px 28px 0' }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              {/* AI proposal card */}
              <div style={{ fontSize: 10.5, color: P.accent, fontWeight: 700, fontFamily: MONO, marginBottom: 10, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: P.accent, boxShadow: `0 0 0 4px ${P.accentSoft}` }}/>
                AI 제안 · 다음 단계
              </div>

              <div style={{
                background: P.surface, border: `1.5px solid ${P.accent}`, borderRadius: 14,
                boxShadow: `0 1px 0 rgba(0,0,0,.02), 0 10px 28px -14px ${P.accent}40`, overflow: 'hidden',
              }}>
                {/* Phase 1 summary */}
                <div style={{ padding: '14px 22px', background: P.greenSoft + '60', borderBottom: `1px solid ${P.green}30`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: P.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11"/></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: TONE_FG.green }}>아이디어 제안 단계 완료</span>
                    <span style={{ fontSize: 11.5, color: TONE_FG.green, opacity: 0.85, marginLeft: 8 }}>· 7 / 9 단계</span>
                  </div>
                  <span style={{ fontSize: 11, color: TONE_FG.green, fontFamily: MONO, opacity: 0.7 }}>12분 04초</span>
                </div>

                <div style={{ padding: '22px 24px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <AiMarkV4 size={36}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 600, lineHeight: 1.6, color: P.text, letterSpacing: -0.1 }}>
                      좋습니다! 핵심 정보를 잘 정리했어요. 이어서 <strong style={{ color: P.accent }}>정직한 평가</strong>와 <strong style={{ color: P.accent }}>완료 조건 생성</strong>을 진행할까요? 약 5분 정도 소요됩니다.
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                      {[
                        { n: '08', t: '정직한 평가', d: '범위 명확성, 실현성 등 5가지 기준으로 산출물 자체 평가' },
                        { n: '09', t: '완료 조건 (DoD)', d: 'MVP-1 / MVP-2 체크리스트와 KPI 정의' },
                      ].map((s) => (
                        <div key={s.n} style={{
                          display: 'flex', gap: 12, padding: '12px 14px',
                          background: P.surfaceAlt, borderRadius: 10,
                          border: `1px solid ${P.border}`,
                        }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 8, background: P.surface,
                            color: P.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: MONO, fontSize: 11, fontWeight: 700, flexShrink: 0,
                            border: `1px solid ${P.accent}30`,
                          }}>{s.n}</div>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: P.text }}>{s.t}</div>
                            <div style={{ fontSize: 12, color: P.textMuted, marginTop: 2, lineHeight: 1.5 }}>{s.d}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 11, fontSize: 11.5, color: P.textSubtle }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      예상 소요 시간 약 5분
                    </div>
                  </div>
                </div>

                {/* CTA buttons */}
                <div style={{ display: 'flex', gap: 10, padding: '16px 24px 20px', borderTop: `1px solid ${P.border}`, background: P.surfaceAlt }}>
                  <button style={{
                    flex: 1, padding: '12px 18px', fontSize: 14, fontWeight: 600,
                    background: P.accent, color: '#fff', border: 'none', borderRadius: 10,
                    cursor: 'pointer', boxShadow: `0 2px 8px -2px ${P.accent}50`,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'inherit',
                  }}>
                    네, 진행할게요
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                  </button>
                  <button style={{
                    padding: '12px 18px', fontSize: 14, fontWeight: 500,
                    background: P.surface, color: P.text, border: `1px solid ${P.borderStrong}`, borderRadius: 10,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>나중에</button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '14px 28px 22px', background: P.bg }}>
            <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10, fontSize: 11.5, color: P.textSubtle }}>
              <span>버튼을 눌러 응답하거나, 자유롭게 입력하세요</span>
              <div style={{ flex: 1 }}/>
              <span style={{ fontFamily: MONO }}>진행 시간 12:04 · 답변 7개</span>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ============================================================
// State B · Phase 1 complete — Design phase prompt modal
// ============================================================
function ScreenInterviewV4PhaseModal() {
  const steps = [
    ...V4_PALETTE_STEPS_BASE,
    { t: '기술 스택', s: 'done', summary: 'React + FastAPI + Supabase' },
    { t: '성공 지표', s: 'done', summary: 'WAU 60%, CTR 25%' },
    { t: '리스크', s: 'done', summary: '큐레이션 책임자 미정' },
    { t: '정직한 평가', s: 'done', summary: '평균 3.9 / 5 · 보강 권장' },
    { t: '완료 조건', s: 'done', summary: 'MVP-1 5개 / MVP-2 4개' },
  ];

  return (
    <Frame page="내 프로젝트">
      <div style={{ height: '100%', display: 'flex', position: 'relative' }}>
        <V4LeftRail steps={steps} progress={9} totalSteps={9} phaseLabel="아이디어 완료" phaseNum={1}/>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: P.bg }}>
          <V4TopBar stepLabel="PHASE 1" stepDetail="아이디어 제안 완료"/>

          <div style={{ flex: 1, overflow: 'auto', padding: '22px 28px 0', filter: 'blur(2px) saturate(0.7)', opacity: 0.7 }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                <AiMarkV4 size={32}/>
                <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: '12px 16px', fontSize: 13, color: P.text }}>
                  정직한 평가와 완료 조건이 모두 정리되었어요!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal backdrop */}
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(28, 31, 38, 0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
          backdropFilter: 'blur(2px)',
        }}>
          <div style={{
            width: 520, background: P.surface, borderRadius: 18,
            boxShadow: '0 24px 60px -16px rgba(28, 31, 38, .4), 0 0 0 1px ' + P.border, overflow: 'hidden',
          }}>
            {/* Celebration header */}
            <div style={{
              padding: '28px 28px 20px',
              background: `linear-gradient(160deg, ${P.accentSoft} 0%, ${P.surface} 100%)`,
              borderBottom: `1px solid ${P.border}`,
              textAlign: 'center',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `linear-gradient(135deg, ${P.accent} 0%, ${P.accentDeep} 100%)`,
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
                boxShadow: `0 8px 24px -8px ${P.accent}80`,
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11"/></svg>
              </div>
              <div style={{ fontSize: 11, fontFamily: MONO, color: P.accent, fontWeight: 700, letterSpacing: 0.6, marginBottom: 6 }}>PHASE 1 COMPLETE</div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3, color: P.text }}>아이디어 제안 완료!</div>
              <div style={{ fontSize: 13, color: P.textMuted, marginTop: 6, lineHeight: 1.55 }}>
                킥오프 문서 초안이 완성되었습니다.<br/>다음은 <strong style={{ color: P.text }}>설계 단계</strong>로 넘어갈까요?
              </div>
            </div>

            <div style={{ padding: '20px 28px 16px' }}>
              <div style={{ fontSize: 11, fontFamily: MONO, color: P.textSubtle, marginBottom: 12, letterSpacing: 0.4 }}>다음 단계 · PHASE 2</div>
              <div style={{ padding: '14px 16px', background: P.accentSoft, borderRadius: 10, border: `1px solid ${P.accent}25`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: P.surface, color: P.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${P.accent}30` }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22v-9.5L12 6l9 6.5V22"/><path d="M11 22v-7h2v7"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: P.accentDeep }}>설계 단계</div>
                  <div style={{ fontSize: 12, color: P.accent, marginTop: 3, lineHeight: 1.55, opacity: 0.85 }}>
                    기능 분해 · 아키텍처 · 데이터 모델 · AI 워크플로우를 함께 설계합니다. 약 20분 소요.
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 14, padding: '10px 12px', background: P.surfaceAlt, borderRadius: 8, fontSize: 11.5, color: P.textMuted, lineHeight: 1.55, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                지금 멈춰도 괜찮아요. 누락된 부분 점검이나 개발 착수 체크리스트를 먼저 받을 수도 있습니다.
              </div>
            </div>

            <div style={{ padding: '16px 28px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button style={{
                width: '100%', padding: '14px 18px', fontSize: 14.5, fontWeight: 700,
                background: P.accent, color: '#fff', border: 'none', borderRadius: 10,
                cursor: 'pointer', boxShadow: `0 4px 12px -2px ${P.accent}60`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit',
              }}>
                네, 설계 단계로 진행
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </button>
              <button style={{
                width: '100%', padding: '11px 18px', fontSize: 13.5, fontWeight: 500,
                background: P.surface, color: P.text, border: `1px solid ${P.borderStrong}`, borderRadius: 10,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>아니오, 보강만 도와주세요</button>
              <button style={{
                width: '100%', padding: '8px', fontSize: 12.5, fontWeight: 500,
                background: 'transparent', color: P.textMuted, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}>나중에 결정</button>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ============================================================
// State C · User declined Phase 2 — Gap + Checklist branch
// ============================================================
function ScreenInterviewV4GapBranch() {
  const steps = [
    ...V4_PALETTE_STEPS_BASE,
    { t: '기술 스택', s: 'done', summary: 'React + FastAPI + Supabase' },
    { t: '성공 지표', s: 'done', summary: 'WAU 60%, CTR 25%' },
    { t: '리스크', s: 'done', summary: '큐레이션 책임자 미정' },
    { t: '정직한 평가', s: 'done', summary: '평균 3.9 / 5 · 보강 권장' },
    { t: '완료 조건', s: 'done', summary: 'MVP-1 5개 / MVP-2 4개' },
    { t: '누락 점검 (Gap)', s: 'done', summary: '3개 항목 발견' },
    { t: '착수 체크리스트', s: 'active', note: '진행 중 · 질문 2/4' },
  ];

  return (
    <Frame page="내 프로젝트">
      <div style={{ height: '100%', display: 'flex' }}>
        <V4LeftRail steps={steps} progress={10} totalSteps={11} phaseLabel="보강 진행 중" phaseNum={1}/>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: P.bg }}>
          <V4TopBar stepLabel="STEP 11" stepDetail="개발 착수 체크리스트"/>

          <div style={{ flex: 1, overflow: 'auto', padding: '22px 28px 0' }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              {/* Branch context banner */}
              <div style={{
                padding: '12px 16px', background: P.surfaceAlt, borderRadius: 10,
                border: `1px solid ${P.border}`, marginBottom: 18,
                display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: P.textMuted,
              }}>
                <span style={{
                  padding: '3px 9px', background: P.surface, color: P.accent, fontWeight: 600,
                  fontSize: 11, fontFamily: MONO, borderRadius: 4, border: `1px solid ${P.accent}20`,
                }}>BRANCH</span>
                설계 단계는 건너뛰고 보강 작업을 진행하고 있습니다 · <span style={{ color: P.accent, fontWeight: 500, cursor: 'pointer' }}>설계로 전환</span>
              </div>

              {/* Past Gap completion */}
              <div style={{ opacity: 0.55, marginBottom: 14 }}>
                <div style={{ fontSize: 10.5, color: P.textSubtle, fontFamily: MONO, marginBottom: 10, letterSpacing: 0.4 }}>완료된 단계</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <AiMarkV4 size={26}/>
                  <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
                    <code style={{ fontFamily: MONO, fontSize: 11, background: P.accentSoft, color: P.accent, padding: '1px 6px', borderRadius: 4, marginRight: 6 }}>/kickoff-gap</code>
                    완료 · 3개 누락 항목과 1개 모순을 찾았어요. <span style={{ color: P.accent, cursor: 'pointer' }}>리포트 보기</span>
                  </div>
                </div>
              </div>

              {/* Current — checklist question */}
              <div style={{ fontSize: 10.5, color: P.accent, fontWeight: 700, fontFamily: MONO, marginBottom: 9, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: P.accent, boxShadow: `0 0 0 4px ${P.accentSoft}` }}/>
                지금 답변할 질문 · QUESTION 02 / 04
                <span style={{ flex: 1 }}/>
                <code style={{ fontFamily: MONO, fontSize: 11, background: P.surfaceAlt, color: P.textMuted, padding: '2px 7px', borderRadius: 4, fontWeight: 600, letterSpacing: 0 }}>/kickoff-checklist</code>
              </div>

              <div style={{
                background: P.surface, border: `1.5px solid ${P.accent}`, borderRadius: 14,
                boxShadow: `0 1px 0 rgba(0,0,0,.02), 0 10px 28px -14px ${P.accent}40`, overflow: 'hidden',
              }}>
                <div style={{ padding: '12px 24px', background: P.accentSoft, borderBottom: `1px solid ${P.accent}20`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10.5, fontFamily: MONO, color: P.accentDeep, fontWeight: 700, letterSpacing: 0.4 }}>주제</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', background: P.surface, borderRadius: 999, fontSize: 11.5, fontWeight: 600, color: P.accent }}>
                    프로젝트 구조
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', background: P.surface, borderRadius: 999, fontSize: 11.5, fontWeight: 600, color: P.accent }}>
                    .env 변수
                  </div>
                </div>

                <div style={{ padding: '22px 24px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <AiMarkV4 size={36}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 600, lineHeight: 1.55, color: P.text, letterSpacing: -0.1 }}>
                      개발 환경에서 사용할 <strong style={{ color: P.accent }}>환경 변수(.env)</strong>는 어떤 것들이 필요할까요? Claude API 키, Supabase URL, Slack 토큰 정도를 생각해 볼 수 있어요.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, padding: '14px 24px 18px', borderTop: `1px solid ${P.border}` }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', fontSize: 13, fontWeight: 600,
                    background: P.accent, color: '#fff', borderRadius: 999, cursor: 'pointer',
                    boxShadow: `0 2px 8px -2px ${P.accent}50`,
                  }}>AI 추천받기</div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', fontSize: 13, fontWeight: 500,
                    background: P.surface, color: P.text, border: `1px solid ${P.borderStrong}`,
                    borderRadius: 999, cursor: 'pointer',
                  }}>건너뛰기</div>
                  <div style={{ flex: 1 }}/>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', fontSize: 13, fontWeight: 500,
                    background: P.surface, color: P.accent, border: `1px solid ${P.accent}40`,
                    borderRadius: 999, cursor: 'pointer',
                  }}>설계 단계로 전환</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '14px 28px 22px', background: P.bg }}>
            <div style={{ maxWidth: 760, margin: '0 auto', background: P.surface, border: `1.5px solid ${P.accent}`, borderRadius: 14, padding: '14px 16px 10px', boxShadow: `0 0 0 4px ${P.accentSoft}, 0 2px 12px -4px rgba(28, 31, 38, .08)` }}>
              <div style={{ fontSize: 14, color: P.textSubtle, lineHeight: 1.6, minHeight: 40 }}>
                ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY...
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, paddingTop: 8, borderTop: `1px solid ${P.border}` }}>
                <span style={{ fontSize: 11, color: P.textSubtle, fontFamily: MONO }}>Enter 전송 · Shift+Enter 줄바꿈</span>
                <div style={{ flex: 1 }}/>
                <Btn kind="primary" size="sm" icon={I.send}>전송</Btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

window.ScreenInterviewV4Propose = ScreenInterviewV4Propose;
window.ScreenInterviewV4PhaseModal = ScreenInterviewV4PhaseModal;
window.ScreenInterviewV4GapBranch = ScreenInterviewV4GapBranch;
