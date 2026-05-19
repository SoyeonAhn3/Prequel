-- ============================================================
-- Prequel MVP-1 Initial Schema
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. users
-- ============================================================
CREATE TABLE public.users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    display_name  VARCHAR(100),
    avatar_url    TEXT,
    role          VARCHAR(10) NOT NULL DEFAULT 'user'
                  CHECK (role IN ('user', 'admin')),
    free_used     INTEGER NOT NULL DEFAULT 0
                  CHECK (free_used >= 0 AND free_used <= 2),
    plan          VARCHAR(10) NOT NULL DEFAULT 'free'
                  CHECK (plan IN ('free', 'basic', 'pro')),
    plan_expires_at TIMESTAMPTZ,
    agreed_terms_at TIMESTAMPTZ,
    suspended_at    TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email ON public.users (email);
CREATE INDEX idx_users_active ON public.users (id) WHERE deleted_at IS NULL;

-- ============================================================
-- 2. projects
-- ============================================================
CREATE TABLE public.projects (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name          VARCHAR(200) NOT NULL,
    project_type  VARCHAR(50) NOT NULL,
    language      VARCHAR(2) NOT NULL CHECK (language IN ('ko', 'en')),
    status        VARCHAR(20) NOT NULL DEFAULT 'in_progress'
                  CHECK (status IN ('in_progress', 'completed')),
    kickoff_doc   TEXT,
    mermaid_code  TEXT,
    deleted_at    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_user ON public.projects (user_id);
CREATE INDEX idx_projects_user_active ON public.projects (user_id) WHERE deleted_at IS NULL;

-- ============================================================
-- 3. interview_sessions
-- ============================================================
CREATE TABLE public.interview_sessions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id       UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    step             VARCHAR(20) NOT NULL CHECK (step IN ('planning', 'design')),
    status           VARCHAR(20) NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active', 'paused', 'completed')),
    current_question INTEGER NOT NULL DEFAULT 0,
    messages         JSONB NOT NULL DEFAULT '[]'::jsonb,
    token_used       INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paused_at        TIMESTAMPTZ,
    completed_at     TIMESTAMPTZ
);

CREATE INDEX idx_sessions_project ON public.interview_sessions (project_id);
CREATE INDEX idx_sessions_status ON public.interview_sessions (project_id, status);

-- ============================================================
-- 4. payments (MVP-2, 테이블만 미리 생성)
-- ============================================================
CREATE TABLE public.payments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount           INTEGER NOT NULL,
    method           VARCHAR(50),
    toss_payment_key VARCHAR(200),
    status           VARCHAR(20) NOT NULL
                     CHECK (status IN ('success', 'failed', 'refunded')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON public.payments (user_id);
CREATE INDEX idx_payments_toss_key ON public.payments (toss_payment_key);

-- ============================================================
-- 5. token_usage
-- ============================================================
CREATE TABLE public.token_usage (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    project_id    UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    session_id    UUID REFERENCES public.interview_sessions(id) ON DELETE SET NULL,
    input_tokens  INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    cost_usd      DECIMAL(10,4) NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_token_user ON public.token_usage (user_id);
CREATE INDEX idx_token_project ON public.token_usage (project_id);
CREATE INDEX idx_token_created ON public.token_usage (created_at);

-- ============================================================
-- 6. announcements
-- ============================================================
CREATE TABLE public.announcements (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type       VARCHAR(10) NOT NULL CHECK (type IN ('notice', 'patch')),
    title      VARCHAR(300) NOT NULL,
    content    TEXT NOT NULL,
    version    VARCHAR(20),
    pinned     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announce_type_date ON public.announcements (type, created_at DESC);
CREATE INDEX idx_announce_pinned ON public.announcements (pinned) WHERE pinned = TRUE;

-- ============================================================
-- 7. updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 8. RLS 정책
-- ============================================================

-- Helper: admin 여부 확인 함수
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- users: 본인 데이터만 조회/수정, admin은 전체 접근
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY users_insert_own ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY users_admin_all ON public.users
    FOR ALL USING (public.is_admin());

-- projects: 본인 프로젝트만 CRUD, admin은 전체 접근
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY projects_select_own ON public.projects
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY projects_insert_own ON public.projects
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY projects_update_own ON public.projects
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY projects_delete_own ON public.projects
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY projects_admin_all ON public.projects
    FOR ALL USING (public.is_admin());

-- interview_sessions: 본인 프로젝트의 세션만 접근, admin은 전체 접근
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY sessions_select_own ON public.interview_sessions
    FOR SELECT USING (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

CREATE POLICY sessions_insert_own ON public.interview_sessions
    FOR INSERT WITH CHECK (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

CREATE POLICY sessions_update_own ON public.interview_sessions
    FOR UPDATE USING (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

CREATE POLICY sessions_admin_all ON public.interview_sessions
    FOR ALL USING (public.is_admin());

-- payments: 본인 결제 내역만 조회, admin은 전체 접근
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY payments_select_own ON public.payments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY payments_admin_all ON public.payments
    FOR ALL USING (public.is_admin());

-- token_usage: 본인 사용량만 조회, admin은 전체 접근
ALTER TABLE public.token_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY token_select_own ON public.token_usage
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY token_admin_all ON public.token_usage
    FOR ALL USING (public.is_admin());

-- announcements: 모든 인증 사용자 조회 가능, admin은 전체 관리
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY announce_select_all ON public.announcements
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY announce_admin_all ON public.announcements
    FOR ALL USING (public.is_admin());
