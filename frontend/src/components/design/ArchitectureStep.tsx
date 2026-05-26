import { useState } from 'react'
import Explainer from './Explainer'
import TemplateCard from './TemplateCard'
import DesignIcon from './DesignIcon'
import Tag from '../common/Tag'
import type { DesignSession } from './types'

interface ArchitectureStepProps {
  session: DesignSession | null
  generating: boolean
  onGenerate: () => void
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

const TEMPLATES = [
  { title: '간단한 조합', badge: '추천', desc: 'React + FastAPI + Supabase. 시작하기 가장 쉽고 빠릅니다. 사용자가 ~수백 명일 때 적합.' },
  { title: '확장 가능한 조합', desc: 'Next.js + Node + PostgreSQL + Redis. 사용자가 늘어나도 안정적. 처음엔 복잡.' },
]

export default function ArchitectureStep({ session, generating, onGenerate }: ArchitectureStepProps) {
  const architecture = session?.architecture
  const [selectedTemplate, setSelectedTemplate] = useState(0)

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
          프로젝트 유형에 맞는 2가지 조합을 AI가 추려두었어요. 잘 모르겠으면 첫 번째를 고르세요.
        </p>

        <div className="grid grid-cols-2 gap-2.5 mb-7">
          {TEMPLATES.map((t, i) => (
            <TemplateCard
              key={t.title}
              title={t.title}
              badge={t.badge}
              desc={t.desc}
              selected={selectedTemplate === i}
              onClick={() => setSelectedTemplate(i)}
            />
          ))}
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onGenerate}
            className="px-6 py-3 bg-accent text-white text-sm font-semibold rounded-xl cursor-pointer border-none inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
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
      <div className="text-[13px] font-bold text-text mb-1.5">먼저 — 추천 조합 골라보기</div>
      <p className="text-[12.5px] text-text-muted leading-relaxed mb-3.5">
        프로젝트 유형(AI/ML)에 맞는 2가지 조합을 AI가 추려두었어요. 잘 모르겠으면 첫 번째를 고르세요.
      </p>
      <div className="grid grid-cols-2 gap-2.5 mb-7">
        {TEMPLATES.map((t, i) => (
          <TemplateCard
            key={t.title}
            title={t.title}
            badge={t.badge}
            desc={t.desc}
            selected={selectedTemplate === i}
            onClick={() => setSelectedTemplate(i)}
          />
        ))}
      </div>

      <div className="text-[13px] font-bold text-text mb-2.5 flex items-center gap-1.5">
        선택한 조합 미리보기
        <Tag tone="accent">{TEMPLATES[selectedTemplate].title}</Tag>
      </div>

