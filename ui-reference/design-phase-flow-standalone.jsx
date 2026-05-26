// =====================================================================
// AI Kickoff Program — Design Phase Flow (STANDALONE)
// =====================================================================
// Single self-contained file with all 9 screens of the design phase:
//   00 · 진입       — ScreenDesignWelcome
//   01-A · 시작     — ScreenDesignStep1Start (기능 정의)
//   01 → 02         — ScreenDesignStep1to2
//   02-A · 시작     — ScreenDesignStep2Start (시스템 구조 = Architecture)
//   02 → 03         — ScreenDesignStep2to3
//   03-A · 시작     — ScreenDesignStep3Start (데이터 구조 = Data Model)
//   03 → 04         — ScreenDesignStep3to4
//   04-A · 시작     — ScreenDesignStep4Start (AI 흐름, 프롬프트 섹션 제외)
//   05 · 완료       — ScreenDesignComplete
//
// Dependencies: React 18, Pretendard font, JetBrains Mono font.
// No external JSX imports needed — everything is in this one file.
// =====================================================================


// ============================================================
// 1. DESIGN SYSTEM (Slate Blue palette)
// ============================================================

const P = {
  bg: '#f8f9fb',
  surface: '#ffffff',
  surfaceAlt: '#eff1f5',
  border: '#e2e5eb',
  borderStrong: '#c8cdd6',
  text: '#1c1f26',
  textMuted: '#5a6170',
  textSubtle: '#8b93a3',
  accent: '#4a6b8a',
  accentSoft: '#e6edf3',
  accentDeep: '#2f4a64',
  amber: '#c08a3e',
  amberSoft: '#f1e4cd',
  green: '#4a8264',
  greenSoft: '#e3ede7',
  red: '#a85648',
  redSoft: '#efddd7',
};

const FONT = '"Pretendard", "Pretendard Variable", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
const MONO = '"JetBrains Mono", "SF Mono", ui-monospace, Menlo, monospace';

const TONE_FG = { amber: '#7e5a23', green: '#2f5a44', red: '#7a3a30' };


// ============================================================
// 2. SHARED PRIMITIVES (Btn, Tag, Frame, TopBar, Logo, icons)
// ============================================================

function Logo({ size = 22, color = P.text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="5" fill={P.accent}/>
        <path d="M8 9 L8 15.5 M8 9 C8 9, 11.5 9, 12.5 9 C14 9, 14.5 10.2, 14.5 11.2 C14.5 12.5, 13.5 13.2, 12 13.2 L8 13.2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="16" cy="15" r="1.4" fill="#fff"/>
      </svg>
      <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: -0.2, color }}>Prequel</span>
    </div>
  );
}

function TopBar({ user = null, page = '' }) {
  return (
    <div style={{
      height: 56, borderBottom: `1px solid ${P.border}`, background: P.surface,
      display: 'flex', alignItems: 'center', padding: '0 28px', gap: 28, flex: '0 0 auto',
    }}>
      <Logo/>
      <div style={{ display: 'flex', gap: 4 }}>
        {['내 프로젝트', '템플릿', '공지사항', '가이드'].map(t => (
          <div key={t} style={{
            fontSize: 13.5, color: t === page ? P.text : P.textMuted,
            padding: '7px 12px', borderRadius: 7,
            background: t === page ? P.surfaceAlt : 'transparent',
            fontWeight: t === page ? 600 : 500, cursor: 'pointer',
          }}>{t}</div>
        ))}
      </div>
      <div style={{ flex: 1 }}/>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '5px 7px 5px 11px', background: P.accentSoft,
            borderRadius: 999, border: `1px solid ${P.accent}25`,
          }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: P.accentDeep, letterSpacing: -0.1 }}>잔여</span>
            <span style={{
              display: 'inline-flex', alignItems: 'baseline', gap: 2,
              padding: '3px 9px', background: P.surface, borderRadius: 999, fontFamily: MONO,
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: P.accent, letterSpacing: -0.3 }}>1</span>
              <span style={{ fontSize: 10.5, color: P.textSubtle }}>/2</span>
            </span>
          </div>
          <div style={{ fontSize: 13, color: P.textMuted }}>KO</div>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: P.accentSoft,
            color: P.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600,
          }}>{user[0]}</div>
        </div>
      )}
    </div>
  );
}

function Btn({ children, kind = 'primary', size = 'md', icon = null, style = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    fontWeight: 500, cursor: 'pointer', borderRadius: 8, transition: 'all .15s',
    fontFamily: FONT, lineHeight: 1, whiteSpace: 'nowrap',
  };
  const sizes = {
    sm: { fontSize: 12.5, padding: '7px 11px', height: 30 },
    md: { fontSize: 13.5, padding: '9px 14px', height: 36 },
    lg: { fontSize: 15, padding: '12px 20px', height: 46 },
  };
  const kinds = {
    primary: { background: P.accent, color: '#fff', border: '1px solid ' + P.accent },
    secondary: { background: P.surface, color: P.text, border: `1px solid ${P.borderStrong}` },
    ghost: { background: 'transparent', color: P.text, border: '1px solid transparent' },
    soft: { background: P.accentSoft, color: P.accent, border: '1px solid transparent', fontWeight: 600 },
    danger: { background: P.surface, color: P.red, border: `1px solid ${P.borderStrong}` },
  };
  return <button style={{ ...base, ...sizes[size], ...kinds[kind], ...style }}>{icon}{children}</button>;
}

function Tag({ children, tone = 'neutral' }) {
  const tones = {
    neutral: { bg: P.surfaceAlt, fg: P.textMuted, bd: P.border },
    accent: { bg: P.accentSoft, fg: P.accentDeep, bd: 'transparent' },
    amber: { bg: P.amberSoft, fg: TONE_FG.amber, bd: 'transparent' },
    green: { bg: P.greenSoft, fg: TONE_FG.green, bd: 'transparent' },
    red: { bg: P.redSoft, fg: TONE_FG.red, bd: 'transparent' },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5,
      fontWeight: 500, color: t.fg, background: t.bg,
      padding: '3px 8px', borderRadius: 5, border: `1px solid ${t.bd}`, letterSpacing: 0,
    }}>{children}</span>
  );
}

