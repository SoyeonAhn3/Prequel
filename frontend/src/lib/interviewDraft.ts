// 인터뷰 중 네트워크 끊김 대비: 전송 실패한 답변을 localStorage에 임시 저장했다가
// 재연결 시 자동 재전송하기 위한 저장소. (Phase 9 #5-D)

interface Draft {
  sessionId: string
  answer: string
  savedAt: number
}

const key = (projectId?: string) => `prequel:interview-draft:${projectId ?? ''}`

/** 미전송 답변을 localStorage에 임시 저장한다. */
export function saveDraft(projectId: string | undefined, sessionId: string, answer: string) {
  try {
    localStorage.setItem(key(projectId), JSON.stringify({ sessionId, answer, savedAt: Date.now() }))
  } catch {
    /* localStorage 사용 불가(사생활 모드·용량 초과 등) — 조용히 무시 */
  }
}

/** 임시 저장된 미전송 답변을 읽는다(없으면 null). */
export function loadDraft(projectId: string | undefined): Draft | null {
  try {
    const raw = localStorage.getItem(key(projectId))
    return raw ? (JSON.parse(raw) as Draft) : null
  } catch {
    return null
  }
}

/** 임시 저장을 삭제한다(전송 성공 시). */
export function clearDraft(projectId: string | undefined) {
  try {
    localStorage.removeItem(key(projectId))
  } catch {
    /* 무시 */
  }
}
