import type { DocSection } from '../components/viewer/DocSections'

export interface SampleDocModel {
  project: {
    id: string
    name: string
    project_type: string | null
    description: string | null
    language: string
    status: string
  }
  sections: DocSection[]
  completeness: { complete: number; total: number; percent: number }
}

/**
 * "등기부 등본 AI 해석기" 프로젝트가 실제로 완료됐을 때 서버가 만든
 * document-model 응답을 그대로 스냅샷한 것 (2026-08-25 기준, GET
 * /projects/{id}/document-model 실호출 결과). 완료 후 화면이 어떻게
 * 나오는지 보여주는 랜딩 페이지용 정적 샘플이라 원본 프로젝트가 이후
 * 수정/삭제돼도 이 값은 영향받지 않는다. 갱신하려면 같은 엔드포인트를
 * 다시 호출해 이 파일을 교체하면 된다.
 */
export const SAMPLE_KICKOFF_DOC: SampleDocModel = {
  "project": {
    "id": "2f8e9275-d56e-4155-836e-37f730db61ef",
    "name": "등기부 등본 AI 해석기",
    "project_type": "AI/ML (인공지능/머신러닝)",
    "description": "등기부 등본을 업로드 하면, AI가 이 문서에 대해서 해석해주고, 해당 집에 대한 정보를 가져와서 안전한 지 위험한 지에 대해서 판단 및 해석을 제공함",
    "language": "ko",
    "status": "completed"
  },
  "sections": [
    {
      "id": "profile",
      "title": "프로젝트 프로필",
      "kind": "profile",
      "status": "complete",
      "content": "| 항목 | 내용 |\n|---|---|\n| 프로젝트명 | 등기부 등본 AI 해석기 |\n| 유형 | AI/ML (인공지능/머신러닝) |\n| 언어 | ko |\n\n> 등기부 등본을 업로드 하면, AI가 이 문서에 대해서 해석해주고, 해당 집에 대한 정보를 가져와서 안전한 지 위험한 지에 대해서 판단 및 해석을 제공함\n\n**대상 사용자**\n\n- 전세/매매 계약을 앞둔 일반인\n- 비전문가 ~ 중간 수준 (등기부 등본에 익숙하지 않은 일반인 포함)\n- 반복 사용 (여러 매물 비교 시 반복적으로 활용)\n\n**해결하는 문제**\n\n- 위험 항목 판단 불가, 수치 해석 어려움\n- 법률 용어 생소함, 전문가 비용 부담\n\n**핵심 기능**\n\n- SQLite\n- PostgreSQL\n- AI 안전/위험 판단\n- 비전문가 친화적 결과 설명\n- 위험도 요약 배지 (신호등 UI) — 분석 결과를 🟢안전/🟡주의/🔴위험으로 한눈에 표시\n- 위험 항목 용어 툴팁 — 법률 용어에 마우스 오버 시 쉬운 설명 팝업\n\n**성공 지표**\n\n- 테스트셋 평가 — 정답이 알려진 등기부 등본 샘플로 정기 테스트\n- 사용자 피드백 — '도움이 됐나요?' 버튼으로 수집\n\n**리스크 · 대응**\n\n- OCR 인식률 저하 — 저화질/스캔 이미지에서 정확도 하락 가능\n- AI 분석 오류 — 복잡한 등기부 등본 문서 잘못 해석 가능\n- 딱히 없음\n- 개인정보보호법(PIPA) 준수 — 개인정보 처리 방침 수립 및 고지 의무\n- 법적 면책 조항 — AI 분석 결과는 참고용이며 법적 효력 없음을 명시\n\n**데이터 · 입력**\n\n- 사용자 업로드 등기부 등본 (PDF, 이미지 복합 지원)\n- 공공 API (법원 등기소, 국토교통부 실거래가, 건축물 대장 등)\n- 민간 API 제외, 공공 API만 활용\n- 개인정보 마스킹 처리 후 분석 (OCR 단계에서 이름, 주민번호, 주소 등 패턴 감지 후 마스킹)\n- 있음 (등기부 등본 내 소유자 정보 등)\n- 분석 완료 즉시 삭제\n- 분석 결과 + 물건 제목(건물명/동호수) + 분석 날짜만 저장\n- Naver CLOVA OCR (한국어 특화)\n- GPT 프롬프트 기반 + 공공 데이터(AI Hub 등)로 테스트셋 구축\n\n**기술 · 인프라**\n\n- Next.js (React 기반)\n- OpenAI GPT 최신 버전\n- Vercel\n- Railway\n\n**기타**\n\n- 등기부 등본 문서를 AI로 분석·해석하고, 부동산 안전성을 자동 판단해주는 서비스\n- 1회 계약 검토 시 평균 3~5개 매물 비교 기준으로 설계\n- 비전문가 친화적 설명 — 직관적 안전/위험 판단 제공\n- 24/7 접근성 — 언제 어디서든 즉시 확인 가능\n- 비용 절감 — 전문가 상담 없이 무료/저렴하게 이용\n- 누구나 전문가 없이도 부동산 계약 위험을 스스로 판단할 수 있다\n- AI 분석 정확도 90% 이상\n- GPT 프롬프트 엔지니어링 (파인튜닝 없음)\n- 서버 기반 (Server-side) — 사용자 업로드 후 서버에서 GPT API 호출\n- 90% 이상\n- 전 항목 동일 기준 적용\n- 위험도 요약 배지 (신호등 UI) (난이도: 낮, 시간: 반나절~1일)\n- 매물 비교 뷰 (난이도: 중, 시간: 2~3일)\n- 위험 항목 용어 툴팁 (난이도: 낮, 시간: 1일)\n- 분석 결과 PDF 내보내기 (난이도: 중, 시간: 1~2일)\n- 재분석 알림 (난이도: 높, 시간: 3일 이상)",
      "data": {
        "meta": {
          "name": "등기부 등본 AI 해석기",
          "project_type": "AI/ML (인공지능/머신러닝)",
          "language": "ko"
        },
        "lead": "등기부 등본을 업로드 하면, AI가 이 문서에 대해서 해석해주고, 해당 집에 대한 정보를 가져와서 안전한 지 위험한 지에 대해서 판단 및 해석을 제공함",
        "groups": [
          {
            "label": "대상 사용자",
            "items": [
              "전세/매매 계약을 앞둔 일반인",
              "비전문가 ~ 중간 수준 (등기부 등본에 익숙하지 않은 일반인 포함)",
              "반복 사용 (여러 매물 비교 시 반복적으로 활용)"
            ]
          },
          {
            "label": "해결하는 문제",
            "items": [
              "위험 항목 판단 불가, 수치 해석 어려움",
              "법률 용어 생소함, 전문가 비용 부담"
            ]
          },
          {
            "label": "핵심 기능",
            "items": [
              "SQLite",
              "PostgreSQL",
              "AI 안전/위험 판단",
              "비전문가 친화적 결과 설명",
              "위험도 요약 배지 (신호등 UI) — 분석 결과를 🟢안전/🟡주의/🔴위험으로 한눈에 표시",
              "위험 항목 용어 툴팁 — 법률 용어에 마우스 오버 시 쉬운 설명 팝업"
            ]
          },
          {
            "label": "성공 지표",
            "items": [
              "테스트셋 평가 — 정답이 알려진 등기부 등본 샘플로 정기 테스트",
              "사용자 피드백 — '도움이 됐나요?' 버튼으로 수집"
            ]
          },
          {
            "label": "리스크 · 대응",
            "items": [
              "OCR 인식률 저하 — 저화질/스캔 이미지에서 정확도 하락 가능",
              "AI 분석 오류 — 복잡한 등기부 등본 문서 잘못 해석 가능",
              "딱히 없음",
              "개인정보보호법(PIPA) 준수 — 개인정보 처리 방침 수립 및 고지 의무",
              "법적 면책 조항 — AI 분석 결과는 참고용이며 법적 효력 없음을 명시"
            ]
          },
          {
            "label": "데이터 · 입력",
            "items": [
              "사용자 업로드 등기부 등본 (PDF, 이미지 복합 지원)",
              "공공 API (법원 등기소, 국토교통부 실거래가, 건축물 대장 등)",
              "민간 API 제외, 공공 API만 활용",
              "개인정보 마스킹 처리 후 분석 (OCR 단계에서 이름, 주민번호, 주소 등 패턴 감지 후 마스킹)",
              "있음 (등기부 등본 내 소유자 정보 등)",
              "분석 완료 즉시 삭제",
              "분석 결과 + 물건 제목(건물명/동호수) + 분석 날짜만 저장",
              "Naver CLOVA OCR (한국어 특화)",
              "GPT 프롬프트 기반 + 공공 데이터(AI Hub 등)로 테스트셋 구축"
            ]
          },
          {
            "label": "기술 · 인프라",
            "items": [
              "Next.js (React 기반)",
              "OpenAI GPT 최신 버전",
              "Vercel",
              "Railway"
            ]
          },
          {
            "label": "기타",
            "items": [
              "등기부 등본 문서를 AI로 분석·해석하고, 부동산 안전성을 자동 판단해주는 서비스",
              "1회 계약 검토 시 평균 3~5개 매물 비교 기준으로 설계",
              "비전문가 친화적 설명 — 직관적 안전/위험 판단 제공",
              "24/7 접근성 — 언제 어디서든 즉시 확인 가능",
              "비용 절감 — 전문가 상담 없이 무료/저렴하게 이용",
              "누구나 전문가 없이도 부동산 계약 위험을 스스로 판단할 수 있다",
              "AI 분석 정확도 90% 이상",
              "GPT 프롬프트 엔지니어링 (파인튜닝 없음)",
              "서버 기반 (Server-side) — 사용자 업로드 후 서버에서 GPT API 호출",
              "90% 이상",
              "전 항목 동일 기준 적용",
              "위험도 요약 배지 (신호등 UI) (난이도: 낮, 시간: 반나절~1일)",
              "매물 비교 뷰 (난이도: 중, 시간: 2~3일)",
              "위험 항목 용어 툴팁 (난이도: 낮, 시간: 1일)",
              "분석 결과 PDF 내보내기 (난이도: 중, 시간: 1~2일)",
              "재분석 알림 (난이도: 높, 시간: 3일 이상)"
            ]
          }
        ]
      }
    },
    {
      "id": "features",
      "title": "기능 정의",
      "kind": "features",
      "status": "complete",
      "content": "- `MUST` 사용자는 등기부 등본 파일(PDF 및 이미지)을 업로드할 수 있어야 한다.\n  - 완료기준: PDF, JPG, PNG 형식의 파일 업로드가 가능하며, 업로드 완료 후 처리 진행 상태를 사용자에게 시각적으로 표시한다.\n- `MUST` 시스템은 업로드된 등기부 등본을 Naver CLOVA OCR을 이용해 텍스트로 변환해야 한다.\n  - 완료기준: 한국어 특화 OCR을 통해 등기부 등본 내 주요 항목(소유자, 권리관계, 금액 등)이 90% 이상의 정확도로 추출된다.\n- `MUST` 시스템은 OCR로 추출된 텍스트를 OpenAI GPT API에 전달하여 부동산 안전/위험 여부를 판단하고 분석 결과를 생성해야 한다.\n  - 완료기준: 위험 판단, 금액 수치 해석, 권리 관계 분석 각 항목에서 90% 이상의 정확도를 달성하며, 분석 결과는 30초 이내에 반환된다.\n- `MUST` 분석 결과 화면에 위험도 요약 배지(신호등 UI)를 표시하여 🟢안전 / 🟡주의 / 🔴위험으로 한눈에 확인할 수 있어야 한다.\n  - 완료기준: 분석 결과 페이지 최상단에 신호등 배지가 표시되며, 안전/주의/위험 세 단계 중 하나로 명확하게 분류된다.\n- `MUST` 분석 결과 내 법률 용어(근저당권, 가압류, 전세권 등)에 마우스 오버(또는 탭) 시 비전문가가 이해할 수 있는 쉬운 설명 툴팁이 표시되어야 한다.\n  - 완료기준: 주요 법률 용어 20개 이상에 툴팁이 적용되며, 툴팁 설명은 중학생 수준의 언어로 작성된다.\n- `MUST` OCR 처리 단계에서 이름, 주민등록번호, 주소 등 개인식별정보를 자동으로 감지하여 마스킹 처리 후 AI 분석에 전달해야 한다.\n  - 완료기준: 이름, 주민등록번호(패턴 기반), 주소 항목이 마스킹 처리되어 GPT API로 전송되며, 마스킹 누락 건수가 0건이어야 한다.\n- `MUST` 업로드된 원본 등기부 등본 파일은 분석 완료 즉시 서버에서 삭제되어야 하며, 분석 결과·물건 제목·분석 날짜만 저장되어야 한다.\n  - 완료기준: 분석 완료 후 원본 파일이 서버 스토리지에 남아있지 않음을 로그로 확인할 수 있으며, 저장 데이터는 분석 결과, 건물명/동호수, 분석 날짜로 한정된다.\n- `MUST` 시스템은 국토교통부 실거래가, 법원 등기소, 건축물 대장 등 공공 API를 연동하여 해당 부동산의 외부 데이터를 자동으로 조회하고 분석에 반영해야 한다.\n  - 완료기준: 공공 API 3종(법원 등기소, 국토교통부 실거래가, 건축물 대장) 연동이 정상 동작하며, 외부 데이터가 분석 결과 화면에 출력된다.\n- `MUST` 분석 결과는 비전문가가 이해할 수 있도록 항목별 위험 요인, 이유, 권고 사항을 쉬운 언어로 제공해야 한다.\n  - 완료기준: 분석 결과 화면에 위험 항목 목록, 각 항목에 대한 쉬운 설명, 계약 시 주의사항이 포함되어 있으며, 법률 전문 용어 없이 이해 가능한 수준으로 작성된다.\n- `SHOULD` 사용자는 이전에 분석한 매물의 분석 결과 이력을 확인할 수 있어야 한다.\n  - 완료기준: 분석 이력 목록에서 물건명, 분석 날짜, 위험도 배지가 표시되며, 이전 분석 결과 상세 페이지로 이동할 수 있다.\n- `SHOULD` 사용자는 여러 매물(최소 5개)의 분석 결과를 나란히 비교할 수 있는 매물 비교 뷰를 사용할 수 있어야 한다.\n  - 완료기준: 최대 5개의 분석 결과를 선택하여 위험도, 주요 권리관계, 금액 등을 나란히 비교하는 화면이 제공된다.\n- `SHOULD` 등기부 등본 업로드부터 분석 결과 화면 표시까지 전체 처리 시간이 30초를 초과하지 않아야 한다.\n  - 완료기준: 일반 품질(300dpi 이상) 문서 기준으로 OCR 처리 + GPT 분석 + 결과 표시 전체 소요 시간이 30초 이하이다.\n- `SHOULD` 서비스 내 모든 데이터 전송은 HTTPS로 암호화되어야 하며, 개인정보처리방침이 서비스 내에 명시되어야 한다.\n  - 완료기준: 전체 API 통신이 HTTPS로 이루어지며, 개인정보처리방침 페이지가 존재하고 서비스 이용 시 동의 절차가 포함된다.\n- `SHOULD` 분석 결과 화면 하단에 'AI 분석 결과는 참고용이며 법적 효력이 없습니다'라는 면책 조항이 명시되어야 한다.\n  - 완료기준: 모든 분석 결과 페이지에서 면책 조항 문구가 명확하게 표시되며, 사용자가 처음 이용 시 해당 내용에 동의하는 절차가 있다.\n- `SHOULD` 사용자는 '도움이 됐나요?' 버튼을 통해 분석 결과에 대한 피드백을 제출할 수 있어야 한다.\n  - 완료기준: 분석 결과 페이지에 긍정/부정 피드백 버튼이 제공되며, 수집된 피드백 데이터가 관리자 화면 또는 DB에 저장된다.\n- `SHOULD` 저화질 또는 스캔 이미지 업로드 시 OCR 인식률이 낮다고 판단되면 사용자에게 품질 경고 메시지와 재업로드 안내를 제공해야 한다.\n  - 완료기준: OCR 신뢰도 점수가 기준 이하(예: 70% 미만)일 경우 '문서 품질이 낮아 분석 정확도가 떨어질 수 있습니다' 경고가 표시된다.\n- `COULD` 사용자는 분석 결과를 PDF 파일로 내보내어 저장하거나 타인과 공유할 수 있어야 한다.\n  - 완료기준: 분석 결과 페이지에서 PDF 내보내기 버튼 클릭 시 위험도 배지, 항목별 분석 내용, 면책 조항이 포함된 PDF가 생성되어 다운로드된다.\n- `COULD` 시스템은 동시 다수 사용자의 분석 요청을 처리할 수 있도록 서버 측 요청 큐 또는 비동기 처리를 지원해야 한다.\n  - 완료기준: 동시 10명 이상의 분석 요청 시 서비스 오류 없이 처리되며, 대기 중인 경우 사용자에게 대기 상태를 안내한다.",
      "data": {
        "requirements": [
          {
            "priority": "MUST",
            "text": "사용자는 등기부 등본 파일(PDF 및 이미지)을 업로드할 수 있어야 한다.",
            "acceptance_criteria": "PDF, JPG, PNG 형식의 파일 업로드가 가능하며, 업로드 완료 후 처리 진행 상태를 사용자에게 시각적으로 표시한다."
          },
          {
            "priority": "MUST",
            "text": "시스템은 업로드된 등기부 등본을 Naver CLOVA OCR을 이용해 텍스트로 변환해야 한다.",
            "acceptance_criteria": "한국어 특화 OCR을 통해 등기부 등본 내 주요 항목(소유자, 권리관계, 금액 등)이 90% 이상의 정확도로 추출된다."
          },
          {
            "priority": "MUST",
            "text": "시스템은 OCR로 추출된 텍스트를 OpenAI GPT API에 전달하여 부동산 안전/위험 여부를 판단하고 분석 결과를 생성해야 한다.",
            "acceptance_criteria": "위험 판단, 금액 수치 해석, 권리 관계 분석 각 항목에서 90% 이상의 정확도를 달성하며, 분석 결과는 30초 이내에 반환된다."
          },
          {
            "priority": "MUST",
            "text": "분석 결과 화면에 위험도 요약 배지(신호등 UI)를 표시하여 🟢안전 / 🟡주의 / 🔴위험으로 한눈에 확인할 수 있어야 한다.",
            "acceptance_criteria": "분석 결과 페이지 최상단에 신호등 배지가 표시되며, 안전/주의/위험 세 단계 중 하나로 명확하게 분류된다."
          },
          {
            "priority": "MUST",
            "text": "분석 결과 내 법률 용어(근저당권, 가압류, 전세권 등)에 마우스 오버(또는 탭) 시 비전문가가 이해할 수 있는 쉬운 설명 툴팁이 표시되어야 한다.",
            "acceptance_criteria": "주요 법률 용어 20개 이상에 툴팁이 적용되며, 툴팁 설명은 중학생 수준의 언어로 작성된다."
          },
          {
            "priority": "MUST",
            "text": "OCR 처리 단계에서 이름, 주민등록번호, 주소 등 개인식별정보를 자동으로 감지하여 마스킹 처리 후 AI 분석에 전달해야 한다.",
            "acceptance_criteria": "이름, 주민등록번호(패턴 기반), 주소 항목이 마스킹 처리되어 GPT API로 전송되며, 마스킹 누락 건수가 0건이어야 한다."
          },
          {
            "priority": "MUST",
            "text": "업로드된 원본 등기부 등본 파일은 분석 완료 즉시 서버에서 삭제되어야 하며, 분석 결과·물건 제목·분석 날짜만 저장되어야 한다.",
            "acceptance_criteria": "분석 완료 후 원본 파일이 서버 스토리지에 남아있지 않음을 로그로 확인할 수 있으며, 저장 데이터는 분석 결과, 건물명/동호수, 분석 날짜로 한정된다."
          },
          {
            "priority": "MUST",
            "text": "시스템은 국토교통부 실거래가, 법원 등기소, 건축물 대장 등 공공 API를 연동하여 해당 부동산의 외부 데이터를 자동으로 조회하고 분석에 반영해야 한다.",
            "acceptance_criteria": "공공 API 3종(법원 등기소, 국토교통부 실거래가, 건축물 대장) 연동이 정상 동작하며, 외부 데이터가 분석 결과 화면에 출력된다."
          },
          {
            "priority": "MUST",
            "text": "분석 결과는 비전문가가 이해할 수 있도록 항목별 위험 요인, 이유, 권고 사항을 쉬운 언어로 제공해야 한다.",
            "acceptance_criteria": "분석 결과 화면에 위험 항목 목록, 각 항목에 대한 쉬운 설명, 계약 시 주의사항이 포함되어 있으며, 법률 전문 용어 없이 이해 가능한 수준으로 작성된다."
          },
          {
            "priority": "SHOULD",
            "text": "사용자는 이전에 분석한 매물의 분석 결과 이력을 확인할 수 있어야 한다.",
            "acceptance_criteria": "분석 이력 목록에서 물건명, 분석 날짜, 위험도 배지가 표시되며, 이전 분석 결과 상세 페이지로 이동할 수 있다."
          },
          {
            "priority": "SHOULD",
            "text": "사용자는 여러 매물(최소 5개)의 분석 결과를 나란히 비교할 수 있는 매물 비교 뷰를 사용할 수 있어야 한다.",
            "acceptance_criteria": "최대 5개의 분석 결과를 선택하여 위험도, 주요 권리관계, 금액 등을 나란히 비교하는 화면이 제공된다."
          },
          {
            "priority": "SHOULD",
            "text": "등기부 등본 업로드부터 분석 결과 화면 표시까지 전체 처리 시간이 30초를 초과하지 않아야 한다.",
            "acceptance_criteria": "일반 품질(300dpi 이상) 문서 기준으로 OCR 처리 + GPT 분석 + 결과 표시 전체 소요 시간이 30초 이하이다."
          },
          {
            "priority": "SHOULD",
            "text": "서비스 내 모든 데이터 전송은 HTTPS로 암호화되어야 하며, 개인정보처리방침이 서비스 내에 명시되어야 한다.",
            "acceptance_criteria": "전체 API 통신이 HTTPS로 이루어지며, 개인정보처리방침 페이지가 존재하고 서비스 이용 시 동의 절차가 포함된다."
          },
          {
            "priority": "SHOULD",
            "text": "분석 결과 화면 하단에 'AI 분석 결과는 참고용이며 법적 효력이 없습니다'라는 면책 조항이 명시되어야 한다.",
            "acceptance_criteria": "모든 분석 결과 페이지에서 면책 조항 문구가 명확하게 표시되며, 사용자가 처음 이용 시 해당 내용에 동의하는 절차가 있다."
          },
          {
            "priority": "SHOULD",
            "text": "사용자는 '도움이 됐나요?' 버튼을 통해 분석 결과에 대한 피드백을 제출할 수 있어야 한다.",
            "acceptance_criteria": "분석 결과 페이지에 긍정/부정 피드백 버튼이 제공되며, 수집된 피드백 데이터가 관리자 화면 또는 DB에 저장된다."
          },
          {
            "priority": "SHOULD",
            "text": "저화질 또는 스캔 이미지 업로드 시 OCR 인식률이 낮다고 판단되면 사용자에게 품질 경고 메시지와 재업로드 안내를 제공해야 한다.",
            "acceptance_criteria": "OCR 신뢰도 점수가 기준 이하(예: 70% 미만)일 경우 '문서 품질이 낮아 분석 정확도가 떨어질 수 있습니다' 경고가 표시된다."
          },
          {
            "priority": "COULD",
            "text": "사용자는 분석 결과를 PDF 파일로 내보내어 저장하거나 타인과 공유할 수 있어야 한다.",
            "acceptance_criteria": "분석 결과 페이지에서 PDF 내보내기 버튼 클릭 시 위험도 배지, 항목별 분석 내용, 면책 조항이 포함된 PDF가 생성되어 다운로드된다."
          },
          {
            "priority": "COULD",
            "text": "시스템은 동시 다수 사용자의 분석 요청을 처리할 수 있도록 서버 측 요청 큐 또는 비동기 처리를 지원해야 한다.",
            "acceptance_criteria": "동시 10명 이상의 분석 요청 시 서비스 오류 없이 처리되며, 대기 중인 경우 사용자에게 대기 상태를 안내한다."
          }
        ],
        "counts": {
          "MUST": 9,
          "SHOULD": 7,
          "COULD": 2
        }
      }
    },
    {
      "id": "architecture",
      "title": "시스템 구조",
      "kind": "architecture",
      "status": "complete",
      "content": "**구성 요소**\n\n- **Next.js 프론트엔드** (Next.js 14 (React, TypeScript) + Tailwind CSS, Vercel 배포) — 사용자 인터페이스를 담당하는 웹 애플리케이션. 등기부 등본 파일 업로드, 신호등 UI 배지(🟢안전/🟡주의/🔴위험), 법률 용어 툴팁, 분석 결과 화면, 분석 이력 목록을 제공. Vercel에 배포.\n- **FastAPI 백엔드 서버** (FastAPI (Python 3.11), Railway 배포) — 핵심 비즈니스 로직을 처리하는 메인 서버. 파일 수신, OCR 호출, 개인정보 마스킹, GPT 분석 프롬프트 오케스트레이션, 공공 API 연동, 분석 결과 저장·삭제 파이프라인을 순차 처리. Railway에 배포.\n- **Naver CLOVA OCR** (Naver CLOVA OCR API (한국어 특화)) — 사용자가 업로드한 등기부 등본 PDF 및 이미지에서 한국어 텍스트를 추출. OCR 결과 반환 후 백엔드에서 개인정보(이름·주민번호·주소) 패턴을 감지하여 마스킹 처리.\n- **AI 분석 엔진 (LLM)** (OpenAI GPT API (최신 버전, 프롬프트 엔지니어링)) — 마스킹 처리된 등기부 등본 텍스트를 프롬프트 엔지니어링 방식으로 분석. 위험 판단(안전/주의/위험), 금액 수치 해석(근저당권·채권최고액), 권리 관계 분석(가압류·전세권·지상권)을 수행하여 비전문가 친화적 설명 생성. 목표 정확도 90% 이상.\n- **공공 데이터 API 연동** (공공데이터포털 REST API (국토교통부 · 법원등기소 · 건축물대장)) — 분석 대상 부동산의 외부 정보를 자동 수집. 국토교통부 실거래가, 법원 등기소, 건축물 대장 공공 API에서 데이터를 가져와 AI 분석 컨텍스트로 활용. 민간 API는 사용하지 않음.\n- **데이터베이스** (SQLite (MVP1) → PostgreSQL (MVP2, Railway 관리형)) — 원본 파일은 저장하지 않으며, 분석 결과·물건 제목(건물명/동호수)·분석 날짜·위험도 등급·사용자 피드백만 보관. MVP1은 SQLite, MVP2는 PostgreSQL로 마이그레이션.\n- **임시 파일 스토리지** (서버 임시 디렉토리 (Railway 인스턴스 로컬) 또는 인메모리 처리) — 업로드된 등기부 등본 파일을 OCR 처리 완료 전까지만 임시 보관. 분석 파이프라인 완료 즉시 자동 삭제하여 개인정보보호법(PIPA) 준수.\n\n**기술 스택**\n\n- OCR: Naver CLOVA OCR API\n- AI/LLM: OpenAI GPT API (최신 버전, 프롬프트 엔지니어링)\n- Backend: FastAPI (Python 3.11)\n- Frontend: Next.js 14 (React + TypeScript) + Tailwind CSS\n- 공공 API: 국토교통부 실거래가 · 법원등기소 · 건축물대장 공공데이터포털\n- Backend 배포: Railway\n- Database (MVP1): SQLite\n- Database (MVP2): PostgreSQL (Railway 관리형)\n- Frontend 배포: Vercel\n\n**1. 분석 파이프라인 순서 (중요)**\n파일 수신 → 임시 저장 → CLOVA OCR 텍스트 추출 → 개인정보 마스킹 (정규식 패턴 감지) → 마스킹된 텍스트로 공공 API 부동산 정보 조회 → GPT 프롬프트로 통합 분석 → 결과 DB 저장 → 임시 파일 즉시 삭제. 이 순서를 반드시 지켜야 개인정보보호법(PIPA) 준수 가능.\n\n**2. 개인정보 마스킹**\n백엔드 FastAPI에서 OCR 결과 텍스트에 대해 Python 정규식으로 주민번호 패턴(000000-0000000), 전화번호, 이름(성+이름 패턴) 등을 감지 후 마스킹. 마스킹된 텍스트만 GPT에 전달.\n\n**3. GPT 프롬프트 설계**\n'너는 등기부 등본 전문 분석 AI다. 아래 내용을 바탕으로 ① 안전/주의/위험 판단 ② 위험 이유 쉬운 설명 ③ 주요 권리 관계 요약을 JSON 형태로 반환해라' 형태의 시스템 프롬프트 + 마스킹된 OCR 텍스트 + 공공 API 수집 데이터를 합산하여 단일 API 호출로 처리 권장 (토큰 절약 + 응답 시간 최소화).\n\n**4. 공공 API 연동 시 주의**\n국토교통부·법원등기소·건축물대장 공공 API는 일 요청 제한(Rate Limit)이 있으므로, 백엔드에서 응답 결과를 DB에 캐싱하여 동일 주소 중복 호출 방지.\n\n**5. 처리 시간 60초 이내 목표**\nCLOVA OCR 응답(약 3~10초) + 공공 API 조회(병렬 처리, 약 2~5초) + GPT 응답(약 10~20초) 기준 합산 약 20~35초 예상. 프론트엔드에서 진행 상태 표시(스피너 + 단계별 메시지)로 사용자 체감 대기 시간 완화 권장.\n\n**6. MVP1 → MVP2 마이그레이션**\nSQLite → PostgreSQL 전환 시 SQLAlchemy ORM을 사용하면 DB 변경 시 코드 수정 최소화 가능. Railway에서 PostgreSQL 플러그인 추가로 전환 가능.\n\n**7. 법적 면책 조항**\n모든 분석 결과 응답 JSON에 disclaimer 필드를 포함하여 프론트엔드에서 반드시 렌더링하도록 구조화 권장.\n\n```mermaid\ngraph TD\n    User([\"👤 사용자\\n(전세/매매 계약자\"])\n\n    subgraph Frontend [\"🖥️ Frontend — Vercel\"]\n        NextJS[\"Next.js 14\\nReact + TypeScript + Tailwind CSS\"]\n        UI_Upload[\"📂 파일 업로드 UI\"]\n        UI_Result[\"🚦 신호등 배지\\n분석 결과 화면\"]\n        UI_Tooltip[\"💬 법률 용어 툴팁\"]\n        UI_History[\"📋 분석 이력 목록\"]\n    end\n\n    subgraph Backend [\"⚙️ Backend — Railway\"]\n        FastAPI[\"FastAPI\\nPython 3.11\"]\n        Pipeline[\"📊 분석 파이프라인\\nOCR → 마스킹 → AI분석 → 공공API\"]\n        Masking[\"🔒 개인정보 마스킹\\n이름·주민번호·주소\"]\n        TempStorage[\"🗑️ 임시 파일 저장소\\n분석 완료 후 즉시 삭제\"]\n    end\n\n    subgraph AILayer [\"🤖 AI / ML 레이어\"]\n        GPT[\"OpenAI GPT API\\n프롬프트 엔지니어링\\n위험판단·수치해석·권리분석\"]\n    end\n\n    subgraph ExternalAPIs [\"🌐 외부 서비스\"]\n        CLOVA[\"Naver CLOVA OCR\\n한국어 특화 텍스트 추출\"]\n        PublicAPI[\"공공 데이터 API\\n국토교통부 실거래가\\n법원등기소\\n건축물대장\"]\n    end\n\n    subgraph DB [\"🗄️ Database\"]\n        Database[\"SQLite → PostgreSQL\\n분석결과·물건제목\\n분석날짜·위험도·피드백\"]\n    end\n\n    User -->|\"PDF/이미지 업로드\"| UI_Upload\n    UI_Upload -->|\"파일 전송\"| FastAPI\n    FastAPI --> TempStorage\n    FastAPI --> Pipeline\n    Pipeline -->|\"OCR 요청\"| CLOVA\n    CLOVA -->|\"추출 텍스트 반환\"| Pipeline\n    Pipeline --> Masking\n    Masking -->|\"마스킹된 텍스트\"| GPT\n    GPT -->|\"분석 결과 반환\"| Pipeline\n    Pipeline -->|\"부동산 정보 조회\"| PublicAPI\n    PublicAPI -->|\"실거래가·건축물 정보\"| Pipeline\n    Pipeline -->|\"결과 저장\"| Database\n    TempStorage -->|\"✅ 분석 완료 후 즉시 삭제\"| TempStorage\n    FastAPI -->|\"분석 결과 응답\"| NextJS\n    NextJS --> UI_Result\n    NextJS --> UI_Tooltip\n    NextJS --> UI_History\n    UI_Result -->|\"결과 확인\"| User\n    UI_History -->|\"DB 조회\"| FastAPI\n```",
      "data": {
        "components": [
          {
            "name": "Next.js 프론트엔드",
            "technology": "Next.js 14 (React, TypeScript) + Tailwind CSS, Vercel 배포",
            "description": "사용자 인터페이스를 담당하는 웹 애플리케이션. 등기부 등본 파일 업로드, 신호등 UI 배지(🟢안전/🟡주의/🔴위험), 법률 용어 툴팁, 분석 결과 화면, 분석 이력 목록을 제공. Vercel에 배포."
          },
          {
            "name": "FastAPI 백엔드 서버",
            "technology": "FastAPI (Python 3.11), Railway 배포",
            "description": "핵심 비즈니스 로직을 처리하는 메인 서버. 파일 수신, OCR 호출, 개인정보 마스킹, GPT 분석 프롬프트 오케스트레이션, 공공 API 연동, 분석 결과 저장·삭제 파이프라인을 순차 처리. Railway에 배포."
          },
          {
            "name": "Naver CLOVA OCR",
            "technology": "Naver CLOVA OCR API (한국어 특화)",
            "description": "사용자가 업로드한 등기부 등본 PDF 및 이미지에서 한국어 텍스트를 추출. OCR 결과 반환 후 백엔드에서 개인정보(이름·주민번호·주소) 패턴을 감지하여 마스킹 처리."
          },
          {
            "name": "AI 분석 엔진 (LLM)",
            "technology": "OpenAI GPT API (최신 버전, 프롬프트 엔지니어링)",
            "description": "마스킹 처리된 등기부 등본 텍스트를 프롬프트 엔지니어링 방식으로 분석. 위험 판단(안전/주의/위험), 금액 수치 해석(근저당권·채권최고액), 권리 관계 분석(가압류·전세권·지상권)을 수행하여 비전문가 친화적 설명 생성. 목표 정확도 90% 이상."
          },
          {
            "name": "공공 데이터 API 연동",
            "technology": "공공데이터포털 REST API (국토교통부 · 법원등기소 · 건축물대장)",
            "description": "분석 대상 부동산의 외부 정보를 자동 수집. 국토교통부 실거래가, 법원 등기소, 건축물 대장 공공 API에서 데이터를 가져와 AI 분석 컨텍스트로 활용. 민간 API는 사용하지 않음."
          },
          {
            "name": "데이터베이스",
            "technology": "SQLite (MVP1) → PostgreSQL (MVP2, Railway 관리형)",
            "description": "원본 파일은 저장하지 않으며, 분석 결과·물건 제목(건물명/동호수)·분석 날짜·위험도 등급·사용자 피드백만 보관. MVP1은 SQLite, MVP2는 PostgreSQL로 마이그레이션."
          },
          {
            "name": "임시 파일 스토리지",
            "technology": "서버 임시 디렉토리 (Railway 인스턴스 로컬) 또는 인메모리 처리",
            "description": "업로드된 등기부 등본 파일을 OCR 처리 완료 전까지만 임시 보관. 분석 파이프라인 완료 즉시 자동 삭제하여 개인정보보호법(PIPA) 준수."
          }
        ],
        "tech_stack": {
          "OCR": "Naver CLOVA OCR API",
          "AI/LLM": "OpenAI GPT API (최신 버전, 프롬프트 엔지니어링)",
          "Backend": "FastAPI (Python 3.11)",
          "Frontend": "Next.js 14 (React + TypeScript) + Tailwind CSS",
          "공공 API": "국토교통부 실거래가 · 법원등기소 · 건축물대장 공공데이터포털",
          "Backend 배포": "Railway",
          "Database (MVP1)": "SQLite",
          "Database (MVP2)": "PostgreSQL (Railway 관리형)",
          "Frontend 배포": "Vercel"
        },
        "integration_notes": "**1. 분석 파이프라인 순서 (중요)**\n파일 수신 → 임시 저장 → CLOVA OCR 텍스트 추출 → 개인정보 마스킹 (정규식 패턴 감지) → 마스킹된 텍스트로 공공 API 부동산 정보 조회 → GPT 프롬프트로 통합 분석 → 결과 DB 저장 → 임시 파일 즉시 삭제. 이 순서를 반드시 지켜야 개인정보보호법(PIPA) 준수 가능.\n\n**2. 개인정보 마스킹**\n백엔드 FastAPI에서 OCR 결과 텍스트에 대해 Python 정규식으로 주민번호 패턴(000000-0000000), 전화번호, 이름(성+이름 패턴) 등을 감지 후 마스킹. 마스킹된 텍스트만 GPT에 전달.\n\n**3. GPT 프롬프트 설계**\n'너는 등기부 등본 전문 분석 AI다. 아래 내용을 바탕으로 ① 안전/주의/위험 판단 ② 위험 이유 쉬운 설명 ③ 주요 권리 관계 요약을 JSON 형태로 반환해라' 형태의 시스템 프롬프트 + 마스킹된 OCR 텍스트 + 공공 API 수집 데이터를 합산하여 단일 API 호출로 처리 권장 (토큰 절약 + 응답 시간 최소화).\n\n**4. 공공 API 연동 시 주의**\n국토교통부·법원등기소·건축물대장 공공 API는 일 요청 제한(Rate Limit)이 있으므로, 백엔드에서 응답 결과를 DB에 캐싱하여 동일 주소 중복 호출 방지.\n\n**5. 처리 시간 60초 이내 목표**\nCLOVA OCR 응답(약 3~10초) + 공공 API 조회(병렬 처리, 약 2~5초) + GPT 응답(약 10~20초) 기준 합산 약 20~35초 예상. 프론트엔드에서 진행 상태 표시(스피너 + 단계별 메시지)로 사용자 체감 대기 시간 완화 권장.\n\n**6. MVP1 → MVP2 마이그레이션**\nSQLite → PostgreSQL 전환 시 SQLAlchemy ORM을 사용하면 DB 변경 시 코드 수정 최소화 가능. Railway에서 PostgreSQL 플러그인 추가로 전환 가능.\n\n**7. 법적 면책 조항**\n모든 분석 결과 응답 JSON에 disclaimer 필드를 포함하여 프론트엔드에서 반드시 렌더링하도록 구조화 권장.",
        "has_mermaid": true
      }
    },
    {
      "id": "data",
      "title": "데이터 구조",
      "kind": "data",
      "status": "complete",
      "content": "**users** — 서비스 이용자 정보 (선택적 회원 기능, 비로그인 세션도 지원)\n\n| 필드 | 타입 | 제약 | 설명 |\n|---|---|---|---|\n| session_id | text | UNIQUE, NOT NULL, INDEX | 비로그인 사용자 세션 식별자 |\n| email | text | UNIQUE, NULLABLE | 회원 이메일 (선택) |\n| nickname | text | NULLABLE | 표시 이름 |\n| is_active | boolean | NOT NULL, DEFAULT true | 계정 활성 여부 |\n\n**analysis_requests** — 등기부 등본 분석 요청 단위. 원본 파일은 저장하지 않으며 처리 상태 및 메타데이터만 보관\n\n| 필드 | 타입 | 제약 | 설명 |\n|---|---|---|---|\n| user_session_id | text | FK(users.session_id), NOT NULL, INDEX | 요청자 세션 식별자 (users.session_id 참조) |\n| property_title | text | NOT NULL | 물건 제목 (건물명/동호수 등 사용자 입력 또는 OCR 추출) |\n| status | text | NOT NULL, DEFAULT 'PENDING', INDEX | 처리 상태 (PENDING, OCR_PROCESSING, AI_ANALYZING, COMPLETED, FAILED) |\n| file_mime_type | text | NULLABLE | 업로드 파일 형식 (application/pdf, image/jpeg 등) |\n| completed_at | timestamp | NULLABLE | 분석 완료 시각 |\n| deleted_at | timestamp | NULLABLE | 소프트 삭제 시각 |\n\n**analysis_results** — AI 분석 완료 결과. 신호등 위험도, 비전문가 설명, 항목별 분석 내용을 보관\n\n| 필드 | 타입 | 제약 | 설명 |\n|---|---|---|---|\n| request_id | uuid | FK(analysis_requests.id), NOT NULL, UNIQUE, INDEX | 분석 요청 식별자 (analysis_requests.id 참조) |\n| risk_level | text | NOT NULL, INDEX | 종합 위험도 등급 (SAFE, CAUTION, DANGER) |\n| summary_text | text | NOT NULL | 비전문가 친화적 종합 요약 설명 |\n| risk_items | jsonb | NOT NULL, DEFAULT '[]' | 위험 항목 목록 [{item, level, plain_description}] |\n| financial_analysis | jsonb | NULLABLE | 금액 수치 해석 결과 (근저당권액, 채권최고액, 실거래가 대비 비율 등) |\n| rights_analysis | jsonb | NULLABLE | 권리 관계 분석 결과 (가압류, 전세권, 지상권 등 목록) |\n| external_data_snapshot | jsonb | NULLABLE | 공공 API 연동 수집 데이터 스냅샷 (실거래가, 건축물대장 등) |\n| gpt_model_version | text | NULLABLE | 분석에 사용된 GPT 모델 버전 |\n\n**legal_terms** — 법률 용어 툴팁 사전. 등기부 등본 내 전문 용어의 쉬운 설명을 관리\n\n| 필드 | 타입 | 제약 | 설명 |\n|---|---|---|---|\n| term | text | NOT NULL, UNIQUE, INDEX | 법률 용어 원문 (예: 근저당권, 가압류) |\n| plain_description | text | NOT NULL | 비전문가용 쉬운 설명 |\n| risk_hint | text | NULLABLE | 위험도 관련 간략 힌트 (예: 이 항목이 있으면 주의가 필요합니다) |\n| category | text | NULLABLE, INDEX | 용어 분류 (권리관계, 금액수치, 소유권 등) |\n\n**user_feedbacks** — 사용자 분석 결과 피드백. 정확도 측정 및 서비스 개선에 활용\n\n| 필드 | 타입 | 제약 | 설명 |\n|---|---|---|---|\n| result_id | uuid | FK(analysis_results.id), NOT NULL, INDEX | 피드백 대상 분석 결과 (analysis_results.id 참조) |\n| session_id | text | NOT NULL | 피드백 제출자 세션 식별자 |\n| is_helpful | boolean | NOT NULL | '도움이 됐나요?' 응답 (true: 도움됨, false: 도움 안됨) |\n| comment | text | NULLABLE | 선택적 추가 의견 |\n\n**관계**\n- users 1--N analysis_requests: 사용자(세션)는 여러 분석 요청을 가질 수 있음\n- analysis_requests 1--1 analysis_results: 분석 요청 1건은 분석 결과 1건을 가짐\n- analysis_results 1--N user_feedbacks: 분석 결과 1건에 피드백이 달릴 수 있음\n- legal_terms N--N analysis_results: 법률 용어 사전은 분석 결과 내 용어 툴팁에 참조됨",
      "data": {
        "entities": [
          {
            "name": "users",
            "description": "서비스 이용자 정보 (선택적 회원 기능, 비로그인 세션도 지원)",
            "fields": [
              {
                "name": "session_id",
                "type": "text",
                "constraints": "UNIQUE, NOT NULL, INDEX",
                "description": "비로그인 사용자 세션 식별자"
              },
              {
                "name": "email",
                "type": "text",
                "constraints": "UNIQUE, NULLABLE",
                "description": "회원 이메일 (선택)"
              },
              {
                "name": "nickname",
                "type": "text",
                "constraints": "NULLABLE",
                "description": "표시 이름"
              },
              {
                "name": "is_active",
                "type": "boolean",
                "constraints": "NOT NULL, DEFAULT true",
                "description": "계정 활성 여부"
              }
            ]
          },
          {
            "name": "analysis_requests",
            "description": "등기부 등본 분석 요청 단위. 원본 파일은 저장하지 않으며 처리 상태 및 메타데이터만 보관",
            "fields": [
              {
                "name": "user_session_id",
                "type": "text",
                "constraints": "FK(users.session_id), NOT NULL, INDEX",
                "description": "요청자 세션 식별자 (users.session_id 참조)"
              },
              {
                "name": "property_title",
                "type": "text",
                "constraints": "NOT NULL",
                "description": "물건 제목 (건물명/동호수 등 사용자 입력 또는 OCR 추출)"
              },
              {
                "name": "status",
                "type": "text",
                "constraints": "NOT NULL, DEFAULT 'PENDING', INDEX",
                "description": "처리 상태 (PENDING, OCR_PROCESSING, AI_ANALYZING, COMPLETED, FAILED)"
              },
              {
                "name": "file_mime_type",
                "type": "text",
                "constraints": "NULLABLE",
                "description": "업로드 파일 형식 (application/pdf, image/jpeg 등)"
              },
              {
                "name": "completed_at",
                "type": "timestamp",
                "constraints": "NULLABLE",
                "description": "분석 완료 시각"
              },
              {
                "name": "deleted_at",
                "type": "timestamp",
                "constraints": "NULLABLE",
                "description": "소프트 삭제 시각"
              }
            ]
          },
          {
            "name": "analysis_results",
            "description": "AI 분석 완료 결과. 신호등 위험도, 비전문가 설명, 항목별 분석 내용을 보관",
            "fields": [
              {
                "name": "request_id",
                "type": "uuid",
                "constraints": "FK(analysis_requests.id), NOT NULL, UNIQUE, INDEX",
                "description": "분석 요청 식별자 (analysis_requests.id 참조)"
              },
              {
                "name": "risk_level",
                "type": "text",
                "constraints": "NOT NULL, INDEX",
                "description": "종합 위험도 등급 (SAFE, CAUTION, DANGER)"
              },
              {
                "name": "summary_text",
                "type": "text",
                "constraints": "NOT NULL",
                "description": "비전문가 친화적 종합 요약 설명"
              },
              {
                "name": "risk_items",
                "type": "jsonb",
                "constraints": "NOT NULL, DEFAULT '[]'",
                "description": "위험 항목 목록 [{item, level, plain_description}]"
              },
              {
                "name": "financial_analysis",
                "type": "jsonb",
                "constraints": "NULLABLE",
                "description": "금액 수치 해석 결과 (근저당권액, 채권최고액, 실거래가 대비 비율 등)"
              },
              {
                "name": "rights_analysis",
                "type": "jsonb",
                "constraints": "NULLABLE",
                "description": "권리 관계 분석 결과 (가압류, 전세권, 지상권 등 목록)"
              },
              {
                "name": "external_data_snapshot",
                "type": "jsonb",
                "constraints": "NULLABLE",
                "description": "공공 API 연동 수집 데이터 스냅샷 (실거래가, 건축물대장 등)"
              },
              {
                "name": "gpt_model_version",
                "type": "text",
                "constraints": "NULLABLE",
                "description": "분석에 사용된 GPT 모델 버전"
              }
            ]
          },
          {
            "name": "legal_terms",
            "description": "법률 용어 툴팁 사전. 등기부 등본 내 전문 용어의 쉬운 설명을 관리",
            "fields": [
              {
                "name": "term",
                "type": "text",
                "constraints": "NOT NULL, UNIQUE, INDEX",
                "description": "법률 용어 원문 (예: 근저당권, 가압류)"
              },
              {
                "name": "plain_description",
                "type": "text",
                "constraints": "NOT NULL",
                "description": "비전문가용 쉬운 설명"
              },
              {
                "name": "risk_hint",
                "type": "text",
                "constraints": "NULLABLE",
                "description": "위험도 관련 간략 힌트 (예: 이 항목이 있으면 주의가 필요합니다)"
              },
              {
                "name": "category",
                "type": "text",
                "constraints": "NULLABLE, INDEX",
                "description": "용어 분류 (권리관계, 금액수치, 소유권 등)"
              }
            ]
          },
          {
            "name": "user_feedbacks",
            "description": "사용자 분석 결과 피드백. 정확도 측정 및 서비스 개선에 활용",
            "fields": [
              {
                "name": "result_id",
                "type": "uuid",
                "constraints": "FK(analysis_results.id), NOT NULL, INDEX",
                "description": "피드백 대상 분석 결과 (analysis_results.id 참조)"
              },
              {
                "name": "session_id",
                "type": "text",
                "constraints": "NOT NULL",
                "description": "피드백 제출자 세션 식별자"
              },
              {
                "name": "is_helpful",
                "type": "boolean",
                "constraints": "NOT NULL",
                "description": "'도움이 됐나요?' 응답 (true: 도움됨, false: 도움 안됨)"
              },
              {
                "name": "comment",
                "type": "text",
                "constraints": "NULLABLE",
                "description": "선택적 추가 의견"
              }
            ]
          }
        ],
        "relationships": [
          "users 1--N analysis_requests: 사용자(세션)는 여러 분석 요청을 가질 수 있음",
          "analysis_requests 1--1 analysis_results: 분석 요청 1건은 분석 결과 1건을 가짐",
          "analysis_results 1--N user_feedbacks: 분석 결과 1건에 피드백이 달릴 수 있음",
          "legal_terms N--N analysis_results: 법률 용어 사전은 분석 결과 내 용어 툴팁에 참조됨"
        ]
      }
    },
    {
      "id": "ai",
      "title": "AI 흐름",
      "kind": "ai",
      "status": "complete",
      "content": "사용자가 업로드한 등기부 등본을 OCR로 텍스트 추출한 뒤, 개인정보 마스킹 처리된 내용을 OpenAI GPT에 프롬프트 엔지니어링 방식으로 전달하여 위험 판단·금액 수치 해석·권리 관계 분석을 수행한다. 공공 API에서 수집한 실거래가·건축물 대장 정보를 분석 컨텍스트로 함께 활용하며, 결과는 신호등 UI(🟢안전/🟡주의/🔴위험)와 비전문가 친화적 설명으로 제공된다.\n\n**모델**: OpenAI GPT · **작업**: 등기부 등본 위험도 분석 및 설명 생성\n\n**입력**\n- 마스킹된 등기부 등본 텍스트: CLOVA OCR로 추출 후 이름·주민번호·주소 등 개인식별정보가 마스킹 처리된 등기부 등본 전문 텍스트\n- 공공 API 부동산 정보: 국토교통부 실거래가·법원 등기소·건축물 대장에서 수집한 해당 부동산의 외부 정보\n- 분석 요청 메타데이터: 물건 제목(건물명/동호수), 분석 요청 시각 등 분석 컨텍스트 식별에 필요한 기본 정보\n\n**출력**\n- 위험도 등급: 분석 결과를 안전·주의·위험 세 단계로 분류한 신호등 판정값 (문자열 (SAFE | CAUTION | DANGER))\n- 비전문가 친화적 종합 설명: 법률 용어 없이 일반인이 이해할 수 있는 언어로 작성된 분석 요약 및 주의사항 (텍스트)\n- 항목별 상세 분석 결과: 위험 판단 근거·금액 수치 해석(근저당권·채권최고액)·권리 관계 분석(가압류·전세권·지상권)을 항목별로 정리한 구조화 데이터 (JSON)\n\n**폴백 전략**\n- GPT API 응답 지연 또는 타임아웃 (처리 시간 60초 초과) → 사용자에게 처리 지연 안내 메시지를 표시하고, 백엔드에서 자동 1회 재시도 후 실패 시 '잠시 후 다시 시도해주세요' 오류 화면으로 전환\n- GPT 응답이 위험도 등급·항목별 분석 JSON 형식에 맞지 않거나 파싱 실패 → 응답 파싱 오류로 처리하고, '분석 결과를 생성하지 못했습니다. 다시 시도해주세요'를 사용자에게 안내하며 원본 파일은 즉시 삭제\n- 공공 API(국토교통부·법원 등기소·건축물 대장) 연동 실패 또는 데이터 미조회 → 공공 데이터 없이 등기부 등본 텍스트만으로 분석을 진행하고, 결과 화면에 '일부 외부 정보를 가져오지 못해 등기부 등본 내용만으로 분석했습니다'를 안내\n- OCR 텍스트 추출 결과가 너무 짧거나 비어있어 분석 불가 판정 → 사용자에게 '문서 인식에 실패했습니다. 선명한 이미지나 PDF로 다시 업로드해주세요'를 안내하고 임시 파일 즉시 삭제\n\n**모니터링**\n- AI 분석 정확도 — 위험 판단·금액 수치 해석·권리 관계 분석 각 항목별 90% 이상 유지 여부 (테스트셋 정기 평가 + 사용자 '도움이 됐나요?' 피드백 기반 추적)\n- GPT API 응답 시간 — 전체 파이프라인(업로드→OCR→마스킹→GPT 분석→결과 반환) 60초 이내 처리율\n- 분석 실패율 — GPT 파싱 오류·타임아웃·공공 API 연동 실패 등 폴백 발생 비율\n- 개인정보 마스킹 처리율 — OCR 결과 내 개인식별정보(이름·주민번호·주소) 감지 및 마스킹 적용 성공률",
      "data": {
        "summary": "사용자가 업로드한 등기부 등본을 OCR로 텍스트 추출한 뒤, 개인정보 마스킹 처리된 내용을 OpenAI GPT에 프롬프트 엔지니어링 방식으로 전달하여 위험 판단·금액 수치 해석·권리 관계 분석을 수행한다. 공공 API에서 수집한 실거래가·건축물 대장 정보를 분석 컨텍스트로 함께 활용하며, 결과는 신호등 UI(🟢안전/🟡주의/🔴위험)와 비전문가 친화적 설명으로 제공된다.",
        "model": "OpenAI GPT",
        "model_version": "",
        "task": "등기부 등본 위험도 분석 및 설명 생성",
        "inputs": [
          {
            "name": "마스킹된 등기부 등본 텍스트",
            "description": "CLOVA OCR로 추출 후 이름·주민번호·주소 등 개인식별정보가 마스킹 처리된 등기부 등본 전문 텍스트"
          },
          {
            "name": "공공 API 부동산 정보",
            "description": "국토교통부 실거래가·법원 등기소·건축물 대장에서 수집한 해당 부동산의 외부 정보"
          },
          {
            "name": "분석 요청 메타데이터",
            "description": "물건 제목(건물명/동호수), 분석 요청 시각 등 분석 컨텍스트 식별에 필요한 기본 정보"
          }
        ],
        "outputs": [
          {
            "name": "위험도 등급",
            "description": "분석 결과를 안전·주의·위험 세 단계로 분류한 신호등 판정값",
            "format": "문자열 (SAFE | CAUTION | DANGER)"
          },
          {
            "name": "비전문가 친화적 종합 설명",
            "description": "법률 용어 없이 일반인이 이해할 수 있는 언어로 작성된 분석 요약 및 주의사항",
            "format": "텍스트"
          },
          {
            "name": "항목별 상세 분석 결과",
            "description": "위험 판단 근거·금액 수치 해석(근저당권·채권최고액)·권리 관계 분석(가압류·전세권·지상권)을 항목별로 정리한 구조화 데이터",
            "format": "JSON"
          }
        ],
        "fallbacks": [
          {
            "condition": "GPT API 응답 지연 또는 타임아웃 (처리 시간 60초 초과)",
            "action": "사용자에게 처리 지연 안내 메시지를 표시하고, 백엔드에서 자동 1회 재시도 후 실패 시 '잠시 후 다시 시도해주세요' 오류 화면으로 전환"
          },
          {
            "condition": "GPT 응답이 위험도 등급·항목별 분석 JSON 형식에 맞지 않거나 파싱 실패",
            "action": "응답 파싱 오류로 처리하고, '분석 결과를 생성하지 못했습니다. 다시 시도해주세요'를 사용자에게 안내하며 원본 파일은 즉시 삭제"
          },
          {
            "condition": "공공 API(국토교통부·법원 등기소·건축물 대장) 연동 실패 또는 데이터 미조회",
            "action": "공공 데이터 없이 등기부 등본 텍스트만으로 분석을 진행하고, 결과 화면에 '일부 외부 정보를 가져오지 못해 등기부 등본 내용만으로 분석했습니다'를 안내"
          },
          {
            "condition": "OCR 텍스트 추출 결과가 너무 짧거나 비어있어 분석 불가 판정",
            "action": "사용자에게 '문서 인식에 실패했습니다. 선명한 이미지나 PDF로 다시 업로드해주세요'를 안내하고 임시 파일 즉시 삭제"
          }
        ],
        "monitoring": [
          "AI 분석 정확도 — 위험 판단·금액 수치 해석·권리 관계 분석 각 항목별 90% 이상 유지 여부 (테스트셋 정기 평가 + 사용자 '도움이 됐나요?' 피드백 기반 추적)",
          "GPT API 응답 시간 — 전체 파이프라인(업로드→OCR→마스킹→GPT 분석→결과 반환) 60초 이내 처리율",
          "분석 실패율 — GPT 파싱 오류·타임아웃·공공 API 연동 실패 등 폴백 발생 비율",
          "개인정보 마스킹 처리율 — OCR 결과 내 개인식별정보(이름·주민번호·주소) 감지 및 마스킹 적용 성공률"
        ]
      }
    },
    {
      "id": "evaluation",
      "title": "정직한 평가",
      "kind": "evaluation",
      "status": "complete",
      "content": "**종합 판정**: yellow\n\n> 핵심 가치(비전문가 친화적 위험 판단)와 시장 수요는 탄탄하며 AI 활용도 적절하다. 다만 MVP 완성도 리스크를 줄이려면 공공 API 연동 범위를 1종으로 줄이고 OCR + GPT 분석 파이프라인 안정화에 집중하는 것이 현실적이다. 보안 측면에서 비로그인 세션의 결과 접근 제어를 초기 설계에 포함시키면 개인정보 관련 법적 리스크를 미리 차단할 수 있다.\n\n- 🟢 **차별화** (8/10) — 등기부 등본을 비전문가도 이해할 수 있도록 신호등 UI + 쉬운 언어로 풀어주는 방식은 명확한 Pain Point를 해결하며, '24/7 무료 접근 + 즉시 판단'이라는 조합은 공인중개사 상담이나 단순 용어 검색과 구분되는 실질적 가치를 제공한다.\n- 🟢 **AI 적절성** (7/10) — 등기부 등본은 문서 구조가 정형적이라 규칙 기반으로도 일부 처리 가능하지만, '비전문가 친화적 자연어 설명'과 '복합 권리 관계의 맥락 해석'은 GPT 프롬프트 엔지니어링이 실질적으로 필요한 영역이므로 AI 활용이 적절하다. 단, 금액 수치나 단순 권리 종류 추출 같은 항목은 규칙 기반 파싱을 병행하면 90% 정확도 목표 달성이 더 안정적이다.\n- 🟢 **시장 유효성** (9/10) — 전세 사기 이슈가 사회적으로 지속되고 있어 6개월 뒤에도 수요가 유지될 가능성이 높으며, 타깃 사용자(계약 앞둔 일반인)는 명확하고 실제 행동(계약 결정)과 직결된 니즈를 가지고 있어 이탈률이 낮을 것으로 예상된다.\n- 🟡 **완성도 기대치** (5/10) — 공공 API 3종 연동(법원 등기소·국토교통부·건축물 대장)은 각각 인증키 발급 절차와 응답 구조가 달라 예상보다 시간이 소요되며, OCR 저화질 대응과 GPT 프롬프트 안정화까지 합치면 MVP 범위가 과할 수 있다. 초기에는 공공 API 연동을 1종(실거래가)으로 줄이고, 나머지는 MVP2로 미루는 방식으로 범위를 조정하면 동작하는 데모를 더 빠르게 만들 수 있다.\n- 🟡 **보안 적절성** (6/10) — 개인정보 마스킹과 원본 즉시 삭제 정책은 잘 설계됐으나, 비로그인 세션 지원 시 '누가 어떤 분석 결과를 볼 수 있는가'에 대한 접근 제어가 명확하지 않다. 세션 토큰 기반으로 분석 결과 조회를 본인만 가능하도록 제한하고, 업로드 파일 크기·형식 검증 및 서버 사이드 파일 처리 격리를 MVP 단계부터 적용하는 것을 권장한다.",
      "data": {
        "overall_level": "yellow",
        "recommendation": "핵심 가치(비전문가 친화적 위험 판단)와 시장 수요는 탄탄하며 AI 활용도 적절하다. 다만 MVP 완성도 리스크를 줄이려면 공공 API 연동 범위를 1종으로 줄이고 OCR + GPT 분석 파이프라인 안정화에 집중하는 것이 현실적이다. 보안 측면에서 비로그인 세션의 결과 접근 제어를 초기 설계에 포함시키면 개인정보 관련 법적 리스크를 미리 차단할 수 있다.",
        "dimensions": [
          {
            "name": "차별화",
            "level": "green",
            "score": 8,
            "comment": "등기부 등본을 비전문가도 이해할 수 있도록 신호등 UI + 쉬운 언어로 풀어주는 방식은 명확한 Pain Point를 해결하며, '24/7 무료 접근 + 즉시 판단'이라는 조합은 공인중개사 상담이나 단순 용어 검색과 구분되는 실질적 가치를 제공한다."
          },
          {
            "name": "AI 적절성",
            "level": "green",
            "score": 7,
            "comment": "등기부 등본은 문서 구조가 정형적이라 규칙 기반으로도 일부 처리 가능하지만, '비전문가 친화적 자연어 설명'과 '복합 권리 관계의 맥락 해석'은 GPT 프롬프트 엔지니어링이 실질적으로 필요한 영역이므로 AI 활용이 적절하다. 단, 금액 수치나 단순 권리 종류 추출 같은 항목은 규칙 기반 파싱을 병행하면 90% 정확도 목표 달성이 더 안정적이다."
          },
          {
            "name": "시장 유효성",
            "level": "green",
            "score": 9,
            "comment": "전세 사기 이슈가 사회적으로 지속되고 있어 6개월 뒤에도 수요가 유지될 가능성이 높으며, 타깃 사용자(계약 앞둔 일반인)는 명확하고 실제 행동(계약 결정)과 직결된 니즈를 가지고 있어 이탈률이 낮을 것으로 예상된다."
          },
          {
            "name": "완성도 기대치",
            "level": "yellow",
            "score": 5,
            "comment": "공공 API 3종 연동(법원 등기소·국토교통부·건축물 대장)은 각각 인증키 발급 절차와 응답 구조가 달라 예상보다 시간이 소요되며, OCR 저화질 대응과 GPT 프롬프트 안정화까지 합치면 MVP 범위가 과할 수 있다. 초기에는 공공 API 연동을 1종(실거래가)으로 줄이고, 나머지는 MVP2로 미루는 방식으로 범위를 조정하면 동작하는 데모를 더 빠르게 만들 수 있다."
          },
          {
            "name": "보안 적절성",
            "level": "yellow",
            "score": 6,
            "comment": "개인정보 마스킹과 원본 즉시 삭제 정책은 잘 설계됐으나, 비로그인 세션 지원 시 '누가 어떤 분석 결과를 볼 수 있는가'에 대한 접근 제어가 명확하지 않다. 세션 토큰 기반으로 분석 결과 조회를 본인만 가능하도록 제한하고, 업로드 파일 크기·형식 검증 및 서버 사이드 파일 처리 격리를 MVP 단계부터 적용하는 것을 권장한다."
          }
        ]
      }
    },
    {
      "id": "dod",
      "title": "완료 조건",
      "kind": "dod",
      "status": "complete",
      "content": "**완료 조건 (DoD)**\n\n- `기능 동작` PDF 또는 이미지 형식의 등기부 등본을 업로드하면, Naver CLOVA OCR이 텍스트를 추출하고, GPT 분석을 거쳐 🟢안전/🟡주의/🔴위험 신호등 배지와 함께 결과 화면이 정상적으로 표시된다 *(측정가능)*\n- `기능 동작` 분석 결과 화면에서 '근저당권', '가압류', '전세권', '지상권' 중 최소 4개 법률 용어에 마우스 오버(또는 터치) 시 쉬운 설명 툴팁이 나타난다 *(측정가능)*\n- `기능 동작` OCR 처리 단계에서 등기부 등본 내 이름, 주민번호, 주소가 자동으로 감지되어 마스킹(예: 홍*동, ***-******, ****)된 상태로 분석에 사용되며, 원본 파일은 분석 완료 즉시 서버에서 삭제된다 *(측정가능)*\n- `기능 동작` 비로그인 세션 사용자가 타인의 분석 결과 URL에 직접 접근할 경우 결과가 표시되지 않고, 본인 세션으로 요청한 분석 결과만 조회 가능하다 *(측정가능)*\n- `기능 동작` 공공 API(국토교통부 실거래가) 1종 이상과 연동되어, 분석 대상 부동산의 외부 정보가 AI 분석 결과 화면에 함께 표시된다 *(측정가능)*\n- `품질 기준` 정답이 알려진 등기부 등본 테스트 샘플 10건 이상으로 검증했을 때, 위험 판단·금액 수치 해석·권리 관계 분석 각 항목의 정확도가 90% 이상이다 *(측정가능)*\n- `품질 기준` 분석 결과 화면 어딘가에 'AI 분석 결과는 참고용이며 법적 효력이 없습니다'라는 문구가 반드시 포함되어 있다 *(측정가능)*\n- `문서화` README에 프로젝트 설명, 로컬 실행 방법(환경변수 포함), Naver CLOVA OCR API 키·OpenAI API 키·공공 API 키 발급 방법이 포함되어 있다 *(측정가능)*\n- `문서화` 서비스 내 개인정보 처리 방침 페이지(또는 모달)가 존재하며, 원본 파일 즉시 삭제 정책과 보관 데이터 범위(분석 결과·물건 제목·분석 날짜)가 명시되어 있다 *(측정가능)*\n\n**빈틈 점검**\n\n- 🔴 **누락** — 공공 API(국토교통부, 법원 등기소, 건축물 대장) 호출이 실패하거나 응답이 없을 때 어떻게 처리할지 정의되지 않았습니다. 공공 API는 점검·장애가 잦아 실제 서비스에서 자주 발생하는 문제입니다.\n  - 제안: 공공 API 호출 실패 시 '외부 데이터를 가져오지 못했습니다. 등기부 등본 내용만으로 분석합니다'와 같이 OCR+GPT 분석만으로 결과를 제공하는 폴백 전략을 명확히 정의하세요.\n- 🔴 **누락** — OCR 인식 실패(저화질, 손상 파일 등) 시 사용자에게 어떻게 안내하고 어떤 조치를 취할지 정의되지 않았습니다. OCR 저화질 대응이 기술 리스크 1순위로 꼽혔음에도 대응 방안이 없습니다.\n  - 제안: OCR 신뢰도 점수가 일정 기준(예: 70%) 미만이면 '문서 품질이 낮아 정확한 분석이 어렵습니다. 더 선명한 이미지로 다시 업로드해 주세요'라는 안내 메시지를 표시하는 로직을 설계에 추가하세요.\n- 🔴 **누락** — GPT API 호출 실패(타임아웃, 과부하, 오류 응답) 시 처리 방안이 없습니다. 60초 이내 처리 목표(SHOULD 요구사항)가 있지만, GPT 응답 지연으로 이를 초과할 경우 어떻게 되는지 정의되지 않았습니다.\n  - 제안: GPT 호출 타임아웃 기준(예: 30초)을 설정하고, 실패 시 사용자에게 '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요'를 안내하고 업로드 파일을 즉시 삭제하는 절차를 명시하세요.\n- 🔴 **확인필요** — 평가 단계에서 '공공 API 연동을 1종(실거래가)으로 줄이라'고 권고했고, 완료 조건에도 '1종 이상'으로 반영됐습니다. 그러나 요구사항([MUST])에는 '법원 등기소, 국토교통부 실거래가, 건축물 대장 3종 모두 연동'으로 명시되어 있어 서로 충돌합니다.\n  - 제안: MVP에서 공공 API를 몇 종 연동할지 명확히 결정해야 합니다. 평가 권고대로 1종(실거래가)만 MVP에 포함하고 나머지는 MVP2로 미루거나, 3종 모두 MVP에 포함할 것인지 확정하세요.\n- 🔴 **누락** — 공공 API에서 부동산 정보를 가져오려면 주소나 고유 부동산 번호가 필요한데, OCR로 추출한 등기부 등본 텍스트에서 이 식별 정보를 어떻게 파싱해서 API 쿼리에 사용할지 흐름이 정의되지 않았습니다. 특히 개인정보 마스킹 단계에서 주소를 마스킹하면 공공 API 조회에 필요한 주소 정보도 함께 사라질 수 있습니다.\n  - 제안: 주소를 마스킹하기 전에 공공 API 조회용 부동산 식별 정보(주소, 지번, 고유번호)를 먼저 추출·저장하는 단계를 파이프라인에 명시적으로 추가하세요. 마스킹 대상 범위에서 건물 주소를 어떻게 처리할지도 명확히 정의하세요.\n- 🟡 **누락** — 임시 파일 스토리지로 'Railway 인스턴스 로컬 디렉토리'를 사용한다고 명시됐는데, Railway는 인스턴스 재시작 시 로컬 파일이 사라지는 Ephemeral Storage 환경입니다. OCR 처리 중 인스턴스가 재시작되면 파일이 유실될 수 있습니다.\n  - 제안: 업로드 파일을 인메모리(메모리 버퍼)로 처리하거나, OCR 호출이 완료될 때까지만 유지되는 방식으로 파이프라인을 설계하세요. Railway 로컬 디렉토리에 의존하는 방식은 피하는 것이 좋습니다.\n- 🟡 **확인필요** — 비로그인 세션 사용자의 분석 결과 접근 제어가 완료 조건에는 포함됐지만, 데이터 모델의 users 테이블과 analysis_requests 테이블 간 비로그인 세션을 어떻게 연결할지 구체적인 방식이 설계에 없습니다.\n  - 제안: 비로그인 사용자에게 업로드 시 고유 세션 토큰(UUID)을 발급하고, 분석 결과 조회 시 해당 토큰을 검증하는 방식을 데이터 모델과 아키텍처에 명시하세요. 세션 토큰의 유효 기간도 정의가 필요합니다.\n- 🟡 **확인필요** — '정확도 90% 이상'이 완료 조건에서 '테스트 샘플 10건 이상'으로 측정한다고 명시됐는데, 10건 샘플은 통계적으로 90% 정확도를 신뢰하기 어렵습니다(10건 중 1건만 틀려도 90%). 또한 이 테스트셋을 누가 어떻게 구축할지 계획이 없습니다.\n  - 제안: MVP 단계에서 현실적인 테스트셋 규모(최소 30~50건 권장)와 구축 방법(공공 데이터 AI Hub 활용 등)을 미리 계획하세요. 10건은 개발 중 기본 동작 확인용으로만 사용하고, 정식 정확도 측정은 더 많은 샘플로 진행한다고 조건을 분리하는 것이 현실적입니다.\n- 🟢 **누락** — 동일한 등기부 등본을 중복 업로드하거나, 등기부 등본이 아닌 전혀 다른 문서(예: 계약서, 사진)를 업로드했을 때 어떻게 처리할지 정의되지 않았습니다.\n  - 제안: 파일 형식 검증(PDF/이미지 확인) 외에, OCR 결과에서 등기부 등본 특유의 키워드(예: '갑구', '을구', '표제부')가 없을 경우 '등기부 등본이 아닌 문서입니다'라는 안내를 제공하는 기본 검증 로직을 추가하세요.\n\n**착수 체크리스트**\n\n- [ ] `환경 설정` Python 3.11 설치 및 가상환경(venv 또는 conda) 생성\n- [ ] `환경 설정` Node.js 20 LTS 설치 및 Next.js 14 프로젝트 초기화 (npx create-next-app@14)\n- [ ] `환경 설정` .env 파일 템플릿 생성 — 아래 변수 목록 포함: OPENAI_API_KEY, NAVER_CLOVA_OCR_API_KEY, NAVER_CLOVA_OCR_INVOKE_URL, PUBLIC_DATA_API_KEY (국토교통부), SESSION_SECRET_KEY, DATABASE_URL\n- [ ] `데이터·접근` 공공데이터포털(data.go.kr) 회원가입 후 국토교통부 실거래가 API 활용 신청 및 인증키 발급 (MVP1 우선, 나머지 2종은 MVP2용으로 별도 메모)\n- [ ] `데이터·접근` SQLite 데이터베이스 파일 생성 및 5개 테이블 초기 스키마 적용 (users, analysis_requests, analysis_results, legal_terms, user_feedbacks)\n- [ ] `데이터·접근` 법률 용어 툴팁 사전 초기 데이터 준비 — 근저당권, 가압류, 전세권, 지상권, 채권최고액 최소 5개 용어의 쉬운 설명 작성 후 legal_terms 테이블에 입력\n- [ ] `외부 서비스` Naver Cloud Platform 가입 후 CLOVA OCR 서비스 생성 — API Gateway 도메인(Invoke URL)과 Secret Key 발급, 무료 크레딧 한도 확인\n- [ ] `외부 서비스` OpenAI 계정에서 API 키 발급 — GPT-4o 모델 접근 가능 여부 확인 및 월 사용 한도(Usage Limit) 설정 (예상치 못한 과금 방지)\n- [ ] `외부 서비스` Vercel 계정 생성 및 GitHub 연동 — Next.js 프론트엔드 배포용 프로젝트 미리 생성, Railway 계정 생성 및 FastAPI 백엔드 서비스 슬롯 준비\n- [ ] `프로젝트 구조` 백엔드 폴더 구조 생성 및 requirements.txt 작성 — fastapi, uvicorn, python-multipart, openai, httpx, python-dotenv, pillow 포함\n- [ ] `프로젝트 구조` 업로드 파일을 인메모리(메모리 버퍼)로만 처리하는 파이프라인 구조 설계 — Railway 로컬 디렉토리 의존 없이 OCR 호출 완료 즉시 메모리에서 삭제되도록 흐름 문서화 (빈틈 점검 반영)\n- [ ] `첫 단계` 파이프라인 핵심 뼈대 구현 — ① 파일 업로드 수신 → ② 주소/고유번호 먼저 추출(마스킹 전) → ③ 개인정보 마스킹 → ④ CLOVA OCR 호출 → ⑤ GPT 분석 요청 → ⑥ 신호등 결과 반환까지 이어지는 FastAPI 엔드포인트 1개를 더미 응답 포함하여 동작 확인 (빈틈 점검의 주소 추출 순서 반영)",
      "data": {
        "criteria": [
          {
            "category": "기능 동작",
            "text": "PDF 또는 이미지 형식의 등기부 등본을 업로드하면, Naver CLOVA OCR이 텍스트를 추출하고, GPT 분석을 거쳐 🟢안전/🟡주의/🔴위험 신호등 배지와 함께 결과 화면이 정상적으로 표시된다",
            "measurable": true
          },
          {
            "category": "기능 동작",
            "text": "분석 결과 화면에서 '근저당권', '가압류', '전세권', '지상권' 중 최소 4개 법률 용어에 마우스 오버(또는 터치) 시 쉬운 설명 툴팁이 나타난다",
            "measurable": true
          },
          {
            "category": "기능 동작",
            "text": "OCR 처리 단계에서 등기부 등본 내 이름, 주민번호, 주소가 자동으로 감지되어 마스킹(예: 홍*동, ***-******, ****)된 상태로 분석에 사용되며, 원본 파일은 분석 완료 즉시 서버에서 삭제된다",
            "measurable": true
          },
          {
            "category": "기능 동작",
            "text": "비로그인 세션 사용자가 타인의 분석 결과 URL에 직접 접근할 경우 결과가 표시되지 않고, 본인 세션으로 요청한 분석 결과만 조회 가능하다",
            "measurable": true
          },
          {
            "category": "기능 동작",
            "text": "공공 API(국토교통부 실거래가) 1종 이상과 연동되어, 분석 대상 부동산의 외부 정보가 AI 분석 결과 화면에 함께 표시된다",
            "measurable": true
          },
          {
            "category": "품질 기준",
            "text": "정답이 알려진 등기부 등본 테스트 샘플 10건 이상으로 검증했을 때, 위험 판단·금액 수치 해석·권리 관계 분석 각 항목의 정확도가 90% 이상이다",
            "measurable": true
          },
          {
            "category": "품질 기준",
            "text": "분석 결과 화면 어딘가에 'AI 분석 결과는 참고용이며 법적 효력이 없습니다'라는 문구가 반드시 포함되어 있다",
            "measurable": true
          },
          {
            "category": "문서화",
            "text": "README에 프로젝트 설명, 로컬 실행 방법(환경변수 포함), Naver CLOVA OCR API 키·OpenAI API 키·공공 API 키 발급 방법이 포함되어 있다",
            "measurable": true
          },
          {
            "category": "문서화",
            "text": "서비스 내 개인정보 처리 방침 페이지(또는 모달)가 존재하며, 원본 파일 즉시 삭제 정책과 보관 데이터 범위(분석 결과·물건 제목·분석 날짜)가 명시되어 있다",
            "measurable": true
          }
        ],
        "gaps": [
          {
            "severity": "high",
            "type": "누락",
            "issue": "공공 API(국토교통부, 법원 등기소, 건축물 대장) 호출이 실패하거나 응답이 없을 때 어떻게 처리할지 정의되지 않았습니다. 공공 API는 점검·장애가 잦아 실제 서비스에서 자주 발생하는 문제입니다.",
            "suggestion": "공공 API 호출 실패 시 '외부 데이터를 가져오지 못했습니다. 등기부 등본 내용만으로 분석합니다'와 같이 OCR+GPT 분석만으로 결과를 제공하는 폴백 전략을 명확히 정의하세요."
          },
          {
            "severity": "high",
            "type": "누락",
            "issue": "OCR 인식 실패(저화질, 손상 파일 등) 시 사용자에게 어떻게 안내하고 어떤 조치를 취할지 정의되지 않았습니다. OCR 저화질 대응이 기술 리스크 1순위로 꼽혔음에도 대응 방안이 없습니다.",
            "suggestion": "OCR 신뢰도 점수가 일정 기준(예: 70%) 미만이면 '문서 품질이 낮아 정확한 분석이 어렵습니다. 더 선명한 이미지로 다시 업로드해 주세요'라는 안내 메시지를 표시하는 로직을 설계에 추가하세요."
          },
          {
            "severity": "high",
            "type": "누락",
            "issue": "GPT API 호출 실패(타임아웃, 과부하, 오류 응답) 시 처리 방안이 없습니다. 60초 이내 처리 목표(SHOULD 요구사항)가 있지만, GPT 응답 지연으로 이를 초과할 경우 어떻게 되는지 정의되지 않았습니다.",
            "suggestion": "GPT 호출 타임아웃 기준(예: 30초)을 설정하고, 실패 시 사용자에게 '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요'를 안내하고 업로드 파일을 즉시 삭제하는 절차를 명시하세요."
          },
          {
            "severity": "high",
            "type": "확인필요",
            "issue": "평가 단계에서 '공공 API 연동을 1종(실거래가)으로 줄이라'고 권고했고, 완료 조건에도 '1종 이상'으로 반영됐습니다. 그러나 요구사항([MUST])에는 '법원 등기소, 국토교통부 실거래가, 건축물 대장 3종 모두 연동'으로 명시되어 있어 서로 충돌합니다.",
            "suggestion": "MVP에서 공공 API를 몇 종 연동할지 명확히 결정해야 합니다. 평가 권고대로 1종(실거래가)만 MVP에 포함하고 나머지는 MVP2로 미루거나, 3종 모두 MVP에 포함할 것인지 확정하세요."
          },
          {
            "severity": "high",
            "type": "누락",
            "issue": "공공 API에서 부동산 정보를 가져오려면 주소나 고유 부동산 번호가 필요한데, OCR로 추출한 등기부 등본 텍스트에서 이 식별 정보를 어떻게 파싱해서 API 쿼리에 사용할지 흐름이 정의되지 않았습니다. 특히 개인정보 마스킹 단계에서 주소를 마스킹하면 공공 API 조회에 필요한 주소 정보도 함께 사라질 수 있습니다.",
            "suggestion": "주소를 마스킹하기 전에 공공 API 조회용 부동산 식별 정보(주소, 지번, 고유번호)를 먼저 추출·저장하는 단계를 파이프라인에 명시적으로 추가하세요. 마스킹 대상 범위에서 건물 주소를 어떻게 처리할지도 명확히 정의하세요."
          },
          {
            "severity": "medium",
            "type": "누락",
            "issue": "임시 파일 스토리지로 'Railway 인스턴스 로컬 디렉토리'를 사용한다고 명시됐는데, Railway는 인스턴스 재시작 시 로컬 파일이 사라지는 Ephemeral Storage 환경입니다. OCR 처리 중 인스턴스가 재시작되면 파일이 유실될 수 있습니다.",
            "suggestion": "업로드 파일을 인메모리(메모리 버퍼)로 처리하거나, OCR 호출이 완료될 때까지만 유지되는 방식으로 파이프라인을 설계하세요. Railway 로컬 디렉토리에 의존하는 방식은 피하는 것이 좋습니다."
          },
          {
            "severity": "medium",
            "type": "확인필요",
            "issue": "비로그인 세션 사용자의 분석 결과 접근 제어가 완료 조건에는 포함됐지만, 데이터 모델의 users 테이블과 analysis_requests 테이블 간 비로그인 세션을 어떻게 연결할지 구체적인 방식이 설계에 없습니다.",
            "suggestion": "비로그인 사용자에게 업로드 시 고유 세션 토큰(UUID)을 발급하고, 분석 결과 조회 시 해당 토큰을 검증하는 방식을 데이터 모델과 아키텍처에 명시하세요. 세션 토큰의 유효 기간도 정의가 필요합니다."
          },
          {
            "severity": "medium",
            "type": "확인필요",
            "issue": "'정확도 90% 이상'이 완료 조건에서 '테스트 샘플 10건 이상'으로 측정한다고 명시됐는데, 10건 샘플은 통계적으로 90% 정확도를 신뢰하기 어렵습니다(10건 중 1건만 틀려도 90%). 또한 이 테스트셋을 누가 어떻게 구축할지 계획이 없습니다.",
            "suggestion": "MVP 단계에서 현실적인 테스트셋 규모(최소 30~50건 권장)와 구축 방법(공공 데이터 AI Hub 활용 등)을 미리 계획하세요. 10건은 개발 중 기본 동작 확인용으로만 사용하고, 정식 정확도 측정은 더 많은 샘플로 진행한다고 조건을 분리하는 것이 현실적입니다."
          },
          {
            "severity": "low",
            "type": "누락",
            "issue": "동일한 등기부 등본을 중복 업로드하거나, 등기부 등본이 아닌 전혀 다른 문서(예: 계약서, 사진)를 업로드했을 때 어떻게 처리할지 정의되지 않았습니다.",
            "suggestion": "파일 형식 검증(PDF/이미지 확인) 외에, OCR 결과에서 등기부 등본 특유의 키워드(예: '갑구', '을구', '표제부')가 없을 경우 '등기부 등본이 아닌 문서입니다'라는 안내를 제공하는 기본 검증 로직을 추가하세요."
          }
        ],
        "checklist": [
          {
            "area": "환경 설정",
            "task": "Python 3.11 설치 및 가상환경(venv 또는 conda) 생성",
            "done": false
          },
          {
            "area": "환경 설정",
            "task": "Node.js 20 LTS 설치 및 Next.js 14 프로젝트 초기화 (npx create-next-app@14)",
            "done": false
          },
          {
            "area": "환경 설정",
            "task": ".env 파일 템플릿 생성 — 아래 변수 목록 포함: OPENAI_API_KEY, NAVER_CLOVA_OCR_API_KEY, NAVER_CLOVA_OCR_INVOKE_URL, PUBLIC_DATA_API_KEY (국토교통부), SESSION_SECRET_KEY, DATABASE_URL",
            "done": false
          },
          {
            "area": "데이터·접근",
            "task": "공공데이터포털(data.go.kr) 회원가입 후 국토교통부 실거래가 API 활용 신청 및 인증키 발급 (MVP1 우선, 나머지 2종은 MVP2용으로 별도 메모)",
            "done": false
          },
          {
            "area": "데이터·접근",
            "task": "SQLite 데이터베이스 파일 생성 및 5개 테이블 초기 스키마 적용 (users, analysis_requests, analysis_results, legal_terms, user_feedbacks)",
            "done": false
          },
          {
            "area": "데이터·접근",
            "task": "법률 용어 툴팁 사전 초기 데이터 준비 — 근저당권, 가압류, 전세권, 지상권, 채권최고액 최소 5개 용어의 쉬운 설명 작성 후 legal_terms 테이블에 입력",
            "done": false
          },
          {
            "area": "외부 서비스",
            "task": "Naver Cloud Platform 가입 후 CLOVA OCR 서비스 생성 — API Gateway 도메인(Invoke URL)과 Secret Key 발급, 무료 크레딧 한도 확인",
            "done": false
          },
          {
            "area": "외부 서비스",
            "task": "OpenAI 계정에서 API 키 발급 — GPT-4o 모델 접근 가능 여부 확인 및 월 사용 한도(Usage Limit) 설정 (예상치 못한 과금 방지)",
            "done": false
          },
          {
            "area": "외부 서비스",
            "task": "Vercel 계정 생성 및 GitHub 연동 — Next.js 프론트엔드 배포용 프로젝트 미리 생성, Railway 계정 생성 및 FastAPI 백엔드 서비스 슬롯 준비",
            "done": false
          },
          {
            "area": "프로젝트 구조",
            "task": "백엔드 폴더 구조 생성 및 requirements.txt 작성 — fastapi, uvicorn, python-multipart, openai, httpx, python-dotenv, pillow 포함",
            "done": false
          },
          {
            "area": "프로젝트 구조",
            "task": "업로드 파일을 인메모리(메모리 버퍼)로만 처리하는 파이프라인 구조 설계 — Railway 로컬 디렉토리 의존 없이 OCR 호출 완료 즉시 메모리에서 삭제되도록 흐름 문서화 (빈틈 점검 반영)",
            "done": false
          },
          {
            "area": "첫 단계",
            "task": "파이프라인 핵심 뼈대 구현 — ① 파일 업로드 수신 → ② 주소/고유번호 먼저 추출(마스킹 전) → ③ 개인정보 마스킹 → ④ CLOVA OCR 호출 → ⑤ GPT 분석 요청 → ⑥ 신호등 결과 반환까지 이어지는 FastAPI 엔드포인트 1개를 더미 응답 포함하여 동작 확인 (빈틈 점검의 주소 추출 순서 반영)",
            "done": false
          }
        ]
      }
    }
  ],
  "completeness": {
    "complete": 7,
    "total": 7,
    "percent": 100
  }
}
