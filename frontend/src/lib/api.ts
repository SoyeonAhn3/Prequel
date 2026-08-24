import { supabase } from './supabase'

/**
 * API 호출 실패를 나타내는 에러.
 * status(HTTP 상태)와 retryable(재시도 가능 여부)을 함께 담아,
 * 각 화면이 "재시도" 버튼을 띄울지 판단할 수 있게 한다.
 */
export class ApiError extends Error {
  status: number
  retryable: boolean

  constructor(message: string, status: number, retryable = false) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.retryable = retryable
  }
}

// 세션이 만료/무효(401)면 에러 배너로 막다른 길을 보여주는 대신
// 즉시 로그아웃 후 로그인 화면으로 돌려보낸다.
async function handleUnauthorized(): Promise<void> {
  await supabase.auth.signOut()
  window.location.href = '/login'
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 120000,
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  // 지정 시간(기본 120초) 안에 응답이 없으면 요청을 끊는다 — 무한 대기 방지.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`/api${path}`, { ...options, headers, signal: controller.signal })

    if (!response.ok) {
      if (response.status === 401) {
        await handleUnauthorized()
      }
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new ApiError(
        error.detail || `API error ${response.status}`,
        response.status,
        // 백엔드가 retryable을 주면 그 값을, 없으면 5xx는 재시도 가능으로 간주.
        error.retryable ?? (response.status >= 500),
      )
    }

    return response.json()
  } catch (e) {
    // 타임아웃으로 요청이 중단된 경우.
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new ApiError('요청 시간이 초과됐어요. 잠시 후 다시 시도해주세요.', 0, true)
    }
    // fetch 자체가 실패 = 네트워크 끊김/오프라인. 재시도 가능으로 처리.
    if (e instanceof TypeError) {
      throw new ApiError('네트워크 연결을 확인해주세요.', 0, true)
    }
    throw e
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Fetch an authenticated binary/text endpoint and trigger a browser download.
 * Used for the kickoff document Markdown export (Phase 7a).
 */
export async function apiDownload(path: string, filename: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()

  const headers: Record<string, string> = {}
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  const response = await fetch(`/api${path}`, { headers })
  if (!response.ok) {
    if (response.status === 401) {
      await handleUnauthorized()
    }
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `다운로드 실패 (${response.status})`)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
