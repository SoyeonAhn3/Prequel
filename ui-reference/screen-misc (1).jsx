// Screen 7: User Guide / FAQ
function ScreenGuide() {
  return (
    <Frame page="가이드">
      <div style={{ height: '100%', display: 'flex', maxWidth: 1180, margin: '0 auto', width: '100%' }}>
        {/* TOC */}
        <div style={{ width: 240, padding: '40px 18px 32px 40px', flexShrink: 0 }}>
          <div style={{ fontSize: 11.5, color: P.textSubtle, fontFamily: MONO, marginBottom: 12, padding: '0 8px' }}>목차</div>
          {[
            ['시작하기', true],
            ['프로젝트 유형', false],
            ['인터뷰 진행', false],
            ['결과 해석', false],
            ['일시정지 & 이어하기', false],
            ['요금제', false],
            ['FAQ', false],
          ].map(([t, on]) => (
            <div key={t} style={{ padding: '7px 8px', fontSize: 13, color: on ? P.accent : P.textMuted, fontWeight: on ? 600 : 500, borderLeft: on ? `2px solid ${P.accent}` : `2px solid transparent`, marginBottom: 2, marginLeft: -2 }}>{t}</div>
          ))}
        </div>

        <div style={{ flex: 1, padding: '40px 56px 60px', overflow: 'auto' }}>
          <div style={{ fontSize: 11.5, color: P.textSubtle, fontFamily: MONO, marginBottom: 8 }}>GETTING STARTED</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>Prequel 시작하기</h1>
          <p style={{ fontSize: 15, color: P.textMuted, lineHeight: 1.65, marginTop: 12, maxWidth: 580 }}>
            처음 사용하신다면 아래 4단계만 따라하시면 됩니다. 전체 과정은 평균 25~30분 소요됩니다.
          </p>

          {/* Step cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginTop: 28 }}>
            {[
              ['01', '로그인', 'Google 또는 GitHub 계정으로 간편하게 시작하세요. 계정당 무료 2회를 제공합니다.'],
              ['02', '아이디어 입력', '프로젝트의 핵심 아이디어를 자유롭게 입력하면 AI가 7가지 유형 중 하나로 자동 감지합니다.'],
              ['03', '인터뷰 진행', '구조화된 질문에 답하세요. 답이 어려우면 "추천해줘"라고 말씀하시면 됩니다.'],
              ['04', '결과 확인', '킥오프 문서와 아키텍처 다이어그램을 받아 Markdown 또는 PDF로 내보내세요.'],
            ].map(([n, t, d]) => (
              <div key={n} style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ fontSize: 11, fontFamily: MONO, color: P.textSubtle, marginBottom: 8 }}>STEP {n}</div>
                <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>{t}</div>
                <p style={{ fontSize: 13, color: P.textMuted, lineHeight: 1.6, margin: '8px 0 0' }}>{d}</p>
              </div>
            ))}
          </div>

          {/* Tip callout */}
          <div style={{ marginTop: 28, padding: '16px 18px', background: P.amberSoft, borderRadius: 12, display: 'flex', gap: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', color: '#7e5a23', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{I.spark}</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#6a4d1c' }}>처음이라면</div>
              <p style={{ fontSize: 13, color: '#6a4d1c', margin: '4px 0 0', lineHeight: 1.6 }}>
                "샘플 결과 보기"에서 유형별 예시를 먼저 확인해 보세요. 어떤 결과가 나오는지 미리 알면 인터뷰 답변이 훨씬 수월해집니다.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div style={{ marginTop: 40 }}>
            <div style={{ fontSize: 11.5, color: P.textSubtle, fontFamily: MONO, marginBottom: 8 }}>FAQ</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>자주 묻는 질문</h3>
            <div style={{ marginTop: 16, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden' }}>
              {[
                ['인터뷰 중간에 멈춰도 되나요?', '네. 답변을 보내면 자동 저장되고, 일시정지 버튼 또는 브라우저 종료 시에도 진행 상태가 보존됩니다.', true],
                ['결과 문서를 수정할 수 있나요?', 'MVP-1에서는 읽기 전용이며, Markdown 또는 PDF로 내보내 외부 에디터에서 수정하실 수 있습니다. 인라인 편집은 MVP-2에서 제공 예정입니다.', false],
                ['무료 2회를 다 사용하면?', '추가 사용은 차단되며, 곧 제공될 Basic(월 10회) / Pro(월 30회) 플랜으로 전환하실 수 있습니다.', false],
                ['언어를 중간에 바꿀 수 있나요?', '프로젝트 생성 시점에 언어가 고정됩니다. 다른 언어가 필요하면 새 프로젝트를 만들어 주세요.', false],
              ].map(([q, a, open], i) => (
                <div key={i} style={{ borderTop: i === 0 ? 'none' : `1px solid ${P.border}`, padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{q}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none' }}><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                  {open && (
                    <p style={{ fontSize: 13, color: P.textMuted, lineHeight: 1.65, margin: '10px 0 0' }}>{a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

// Screen 8: Announcements / Patch notes
function ScreenAnnouncements() {
  const items = [
    { type: 'notice', pinned: true, title: '5월 21일(목) 02:00~03:00 점검 안내', date: '2026-05-18', body: 'Supabase 데이터베이스 업그레이드 작업이 진행됩니다. 작업 중 로그인 및 인터뷰 진행이 일시적으로 제한될 수 있습니다.' },
    { type: 'patch', version: 'v0.4.2', title: '인터뷰 자동 저장 안정성 개선', date: '2026-05-15', body: '브라우저 종료 직전 답변이 유실되던 문제를 수정했습니다. 5분 무응답 자동 일시정지 로직도 다듬었어요.' },
    { type: 'patch', version: 'v0.4.0', title: '한국어 / 영어 UI 동시 지원', date: '2026-05-10', body: 'react-i18next 기반으로 언어 전환이 가능합니다. 프로젝트 단위로 산출물 언어가 고정됩니다.' },
    { type: 'notice', title: 'Prequel 베타가 열렸습니다 🎉', date: '2026-05-01', body: '계정당 무료 2회 킥오프를 제공합니다. 피드백은 feedback@prequel.io로 보내주세요.' },
  ];

  return (
    <Frame page="공지사항">
      <div style={{ padding: '40px 56px 60px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontSize: 11.5, color: P.textSubtle, fontFamily: MONO, marginBottom: 6 }}>NEWS &amp; UPDATES</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: -0.3 }}>공지사항 / 패치내역</h2>

        <div style={{ display: 'flex', gap: 4, padding: 3, background: P.surfaceAlt, borderRadius: 8, marginTop: 22, width: 'fit-content' }}>
          {[['전체', true], ['공지', false], ['패치내역', false]].map(([t, on]) => (
            <div key={t} style={{ fontSize: 12.5, padding: '6px 14px', borderRadius: 6, fontWeight: on ? 600 : 500, color: on ? P.text : P.textMuted, background: on ? P.surface : 'transparent', cursor: 'pointer' }}>{t}</div>
          ))}
        </div>

        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((it, i) => (
            <div key={i} style={{
              background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12,
              padding: '20px 22px', position: 'relative',
            }}>
              {it.pinned && (
                <div style={{ position: 'absolute', top: -8, left: 18, padding: '3px 9px', background: P.text, color: '#fff', fontSize: 11, fontWeight: 600, borderRadius: 5, fontFamily: MONO, letterSpacing: 0.3 }}>📌 PINNED</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {it.type === 'notice' ? <Tag tone="accent">공지</Tag> : <Tag tone="green">패치 {it.version}</Tag>}
                <span style={{ fontSize: 11.5, color: P.textSubtle, fontFamily: MONO }}>{it.date}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>{it.title}</div>
              <p style={{ fontSize: 13.5, color: P.textMuted, lineHeight: 1.65, margin: '10px 0 0' }}>{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

window.ScreenGuide = ScreenGuide;
window.ScreenAnnouncements = ScreenAnnouncements;
