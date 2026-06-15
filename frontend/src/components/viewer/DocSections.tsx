import type { ReactNode } from 'react'
import Markdown from '../common/Markdown'
import {
  StatStrip,
  DataTable,
  MeterRow,
  LayerBand,
  NodeCard,
  Callout,
  Chip,
  priorityTone,
  severityTone,
  levelTone,
} from './blocks'

// Renders one section body as a dashboard summary, picked by `kind`.
// Falls back to raw markdown for unknown kinds.

export interface DocSection {
  id: string
  title: string
  kind: string
  status: 'complete' | 'empty'
  content: string
  data: any | null
}

const LEVEL_LABEL: Record<string, string> = { green: '양호', yellow: '주의', red: '위험' }

export default function DocSectionBody({ section }: { section: DocSection }) {
  const d = section.data
  if (!d) return <Markdown>{section.content}</Markdown>
  switch (section.kind) {
    case 'profile':
      return <ProfileBlock data={d} />
    case 'features':
      return <FeaturesBlock data={d} />
    case 'architecture':
      return <ArchitectureBlock data={d} />
    case 'data':
      return <DataModelBlock data={d} />
    case 'ai':
      return <AiFlowBlock data={d} />
    case 'evaluation':
      return <EvaluationBlock data={d} />
    case 'dod':
      return <DodBlock data={d} />
    default:
      return <Markdown>{section.content}</Markdown>
  }
}

function groupItems(groups: { label: string; items: string[] }[], label: string): string[] {
  return groups.find((g) => g.label === label)?.items ?? []
}

