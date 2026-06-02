import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import Frame from '../components/common/Frame'
import DesignLeftRail from '../components/design/DesignLeftRail'
import DesignStepHeader from '../components/design/DesignStepHeader'
import DesignStepFooter from '../components/design/DesignStepFooter'
import DesignWelcome from '../components/design/DesignWelcome'
import DesignComplete from '../components/design/DesignComplete'
import StepTransition from '../components/design/StepTransition'
import RequirementsStep from '../components/design/RequirementsStep'
import ArchitectureStep from '../components/design/ArchitectureStep'
import DataModelStep from '../components/design/DataModelStep'
import AiWorkflowStep from '../components/design/AiWorkflowStep'
import ArchHelperPanel from '../components/design/ArchHelperPanel'
import DataHelperPanel from '../components/design/DataHelperPanel'
import AiHelperPanel from '../components/design/AiHelperPanel'
import { DESIGN_STEPS, type DesignStepId, type DesignStepStatus, type DesignSession } from '../components/design/types'
import type { Project } from '../hooks/useProjects'

type ScreenState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'welcome' }
  | { kind: 'step'; stepId: DesignStepId }
  | { kind: 'transition'; fromIdx: number }
  | { kind: 'complete' }

const STEP_HEADERS: Record<DesignStepId, { title: string; subtitle: string }> = {
  requirements: {
    title: '이 도구가 할 수 있는 일을 정의해볼까요?',
    subtitle: '첫 번째 질문이에요. 답이 떠오르지 않으면 AI 추천을 활용하세요.',
  },
  architecture: {
    title: '이 도구의 부품들을 골라볼까요?',
    subtitle: '실제로 동작하려면 화면, 서버, 데이터베이스, AI 같은 부품들이 필요해요. AI가 최적의 조합을 추천해드려요.',
  },
  'data-model': {
    title: '저장해야 할 정보를 정리해볼까요?',
    subtitle: '앱이 동작하려면 데이터가 어딘가에 저장되어야 해요. 어떤 정보를 저장할지 함께 정리합니다.',
  },
  'ai-workflow': {
    title: 'AI가 무엇을 받고 무엇을 만들지 정해볼까요?',
    subtitle: 'AI가 어떤 정보를 받고, 어떤 결과를 만들고, 만약 실패하면 어떻게 처리할지 함께 설계해요.',
  },
}

const NEXT_PREVIEWS: Record<string, string> = {
  requirements: '어떤 부품으로 만들지 결정해요. AI가 최적의 조합을 추천해드립니다.',
  architecture: '저장해야 할 정보를 정리해요. 엑셀 시트처럼 표 형태로 만들어드립니다.',
  'data-model': 'AI가 어떤 정보를 받고 무엇을 만들어낼지 정의해요. 마지막 단계!',
}

function buildTransitionData(stepId: DesignStepId, s: DesignSession | null): { summary: string[]; nextPreview: string } {
  const nextPreview = NEXT_PREVIEWS[stepId] ?? ''

  if (!s) {
    return { summary: ['이 단계의 데이터를 불러오는 중입니다.'], nextPreview }
  }

  switch (stepId) {
    case 'requirements': {
      const reqs = s.requirements ?? []
      const must = reqs.filter((r) => r.priority === 'must').length
      const should = reqs.filter((r) => r.priority === 'should').length
      const could = reqs.filter((r) => r.priority === 'could').length
      const summary = [`핵심 기능 ${reqs.length}개 정의 완료`]
      if (must + should + could > 0) {
        summary.push(`우선순위별 분류 (Must ${must}개 · Should ${should}개 · Could ${could}개)`)
      }
      const withCriteria = reqs.filter((r) => r.acceptance_criteria).length
      if (withCriteria > 0) summary.push(`인수 기준 ${withCriteria}개 자동 생성`)
      return { summary, nextPreview }
    }
    case 'architecture': {
      const arch = s.architecture
      if (!arch) return { summary: ['시스템 구조 데이터 없음'], nextPreview }
      const comps = arch.components ?? []
      const techs = Object.keys(arch.tech_stack ?? {})
      const summary = [`시스템 구성 요소 ${comps.length}개 선택 완료`]
      if (techs.length > 0) summary.push(`기술 스택: ${techs.slice(0, 4).join(', ')}${techs.length > 4 ? ` 외 ${techs.length - 4}개` : ''}`)
      summary.push('각 부품의 역할이 모두 정의됨')
      return { summary, nextPreview }
    }
    case 'data-model': {
      const dm = s.data_model
      if (!dm) return { summary: ['데이터 구조 데이터 없음'], nextPreview }
      const entities = dm.entities ?? []
      const totalFields = entities.reduce((sum, e) => sum + e.fields.length, 0)
      const rels = dm.relationships ?? []
      const summary = [`정보 그룹(테이블) ${entities.length}개 정의 완료`]
      summary.push(`항목(필드) ${totalFields}개, 타입 정의 완료`)
      if (rels.length > 0) summary.push(`그룹 간 연결 관계 ${rels.length}개 정의`)
      return { summary, nextPreview }
    }
    default:
      return { summary: [], nextPreview }
  }
}

