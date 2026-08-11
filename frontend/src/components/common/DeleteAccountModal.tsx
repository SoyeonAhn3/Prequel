import { useState } from 'react'
import { apiFetch, ApiError } from '../../lib/api'

/** 오타로 인한 사고를 막기 위해 이 문구를 그대로 입력해야 삭제된다. */
const CONFIRM_PHRASE = '계정을 삭제합니다'

interface Props {
  email: string
  onClose: () => void
  /** 삭제 성공 후 로그아웃·이동 처리. */
  onDeleted: () => Promise<void> | void
}

export default function DeleteAccountModal({ email, onClose, onDeleted }: Props) {
  const [phrase, setPhrase] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canDelete = phrase.trim() === CONFIRM_PHRASE && !deleting

  async function handleConfirm() {
    if (!canDelete) return
    setDeleting(true)
    setError(null)
    try {
      await apiFetch('/users/me', { method: 'DELETE' })
      await onDeleted()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : '계정 삭제에 실패했어요. 잠시 후 다시 시도해주세요.')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={deleting ? undefined : onClose} />
      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-base font-bold text-text">계정 삭제</h3>
        <p className="text-sm text-text-muted mt-2">
          <span className="font-semibold text-text">{email}</span> 계정과 모든 데이터를 완전히 삭제합니다.
        </p>

        <div className="mt-4 rounded-xl bg-surface-alt p-3.5">
          <p className="text-xs font-semibold text-text m-0">함께 삭제되는 것</p>
          <ul className="text-xs text-text-muted mt-1.5 mb-0 pl-4 space-y-0.5">
            <li>모든 프로젝트와 인터뷰·설계·평가 기록</li>
            <li>생성된 킥오프 문서</li>
            <li>계정 정보와 로그인 수단</li>
          </ul>
          <p className="text-xs text-red font-medium mt-2.5 mb-0">
            복구할 수 없습니다. 남은 크레딧도 사라집니다.
          </p>
        </div>

        <label htmlFor="delete-account-confirm" className="block text-xs text-text-muted mt-4">
          계속하려면 <span className="font-mono font-semibold text-text">{CONFIRM_PHRASE}</span> 를 입력하세요.
        </label>
        <input
          id="delete-account-confirm"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          disabled={deleting}
          autoComplete="off"
          className="w-full mt-1.5 px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text outline-none focus:border-accent disabled:opacity-50"
        />

        {error && (
          <p className="text-xs text-red mt-2.5 mb-0" role="alert">{error}</p>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-sm text-text-muted hover:text-text transition-colors cursor-pointer bg-transparent border-none disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canDelete}
            className="px-4 py-2 bg-red text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none"
          >
            {deleting ? '삭제 중...' : '영구 삭제'}
          </button>
        </div>
      </div>
    </div>
  )
}
