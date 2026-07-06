interface ErrorBannerProps {
  message: string
  /** 있으면 "재시도" 버튼 표시 */
  onRetry?: () => void
  /** 있으면 "닫기" 버튼 표시 */
  onClose?: () => void
}

/** 화면 상단에 뜨는 빨간 에러 배너. 재시도 가능한 에러면 재시도 버튼을 함께 보여준다. */
export default function ErrorBanner({ message, onRetry, onClose }: ErrorBannerProps) {
  return (
    <div className="px-4 py-2 bg-red/10 text-red text-xs text-center border-b border-red/20">
      {message}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="ml-2 underline cursor-pointer bg-transparent border-none text-red text-xs font-semibold"
        >
          재시도
        </button>
      )}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 underline cursor-pointer bg-transparent border-none text-red text-xs"
        >
          닫기
        </button>
      )}
    </div>
  )
}