// ① 프로젝트 프로필 — 스탯 + 개요 콜아웃 + 그룹 카드
function ProfileBlock({ data }: { data: any }) {
  const groups: { label: string; items: string[] }[] = data.groups ?? []
  const features = groupItems(groups, '핵심 기능').length
  const risks = groupItems(groups, '리스크 · 대응').length
  return (
    <>
      <StatStrip
        valueSize="text-[19.8px]"
        items={[
          { value: data.meta?.project_type || '—', label: '유형' },
          { value: (data.meta?.language || 'ko').toUpperCase(), label: '언어' },
          { value: features, label: '핵심 기능' },
          { value: risks, label: '리스크', tone: risks ? 'red' : undefined },
        ]}
      />
      {data.lead && <Callout label="개요">{data.lead}</Callout>}
      <div className="grid grid-cols-2 gap-2.5">
        {groups.map((g, gi) => (
          <div
            key={g.label}
            className={`rounded-xl border border-border bg-surface px-4 py-3 ${
              gi === groups.length - 1 && groups.length % 2 === 1 ? 'col-span-2' : ''
            }`}
          >
            <div className="text-[11px] font-mono font-semibold text-text-subtle mb-2" style={{ letterSpacing: 0.3 }}>
              {g.label}
              <span className="ml-1.5 text-text-subtle/70">{g.items.length}</span>
            </div>
            <ul className="space-y-1">
              {g.items.map((it, i) => (
                <li key={i} className="text-[12.5px] text-text leading-relaxed flex gap-1.5">
                  <span className="text-text-subtle shrink-0">·</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  )
}

// ② 기능 정의 — 우선순위 스탯 + 데이터 표
function FeaturesBlock({ data }: { data: any }) {
  const reqs: any[] = data.requirements ?? []
  const c = data.counts ?? {}
  return (
    <>
      <StatStrip
        items={[
          { value: c.MUST ?? 0, label: 'MUST', tone: 'must' },
          { value: c.SHOULD ?? 0, label: 'SHOULD', tone: 'should' },
          { value: c.COULD ?? 0, label: 'COULD', tone: 'could' },
          { value: reqs.length, label: '전체' },
        ]}
      />
      <DataTable
        head={['우선순위', '요구사항', '완료 기준']}
        rows={reqs.map((r) => [
          <Chip tone={priorityTone(r.priority)}>{r.priority || '—'}</Chip>,
          <span className="font-medium">{r.text}</span>,
          <span className="text-text-muted text-[12px]">{r.acceptance_criteria || '—'}</span>,
        ])}
      />
    </>
  )
}

// ③ 시스템 구조 — 스탯 + 레이어 밴드 + 기술스택 + 콜아웃
function ArchitectureBlock({ data }: { data: any }) {
  const comps: any[] = data.components ?? []
  const tech: Record<string, string> = data.tech_stack ?? {}
  const techKeys = Object.keys(tech)
  return (
    <>
      <StatStrip
        items={[
          { value: comps.length, label: '구성 요소' },
          { value: techKeys.length, label: '기술 스택' },
        ]}
      />
      <LayerBand title="구성 요소" count={comps.length}>
        {comps.map((c, i) => (
          <NodeCard key={i} title={c.name} subtitle={c.technology || undefined} desc={c.description || undefined} />
        ))}
      </LayerBand>
      {techKeys.length > 0 && (
        <DataTable
          head={['영역', '기술']}
          rows={techKeys.map((k) => [
            <span className="font-medium text-text-muted">{k}</span>,
            <span className="font-mono text-[12px]">{tech[k]}</span>,
          ])}
        />
      )}
      {data.integration_notes && (
        <Callout label="설계 원칙">
          <Markdown>{data.integration_notes}</Markdown>
        </Callout>
      )}
      {data.has_mermaid && (
        <div className="text-[11.5px] text-text-subtle mt-1 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-text-subtle" />
          아키텍처 다이어그램은 Markdown 다운로드에 포함됩니다 (화면 렌더링은 준비 중)
        </div>
      )}
    </>
  )
}

// ④ 데이터 구조 — 스탯 + 엔티티별 표 + 관계
function DataModelBlock({ data }: { data: any }) {
  const entities: any[] = data.entities ?? []
  const rels: string[] = data.relationships ?? []
  const totalFields = entities.reduce((n, e) => n + (e.fields?.length ?? 0), 0)
  return (
    <>
      <StatStrip
        items={[
          { value: entities.length, label: '엔티티' },
          { value: totalFields, label: '필드' },
          { value: rels.length, label: '관계' },
        ]}
      />
      {entities.map((e, i) => (
        <div key={i} className="mb-4">
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="font-mono text-[13px] font-bold text-accent-deep">{e.name}</span>
            {e.description && <span className="text-[12px] text-text-muted">{e.description}</span>}
          </div>
          <DataTable
            head={['필드', '타입', '제약', '설명']}
            rows={(e.fields ?? []).map((f: any) => [
              <span className="font-mono text-[12px] font-medium">{f.name}</span>,
              <span className="font-mono text-[12px] text-text-muted">{f.type}</span>,
              <span className="font-mono text-[11px] text-text-subtle">{f.constraints || '—'}</span>,
              <span className="text-[12px] text-text-muted">{f.description || '—'}</span>,
            ])}
          />
        </div>
      ))}
      {rels.length > 0 && (
        <Callout label="관계">
          <ul className="space-y-1">
            {rels.map((r, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-text-subtle shrink-0">·</span>
                <span className="font-mono text-[12px]">{r}</span>
              </li>
            ))}
          </ul>
        </Callout>
      )}
    </>
  )
}

// ⑤ AI 흐름 — 스탯 + 개요 + 입력/출력/폴백 표
function AiFlowBlock({ data }: { data: any }) {
  const inputs: any[] = data.inputs ?? []
  const outputs: any[] = data.outputs ?? []
  const fallbacks: any[] = data.fallbacks ?? []
  const monitoring: string[] = data.monitoring ?? []
  const model = [data.model, data.model_version].filter(Boolean).join(' ')
  return (
    <>
      <StatStrip
        items={[
          { value: inputs.length, label: '입력' },
          { value: outputs.length, label: '출력' },
          { value: fallbacks.length, label: '폴백' },
          { value: monitoring.length, label: '모니터링' },
        ]}
      />
      {(model || data.task) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {model && <Chip tone="should">모델 · {model}</Chip>}
          {data.task && <Chip tone="neutral">작업 · {data.task}</Chip>}
        </div>
      )}
      {data.summary && <Callout label="개요">{data.summary}</Callout>}
      {inputs.length > 0 && (
        <>
          <SubLabel>입력</SubLabel>
          <DataTable
            head={['입력', '설명']}
            rows={inputs.map((i) => [
              <span className="font-medium">{i.name}</span>,
              <span className="text-text-muted text-[12px]">{i.description}</span>,
            ])}
          />
        </>
      )}
      {outputs.length > 0 && (
        <>
          <SubLabel>출력</SubLabel>
          <DataTable
            head={['출력', '설명', '형식']}
            rows={outputs.map((o) => [
              <span className="font-medium">{o.name}</span>,
              <span className="text-text-muted text-[12px]">{o.description}</span>,
              <span className="font-mono text-[11px] text-text-subtle">{o.format || '—'}</span>,
            ])}
          />
        </>
      )}
      {fallbacks.length > 0 && (
        <>
          <SubLabel>폴백 전략</SubLabel>
          <DataTable
            head={['조건', '대응']}
            rows={fallbacks.map((f) => [
              <span className="text-[12px]">{f.condition}</span>,
              <span className="text-text-muted text-[12px]">{f.action}</span>,
            ])}
          />
        </>
      )}
      {monitoring.length > 0 && (
        <Callout label="모니터링">
          <ul className="space-y-1">
            {monitoring.map((m, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-text-subtle shrink-0">·</span>
                <span className="text-[12.5px]">{m}</span>
              </li>
            ))}
          </ul>
        </Callout>
      )}
    </>
  )
}

// ⑥ 정직한 평가 — 판정 스탯 + 미터행 + 권고 콜아웃
function EvaluationBlock({ data }: { data: any }) {
  const dims: any[] = data.dimensions ?? []
  const scored = dims.filter((d) => typeof d.score === 'number')
  const avg = scored.length ? (scored.reduce((s, d) => s + d.score, 0) / scored.length).toFixed(1) : '—'
  const overall = (data.overall_level || '').toLowerCase()
  return (
    <>
      <StatStrip
        items={[
          {
            value: <Chip tone={levelTone(overall)}>{LEVEL_LABEL[overall] || overall || '—'}</Chip>,
            label: '종합 판정',
          },
          { value: avg, label: '평균 점수' },
          { value: dims.length, label: '평가 항목' },
        ]}
      />
      <div className="rounded-xl border border-border bg-surface px-4 py-1.5 mb-3">
        {dims.map((d, i) => (
          <MeterRow
            key={i}
            label={d.name}
            score={typeof d.score === 'number' ? d.score : null}
            tone={levelTone(d.level)}
            sub={d.comment}
          />
        ))}
      </div>
      {data.recommendation && (
        <Callout label="권고" tone={levelTone(overall)}>
          {data.recommendation}
        </Callout>
      )}
    </>
  )
}

// ⑦ 완료 조건 — 스탯 + DoD 표 + 빈틈 카드 + 체크리스트
function DodBlock({ data }: { data: any }) {
  const crit: any[] = data.criteria ?? []
  const gaps: any[] = data.gaps ?? []
  const checklist: any[] = data.checklist ?? []
  const measurable = crit.filter((c) => c.measurable).length
  const sevCount = (s: string) => gaps.filter((g) => g.severity === s).length
  return (
    <>
      <StatStrip
        items={[
          { value: crit.length, label: '완료 조건' },
          { value: measurable, label: '측정 가능' },
          {
            value: (
              <div className="flex items-center gap-2 font-mono text-[15px] font-bold">
                <span className="text-red">{sevCount('high')}</span>
                <span className="text-amber">{sevCount('medium')}</span>
                <span className="text-green">{sevCount('low')}</span>
              </div>
            ),
            label: '빈틈 (높·중·낮)',
          },
          { value: checklist.length, label: '체크리스트' },
        ]}
      />

      {crit.length > 0 && (
        <>
          <SubLabel>완료 조건 (DoD)</SubLabel>
          <DataTable
            head={['구분', '완료 조건', '측정']}
            rows={crit.map((c) => [
              c.category ? <Chip tone="neutral">{c.category}</Chip> : '—',
              <span className="text-[12.5px]">{c.text}</span>,
              c.measurable ? <span className="text-green font-mono text-[12px]">✓</span> : <span className="text-text-subtle">—</span>,
            ])}
          />
        </>
      )}

      {gaps.length > 0 && (
        <>
          <SubLabel>빈틈 점검</SubLabel>
          <div className="space-y-2 mb-2">
            {gaps.map((g, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <Chip tone={severityTone(g.severity)}>{g.type || g.severity}</Chip>
                </div>
                <div className="text-[12.5px] text-text leading-relaxed">{g.issue}</div>
                {g.suggestion && (
                  <div className="text-[12px] text-text-muted leading-relaxed mt-1.5">
                    <span className="font-semibold text-text-subtle">제안 · </span>
                    {g.suggestion}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {checklist.length > 0 && (
        <>
          <SubLabel>착수 체크리스트</SubLabel>
          <div className="rounded-xl border border-border bg-surface px-4 py-2">
            {checklist.map((it, i) => (
              <div key={i} className="flex items-start gap-2.5 py-1.5 border-b border-border last:border-b-0">
                <span
                  className={`mt-0.5 w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center text-[9px] font-mono ${
                    it.done ? 'bg-green-soft border-green text-green' : 'border-border-strong text-transparent'
                  }`}
                >
                  ✓
                </span>
                {it.area && <Chip tone="neutral">{it.area}</Chip>}
                <span className="text-[12.5px] text-text leading-snug flex-1">{it.task}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}

function SubLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-mono font-semibold text-text-subtle mt-3 mb-1.5" style={{ letterSpacing: 0.3 }}>
      {children}
    </div>
  )
}
