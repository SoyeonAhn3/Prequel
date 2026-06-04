/** Shared loading / retry views for Phase 6 finalize step components. */

export function StepLoading() {
  return (
    <div className="text-center py-12">
      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3 animate-pulse">
        <span className="text-white text-sm font-bold">P</span>
      </div>
      <p className="text-sm text-text-muted">AI가 분석중이에요 조금만 기다려주세요</p>
    </div>
  )
}

export function StepRetry({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="w-8 h-8 rounded-lg bg-red-soft flex items-center justify-center mx-auto mb-2">
        <span className="text-red text-xs font-bold">!</span>
      </div>
      <p className="text-xs text-text-muted mb-3">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 bg-accent-soft text-accent text-xs font-semibold rounded-lg cursor-pointer border-none hover:opacity-90 transition-opacity"
      >
        다시 시도
      </button>
    </div>
  )
}