      {/* SVG System Architecture Diagram */}
      <div className="bg-surface border border-border rounded-[14px] p-[18px_20px_14px] mb-[18px]">
        <svg viewBox="0 0 720 220" style={{ display: 'block', width: '70%', margin: '0 auto' }}>
          <defs>
            <marker id="arrA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" fill="var(--color-border-strong)" />
            </marker>
          </defs>
          <g transform="translate(20 80)"><rect width="110" height="60" rx="10" fill="var(--color-surface-alt)" stroke="var(--color-border-strong)" /><text x="55" y="28" fontSize="12" fontWeight="600" textAnchor="middle" fill="var(--color-text)" style={{ fontFamily: 'var(--font-sans)' }}>사용자</text><text x="55" y="44" fontSize="10" textAnchor="middle" fill="var(--color-text-muted)" style={{ fontFamily: 'var(--font-sans)' }}>Slack 사용</text></g>
          <g transform="translate(190 30)"><rect width="140" height="60" rx="10" fill="var(--color-accent-soft)" stroke="var(--color-accent)" /><text x="70" y="22" fontSize="11" fontWeight="700" textAnchor="middle" fill="var(--color-accent-deep)" style={{ fontFamily: 'var(--font-sans)' }}>화면 (React)</text><text x="70" y="38" fontSize="9" textAnchor="middle" fill="var(--color-accent)" style={{ fontFamily: 'var(--font-sans)' }}>웹 페이지</text><text x="70" y="51" fontSize="9" textAnchor="middle" fill="var(--color-accent)" style={{ fontFamily: 'var(--font-mono)' }}>관리자용</text></g>
          <g transform="translate(190 130)"><rect width="140" height="60" rx="10" fill="var(--color-accent-soft)" stroke="var(--color-accent)" /><text x="70" y="22" fontSize="11" fontWeight="700" textAnchor="middle" fill="var(--color-accent-deep)" style={{ fontFamily: 'var(--font-sans)' }}>서버 (FastAPI)</text><text x="70" y="38" fontSize="9" textAnchor="middle" fill="var(--color-accent)" style={{ fontFamily: 'var(--font-sans)' }}>중간 다리</text><text x="70" y="51" fontSize="9" textAnchor="middle" fill="var(--color-accent)" style={{ fontFamily: 'var(--font-mono)' }}>Python</text></g>
          <g transform="translate(400 130)"><rect width="140" height="60" rx="10" fill="var(--color-green-soft)" stroke="var(--color-green)" /><text x="70" y="22" fontSize="11" fontWeight="700" textAnchor="middle" fill="#2f5a44" style={{ fontFamily: 'var(--font-sans)' }}>데이터 (Supabase)</text><text x="70" y="38" fontSize="9" textAnchor="middle" fill="var(--color-green)" style={{ fontFamily: 'var(--font-sans)' }}>저장소</text><text x="70" y="51" fontSize="9" textAnchor="middle" fill="var(--color-green)" style={{ fontFamily: 'var(--font-mono)' }}>책 · 사용자 · 피드백</text></g>
          <g transform="translate(400 30)"><rect width="140" height="60" rx="10" fill="var(--color-amber-soft)" stroke="var(--color-amber)" /><text x="70" y="22" fontSize="11" fontWeight="700" textAnchor="middle" fill="#7c5c20" style={{ fontFamily: 'var(--font-sans)' }}>AI (Claude)</text><text x="70" y="38" fontSize="9" textAnchor="middle" fill="var(--color-amber)" style={{ fontFamily: 'var(--font-sans)' }}>추천 만드는 두뇌</text><text x="70" y="51" fontSize="9" textAnchor="middle" fill="var(--color-amber)" style={{ fontFamily: 'var(--font-mono)' }}>Anthropic API</text></g>
          <g transform="translate(600 80)"><rect width="100" height="60" rx="10" fill="var(--color-surface-alt)" stroke="var(--color-border-strong)" /><text x="50" y="28" fontSize="12" fontWeight="600" textAnchor="middle" fill="var(--color-text)" style={{ fontFamily: 'var(--font-sans)' }}>Slack</text><text x="50" y="44" fontSize="9" textAnchor="middle" fill="var(--color-text-muted)" style={{ fontFamily: 'var(--font-sans)' }}>DM 발송</text></g>
          <path d="M130 110 L190 60" stroke="var(--color-border-strong)" strokeWidth="1.5" fill="none" markerEnd="url(#arrA)" />
          <path d="M130 110 L190 160" stroke="var(--color-border-strong)" strokeWidth="1.5" fill="none" markerEnd="url(#arrA)" />
          <path d="M330 60 L400 60" stroke="var(--color-border-strong)" strokeWidth="1.5" fill="none" markerEnd="url(#arrA)" />
          <path d="M330 160 L400 160" stroke="var(--color-border-strong)" strokeWidth="1.5" fill="none" markerEnd="url(#arrA)" />
          <path d="M260 90 L260 130" stroke="var(--color-border-strong)" strokeWidth="1.5" fill="none" markerEnd="url(#arrA)" />
          <path d="M540 160 L600 110" stroke="var(--color-border-strong)" strokeWidth="1.5" fill="none" markerEnd="url(#arrA)" />
        </svg>
        <div className="flex gap-3.5 mt-4 pt-4 border-t border-border text-[11.5px] text-text-muted">
          <span className="flex items-center gap-[5px]">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-accent-soft" style={{ border: '1px solid var(--color-accent)' }} />사용자가 보는 것
          </span>
          <span className="flex items-center gap-[5px]">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-green-soft" style={{ border: '1px solid var(--color-green)' }} />저장되는 것
          </span>
          <span className="flex items-center gap-[5px]">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-amber-soft" style={{ border: '1px solid var(--color-amber)' }} />AI가 처리하는 것
          </span>
        </div>
      </div>

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
