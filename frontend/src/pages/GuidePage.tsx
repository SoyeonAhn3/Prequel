const STEPS = [
  {
    title: '프로젝트 만들기',
    desc: '"내 프로젝트"에서 새 프로젝트를 만들고 이름과 간단한 설명을 입력합니다. 설명은 한두 줄이면 충분해요 — 나머지는 인터뷰에서 채워집니다.',
  },
  {
    title: 'AI 인터뷰',
    desc: 'AI가 단계별로 질문을 하나씩 던집니다. 답하면 핵심 정보가 자동으로 정리돼요. 답변이 모호하면 한 번 더 물어보고, 막힐 땐 화면의 "예시 답변"을 참고할 수 있습니다. 중간에 멈춰도 나중에 이어서 진행할 수 있어요.',
  },
  {
    title: '설계',
    desc: '인터뷰에서 모은 내용을 바탕으로 요구사항·시스템 아키텍처·데이터 모델·AI 워크플로우가 자동 생성됩니다. 내용을 검토하고 필요하면 다시 생성하거나 수정하세요.',
  },
  {
    title: '마무리',
    desc: '프로젝트의 가치와 실현 가능성을 점검하고 완료 조건을 확인합니다. 빠진 부분이나 모순이 있으면 이 단계에서 짚어줍니다.',
  },
  {
    title: '문서 생성·다운로드',
    desc: '완성된 킥오프 문서를 미리보기로 확인한 뒤 다운로드합니다. 한 번에 정리된 문서로 팀과 공유하거나 개발 착수에 바로 활용하세요.',
  },
]

const TIPS = [
  '답변은 구체적일수록 좋은 문서가 나옵니다. "사용자"보다 "법무사·개인 사용자"처럼 적어주세요.',
  '인터뷰는 일시정지/재개가 됩니다. 시간이 없으면 멈췄다가 나중에 이어서 진행하세요.',
  '새로운 기능·변경 사항은 상단 "공지사항"에서 확인할 수 있습니다.',
]

export default function GuidePage() {
  return (
    <div className="max-w-[860px] mx-auto">
      {/* Header */}
      <div className="mb-7">
        <p className="text-[11px] text-text-subtle font-mono tracking-[0.12em] mb-1.5">GUIDE</p>
        <h2 className="text-[26px] font-bold tracking-tight">사용 가이드</h2>
        <p className="text-sm text-text-muted mt-2 leading-relaxed">
          Prequel은 AI 인터뷰로 프로젝트 킥오프 문서를 자동으로 만들어주는 서비스입니다.
          아래 5단계만 따라오면 됩니다.
        </p>
      </div>

      {/* Steps */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <div className="flex flex-col gap-5">
          {STEPS.map((s, i) => (
            <div key={s.title} className={`flex gap-4 ${i > 0 ? 'pt-5 border-t border-border' : ''}`}>
              <div className="shrink-0 w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-semibold text-text mb-1">{s.title}</h3>
                <p className="text-[13.5px] text-text-muted leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="text-[13.5px] font-semibold mb-3.5">💡 더 잘 쓰는 팁</div>
        <ul className="flex flex-col gap-2.5">
          {TIPS.map((t) => (
            <li key={t} className="flex gap-2.5 text-[13.5px] text-text-muted leading-relaxed">
              <span className="text-accent shrink-0">·</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
