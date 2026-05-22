// Design phase — shared shell and beginner-friendly primitives
// Design UI is for "people who don't know much about design/architecture",
// so it must lean on examples, visual choices, and plain Korean.

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
    case 'eye': return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
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

// ============================================================
// Beginner-friendly primitives
// ============================================================

// Explainer card — "이게 뭐예요?" with plain Korean
function Explainer({ title, plain, technical, example }) {
  return (
    <div style={{
      background: P.accentSoft, border: `1px solid ${P.accent}20`, borderRadius: 12,
      padding: '14px 16px', marginBottom: 18,
    }}>
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
          <span style={{ fontSize: 10.5, fontFamily: MONO, color: P.accent, opacity: 0.7, padding: '2px 7px', background: P.surface, borderRadius: 4 }}>
            {technical}
          </span>
        )}
      </div>
      <div style={{ fontSize: 13, color: P.accentDeep, fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <p style={{ fontSize: 12.5, color: P.accent, opacity: 0.9, lineHeight: 1.6, margin: 0 }}>
        {plain}
      </p>
      {example && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${P.accent}30`, fontSize: 11.5, color: P.accent, opacity: 0.85, lineHeight: 1.55 }}>
          <strong style={{ fontWeight: 700 }}>예시</strong> · {example}
        </div>
      )}
    </div>
  );
}

// Template chooser — pick from preset starter templates
function TemplateCard({ title, desc, badge, selected = false }) {
  return (
    <div style={{
      flex: 1, padding: '14px 16px',
      background: selected ? P.accentSoft : P.surface,
      border: `1.5px solid ${selected ? P.accent : P.border}`,
      borderRadius: 10, cursor: 'pointer', position: 'relative',
      transition: 'all .15s',
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
      <div style={{ fontSize: 11.5, color: selected ? P.accent : P.textMuted, opacity: selected ? 0.9 : 1, lineHeight: 1.55, paddingRight: selected ? 24 : 0 }}>
        {desc}
      </div>
    </div>
  );
}

// Example showing what a "good answer" looks like
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

// ============================================================
// Shell — left rail + main + right helper
// ============================================================
function DesignShell({ activeStep = 'requirements', stepProgress = '2/5', stepTotal = 5, children, helperPanel }) {
  return (
    <Frame page="내 프로젝트">
      <div style={{ height: '100%', display: 'flex' }}>
        {/* LEFT — design phase navigator */}
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

          {/* Phase progress */}
          <div style={{ marginTop: 18, padding: '14px', background: P.accentSoft, borderRadius: 12, border: `1px solid ${P.accent}25` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
              <span style={{ fontSize: 10, fontFamily: MONO, color: P.accentDeep, fontWeight: 700, letterSpacing: 0.5 }}>전체 진행률</span>
              <span style={{ fontSize: 11, color: P.accentDeep, fontFamily: MONO, fontWeight: 600 }}>{stepProgress}</span>
            </div>
            <div style={{ height: 5, background: P.surface, borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ width: `${(parseInt(stepProgress) / stepTotal) * 100}%`, height: '100%', background: P.accent, borderRadius: 5 }}/>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: P.accentDeep, opacity: 0.85 }}>
              설계 4단계 · 약 20분 소요
            </div>
          </div>

          {/* Design steps */}
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

          {/* Help link */}
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

        {/* MAIN — design step content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: P.bg, overflow: 'hidden' }}>
          {children}
        </div>

        {/* RIGHT — helper panel (optional) */}
        {helperPanel && (
          <div style={{ width: 300, borderLeft: `1px solid ${P.border}`, background: P.surface, padding: '22px 20px', overflow: 'auto', flexShrink: 0 }}>
            {helperPanel}
          </div>
        )}
      </div>
    </Frame>
  );
}

// Step header — title + plain explanation + progress
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
      {subtitle && (
        <p style={{ fontSize: 13.5, color: P.textMuted, lineHeight: 1.6, margin: '8px 0 0', maxWidth: 720 }}>{subtitle}</p>
      )}
    </div>
  );
}

// Footer with back/save/next
function DesignStepFooter({ canBack = true, primaryLabel = '다음 단계' }) {
  return (
    <div style={{
      padding: '14px 32px', background: P.surface, borderTop: `1px solid ${P.border}`,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
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

window.DESIGN_STEPS = DESIGN_STEPS;
window.DesignIcon = DesignIcon;
window.AiMarkD = AiMarkD;
window.Explainer = Explainer;
window.TemplateCard = TemplateCard;
window.ExampleBox = ExampleBox;
window.DesignShell = DesignShell;
window.DesignStepHeader = DesignStepHeader;
window.DesignStepFooter = DesignStepFooter;
