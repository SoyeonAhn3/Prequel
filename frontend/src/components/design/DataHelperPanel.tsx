import DesignIcon from './DesignIcon'
import ExampleBox from './ExampleBox'

export default function DataHelperPanel() {
  return (
    <div>
      <div className="flex items-center gap-[7px] mb-3">
        <DesignIcon kind="bulb" size={15} color="var(--color-accent)" />
        <div className="text-[13.5px] font-bold text-text" style={{ letterSpacing: -0.1 }}>쉽게 이해하기</div>
      </div>

      <div className="mb-[18px]">
        <div className="text-xs font-semibold text-text mb-1.5">엑셀로 비유하면?</div>
        <p className="text-xs text-text-muted leading-relaxed m-0 mb-2.5">
          엑셀에서 시트 하나가 '테이블'이고, 시트 안의 열이 '항목'이에요. 그리고 시트끼리 연결되어 있는 거랍니다.
        </p>
        <div className="bg-surface-alt p-[10px_12px] rounded-lg">
          <div className="text-[11px] font-mono text-text-subtle mb-1.5">EXCEL 비유</div>
          <div className="text-[11.5px] text-text leading-relaxed">
            <span>👤 </span><strong>사용자.xlsx</strong> 시트<br />↓ ID 연결<br />
            <span>✉️ </span><strong>추천기록.xlsx</strong> 시트<br />↓ 책 ID 연결<br />
            <span>📚 </span><strong>책.xlsx</strong> 시트
          </div>
        </div>
      </div>

      <div className="mb-[18px]">
        <div className="text-xs font-semibold text-text mb-1.5">"타입"이 뭐예요?</div>
        <p className="text-xs text-text-muted leading-relaxed m-0">
          각 항목에 들어갈 데이터의 종류예요. 텍스트인지, 숫자인지, 날짜인지...
        </p>
        <div className="flex flex-wrap gap-[5px] mt-2">
          {['텍스트', '숫자', '날짜', '선택지', '이미지', '연결'].map(t => (
            <span key={t} className="text-[10.5px] font-mono px-2 py-[3px] bg-surface-alt text-text-muted rounded">
              {t}
            </span>
          ))}
        </div>
      </div>

      <ExampleBox label="팁">
        <strong>"필수"</strong>는 반드시 입력해야 하는 항목, <strong>"자동"</strong>은 시스템이 알아서 채우는 항목이에요. (예: 가입일, ID)
      </ExampleBox>
    </div>
  )
}
