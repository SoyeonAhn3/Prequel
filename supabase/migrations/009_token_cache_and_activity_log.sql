-- ============================================================
-- 009: 정확한 토큰 집계(캐시 포함) + 관리자 활동 로그
-- Phase 8 S2/S3(lean). 비용(cost_usd)은 계산하지 않음 — 토큰량만.
-- ============================================================

-- 1. token_usage 에 캐시 토큰 컬럼 추가 (input/output 와 합쳐 정확 집계)
ALTER TABLE public.token_usage
    ADD COLUMN IF NOT EXISTS cache_read     INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS cache_creation INTEGER NOT NULL DEFAULT 0;

-- 2. activity_logs: 관리자 활동(시스템 로그 경량판)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID REFERENCES public.users(id) ON DELETE SET NULL,
    actor_email VARCHAR(255),
    action      VARCHAR(50) NOT NULL,
    target_type VARCHAR(30),
    target_id   VARCHAR(64),
    detail      JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_logs (created_at DESC);

-- RLS: admin 만 접근 (백엔드는 service key 라 우회하지만 직접 접근 방어)
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS activity_admin_all ON public.activity_logs;
CREATE POLICY activity_admin_all ON public.activity_logs
    FOR ALL USING (public.is_admin());
