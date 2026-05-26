-- ============================================================
-- 006: design_sessions table for Phase 5
-- ============================================================

-- Allow 'designing' and 'evaluating' status for projects
ALTER TABLE public.projects
    DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE public.projects
    ADD CONSTRAINT projects_status_check
    CHECK (status IN ('in_progress', 'designing', 'evaluating', 'completed'));

-- Rename free_used to credits_used (usage-based billing)
ALTER TABLE public.users
    RENAME COLUMN free_used TO credits_used;
ALTER TABLE public.users
    DROP CONSTRAINT IF EXISTS users_free_used_check;
ALTER TABLE public.users
    ADD CONSTRAINT users_credits_used_check
    CHECK (credits_used >= 0);

-- Add design_sessions table
CREATE TABLE public.design_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    current_step    VARCHAR(20) NOT NULL DEFAULT 'requirements'
                    CHECK (current_step IN ('requirements', 'architecture', 'data-model', 'ai-workflow')),
    requirements    JSONB,
    architecture    JSONB,
    data_model      JSONB,
    ai_workflow     TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'in_progress'
                    CHECK (status IN ('in_progress', 'completed')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_design_sessions_project ON public.design_sessions (project_id);
CREATE INDEX idx_design_sessions_status ON public.design_sessions (project_id, status);

-- RLS policies for design_sessions
ALTER TABLE public.design_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY design_sessions_select ON public.design_sessions
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY design_sessions_insert ON public.design_sessions
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY design_sessions_update ON public.design_sessions
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

-- Service role bypass for API
CREATE POLICY design_sessions_service ON public.design_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- Add description column to projects (if not already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'description'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN description TEXT DEFAULT '';
    END IF;
END $$;