function Frame({ children, withTopBar = true, user = '서', page = '' }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: P.bg, color: P.text,
      fontFamily: FONT, fontSize: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {withTopBar && <TopBar user={user} page={page}/>}
      <div style={{ flex: 1, overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

const I = {
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
};


// ============================================================
// 3. DESIGN SHELL & BEGINNER-FRIENDLY PRIMITIVES
// ============================================================

const DESIGN_STEPS = [
  { id: 'requirements', n: '01', t: '기능 정의', sub: '무엇을 만들지', icon: 'features' },
  { id: 'architecture', n: '02', t: '시스템 구조', sub: '어떻게 연결할지', icon: 'arch' },
  { id: 'data-model', n: '03', t: '데이터 구조', sub: '무엇을 저장할지', icon: 'data' },
  { id: 'ai-workflow', n: '04', t: 'AI 흐름', sub: 'AI를 어떻게 쓸지', icon: 'ai' },
];

const DesignIcon = ({ kind, color = 'currentColor', size = 16 }) => {
  switch (kind) {
    case 'features': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case 'arch': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="6" rx="1"/><rect x="4" y="15" width="6" height="6" rx="1"/><rect x="14" y="15" width="6" height="6" rx="1"/><path d="M12 9v3M7 12v3M17 12v3M7 12h10"/></svg>;
    case 'data': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>;
    case 'ai': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2"/><circle cx="12" cy="12" r="4"/></svg>;
    case 'help': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>;
    case 'bulb': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21h6"/><path d="M12 17a5 5 0 0 0 5-5c0-3-2.5-5-5-5s-5 2-5 5a5 5 0 0 0 5 5z"/><path d="M12 17v4"/></svg>;
    case 'check': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11"/></svg>;
    default: return null;
  }
};

const AiMarkD = ({ size = 32 }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.28,
    background: `linear-gradient(135deg, ${P.accent} 0%, ${P.accentDeep} 100%)`,
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, fontFamily: FONT, fontWeight: 700,
    letterSpacing: -0.5, fontSize: size * 0.5,
    boxShadow: `0 1px 0 ${P.accent}40, inset 0 1px 0 rgba(255,255,255,.15)`,
  }}>P</div>
);

function Explainer({ title, plain, technical, example }) {
  return (
    <div style={{ background: P.accentSoft, border: `1px solid ${P.accent}20`, borderRadius: 12, padding: '14px 16px', marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6, background: P.surface,
          color: P.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${P.accent}30`,
        }}>
          <DesignIcon kind="help" size={13}/>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: P.accentDeep, letterSpacing: -0.1 }}>이게 뭐예요?</span>
        <span style={{ flex: 1 }}/>
        {technical && (
          <span style={{ fontSize: 10.5, fontFamily: MONO, color: P.accent, opacity: 0.7, padding: '2px 7px', background: P.surface, borderRadius: 4 }}>{technical}</span>
        )}
      </div>
      <div style={{ fontSize: 13, color: P.accentDeep, fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <p style={{ fontSize: 12.5, color: P.accent, opacity: 0.9, lineHeight: 1.6, margin: 0 }}>{plain}</p>
      {example && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${P.accent}30`, fontSize: 11.5, color: P.accent, opacity: 0.85, lineHeight: 1.55 }}>
          <strong style={{ fontWeight: 700 }}>예시</strong> · {example}
        </div>
      )}
    </div>
  );
}

function TemplateCard({ title, desc, badge, selected = false }) {
  return (
    <div style={{
      flex: 1, padding: '14px 16px',
      background: selected ? P.accentSoft : P.surface,
      border: `1.5px solid ${selected ? P.accent : P.border}`,
      borderRadius: 10, cursor: 'pointer', position: 'relative', transition: 'all .15s',
    }}>
      {selected && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 20, height: 20, borderRadius: '50%', background: P.accent, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <DesignIcon kind="check" size={11}/>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: selected ? P.accentDeep : P.text }}>{title}</span>
        {badge && (
          <span style={{ fontSize: 10, fontFamily: MONO, padding: '2px 6px', background: selected ? P.surface : P.surfaceAlt, color: P.accent, borderRadius: 4, fontWeight: 600 }}>{badge}</span>
        )}
      </div>
      <div style={{ fontSize: 11.5, color: selected ? P.accent : P.textMuted, opacity: selected ? 0.9 : 1, lineHeight: 1.55, paddingRight: selected ? 24 : 0 }}>{desc}</div>
    </div>
  );
}

function ExampleBox({ children, label = '좋은 예시' }) {
  return (
    <div style={{
      padding: '10px 12px', background: P.greenSoft, borderRadius: 8,
      border: `1px solid ${P.green}25`, fontSize: 12, lineHeight: 1.6, color: TONE_FG.green,
    }}>
      <span style={{ fontWeight: 700, marginRight: 6 }}>{label}</span>
      {children}
    </div>
  );
}

function DesignShell({ activeStep = 'requirements', stepProgress = '2/5', stepTotal = 5, children, helperPanel }) {
  return (
    <Frame page="내 프로젝트">
      <div style={{ height: '100%', display: 'flex' }}>
        <div style={{ width: 264, borderRight: `1px solid ${P.border}`, background: P.surface, padding: '22px 18px', overflow: 'auto', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, borderBottom: `1px solid ${P.border}` }}>
            <AiMarkD size={36}/>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: P.text, letterSpacing: -0.2 }}>설계 단계</div>
              <div style={{ fontSize: 11.5, color: P.textMuted, marginTop: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: P.green, boxShadow: `0 0 0 3px ${P.greenSoft}` }}/>
                Phase 2 of 3
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

          <div style={{ marginTop: 18, padding: '14px', background: P.accentSoft, borderRadius: 12, border: `1px solid ${P.accent}25` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
              <span style={{ fontSize: 10, fontFamily: MONO, color: P.accentDeep, fontWeight: 700, letterSpacing: 0.5 }}>전체 진행률</span>
              <span style={{ fontSize: 11, color: P.accentDeep, fontFamily: MONO, fontWeight: 600 }}>{stepProgress}</span>
            </div>
            <div style={{ height: 5, background: P.surface, borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ width: `${(parseInt(stepProgress) / stepTotal) * 100}%`, height: '100%', background: P.accent, borderRadius: 5 }}/>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: P.accentDeep, opacity: 0.85 }}>설계 4단계 · 약 20분 소요</div>
          </div>

          <div style={{ marginTop: 22 }}>
            <div style={{ fontSize: 10.5, color: P.textSubtle, fontFamily: MONO, marginBottom: 10, letterSpacing: 0.4 }}>DESIGN STEPS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {DESIGN_STEPS.map((step, i) => {
                const isActive = step.id === activeStep;
                const activeIdx = DESIGN_STEPS.findIndex(s => s.id === activeStep);
                const isDone = i < activeIdx;
                return (
                  <div key={step.id} style={{
                    display: 'flex', gap: 10, padding: '10px 11px', borderRadius: 9,
                    background: isActive ? P.accentSoft : 'transparent',
                    border: isActive ? `1px solid ${P.accent}30` : `1px solid transparent`,
                    cursor: 'pointer', alignItems: 'flex-start',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: isActive ? P.accent : isDone ? P.greenSoft : P.surfaceAlt,
                      color: isActive ? '#fff' : isDone ? P.green : P.textMuted,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {isDone ? <DesignIcon kind="check" size={14}/> : <DesignIcon kind={step.icon} size={15}/>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 9.5, fontFamily: MONO, color: P.textSubtle, fontWeight: 700 }}>{step.n}</span>
                        <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 600, color: isActive ? P.accentDeep : P.text }}>{step.t}</span>
                      </div>
                      <div style={{ fontSize: 11, color: isActive ? P.accent : P.textSubtle, marginTop: 2, opacity: isActive ? 0.85 : 1 }}>{step.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button style={{
            marginTop: 22, width: '100%', padding: '10px 12px',
            background: P.surface, color: P.text, border: `1px dashed ${P.borderStrong}`,
            borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5,
            display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
          }}>
            <DesignIcon kind="bulb" size={13}/>
            도움말 보기
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: P.bg, overflow: 'hidden' }}>
          {children}
        </div>

        {helperPanel && (
          <div style={{ width: 300, borderLeft: `1px solid ${P.border}`, background: P.surface, padding: '22px 20px', overflow: 'auto', flexShrink: 0 }}>
            {helperPanel}
          </div>
        )}
      </div>
    </Frame>
  );
}

