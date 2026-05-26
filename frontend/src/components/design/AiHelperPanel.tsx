import DesignIcon from './DesignIcon'
import ExampleBox from './ExampleBox'

export default function AiHelperPanel() {
  return (
    <div>
      <div className="flex items-center gap-[7px] mb-3">
        <DesignIcon kind="bulb" size={15} color="var(--color-accent)" />
        <div className="text-[13.5px] font-bold text-text" style={{ letterSpacing: -0.1 }}>이 단계 가이드</div>
      </div>
      <p className="text-[12.5px] text-text-muted leading-relaxed m-0 mb-4">
        AI 흐름 설계는 어려워 보이지만, 핵심은 <strong className="text-text">3가지 질문</strong>만 답하면 됩니다:
      </p>

      <div className="flex flex-col gap-2.5 mb-[18px]">
        {[
          ['1', 'AI에게 뭘 보여줘요?', '입력 데이터'],
          ['2', 'AI가 뭘 돌려줘야 해요?', '출력 형식'],
          ['3', '실패하면 어떻게 해요?', '폴백 전략'],
        ].map(([n, q, a]) => (
          <div key={n} className="flex gap-2.5 items-start">
            <div className="w-[22px] h-[22px] rounded-full bg-accent text-white text-[11px] font-bold font-mono flex items-center justify-center shrink-0 mt-[1px]">
              {n}
            </div>
            <div className="flex-1">
              <div className="text-[12.5px] font-semibold text-text">{q}</div>
              <div className="text-[11px] text-text-subtle mt-[1px]">{a}</div>
            </div>
          </div>
        ))}
      </div>

      <ExampleBox label="좋은 출력 형식 예시">
        <strong>JSON 형식</strong>으로 받으면 앱이 자동으로 화면에 표시할 수 있어요.<br />
        예: <code className="font-mono text-[11px]">{`{ "title": "...", "reason": "..." }`}</code>
      </ExampleBox>

      <div
        className="mt-[22px] p-[12px_13px] rounded-[10px]"
        style={{
          background: 'color-mix(in srgb, var(--color-amber-soft) 60%, transparent)',
          border: '1px solid color-mix(in srgb, var(--color-amber) 15%, transparent)',
        }}
      >
        <div className="text-xs font-semibold mb-[5px] flex items-center gap-[5px]" style={{ color: '#7e5a23' }}>
          <span>💰</span> 비용 알림
        </div>
        <p className="text-[11.5px] opacity-90 leading-relaxed m-0" style={{ color: '#7e5a23' }}>
          AI 모델마다 가격이 달라요. Sonnet은 균형, Haiku는 저렴, Opus는 비쌈. 처음엔 Sonnet으로 시작하는 게 좋아요.
        </p>
      </div>
    </div>
  )
}
