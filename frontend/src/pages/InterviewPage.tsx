import { Link } from 'react-router-dom'
import LeftRail from '../components/interview/LeftRail'
import ChatCenter from '../components/interview/ChatCenter'
import RightPanel from '../components/interview/RightPanel'
import type {
  InterviewStep,
  ChatMessage,
  CurrentQuestion,
  CapturedInsight,
  ProgressInfo,
  InterviewStats,
} from '../components/interview/types'

const MOCK_PROJECT = { name: '사내 도서 추천 봇', type: 'AI/ML', language: 'KO' }

const MOCK_STEPS: InterviewStep[] = [
  { title: '프로젝트 유형 감지', status: 'done', summary: 'AI/ML · 도서 추천' },
  { title: '주요 사용자', status: 'done', summary: '사내 직원 ~150명' },
  { title: '핵심 가치', status: 'done', summary: '독서 습관화, 부서 맞춤' },
  { title: '데이터 소스', status: 'active', questionIndex: 3, questionTotal: 3 },
  { title: '기술 스택', status: 'pending' },
  { title: '성공 지표', status: 'pending' },
  { title: '리스크', status: 'pending' },
  { title: '설계 인터뷰', status: 'pending' },
]

const MOCK_MESSAGES: ChatMessage[] = [
  { role: 'ai', text: '좋습니다. Slack 채널 또는 DM 중 어느 쪽을 우선하시나요?', time: '14:28' },
  { role: 'user', text: '개인 DM 위주로요. 처음엔 부서별 인기 도서 기준으로 시작해도 괜찮습니다.', time: '14:31' },
]

const MOCK_QUESTION: CurrentQuestion = {
  stepLabel: 'STEP 04',
  stepTitle: '데이터 소스',
  questionNumber: 3,
  topics: ['데이터 출처', '측정 지표'],
  importance: '중요도 높음',
  text: '명확하네요. 그럼 데이터 소스는 사내 도서 DB가 될 것 같은데, 책 정보는 어디서 가져오시나요? 그리고 추천 결과의 정확도는 어떻게 측정하실 계획인지요?',
  highlightText: '책 정보는 어디서 가져오시나요?',
  exampleAnswers: [
    { label: '책 정보', text: '사내 도서관 시스템 API, 외부 도서 메타데이터(교보문고/예스24)' },
    { label: '정확도', text: '클릭률(CTR), 읽음 완료율, 사용자 만족도 설문' },
    { label: '측정 주기', text: '주간 / 월간 대시보드' },
  ],
  avgTime: '평균 1분',
  insightCount: '2개 인사이트 추출',
  time: '14:34',
}

const MOCK_CAPTURED: CapturedInsight[] = [
  { label: '주요 사용자', value: '사내 직원 ~150명', isNew: false, pending: false },
  { label: '발송 채널', value: 'Slack DM', isNew: false, pending: false },
  { label: '추천 기준', value: '부서별 인기 도서', isNew: true, pending: false },
  { label: '데이터 소스', value: '답변 중', isNew: false, pending: true },
]

const MOCK_PROGRESS: ProgressInfo = {
  phase: 1,
  totalPhases: 3,
  current: 3,
  total: 10,
  phaseLabel: '기획 인터뷰',
  remainingTime: '약 8분',
}

const MOCK_STATS: InterviewStats = {
  elapsedTime: '12:04',
  answerCount: 3,
  avgAnswerTime: '1분 8초',
}

export default function InterviewPage() {
  return (
    <div className="h-screen flex flex-col bg-bg">
      {/* Minimal top bar */}
      <header className="h-12 bg-surface border-b border-border flex items-center px-4 shrink-0">
        <Link to="/projects" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <span className="text-sm font-semibold text-text">Prequel</span>
        </Link>
        <div className="flex-1" />
        <span className="text-xs text-text-muted">{MOCK_PROJECT.name}</span>
      </header>

      {/* 3-column layout */}
      <div className="flex-1 flex min-h-0">
        <LeftRail project={MOCK_PROJECT} steps={MOCK_STEPS} progress={MOCK_PROGRESS} />
        <ChatCenter messages={MOCK_MESSAGES} currentQuestion={MOCK_QUESTION} stats={MOCK_STATS} />
        <RightPanel captured={MOCK_CAPTURED} />
      </div>
    </div>
  )
}