function DesignStepHeader({ stepNum, stepName, title, subtitle, currentQ, totalQ }) {
  return (
    <div style={{ padding: '22px 32px 18px', background: P.surface, borderBottom: `1px solid ${P.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: P.textSubtle, fontFamily: MONO, marginBottom: 6, letterSpacing: 0.4 }}>
        <span>설계 · STEP {stepNum}</span>
        <span>›</span>
        <span style={{ color: P.accent, fontWeight: 700 }}>{stepName}</span>
        <span style={{ flex: 1 }}/>
        {currentQ !== undefined && (
          <span style={{ color: P.textMuted, fontWeight: 600 }}>질문 {currentQ} / {totalQ}</span>
        )}
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3, margin: 0, color: P.text }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13.5, color: P.textMuted, lineHeight: 1.6, margin: '8px 0 0', maxWidth: 720 }}>{subtitle}</p>}
    </div>
  );
}

function DesignStepFooter({ canBack = true, primaryLabel = '다음 단계' }) {
  return (
    <div style={{ padding: '14px 32px', background: P.surface, borderTop: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
      {canBack && <Btn kind="ghost" size="md">← 이전</Btn>}
      <span style={{ flex: 1 }}/>
      <span style={{ fontSize: 11.5, color: P.textSubtle, display: 'flex', alignItems: 'center', gap: 5, fontFamily: MONO }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: P.green }}/>
        자동 저장됨
      </span>
      <Btn kind="secondary" size="md">건너뛰기</Btn>
      <Btn kind="primary" size="md" icon={I.arrow} style={{ flexDirection: 'row-reverse' }}>{primaryLabel}</Btn>
    </div>
  );
}


// ============================================================
// 4. HELPER PANELS (used inside DesignShell helperPanel slot)
// ============================================================

function ArchHelperPanel() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
        <DesignIcon kind="bulb" size={15} color={P.accent}/>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: P.text, letterSpacing: -0.1 }}>이 단계 가이드</div>
      </div>
      <p style={{ fontSize: 12.5, color: P.textMuted, lineHeight: 1.65, margin: '0 0 14px' }}>
        조금 어려워 보여도 괜찮아요. 일단 <strong style={{ color: P.text }}>"추천 조합"</strong>을 선택하시면 AI가 알아서 채워드립니다.
      </p>
      <ExampleBox label="이렇게 쓰는 거예요">
        <strong>"잘 모르겠어요"</strong>라고 입력하시면, AI가 비슷한 프로젝트의 조합을 추천해드립니다. 그 다음 한 번씩 검토만 하시면 끝!
      </ExampleBox>
      <div style={{ marginTop: 22, padding: '12px 13px', background: P.surfaceAlt, borderRadius: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: P.text, marginBottom: 5 }}>용어 사전</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            ['프론트엔드', '사용자가 보는 화면 부분 (React, Vue 등)'],
            ['백엔드', '데이터를 처리하는 서버 (Python, Node 등)'],
            ['데이터베이스', '정보가 저장되는 창고 (PostgreSQL, MySQL 등)'],
            ['API', '서비스 간 통신하는 약속된 방식'],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 12, fontWeight: 600, color: P.accent }}>{k}</div>
              <div style={{ fontSize: 11, color: P.textMuted, marginTop: 1, lineHeight: 1.5 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DataHelperPanel() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
        <DesignIcon kind="bulb" size={15} color={P.accent}/>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: P.text, letterSpacing: -0.1 }}>쉽게 이해하기</div>
      </div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: P.text, marginBottom: 6 }}>엑셀로 비유하면?</div>
        <p style={{ fontSize: 12, color: P.textMuted, lineHeight: 1.65, margin: '0 0 10px' }}>
          엑셀에서 시트 하나가 '테이블'이고, 시트 안의 열이 '항목'이에요. 그리고 시트끼리 연결되어 있는 거랍니다.
        </p>
        <div style={{ background: P.surfaceAlt, padding: '10px 12px', borderRadius: 8 }}>
          <div style={{ fontSize: 11, fontFamily: MONO, color: P.textSubtle, marginBottom: 6 }}>EXCEL 비유</div>
          <div style={{ fontSize: 11.5, color: P.text, lineHeight: 1.55 }}>
            👤 <strong>사용자.xlsx</strong> 시트<br/>↓ ID 연결<br/>
            ✉️ <strong>추천기록.xlsx</strong> 시트<br/>↓ 책 ID 연결<br/>
            📚 <strong>책.xlsx</strong> 시트
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: P.text, marginBottom: 6 }}>"타입"이 뭐예요?</div>
        <p style={{ fontSize: 12, color: P.textMuted, lineHeight: 1.6, margin: 0 }}>
          각 항목에 들어갈 데이터의 종류예요. 텍스트인지, 숫자인지, 날짜인지...
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
          {['텍스트', '숫자', '날짜', '선택지', '이미지', '연결'].map(t => (
            <span key={t} style={{ fontSize: 10.5, fontFamily: MONO, padding: '3px 8px', background: P.surfaceAlt, color: P.textMuted, borderRadius: 4 }}>{t}</span>
          ))}
        </div>
      </div>
      <ExampleBox label="팁">
        <strong>"필수"</strong>는 반드시 입력해야 하는 항목, <strong>"자동"</strong>은 시스템이 알아서 채우는 항목이에요. (예: 가입일, ID)
      </ExampleBox>
    </div>
  );
}

function AiHelperPanel() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
        <DesignIcon kind="bulb" size={15} color={P.accent}/>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: P.text, letterSpacing: -0.1 }}>이 단계 가이드</div>
      </div>
      <p style={{ fontSize: 12.5, color: P.textMuted, lineHeight: 1.65, margin: '0 0 16px' }}>
        AI 흐름 설계는 어려워 보이지만, 핵심은 <strong style={{ color: P.text }}>3가지 질문</strong>만 답하면 됩니다:
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        {[
          ['1', 'AI에게 뭘 보여줘요?', '입력 데이터'],
          ['2', 'AI가 뭘 돌려줘야 해요?', '출력 형식'],
          ['3', '실패하면 어떻게 해요?', '폴백 전략'],
        ].map(([n, q, a]) => (
          <div key={n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: P.accent, color: '#fff',
              fontSize: 11, fontWeight: 700, fontFamily: MONO,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
            }}>{n}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: P.text }}>{q}</div>
              <div style={{ fontSize: 11, color: P.textSubtle, marginTop: 1 }}>{a}</div>
            </div>
          </div>
        ))}
      </div>
      <ExampleBox label="좋은 출력 형식 예시">
        <strong>JSON 형식</strong>으로 받으면 앱이 자동으로 화면에 표시할 수 있어요.<br/>
        예: <code style={{ fontFamily: MONO, fontSize: 11 }}>{`{ "title": "...", "reason": "..." }`}</code>
      </ExampleBox>
      <div style={{ marginTop: 22, padding: '12px 13px', background: P.amberSoft + '60', borderRadius: 10, border: `1px solid ${P.amber}25` }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: TONE_FG.amber, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span>💰</span> 비용 알림
        </div>
        <p style={{ fontSize: 11.5, color: TONE_FG.amber, opacity: 0.9, lineHeight: 1.55, margin: 0 }}>
          AI 모델마다 가격이 달라요. Sonnet은 균형, Haiku는 저렴, Opus는 비쌈. 처음엔 Sonnet으로 시작하는 게 좋아요.
        </p>
      </div>
    </div>
  );
}


// ============================================================
// 5. SHARED FLOW PRIMITIVES (AiQuestion, AiSuggestionList, StepTransition)
// ============================================================

function AiQuestion({ children, hint }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18 }}>
      <AiMarkD size={36}/>
      <div style={{ flex: 1, background: P.surface, border: `1.5px solid ${P.accent}`, borderRadius: 14, padding: '18px 22px', boxShadow: `0 1px 0 rgba(0,0,0,.02), 0 8px 24px -14px ${P.accent}40` }}>
        <div style={{ fontSize: 10.5, color: P.accent, fontWeight: 700, fontFamily: MONO, marginBottom: 8, letterSpacing: 0.4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: P.accent, boxShadow: `0 0 0 4px ${P.accentSoft}` }}/>
          AI가 묻는 질문
        </div>
        <div style={{ fontSize: 15.5, fontWeight: 600, lineHeight: 1.6, color: P.text, letterSpacing: -0.1 }}>{children}</div>
        {hint && (
          <div style={{ marginTop: 12, padding: '9px 12px', background: P.accentSoft, borderRadius: 8, fontSize: 12, color: P.accentDeep, lineHeight: 1.55, display: 'flex', gap: 8 }}>
            <DesignIcon kind="bulb" size={12} color={P.accent}/>
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}

function AiSuggestionList({ items }) {
  return (
    <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontFamily: MONO, color: P.accent, fontWeight: 700, marginBottom: 10, letterSpacing: 0.4, display: 'flex', alignItems: 'center', gap: 6 }}>
        <DesignIcon kind="bulb" size={12} color={P.accent}/>
        AI 추천 — 클릭으로 추가
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((t, i) => (
          <button key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            background: P.surfaceAlt, border: `1px solid ${P.border}`, borderRadius: 8,
            cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
          }}>
            <span style={{
              width: 20, height: 20, borderRadius: '50%', background: P.surface, color: P.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              border: `1.5px dashed ${P.accent}50`, fontSize: 12, fontWeight: 700,
            }}>+</span>
            <span style={{ fontSize: 13, color: P.text, flex: 1 }}>{t}</span>
            <span style={{ fontSize: 11, color: P.textSubtle }}>추가</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepTransition({ fromN, fromT, fromIcon, toN, toT, toIcon, summary, nextPreview }) {
  return (
    <Frame page="내 프로젝트">
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: P.bg, padding: 40, overflow: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 680 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: `linear-gradient(135deg, ${P.green} 0%, ${TONE_FG.green} 100%)`,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', boxShadow: `0 8px 24px -8px ${P.green}80`,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11"/></svg>
            </div>
            <div style={{ fontSize: 11, color: P.green, fontWeight: 700, fontFamily: MONO, letterSpacing: 0.5, marginBottom: 6 }}>STEP {fromN} COMPLETE</div>
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4, margin: 0, color: P.text }}>{fromT} 완료!</h2>
            <p style={{ fontSize: 13.5, color: P.textMuted, marginTop: 10, lineHeight: 1.6 }}>잘하고 계세요. 이번 단계에서 정리한 내용을 확인해보세요.</p>
          </div>

          <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: '18px 20px', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${P.border}` }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: P.greenSoft, color: P.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DesignIcon kind={fromIcon} size={15}/>
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: P.text }}>{fromT}에서 정리한 것</span>
              <div style={{ flex: 1 }}/>
              <button style={{ fontSize: 11.5, color: P.accent, fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>편집</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {summary.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: P.accent, flexShrink: 0, marginTop: 8 }}/>
                  <div style={{ flex: 1, fontSize: 12.5, color: P.text, lineHeight: 1.55 }}>{s}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '16px 20px', background: P.accentSoft, borderRadius: 12, border: `1px solid ${P.accent}25`, display: 'flex', gap: 14, alignItems: 'center', marginBottom: 22 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: P.surface, color: P.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${P.accent}30` }}>
              <DesignIcon kind={toIcon} size={17}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 10.5, fontFamily: MONO, color: P.accent, fontWeight: 700 }}>다음 · STEP {toN}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: P.accentDeep, marginTop: 2 }}>{toT}</div>
              <div style={{ fontSize: 12, color: P.accent, marginTop: 3, opacity: 0.85, lineHeight: 1.5 }}>{nextPreview}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{
              padding: '12px 18px', fontSize: 13.5, fontWeight: 500,
              background: P.surface, color: P.text, border: `1px solid ${P.borderStrong}`,
              borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
            }}>이전 단계 다시 보기</button>
            <div style={{ flex: 1 }}/>
            <button style={{
              padding: '12px 22px', fontSize: 14.5, fontWeight: 700,
              background: P.accent, color: '#fff', border: 'none', borderRadius: 10,
              cursor: 'pointer', boxShadow: `0 4px 12px -2px ${P.accent}60`,
              display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
            }}>
              {toT} 시작하기
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </Frame>
  );
}


// ============================================================
// 6. SCREEN 00 · 진입 — Design Welcome
// ============================================================

function ScreenDesignWelcome() {
  return (
    <Frame page="내 프로젝트">
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: P.bg, padding: 40, overflow: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 760 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', background: P.accentSoft, borderRadius: 999, marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: P.accent }}/>
              <span style={{ fontSize: 11, color: P.accentDeep, fontWeight: 700, fontFamily: MONO, letterSpacing: 0.5 }}>PHASE 2 of 3 · 시작</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.6, margin: 0, color: P.text, lineHeight: 1.25 }}>
              이제 <span style={{ color: P.accent }}>설계 단계</span>를 시작할게요
            </h1>
            <p style={{ fontSize: 14.5, color: P.textMuted, lineHeight: 1.65, marginTop: 14, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
              아이디어를 실제로 만들 수 있는 형태로 다듬어볼게요. <strong style={{ color: P.text }}>네 가지 질문</strong>에 답하시면 됩니다. 어렵게 생각하지 마세요 — AI가 먼저 추천해드릴게요.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { n: '01', icon: 'features', t: '기능 정의', q: '이 도구로 뭘 할 수 있어야 해?', time: '~5분' },
              { n: '02', icon: 'arch', t: '시스템 구조', q: '어떤 부품으로 만들지?', time: '~5분' },
              { n: '03', icon: 'data', t: '데이터 구조', q: '어떤 정보를 저장할지?', time: '~5분' },
              { n: '04', icon: 'ai', t: 'AI 흐름', q: 'AI에게 뭘 시킬지?', time: '~5분' },
            ].map(s => (
              <div key={s.n} style={{
                padding: '18px 20px', background: P.surface, border: `1px solid ${P.border}`,
                borderRadius: 12, display: 'flex', gap: 14, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: P.accentSoft, color: P.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <DesignIcon kind={s.icon} size={20}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 10.5, fontFamily: MONO, color: P.textSubtle, fontWeight: 700 }}>{s.n}</span>
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: P.text, letterSpacing: -0.2 }}>{s.t}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: P.textMuted, lineHeight: 1.5, marginBottom: 6 }}>{s.q}</div>
                  <span style={{ fontSize: 11, color: P.textSubtle, fontFamily: MONO, padding: '2px 7px', background: P.surfaceAlt, borderRadius: 4 }}>{s.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            padding: '18px 20px', background: P.greenSoft + '60', borderRadius: 12,
            border: `1px solid ${P.green}30`, marginBottom: 28,
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9, background: P.surface, color: P.green,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              border: `1px solid ${P.green}30`,
            }}>
              <DesignIcon kind="check" size={18}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: TONE_FG.green, marginBottom: 4 }}>완료하면 얻는 것</div>
              <p style={{ fontSize: 12.5, color: TONE_FG.green, opacity: 0.9, lineHeight: 1.6, margin: 0 }}>
                개발자에게 바로 전달할 수 있는 <strong>설계 문서 + 다이어그램 + AI 워크플로우 정의</strong>. 코딩 시작 전에 빠뜨린 부분이 없는지 확인할 수 있어요.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <button style={{
              padding: '14px 28px', fontSize: 15, fontWeight: 700,
              background: P.accent, color: '#fff', border: 'none', borderRadius: 10,
              cursor: 'pointer', boxShadow: `0 4px 16px -4px ${P.accent}80`,
              display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
            }}>
              네, 설계를 시작할게요
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
            <button style={{
              padding: '8px 16px', fontSize: 12.5, fontWeight: 500,
              background: 'transparent', color: P.textMuted, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}>나중에 결정할게요</button>
          </div>
        </div>
      </div>
    </Frame>
  );
}


// ============================================================
// 7. SCREEN 01-A · 기능 정의 시작
// ============================================================

function ScreenDesignStep1Start() {
  return (
    <DesignShell activeStep="requirements" stepProgress="1/5" stepTotal={5}>
      <DesignStepHeader
        stepNum="01" stepName="기능 정의"
        title="이 도구가 할 수 있는 일을 정의해볼까요?"
        subtitle="첫 번째 질문이에요. 답이 떠오르지 않으면 'AI 추천받기'를 누르세요."
        currentQ={1} totalQ={5}
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px 0' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', paddingBottom: 28 }}>
          <AiQuestion hint="크게 3~5가지 정도면 충분해요. '이건 할 수 있어야 해' 정도의 큰 덩어리로 적으세요.">
            사용자가 이 도구를 사용하면서 <strong style={{ color: P.accent }}>꼭 할 수 있어야 하는 일</strong>이 무엇인가요?
          </AiQuestion>
          <div style={{ padding: '32px 24px', background: P.surface, border: `1px dashed ${P.borderStrong}`, borderRadius: 12, textAlign: 'center', marginBottom: 18 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: P.surfaceAlt, color: P.textSubtle,
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
            }}>
              <DesignIcon kind="features" size={22}/>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: P.text, marginBottom: 4 }}>아직 추가된 기능이 없어요</div>
            <div style={{ fontSize: 12, color: P.textMuted, lineHeight: 1.55 }}>직접 입력하거나, 아래 AI 추천에서 골라보세요</div>
          </div>
          <AiSuggestionList items={[
            '매주 정해진 요일에 Slack DM으로 추천 책을 받는다',
            '받은 추천 책에 "관심 있어요 / 별로예요" 피드백을 남긴다',
            '관리자가 부서별 인기 도서 큐레이션 규칙을 편집한다',
            '본인이 이미 읽은 책을 표시해 다시 추천되지 않도록 한다',
          ]}/>
          <div style={{ background: P.surface, border: `1.5px solid ${P.borderStrong}`, borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 11.5, color: P.textSubtle, lineHeight: 1.55, minHeight: 36 }}>
              직접 입력하기 — 예: 사용자가 추천 기록을 모두 볼 수 있다
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, paddingTop: 8, borderTop: `1px solid ${P.border}` }}>
              <span style={{ fontSize: 11, color: P.textSubtle, fontFamily: MONO }}>Enter로 추가</span>
              <div style={{ flex: 1 }}/>
              <Btn kind="primary" size="sm">+ 추가</Btn>
            </div>
          </div>
        </div>
      </div>
      <DesignStepFooter primaryLabel="다음 질문 →"/>
    </DesignShell>
  );
}

function ScreenDesignStep1to2() {
  return <StepTransition
    fromN="01" fromT="기능 정의" fromIcon="features"
    toN="02" toT="시스템 구조" toIcon="arch"
    summary={[
      '할 수 있는 일 3가지 정의 (책 추천 받기, 피드백 남기기, 큐레이션 편집)',
      '품질 기준 3가지 (응답 속도 2초, 동시 사용자 50명, Slack UI)',
      '미정 항목 1개 (데이터 보안 수준 — 시스템 구조에서 함께 결정)',
    ]}
    nextPreview="어떤 부품으로 만들지 결정해요. 3가지 추천 조합 중 골라도 됩니다."
  />;
}


// ============================================================
// 8. SCREEN 02-A · 시스템 구조 시작 (Architecture, full)
// ============================================================

function ScreenDesignStep2Start() {
  return (
    <DesignShell activeStep="architecture" stepProgress="3/5" stepTotal={5} helperPanel={<ArchHelperPanel/>}>
      <DesignStepHeader
        stepNum="02" stepName="시스템 구조"
        title="이 도구의 부품들을 골라볼까요?"
        subtitle="실제로 동작하려면 화면, 서버, 데이터베이스, AI 같은 부품들이 필요해요. 직접 코딩 안 해도 됩니다 — 'AI가 추천하는 조합' 중에서 고르시면 돼요."
        currentQ={3} totalQ={5}
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px 0' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', paddingBottom: 28 }}>
          <Explainer
            title="시스템 구조 = 아키텍처 (Architecture)"
            technical="System Architecture"
            plain="앱을 만들기 위해 필요한 '부품'들과 그것들이 어떻게 연결되는지를 그린 그림이에요. 레고 조립도라고 생각하시면 돼요."
            example="화면(React) ↔ 서버(FastAPI) ↔ 데이터(Supabase) — 셋 다 인기 부품들이에요"
          />

          <div style={{ fontSize: 13, fontWeight: 700, color: P.text, marginBottom: 6 }}>먼저 — 추천 조합 골라보기</div>
          <p style={{ fontSize: 12.5, color: P.textMuted, lineHeight: 1.55, marginBottom: 14 }}>
            프로젝트 유형(AI/ML)에 맞는 3가지 조합을 AI가 추려두었어요. 잘 모르겠으면 첫 번째를 고르세요.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 28 }}>
            <TemplateCard title="간단한 조합" badge="추천" desc="React + FastAPI + Supabase. 시작하기 가장 쉽고 빠릅니다. 사용자가 ~수백 명일 때 적합." selected/>
            <TemplateCard title="확장 가능한 조합" desc="Next.js + Node + PostgreSQL + Redis. 사용자가 늘어나도 안정적. 처음엔 복잡."/>
            <TemplateCard title="실시간 중심" badge="고급" desc="WebSocket + Workers + Edge DB. 실시간 채팅·알림이 핵심일 때."/>
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: P.text, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            선택한 조합 미리보기
            <Tag tone="accent">간단한 조합</Tag>
          </div>

          <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 14, padding: '24px 28px 20px', marginBottom: 18 }}>
            <svg viewBox="0 0 720 220" width="100%" style={{ display: 'block' }}>
              <defs>
                <marker id="arrA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M0 0 L10 5 L0 10 z" fill={P.borderStrong}/>
                </marker>
              </defs>
              <g transform="translate(20 80)"><rect width="110" height="60" rx="10" fill={P.surfaceAlt} stroke={P.borderStrong}/><text x="55" y="28" fontSize="12" fontWeight="600" textAnchor="middle" fill={P.text} fontFamily={FONT}>사용자</text><text x="55" y="44" fontSize="10" textAnchor="middle" fill={P.textMuted} fontFamily={FONT}>Slack 사용</text></g>
              <g transform="translate(190 30)"><rect width="140" height="60" rx="10" fill={P.accentSoft} stroke={P.accent}/><text x="70" y="22" fontSize="11" fontWeight="700" textAnchor="middle" fill={P.accentDeep} fontFamily={FONT}>화면 (React)</text><text x="70" y="38" fontSize="9" textAnchor="middle" fill={P.accent} fontFamily={FONT}>웹 페이지</text><text x="70" y="51" fontSize="9" textAnchor="middle" fill={P.accent} fontFamily={MONO}>관리자용</text></g>
              <g transform="translate(190 130)"><rect width="140" height="60" rx="10" fill={P.accentSoft} stroke={P.accent}/><text x="70" y="22" fontSize="11" fontWeight="700" textAnchor="middle" fill={P.accentDeep} fontFamily={FONT}>서버 (FastAPI)</text><text x="70" y="38" fontSize="9" textAnchor="middle" fill={P.accent} fontFamily={FONT}>중간 다리</text><text x="70" y="51" fontSize="9" textAnchor="middle" fill={P.accent} fontFamily={MONO}>Python</text></g>
              <g transform="translate(400 130)"><rect width="140" height="60" rx="10" fill={P.greenSoft} stroke={P.green}/><text x="70" y="22" fontSize="11" fontWeight="700" textAnchor="middle" fill={TONE_FG.green} fontFamily={FONT}>데이터 (Supabase)</text><text x="70" y="38" fontSize="9" textAnchor="middle" fill={P.green} fontFamily={FONT}>저장소</text><text x="70" y="51" fontSize="9" textAnchor="middle" fill={P.green} fontFamily={MONO}>책 · 사용자 · 피드백</text></g>
              <g transform="translate(400 30)"><rect width="140" height="60" rx="10" fill={P.amberSoft} stroke={P.amber}/><text x="70" y="22" fontSize="11" fontWeight="700" textAnchor="middle" fill={TONE_FG.amber} fontFamily={FONT}>AI (Claude)</text><text x="70" y="38" fontSize="9" textAnchor="middle" fill={P.amber} fontFamily={FONT}>추천 만드는 두뇌</text><text x="70" y="51" fontSize="9" textAnchor="middle" fill={P.amber} fontFamily={MONO}>Anthropic API</text></g>
              <g transform="translate(600 80)"><rect width="100" height="60" rx="10" fill={P.surfaceAlt} stroke={P.borderStrong}/><text x="50" y="28" fontSize="12" fontWeight="600" textAnchor="middle" fill={P.text} fontFamily={FONT}>Slack</text><text x="50" y="44" fontSize="9" textAnchor="middle" fill={P.textMuted} fontFamily={FONT}>DM 발송</text></g>
              <path d="M130 110 L190 60" stroke={P.borderStrong} strokeWidth="1.5" fill="none" markerEnd="url(#arrA)"/>
              <path d="M130 110 L190 160" stroke={P.borderStrong} strokeWidth="1.5" fill="none" markerEnd="url(#arrA)"/>
              <path d="M330 60 L400 60" stroke={P.borderStrong} strokeWidth="1.5" fill="none" markerEnd="url(#arrA)"/>
              <path d="M330 160 L400 160" stroke={P.borderStrong} strokeWidth="1.5" fill="none" markerEnd="url(#arrA)"/>
              <path d="M260 90 L260 130" stroke={P.borderStrong} strokeWidth="1.5" fill="none" markerEnd="url(#arrA)"/>
              <path d="M540 160 L600 110" stroke={P.borderStrong} strokeWidth="1.5" fill="none" markerEnd="url(#arrA)"/>
            </svg>
            <div style={{ display: 'flex', gap: 14, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${P.border}`, fontSize: 11.5, color: P.textMuted }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: P.accentSoft, border: `1px solid ${P.accent}` }}/>사용자가 보는 것
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: P.greenSoft, border: `1px solid ${P.green}` }}/>저장되는 것
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: P.amberSoft, border: `1px solid ${P.amber}` }}/>AI가 처리하는 것
              </span>
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: P.text, marginBottom: 10 }}>각 부품을 왜 골랐나요?</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: '🖥', name: 'React (화면)', why: '한국 개발자들이 가장 많이 쓰는 도구. 사람 구하기 쉽고 자료도 많아요.' },
              { icon: '⚙️', name: 'FastAPI (서버)', why: 'Python 기반이라 AI/Claude 연동이 편함. 작고 빠릅니다.' },
              { icon: '💾', name: 'Supabase (데이터)', why: '로그인 + 데이터 저장이 한 번에. 백엔드 개발 부담이 줄어들어요.' },
              { icon: '🤖', name: 'Claude API (AI)', why: '한국어 이해도가 좋고, 추천 글이 자연스러워요.' },
            ].map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 14px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{p.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: P.textMuted, marginTop: 3, lineHeight: 1.55 }}>{p.why}</div>
                </div>
                <span style={{ fontSize: 11, color: P.green, fontWeight: 600, padding: '3px 8px', background: P.greenSoft, borderRadius: 4, flexShrink: 0, marginTop: 2 }}>자동 선택됨</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <DesignStepFooter primaryLabel="데이터 구조로 →"/>
    </DesignShell>
  );
}

