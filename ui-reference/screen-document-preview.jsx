// /document-preview — Live kickoff document preview
// Users see what they've built so far, section-by-section.
// Mix of "complete / in-progress / empty" states; export options at top.

function ScreenDocumentPreview() {
  const sections = [
    { id: 'profile', n: '01', t: '프로젝트 프로필', status: 'complete', phase: 1 },
    { id: 'features', n: '02', t: '기능 정의', status: 'complete', phase: 1 },
    { id: 'architecture', n: '03', t: '시스템 구조', status: 'complete', phase: 2 },
    { id: 'data', n: '04', t: '데이터 구조', status: 'in-progress', phase: 2 },
    { id: 'ai-workflow', n: '05', t: 'AI 흐름', status: 'empty', phase: 2 },
    { id: 'evaluation', n: '06', t: '정직한 평가', status: 'complete', phase: 1 },
    { id: 'dod', n: '07', t: '완료 조건', status: 'complete', phase: 1 },
  ];

  const statusMap = {
    complete: { tone: 'green', label: '완료', color: P.green, soft: P.greenSoft, fg: TONE_FG.green },
    'in-progress': { tone: 'accent', label: '작성 중', color: P.accent, soft: P.accentSoft, fg: P.accentDeep },
    empty: { tone: 'neutral', label: '미작성', color: P.textSubtle, soft: P.surfaceAlt, fg: P.textSubtle },
  };

  return (
    <Frame page="내 프로젝트">
      <div style={{ height: '100%', display: 'flex' }}>

        {/* LEFT — Table of contents with progress */}
        <div style={{ width: 280, borderRight: `1px solid ${P.border}`, background: P.surface, padding: '24px 18px', overflow: 'auto', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: P.textSubtle, fontFamily: MONO, marginBottom: 6, letterSpacing: 0.4 }}>PROJECT</div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2, color: P.text }}>사내 도서 추천 봇</div>
          <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
            <Tag tone="accent">AI/ML</Tag>
            <Tag>KO</Tag>
          </div>

          {/* Doc completeness */}
          <div style={{ marginTop: 20, padding: '14px', background: P.accentSoft, borderRadius: 12, border: `1px solid ${P.accent}25` }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: P.accent, letterSpacing: -0.6, fontFamily: MONO, lineHeight: 1 }}>72</span>
              <span style={{ fontSize: 13, color: P.accentDeep, opacity: 0.7 }}>%</span>
              <div style={{ flex: 1 }}/>
              <span style={{ fontSize: 11, color: P.accentDeep, fontWeight: 600 }}>문서 완성도</span>
            </div>
            <div style={{ height: 5, background: P.surface, borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ width: '72%', height: '100%', background: P.accent, borderRadius: 5 }}/>
            </div>
            <div style={{ marginTop: 9, fontSize: 11, color: P.accentDeep, opacity: 0.8 }}>
              5 / 7 섹션 완료
            </div>
          </div>

          <div style={{ marginTop: 22 }}>
            <div style={{ fontSize: 10.5, color: P.textSubtle, fontFamily: MONO, marginBottom: 10, letterSpacing: 0.4 }}>CONTENTS</div>
            {sections.map((s, i) => {
              const st = statusMap[s.status];
              const isActive = s.id === 'data';
              return (
                <div key={s.id} style={{
                  display: 'flex', gap: 9, padding: '8px 9px',
                  borderRadius: 7, marginBottom: 2, cursor: 'pointer',
                  background: isActive ? P.accentSoft : 'transparent',
                  border: isActive ? `1px solid ${P.accent}25` : '1px solid transparent',
                  alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: 10, fontFamily: MONO, color: isActive ? P.accent : P.textSubtle, fontWeight: 700, paddingTop: 3, width: 18 }}>{s.n}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: isActive ? 600 : 500, color: isActive ? P.accentDeep : P.text, lineHeight: 1.4 }}>
                      {s.t}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.color }}/>
                      <span style={{ fontSize: 10.5, color: st.fg, fontWeight: 500 }}>{st.label}</span>
                      <span style={{ flex: 1 }}/>
                      <span style={{ fontSize: 9.5, fontFamily: MONO, color: P.textSubtle, padding: '1px 5px', background: P.surfaceAlt, borderRadius: 3 }}>P{s.phase}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button style={{
            marginTop: 18, width: '100%', padding: '9px 12px',
            background: P.surface, color: P.text, border: `1px solid ${P.borderStrong}`,
            borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 12.5, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11H1l8-8 8 8h-8z" transform="rotate(180 9 7.5)"/><path d="M9 11v10"/></svg>
            인터뷰로 돌아가기
          </button>
        </div>

        {/* MAIN — Document content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: P.bg }}>

          {/* Top action bar */}
          <div style={{ padding: '14px 32px', borderBottom: `1px solid ${P.border}`, background: P.surface, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div>
              <div style={{ fontSize: 10.5, color: P.textSubtle, fontFamily: MONO, letterSpacing: 0.4 }}>DOCUMENT PREVIEW</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: P.text, marginTop: 2 }}>킥오프 문서 미리보기</div>
            </div>
            <div style={{ flex: 1 }}/>
            <span style={{ fontSize: 11.5, color: P.textSubtle, display: 'flex', alignItems: 'center', gap: 5, fontFamily: MONO }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: P.green }}/>
              실시간 업데이트
            </span>
            <Btn kind="secondary" size="sm" icon={I.download}>Markdown</Btn>
            <Btn kind="secondary" size="sm" icon={I.download}>PDF</Btn>
            <Btn kind="primary" size="sm">공유</Btn>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
            <div style={{ maxWidth: 840, margin: '0 auto', padding: '40px 48px 60px' }}>

              {/* Document header */}
              <div style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: P.textSubtle, fontFamily: MONO, marginBottom: 12, letterSpacing: 0.4 }}>
                  <span>KICKOFF DOCUMENT</span>
                  <span>·</span>
                  <span>v0.7 DRAFT</span>
                  <span>·</span>
                  <span>2026-05-21</span>
                </div>
                <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.7, margin: 0, color: P.text, lineHeight: 1.2 }}>
                  사내 도서 추천 봇
                </h1>
                <p style={{ fontSize: 15, color: P.textMuted, lineHeight: 1.65, marginTop: 12, marginBottom: 0 }}>
                  사내 직원이 매주 한 권의 책을 Slack DM으로 추천받아, 부서별 인기 도서 기반 큐레이션으로 독서 습관을 만든다.
                </p>
                <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
                  <Tag tone="accent">AI/ML</Tag>
                  <Tag tone="green">기획 완료</Tag>
                  <Tag>~150명 대상</Tag>
                </div>
              </div>

              {/* Section 1: Profile (complete) */}
              <DocSection num="01" title="프로젝트 프로필" status="complete">
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: 10, columnGap: 16, fontSize: 13.5 }}>
                  {[
                    ['유형', 'AI/ML · 도서 추천'],
                    ['주요 사용자', '사내 직원 약 150명'],
                    ['핵심 가치', '독서 습관화, 부서 맞춤, Slack 친화적'],
                    ['소유자', '서지원'],
                    ['언어', '한국어'],
                  ].map(([k, v]) => (
                    <React.Fragment key={k}>
                      <span style={{ color: P.textMuted, fontWeight: 500 }}>{k}</span>
                      <span style={{ color: P.text }}>{v}</span>
                    </React.Fragment>
                  ))}
                </div>
              </DocSection>

              {/* Section 2: Features (complete) */}
              <DocSection num="02" title="기능 정의" status="complete">
                <div style={{ fontSize: 12, fontWeight: 600, color: P.textMuted, marginBottom: 10, letterSpacing: 0.3 }}>할 수 있는 일</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    '매주 정해진 요일에 Slack DM으로 추천 책을 받는다',
                    '받은 추천 책에 "관심 있어요 / 별로예요" 피드백을 남긴다',
                    '관리자가 부서별 인기 도서 큐레이션 규칙을 편집한다',
                  ].map((t, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13.5, color: P.text, lineHeight: 1.55 }}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', background: P.greenSoft, color: P.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11"/></svg>
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>

                <div style={{ fontSize: 12, fontWeight: 600, color: P.textMuted, marginBottom: 10, marginTop: 22, letterSpacing: 0.3 }}>품질 기준 (NFR)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    ['응답 속도', '2초 이내'],
                    ['동시 사용자', '50명까지'],
                    ['모바일 대응', 'Slack 기본 UI'],
                    ['데이터 보안', 'PII 마스킹'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ padding: '10px 12px', background: P.surfaceAlt, borderRadius: 7, fontSize: 12.5 }}>
                      <span style={{ color: P.textMuted }}>{k} · </span>
                      <span style={{ color: P.text, fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </DocSection>

              {/* Section 3: Architecture (complete) */}
              <DocSection num="03" title="시스템 구조" status="complete">
                <div style={{ background: P.surfaceAlt, borderRadius: 10, padding: '20px 22px', marginBottom: 14 }}>
                  <svg viewBox="0 0 600 160" width="100%" style={{ display: 'block' }}>
                    <defs>
                      <marker id="docArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M0 0 L10 5 L0 10 z" fill={P.borderStrong}/>
                      </marker>
                    </defs>
                    <g transform="translate(20 60)">
                      <rect width="100" height="44" rx="8" fill={P.surface} stroke={P.borderStrong}/>
                      <text x="50" y="20" fontSize="11" fontWeight="600" textAnchor="middle" fill={P.text} fontFamily={FONT}>사용자</text>
                      <text x="50" y="34" fontSize="9" textAnchor="middle" fill={P.textMuted} fontFamily={FONT}>Slack</text>
                    </g>
                    <g transform="translate(170 20)">
                      <rect width="120" height="44" rx="8" fill={P.accentSoft} stroke={P.accent}/>
                      <text x="60" y="20" fontSize="11" fontWeight="700" textAnchor="middle" fill={P.accentDeep} fontFamily={FONT}>화면 (React)</text>
                      <text x="60" y="34" fontSize="9" textAnchor="middle" fill={P.accent} fontFamily={MONO}>Vite</text>
                    </g>
                    <g transform="translate(170 100)">
                      <rect width="120" height="44" rx="8" fill={P.accentSoft} stroke={P.accent}/>
                      <text x="60" y="20" fontSize="11" fontWeight="700" textAnchor="middle" fill={P.accentDeep} fontFamily={FONT}>서버 (FastAPI)</text>
                      <text x="60" y="34" fontSize="9" textAnchor="middle" fill={P.accent} fontFamily={MONO}>Python</text>
                    </g>
                    <g transform="translate(340 20)">
                      <rect width="120" height="44" rx="8" fill={P.amberSoft} stroke={P.amber}/>
                      <text x="60" y="20" fontSize="11" fontWeight="700" textAnchor="middle" fill={TONE_FG.amber} fontFamily={FONT}>AI (Claude)</text>
                      <text x="60" y="34" fontSize="9" textAnchor="middle" fill={P.amber} fontFamily={MONO}>Anthropic</text>
                    </g>
                    <g transform="translate(340 100)">
                      <rect width="120" height="44" rx="8" fill={P.greenSoft} stroke={P.green}/>
                      <text x="60" y="20" fontSize="11" fontWeight="700" textAnchor="middle" fill={TONE_FG.green} fontFamily={FONT}>데이터 (Supabase)</text>
                      <text x="60" y="34" fontSize="9" textAnchor="middle" fill={P.green} fontFamily={MONO}>PostgreSQL</text>
                    </g>
                    <g transform="translate(510 60)">
                      <rect width="80" height="44" rx="8" fill={P.surface} stroke={P.borderStrong}/>
                      <text x="40" y="20" fontSize="11" fontWeight="600" textAnchor="middle" fill={P.text} fontFamily={FONT}>Slack API</text>
                      <text x="40" y="34" fontSize="9" textAnchor="middle" fill={P.textMuted} fontFamily={FONT}>DM 발송</text>
                    </g>
                    <path d="M120 82 L170 42" stroke={P.borderStrong} strokeWidth="1.5" fill="none" markerEnd="url(#docArr)"/>
                    <path d="M120 82 L170 122" stroke={P.borderStrong} strokeWidth="1.5" fill="none" markerEnd="url(#docArr)"/>
                    <path d="M290 42 L340 42" stroke={P.borderStrong} strokeWidth="1.5" fill="none" markerEnd="url(#docArr)"/>
                    <path d="M290 122 L340 122" stroke={P.borderStrong} strokeWidth="1.5" fill="none" markerEnd="url(#docArr)"/>
                    <path d="M230 64 L230 100" stroke={P.borderStrong} strokeWidth="1.5" fill="none" markerEnd="url(#docArr)"/>
                    <path d="M460 122 L510 82" stroke={P.borderStrong} strokeWidth="1.5" fill="none" markerEnd="url(#docArr)"/>
                  </svg>
                </div>
                <p style={{ fontSize: 13, color: P.textMuted, lineHeight: 1.65, margin: 0 }}>
                  사용자는 Slack DM에서만 상호작용합니다. React 관리자 화면은 큐레이션 규칙 편집용. Claude API가 추천 책 선택을 담당하고, 데이터는 Supabase의 RLS로 격리됩니다.
                </p>
              </DocSection>

              {/* Section 4: Data model (in-progress) */}
              <DocSection num="04" title="데이터 구조" status="in-progress">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
                  {[
                    { icon: '👤', name: '사용자', fields: 5, ready: true },
                    { icon: '📚', name: '책', fields: 5, ready: true },
                    { icon: '✉️', name: '추천 기록', fields: 5, ready: false },
                  ].map(t => (
                    <div key={t.name} style={{ padding: '12px 14px', background: P.surface, border: `1px solid ${t.ready ? P.border : P.accent}`, borderRadius: 9 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                        <span style={{ fontSize: 16 }}>{t.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: P.text, flex: 1 }}>{t.name}</span>
                        {!t.ready && <span style={{ width: 6, height: 6, borderRadius: '50%', background: P.accent }}/>}
                      </div>
                      <div style={{ fontSize: 11, color: P.textMuted, fontFamily: MONO }}>
                        {t.fields}개 항목 {t.ready ? '· 정의됨' : '· 작성 중'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* In-progress hint */}
                <div style={{ padding: '12px 14px', background: P.accentSoft, borderRadius: 9, border: `1px solid ${P.accent}25`, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: `2px solid ${P.accent}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}/>
                  <span style={{ fontSize: 12.5, color: P.accentDeep, flex: 1 }}>
                    <strong>추천 기록 테이블</strong>의 정합성 규칙을 정의하는 중이에요
                  </span>
                  <button style={{
                    padding: '6px 11px', fontSize: 11.5, fontWeight: 600,
                    background: P.accent, color: '#fff', border: 'none',
                    borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
                  }}>이어 작성</button>
                </div>
              </DocSection>

              {/* Section 5: AI Workflow (empty) */}
              <DocSection num="05" title="AI 흐름" status="empty">
                <div style={{
                  padding: '28px 24px', textAlign: 'center', background: P.surface,
                  border: `1px dashed ${P.borderStrong}`, borderRadius: 10,
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: P.surfaceAlt, color: P.textSubtle, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: P.text, marginBottom: 4 }}>아직 작성되지 않았어요</div>
                  <div style={{ fontSize: 12, color: P.textMuted, marginBottom: 14, lineHeight: 1.55 }}>
                    AI 입출력, 프롬프트, 폴백 전략을 설계하면 여기에 채워집니다
                  </div>
                  <button style={{
                    padding: '8px 14px', fontSize: 12.5, fontWeight: 600,
                    background: P.accent, color: '#fff', border: 'none',
                    borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}>
                    이 섹션 시작하기
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </DocSection>

              {/* Section 6: Evaluation (complete) */}
              <DocSection num="06" title="정직한 평가" status="complete">
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 18px', background: P.surfaceAlt, borderRadius: 10, marginBottom: 14 }}>
                  <div style={{ textAlign: 'center', paddingRight: 20, borderRight: `1px solid ${P.border}` }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: P.accent, letterSpacing: -1, lineHeight: 1, fontFamily: MONO }}>3.9</div>
                    <div style={{ fontSize: 10.5, color: P.textSubtle, marginTop: 3, fontFamily: MONO }}>/ 5.0</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: P.text, marginBottom: 3 }}>실행 준비 단계 · 보강 권장</div>
                    <div style={{ fontSize: 11.5, color: P.textMuted, lineHeight: 1.55 }}>
                      범위와 가치는 명확. 운영 부담과 데이터 가용성에서 보강 필요.
                    </div>
                  </div>
                  <Tag tone="amber">RFC 권장</Tag>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {[
                    ['범위 명확성', 4.5, P.green],
                    ['기술 실현성', 4.0, P.green],
                    ['데이터 가용성', 3.5, P.accent],
                    ['사용자 가치', 4.5, P.green],
                    ['운영 부담', 3.0, P.amber],
                  ].map(([k, v, c]) => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12.5 }}>
                      <span style={{ width: 100, color: P.text }}>{k}</span>
                      <div style={{ flex: 1, height: 5, background: P.surfaceAlt, borderRadius: 5 }}>
                        <div style={{ width: `${(v / 5) * 100}%`, height: '100%', background: c, borderRadius: 5 }}/>
                      </div>
                      <span style={{ width: 28, textAlign: 'right', fontFamily: MONO, fontWeight: 700, color: c }}>{v}</span>
                    </div>
                  ))}
                </div>
              </DocSection>

              {/* Section 7: DoD (complete) */}
              <DocSection num="07" title="완료 조건" status="complete">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  {[
                    ['MVP-1', '2026-06-30', '35%', P.accent],
                    ['MVP-2', '2026-08-31', '0%', P.borderStrong],
                  ].map(([n, d, p, c]) => (
                    <div key={n} style={{ padding: '12px 14px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 9 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: P.text }}>{n}</span>
                        <span style={{ fontSize: 10.5, color: P.textSubtle, fontFamily: MONO }}>{d}</span>
                        <span style={{ flex: 1 }}/>
                        <span style={{ fontSize: 11.5, color: c, fontWeight: 600, fontFamily: MONO }}>{p}</span>
                      </div>
                      <div style={{ height: 4, background: P.surfaceAlt, borderRadius: 4 }}>
                        <div style={{ width: p, height: '100%', background: c, borderRadius: 4 }}/>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: P.textMuted, marginBottom: 8 }}>핵심 지표 (KPI)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                  {[
                    ['WAU ≥ 60%', '주간 활성 사용자'],
                    ['CTR ≥ 25%', '추천 클릭률'],
                    ['긍정 피드백 ≥ 70%', '읽음 + 관심'],
                    ['p95 < 2s', '카드 생성 응답'],
                  ].map(([v, k]) => (
                    <div key={k} style={{ padding: '8px 11px', background: P.surfaceAlt, borderRadius: 7, fontSize: 12 }}>
                      <span style={{ color: P.accent, fontWeight: 600 }}>{v}</span>
                      <span style={{ color: P.textSubtle, marginLeft: 6 }}>· {k}</span>
                    </div>
                  ))}
                </div>
              </DocSection>

              {/* Footer */}
              <div style={{
                marginTop: 36, paddingTop: 24, borderTop: `1px solid ${P.border}`,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ fontSize: 11, color: P.textSubtle, fontFamily: MONO }}>
                  Last updated · 2분 전
                </div>
                <div style={{ flex: 1 }}/>
                <span style={{ fontSize: 11.5, color: P.textMuted }}>이 문서가 마음에 드시나요?</span>
                <Btn kind="secondary" size="sm">피드백 보내기</Btn>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Frame>
  );
}

// Section wrapper with status badge
function DocSection({ num, title, status, children }) {
  const sm = {
    complete: { color: P.green, label: '완료', soft: P.greenSoft, fg: TONE_FG.green },
    'in-progress': { color: P.accent, label: '작성 중', soft: P.accentSoft, fg: P.accentDeep },
    empty: { color: P.textSubtle, label: '미작성', soft: P.surfaceAlt, fg: P.textSubtle },
  }[status];

  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${P.border}` }}>
        <span style={{ fontSize: 12, fontFamily: MONO, color: P.textSubtle, fontWeight: 700, letterSpacing: 0.4 }}>{num}</span>
        <h2 style={{ fontSize: 19, fontWeight: 700, letterSpacing: -0.3, margin: 0, color: status === 'empty' ? P.textMuted : P.text }}>
          {title}
        </h2>
        <div style={{ flex: 1 }}/>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 9px', fontSize: 11, fontWeight: 600,
          color: sm.fg, background: sm.soft, borderRadius: 5,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: sm.color }}/>
          {sm.label}
        </span>
      </div>
      {children}
    </section>
  );
}

window.ScreenDocumentPreview = ScreenDocumentPreview;
