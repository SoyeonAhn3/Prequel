// Screen 3: My Projects list
function ScreenProjects() {
  const projects = [
    { name: '사내 도서 추천 봇', type: 'AI/ML', status: 'in_progress', date: '2026-05-17', progress: 60, lang: 'KO' },
    { name: 'B2B 영업 대시보드', type: 'Web App', status: 'completed', date: '2026-05-12', lang: 'KO' },
    { name: '재고 관리 자동화', type: 'Internal Tool', status: 'completed', date: '2026-05-08', lang: 'EN' },
    { name: 'Customer Onboarding Flow', type: 'Web App', status: 'paused', date: '2026-05-05', progress: 30, lang: 'EN' },
    { name: '구독자 알림 워크플로우', type: 'Automation', status: 'completed', date: '2026-04-28', lang: 'KO' },
  ];

  return (
    <Frame page="내 프로젝트">
      <div style={{ padding: '40px 56px 0', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 12, color: P.textSubtle, fontFamily: MONO, marginBottom: 6 }}>안녕하세요, 서지원님</div>
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.3, margin: 0 }}>내 프로젝트</h2>
          </div>
          <Btn kind="primary" size="md" icon={I.plus}>새 프로젝트</Btn>
        </div>

        <div style={{ display: 'flex', gap: 14, marginTop: 24 }}>
          {/* Quota card */}
          <div style={{ flex: 1, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12.5, color: P.textMuted }}>이번 달 사용</div>
              <Tag tone="accent">FREE</Tag>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
              <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>1</span>
              <span style={{ fontSize: 14, color: P.textSubtle }}>/ 2 회</span>
            </div>
            <div style={{ height: 4, background: P.surfaceAlt, borderRadius: 4, marginTop: 10 }}>
              <div style={{ width: '50%', height: '100%', background: P.accent, borderRadius: 4 }}/>
            </div>
          </div>

          <div style={{ flex: 1, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontSize: 12.5, color: P.textMuted }}>완료한 킥오프</div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, marginTop: 8 }}>3</div>
            <div style={{ fontSize: 12, color: P.textSubtle, marginTop: 4 }}>지난달 대비 +2</div>
          </div>

          <div style={{ flex: 1, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontSize: 12.5, color: P.textMuted }}>진행 중</div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, marginTop: 8 }}>2</div>
            <div style={{ fontSize: 12, color: P.textSubtle, marginTop: 4 }}>이어하기 가능</div>
          </div>

          <div style={{ flex: 1.4, background: '#fffaf0', border: `1px solid ${P.amberSoft}`, borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: P.amberSoft, color: '#946420', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{I.spark}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>1회 남았어요</div>
              <div style={{ fontSize: 12, color: P.textMuted, marginTop: 2 }}>유료 전환 시 월 10~30회 사용 가능</div>
            </div>
          </div>
        </div>

        {/* Filter row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 32, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 4, padding: 3, background: P.surfaceAlt, borderRadius: 8 }}>
            {[['전체', 5, true], ['진행 중', 2, false], ['완료', 3, false]].map(([t, n, on]) => (
              <div key={t} style={{
                fontSize: 12.5, padding: '5px 11px', borderRadius: 6, fontWeight: on ? 600 : 500,
                color: on ? P.text : P.textMuted, background: on ? P.surface : 'transparent',
                boxShadow: on ? '0 1px 2px rgba(0,0,0,.04)' : 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>{t}<span style={{ fontSize: 10.5, color: P.textSubtle, fontFamily: MONO }}>{n}</span></div>
            ))}
          </div>
          <div style={{ flex: 1 }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, color: P.textMuted, fontSize: 12.5, width: 220 }}>
            {I.search}<span>프로젝트 검색</span>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 0.9fr 0.9fr 0.7fr 0.7fr 40px', padding: '11px 20px', fontSize: 11.5, color: P.textSubtle, fontWeight: 600, background: P.surfaceAlt, borderBottom: `1px solid ${P.border}`, letterSpacing: 0.2, textTransform: 'uppercase' }}>
            <div>프로젝트</div><div>유형</div><div>상태</div><div>언어</div><div>업데이트</div><div/>
          </div>
          {projects.map((p, i) => {
            const statusMap = {
              in_progress: { tone: 'accent', label: '진행 중' },
              completed: { tone: 'green', label: '완료' },
              paused: { tone: 'amber', label: '일시정지' },
            }[p.status];
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.8fr 0.9fr 0.9fr 0.7fr 0.7fr 40px', padding: '14px 20px', fontSize: 13.5, borderBottom: i === projects.length - 1 ? 'none' : `1px solid ${P.border}`, alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: P.text }}>{p.name}</div>
                  {p.progress !== undefined && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <div style={{ width: 80, height: 3, background: P.surfaceAlt, borderRadius: 3 }}>
                        <div style={{ width: `${p.progress}%`, height: '100%', background: P.accent, borderRadius: 3 }}/>
                      </div>
                      <span style={{ fontSize: 11, color: P.textSubtle, fontFamily: MONO }}>{p.progress}%</span>
                    </div>
                  )}
                </div>
                <div style={{ color: P.textMuted, fontSize: 12.5 }}>{p.type}</div>
                <div><Tag tone={statusMap.tone}>{statusMap.label}</Tag></div>
                <div style={{ color: P.textMuted, fontSize: 12, fontFamily: MONO }}>{p.lang}</div>
                <div style={{ color: P.textSubtle, fontSize: 12.5, fontFamily: MONO }}>{p.date}</div>
                <div style={{ color: P.textSubtle, display: 'flex', justifyContent: 'flex-end' }}>{I.more}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Frame>
  );
}

window.ScreenProjects = ScreenProjects;
