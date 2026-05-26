import Explainer from './Explainer'
import DesignIcon from './DesignIcon'
import type { DesignSession, DataEntity, DataModel } from './types'

interface DataModelStepProps {
  session: DesignSession | null
  generating: boolean
  onGenerate: () => void
  onUpdateSession?: (session: DesignSession) => void
}

const REQ_STYLE: Record<string, string> = {
  '필수': 'text-red',
  '자동': 'text-green',
  PK: 'text-accent',
  FK: 'text-accent',
  NOT_NULL: 'text-red',
}

export default function DataModelStep({ session, generating, onGenerate, onUpdateSession }: DataModelStepProps) {
  const dataModel = session?.data_model

  function removeEntity(idx: number) {
    if (!session || !dataModel) return
    const updated = {
      ...session,
      data_model: {
        ...dataModel,
        entities: dataModel.entities.filter((_, i) => i !== idx),
      },
    }
    onUpdateSession?.(updated)
  }

  function removeRelationship(idx: number) {
    if (!session || !dataModel) return
    const updated = {
      ...session,
      data_model: {
        ...dataModel,
        relationships: dataModel.relationships.filter((_, i) => i !== idx),
      },
    }
    onUpdateSession?.(updated)
  }

  if (!dataModel && !generating) {
    return (
      <div className="pb-7">
        <Explainer
          title="데이터 구조 = 데이터 모델 (Data Model)"
          technical="Database Schema"
          plain="앱에 저장되는 정보의 '카테고리'와 '항목'을 정리한 것이에요. 엑셀의 시트와 열 같은 거라고 생각하시면 돼요."
          example="시트 '사용자' → 열: 이름, 이메일, 부서, 가입일 / 시트 '추천 기록' → 열: 누구에게, 어떤 책, 언제, 반응"
        />

        <div className="text-center mt-8">
          <button
            type="button"
            onClick={onGenerate}
            className="px-6 py-3 bg-accent text-white text-sm font-semibold rounded-xl cursor-pointer border-none inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            AI로 데이터 구조 설계하기
          </button>
          <p className="text-xs text-text-muted mt-3">아키텍처를 바탕으로 데이터 구조를 설계합니다</p>
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
        <p className="text-sm text-text-muted">AI가 데이터 구조를 설계하고 있습니다...</p>
        <p className="text-xs text-text-subtle mt-1">약 20초 소요됩니다</p>
      </div>
    )
  }

  const entities = dataModel!.entities
  const relationships = dataModel!.relationships

  return (
    <div className="pb-7">
      <Explainer
        title="데이터 구조 = 데이터 모델 (Data Model)"
        technical="Database Schema"
        plain="앱에 저장되는 정보의 '카테고리'와 '항목'을 정리한 것이에요. 엑셀의 시트와 열 같은 거라고 생각하시면 돼요."
        example="시트 '사용자' → 열: 이름, 이메일, 부서, 가입일 / 시트 '추천 기록' → 열: 누구에게, 어떤 책, 언제, 반응"
      />

      <div className="text-[13px] font-bold text-text mb-1.5">저장할 정보 그룹 (테이블)</div>
      <p className="text-[12.5px] text-text-muted leading-relaxed mb-3.5">
        AI가 답변을 분석해 자동으로 {entities.length}개 그룹을 만들었어요. 빠진 정보가 있으면 추가하세요.
      </p>

      {/* Entity grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {entities.map((entity, i) => (
          <EntityCard key={i} entity={entity} index={i} onDelete={() => removeEntity(i)} />
        ))}
      </div>

      {/* Relationships */}
      {relationships.length > 0 && (
        <>
          <div className="text-[13px] font-bold text-text mb-1.5">그룹 간 연결 관계</div>
          <p className="text-[12.5px] text-text-muted leading-relaxed mb-3.5">
            서로 다른 그룹이 어떻게 연결되는지 보여드릴게요. 자동으로 감지되었습니다.
          </p>
          <div className="flex flex-col gap-2">
            {relationships.map((rel, i) => {
              const parsed = parseRelationship(rel)
              return (
                <div key={i} className="flex items-center gap-3 px-3.5 py-3 bg-surface border border-border rounded-[10px]">
                  <span className="text-[13px] font-semibold text-text">{parsed.from}</span>
                  <span className="text-[11.5px] text-text-muted italic">{parsed.verb}</span>
                  <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                    <path d="M2 6 H18 M14 2 L18 6 L14 10" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                  <span className="text-[13px] font-semibold text-text">{parsed.to}</span>
                  <span className="flex-1" />
                  <span className="text-[11.5px] text-text-muted">{parsed.desc}</span>
                  <span className="text-[10.5px] font-mono text-accent font-bold px-2 py-[3px] bg-accent-soft rounded-[5px] ml-2">
                    {parsed.cardinality}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRelationship(i)}
                    className="text-[11px] text-text-subtle hover:text-red cursor-pointer bg-transparent border-none px-1 shrink-0"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Add new group button */}
      <button
        type="button"
        className="w-full mt-3 p-3.5 bg-surface text-text-muted border border-dashed border-border-strong rounded-[10px] cursor-pointer text-[13px] font-medium flex items-center justify-center gap-2"
        style={{ fontFamily: 'inherit' }}
      >
        <DesignIcon kind="data" size={14} color="var(--color-text-muted)" />
        + 새 정보 그룹 추가
      </button>

      {/* 정합성 규칙 (자동 검증) */}
      <div className="text-[13px] font-bold text-text mt-6 mb-1.5">
        정합성 규칙 <span className="text-[11.5px] font-medium text-text-muted">(자동 검증)</span>
      </div>
      <div className="bg-surface border border-border rounded-[10px] overflow-hidden">
        {[
          { ok: true, t: '이메일은 중복될 수 없어요 (한 이메일 = 한 사용자)' },
          { ok: true, t: '추천 기록은 반드시 사용자와 책 둘 다 있어야 해요' },
          { ok: false, t: '책의 카테고리는 미리 정한 목록에서만 선택 — 목록 정의 필요' },
        ].map((r, i) => (
          <div key={i} className={`flex items-center gap-2.5 px-3.5 py-2.5 ${i > 0 ? 'border-t border-border' : ''}`}>
            <span
              className={`w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 ${
                r.ok ? 'bg-green-soft text-green' : 'bg-amber-soft text-amber'
              }`}
            >
              {r.ok ? (
                <DesignIcon kind="check" size={10} />
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              )}
            </span>
            <span className="text-[12.5px] text-text flex-1">{r.t}</span>
            {!r.ok && (
              <span className="text-[11px] text-accent font-semibold cursor-pointer">해결하기 →</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function parseRelationship(rel: string) {
  const match = rel.match(/^(.+?)\s*→\s*(.+?):\s*(.+)$/)
  if (match) {
    return { from: `👤 ${match[1]}`, verb: '에게', to: `✉️ ${match[2]}`, desc: match[3], cardinality: '1 : N' }
  }
  const parts = rel.split(/\s+/)
  if (parts.length >= 3) {
    return { from: parts[0], verb: '→', to: parts[parts.length - 1], desc: rel, cardinality: '1 : N' }
  }
  return { from: rel, verb: '', to: '', desc: '', cardinality: '' }
}

const ENTITY_ICONS = ['👤', '📚', '✉️', '📋', '🏷️', '📊']

function EntityCard({ entity, index, onDelete }: { entity: DataEntity; index: number; onDelete?: () => void }) {
  const icon = ENTITY_ICONS[index % ENTITY_ICONS.length]

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="px-3.5 py-3 bg-surface-alt border-b border-border flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-[13px] font-bold text-text flex-1">{entity.name}</span>
        <span className="text-[10px] font-mono text-text-subtle px-[7px] py-0.5 bg-surface rounded">
          {entity.fields.length}개
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="text-[11px] text-text-subtle hover:text-red cursor-pointer bg-transparent border-none px-0.5"
        >
          ✕
        </button>
      </div>
      <div className="p-1">
        {entity.fields.map((field, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-2.5 py-2 text-xs rounded-md ${
              i < entity.fields.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <span className="flex-1 text-text font-medium">{field.name}</span>
            <span className="text-[10px] font-mono text-text-muted px-[5px] py-[1px] bg-surface-alt rounded">
              {field.type}
            </span>
            <span className={`text-[10px] font-semibold ${REQ_STYLE[field.constraints] ?? 'text-text-subtle'}`}>
              {field.constraints}
            </span>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="w-[calc(100%-12px)] m-1.5 py-[7px] bg-transparent text-accent text-[11.5px] font-semibold rounded-md cursor-pointer"
        style={{
          fontFamily: 'inherit',
          border: '1px dashed color-mix(in srgb, var(--color-accent) 25%, transparent)',
        }}
      >
        + 항목 추가
      </button>
    </div>
  )
}
