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

export interface InterviewApiResponse {
  session_id: string
  status: string
  current_step: number
  total_steps: number
  step_title: string
  question: string | null
  topics: string[]
  importance: string | null
  example_answers: { label: string; text: string }[]
  insights: { label: string; value: string; is_new: boolean; pending: boolean }[]
  steps: {
    title: string
    status: string
    summary: string | null
    question_index: number | null
    question_total: number | null
  }[]
  messages: { role: string; text: string; time: string | null }[]
  phase: number
  total_phases: number
  phase_label: string
  answer_count: number
}
