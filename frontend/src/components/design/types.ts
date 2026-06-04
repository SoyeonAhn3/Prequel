export interface DesignStepDef {
  id: DesignStepId
  num: string
  title: string
  subtitle: string
  icon: DesignIconKind
}

export type DesignStepId = 'requirements' | 'architecture' | 'data-model' | 'ai-workflow'

export type DesignIconKind =
  | 'features'
  | 'arch'
  | 'data'
  | 'ai'
  | 'help'
  | 'bulb'
  | 'eye'
  | 'check'

export type DesignStepStatus = 'done' | 'active' | 'pending' | 'generating'

export const DESIGN_STEPS: DesignStepDef[] = [
  { id: 'requirements', num: '01', title: '기능 정의', subtitle: '무엇을 만들지', icon: 'features' },
  { id: 'architecture', num: '02', title: '시스템 구조', subtitle: '어떻게 연결할지', icon: 'arch' },
  { id: 'data-model', num: '03', title: '데이터 구조', subtitle: '무엇을 저장할지', icon: 'data' },
  { id: 'ai-workflow', num: '04', title: 'AI 흐름', subtitle: 'AI를 어떻게 쓸지', icon: 'ai' },
]

export interface Requirement {
  id: string
  category: string
  text: string
  priority: 'must' | 'should' | 'could'
  acceptance_criteria: string
  status: 'accepted' | 'edited' | 'rejected' | 'pending'
}

export interface ArchComponent {
  name: string
  description: string
  technology: string
  role: string
}

export interface Architecture {
  components: ArchComponent[]
  tech_stack: Record<string, string>
  mermaid_code: string
  integration_notes: string
}

export interface DataEntity {
  name: string
  description: string
  fields: { name: string; type: string; description: string; constraints: string }[]
}

export interface DataModel {
  entities: DataEntity[]
  mermaid_code: string
  relationships: string[]
}

export interface ArchTemplate {
  title: string
  badge: string
  desc: string
}

export interface AiWorkflowInput {
  name: string
  description: string
}

export interface AiWorkflowOutput {
  name: string
  description: string
  format: string
}

export interface AiWorkflowFallback {
  condition: string
  action: string
}

export interface AiWorkflow {
  summary: string
  model: string
  model_version: string
  task: string
  inputs: AiWorkflowInput[]
  outputs: AiWorkflowOutput[]
  fallbacks: AiWorkflowFallback[]
  monitoring: string[]
}

export interface DesignSession {
  id: string
  project_id: string
  current_step: DesignStepId
  requirements: Requirement[] | null
  architecture: Architecture | null
  data_model: DataModel | null
  ai_workflow: AiWorkflow | null
  arch_templates: ArchTemplate[] | null
  status: 'in_progress' | 'completed'
}

// ─── Phase 6: Evaluation & Finalization ───────────────────

export type FinalizeStepId = 'evaluate' | 'done' | 'gap' | 'checklist'

export interface FinalizeStepDef {
  id: FinalizeStepId
  num: string
  title: string
  subtitle: string
  icon: DesignIconKind
}

export const FINALIZE_STEPS: FinalizeStepDef[] = [
  { id: 'evaluate', num: '01', title: '정직한 평가', subtitle: '이 계획 괜찮을까', icon: 'eye' },
  { id: 'done', num: '02', title: '완료 조건', subtitle: '뭘 하면 끝인지', icon: 'check' },
  { id: 'gap', num: '03', title: '빈틈 점검', subtitle: '놓친 건 없는지', icon: 'help' },
  { id: 'checklist', num: '04', title: '착수 준비', subtitle: '시작 전 준비물', icon: 'features' },
]

export type FinalizeLevel = 'green' | 'yellow' | 'red'

export interface EvalDimension {
  name: string
  applicable: boolean
  level: FinalizeLevel
  score: number
  comment: string
}

export interface Evaluation {
  dimensions: EvalDimension[]
  overall_level: FinalizeLevel
  recommendation: string
}

export interface DoneCriterion {
  category: string
  text: string
  measurable: boolean
}

export interface DoneCriteria {
  criteria: DoneCriterion[]
}

export interface GapItem {
  type: string
  category: string
  issue: string
  severity: 'high' | 'medium' | 'low'
  suggestion: string
}

export interface Gaps {
  gaps: GapItem[]
}

export interface ChecklistItem {
  area: string
  task: string
  done: boolean
}

export interface Checklist {
  items: ChecklistItem[]
}

export interface FinalizeSession {
  id: string
  project_id: string
  current_step: FinalizeStepId
  evaluation: Evaluation | null
  done_criteria: DoneCriteria | null
  gaps: Gaps | null
  checklist: Checklist | null
  status: 'in_progress' | 'completed'
}
