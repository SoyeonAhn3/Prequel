import { useState } from 'react'

interface Props {
  isQuotaExceeded: boolean
  onClose: () => void
  onCreate: (input: { name: string; description?: string; language: string }) => Promise<void>
}

export default function NewProjectModal({ isQuotaExceeded, onClose, onCreate }: Props) {
  const [step, setStep] = useState<'language' | 'details'>(isQuotaExceeded ? 'language' : 'language')
  const [language, setLanguage] = useState<'ko' | 'en'>('ko')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!name.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await onCreate({ name: name.trim(), description: description.trim() || undefined, language })
    } catch (e) {
      setError(e instanceof Error ? e.message : '프로젝트 생성에 실패했습니다.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-lg font-bold text-text">새 프로젝트</h3>
          <p className="text-xs text-text-muted mt-1">
            {step === 'language'
              ? '프로젝트에서 사용할 언어를 선택하세요. 생성 후 변경할 수 없습니다.'
              : '프로젝트 이름과 설명을 입력하세요.'}
          </p>
        </div>

        {isQuotaExceeded ? (
          <div className="px-6 pb-6">
            <div className="bg-red-soft rounded-xl p-4">
              <p className="text-sm font-semibold text-red">무료 횟수를 모두 사용했습니다</p>
              <p className="text-xs text-text-muted mt-1">
                무료 플랜은 2회까지 킥오프를 생성할 수 있습니다. 유료 플랜으로 업그레이드하면 월 10~30회 사용 가능합니다.
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        ) : step === 'language' ? (
          <div className="px-6 pb-6">
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setLanguage('ko')}
                className={`flex-1 p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${
                  language === 'ko'
                    ? 'border-accent bg-accent-soft'
                    : 'border-border hover:border-border-strong'
                }`}
              >
                <div className="text-lg mb-1">🇰🇷</div>
                <div className="text-sm font-semibold text-text">한국어</div>
                <div className="text-xs text-text-muted mt-0.5">인터뷰와 문서가 한국어로 생성됩니다</div>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`flex-1 p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${
                  language === 'en'
                    ? 'border-accent bg-accent-soft'
                    : 'border-border hover:border-border-strong'
                }`}
              >
                <div className="text-lg mb-1">🇺🇸</div>
                <div className="text-sm font-semibold text-text">English</div>
                <div className="text-xs text-text-muted mt-0.5">Interview and docs in English</div>
              </button>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={() => setStep('details')}
                className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-deep transition-colors cursor-pointer"
              >
                다음
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 pb-6">
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">프로젝트 이름 *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 사내 도서 추천 봇"
                  maxLength={200}
                  autoFocus
                  className="w-full px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text placeholder:text-text-subtle outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">간단한 설명 (선택)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="프로젝트의 목적이나 주요 기능을 한 줄로 설명해주세요"
                  maxLength={2000}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text placeholder:text-text-subtle outline-none focus:border-accent transition-colors resize-none"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-text-subtle">
                <span className="px-1.5 py-0.5 bg-surface-alt rounded font-mono uppercase">{language}</span>
                <span>언어로 인터뷰가 진행됩니다</span>
              </div>
            </div>

            {error && (
              <div className="mt-3 p-2.5 bg-red-soft rounded-lg text-xs text-red">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setStep('language')}
                className="px-4 py-2 text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
              >
                이전
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || submitting}
                className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? '생성 중...' : '프로젝트 생성'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
