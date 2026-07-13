import DesignIcon from './DesignIcon'
import ExampleBox from './ExampleBox'

export default function ArchHelperPanel() {
  return (
    <div>
      <div className="flex items-center gap-[7px] mb-3">
        <DesignIcon kind="bulb" size={15} color="var(--color-accent)" />
        <div className="text-[13.5px] font-bold text-text" style={{ letterSpacing: -0.1 }}>이 단계 가이드</div>
      </div>
      <p className="text-[12.5px] text-text-muted leading-relaxed m-0 mb-3.5">
        조금 어려워 보여도 괜찮아요. AI가 프로젝트에 맞는 <strong className="text-text">추천 조합</strong>을 자동으로 만들어드려요.
      </p>
      <ExampleBox label="이렇게 진행돼요">
        AI가 만든 시스템 구조가 화면에 바로 나타나요. 훑어보고 마음에 안 들면 <strong>"다시 시도"</strong>로 다시 만들 수 있어요.
      </ExampleBox>
      <div className="mt-[22px] p-[12px_13px] bg-surface-alt rounded-[10px]">
        <div className="text-xs font-semibold text-text mb-[5px]">용어 사전</div>
        <div className="flex flex-col gap-2">
          {[
            ['프론트엔드', '사용자가 보는 화면 부분 (React, Vue 등)'],
            ['백엔드', '데이터를 처리하는 서버 (Python, Node 등)'],
            ['데이터베이스', '정보가 저장되는 창고 (PostgreSQL, MySQL 등)'],
            ['API', '서비스 간 통신하는 약속된 방식'],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="text-xs font-semibold text-accent">{k}</div>
              <div className="text-[11px] text-text-muted mt-[1px] leading-relaxed">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
