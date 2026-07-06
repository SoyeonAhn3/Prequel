import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * 렌더링 중 발생한 예외를 잡아 앱 전체가 흰 화면이 되는 것을 막는 안전그물.
 *
 * - 잡는 것: 자식 컴포넌트의 렌더/생성자/생명주기 에러
 * - 못 잡는 것: 이벤트 핸들러·비동기(fetch) 에러 → 이건 apiFetch/useRetryable이 처리
 *
 * Error Boundary는 아직 훅 버전이 없어 클래스 컴포넌트로만 만들 수 있다.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  // 렌더 중 에러가 나면 fallback 화면으로 전환한다.
  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  // 에러를 콘솔에 기록한다(추후 원격 로깅으로 확장 가능).
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center gap-3 bg-bg text-text-muted px-6 text-center">
          <div className="text-[15px] font-bold text-text">문제가 발생했어요</div>
          <div className="text-[13px] max-w-sm leading-relaxed">
            예상치 못한 오류로 화면을 표시할 수 없어요. 새로고침하거나 목록으로 돌아가 주세요.
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-accent rounded-lg cursor-pointer border-none"
            >
              새로고침
            </button>
            <a
              href="/projects"
              className="px-4 py-2 text-[13px] font-semibold text-accent border border-accent/30 rounded-lg no-underline"
            >
              내 프로젝트로
            </a>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
