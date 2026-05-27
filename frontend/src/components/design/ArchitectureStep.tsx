import { useEffect, useState } from 'react'
import Explainer from './Explainer'
import TemplateCard from './TemplateCard'
import Tag from '../common/Tag'
import type { DesignSession, ArchComponent, ArchTemplate } from './types'

interface ArchitectureStepProps {
  session: DesignSession | null
  generating: boolean
  onGenerate: (templateIndex: number) => void
  loadingTemplates: boolean
  onLoadTemplates: () => void
}

function getRoleColor(role: string) {
  const r = role.toLowerCase()
  if (/front|화면|ui|웹|react|next|vue/.test(r))
    return { bg: 'bg-accent-soft', text: 'text-accent' }
  if (/back|서버|api|server|fastapi|node|python/.test(r))
    return { bg: 'bg-amber-soft', text: 'text-amber' }
  if (/data|db|저장|데이터|supabase|postgres|mysql/.test(r))
    return { bg: 'bg-green-soft', text: 'text-green' }
  if (/ai|ml|claude|llm|추천|분석/.test(r))
    return { bg: 'bg-red-soft', text: 'text-red' }
  if (/외부|external|slack|알림|연동|third/.test(r))
    return { bg: 'bg-surface-alt', text: 'text-text-muted' }
  return { bg: 'bg-surface-alt', text: 'text-text-muted' }
}

function getCompColor(name: string, technology: string, role: string) {
  const combined = `${name} ${technology} ${role}`.toLowerCase()
  if (/front|화면|ui|웹|react|next|vue/.test(combined))
    return { numBg: 'bg-accent-soft', numText: 'text-accent', roleBg: 'bg-accent-soft', roleText: 'text-accent' }
  if (/back|서버|api|server|fastapi|node|python/.test(combined))
    return { numBg: 'bg-amber-soft', numText: 'text-amber', roleBg: 'bg-amber-soft', roleText: 'text-amber' }
  if (/data|db|저장|데이터|supabase|postgres|mysql/.test(combined))
    return { numBg: 'bg-green-soft', numText: 'text-green', roleBg: 'bg-green-soft', roleText: 'text-green' }
  if (/ai|ml|claude|llm|추천|분석/.test(combined))
    return { numBg: 'bg-red-soft', numText: 'text-red', roleBg: 'bg-red-soft', roleText: 'text-red' }
  if (/외부|external|slack|알림|연동|third/.test(combined))
    return { numBg: 'bg-surface-alt', numText: 'text-text-muted', roleBg: 'bg-surface-alt', roleText: 'text-text-muted' }
  return { numBg: 'bg-surface-alt', numText: 'text-text-muted', roleBg: 'bg-surface-alt', roleText: 'text-text-muted' }
}

const FALLBACK_TEMPLATES: ArchTemplate[] = [
  { title: '간단한 조합', badge: '추천', desc: 'React + FastAPI + Supabase. 시작하기 가장 쉽고 빠릅니다.' },
  { title: '확장 가능한 조합', badge: '', desc: 'Next.js + Node + PostgreSQL + Redis. 확장성이 좋습니다.' },
]