function ScreenDesignStep2to3() {
  return <StepTransition
    fromN="02" fromT="시스템 구조" fromIcon="arch"
    toN="03" toT="데이터 구조" toIcon="data"
    summary={[
      '간단한 조합 선택 (React + FastAPI + Supabase)',
      'AI 두뇌는 Claude API, Slack은 외부 연동',
      '6개 부품의 역할이 모두 정의됨',
    ]}
    nextPreview="저장해야 할 정보를 정리해요. 엑셀 시트처럼 표 형태로 만들어드립니다."
  />;
}


// ============================================================
// 9. SCREEN 03-A · 데이터 구조 시작 (Data Model, full)
// ============================================================

function ScreenDesignStep3Start() {
  return (
    <DesignShell activeStep="data-model" stepProgress="4/5" stepTotal={5} helperPanel={<DataHelperPanel/>}>
      <DesignStepHeader
        stepNum="03" stepName="데이터 구조"
        title="저장해야 할 정보를 정리해볼까요?"
        subtitle="앱이 동작하려면 '책 정보' '사용자 피드백' 같은 데이터가 어딘가에 저장되어야 해요. 어떤 정보를 저장할지 함께 정리합니다."
        currentQ={4} totalQ={5}
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px 0' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', paddingBottom: 28 }}>
          <Explainer
            title="데이터 구조 = 데이터 모델 (Data Model)"
            technical="Database Schema"
            plain="앱에 저장되는 정보의 '카테고리'와 '항목'을 정리한 것이에요. 엑셀의 시트와 열 같은 거라고 생각하시면 돼요."
            example="시트 '사용자' → 열: 이름, 이메일, 부서, 가입일 / 시트 '추천 기록' → 열: 누구에게, 어떤 책, 언제, 반응"
          />

          <div style={{ fontSize: 13, fontWeight: 700, color: P.text, marginBottom: 6 }}>저장할 정보 그룹 (테이블)</div>
          <p style={{ fontSize: 12.5, color: P.textMuted, lineHeight: 1.55, marginBottom: 14 }}>
            AI가 답변을 분석해 자동으로 3개 그룹을 만들었어요. 빠진 정보가 있으면 추가하세요.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { name: '사용자', icon: '👤', fields: [['이름', '텍스트', '필수'], ['이메일', '텍스트', '필수'], ['부서', '텍스트', '선택'], ['Slack ID', '텍스트', '필수'], ['가입일', '날짜', '자동']] },
              { name: '책', icon: '📚', fields: [['제목', '텍스트', '필수'], ['저자', '텍스트', '필수'], ['카테고리', '선택지', '필수'], ['표지 이미지', '이미지', '선택'], ['평균 평점', '숫자', '자동']] },
              { name: '추천 기록', icon: '✉️', fields: [['받은 사람', '연결', '필수'], ['추천된 책', '연결', '필수'], ['발송 시간', '날짜', '자동'], ['반응', '선택지', '선택'], ['반응 시간', '날짜', '자동']] },
            ].map(table => (
              <div key={table.name} style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px', background: P.surfaceAlt, borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{table.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: P.text, flex: 1 }}>{table.name}</span>
                  <span style={{ fontSize: 10, fontFamily: MONO, color: P.textSubtle, padding: '2px 7px', background: P.surface, borderRadius: 4 }}>{table.fields.length}개</span>
                </div>
                <div style={{ padding: 4 }}>
                  {table.fields.map(([k, t, req], i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', fontSize: 12, borderRadius: 6, borderBottom: i < table.fields.length - 1 ? `1px solid ${P.border}` : 'none' }}>
                      <span style={{ flex: 1, color: P.text, fontWeight: 500 }}>{k}</span>
                      <span style={{ fontSize: 10, fontFamily: MONO, color: P.textMuted, padding: '1px 5px', background: P.surfaceAlt, borderRadius: 3 }}>{t}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: req === '필수' ? P.red : req === '자동' ? P.green : P.textSubtle }}>{req}</span>
                    </div>
                  ))}
                </div>
                <button style={{
                  width: 'calc(100% - 12px)', margin: '6px', padding: '7px',
                  background: 'transparent', color: P.accent, border: `1px dashed ${P.accent}40`,
                  borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11.5, fontWeight: 600,
                }}>+ 항목 추가</button>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: P.text, marginBottom: 6 }}>그룹 간 연결 관계</div>
          <p style={{ fontSize: 12.5, color: P.textMuted, lineHeight: 1.55, marginBottom: 14 }}>
            서로 다른 그룹이 어떻게 연결되는지 보여드릴게요. 자동으로 감지되었습니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { from: '👤 사용자', verb: '에게', to: '✉️ 추천 기록', desc: '한 사용자는 여러 추천을 받을 수 있어요', cardinality: '1 : N' },
              { from: '📚 책', verb: '이', to: '✉️ 추천 기록', desc: '한 권의 책은 여러 사람에게 추천될 수 있어요', cardinality: '1 : N' },
            ].map((rel, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{rel.from}</span>
                <span style={{ fontSize: 11.5, color: P.textMuted, fontStyle: 'italic' }}>{rel.verb}</span>
                <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                  <path d="M2 6 H18 M14 2 L18 6 L14 10" stroke={P.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{rel.to}</span>
                <span style={{ flex: 1 }}/>
                <span style={{ fontSize: 11.5, color: P.textMuted }}>{rel.desc}</span>
                <span style={{ fontSize: 10.5, fontFamily: MONO, color: P.accent, padding: '3px 8px', background: P.accentSoft, borderRadius: 5, fontWeight: 700, marginLeft: 8 }}>{rel.cardinality}</span>
              </div>
            ))}
          </div>

          <button style={{
            width: '100%', marginTop: 12, padding: '14px',
            background: P.surface, color: P.textMuted, border: `1px dashed ${P.borderStrong}`,
            borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <DesignIcon kind="data" size={14} color={P.textMuted}/>
            + 새 정보 그룹 추가
          </button>

          <div style={{ fontSize: 13, fontWeight: 700, color: P.text, marginTop: 24, marginBottom: 6 }}>
            정합성 규칙 <span style={{ fontSize: 11.5, fontWeight: 500, color: P.textMuted }}>(자동 검증)</span>
          </div>
          <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, overflow: 'hidden' }}>
            {[
              { ok: true, t: '이메일은 중복될 수 없어요 (한 이메일 = 한 사용자)' },
              { ok: true, t: '추천 기록은 반드시 사용자와 책 둘 다 있어야 해요' },
              { ok: false, t: '책의 카테고리는 미리 정한 목록에서만 선택 — 목록 정의 필요' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderTop: i === 0 ? 'none' : `1px solid ${P.border}` }}>
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: r.ok ? P.greenSoft : P.amberSoft, color: r.ok ? P.green : P.amber,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {r.ok ? <DesignIcon kind="check" size={10}/> : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                  )}
                </span>
                <span style={{ fontSize: 12.5, color: P.text, flex: 1 }}>{r.t}</span>
                {!r.ok && <span style={{ fontSize: 11, color: P.accent, fontWeight: 600, cursor: 'pointer' }}>해결하기 →</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <DesignStepFooter primaryLabel="AI 흐름으로 →"/>
    </DesignShell>
  );
}

