import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { useRetryable } from '../hooks/useRetryable'
import ErrorBanner from '../components/common/ErrorBanner'
import Frame from '../components/common/Frame'
import FinalizeLeftRail from '../components/finalize/FinalizeLeftRail'
import DesignStepHeader from '../components/design/DesignStepHeader'
import DesignStepFooter from '../components/design/DesignStepFooter'
import StepTransition from '../components/design/StepTransition'
import EvaluateStep from '../components/finalize/EvaluateStep'
import DoneStep from '../components/finalize/DoneStep'
import GapStep from '../components/finalize/GapStep'
import ChecklistStep from '../components/finalize/ChecklistStep'
import FinalizeComplete from '../components/finalize/FinalizeComplete'
import {
  FINALIZE_STEPS,
  type FinalizeStepId,
  type DesignStepStatus,
  type FinalizeSession,
} from '../components/design/types'
import type { Project } from '../hooks/useProjects'

type ScreenState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'step'; stepId: FinalizeStepId }
  | { kind: 'transition'; fromIdx: number }
  | { kind: 'complete' }

const STEP_HEADERS: Record<FinalizeStepId, { title: string; subtitle: string }> = {
  evaluate: {
    title: '이 프로젝트, 솔직하게 평가해볼게요',
    subtitle: 'AI가 6가지 기준으로 가치와 실현 가능성을 점검합니다. 좋은 점도, 고칠 점도 알려드려요.',
  },
  done: {
    title: '어디까지 하면 끝일까요?',
    subtitle: '완성 여부를 판단할 수 있는 측정 가능한 완료 조건을 정리합니다.',
  },
  gap: {
    title: '놓친 부분은 없는지 살펴볼게요',
    subtitle: '계획에서 빠졌거나 서로 안 맞는 부분을 개발 시작 전에 찾아냅니다.',
  },
  checklist: {
    title: '개발 시작 전 준비물을 챙겨요',
    subtitle: '환경 설정부터 첫 작업까지, 착수에 필요한 준비 항목을 정리합니다.',
  },
}

const NEXT_PREVIEWS: Record<string, string> = {
  evaluate: '완성 여부를 판단할 완료 조건을 정해요.',
  done: '계획에서 빠진 부분을 점검해요.',
  gap: '개발 착수에 필요한 준비물을 챙겨요. 마지막 단계!',
}

const FOOTER_LABELS: Record<FinalizeStepId, string> = {
  evaluate: '완료 조건으로',
  done: '빈틈 점검으로',
  gap: '착수 준비로',
  checklist: '마무리 완료',
}

function buildTransitionData(stepId: FinalizeStepId, s: FinalizeSession | null): { summary: string[]; nextPreview: string } {
  const nextPreview = NEXT_PREVIEWS[stepId] ?? ''
  if (!s) return { summary: ['이 단계의 데이터를 불러오는 중입니다.'], nextPreview }

  switch (stepId) {
    case 'evaluate': {
      const ev = s.evaluation
      if (!ev) return { summary: ['평가 데이터 없음'], nextPreview }
      const active = ev.dimensions.filter((d) => d.applicable).length
      const labelMap: Record<string, string> = { green: '🟢 적합', yellow: '🟡 조건부', red: '🔴 재검토' }
      return {
        summary: [`${active}개 차원 평가 완료`, `종합 판정: ${labelMap[ev.overall_level] ?? ev.overall_level}`],
        nextPreview,
      }
    }
    case 'done': {
      const n = s.done_criteria?.criteria.length ?? 0
      return { summary: [`완료 조건 ${n}개 정의 완료`], nextPreview }
    }
    case 'gap': {
      const n = s.gaps?.gaps.length ?? 0
      return { summary: [n > 0 ? `빈틈/모순 ${n}개 점검 완료` : '명확한 빈틈 없음 확인'], nextPreview }
    }
    default:
      return { summary: [], nextPreview }
  }
}

