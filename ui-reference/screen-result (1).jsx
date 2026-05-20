// Screen 5: Result viewer — kickoff document
// Shared shell + per-section body. Active section is highlighted in TOC.

const RESULT_SECTIONS = [
  { id: 1, label: '프로필', title: '프로젝트 프로필' },
  { id: 2, label: '아키텍처', title: '시스템 아키텍처' },
  { id: 3, label: '데이터', title: '데이터 구조' },
  { id: 4, label: '엣지케이스', title: '실패 시나리오' },
  { id: 5, label: '평가', title: '정직한 평가' },
  { id: 6, label: '완료조건', title: '완료 조건' },
];

function ResultShell({ active = 2, children, summary = '' }) {
  return (
    <Frame page="내 프로젝트">
      <div style={{ height: '100%', display: 'flex' }}>
        {/* TOC */}
        <div style={{ width: 240, borderRight: `1px solid ${P.border}`, background: P.surface, padding: '28px 18px', flexShrink: 0 }}>
          <div style={{ fontSize: 11.5, color: P.textSubtle, fontFamily: MONO, marginBottom: 12, padding: '0 8px' }}>섹션</div>
          {RESULT_SECTIONS.map((s) => {
            const on = s.id === active;
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 8px', borderRadius: 6, fontSize: 13, background: on ? P.accentSoft : 'transparent', color: on ? P.accentDeep : P.textMuted, fontWeight: on ? 600 : 500, marginBottom: 2 }}>
                <span style={{ width: 18, fontSize: 11, color: on ? P.accent : P.textSubtle, fontFamily: MONO }}>{String(s.id).padStart(2, '0')}</span>
                <span>{s.title}</span>
              </div>
            );
          })}

          <div style={{ marginTop: 28, padding: '12px 14px', background: P.surfaceAlt, borderRadius: 10 }}>
            <div style={{ fontSize: 11.5, color: P.textSubtle, fontFamily: MONO, marginBottom: 4 }}>FINAL</div>
            <div style={{ fontSize: 12.5, color: P.text, lineHeight: 1.55, fontWeight: 500 }}>킥오프 완료</div>
            <div style={{ fontSize: 11.5, color: P.textMuted, marginTop: 4 }}>2026-05-17 · 12분 소요</div>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
          {/* Header */}
          <div style={{ padding: '32px 48px 24px', background: P.surface, borderBottom: `1px solid ${P.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: P.textSubtle, marginBottom: 10 }}>
              <span>내 프로젝트</span><span>›</span><span style={{ color: P.text }}>사내 도서 추천 봇</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: -0.4 }}>사내 도서 추천 봇</h1>
                <div style={{ display: 'flex', gap: 6, marginTop: 12, alignItems: 'center' }}>
                  <Tag tone="accent">AI/ML</Tag>
                  <Tag tone="green"><span style={{ width: 5, height: 5, borderRadius: '50%', background: P.green }}/>완료</Tag>
                  <Tag>KO</Tag>
                  <span style={{ fontSize: 12, color: P.textSubtle, fontFamily: MONO, marginLeft: 8 }}>생성일 2026-05-17</span>
                </div>
              </div>
              <Btn kind="secondary" size="md" icon={I.download}>Markdown</Btn>
              <Btn kind="secondary" size="md" icon={I.download}>PDF</Btn>
              <Btn kind="primary" size="md">공유</Btn>
            </div>
          </div>

          {/* Section body */}
          <div style={{ padding: '32px 48px 56px' }}>
            <div style={{ fontSize: 11, color: P.textSubtle, fontFamily: MONO, marginBottom: 8 }}>SECTION {String(active).padStart(2, '0')}</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: -0.3 }}>{RESULT_SECTIONS[active - 1].title}</h2>
            {summary && (
              <p style={{ fontSize: 13.5, color: P.textMuted, marginTop: 8, marginBottom: 0, maxWidth: 660, lineHeight: 1.6 }}>{summary}</p>
            )}
            <div style={{ marginTop: 24 }}>{children}</div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

// shared card primitive
function Card({ title, tags = [], action = null, children, style = {} }) {
  return (
    <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 14, marginBottom: 16, ...style }}>
      {(title || action) && (
        <div style={{ padding: '16px 22px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          {title && <span style={{ fontSize: 12.5, fontWeight: 600, color: P.text }}>{title}</span>}
          {tags.map((t, i) => (
            <Tag key={i} tone={t.tone || 'neutral'}>{t.label || t}</Tag>
          ))}
          <div style={{ flex: 1 }}/>
          {action}
        </div>
      )}
      <div style={{ borderTop: title ? `1px solid ${P.border}` : 'none' }}>{children}</div>
    </div>
  );
}

// ============================================================
// 01 · 프로젝트 프로필
// ============================================================
function ScreenResultProfile() {
  return (
    <ResultShell active={1} summary="인터뷰에서 추출한 프로젝트 핵심 정의. 모든 후속 섹션의 기준점이 됩니다.">
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        {/* One-liner */}
        <Card title="한 줄 정의" tags={[{ label: '인터뷰 추출', tone: 'accent' }]}>
          <div style={{ padding: '22px 24px' }}>
            <div style={{ fontSize: 19, fontWeight: 600, color: P.text, lineHeight: 1.5, letterSpacing: -0.2 }}>
              "사내 직원이 매주 한 권의 책을 Slack DM으로 추천받아, 부서별 인기 도서 기반 큐레이션으로 독서 습관을 만든다."
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 28, fontSize: 12.5 }}>
              {[['유형', 'AI/ML'], ['단계', '기획 → MVP'], ['예상 사용자', '~150명']].map(([l, v]) => (
                <div key={l}>
                  <div style={{ color: P.textSubtle, fontFamily: MONO, fontSize: 11 }}>{l}</div>
                  <div style={{ color: P.text, fontWeight: 600, marginTop: 3 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Metadata */}
        <Card title="메타데이터">
          <div style={{ padding: '4px 0' }}>
            {[
              ['소유자', '서지원'],
              ['생성 일시', '2026-05-17 14:22'],
              ['인터뷰 시간', '12분 04초'],
              ['질문 수', '12개 답변'],
              ['언어', '한국어'],
              ['모델', 'Claude Sonnet 4.5'],
            ].map(([k, v], i) => (
              <div key={k} style={{ display: 'flex', padding: '10px 22px', fontSize: 13, borderTop: i === 0 ? 'none' : `1px solid ${P.border}` }}>
                <span style={{ color: P.textMuted, width: 100, flexShrink: 0 }}>{k}</span>
                <span style={{ color: P.text, fontWeight: 500, fontFamily: k === '생성 일시' || k === '인터뷰 시간' ? MONO : FONT, fontSize: 12.5 }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Target users */}
      <Card title="대상 사용자" tags={[{ label: '2 페르소나', tone: 'neutral' }]}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {[
            { name: '김민지', role: '마케팅팀 사원 (2년차)', goal: '업무에 도움 되는 신간을 빠르게 발견하고 싶음', pain: '관심 주제는 있지만 어디서 시작할지 모름', usage: '주 1회 Slack 알림 → 클릭 → 사내 도서관 예약' },
            { name: '이도현', role: '개발팀 시니어', goal: '팀원에게 추천할 책 선정에 시간 단축', pain: '리뷰 사이트마다 의견이 다르고 사내 맥락 부족', usage: '월 2~3회, 팀 리더십 책 위주' },
          ].map((p, i) => (
            <div key={i} style={{ padding: '20px 24px', borderLeft: i === 1 ? `1px solid ${P.border}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: i === 0 ? P.accentSoft : P.amberSoft, color: i === 0 ? P.accent : '#7e5a23', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>{p.name[0]}</div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: P.textMuted, marginTop: 2 }}>{p.role}</div>
                </div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[['목표', p.goal], ['페인포인트', p.pain], ['사용 시나리오', p.usage]].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 10.5, fontFamily: MONO, color: P.textSubtle, letterSpacing: 0.4 }}>{l.toUpperCase()}</div>
                    <div style={{ fontSize: 13, color: P.text, lineHeight: 1.55, marginTop: 3 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Core values & non-goals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title="핵심 가치" tags={[{ label: '3가지', tone: 'green' }]}>
          <div style={{ padding: '8px 22px 18px' }}>
            {[
              ['독서 습관화', '매주 정기 알림으로 자연스러운 루틴을 만든다'],
              ['부서 맞춤', '소속 부서의 인기 도서를 우선 노출한다'],
              ['Slack 친화적', '별도 앱 설치 없이 기존 워크플로우에 통합'],
            ].map(([t, d], i) => (
              <div key={t} style={{ display: 'flex', gap: 14, padding: '12px 0', borderTop: i === 0 ? 'none' : `1px solid ${P.border}` }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: P.greenSoft, color: P.green, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, flexShrink: 0 }}>0{i + 1}</div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t}</div>
                  <div style={{ fontSize: 12.5, color: P.textMuted, marginTop: 3, lineHeight: 1.55 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="이번 단계에서 하지 않는 것" tags={[{ label: 'Non-goals', tone: 'red' }]}>
          <div style={{ padding: '8px 22px 18px' }}>
            {[
              ['외부 도서 데이터 통합', '교보문고/예스24 등 외부 API'],
              ['개인 독서 이력 기반 추천', '협업 필터링 / 임베딩'],
              ['웹 대시보드 UI', 'Slack DM에 집중'],
              ['다국어 지원', '한국어 우선'],
            ].map(([t, d], i) => (
              <div key={t} style={{ display: 'flex', gap: 14, padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${P.border}`, alignItems: 'center' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${P.redSoft}`, color: P.red, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{t}</span>
                  <span style={{ fontSize: 11.5, color: P.textSubtle, marginLeft: 8, fontFamily: MONO }}>{d}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ResultShell>
  );
}

// ============================================================
// 02 · 아키텍처
// ============================================================
function ScreenResultArchitecture() {
  return (
    <ResultShell active={2} summary="React SPA + FastAPI 백엔드 + Supabase 인증/DB. Claude API가 인터뷰와 추천 로직을 수행합니다.">
      <Card title="전체 흐름" tags={['Mermaid']} action={<span style={{ fontSize: 11.5, color: P.textSubtle, cursor: 'pointer' }}>코드 보기</span>}>
        <div style={{ padding: '22px 26px 26px' }}>
          <svg viewBox="0 0 720 280" width="100%" style={{ display: 'block' }}>
            <g transform="translate(40 110)">
              <rect width="120" height="60" rx="10" fill={P.surfaceAlt} stroke={P.borderStrong}/>
              <text x="60" y="28" fontSize="12" fontWeight="600" textAnchor="middle" fill={P.text}>사용자</text>
              <text x="60" y="44" fontSize="10" textAnchor="middle" fill={P.textMuted}>브라우저</text>
            </g>
            <g transform="translate(220 50)">
              <rect width="140" height="60" rx="10" fill={P.accentSoft} stroke={P.accent}/>
              <text x="70" y="28" fontSize="12" fontWeight="600" textAnchor="middle" fill={P.accentDeep}>React SPA</text>
              <text x="70" y="44" fontSize="10" textAnchor="middle" fill={P.accentDeep}>Vite · Tailwind</text>
            </g>
            <g transform="translate(220 170)">
              <rect width="140" height="60" rx="10" fill={P.accentSoft} stroke={P.accent}/>
              <text x="70" y="28" fontSize="12" fontWeight="600" textAnchor="middle" fill={P.accentDeep}>FastAPI</text>
              <text x="70" y="44" fontSize="10" textAnchor="middle" fill={P.accentDeep}>prompt_manager</text>
            </g>
            <g transform="translate(420 50)">
              <rect width="120" height="60" rx="10" fill={P.amberSoft} stroke={P.amber}/>
              <text x="60" y="28" fontSize="12" fontWeight="600" textAnchor="middle" fill="#7e5a23">Claude API</text>
              <text x="60" y="44" fontSize="10" textAnchor="middle" fill="#7e5a23">Anthropic</text>
            </g>
            <g transform="translate(420 170)">
              <rect width="120" height="60" rx="10" fill={P.greenSoft} stroke={P.green}/>
              <text x="60" y="28" fontSize="12" fontWeight="600" textAnchor="middle" fill="#2f5a44">Supabase</text>
              <text x="60" y="44" fontSize="10" textAnchor="middle" fill="#2f5a44">PG · Auth · RLS</text>
            </g>
            <g transform="translate(600 110)">
              <rect width="100" height="60" rx="10" fill={P.surfaceAlt} stroke={P.borderStrong} strokeDasharray="4 3"/>
              <text x="50" y="28" fontSize="12" fontWeight="600" textAnchor="middle" fill={P.text}>Toss</text>
              <text x="50" y="44" fontSize="10" textAnchor="middle" fill={P.textMuted}>MVP-2</text>
            </g>
            {['M160 130 L220 80', 'M160 150 L220 200', 'M360 80 L420 80', 'M360 200 L420 200', 'M290 110 L290 170', 'M540 200 L600 150'].map((d, i) => (
              <path key={i} d={d} stroke={P.borderStrong} strokeWidth="1.5" fill="none" markerEnd="url(#arr)"/>
            ))}
            <defs>
              <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill={P.borderStrong}/>
              </marker>
            </defs>
          </svg>
        </div>
      </Card>

      <Card title="컴포넌트" tags={[{ label: '5개 핵심', tone: 'accent' }]}>
        {[
          ['채팅 UI', 'React + TailwindCSS', '인터뷰 질문/답변 진행'],
          ['결과 뷰어', 'React + Mermaid.js', '킥오프 문서 카드 표시'],
          ['인터뷰 오케스트레이터', 'FastAPI', '스킬 순서 제어, 세션 관리'],
          ['프롬프트 매니저', 'Python (~60줄)', 'STEP 분할 · CLI 제거 · 캐싱'],
          ['문서 생성 엔진', 'Python', '인터뷰 → Markdown'],
        ].map(([name, tech, role], i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.4fr 2fr', padding: '12px 22px', borderTop: i === 0 ? 'none' : `1px solid ${P.border}`, fontSize: 13, alignItems: 'center' }}>
            <div style={{ fontWeight: 600, color: P.text }}>{name}</div>
            <div style={{ fontFamily: MONO, fontSize: 11.5, color: P.textMuted }}>{tech}</div>
            <div style={{ color: P.textMuted, fontSize: 12.5 }}>{role}</div>
          </div>
        ))}
      </Card>

      <div style={{ fontSize: 11, color: P.textSubtle, fontFamily: MONO, marginTop: 8, marginBottom: 10 }}>ARCHITECTURE DECISIONS</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          ['ADR-001', 'SPA + REST API 패턴', '채택'],
          ['ADR-002', 'Supabase 올인원', '채택'],
          ['ADR-006', '프롬프트 재사용 하이브리드', '채택'],
        ].map(([id, title, s], i) => (
          <div key={i} style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontFamily: MONO, color: P.textSubtle }}>{id}</span>
              <Tag tone="green">{s}</Tag>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 6, lineHeight: 1.4 }}>{title}</div>
          </div>
        ))}
      </div>
    </ResultShell>
  );
}

// ============================================================
// 03 · 데이터
// ============================================================
function ScreenResultData() {
  return (
    <ResultShell active={3} summary="저장할 데이터, 출처, 보존 정책을 한눈에. RLS로 사용자별 격리됩니다.">
      <Card title="데이터 엔티티" tags={[{ label: 'ER', tone: 'accent' }]} action={<span style={{ fontSize: 11.5, color: P.textSubtle, cursor: 'pointer' }}>SQL 보기</span>}>
        <div style={{ padding: '22px 26px' }}>
          <svg viewBox="0 0 720 240" width="100%" style={{ display: 'block' }}>
            {/* users */}
            <g transform="translate(30 20)">
              <rect width="180" height="120" rx="10" fill={P.surface} stroke={P.accent} strokeWidth="1.5"/>
              <rect width="180" height="26" rx="10" fill={P.accentSoft}/>
              <rect y="16" width="180" height="10" fill={P.accentSoft}/>
              <text x="14" y="18" fontSize="12" fontWeight="700" fill={P.accentDeep}>users</text>
              <text x="170" y="18" fontSize="9" fontFamily={MONO} fill={P.accent} textAnchor="end">PK</text>
              {[['id', 'uuid'], ['email', 'text'], ['plan', 'enum'], ['department', 'text'], ['created_at', 'ts']].map(([n, t], i) => (
                <g key={n}>
                  <text x="14" y={44 + i * 16} fontSize="11" fontFamily={MONO} fill={P.text}>{n}</text>
                  <text x="166" y={44 + i * 16} fontSize="10" fontFamily={MONO} fill={P.textSubtle} textAnchor="end">{t}</text>
                </g>
              ))}
            </g>
            {/* sessions */}
            <g transform="translate(270 20)">
              <rect width="180" height="160" rx="10" fill={P.surface} stroke={P.amber} strokeWidth="1.5"/>
              <rect width="180" height="26" rx="10" fill={P.amberSoft}/>
              <rect y="16" width="180" height="10" fill={P.amberSoft}/>
              <text x="14" y="18" fontSize="12" fontWeight="700" fill="#7e5a23">interview_sessions</text>
              <text x="170" y="18" fontSize="9" fontFamily={MONO} fill={P.amber} textAnchor="end">PK</text>
              {[['id', 'uuid'], ['user_id', 'fk'], ['project_type', 'enum'], ['status', 'enum'], ['answers', 'jsonb'], ['step', 'int'], ['updated_at', 'ts']].map(([n, t], i) => (
                <g key={n}>
                  <text x="14" y={44 + i * 16} fontSize="11" fontFamily={MONO} fill={P.text}>{n}</text>
                  <text x="166" y={44 + i * 16} fontSize="10" fontFamily={MONO} fill={P.textSubtle} textAnchor="end">{t}</text>
                </g>
              ))}
            </g>
            {/* documents */}
            <g transform="translate(510 20)">
              <rect width="180" height="140" rx="10" fill={P.surface} stroke={P.green} strokeWidth="1.5"/>
              <rect width="180" height="26" rx="10" fill={P.greenSoft}/>
              <rect y="16" width="180" height="10" fill={P.greenSoft}/>
              <text x="14" y="18" fontSize="12" fontWeight="700" fill="#2f5a44">kickoff_documents</text>
              <text x="170" y="18" fontSize="9" fontFamily={MONO} fill={P.green} textAnchor="end">PK</text>
              {[['id', 'uuid'], ['session_id', 'fk'], ['markdown', 'text'], ['mermaid', 'text'], ['version', 'int'], ['created_at', 'ts']].map(([n, t], i) => (
                <g key={n}>
                  <text x="14" y={44 + i * 16} fontSize="11" fontFamily={MONO} fill={P.text}>{n}</text>
                  <text x="166" y={44 + i * 16} fontSize="10" fontFamily={MONO} fill={P.textSubtle} textAnchor="end">{t}</text>
                </g>
              ))}
            </g>
            {/* relations */}
            <path d="M210 70 L270 70" stroke={P.borderStrong} strokeWidth="1.5" fill="none" markerEnd="url(#arr3)"/>
            <text x="240" y="65" fontSize="10" textAnchor="middle" fill={P.textMuted} fontFamily={MONO}>1:N</text>
            <path d="M450 90 L510 80" stroke={P.borderStrong} strokeWidth="1.5" fill="none" markerEnd="url(#arr3)"/>
            <text x="480" y="78" fontSize="10" textAnchor="middle" fill={P.textMuted} fontFamily={MONO}>1:N</text>
            <defs>
              <marker id="arr3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill={P.borderStrong}/>
              </marker>
            </defs>
          </svg>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        <Card title="데이터 출처">
          {[
            ['사내 도서 DB', '내부 PostgreSQL', '실시간 SELECT', P.green],
            ['부서별 대출 이력', '내부 (월 1회 ETL)', '집계 후 캐싱', P.green],
            ['Slack 사용자 메타', 'Slack Workspace API', 'OAuth 후 1회 동기화', P.accent],
            ['외부 도서 메타', '제외 (Non-goal)', '—', P.textSubtle],
          ].map(([src, where, freq, c], i) => (
            <div key={src} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 1fr', padding: '12px 22px', borderTop: i === 0 ? 'none' : `1px solid ${P.border}`, fontSize: 12.5, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: c }}/>
                <span style={{ fontWeight: 600, color: P.text }}>{src}</span>
              </div>
              <div style={{ color: P.textMuted, fontFamily: MONO, fontSize: 11.5 }}>{where}</div>
              <div style={{ color: P.textSubtle, fontSize: 11.5 }}>{freq}</div>
            </div>
          ))}
        </Card>

        <Card title="보존 & 보안">
          <div style={{ padding: '4px 0' }}>
            {[
              ['세션 자동 저장', '5초 간격 · 30일 보관'],
              ['완료 문서', '영구 (사용자 삭제 전까지)'],
              ['답변 원문', '암호화 (AES-256-GCM)'],
              ['RLS 정책', 'user_id = auth.uid()'],
              ['PII 마스킹', '이메일·이름만 저장'],
              ['삭제 요청', '7일 내 cascade'],
            ].map(([k, v], i) => (
              <div key={k} style={{ display: 'flex', padding: '9px 22px', fontSize: 12.5, borderTop: i === 0 ? 'none' : `1px solid ${P.border}`, alignItems: 'center' }}>
                <span style={{ color: P.textMuted, flex: 1 }}>{k}</span>
                <span style={{ color: P.text, fontWeight: 500, fontFamily: k === 'RLS 정책' ? MONO : FONT, fontSize: k === 'RLS 정책' ? 11.5 : 12.5 }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ResultShell>
  );
}

// ============================================================
// 04 · 엣지케이스 (실패 시나리오)
// ============================================================
function ScreenResultEdgeCases() {
  const cases = [
    { id: 'E-01', sev: 'high', title: 'Claude API 응답 시간 초과 (>30s)', trigger: '인터뷰 1회당 약 0.5% 발생 예상', impact: '사용자가 무한 로딩 인지, 이탈 가능', mitigation: '30초 타임아웃 후 재시도 1회. 실패 시 "잠시 후 다시"로 안내하며 답변은 자동 저장 유지.' },
    { id: 'E-02', sev: 'high', title: '사용자가 중간에 브라우저 종료', trigger: '인터뷰 시간이 평균 12분으로 김', impact: '진행 상태 유실 시 처음부터 다시', mitigation: '답변 전송마다 즉시 저장. 재진입 시 마지막 step부터 자동 복구.' },
    { id: 'E-03', sev: 'med', title: '무료 2회 초과 후 추가 시도', trigger: '베타 기간 중 가장 흔한 시나리오', impact: '시작 버튼이 비활성되어 혼란', mitigation: '버튼 옆에 잔여 카운터 노출. 0회 도달 시 유료 전환 안내 모달.' },
    { id: 'E-04', sev: 'med', title: '답변이 한 글자 또는 "ㅇㅇ"', trigger: '귀찮은 답변자', impact: '문서 품질 저하', mitigation: 'AI가 재질문하며 추천 답변 옵션 제공. 3회 연속 짧은 답변 시 "추천해줘"로 안내.' },
    { id: 'E-05', sev: 'low', title: 'Mermaid 다이어그램 파싱 실패', trigger: '특수문자 포함 노드명', impact: '결과 페이지에서 다이어그램 영역 깨짐', mitigation: '서버에서 사전 검증 후 폴백 텍스트 표시. 사용자가 보고할 수 있는 링크 제공.' },
    { id: 'E-06', sev: 'low', title: '다국어 답변 (한영 혼용)', trigger: '기술 용어 영어, 본문 한국어', impact: '문서 톤이 들쭉날쭉', mitigation: '프로젝트 언어 설정에 맞춰 LLM 재정렬. 원본 보존 옵션 유지.' },
  ];

  return (
    <ResultShell active={4} summary="발생 가능한 실패 6가지와 완화책. 심각도(상/중/하)로 정렬됩니다.">
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {[
          ['높음', 2, P.red, P.redSoft],
          ['중간', 2, P.amber, P.amberSoft],
          ['낮음', 2, P.green, P.greenSoft],
          ['전체 완화책 매핑됨', '100%', P.accent, P.accentSoft],
        ].map(([l, v, c, bg], i) => (
          <div key={i} style={{ flex: 1, background: bg, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 11.5, color: c, fontWeight: 600 }}>{l}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c, letterSpacing: -0.5, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cases.map((c, i) => {
          const sevMap = {
            high: { tone: 'red', label: '심각도 · 높음', bar: P.red },
            med: { tone: 'amber', label: '심각도 · 중간', bar: P.amber },
            low: { tone: 'green', label: '심각도 · 낮음', bar: P.green },
          }[c.sev];
          return (
            <div key={c.id} style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: '16px 18px 18px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: sevMap.bar }}/>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontFamily: MONO, color: P.textSubtle, letterSpacing: 0.4 }}>{c.id}</span>
                <Tag tone={sevMap.tone}>{sevMap.label}</Tag>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: P.text }}>{c.title}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 18, marginTop: 12 }}>
                {[['트리거', c.trigger], ['영향', c.impact], ['완화', c.mitigation]].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 10.5, fontFamily: MONO, color: P.textSubtle, letterSpacing: 0.4 }}>{l.toUpperCase()}</div>
                    <div style={{ fontSize: 12.5, color: P.text, lineHeight: 1.55, marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ResultShell>
  );
}

// ============================================================
// 05 · 평가 (정직한 평가)
// ============================================================
function ScreenResultEvaluation() {
  const dims = [
    { label: '범위 명확성', score: 4.5, note: '대상 사용자와 Non-goal이 잘 분리되어 있음' },
    { label: '기술 실현성', score: 4.0, note: 'Slack OAuth와 사내 DB 접근 권한 사전 확인 필요' },
    { label: '데이터 가용성', score: 3.5, note: '부서별 대출 이력 보관 기간이 짧을 수 있음' },
    { label: '사용자 가치', score: 4.5, note: '독서 동기 부여 효과 측정 시 명확한 지표 필요' },
    { label: '운영 부담', score: 3.0, note: '큐레이션 룰 유지보수자가 정해지지 않음' },
  ];
  const avg = (dims.reduce((s, d) => s + d.score, 0) / dims.length).toFixed(1);

  return (
    <ResultShell active={5} summary="AI가 산출물 자체를 5가지 기준으로 자기 평가합니다. 점수가 낮은 항목엔 보강 액션이 제시됩니다.">
      {/* Overall */}
      <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 14, padding: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ textAlign: 'center', padding: '4px 24px 4px 4px', borderRight: `1px solid ${P.border}` }}>
          <div style={{ fontSize: 11, color: P.textSubtle, fontFamily: MONO, marginBottom: 4 }}>OVERALL</div>
          <div style={{ fontSize: 56, fontWeight: 700, color: P.accent, letterSpacing: -2, lineHeight: 1 }}>{avg}</div>
          <div style={{ fontSize: 11.5, color: P.textSubtle, marginTop: 2 }}>/ 5.0</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>실행 준비 단계 · 보강 권장</div>
          <p style={{ fontSize: 13, color: P.textMuted, lineHeight: 1.65, margin: 0, maxWidth: 540 }}>
            기획의 범위와 가치는 분명하지만, <strong style={{ color: P.text }}>운영 부담</strong>과 <strong style={{ color: P.text }}>데이터 가용성</strong>에서 보강이 필요합니다. 큐레이션 책임자를 먼저 정하고, 대출 이력 보관 정책을 확인하세요.
          </p>
        </div>
        <div>
          <Tag tone="amber">RFC 권장</Tag>
        </div>
      </div>

      {/* Dimension bars */}
      <Card title="평가 항목" tags={[{ label: '5개 차원', tone: 'accent' }]}>
        {dims.map((d, i) => {
          const pct = (d.score / 5) * 100;
          const color = d.score >= 4.2 ? P.green : d.score >= 3.5 ? P.accent : P.amber;
          return (
            <div key={d.label} style={{ padding: '14px 22px', borderTop: i === 0 ? 'none' : `1px solid ${P.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 130, fontSize: 13, fontWeight: 600 }}>{d.label}</div>
                <div style={{ flex: 1, height: 8, background: P.surfaceAlt, borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 8 }}/>
                </div>
                <div style={{ width: 40, textAlign: 'right', fontSize: 14, fontWeight: 700, color: color, fontFamily: MONO }}>{d.score.toFixed(1)}</div>
              </div>
              <div style={{ fontSize: 12, color: P.textMuted, marginTop: 7, marginLeft: 144, lineHeight: 1.5 }}>{d.note}</div>
            </div>
          );
        })}
      </Card>

      {/* Strengths / Risks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title="강점" tags={[{ label: '3가지', tone: 'green' }]}>
          <div style={{ padding: '6px 22px 16px' }}>
            {[
              'Non-goal이 구체적이라 스코프 크리프 위험 낮음',
              'Slack-only 전략이 첫 출시 부담을 크게 줄여줌',
              '한 줄 정의가 명확해 팀 정렬이 빠를 것',
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 11, padding: '9px 0', borderTop: i === 0 ? 'none' : `1px solid ${P.border}`, alignItems: 'flex-start' }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: P.greenSoft, color: P.green, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>↑</span>
                <span style={{ fontSize: 13, lineHeight: 1.55 }}>{t}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="리스크 & 다음 액션" tags={[{ label: '우선순위', tone: 'red' }]}>
          <div style={{ padding: '6px 22px 16px' }}>
            {[
              { r: '큐레이션 룰 책임자 미정', a: '주차별 담당자 로테이션 또는 1명 owner 지정' },
              { r: '대출 이력 데이터 6개월치만 보관', a: '데이터 팀과 1년치 백업 정책 합의' },
              { r: 'Slack 워크스페이스 admin 권한 필요', a: '보안팀 사전 검토 티켓 발행' },
            ].map((x, i) => (
              <div key={i} style={{ padding: '11px 0', borderTop: i === 0 ? 'none' : `1px solid ${P.border}` }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: P.red, fontFamily: MONO, marginTop: 2, flexShrink: 0 }}>R{i + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{x.r}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 6, paddingLeft: 24 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: P.accent, fontFamily: MONO, marginTop: 2, flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: 12.5, color: P.textMuted, lineHeight: 1.5 }}>{x.a}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ResultShell>
  );
}

// ============================================================
// 06 · 완료조건
// ============================================================
function ScreenResultDefinitionOfDone() {
  const phases = [
    {
      name: 'MVP-1 · 동작 가능한 베타',
      target: '2026-06-30',
      status: 'in_progress',
      progress: 35,
      items: [
        { t: 'Slack DM으로 주 1회 책 카드 발송', done: true },
        { t: '부서별 인기 도서 Top 3 큐레이션', done: true },
        { t: '"읽음 / 관심 없음" 피드백 수집', done: false },
        { t: '관리자가 큐레이션 룰 편집 UI', done: false },
        { t: '내부 50명 파일럿 운영', done: false },
      ],
    },
    {
      name: 'MVP-2 · 사용 확대',
      target: '2026-08-31',
      status: 'planned',
      progress: 0,
      items: [
        { t: '개인 독서 이력 기반 가중치', done: false },
        { t: '웹 대시보드 (관리자 뷰)', done: false },
        { t: '월간 독서 리포트 자동 발송', done: false },
        { t: '전사 150명 확대 운영', done: false },
      ],
    },
  ];

  return (
    <ResultShell active={6} summary="단계별 완료 조건과 측정 지표. 합의된 기준을 충족하면 다음 단계로 진입합니다.">
      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
        {[
          ['주간 활성 사용자', 'WAU ≥ 60%', '파일럿 30명 중 18명+'],
          ['추천 클릭률', 'CTR ≥ 25%', '발송된 책 카드 기준'],
          ['긍정 피드백 비율', '≥ 70%', '"읽음" + "관심" / 전체'],
          ['응답 시간', 'p95 < 2s', '카드 생성 → 발송'],
        ].map(([k, v, d], i) => (
          <div key={k} style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11.5, color: P.textSubtle, fontFamily: MONO, marginBottom: 6 }}>KPI {String(i + 1).padStart(2, '0')}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{k}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: P.accent, marginTop: 6, letterSpacing: -0.3 }}>{v}</div>
            <div style={{ fontSize: 11.5, color: P.textMuted, marginTop: 4 }}>{d}</div>
          </div>
        ))}
      </div>

      {/* Phase checklists */}
      {phases.map((ph) => (
        <div key={ph.name} style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 14, padding: '20px 22px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>{ph.name}</span>
                <Tag tone={ph.status === 'in_progress' ? 'accent' : 'neutral'}>{ph.status === 'in_progress' ? '진행 중' : '예정'}</Tag>
              </div>
              <div style={{ fontSize: 12, color: P.textMuted, marginTop: 4, fontFamily: MONO }}>목표 일정 · {ph.target}</div>
            </div>
            <div style={{ width: 180 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: P.textMuted, marginBottom: 5 }}>
                <span>달성률</span><span style={{ fontFamily: MONO, color: P.text, fontWeight: 600 }}>{ph.progress}%</span>
              </div>
              <div style={{ height: 6, background: P.surfaceAlt, borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${ph.progress}%`, height: '100%', background: ph.status === 'in_progress' ? P.accent : P.borderStrong, borderRadius: 6 }}/>
              </div>
            </div>
          </div>

          {ph.items.map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0', borderTop: `1px solid ${P.border}` }}>
              <div style={{
                width: 18, height: 18, borderRadius: 5,
                background: it.done ? P.green : P.surface,
                border: it.done ? `1px solid ${P.green}` : `1.5px solid ${P.borderStrong}`,
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {it.done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11"/></svg>}
              </div>
              <span style={{ fontSize: 13, color: it.done ? P.textMuted : P.text, textDecoration: it.done ? 'line-through' : 'none', textDecorationColor: P.textSubtle }}>{it.t}</span>
            </div>
          ))}
        </div>
      ))}

      {/* Sign-off */}
      <div style={{ background: P.amberSoft, borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', color: '#7e5a23', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{I.check}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#6a4d1c' }}>다음 단계로 넘어가기 전 합의</div>
          <p style={{ fontSize: 12.5, color: '#6a4d1c', margin: '4px 0 0', lineHeight: 1.6 }}>
            MVP-1 체크리스트 5개 항목 중 <strong>2개 완료</strong>. 파일럿 시작 전 큐레이션 책임자 지정과 보안팀 검토를 완료해야 합니다.
          </p>
        </div>
        <Btn kind="secondary" size="sm">RFC 작성</Btn>
      </div>
    </ResultShell>
  );
}

// keep original alias for back-compat with existing canvas
const ScreenResult = ScreenResultArchitecture;

Object.assign(window, {
  ScreenResult,
  ScreenResultProfile,
  ScreenResultArchitecture,
  ScreenResultData,
  ScreenResultEdgeCases,
  ScreenResultEvaluation,
  ScreenResultDefinitionOfDone,
});