function ScreenDesignStep3to4() {
  return <StepTransition
    fromN="03" fromT="데이터 구조" fromIcon="data"
    toN="04" toT="AI 흐름" toIcon="ai"
    summary={[
      '3개의 정보 그룹 정의 (사용자, 책, 추천 기록)',
      '총 15개 항목 정의 · 필수 항목 8개',
      '그룹 간 연결 관계 2개 (사용자→추천, 책→추천)',
    ]}
    nextPreview="AI(Claude)가 어떤 정보를 받고 무엇을 만들어낼지 정의해요. 마지막 단계!"
  />;
}


// ============================================================
// 10. SCREEN 04-A · AI 흐름 시작 (no prompt section)
// ============================================================

function ScreenDesignStep4Start() {
  return (
    <DesignShell activeStep="ai-workflow" stepProgress="5/5" stepTotal={5} helperPanel={<AiHelperPanel/>}>
      <DesignStepHeader
        stepNum="04" stepName="AI 흐름"
        title="AI가 무엇을 받고 무엇을 만들지 정해볼까요?"
        subtitle="이 프로젝트는 AI를 사용합니다. AI가 어떤 정보를 받고, 어떤 결과를 만들고, 만약 실패하면 어떻게 처리할지 함께 설계해요."
        currentQ={5} totalQ={5}
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px 0' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', paddingBottom: 28 }}>
          <Explainer
            title="AI 흐름 = AI Workflow"
            technical="I/O + Fallback"
            plain="AI(Claude)가 어떤 정보를 받고 무엇을 만들지, 그리고 잘못되었을 때 대처법을 정하는 단계예요."
            example="입력: 사용자 부서 + 지난주 인기 책 → AI 처리 → 출력: 추천 책 카드 1개 (제목 + 이유 2줄)"
          />

          <div style={{ fontSize: 13, fontWeight: 700, color: P.text, marginBottom: 10 }}>AI의 입출력 흐름</div>
          <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 14, padding: '20px', marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 1fr 50px 1fr', gap: 0, alignItems: 'center' }}>
              <div style={{ background: P.accentSoft, border: `1px solid ${P.accent}30`, borderRadius: 12, padding: '14px' }}>
                <div style={{ fontSize: 10.5, fontFamily: MONO, color: P.accent, fontWeight: 700, marginBottom: 8, letterSpacing: 0.4 }}>📥 입력 (INPUT)</div>
                <div style={{ fontSize: 12, color: P.accentDeep, lineHeight: 1.65 }}>
                  • 사용자 부서<br/>• 지난 4주 인기 도서 Top 20<br/>• 이미 추천된 책 목록<br/>• 사용자 피드백 이력
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><path d="M2 10 H28 M22 4 L28 10 L22 16" stroke={P.borderStrong} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{
                background: `linear-gradient(135deg, ${P.accent} 0%, ${P.accentDeep} 100%)`,
                color: '#fff', padding: '20px 18px', borderRadius: 14, textAlign: 'center',
                boxShadow: `0 8px 24px -8px ${P.accent}80`,
              }}>
                <div style={{ fontSize: 10.5, fontFamily: MONO, opacity: 0.8, fontWeight: 700, letterSpacing: 0.4, marginBottom: 8 }}>🤖 AI</div>
                <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3, marginBottom: 4 }}>Claude</div>
                <div style={{ fontSize: 11, opacity: 0.85, fontFamily: MONO }}>sonnet-4.5</div>
                <div style={{ marginTop: 12, padding: '6px 10px', background: 'rgba(255,255,255,.15)', borderRadius: 999, fontSize: 10.5, fontWeight: 600 }}>추천 생성</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><path d="M2 10 H28 M22 4 L28 10 L22 16" stroke={P.borderStrong} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ background: P.greenSoft, border: `1px solid ${P.green}30`, borderRadius: 12, padding: '14px' }}>
                <div style={{ fontSize: 10.5, fontFamily: MONO, color: TONE_FG.green, fontWeight: 700, marginBottom: 8, letterSpacing: 0.4 }}>📤 출력 (OUTPUT)</div>
                <div style={{ fontSize: 12, color: TONE_FG.green, lineHeight: 1.65 }}>
                  • 책 제목<br/>• 추천 이유 (2줄)<br/>• 부서 인기 순위<br/>• 표지 이미지 URL
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: P.text, marginBottom: 6 }}>
            실패하면 어떻게 할까요? <span style={{ fontWeight: 500, color: P.textMuted, fontSize: 12 }}>(폴백 전략)</span>
          </div>
          <p style={{ fontSize: 12.5, color: P.textMuted, lineHeight: 1.55, marginBottom: 14 }}>
            AI가 답을 못 주거나 느릴 때의 대처법이에요. 사용자 입장에서 "에러"라고 느끼지 않게 만드는 게 핵심.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: '⏱', iconBg: P.amberSoft, iconColor: TONE_FG.amber, title: 'AI가 30초 안에 답을 못 주면', action: '저장된 "지난주 인기 책 Top 1"을 대신 보냅니다', ok: true },
              { icon: '✕', iconBg: P.redSoft, iconColor: TONE_FG.red, title: 'AI 응답이 형식에 맞지 않으면', action: '한 번 더 요청 (재시도) 후, 그래도 안 되면 인기 책 추천', ok: true },
              { icon: '💰', iconBg: P.surfaceAlt, iconColor: P.textMuted, title: '월 API 비용 한도를 넘으면', action: '미정 — AI에게 추천 받기', ok: false },
            ].map((rule, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, background: rule.iconBg, color: rule.iconColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  flexShrink: 0, fontWeight: 700,
                }}>{rule.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{rule.title}</div>
                  <div style={{ fontSize: 12, color: rule.ok ? P.textMuted : P.textSubtle, marginTop: 3, lineHeight: 1.55, fontStyle: rule.ok ? 'normal' : 'italic' }}>→ {rule.action}</div>
                </div>
                {rule.ok ? (
                  <span style={{ fontSize: 11, fontWeight: 600, color: P.green, padding: '3px 8px', background: P.greenSoft, borderRadius: 4 }}>정의됨</span>
                ) : (
                  <button style={{ fontSize: 11, fontWeight: 600, color: P.accent, padding: '3px 8px', background: P.accentSoft, border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit' }}>채우기 →</button>
                )}
              </div>
            ))}
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: P.text, marginTop: 24, marginBottom: 10 }}>어떤 AI 모델을 쓸까요?</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <TemplateCard title="Claude Sonnet 4.5" badge="추천" desc="가장 균형 좋은 모델. 한국어 자연스럽고, 가격도 합리적." selected/>
            <TemplateCard title="Claude Haiku" desc="빠르고 저렴. 단순 추천이라면 충분. 깊이 있는 추론은 약함."/>
            <TemplateCard title="Claude Opus" badge="고급" desc="가장 똑똑하지만 비쌈. 복잡한 분석/장문 추천에 적합."/>
          </div>

          <div style={{ marginTop: 14, padding: '12px 14px', background: P.surfaceAlt, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <DesignIcon kind="bulb" size={14} color={P.accent}/>
            <span style={{ fontSize: 12.5, color: P.text, flex: 1 }}>
              <strong>예상 월 비용</strong> — 150명 × 주 1회 추천 = 약 <strong style={{ color: P.accent }}>$8 ~ $12</strong>
            </span>
            <span style={{ fontSize: 11, color: P.textSubtle, fontFamily: MONO }}>Sonnet 4.5 기준</span>
          </div>
        </div>
      </div>
      <DesignStepFooter primaryLabel="다음 →"/>
    </DesignShell>
  );
}


