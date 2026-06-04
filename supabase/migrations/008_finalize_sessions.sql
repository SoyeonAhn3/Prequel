-- ============================================================
-- 008: finalize_sessions table for Phase 6 (Evaluation & Finalization)
-- evaluate -> done -> gap -> checklist
-- ============================================================

CREATE TABLE public.finalize_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    current_step    VARCHAR(20) NOT NULL DEFAULT 'evaluate'
                    CHECK (current_step IN ('evaluate', 'done', 'gap', 'checklist')),
    evaluation      JSONB,
    done_criteria   JSONB,
    gaps            JSONB,
    checklist       JSONB,
    status          VARCHAR(20) NOT NULL DEFAULT 'in_progress'
                    CHECK (status IN ('in_progress', 'completed')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_finalize_sessions_project ON public.finalize_sessions (project_id);
CREATE INDEX idx_finalize_sessions_status ON public.finalize_sessions (project_id, status);

-- RLS policies for finalize_sessions (mirrors design_sessions / migration 006)
ALTER TABLE public.finalize_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY finalize_sessions_select ON public.finalize_sessions
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY finalize_sessions_insert ON public.finalize_sessions
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY finalize_sessions_update ON public.finalize_sessions
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM public.projects WHERE user_id = auth.uid()
        )
    );

-- Service role bypass for API
CREATE POLICY finalize_sessions_service ON public.finalize_sessions
    FOR ALL USING (auth.role() = 'service_role');
