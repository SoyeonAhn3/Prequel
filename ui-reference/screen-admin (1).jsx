// Screen 6: Admin dashboard
function ScreenAdmin() {
  return (
    <Frame page="">
      <div style={{ height: '100%', display: 'flex' }}>
        {/* Admin sidebar */}
        <div style={{ width: 220, background: P.surface, borderRight: `1px solid ${P.border}`, padding: '24px 14px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 16px', borderBottom: `1px solid ${P.border}`, marginBottom: 12 }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: P.text, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>A</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Admin</div>
          </div>
          {[
            ['개요', true],
            ['사용자', false],
            ['프로젝트', false],
            ['토큰 사용량', false],
            ['결제 이력', false],
            ['공지사항', false],
            ['시스템 로그', false],
          ].map(([t, on]) => (
            <div key={t} style={{
              padding: '8px 10px', fontSize: 13, borderRadius: 6,
              background: on ? P.surfaceAlt : 'transparent',
              color: on ? P.text : P.textMuted, fontWeight: on ? 600 : 500,
              marginBottom: 2,
            }}>{t}</div>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ padding: '28px 40px 12px' }}>
            <div style={{ fontSize: 11.5, color: P.textSubtle, fontFamily: MONO, marginBottom: 6 }}>OPERATIONS · 2026-05-18</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -0.3 }}>대시보드 개요</h2>
          </div>

          {/* KPI row */}
          <div style={{ padding: '16px 40px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {[
              ['총 사용자', '1,247', '+38 이번 주', P.accent],
              ['활성 프로젝트', '163', '+12 어제', P.green],
              ['오늘 토큰 사용', '4.2M', '$8.40', P.amber],
              ['API 평균 응답', '1.8s', 'p95 < 30s', P.text],
            ].map(([l, v, d, c], i) => (
              <div key={i} style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, color: P.textMuted }}>{l}</div>
                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6, letterSpacing: -0.4, color: c }}>{v}</div>
                <div style={{ fontSize: 11.5, color: P.textSubtle, marginTop: 4, fontFamily: MONO }}>{d}</div>
              </div>
            ))}
          </div>

          {/* Two columns */}
          <div style={{ padding: '24px 40px 40px', display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
            {/* Token chart */}
            <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>토큰 사용량 (7일)</div>
                  <div style={{ fontSize: 11.5, color: P.textSubtle, marginTop: 3, fontFamily: MONO }}>일평균 3.6M tok · $7.20</div>
                </div>
                <div style={{ display: 'flex', gap: 4, padding: 2, background: P.surfaceAlt, borderRadius: 6, fontSize: 11.5 }}>
                  {['7D', '30D', '90D'].map((t, i) => (
                    <div key={t} style={{ padding: '4px 10px', borderRadius: 4, background: i === 0 ? P.surface : 'transparent', color: i === 0 ? P.text : P.textMuted, fontWeight: i === 0 ? 600 : 500 }}>{t}</div>
                  ))}
                </div>
              </div>
              <svg viewBox="0 0 500 180" width="100%" style={{ display: 'block' }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={P.accent} stopOpacity="0.18"/>
                    <stop offset="100%" stopColor={P.accent} stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {[40, 80, 120].map(y => <line key={y} x1="20" y1={y} x2="490" y2={y} stroke={P.border}/>)}
                <path d="M30 120 L100 90 L170 100 L240 60 L310 70 L380 50 L460 65" stroke={P.accent} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M30 120 L100 90 L170 100 L240 60 L310 70 L380 50 L460 65 L460 160 L30 160 Z" fill="url(#g1)"/>
                {[30, 100, 170, 240, 310, 380, 460].map((x, i) => (
                  <circle key={i} cx={x} cy={[120, 90, 100, 60, 70, 50, 65][i]} r="3" fill="#fff" stroke={P.accent} strokeWidth="1.8"/>
                ))}
                {['월', '화', '수', '목', '금', '토', '일'].map((d, i) => (
                  <text key={i} x={[30, 100, 170, 240, 310, 380, 460][i]} y="175" fontSize="10" textAnchor="middle" fill={P.textSubtle}>{d}</text>
                ))}
              </svg>
            </div>

            {/* Recent users */}
            <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 14 }}>최근 가입</div>
              {[
                ['김민준', 'minjun@example.com', 'FREE'],
                ['Sarah Lee', 'sarah@team.io', 'BASIC'],
                ['이도현', 'dohyun@startup.kr', 'FREE'],
                ['Park Soo', 'soo@labs.co', 'PRO'],
              ].map(([n, e, p], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderTop: i === 0 ? 'none' : `1px solid ${P.border}` }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: P.surfaceAlt, color: P.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>{n[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{n}</div>
                    <div style={{ fontSize: 11, color: P.textSubtle, fontFamily: MONO, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e}</div>
                  </div>
                  <Tag tone={p === 'PRO' ? 'accent' : p === 'BASIC' ? 'amber' : 'neutral'}>{p}</Tag>
                </div>
              ))}
            </div>

            {/* User management table */}
            <div style={{ gridColumn: '1 / -1', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${P.border}` }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>사용자 관리</div>
                <Tag>1,247명</Tag>
                <div style={{ flex: 1 }}/>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 11px', border: `1px solid ${P.border}`, borderRadius: 7, color: P.textMuted, fontSize: 12.5, width: 200 }}>
                  {I.search}<span>이메일로 검색</span>
                </div>
                <Btn kind="primary" size="sm">CSV 내보내기</Btn>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.4fr 0.7fr 0.8fr 0.8fr 0.8fr', padding: '10px 20px', fontSize: 11, color: P.textSubtle, background: P.surfaceAlt, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>
                <div>이름</div><div>이메일</div><div>플랜</div><div>사용</div><div>가입일</div><div>작업</div>
              </div>
              {[
                ['김민준', 'minjun@example.com', 'FREE', '1/2', '2026-05-17'],
                ['Sarah Lee', 'sarah@team.io', 'BASIC', '4/10', '2026-05-16'],
                ['이도현', 'dohyun@startup.kr', 'FREE', '0/2', '2026-05-15'],
                ['Park Soo Min', 'soo@labs.co', 'PRO', '12/30', '2026-05-12'],
              ].map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.4fr 0.7fr 0.8fr 0.8fr 0.8fr', padding: '12px 20px', fontSize: 13, borderTop: `1px solid ${P.border}`, alignItems: 'center' }}>
                  <div style={{ fontWeight: 500 }}>{r[0]}</div>
                  <div style={{ fontFamily: MONO, fontSize: 11.5, color: P.textMuted }}>{r[1]}</div>
                  <div><Tag tone={r[2] === 'PRO' ? 'accent' : r[2] === 'BASIC' ? 'amber' : 'neutral'}>{r[2]}</Tag></div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: P.textMuted }}>{r[3]}</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: P.textSubtle }}>{r[4]}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 12, color: P.textMuted, cursor: 'pointer' }}>상세</span>
                    <span style={{ fontSize: 12, color: P.red, cursor: 'pointer' }}>정지</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

window.ScreenAdmin = ScreenAdmin;