// ============================================================
// 11. SCREEN 05 · 완료 — Design Complete
// ============================================================

function ScreenDesignComplete() {
  const summary = [
    { n: '01', t: '기능 정의', icon: 'features', stats: '기능 3개 · 품질기준 4개' },
    { n: '02', t: '시스템 구조', icon: 'arch', stats: '부품 6개 · 간단 조합' },
    { n: '03', t: '데이터 구조', icon: 'data', stats: '그룹 3개 · 항목 15개' },
    { n: '04', t: 'AI 흐름', icon: 'ai', stats: '입력 3 · 출력 4 · 폴백 3' },
  ];

  return (
    <Frame page="내 프로젝트">
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: P.bg, padding: 40, overflow: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 760 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
              {['🎉', '✨', '🎯', '🚀'].map((e, i) => (
                <span key={i} style={{ fontSize: 28, animation: `bob 1.5s ease-in-out infinite ${i * 0.15}s`, display: 'inline-block' }}>{e}</span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: P.accent, fontWeight: 700, fontFamily: MONO, letterSpacing: 0.5, marginBottom: 6 }}>PHASE 2 COMPLETE</div>
            <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5, margin: 0, color: P.text }}>설계 단계 완료!</h1>
            <p style={{ fontSize: 14, color: P.textMuted, lineHeight: 1.6, marginTop: 10 }}>
              개발자에게 바로 전달할 수 있는 설계 문서가 준비되었어요.
            </p>
          </div>

          <div style={{
            padding: '20px 24px', background: P.accentSoft, borderRadius: 14,
            border: `1px solid ${P.accent}25`, marginBottom: 18,
            display: 'flex', alignItems: 'center', gap: 24,
          }}>
            <div style={{ textAlign: 'center', paddingRight: 24, borderRight: `1px solid ${P.accent}30` }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: P.accent, fontFamily: MONO, lineHeight: 1, letterSpacing: -0.8 }}>100%</div>
              <div style={{ fontSize: 11, color: P.accentDeep, marginTop: 4 }}>4 / 4 단계</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: P.accentDeep, marginBottom: 4 }}>설계 문서 v1.0 생성 완료</div>
              <div style={{ fontSize: 12, color: P.accent, opacity: 0.85, lineHeight: 1.55 }}>약 18분 소요 · 33개 정의 항목 · 자동 다이어그램 3개</div>
            </div>
          </div>

          <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 22 }}>
            {summary.map((s, i) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderTop: i === 0 ? 'none' : `1px solid ${P.border}` }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: P.greenSoft, color: P.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <DesignIcon kind={s.icon} size={15}/>
                </div>
                <span style={{ fontSize: 10.5, fontFamily: MONO, color: P.textSubtle, fontWeight: 700 }}>{s.n}</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: P.text, flex: 1 }}>{s.t}</span>
                <span style={{ fontSize: 11.5, color: P.textMuted, fontFamily: MONO }}>{s.stats}</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
                  color: TONE_FG.green, padding: '3px 8px', background: P.greenSoft, borderRadius: 5,
                }}>
                  <DesignIcon kind="check" size={10}/>완료
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {['Markdown 다운로드', 'PDF 다운로드', '🔗 공유 링크'].map((label, i) => (
              <button key={i} style={{
                flex: 1, padding: '12px', fontSize: 13, fontWeight: 600,
                background: P.surface, color: P.text, border: `1px solid ${P.borderStrong}`, borderRadius: 9,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              }}>
                {i < 2 && I.download} {label}
              </button>
            ))}
          </div>

          <div style={{
            padding: '18px 22px', background: `linear-gradient(135deg, ${P.accent} 0%, ${P.accentDeep} 100%)`,
            borderRadius: 14, color: '#fff',
            display: 'flex', gap: 16, alignItems: 'center',
            boxShadow: `0 8px 24px -8px ${P.accent}60`,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10.5, fontFamily: MONO, opacity: 0.7, fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>NEXT · PHASE 3</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>구현 단계로 넘어갈까요?</div>
              <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.55 }}>개발 착수 체크리스트와 .env 변수, 폴더 구조까지 함께 만들어드려요.</div>
            </div>
            <button style={{
              padding: '12px 20px', fontSize: 14, fontWeight: 700,
              background: '#fff', color: P.accentDeep, border: 'none', borderRadius: 9,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: 7, flexShrink: 0,
            }}>
              시작하기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }`}</style>
    </Frame>
  );
}


// ============================================================
// 12. EXPORTS — register the 9 screens to window
// ============================================================

Object.assign(window, {
  ScreenDesignWelcome,
  ScreenDesignStep1Start,
  ScreenDesignStep1to2,
  ScreenDesignStep2Start,
  ScreenDesignStep2to3,
  ScreenDesignStep3Start,
  ScreenDesignStep3to4,
  ScreenDesignStep4Start,
  ScreenDesignComplete,
});
