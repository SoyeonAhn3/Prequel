import { useEffect, useMemo } from 'react'
import Explainer from './Explainer'
import type { DesignSession } from './types'

interface ParsedWorkflow {
  inputs: string[]
  outputs: string[]
  model: string
  modelVersion: string
  task: string
  fallbacks: { icon: string; bg: string; title: string; action: string }[]
}

function extractBullets(text: string, sectionPattern: RegExp, limit = 6): string[] {
  const match = text.match(sectionPattern)
  if (!match) return []
  const afterMatch = text.slice(match.index! + match[0].length)
  const nextSection = afterMatch.search(/\n#{1,3}\s/)
  const section = nextSection > -1 ? afterMatch.slice(0, nextSection) : afterMatch
  const bullets = section
    .split('\n')
    .map((l) => l.replace(/^[\s]*[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
    .filter((l) => l.length > 0 && l.length < 120 && !l.startsWith('#'))
    .slice(0, limit)
  return bullets
}

function parseAiWorkflow(raw: string): ParsedWorkflow {
  const defaults: ParsedWorkflow = {
    inputs: ['사용자 요청 데이터', '컨텍스트 정보'],
    outputs: ['AI 처리 결과', '구조화된 응답'],
    model: 'Claude',
    modelVersion: 'sonnet',
    task: 'AI 처리',
    fallbacks: [
      { icon: '⏱', bg: 'bg-amber-soft', title: 'AI 응답 지연 시', action: '타임아웃 후 기본 응답 반환' },
      { icon: '✕', bg: 'bg-red-soft', title: 'AI 응답 오류 시', action: '재시도 후 기본값 반환' },
    ],
  }

  if (!raw || raw.trim().length < 20) return defaults

  const inputs = extractBullets(raw, /#{1,3}\s*(추론\s*흐름|데이터\s*파이프라인|입력|input)/i)
  const outputs = extractBullets(raw, /#{1,3}\s*(출력|output|응답|결과)/i)

  let model = 'Claude'
  let modelVersion = 'sonnet'
  const modelMatch = raw.match(/(?:Claude|GPT|Gemini)[\s-]*(\S*)/i)
  if (modelMatch) {
    model = modelMatch[0].split(/[\s-]/)[0]
    modelVersion = modelMatch[1] || 'sonnet'
  }

  let task = 'AI 처리'
  const taskMatch = raw.match(/AI가?\s*(.*?(?:생성|추천|분석|분류|예측|요약|번역))/i)
  if (taskMatch) task = taskMatch[1].trim().slice(0, 20)

  const opSection = extractBullets(raw, /#{1,3}\s*(운영\s*고려|모니터링|폴백|fallback|장애|비용)/i, 5)
  const fallbacks: ParsedWorkflow['fallbacks'] = []
  const icons = ['⏱', '✕', '💰', '🔄', '📊']
  const bgs = ['bg-amber-soft', 'bg-red-soft', 'bg-surface-alt', 'bg-accent-soft', 'bg-green-soft']
  for (let i = 0; i < Math.min(opSection.length, 4); i++) {
    const line = opSection[i]
    const colonIdx = line.indexOf(':')
    if (colonIdx > 0 && colonIdx < line.length - 1) {
      fallbacks.push({ icon: icons[i % icons.length], bg: bgs[i % bgs.length], title: line.slice(0, colonIdx).trim(), action: line.slice(colonIdx + 1).trim() })
    } else {
      fallbacks.push({ icon: icons[i % icons.length], bg: bgs[i % bgs.length], title: line, action: '정의됨' })
    }
  }

  return {
    inputs: inputs.length > 0 ? inputs : defaults.inputs,
    outputs: outputs.length > 0 ? outputs : defaults.outputs,
    model,
    modelVersion,
    task,
    fallbacks: fallbacks.length > 0 ? fallbacks : defaults.fallbacks,
  }
}

interface AiWorkflowStepProps {
  session: DesignSession | null
  projectType: string
  generating: boolean
  onGenerate: () => void
}

export default function AiWorkflowStep({ session, projectType, generating, onGenerate }: AiWorkflowStepProps) {
  const aiWorkflow = session?.ai_workflow
  const isAiProject = /ai|ml|머신러닝|딥러닝|추천|예측|분류|생성/i.test(projectType)

  useEffect(() => {
    if (isAiProject && !aiWorkflow && !generating) {
      onGenerate()
    }
  }, [isAiProject, aiWorkflow, generating, onGenerate])

  const parsed = useMemo(() => parseAiWorkflow(aiWorkflow ?? ''), [aiWorkflow])

  if (!isAiProject) {
    return (
      <div className="pb-7 text-center py-12">
        <div className="w-14 h-14 rounded-full bg-surface-alt flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚀</span>
        </div>
        <h3 className="text-base font-bold text-text mb-2">AI 워크플로우가 필요하지 않습니다</h3>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          이 프로젝트는 AI/ML 유형이 아니므로 이 단계를 건너뜁니다.
          "다음 단계" 버튼을 눌러 설계를 완료해주세요.
        </p>
      </div>
    )
  }

  if (generating) {
    return (
      <div className="pb-7">
        <Explainer
          title="AI 흐름 = AI Workflow"
          technical="I/O + Fallback"
          plain="AI(Claude)가 어떤 정보를 받고 무엇을 만들지, 그리고 잘못되었을 때 대처법을 정하는 단계예요."
          example="입력: 사용자 부서 + 지난주 인기 책 → AI 처리 → 출력: 추천 책 카드 1개 (제목 + 이유 2줄)"
        />
        <div className="text-center py-12">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <p className="text-sm text-text-muted">AI가 워크플로우를 자동으로 설계하고 있습니다...</p>
          <p className="text-xs text-text-subtle mt-1">약 30초 소요됩니다</p>
        </div>
      </div>
    )
  }

  if (!aiWorkflow) {
    return (
      <div className="pb-7 text-center py-12">
        <p className="text-sm text-text-muted">AI 워크플로우를 생성하는 중 오류가 발생했습니다.</p>
        <button
          type="button"
          onClick={onGenerate}
          className="mt-4 px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl cursor-pointer border-none"
        >
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className="pb-7">
      <Explainer
        title="AI 흐름 = AI Workflow"
        technical="I/O + Fallback"
        plain="AI(Claude)가 어떤 정보를 받고 무엇을 만들지, 그리고 잘못되었을 때 대처법을 정하는 단계예요."
        example="입력: 사용자 부서 + 지난주 인기 책 → AI 처리 → 출력: 추천 책 카드 1개 (제목 + 이유 2줄)"
      />

      {/* IO Pipeline visual */}
      <div className="text-[13px] font-bold text-text mb-2.5">AI의 입출력 흐름</div>
      <div className="bg-surface border border-border rounded-[14px] p-5 mb-6">
        <div className="grid grid-cols-[1fr_50px_1fr_50px_1fr] gap-0 items-center">
          {/* INPUT */}
          <div
            className="bg-accent-soft rounded-xl p-3.5"
            style={{ border: '1px solid color-mix(in srgb, var(--color-accent) 18%, transparent)' }}
          >
            <div className="text-[10.5px] font-mono text-accent font-bold mb-2" style={{ letterSpacing: 0.4 }}>
              📥 입력 (INPUT)
            </div>
            <div className="text-xs text-accent-deep leading-[1.65]">
              {parsed.inputs.map((item, i) => (
                <span key={i}>• {item}{i < parsed.inputs.length - 1 && <br />}</span>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
              <path d="M2 10 H28 M22 4 L28 10 L22 16" stroke="var(--color-border-strong)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* AI */}
          <div
            className="text-white px-[18px] py-5 rounded-[14px] text-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-deep) 100%)',
              boxShadow: '0 8px 24px -8px color-mix(in srgb, var(--color-accent) 50%, transparent)',
            }}
          >
            <div className="text-[10.5px] font-mono opacity-80 font-bold mb-2" style={{ letterSpacing: 0.4 }}>🤖 AI</div>
            <div className="text-base font-bold mb-1" style={{ letterSpacing: -0.3 }}>{parsed.model}</div>
            <div className="text-[11px] opacity-85 font-mono">{parsed.modelVersion}</div>
            <div className="mt-3 px-2.5 py-1.5 bg-white/15 rounded-full text-[10.5px] font-semibold inline-block">{parsed.task}</div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
              <path d="M2 10 H28 M22 4 L28 10 L22 16" stroke="var(--color-border-strong)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* OUTPUT */}
          <div
            className="bg-green-soft rounded-xl p-3.5"
            style={{ border: '1px solid color-mix(in srgb, var(--color-green) 18%, transparent)' }}
          >
            <div className="text-[10.5px] font-mono font-bold mb-2" style={{ letterSpacing: 0.4, color: '#2f5a44' }}>
              📤 출력 (OUTPUT)
            </div>
            <div className="text-xs leading-[1.65]" style={{ color: '#2f5a44' }}>
              {parsed.outputs.map((item, i) => (
                <span key={i}>• {item}{i < parsed.outputs.length - 1 && <br />}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fallback section */}
      <div className="text-[13px] font-bold text-text mt-6 mb-1.5">
        실패하면 어떻게 할까요? <span className="font-medium text-text-muted text-xs">(폴백 전략)</span>
      </div>
      <p className="text-[12.5px] text-text-muted leading-relaxed mb-3.5">
        AI가 답을 못 주거나 느릴 때의 대처법이에요.
      </p>
      <div className="flex flex-col gap-2">
        {parsed.fallbacks.map((rule, i) => (
          <div key={i} className="flex gap-3 p-[12px_14px] bg-surface border border-border rounded-[10px] items-start">
            <div className={`w-[30px] h-[30px] rounded-lg ${rule.bg} flex items-center justify-center text-sm shrink-0 font-bold`}>
              {rule.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-text">{rule.title}</div>
              <div className="text-xs mt-[3px] leading-relaxed text-text-muted">
                → {rule.action}
              </div>
            </div>
            <span className="text-[11px] font-semibold text-green px-2 py-[3px] bg-green-soft rounded">정의됨</span>
          </div>
        ))}
      </div>

    </div>
  )
}
