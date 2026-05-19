// Prequel — UI Screens
// Light, friendly, minimal. Korean-first.

const P = {
  bg: '#fbfaf7',
  surface: '#ffffff',
  surfaceAlt: '#f6f4ef',
  border: '#ebe7dd',
  borderStrong: '#d9d4c5',
  text: '#1f1d18',
  textMuted: '#6b6658',
  textSubtle: '#9b9685',
  accent: '#3d57c4',
  accentSoft: '#e9ecfa',
  accentDeep: '#2a3f9e',
  amber: '#e8a548',
  amberSoft: '#fbeed3',
  green: '#3f8a5a',
  greenSoft: '#e2efe5',
  red: '#c45a4a',
  redSoft: '#f7e3df',
};

const FONT = '"Pretendard", "Pretendard Variable", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
const MONO = '"JetBrains Mono", "SF Mono", ui-monospace, Menlo, monospace';

// ============================================================
// Shared primitives
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
      display: 'flex', alignItems: 'center', padding: '0 28px', gap: 28,
      flex: '0 0 auto',
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
            fontSize: 11.5, fontFamily: MONO, color: P.textMuted,
            padding: '4px 9px', background: P.surfaceAlt, borderRadius: 6,
            border: `1px solid ${P.border}`,
          }}>잔여 1 / 2</div>
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
  return (
    <button style={{ ...base, ...sizes[size], ...kinds[kind], ...style }}>
      {icon}
      {children}
    </button>
  );
}

function Tag({ children, tone = 'neutral' }) {
  const tones = {
    neutral: { bg: P.surfaceAlt, fg: P.textMuted, bd: P.border },
    accent: { bg: P.accentSoft, fg: P.accentDeep, bd: 'transparent' },
    amber: { bg: P.amberSoft, fg: '#946420', bd: 'transparent' },
    green: { bg: P.greenSoft, fg: '#2c6444', bd: 'transparent' },
    red: { bg: P.redSoft, fg: '#8a3a2c', bd: 'transparent' },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5,
      fontWeight: 500, color: t.fg, background: t.bg,
      padding: '3px 8px', borderRadius: 5, border: `1px solid ${t.bd}`,
      letterSpacing: 0,
    }}>{children}</span>
  );
}

function Frame({ children, withTopBar = true, user = '서', page = '' }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: P.bg, color: P.text,
      fontFamily: FONT, fontSize: 14, display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {withTopBar && <TopBar user={user} page={page}/>}
      <div style={{ flex: 1, overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

// Tiny icons (stroke)
const I = {
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  send: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"/></svg>,
  pause: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4v16M18 4v16"/></svg>,
  download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11"/></svg>,
  more: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>,
  spark: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2"/></svg>,
};

Object.assign(window, { P, FONT, MONO, Logo, TopBar, Btn, Tag, Frame, I });
