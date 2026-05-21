export interface InterviewStep {
  title: string
  status: 'done' | 'active' | 'pending'
  summary?: string
  questionIndex?: number
  questionTotal?: number
}

export interface ChatMessage {
  role: 'ai' | 'user'
  text: string
  time: string
}

export interface CurrentQuestion {
  stepLabel: string
  stepTitle: string
  questionNumber: number
  topics: string[]
  importance: string
  text: string
  highlightText: string
  exampleAnswers: { label: string; text: string }[]
  avgTime: string
  insightCount: string
  time: string
}

export interface CapturedInsight {
  label: string
  value: string
  isNew: boolean
  pending: boolean
}

export interface ProgressInfo {
  phase: number
  totalPhases: number
  current: number
  total: number
  phaseLabel: string
  remainingTime: string
}

export interface InterviewStats {
  elapsedTime: string
  answerCount: number
  avgAnswerTime: string
}
