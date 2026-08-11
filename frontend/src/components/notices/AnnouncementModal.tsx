import { useState } from 'react'
import { Plus, PencilLine } from 'lucide-react'
import type { Announcement, AnnouncementInput, AnnouncementType } from '../../lib/announcements'

const TITLE_MAX = 80
const CONTENT_MAX = 2000

interface Props {
  editing: Announcement | null
  onClose: () => void
  onSubmit: (input: AnnouncementInput) => Promise<void>
}

export default function AnnouncementModal({ editing, onClose, onSubmit }: Props) {
  const [type, setType] = useState<AnnouncementType>(editing?.type ?? 'notice')
  const [title, setTitle] = useState(editing?.title ?? '')
  const [content, setContent] = useState(editing?.content ?? '')
  const [version, setVersion] = useState(editing?.version ?? '')
  const [pinned, setPinned] = useState(editing?.pinned ?? false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPatch = type === 'patch'
  const canSubmit = title.trim().length > 0 && content.trim().length > 0

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        type,
        title: title.trim(),
        content: content.trim(),
        version: isPatch ? version.trim() || null : null,
        pinned,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-6 pt-6 pb-4">
          <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center shrink-0">
            {editing ? <PencilLine size={16} /> : <Plus size={16} strokeWidth={2.5} />}
          </div>
          <h3 className="text-lg font-bold text-text">{editing ? '공지 수정' : '새 공지 작성'}</h3>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* 유형 */}
          <div>
            {/* 입력칸이 아니라 버튼 묶음이라 label/htmlFor로는 연결할 수 없다.
                그룹에 이름을 붙이고 각 버튼이 선택 상태를 알리도록 한다. */}
            <span id="announcement-type-label" className="block text-xs font-medium text-text-muted mb-1.5">유형</span>
            <div className="flex gap-3" role="group" aria-labelledby="announcement-type-label">
              {([
                { value: 'notice' as const, label: '공지' },
                { value: 'patch' as const, label: '패치내역' },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  aria-pressed={type === opt.value}
                  className={`flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-lg border-2 text-left cursor-pointer transition-all ${
                    type === opt.value
                      ? 'border-accent bg-accent-soft'
                      : 'border-border hover:border-border-strong'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      type === opt.value ? 'border-accent' : 'border-border-strong'
                    }`}
                  >
                    {type === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                  </span>
                  <span className="text-sm font-medium text-text">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="announcement-title" className="text-xs font-medium text-text-muted">제목 *</label>
              <span className="text-[11px] text-text-subtle font-mono">{title.length} / {TITLE_MAX}</span>
            </div>
            <input
              id="announcement-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 서비스 점검 안내"
              maxLength={TITLE_MAX}
              autoFocus
              className="w-full px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text placeholder:text-text-subtle outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* 본문 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="announcement-content" className="text-xs font-medium text-text-muted">본문 *</label>
              <span className="text-[11px] text-text-subtle font-mono">{content.length} / {CONTENT_MAX}</span>
            </div>
            <textarea
              id="announcement-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공지 내용을 입력하세요..."
              maxLength={CONTENT_MAX}
              rows={5}
              className="w-full px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text placeholder:text-text-subtle outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          {/* 버전 + 상단 고정 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <label htmlFor="announcement-version" className="text-xs font-medium text-text-muted">버전</label>
                <span className="text-[10px] px-1.5 py-0.5 bg-surface-alt text-text-subtle rounded">선택</span>
              </div>
              <input
                id="announcement-version"
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder={isPatch ? 'v1.2.0' : '패치내역만 해당 · v1.2.0'}
                maxLength={20}
                disabled={!isPatch}
                className="w-full px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text placeholder:text-text-subtle outline-none focus:border-accent transition-colors disabled:bg-surface-alt disabled:text-text-subtle disabled:cursor-not-allowed"
              />
            </div>
            <div>
              {/* 토글도 버튼이라 htmlFor 대상이 아니다 — 이름과 on/off 상태를 직접 알린다. */}
              <span id="announcement-pinned-label" className="block text-xs font-medium text-text-muted mb-1.5">상단 고정</span>
              <button
                onClick={() => setPinned(!pinned)}
                aria-pressed={pinned}
                aria-labelledby="announcement-pinned-label"
                className={`flex items-center gap-2 px-3 h-[38px] rounded-lg border transition-colors cursor-pointer ${
                  pinned ? 'border-accent bg-accent-soft' : 'border-border bg-bg'
                }`}
              >
                <span
                  className={`relative w-8 h-[18px] rounded-full transition-colors ${
                    pinned ? 'bg-accent' : 'bg-border-strong'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all ${
                      pinned ? 'left-[15px]' : 'left-0.5'
                    }`}
                  />
                </span>
                <span className={`text-xs font-semibold ${pinned ? 'text-accent-deep' : 'text-text-muted'}`}>
                  {pinned ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-red-soft rounded-lg text-xs text-red">{error}</div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? '저장 중...' : editing ? '수정 완료' : '게시하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