export default function FinalizePage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [screen, setScreen] = useState<ScreenState>({ kind: 'loading' })
  const [project, setProject] = useState({ name: '', type: '', language: '' })
  const [stepStatuses, setStepStatuses] = useState<Record<FinalizeStepId, DesignStepStatus>>({
    evaluate: 'active',
    done: 'pending',
    gap: 'pending',
    checklist: 'pending',
  })
  const [session, setSession] = useState<FinalizeSession | null>(null)
  const [generating, setGenerating] = useState(false)
  const { error, retry, run, fail, clear } = useRetryable()
  const [lastSavedLabel, setLastSavedLabel] = useState('자동 저장됨')

  useEffect(() => {
    if (!projectId) return
    async function init() {
      try {
        const projects = await apiFetch<Project[]>('/projects')
        const proj = projects.find((p) => p.id === projectId)
        if (!proj) {
          setScreen({ kind: 'error', message: '프로젝트를 찾을 수 없습니다' })
          return
        }
        if (!['designing', 'evaluating', 'completed'].includes(proj.status)) {
          navigate('/projects')
          return
        }
        setProject({ name: proj.name, type: proj.project_type ?? '', language: proj.language })

        try {
          const fs = await apiFetch<FinalizeSession>(`/finalize/session/${projectId}`)
          setSession(fs)
          updateStepStatuses(fs)
          if (fs.status === 'completed') {
            setScreen({ kind: 'complete' })
          } else {
            setScreen({ kind: 'step', stepId: fs.current_step })
          }
        } catch {
          setScreen({ kind: 'step', stepId: 'evaluate' })
        }
      } catch (e) {
        setScreen({ kind: 'error', message: e instanceof Error ? e.message : '마무리 페이지를 불러올 수 없습니다' })
      }
    }
    init()
  }, [projectId, navigate])

  function updateStepStatuses(s: FinalizeSession) {
    setStepStatuses((prev) => {
      const statuses: Record<FinalizeStepId, DesignStepStatus> = {
        evaluate: s.evaluation ? 'done' : (prev.evaluate === 'done' ? 'done' : 'pending'),
        done: s.done_criteria ? 'done' : (prev.done === 'done' ? 'done' : 'pending'),
        gap: s.gaps ? 'done' : (prev.gap === 'done' ? 'done' : 'pending'),
        checklist: s.checklist ? 'done' : (prev.checklist === 'done' ? 'done' : 'pending'),
      }
      statuses[s.current_step] = 'active'
      return statuses
    })
  }

  const handleGenerate = useCallback(async (step: FinalizeStepId) => {
    if (!projectId || generating) return
    setGenerating(true)
    await run(async () => {
      const res = await apiFetch<FinalizeSession>(`/finalize/${step}`, {
        method: 'POST',
        body: JSON.stringify({ project_id: projectId }),
      })
      setSession(res)
      updateStepStatuses(res)
      setLastSavedLabel('방금 저장됨')
    })
    setGenerating(false)
  }, [projectId, generating, run])

  const handleUpdateDone = useCallback(async (data: FinalizeSession['done_criteria']) => {
    if (!session || !data) return
    setSession({ ...session, done_criteria: data })
    try {
      const res = await apiFetch<FinalizeSession>(`/finalize/done/${session.id}`, {
        method: 'PUT',
        body: JSON.stringify({ data }),
      })
      setSession(res)
      setLastSavedLabel('방금 저장됨')
    } catch (e) {
      fail(e)
    }
  }, [session, fail])

  const handleNext = useCallback(() => {
    if (generating) return
    const currentIdx = FINALIZE_STEPS.findIndex((s) => s.id === (screen.kind === 'step' ? screen.stepId : ''))
    setStepStatuses((prev) => {
      const stepId = FINALIZE_STEPS[currentIdx]?.id
      return stepId ? { ...prev, [stepId]: 'done' } : prev
    })
    if (currentIdx < FINALIZE_STEPS.length - 1) {
      setScreen({ kind: 'transition', fromIdx: currentIdx })
    } else {
      setScreen({ kind: 'complete' })
    }
  }, [generating, screen])

  const handleBack = useCallback(() => {
    if (generating || screen.kind !== 'step') return
    const currentIdx = FINALIZE_STEPS.findIndex((s) => s.id === screen.stepId)
    if (currentIdx > 0) {
      const prevStep = FINALIZE_STEPS[currentIdx - 1].id
      setStepStatuses((prev) => ({ ...prev, [prevStep]: 'active' }))
      setScreen({ kind: 'step', stepId: prevStep })
    }
  }, [generating, screen])

  const handleTransitionNext = useCallback((fromIdx: number) => {
    const nextStep = FINALIZE_STEPS[fromIdx + 1].id
    setStepStatuses((prev) => ({ ...prev, [nextStep]: 'active' }))
    setScreen({ kind: 'step', stepId: nextStep })
  }, [])

  const handleTransitionBack = useCallback((fromIdx: number) => {
    const step = FINALIZE_STEPS[fromIdx]
    setStepStatuses((prev) => ({ ...prev, [step.id]: 'active' }))
    setScreen({ kind: 'step', stepId: step.id })
  }, [])

  const handleStepClick = useCallback((stepId: FinalizeStepId) => {
    if (generating) return
    setScreen({ kind: 'step', stepId })
  }, [generating])

  // --- SCREEN ROUTING ---

  if (screen.kind === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <p className="text-sm text-text-muted">마무리 단계를 준비하고 있습니다...</p>
        </div>
      </div>
    )
  }

  if (screen.kind === 'error') {
    return (
      <div className="h-screen flex items-center justify-center bg-bg">
        <div className="text-center max-w-sm">
          <p className="text-sm text-red mb-4">{screen.message}</p>
          <button type="button" onClick={() => navigate('/projects')} className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg cursor-pointer border-none">
            프로젝트 목록으로
          </button>
        </div>
      </div>
    )
  }

  if (screen.kind === 'transition') {
    const fromStep = FINALIZE_STEPS[screen.fromIdx]
    const toStep = FINALIZE_STEPS[screen.fromIdx + 1]
    const data = buildTransitionData(fromStep.id, session)
    return (
      <StepTransition
        fromN={fromStep.num}
        fromT={fromStep.title}
        fromIcon={fromStep.icon}
        toN={toStep.num}
        toT={toStep.title}
        toIcon={toStep.icon}
        summary={data.summary}
        nextPreview={data.nextPreview}
        onBack={() => handleTransitionBack(screen.fromIdx)}
        onNext={() => handleTransitionNext(screen.fromIdx)}
      />
    )
  }

  if (screen.kind === 'complete') {
    return (
      <Frame>
        <FinalizeComplete session={session} onNext={() => navigate(`/projects/${projectId}/document`)} />
      </Frame>
    )
  }

  // screen.kind === 'step'
  const currentStepDef = FINALIZE_STEPS.find((s) => s.id === screen.stepId)!
  const header = STEP_HEADERS[screen.stepId]
  const isFirstStep = FINALIZE_STEPS[0].id === screen.stepId
  const currentStepIdx = FINALIZE_STEPS.findIndex((s) => s.id === screen.stepId)
  const totalQ = FINALIZE_STEPS.length
  const currentQ = currentStepIdx + 1

  return (
    <Frame>
      <div className="h-full flex">
        <FinalizeLeftRail
          project={project}
          activeStep={screen.stepId}
          stepStatuses={stepStatuses}
          onStepClick={handleStepClick}
          disabled={generating}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-bg">
          <DesignStepHeader
            stepNum={currentStepDef.num}
            stepName={currentStepDef.title}
            title={header.title}
            subtitle={header.subtitle}
            currentQ={currentQ}
            totalQ={totalQ}
          />

          {error && (
            <ErrorBanner message={error} onRetry={retry ?? undefined} onClose={clear} />
          )}

          <div className="flex-1 overflow-auto px-6 py-5">
            {screen.stepId === 'evaluate' && (
              <EvaluateStep session={session} generating={generating} onGenerate={() => handleGenerate('evaluate')} />
            )}
            {screen.stepId === 'done' && (
              <DoneStep session={session} generating={generating} onGenerate={() => handleGenerate('done')} onUpdate={handleUpdateDone} />
            )}
            {screen.stepId === 'gap' && (
              <GapStep session={session} generating={generating} onGenerate={() => handleGenerate('gap')} />
            )}
            {screen.stepId === 'checklist' && (
              <ChecklistStep session={session} generating={generating} onGenerate={() => handleGenerate('checklist')} />
            )}
          </div>

          <DesignStepFooter
            canBack={!isFirstStep}
            primaryLabel={FOOTER_LABELS[screen.stepId]}
            onBack={handleBack}
            onSkip={handleNext}
            onNext={handleNext}
            loading={generating}
            lastSavedLabel={lastSavedLabel}
          />
        </div>
      </div>
    </Frame>
  )
}
