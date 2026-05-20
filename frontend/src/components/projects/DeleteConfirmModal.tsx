import { useState } from 'react'

interface Props {
  projectName: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export default function DeleteConfirmModal({ projectName, onClose, onConfirm }: Props) {
  const [deleting, setDeleting] = useState(false)

  async function handleConfirm() {
    setDeleting(true)
    try {
      await onConfirm()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-base font-bold text-text">프로젝트 삭제</h3>
        <p className="text-sm text-text-muted mt-2">
          <span className="font-semibold text-text">{projectName}</span>을(를) 삭제하시겠습니까?
        </p>
        <p className="text-xs text-text-subtle mt-1">삭제된 프로젝트는 복구할 수 있습니다.</p>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="px-4 py-2 bg-red text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  )
}
