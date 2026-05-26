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

export interface DesignSession {
  id: string
  project_id: string
  current_step: DesignStepId
  requirements: Requirement[] | null
  architecture: Architecture | null
  data_model: DataModel | null
  ai_workflow: string | null
  status: 'in_progress' | 'completed'
}
