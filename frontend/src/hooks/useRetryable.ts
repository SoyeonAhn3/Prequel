import { useCallback, useState } from 'react'
import { ApiError } from '../lib/api'

/**
 * 재시도 가능한 에러 처리를 위한 훅.
 *
 * - error: 사용자에게 보여줄 에러 메시지(없으면 null)
 * - retry: 재시도 가능하면 "다시 실행할 함수", 아니면 null → 이 값으로 재시도 버튼 표시 여부를 판단
 * - run: 단일 비동기 액션을 실행하고, 실패 시 같은 액션을 재시도로 등록
 * - fail: 여러 단계로 이뤄진 동작 등에서 실패를 직접 기록(재시도 함수를 함께 등록 가능)
 * - clear: 에러/재시도 상태 초기화
 */
export function useRetryable() {
  const [error, setError] = useState<string | null>(null)
  const [retry, setRetry] = useState<(() => void) | null>(null)

  const clear = useCallback(() => {
    setError(null)
    setRetry(null)
  }, [])

  const fail = useCallback((e: unknown, retryFn?: () => void) => {
    setError(e instanceof Error ? e.message : '오류가 발생했어요.')
    // 백엔드가 503 + retryable=true로 준 경우에만(=ApiError.retryable) 재시도 버튼을 켠다.
    if (e instanceof ApiError && e.retryable && retryFn) {
      setRetry(() => retryFn)
    } else {
      setRetry(null)
    }
  }, [])

  const run = useCallback(
    async function run<T>(action: () => Promise<T>): Promise<T | undefined> {
      clear()
      try {
        return await action()
      } catch (e) {
        fail(e, () => {
          void run(action)
        })
        return undefined
      }
    },
    [clear, fail],
  )

  return { error, retry, run, fail, clear }
}