export default function DesignPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [screen, setScreen] = useState<ScreenState>({ kind: 'loading' })
  const [project, setProject] = useState({ name: '', type: '', language: '' })
  const [activeStep, setActiveStep] = useState<DesignStepId>('requirements')
  const [stepStatuses, setStepStatuses] = useState<Record<DesignStepId, DesignStepStatus>>({
    requirements: 'active',
    architecture: 'pending',
    'data-model': 'pending',
    'ai-workflow': 'pending',
  })
  const [session, setSession] = useState<DesignSession | null>(null)
  const [generating, setGenerating] = useState(false)
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
        if (proj.status !== 'designing') {
          navigate('/projects')
          return
        }
        setProject({ name: proj.name, type: proj.project_type ?? '', language: proj.language })

        try {
          const designSession = await apiFetch<DesignSession>(`/design/session/${projectId}`)
          setSession(designSession)
          setActiveStep(designSession.current_step)
          updateStepStatuses(designSession)
          setScreen({ kind: 'step', stepId: designSession.current_step })
        } catch {
          setScreen({ kind: 'welcome' })
        }
      } catch (e) {
        setScreen({ kind: 'error', message: e instanceof Error ? e.message : '설계 페이지를 불러올 수 없습니다' })
      }
    }

    init()
  }, [projectId, navigate])

  function updateStepStatuses(s: DesignSession) {
    setStepStatuses((prev) => {
      const statuses: Record<DesignStepId, DesignStepStatus> = {
        requirements: s.requirements ? 'done' : (prev.requirements === 'done' ? 'done' : 'pending'),
        architecture: s.architecture ? 'done' : (prev.architecture === 'done' ? 'done' : 'pending'),
        'data-model': s.data_model ? 'done' : (prev['data-model'] === 'done' ? 'done' : 'pending'),
        'ai-workflow': s.ai_workflow ? 'done' : (prev['ai-workflow'] === 'done' ? 'done' : 'pending'),
      }
      statuses[s.current_step] = 'active'
      return statuses
    })
  }

  const handleGenerate = useCallback(async (step: DesignStepId, templateIndex?: number) => {
    if (!projectId || generating) return
    setGenerating(true)
    setError(null)
    try {
      const body: Record<string, unknown> = { project_id: projectId }
      if (templateIndex !== undefined) body.template_index = templateIndex
      const res = await apiFetch<DesignSession>(`/design/${step}/generate`, {
        method: 'POST',
        body: JSON.stringify(body),
      })
      setSession(res)
      updateStepStatuses(res)
      setLastSavedLabel('방금 저장됨')
    } catch (e) {
      setError(e instanceof Error ? e.message : '생성에 실패했습니다')
    } finally {
      setGenerating(false)
    }
  }, [projectId, generating])

  const handleLoadTemplates = useCallback(async () => {
    if (!projectId || loadingTemplates) return
    setLoadingTemplates(true)
    try {
      const res = await apiFetch<{ templates: DesignSession['arch_templates'] }>('/design/architecture/templates', {
        method: 'POST',
        body: JSON.stringify({ project_id: projectId }),
      })
      setSession((prev) => prev ? { ...prev, arch_templates: res.templates } : prev)
    } catch {
      // fallback templates will be used
    } finally {
      setLoadingTemplates(false)
    }
  }, [projectId, loadingTemplates])

  const handleNext = useCallback(() => {
    const currentIdx = DESIGN_STEPS.findIndex((s) => s.id === activeStep)
    if (currentIdx < DESIGN_STEPS.length - 1) {
      setStepStatuses((prev) => ({ ...prev, [activeStep]: 'done' }))
      setScreen({ kind: 'transition', fromIdx: currentIdx })
    } else {
      setStepStatuses((prev) => ({ ...prev, [activeStep]: 'done' }))
      setScreen({ kind: 'complete' })
    }
  }, [activeStep])

  const handleBack = useCallback(() => {
    const currentIdx = DESIGN_STEPS.findIndex((s) => s.id === activeStep)
    if (currentIdx > 0) {
      const prevStep = DESIGN_STEPS[currentIdx - 1].id
      setActiveStep(prevStep)
      setStepStatuses((prev) => ({ ...prev, [prevStep]: 'active' }))
      setScreen({ kind: 'step', stepId: prevStep })
    }
  }, [activeStep])

  const handleTransitionNext = useCallback((fromIdx: number) => {
    const nextStep = DESIGN_STEPS[fromIdx + 1].id
    setActiveStep(nextStep)
    setStepStatuses((prev) => ({ ...prev, [nextStep]: 'active' }))
    setScreen({ kind: 'step', stepId: nextStep })
  }, [])

  const handleTransitionBack = useCallback((fromIdx: number) => {
    const step = DESIGN_STEPS[fromIdx]
    setActiveStep(step.id)
    setStepStatuses((prev) => ({ ...prev, [step.id]: 'active' }))
    setScreen({ kind: 'step', stepId: step.id })
  }, [])

  const handleStepClick = useCallback((stepId: DesignStepId) => {
    setActiveStep(stepId)
    setScreen({ kind: 'step', stepId })
  }, [])

  // --- SCREEN ROUTING ---

  if (screen.kind === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <p className="text-sm text-text-muted">설계 환경을 준비하고 있습니다...</p>
        </div>
      </div>
    )
  }

  if (screen.kind === 'error') {
    return (
      <div className="h-screen flex items-center justify-center bg-bg">
        <div className="text-center max-w-sm">
          <p className="text-sm text-red mb-4">{screen.message}</p>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg cursor-pointer border-none"
          >
            프로젝트 목록으로
          </button>
        </div>
      </div>
    )
  }

  if (screen.kind === 'welcome') {
    return (
      <Frame>
        <DesignWelcome
          onStart={() => {
            setActiveStep('requirements')
            setStepStatuses((prev) => ({ ...prev, requirements: 'active' }))
            setScreen({ kind: 'step', stepId: 'requirements' })
          }}
          onDefer={() => navigate('/projects')}
        />
      </Frame>
    )
  }

  if (screen.kind === 'transition') {
    const fromStep = DESIGN_STEPS[screen.fromIdx]
    const toStep = DESIGN_STEPS[screen.fromIdx + 1]
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
        <DesignComplete session={session} onNext={() => navigate('/projects')} />
      </Frame>
    )
  }

  // screen.kind === 'step'
  const currentStepDef = DESIGN_STEPS.find((s) => s.id === screen.stepId)!
  const header = STEP_HEADERS[screen.stepId]
  const isFirstStep = DESIGN_STEPS[0].id === screen.stepId
  const isLastStep = DESIGN_STEPS[DESIGN_STEPS.length - 1].id === screen.stepId
  const currentStepIdx = DESIGN_STEPS.findIndex((s) => s.id === screen.stepId)
  const totalQ = DESIGN_STEPS.length + 1
  const currentQ = currentStepIdx + 1

  const FOOTER_LABELS: Record<DesignStepId, string> = {
    requirements: '다음 질문 →',
    architecture: '데이터 구조로 →',
    'data-model': 'AI 흐름으로 →',
    'ai-workflow': '설계 완료',
  }

  const helperPanels: Partial<Record<DesignStepId, React.ReactNode>> = {
    architecture: <ArchHelperPanel />,
    'data-model': <DataHelperPanel />,
    'ai-workflow': <AiHelperPanel />,
  }
  const helperPanel = helperPanels[screen.stepId]

  return (
    <Frame>
      <div className="h-full flex">
        <DesignLeftRail
          project={project}
          activeStep={screen.stepId}
          stepStatuses={stepStatuses}
          onStepClick={handleStepClick}
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
            <div className="px-4 py-2 bg-red/10 text-red text-xs text-center border-b border-red/20">
              {error}
              <button
                type="button"
                onClick={() => setError(null)}
                className="ml-2 underline cursor-pointer bg-transparent border-none text-red text-xs"
              >
                닫기
              </button>
            </div>
          )}

          <div className="flex-1 overflow-auto px-6 py-5">
            {screen.stepId === 'requirements' && (
              <RequirementsStep
                session={session}
                generating={generating}
                onGenerate={() => handleGenerate('requirements')}
                onUpdateSession={setSession}
              />
            )}
            {screen.stepId === 'architecture' && (
              <ArchitectureStep
                session={session}
                generating={generating}
                onGenerate={(templateIndex: number) => handleGenerate('architecture', templateIndex)}
                loadingTemplates={loadingTemplates}
                onLoadTemplates={handleLoadTemplates}
              />
            )}
            {screen.stepId === 'data-model' && (
              <DataModelStep
                session={session}
                generating={generating}
                onGenerate={() => handleGenerate('data-model')}
                onUpdateSession={setSession}
              />
            )}
            {screen.stepId === 'ai-workflow' && (
              <AiWorkflowStep
                session={session}
                projectType={project.type}
                generating={generating}
                onGenerate={() => handleGenerate('ai-workflow')}
              />
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

        {helperPanel && (
          <div className="w-[300px] border-l border-border bg-surface px-5 py-[22px] overflow-auto shrink-0">
            {helperPanel}
          </div>
        )}
      </div>
    </Frame>
  )
}
