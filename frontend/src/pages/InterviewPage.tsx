import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { PenTool, FastForward } from 'lucide-react'
import { useAuthContext } from '../contexts/AuthContext'
import { apiFetch } from '../lib/api'
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
  InterviewApiResponse,
} from '../components/interview/types'
import type { Project } from '../hooks/useProjects'

function formatElapsed(ms: number): string {
  const sec = Math.floor(ms / 1000)
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

function formatMsgTime(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return ''
  }
}

function nowTimeStr(): string {
  return new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function transformResponse(res: InterviewApiResponse) {
  const steps: InterviewStep[] = res.steps.map((s) => ({
    title: s.title,
    status: s.status as 'done' | 'active' | 'pending',
    summary: s.summary ?? undefined,
    questionIndex: s.question_index ?? undefined,
    questionTotal: s.question_total ?? undefined,
  }))

  const allMsgs = res.messages
  const history: ChatMessage[] = []
  for (let i = 0; i < allMsgs.length; i++) {
    if (i === allMsgs.length - 1 && allMsgs[i].role === 'ai') continue
    history.push({
      role: allMsgs[i].role as 'ai' | 'user',
      text: allMsgs[i].text,
      time: formatMsgTime(allMsgs[i].time),
    })
  }

  const question: CurrentQuestion | null = res.question
    ? {
        stepLabel: `STEP ${String(res.current_step + 1).padStart(2, '0')}`,
        stepTitle: res.step_title,
        questionNumber: res.answer_count + 1,
        topics: res.topics,
        importance: res.importance ?? '',
        text: res.question,
        highlightText: '',
        exampleAnswers: res.example_answers,
        avgTime: '평균 1분',
        insightCount: `${res.insights.filter((i) => i.is_new).length}개 인사이트 추출`,
        time: nowTimeStr(),
      }
    : null

  const insights: CapturedInsight[] = res.insights.map((i) => ({
    label: i.label,
    value: i.value,
    isNew: i.is_new,
    pending: i.pending,
  }))

  const progress: ProgressInfo = {
    phase: res.phase,
    totalPhases: res.total_phases,
    current: res.current_step + 1,
    total: res.total_steps,
    phaseLabel: res.phase_label,
    remainingTime: `약 ${Math.max(1, (res.total_steps - res.current_step - 1) * 2)}분`,
  }

  return { steps, messages: history, question, insights, progress, answerCount: res.answer_count }
}

export default function InterviewPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthContext()

  const [sessionId, setSessionId] = useState('')
  const [pageStatus, setPageStatus] = useState<'loading' | 'active' | 'completed' | 'error'>(
    'loading',
  )
  const [steps, setSteps] = useState<InterviewStep[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [question, setQuestion] = useState<CurrentQuestion | null>(null)
  const [insights, setInsights] = useState<CapturedInsight[]>([])
  const [progress, setProgress] = useState<ProgressInfo>({
    phase: 1,
    totalPhases: 3,
    current: 0,
    total: 10,
    phaseLabel: '기획 인터뷰',
    remainingTime: '계산 중...',
  })
  const [stats, setStats] = useState<InterviewStats>({
    elapsedTime: '0:00',
    answerCount: 0,
    avgAnswerTime: '-',
  })
  const [project, setProject] = useState({ name: '', type: '', language: '' })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [lastSavedLabel, setLastSavedLabel] = useState('방금 전')
  const [showInactiveWarning, setShowInactiveWarning] = useState(false)
  const [typeToConfirm, setTypeToConfirm] = useState<string | null>(null)
  const [decidingDesign, setDecidingDesign] = useState(false)

  const startTimeRef = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval>>()
  const answerCountRef = useRef(0)
  const lastActivityRef = useRef(Date.now())
  const typeConfirmedRef = useRef(false)

  useEffect(() => {
    if (pageStatus !== 'active') return
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const count = answerCountRef.current
      setStats((prev) => ({
        ...prev,
        elapsedTime: formatElapsed(elapsed),
        avgAnswerTime: count > 0 ? formatElapsed(elapsed / count) : '-',
      }))
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [pageStatus])

  const applyApiResponse = useCallback((res: InterviewApiResponse) => {
    const data = transformResponse(res)
    setSessionId(res.session_id)
    setSteps(data.steps)
    setMessages(data.messages)
    setQuestion(data.question)
    setInsights(data.insights)
    setProgress(data.progress)
    answerCountRef.current = data.answerCount
    setStats((prev) => ({ ...prev, answerCount: data.answerCount }))
    setPageStatus(res.status === 'completed' ? 'completed' : 'active')

    const typeInsight = res.insights.find((i) => i.label.includes('유형'))
    if (typeInsight) {
      setProject((prev) => ({ ...prev, type: typeInsight.value }))
      if (!typeConfirmedRef.current) {
        setTypeToConfirm(typeInsight.value)
      }
    }
    setLastSavedAt(new Date())
    setLastSavedLabel('방금 전')
  }, [])

  // Auto-save: update "saved N분 전" label every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastSavedAt) return
      const diff = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000)
      if (diff < 60) setLastSavedLabel('방금 전')
      else setLastSavedLabel(`${Math.floor(diff / 60)}분 전`)
    }, 10_000)
    return () => clearInterval(interval)
  }, [lastSavedAt])

  // Auto-save: pause & resume every 60s to persist session state
  useEffect(() => {
    if (pageStatus !== 'active' || !sessionId) return
    const interval = setInterval(async () => {
      try {
        await apiFetch('/interview/pause', {
          method: 'POST',
          body: JSON.stringify({ session_id: sessionId }),
        })
        const res = await apiFetch<InterviewApiResponse>('/interview/resume', {
          method: 'POST',
          body: JSON.stringify({ session_id: sessionId }),
        })
        applyApiResponse(res)
      } catch { /* silent */ }
    }, 60_000)
    return () => clearInterval(interval)
  }, [pageStatus, sessionId, applyApiResponse])

  // #25: beforeunload session save
  useEffect(() => {
    if (pageStatus !== 'active' || !sessionId) return
    const handleBeforeUnload = () => {
      fetch('/api/interview/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
        keepalive: true,
      })
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [pageStatus, sessionId])

  const handlePause = useCallback(async () => {
    if (!sessionId) return
    try {
      await apiFetch('/interview/pause', {
        method: 'POST',
        body: JSON.stringify({ session_id: sessionId }),
      })
      navigate('/projects')
    } catch (e) {
      setError(e instanceof Error ? e.message : '일시정지에 실패했습니다')
    }
  }, [sessionId, navigate])

  // #11: 5-min inactivity auto-pause
  useEffect(() => {
    if (pageStatus !== 'active') return
    const resetActivity = () => {
      lastActivityRef.current = Date.now()
      setShowInactiveWarning(false)
    }
    window.addEventListener('mousemove', resetActivity)
    window.addEventListener('keydown', resetActivity)
    const check = setInterval(() => {
      const idle = Date.now() - lastActivityRef.current
      if (idle >= 5 * 60 * 1000) {
        handlePause()
      } else if (idle >= 4 * 60 * 1000) {
        setShowInactiveWarning(true)
      }
    }, 30_000)
    return () => {
      window.removeEventListener('mousemove', resetActivity)
      window.removeEventListener('keydown', resetActivity)
      clearInterval(check)
    }
  }, [pageStatus, handlePause])

  useEffect(() => {
    if (!projectId) return

    async function init() {
      try {
        const projects = await apiFetch<Project[]>('/projects')
        const proj = projects.find((p) => p.id === projectId)
        if (proj) {
          setProject({ name: proj.name, type: proj.project_type ?? '', language: proj.language })
          if (proj.status === 'designing' || proj.status === 'evaluating') {
            navigate('/projects')
            return
          }
        }

        const { session } = await apiFetch<{
          session: { id: string; status: string; current_question: number } | null
        }>(`/interview/session/${projectId}`)

        if (session?.status === 'completed') {
          answerCountRef.current = session.current_question
          setStats((prev) => ({ ...prev, answerCount: session.current_question }))
          setPageStatus('completed')
          return
        }

        const res = await apiFetch<InterviewApiResponse>('/interview/start', {
          method: 'POST',
          body: JSON.stringify({ project_id: projectId }),
        })
        applyApiResponse(res)

        startTimeRef.current = Date.now()
      } catch (e) {
        setError(e instanceof Error ? e.message : '인터뷰를 시작할 수 없습니다')
        setPageStatus('error')
      }
    }

    init()
  }, [projectId, applyApiResponse])

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || !sessionId || sending) return
      setSending(true)
      setError(null)

      try {
        const res = await apiFetch<InterviewApiResponse>('/interview/answer', {
          method: 'POST',
          body: JSON.stringify({ session_id: sessionId, answer: text.trim() }),
        })
        applyApiResponse(res)
      } catch (e) {
        setError(e instanceof Error ? e.message : '답변 전송에 실패했습니다')
      } finally {
        setSending(false)
      }
    },
    [sessionId, sending, applyApiResponse],
  )

  const handleDesignDecision = useCallback(async (decision: 'design' | 'skip') => {
    if (!projectId || decidingDesign) return
    setDecidingDesign(true)
    try {
      await apiFetch(`/projects/${projectId}/design-decision`, {
        method: 'POST',
        body: JSON.stringify({ decision }),
      })
      if (decision === 'design') {
        navigate(`/projects/${projectId}/design`)
      } else {
        navigate(`/projects/${projectId}/finalize`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '선택 저장에 실패했습니다')
      setDecidingDesign(false)
    }
  }, [projectId, decidingDesign, navigate])

  const handleTypeConfirm = useCallback(async (confirmedType: string) => {
    typeConfirmedRef.current = true
    setTypeToConfirm(null)
    setProject((prev) => ({ ...prev, type: confirmedType }))
    if (projectId) {
      try {
        await apiFetch(`/projects/${projectId}`, {
          method: 'PATCH',
          body: JSON.stringify({ project_type: confirmedType }),
        })
      } catch { /* non-critical */ }
    }
  }, [projectId])

  const userInitial = user?.display_name?.[0] ?? user?.email?.[0] ?? '나'

  if (pageStatus === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <p className="text-sm text-text-muted">인터뷰를 준비하고 있습니다...</p>
        </div>
      </div>
    )
  }

  if (pageStatus === 'error') {
    return (
      <div className="h-screen flex items-center justify-center bg-bg">
        <div className="text-center max-w-sm">
          <p className="text-sm text-red mb-4">{error}</p>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg cursor-pointer border-none"
          >
            프로젝트 목록으로
          </button>
        </div>
      </div>
    )
  }

  if (pageStatus === 'completed') {
    return (
      <div className="h-screen flex items-center justify-center bg-bg">
        <div className="max-w-xl w-full px-6">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-green flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-bold">&#10003;</span>
            </div>
            <h2 className="text-lg font-bold text-text mb-2">인터뷰가 완료되었습니다</h2>
            <p className="text-sm text-text-muted">
              총 {stats.answerCount}개 질문에 답변하셨습니다. 다음 단계를 선택해주세요.
            </p>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => handleDesignDecision('design')}
              disabled={decidingDesign}
              className="flex-1 p-5 bg-surface border-2 border-accent/30 rounded-xl text-left hover:border-accent hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                <PenTool className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-sm font-bold text-text mb-1.5">설계 진행</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                요구사항, 아키텍처, 데이터 모델, AI 워크플로우를 단계별로 설계합니다.
              </p>
              <div className="mt-3 text-[11px] text-accent font-semibold">추천 — 복잡한 프로젝트</div>
            </button>

            <button
              onClick={() => handleDesignDecision('skip')}
              disabled={decidingDesign}
              className="flex-1 p-5 bg-surface border-2 border-border rounded-xl text-left hover:border-text-muted hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-text-muted/10 flex items-center justify-center mb-3">
                <FastForward className="w-5 h-5 text-text-muted" />
              </div>
              <h3 className="text-sm font-bold text-text mb-1.5">건너뛰기</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                설계를 건너뛰고 바로 평가 및 킥오프 문서 생성으로 진행합니다.
              </p>
              <div className="mt-3 text-[11px] text-text-muted font-semibold">빠른 진행 — 단순한 프로젝트</div>
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/projects')}
              className="text-xs text-text-muted hover:text-text underline cursor-pointer bg-transparent border-none"
            >
              나중에 결정하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-bg">
      <header className="h-12 bg-surface border-b border-border flex items-center px-4 shrink-0">
        <Link to="/projects" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <span className="text-sm font-semibold text-text">Prequel</span>
        </Link>
        <div className="flex-1" />
        <span className="text-xs text-text-muted">{project.name}</span>
      </header>

      {error && (
        <div className="px-4 py-2 bg-red/10 text-red text-xs text-center border-b border-red/20">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline cursor-pointer bg-transparent border-none text-red text-xs"
          >
            닫기
          </button>
        </div>
      )}

      {showInactiveWarning && (
        <div className="px-4 py-2 bg-amber/10 text-amber text-xs text-center border-b border-amber/20">
          1분 후 무응답 시 자동으로 일시정지됩니다
          <button
            onClick={() => {
              lastActivityRef.current = Date.now()
              setShowInactiveWarning(false)
            }}
            className="ml-2 underline cursor-pointer bg-transparent border-none text-amber text-xs font-semibold"
          >
            계속하기
          </button>
        </div>
      )}

      {typeToConfirm && (
        <div className="px-4 py-2.5 bg-accent-soft text-accent-deep text-xs text-center border-b border-accent/20 flex items-center justify-center gap-3">
          <span>감지된 프로젝트 유형: <strong className="font-semibold">{typeToConfirm}</strong></span>
          <button
            onClick={() => handleTypeConfirm(typeToConfirm)}
            className="px-3 py-1 bg-accent text-white text-xs font-semibold rounded-md cursor-pointer border-none"
          >
            확인
          </button>
          <button
            onClick={() => {
              const newType = prompt('프로젝트 유형을 입력하세요:', typeToConfirm)
              if (newType && newType.trim()) handleTypeConfirm(newType.trim())
            }}
            className="px-3 py-1 bg-surface text-accent text-xs font-semibold rounded-md cursor-pointer border border-accent"
          >
            수정
          </button>
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        <LeftRail project={project} steps={steps} progress={progress} />
        <ChatCenter
          messages={messages}
          currentQuestion={question}
          stats={stats}
          onSend={handleSend}
          onPause={handlePause}
          sending={sending}
          userInitial={userInitial}
        />
        <RightPanel captured={insights} totalExpected={progress.total} lastSavedLabel={lastSavedLabel} projectId={projectId} />
      </div>
    </div>
  )
}
