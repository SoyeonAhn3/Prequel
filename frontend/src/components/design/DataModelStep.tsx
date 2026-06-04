import { useEffect, useRef, useState } from 'react'
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
  const autoGenRef = useRef(false)

  const explainer = (
    <Explainer
      title="데이터 구조 = 데이터 모델 (Data Model)"
      technical="Database Schema"
      plain="앱에 저장되는 정보의 '카테고리'와 '항목'을 정리한 것이에요. 엑셀의 시트와 열 같은 거라고 생각하시면 돼요."
      example="시트 '사용자' → 열: 이름, 이메일, 부서, 가입일 / 시트 '추천 기록' → 열: 누구에게, 어떤 책, 언제, 반응"
    />
  )

  // Auto-generate on entry — no manual "설계하기" button (matches requirements/architecture/ai-workflow steps).
  useEffect(() => {
    if (autoGenRef.current || dataModel || generating) return
    autoGenRef.current = true
    onGenerate()
  }, [dataModel, generating, onGenerate])

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

  function addEntity(name: string) {
    if (!session || !dataModel || !name.trim()) return
    const newEntity: DataEntity = {
      name: name.trim(),
      description: '',
      fields: [{ name: 'id', type: 'uuid', constraints: 'PK' }],
    }
    const updated = {
      ...session,
      data_model: {
        ...dataModel,
        entities: [...dataModel.entities, newEntity],
      },
    }
    onUpdateSession?.(updated)
  }

  function addFieldToEntity(entityIdx: number, fieldName: string, fieldType: string, nullable: boolean) {
    if (!session || !dataModel || !fieldName.trim()) return
    const constraints = nullable ? '' : 'NOT_NULL'
    const entities = dataModel.entities.map((e, i) => {
      if (i !== entityIdx) return e
      return { ...e, fields: [...e.fields, { name: fieldName.trim(), type: fieldType || 'text', constraints }] }
    })
    const updated = {
      ...session,
      data_model: { ...dataModel, entities },
    }
    onUpdateSession?.(updated)
  }

  if (!dataModel && !generating) {
    return (
      <div className="pb-7">
        {explainer}

        {autoGenRef.current ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 rounded-lg bg-red-soft flex items-center justify-center mx-auto mb-2">
              <span className="text-red text-xs font-bold">!</span>
            </div>
            <p className="text-xs text-text-muted mb-3">데이터 구조를 생성하지 못했어요.</p>
            <button
              type="button"
              onClick={onGenerate}
              className="px-4 py-2 bg-accent-soft text-accent text-xs font-semibold rounded-lg cursor-pointer border-none hover:opacity-90 transition-opacity"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3 animate-pulse">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <p className="text-sm text-text-muted">AI가 분석중이에요 조금만 기다려주세요</p>
          </div>
        )}
      </div>
    )
  }

  if (generating) {
    return (
      <div className="pb-7">
        {explainer}
        <div className="text-center py-12">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <p className="text-sm text-text-muted">AI가 분석중이에요 조금만 기다려주세요</p>
        </div>
      </div>
    )
  }

  const entities = dataModel!.entities
  const relationships = dataModel!.relationships

  return (
    <div className="pb-7">
      {explainer}

      <div className="text-[13px] font-bold text-text mb-1.5">저장할 정보 그룹 (테이블)</div>
      <p className="text-[12.5px] text-text-muted leading-relaxed mb-3.5">
        AI가 답변을 분석해 자동으로 {entities.length}개 그룹을 만들었어요. 빠진 정보가 있으면 추가하세요.
      </p>

      {/* Entity grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {entities.map((entity, i) => (
          <EntityCard key={i} entity={entity} index={i} onDelete={() => removeEntity(i)} onAddField={(name, type, nullable) => addFieldToEntity(i, name, type, nullable)} />
        ))}
      </div>

      {/* Add new group — placed before relationships for discoverability */}
      <AddEntityForm onAdd={addEntity} />

      {/* Relationships */}
      {relationships.length > 0 && (
        <>
          <div className="text-[13px] font-bold text-text mt-6 mb-1.5">그룹 간 연결 관계</div>
          <p className="text-[12.5px] text-text-muted leading-relaxed mb-3.5">
            서로 다른 그룹이 어떻게 연결되는지 보여드릴게요. 자동으로 감지되었습니다.
          </p>
          <div className="flex flex-col gap-2">
            {relationships.map((rel, i) => {
              const parsed = parseRelationship(rel)
              return (
                <div key={i} className="flex items-center gap-3 px-3.5 py-3 bg-surface border border-border rounded-[10px]">
                  <span className="text-[13px] font-semibold text-text">{parsed.from}</span>
                  <svg width="20" height="12" viewBox="0 0 20 12" fill="none" className="shrink-0">
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

      {/* 정합성 규칙 (자동 검증) */}
      <div className="text-[13px] font-bold text-text mt-6 mb-1.5">
        정합성 규칙 <span className="text-[11.5px] font-medium text-text-muted">(자동 검증)</span>
      </div>
      <div className="bg-surface border border-border rounded-[10px] overflow-hidden">
        {deriveValidationRules(dataModel!).map((r, i) => (
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
              <span className="text-[11px] text-amber font-semibold">확인 필요</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function parseRelationship(rel: string) {
  // Canonical skill format: "테이블A 1--N 테이블B: 설명" (cardinality uses --, e.g. 1--N, N--N, 1--1)
  const card = rel.match(/^(.+?)\s+(\S*--\S*)\s+(.+?)\s*:\s*(.+)$/)
  if (card) {
    return { from: card[1].trim(), to: card[3].trim(), desc: card[4].trim(), cardinality: card[2].replace(/--/, ' : ') }
  }
  // Legacy arrow format: "테이블A → 테이블B: 설명"
  const arrow = rel.match(/^(.+?)\s*→\s*(.+?):\s*(.+)$/)
  if (arrow) {
    return { from: arrow[1].trim(), to: arrow[2].trim(), desc: arrow[3].trim(), cardinality: '1 : N' }
  }
  const parts = rel.split(/\s+/).filter((p) => p !== '→')
  if (parts.length >= 2) {
    return { from: parts[0], to: parts[parts.length - 1], desc: rel.replace(/→/g, '').trim(), cardinality: '1 : N' }
  }
  return { from: rel.replace(/→/g, '').trim(), to: '', desc: '', cardinality: '' }
}

function deriveValidationRules(dm: DataModel): { ok: boolean; t: string }[] {
  const rules: { ok: boolean; t: string }[] = []
  const entities = dm.entities ?? []
  const rels = dm.relationships ?? []

  for (const entity of entities) {
    const uniqueFields = entity.fields.filter((f) =>
      /unique|유니크|이메일|email/i.test(`${f.constraints} ${f.name} ${f.type}`)
    )
    for (const f of uniqueFields) {
      rules.push({ ok: true, t: `${f.name}은(는) 중복될 수 없어요 (${entity.name} 내 유일 값)` })
    }

    const notNullFields = entity.fields.filter((f) =>
      /필수|NOT_NULL|required/i.test(f.constraints)
    )
    if (notNullFields.length > 0) {
      rules.push({
        ok: true,
        t: `${entity.name}의 필수 항목 ${notNullFields.length}개 (${notNullFields.slice(0, 3).map((f) => f.name).join(', ')}${notNullFields.length > 3 ? ' 외' : ''}) — 빈 값 불가`,
      })
    }
  }

  for (const rel of rels) {
    const parsed = rel.match(/^(.+?)\s*→\s*(.+?):\s*(.+)$/)
    if (parsed) {
      rules.push({ ok: true, t: `${parsed[2]} 기록은 반드시 ${parsed[1]} 정보가 있어야 해요` })
    }
  }

  const choiceFields = entities.flatMap((e) =>
    e.fields.filter((f) => /선택지|enum|category|카테고리/i.test(`${f.type} ${f.name}`)).map((f) => ({ entity: e.name, field: f.name }))
  )
  for (const cf of choiceFields) {
    rules.push({ ok: false, t: `${cf.entity}의 ${cf.field}는 미리 정한 목록에서만 선택 — 목록 정의 필요` })
  }

  if (rules.length === 0) {
    rules.push({ ok: true, t: '기본 데이터 구조가 정의되었습니다' })
  }

  return rules
}

const ENTITY_ICONS = ['👤', '📚', '✉️', '📋', '🏷️', '📊']

function AddEntityForm({ onAdd }: { onAdd: (name: string) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full mt-3 p-3.5 bg-surface text-text-muted border border-dashed border-border-strong rounded-[10px] cursor-pointer text-[13px] font-medium flex items-center justify-center gap-2"
        style={{ fontFamily: 'inherit' }}
      >
        <DesignIcon kind="data" size={14} color="var(--color-text-muted)" />
        + 새 정보 그룹 추가
      </button>
    )
  }

  return (
    <div className="mt-3 p-3.5 bg-surface border border-border-strong rounded-[10px] flex items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && name.trim()) { onAdd(name); setName(''); setOpen(false) }
          if (e.key === 'Escape') { setName(''); setOpen(false) }
        }}
        placeholder="그룹 이름 (예: 분석결과)"
        autoFocus
        className="flex-1 text-[13px] text-text bg-transparent border-none outline-none placeholder:text-text-subtle"
        style={{ fontFamily: 'inherit' }}
      />
      <button
        type="button"
        onClick={() => { if (name.trim()) { onAdd(name); setName(''); setOpen(false) } }}
        className="px-3 py-1.5 bg-accent text-white text-[11.5px] font-semibold rounded-lg cursor-pointer border-none"
      >
        추가
      </button>
      <button
        type="button"
        onClick={() => { setName(''); setOpen(false) }}
        className="text-[11px] text-text-subtle hover:text-red cursor-pointer bg-transparent border-none"
      >
        취소
      </button>
    </div>
  )
}

function EntityCard({ entity, index, onDelete, onAddField }: { entity: DataEntity; index: number; onDelete?: () => void; onAddField?: (name: string, type: string, nullable: boolean) => void }) {
  const icon = ENTITY_ICONS[index % ENTITY_ICONS.length]
  const [adding, setAdding] = useState(false)
  const [fieldName, setFieldName] = useState('')
  const [fieldType, setFieldType] = useState('text')
  const [nullable, setNullable] = useState(true)

  function handleAdd() {
    if (!fieldName.trim()) return
    onAddField?.(fieldName, fieldType, nullable)
    setFieldName('')
    setFieldType('text')
    setNullable(true)
    setAdding(false)
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="px-3.5 py-3 bg-surface-alt border-b border-border flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-text truncate">{entity.name}</div>
          {entity.description && (
            <div className="text-[10.5px] text-text-muted leading-snug truncate" title={entity.description}>
              {entity.description}
            </div>
          )}
        </div>
        <span className="text-[10px] font-mono text-text-subtle px-[7px] py-0.5 bg-surface rounded shrink-0">
          {entity.fields.length}개
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="text-[11px] text-text-subtle hover:text-red cursor-pointer bg-transparent border-none px-0.5 shrink-0"
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
      {adding ? (
        <div className="m-1.5 p-2 bg-surface-alt rounded-md flex flex-col gap-1.5">
          <input
            type="text"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') { setFieldName(''); setAdding(false) }
            }}
            placeholder="항목 이름"
            autoFocus
            className="w-full text-[11px] text-text bg-surface border border-border rounded px-2 py-1.5 outline-none"
            style={{ fontFamily: 'inherit' }}
          />
          <div className="flex gap-1.5 items-center">
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value)}
              className="flex-1 text-[10px] text-text-muted bg-surface border border-border rounded px-1.5 py-1 outline-none"
              style={{ fontFamily: 'inherit' }}
            >
              <option value="text">text (문자열)</option>
              <option value="varchar">varchar (짧은 문자)</option>
              <option value="integer">integer (정수)</option>
              <option value="bigint">bigint (큰 정수)</option>
              <option value="float">float (소수)</option>
              <option value="boolean">boolean (참/거짓)</option>
              <option value="date">date (날짜)</option>
              <option value="timestamp">timestamp (날짜+시간)</option>
              <option value="uuid">uuid (고유 ID)</option>
              <option value="jsonb">jsonb (JSON 데이터)</option>
              <option value="array">array (목록)</option>
            </select>
            <button
              type="button"
              onClick={() => setNullable(!nullable)}
              className={`text-[10px] font-bold px-2 py-1 rounded cursor-pointer border shrink-0 ${
                nullable
                  ? 'text-text-subtle bg-surface border-border'
                  : 'text-red bg-red/8 border-red/20'
              }`}
              title={nullable ? '빈 값 허용 (NULL)' : '빈 값 불가 (NOT NULL)'}
            >
              {nullable ? 'NULL' : 'NOT NULL'}
            </button>
            <button type="button" onClick={handleAdd} className="px-2 py-1 bg-accent text-white text-[10px] font-semibold rounded cursor-pointer border-none shrink-0">추가</button>
            <button type="button" onClick={() => { setFieldName(''); setAdding(false) }} className="text-[10px] text-text-subtle cursor-pointer bg-transparent border-none shrink-0">취소</button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-[calc(100%-12px)] m-1.5 py-[7px] bg-transparent text-accent text-[11.5px] font-semibold rounded-md cursor-pointer"
          style={{
            fontFamily: 'inherit',
            border: '1px dashed color-mix(in srgb, var(--color-accent) 25%, transparent)',
          }}
        >
          + 항목 추가
        </button>
      )}
    </div>
  )
}
