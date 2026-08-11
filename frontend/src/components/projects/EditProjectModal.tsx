import { useState } from 'react'

interface Props {
  initialName: string
  initialDescription: string
  onClose: () => void
  onSave: (data: { name: string; description: string }) => Promise<void>
}

// BL-008: 프로젝트 이름·설명 수정 모달. 백엔드 PATCH /projects/{id}로 반영.
export default function EditProjectModal({ initialName, initialDescription, onClose, onSave }: Props) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim() || saving) return
    setSaving(true)
    try {
      await onSave({ name: name.trim(), description: description.trim() })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-base font-bold text-text">프로젝트 수정</h3>
        <p className="text-xs text-text-subtle mt-1">이름과 설명을 수정할 수 있어요.</p>

        <label htmlFor="edit-project-name" className="block text-xs font-semibold text-text-muted mt-5 mb-1.5">
          프로젝트 이름 <span className="text-red">*</span>
        </label>
        <input
          id="edit-project-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text outline-none focus:border-accent"
        />

        <label htmlFor="edit-project-description" className="block text-xs font-semibold text-text-muted mt-4 mb-1.5">
          간단한 설명 (선택)
        </label>
        <textarea
          id="edit-project-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text outline-none focus:border-accent resize-none"
        />

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