export default function ArchitectureStep({ session, generating, onGenerate, loadingTemplates, onLoadTemplates }: ArchitectureStepProps) {
  const architecture = session?.architecture
  const templates = session?.arch_templates ?? (loadingTemplates ? null : FALLBACK_TEMPLATES)
  const [selectedTemplate, setSelectedTemplate] = useState(0)

  useEffect(() => {
    if (!architecture && !session?.arch_templates && !loadingTemplates) {
      onLoadTemplates()
    }
  }, [architecture, session?.arch_templates, loadingTemplates, onLoadTemplates])

  if (!architecture && !generating) {
    return (
      <div className="pb-7">
        <Explainer
          title="시스템 구조 = 아키텍처 (Architecture)"
          technical="System Architecture"
          plain="앱을 만들기 위해 필요한 '부품'들과 그것들이 어떻게 연결되는지를 그린 그림이에요. 레고 조립도라고 생각하시면 돼요."
          example="화면(React) ↔ 서버(FastAPI) ↔ 데이터(Supabase) — 셋 다 인기 부품들이에요"
        />

        <div className="text-[13px] font-bold text-text mb-1.5">먼저 — 추천 조합 골라보기</div>
        <p className="text-[12.5px] text-text-muted leading-relaxed mb-3.5">
          프로젝트 유형에 맞는 조합을 AI가 추려두었어요. 잘 모르겠으면 첫 번째를 고르세요.
        </p>

        {loadingTemplates || !templates ? (
          <div className="text-center py-8 mb-7">
            <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center mx-auto mb-2 animate-pulse">
              <span className="text-accent text-xs font-bold">AI</span>
            </div>
            <p className="text-xs text-text-muted">프로젝트에 맞는 조합을 분석하고 있어요...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 mb-7">
            {templates.map((t, i) => (
              <TemplateCard
                key={t.title}
                title={t.title}
                badge={t.badge || undefined}
                desc={t.desc}
                selected={selectedTemplate === i}
                onClick={() => setSelectedTemplate(i)}
              />
            ))}
          </div>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => onGenerate(selectedTemplate)}
            disabled={loadingTemplates || !templates}
            className="px-7 py-3.5 bg-accent text-white text-[15.4px] font-semibold rounded-2xl cursor-pointer border-none inline-flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            AI로 아키텍처 설계하기
          </button>
          <p className="text-xs text-text-muted mt-3">선택한 조합을 바탕으로 시스템 구조를 설계합니다</p>
        </div>
      </div>
    )
  }

  if (generating) {
    return (
      <div className="pb-7 text-center py-12">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3 animate-pulse">
          <span className="text-white text-sm font-bold">P</span>
        </div>
        <p className="text-sm text-text-muted">AI가 시스템 구조를 설계하고 있습니다...</p>
        <p className="text-xs text-text-subtle mt-1">약 20초 소요됩니다</p>
      </div>
    )
  }

  return (
    <div className="pb-7">
      <Explainer
        title="시스템 구조 = 아키텍처 (Architecture)"
        technical="System Architecture"
        plain="앱을 만들기 위해 필요한 '부품'들과 그것들이 어떻게 연결되는지를 그린 그림이에요. 레고 조립도라고 생각하시면 돼요."
        example="화면(React) ↔ 서버(FastAPI) ↔ 데이터(Supabase) — 셋 다 인기 부품들이에요"
      />

      {/* Template selection */}
      {templates && templates.length > 0 && (
        <>
          <div className="text-[13px] font-bold text-text mb-1.5">추천 조합</div>
          <div className="grid grid-cols-2 gap-2.5 mb-7">
            {templates.map((t, i) => (
              <TemplateCard
                key={t.title}
                title={t.title}
                badge={t.badge || undefined}
                desc={t.desc}
                selected={selectedTemplate === i}
                onClick={() => setSelectedTemplate(i)}
              />
            ))}
          </div>
        </>
      )}

      <div className="text-[13px] font-bold text-text mb-2.5 flex items-center gap-1.5">
        선택한 조합 미리보기
        {templates && templates[selectedTemplate] && (
          <Tag tone="accent">{templates[selectedTemplate].title}</Tag>
        )}
      </div>

      {/* SVG System Architecture Diagram */}
      <DynamicArchDiagram components={architecture!.components} />

      {/* Components list — numbered, color-coded */}
      <div className="text-[13px] font-bold text-text mt-6 mb-2.5">각 부품을 왜 골랐나요?</div>
      <div className="flex flex-col gap-2">
        {architecture!.components.map((comp, i) => {
          const c = getCompColor(comp.name, comp.technology, comp.role)
          return (
            <div key={i} className="flex gap-3.5 p-[12px_14px] bg-surface border border-border rounded-[10px] items-start">
              <span className={`w-[30px] h-[30px] rounded-lg ${c.numBg} ${c.numText} flex items-center justify-center text-[13px] font-bold shrink-0`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-text">
                  {comp.name}
                  {comp.technology && (
                    <span className={`text-[10px] font-mono ml-1.5 px-1.5 py-0.5 ${c.roleBg} ${c.roleText} rounded`}>
                      {comp.technology}
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-muted mt-[3px] leading-relaxed">{comp.description}</div>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-[3px] ${c.roleBg} ${c.roleText} rounded shrink-0 mt-0.5`}>
                {comp.role}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

type RoleCategory = 'frontend' | 'backend' | 'data' | 'ai' | 'external'

const ROLE_COLORS: Record<RoleCategory, { fill: string; stroke: string; titleFill: string; textFill: string }> = {
  frontend: { fill: 'var(--color-accent-soft)', stroke: 'var(--color-accent)', titleFill: 'var(--color-accent-deep)', textFill: 'var(--color-accent)' },
  backend: { fill: 'var(--color-accent-soft)', stroke: 'var(--color-accent)', titleFill: 'var(--color-accent-deep)', textFill: 'var(--color-accent)' },
  data: { fill: 'var(--color-green-soft)', stroke: 'var(--color-green)', titleFill: '#2f5a44', textFill: 'var(--color-green)' },
  ai: { fill: 'var(--color-amber-soft)', stroke: 'var(--color-amber)', titleFill: '#7c5c20', textFill: 'var(--color-amber)' },
  external: { fill: 'var(--color-surface-alt)', stroke: 'var(--color-border-strong)', titleFill: 'var(--color-text)', textFill: 'var(--color-text-muted)' },
}

function categorizeComponent(comp: ArchComponent): RoleCategory {
  const combined = `${comp.name} ${comp.technology} ${comp.role}`.toLowerCase()
  if (/front|화면|ui|웹|react|next|vue|angular/.test(combined)) return 'frontend'
  if (/back|서버|api|server|fastapi|node|python|express/.test(combined)) return 'backend'
  if (/data|db|저장|데이터|supabase|postgres|mysql|redis|mongo|storage/.test(combined)) return 'data'
  if (/ai|ml|claude|llm|추천|분석|gpt|anthropic|model/.test(combined)) return 'ai'
  return 'external'
}

const LEGEND = [
  { cls: 'bg-accent-soft', border: 'var(--color-accent)', label: '사용자가 보는 것' },
  { cls: 'bg-green-soft', border: 'var(--color-green)', label: '저장되는 것' },
  { cls: 'bg-amber-soft', border: 'var(--color-amber)', label: 'AI가 처리하는 것' },
]

const LAYER_ORDER: RoleCategory[] = ['frontend', 'backend', 'data', 'ai', 'external']

function DynamicArchDiagram({ components }: { components: ArchComponent[] }) {
  const layers = new Map<RoleCategory, ArchComponent[]>()
  for (const comp of components) {
    const cat = categorizeComponent(comp)
    if (!layers.has(cat)) layers.set(cat, [])
    layers.get(cat)!.push(comp)
  }

  const orderedLayers = LAYER_ORDER.filter((l) => layers.has(l))
  const BOX_W = 130
  const BOX_H = 56
  const COL_GAP = 30
  const ROW_GAP = 14
  const PADDING = 20

  const colX: number[] = []
  let x = PADDING
  for (const layer of orderedLayers) {
    colX.push(x)
    x += BOX_W + COL_GAP
  }
  const totalW = x - COL_GAP + PADDING

  let maxColH = 0
  for (const layer of orderedLayers) {
    const count = layers.get(layer)!.length
    const h = count * BOX_H + (count - 1) * ROW_GAP
    if (h > maxColH) maxColH = h
  }
  const totalH = maxColH + PADDING * 2

  type BoxPos = { cx: number; cy: number; comp: ArchComponent; cat: RoleCategory }
  const boxes: BoxPos[] = []

  for (let ci = 0; ci < orderedLayers.length; ci++) {
    const layer = orderedLayers[ci]
    const items = layers.get(layer)!
    const colH = items.length * BOX_H + (items.length - 1) * ROW_GAP
    const startY = PADDING + (maxColH - colH) / 2
    for (let ri = 0; ri < items.length; ri++) {
      const bx = colX[ci]
      const by = startY + ri * (BOX_H + ROW_GAP)
      boxes.push({ cx: bx + BOX_W / 2, cy: by + BOX_H / 2, comp: items[ri], cat: layer })
    }
  }

  const arrows: { x1: number; y1: number; x2: number; y2: number }[] = []
  for (let ci = 0; ci < orderedLayers.length - 1; ci++) {
    const curLayer = orderedLayers[ci]
    const nextLayer = orderedLayers[ci + 1]
    const curBoxes = boxes.filter((b) => b.cat === curLayer)
    const nextBoxes = boxes.filter((b) => b.cat === nextLayer)
    for (const cb of curBoxes) {
      for (const nb of nextBoxes) {
        arrows.push({
          x1: cb.cx + BOX_W / 2 - 2,
          y1: cb.cy,
          x2: nb.cx - BOX_W / 2 + 2,
          y2: nb.cy,
        })
      }
    }
  }

  return (
    <div className="bg-surface border border-border rounded-[14px] p-[18px_20px_14px] mb-[18px]">
      <svg viewBox={`0 0 ${totalW} ${totalH}`} style={{ display: 'block', width: '100%', maxWidth: 720, margin: '0 auto' }}>
        <defs>
          <marker id="arrDyn" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="var(--color-border-strong)" />
          </marker>
        </defs>
        {arrows.map((a, i) => (
          <path
            key={i}
            d={`M${a.x1} ${a.y1} L${a.x2} ${a.y2}`}
            stroke="var(--color-border-strong)"
            strokeWidth="1.5"
            fill="none"
            markerEnd="url(#arrDyn)"
          />
        ))}
        {boxes.map((b, i) => {
          const col = ROLE_COLORS[b.cat]
          const bx = b.cx - BOX_W / 2
          const by = b.cy - BOX_H / 2
          const name = b.comp.name.length > 16 ? b.comp.name.slice(0, 15) + '…' : b.comp.name
          const tech = b.comp.technology?.length > 18 ? b.comp.technology.slice(0, 17) + '…' : b.comp.technology
          return (
            <g key={i} transform={`translate(${bx} ${by})`}>
              <rect width={BOX_W} height={BOX_H} rx="10" fill={col.fill} stroke={col.stroke} />
              <text x={BOX_W / 2} y={22} fontSize="11" fontWeight="700" textAnchor="middle" fill={col.titleFill} style={{ fontFamily: 'var(--font-sans)' }}>
                {name}
              </text>
              {tech && (
                <text x={BOX_W / 2} y={38} fontSize="9" textAnchor="middle" fill={col.textFill} style={{ fontFamily: 'var(--font-mono)' }}>
                  {tech}
                </text>
              )}
              <text x={BOX_W / 2} y={tech ? 50 : 38} fontSize="9" textAnchor="middle" fill={col.textFill} style={{ fontFamily: 'var(--font-sans)' }}>
                {b.comp.role.length > 18 ? b.comp.role.slice(0, 17) + '…' : b.comp.role}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="flex gap-3.5 mt-4 pt-4 border-t border-border text-[11.5px] text-text-muted">
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-[5px]">
            <span className={`w-2.5 h-2.5 rounded-[3px] ${l.cls}`} style={{ border: `1px solid ${l.border}` }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  )
}
